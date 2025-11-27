/**
 * Unified Fetch Utility
 * Single source of truth for all HTTP requests with built-in caching,
 * error handling, retries, and TypeScript support
 */

import logger from './logger';
import cacheManager from './UnifiedCacheManager';

// Type guards for response parsing
function isValidResponseType<T>(
  data: unknown, 
  responseType: 'json' | 'text' | 'blob' | 'arrayBuffer'
): data is T {
  switch (responseType) {
    case 'text':
      return typeof data === 'string';
    case 'blob':
      return data instanceof Blob;
    case 'arrayBuffer':
      return data instanceof ArrayBuffer;
    case 'json':
      // For JSON, we accept any value as it could be object, array, string, number, etc.
      return true;
    default:
      return false;
  }
}

// Types
export interface UnifiedFetchOptions extends Omit<RequestInit, 'cache'> {
  // Caching
  useCache?: boolean;
  cacheTime?: number; // ms
  cacheKey?: string;
  forceRefresh?: boolean;
  
  // Retry logic
  retries?: number;
  retryDelay?: number; // ms
  
  // Timeout
  timeout?: number; // ms
  
  // Response handling
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
  
  // Error handling
  throwOnError?: boolean;
  
  // Request metadata (for logging)
  metadata?: Record<string, unknown>;
}

export interface UnifiedFetchResponse<T = unknown> {
  data: T | null;
  error: Error | null;
  status?: number;
  headers?: Headers;
  fromCache?: boolean;
  duration?: number;
}

// Default options
const DEFAULT_OPTIONS: Partial<UnifiedFetchOptions> = {
  useCache: true,
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retries: 3,
  retryDelay: 1000,
  timeout: 30000,
  responseType: 'json',
  throwOnError: false,
};

// Cache manager is imported from UnifiedCacheManager

// Request deduplication map
const pendingRequests = new Map<string, Promise<UnifiedFetchResponse<any>>>();

/**
 * Main unified fetch function
 * @param url - The URL to fetch
 * @param options - Unified fetch options
 * @returns Promise with data, error, and metadata
 */
export async function unifiedFetch<T = unknown>(
  url: string,
  options: UnifiedFetchOptions = {}
): Promise<UnifiedFetchResponse<T>> {
  const startTime = performance.now();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Generate cache key
  const cacheKey = opts.cacheKey || cacheManager.generateKey('fetch', { 
    url, 
    method: opts.method || 'GET',
    body: opts.body 
  });
  
  // Check for pending requests to the same URL (request deduplication)
  const requestKey = `${url}-${JSON.stringify({ method: opts.method, body: opts.body })}`;
  if (!opts.forceRefresh && pendingRequests.has(requestKey)) {
    logger.debug('Request deduplication: reusing pending request', { url, requestKey });
    return pendingRequests.get(requestKey)! as Promise<UnifiedFetchResponse<T>>;
  }
  
  // Check cache first (for GET requests only)
  if (opts.useCache && (!opts.method || opts.method === 'GET') && !opts.forceRefresh) {
    try {
      const cachedData = await cacheManager.get(cacheKey);
      if (cachedData) {
        logger.debug('Cache hit for URL:', { url, cacheKey });
        return {
          data: cachedData as T,
          error: null,
          fromCache: true,
          duration: performance.now() - startTime
        };
      }
    } catch (cacheError) {
      logger.warn('Cache read error:', { url, error: cacheError });
    }
  }
  
  // Create the request promise and store it for deduplication
  const requestPromise = (async (): Promise<UnifiedFetchResponse<T>> => {
    // Perform fetch with retries
    let lastError: Error | null = null;
    let attempt = 0;
    
    while (attempt <= (opts.retries || 0)) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout!);
      
      // Make the request
      const response = await fetch(url, {
        ...opts,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check response status - respect throwOnError option
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as Error & { status?: number }).status = response.status;

        // If throwOnError is false, return null data instead of throwing
        if (opts.throwOnError === false) {
          logger.warn('HTTP error, returning null:', { url, status: response.status });
          return {
            data: null,
            error,
            status: response.status,
            headers: response.headers,
            fromCache: false,
            duration: performance.now() - startTime
          };
        }
        throw error;
      }
      
      // Parse response based on type
      let rawData: unknown;
      let data: T;
      
      try {
        switch (opts.responseType) {
          case 'text':
            rawData = await response.text();
            break;
          case 'blob':
            rawData = await response.blob();
            break;
          case 'arrayBuffer':
            rawData = await response.arrayBuffer();
            break;
          case 'json':
          default:
            rawData = await response.json();
            break;
        }
        
        // Validate the parsed data matches the expected type
        if (isValidResponseType<T>(rawData, opts.responseType || 'json')) {
          data = rawData;
        } else {
          throw new Error(`Response type mismatch: expected ${opts.responseType || 'json'}, got ${typeof rawData}`);
        }
      } catch (parseError) {
        throw new Error(`Failed to parse response as ${opts.responseType || 'json'}: ${parseError}`);
      }
      
      // Cache successful GET responses
      if (opts.useCache && (!opts.method || opts.method === 'GET')) {
        try {
          await cacheManager.set(cacheKey, data, { ttl: opts.cacheTime });
          logger.debug('Cached response for URL:', { url, cacheKey });
        } catch (cacheError) {
          logger.warn('Cache write error:', { url, error: cacheError });
        }
      }
      
      // Log successful request
      const duration = performance.now() - startTime;
      logger.debug('Fetch successful:', { 
        url, 
        method: opts.method || 'GET',
        status: response.status,
        duration,
        ...opts.metadata 
      });
      
      return {
        data,
        error: null,
        status: response.status,
        headers: response.headers,
        fromCache: false,
        duration
      };
      
    } catch (error) {
      lastError = error as Error;
      attempt++;
      
      // Don't retry on abort
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(`Request timeout after ${opts.timeout}ms`);
        break;
      }
      
      // Log retry attempt
      if (attempt <= (opts.retries || 0)) {
        logger.warn('Fetch failed, retrying:', { 
          url, 
          attempt, 
          error: lastError.message 
        });
        await new Promise(resolve => setTimeout(resolve, opts.retryDelay));
      }
    }
    }
    
    // All retries failed
    const duration = performance.now() - startTime;
    logger.error('Fetch failed after all retries:', { 
      url, 
      attempts: attempt,
      error: lastError?.message,
      duration,
      ...opts.metadata 
    });
    
    if (opts.throwOnError) {
      throw lastError;
    }
    
    return {
      data: null,
      error: lastError,
      fromCache: false,
      duration
    };
  })();
  
  // Store the promise for deduplication
  pendingRequests.set(requestKey, requestPromise);
  
  // Clean up after completion
  requestPromise.finally(() => {
    pendingRequests.delete(requestKey);
  });
  
  return requestPromise;
}

/**
 * Convenience function for JSON GET requests
 */
export async function fetchJSON<T = unknown>(
  url: string, 
  options?: Omit<UnifiedFetchOptions, 'responseType'>
): Promise<T | null> {
  const result = await unifiedFetch<T>(url, { 
    ...options, 
    responseType: 'json' 
  });
  
  // Debug logging for cached responses
  if (result.fromCache) {
    logger.debug('fetchJSON returning cached data', {
      url,
      hasData: !!result.data,
      dataType: typeof result.data,
      fromCache: result.fromCache
    });
  }

  // Only throw if explicitly requested via throwOnError: true
  // This prevents unhandled rejections when callers don't have try/catch
  if (result.error && options?.throwOnError === true) {
    logger.error('fetchJSON throwing error', {
      url,
      error: result.error.message,
      fromCache: result.fromCache
    });
    throw result.error;
  }

  // Log errors even when not throwing
  if (result.error && !result.fromCache) {
    logger.warn('fetchJSON returning null due to error', {
      url,
      error: result.error.message
    });
  }

  return result.data;
}

/**
 * Convenience function for text GET requests
 */
export async function fetchText(
  url: string, 
  options?: Omit<UnifiedFetchOptions, 'responseType'>
): Promise<string | null> {
  const result = await unifiedFetch<string>(url, { 
    ...options, 
    responseType: 'text' 
  });
  return result.data;
}

/**
 * Convenience function for POST requests
 */
export async function postJSON<T = unknown>(
  url: string,
  data: unknown,
  options?: Omit<UnifiedFetchOptions, 'method' | 'body'>
): Promise<T | null> {
  const result = await unifiedFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    body: JSON.stringify(data),
    useCache: false // Don't cache POST requests
  });
  return result.data;
}

/**
 * Batch fetch utility for multiple URLs
 */
export async function batchFetch<T = unknown>(
  urls: string[],
  options?: UnifiedFetchOptions,
  concurrency: number = 5
): Promise<UnifiedFetchResponse<T>[]> {
  const results: UnifiedFetchResponse<T>[] = [];
  
  // Process in batches
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(url => unifiedFetch<T>(url, options))
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Prefetch URLs to warm the cache
 */
export async function prefetch(
  urls: string[],
  options?: UnifiedFetchOptions
): Promise<void> {
  await batchFetch(urls, { 
    ...options, 
    useCache: true,
    throwOnError: false 
  });
}

/**
 * Clear cache for specific URLs or patterns
 */
export async function clearCache(pattern?: string): Promise<void> {
  if (pattern) {
    // Clear specific pattern
    logger.info('Clearing cache for pattern:', { pattern });
    // Implementation depends on cache manager capabilities
  } else {
    // Clear all fetch cache
    logger.info('Clearing all fetch cache');
    await cacheManager.clear();
  }
}

// Export cache manager for advanced usage
export { cacheManager };

// Default export for simple imports
export default unifiedFetch;