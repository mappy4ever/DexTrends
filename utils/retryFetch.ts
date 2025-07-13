/**
 * Enhanced fetch utility with retry logic, exponential backoff, and error handling
 */

import logger from './logger';

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry configuration interface
 */
interface RetryConfig {
  retries?: number;
  retryDelay?: number; // Base delay in ms
  retryDelayMultiplier?: number; // Exponential backoff multiplier
  retryOn?: number[]; // HTTP status codes to retry on
  timeout?: number; // Request timeout in ms
  onRetry?: (error: RetryError, attempt: number) => void; // Callback function for retry events
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  retries: 3,
  retryDelay: 1000, // Base delay in ms
  retryDelayMultiplier: 2, // Exponential backoff multiplier
  retryOn: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry on
  timeout: 10000, // Request timeout in ms
  onRetry: () => {} // Default no-op callback
};

/**
 * Custom error type with status and response
 */
interface RetryError extends Error {
  status?: number;
  response?: Response;
  originalError?: Error;
}

/**
 * Batch request interface
 */
interface BatchRequest {
  url: string;
  options?: RequestInit;
}

/**
 * Batch result interface
 */
interface BatchResult<T> {
  index: number;
  result: T | null;
  error: RetryError | null;
}

/**
 * Batch fetch response interface
 */
interface BatchFetchResponse<T> {
  results: (T | undefined)[];
  errors: { index: number; error: RetryError }[];
  successCount: number;
  errorCount: number;
}

/**
 * Batch fetch options interface
 */
interface BatchFetchOptions {
  concurrency?: number;
  retryConfig?: RetryConfig;
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Check if error should trigger a retry
 */
function shouldRetry(error: RetryError, retryOn: number[], attempt: number, maxRetries: number): boolean {
  if (attempt >= maxRetries) {
    return false;
  }

  // Network errors
  if (error.name === 'TypeError' || error.name === 'NetworkError') {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError') {
    return true;
  }

  // HTTP status code errors
  if (error.status && retryOn.includes(error.status)) {
    return true;
  }

  return false;
}

/**
 * Enhanced fetch with retry logic
 */
export async function retryFetch(
  url: string, 
  options: RequestInit = {}, 
  retryConfig: RetryConfig = {}
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const { retries, retryDelay, retryDelayMultiplier, retryOn, timeout, onRetry } = config;
  
  let lastError: RetryError | undefined;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const fetchOptions: RequestInit = {
        ...options,
        signal: controller.signal
      };
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // If response is ok, return it
      if (response.ok) {
        return response;
      }
      
      // Create error for non-ok responses
      const error: RetryError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      
      throw error;
      
    } catch (error) {
      lastError = error as RetryError;
      
      // If this is the last attempt or shouldn't retry, throw the error
      if (!shouldRetry(lastError, retryOn, attempt, retries)) {
        throw error;
      }
      
      // Calculate delay for next attempt (exponential backoff)
      const delay = retryDelay * Math.pow(retryDelayMultiplier, attempt);
      
      // Call retry callback if provided
      if (onRetry) {
        try {
          onRetry(lastError, attempt + 1);
        } catch (callbackError) {
          // Don't let callback errors stop the retry process
        }
      }
      
      // Wait before next attempt
      await sleep(delay);
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

/**
 * Enhanced fetch with JSON parsing and retry logic
 */
export async function retryFetchJson<T = any>(
  url: string, 
  options: RequestInit = {}, 
  retryConfig: RetryConfig = {}
): Promise<T> {
  const response = await retryFetch(url, options, retryConfig);
  
  try {
    return await response.json() as T;
  } catch (error) {
    const parseError: RetryError = new Error(`Failed to parse JSON response: ${(error as Error).message}`);
    parseError.originalError = error as Error;
    parseError.response = response;
    throw parseError;
  }
}

/**
 * Batch fetch with retry logic
 */
export async function batchRetryFetch<T = any>(
  requests: BatchRequest[], 
  options: BatchFetchOptions = {}
): Promise<BatchFetchResponse<T>> {
  const {
    concurrency = 5,
    retryConfig = {},
    onProgress = null
  } = options;
  
  const results: (T | undefined)[] = new Array(requests.length);
  const errors: { index: number; error: RetryError }[] = [];
  let completed = 0;
  
  // Process requests in batches
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (request, index): Promise<BatchResult<T>> => {
      try {
        const { url, options: requestOptions = {} } = request;
        const result = await retryFetchJson<T>(url, requestOptions, retryConfig);
        
        completed++;
        if (onProgress) {
          onProgress(completed, requests.length);
        }
        
        return { index: i + index, result, error: null };
      } catch (error) {
        completed++;
        if (onProgress) {
          onProgress(completed, requests.length);
        }
        
        return { index: i + index, result: null, error: error as RetryError };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ index, result, error }) => {
      if (error) {
        errors.push({ index, error });
      } else {
        results[index] = result!;
      }
    });
  }
  
  return {
    results,
    errors,
    successCount: results.filter(r => r !== undefined).length,
    errorCount: errors.length
  };
}

/**
 * Retry fetch instance interface
 */
interface RetryFetchInstance {
  fetch: (url: string, options?: RequestInit, retryConfig?: RetryConfig) => Promise<Response>;
  fetchJson: <T = any>(url: string, options?: RequestInit, retryConfig?: RetryConfig) => Promise<T>;
  batchFetch: <T = any>(requests: BatchRequest[], options?: BatchFetchOptions) => Promise<BatchFetchResponse<T>>;
}

/**
 * Create a fetch function with predefined retry configuration
 */
export function createRetryFetch(defaultRetryConfig: RetryConfig = {}): RetryFetchInstance {
  const config = { ...DEFAULT_RETRY_CONFIG, ...defaultRetryConfig };
  
  return {
    fetch: (url: string, options: RequestInit = {}, retryConfig: RetryConfig = {}) => 
      retryFetch(url, options, { ...config, ...retryConfig }),
    
    fetchJson: <T = any>(url: string, options: RequestInit = {}, retryConfig: RetryConfig = {}) => 
      retryFetchJson<T>(url, options, { ...config, ...retryConfig }),
    
    batchFetch: <T = any>(requests: BatchRequest[], options: BatchFetchOptions = {}) => 
      batchRetryFetch<T>(requests, { retryConfig: config, ...options })
  };
}

/**
 * Predefined fetch instances for different use cases
 */

// For Pokemon API calls (more lenient retry policy)
export const pokemonFetch = createRetryFetch({
  retries: 3,
  retryDelay: 1000,
  timeout: 15000,
  onRetry: (error: RetryError, attempt: number) => {
    logger.warn(`Pokemon API retry attempt ${attempt}:`, { error: error.message });
  }
});

// For card API calls (standard retry policy)
export const cardFetch = createRetryFetch({
  retries: 2,
  retryDelay: 500,
  timeout: 10000,
  onRetry: (error: RetryError, attempt: number) => {
    logger.warn(`Card API retry attempt ${attempt}:`, { error: error.message });
  }
});

// For critical API calls (aggressive retry policy)
export const criticalFetch = createRetryFetch({
  retries: 5,
  retryDelay: 2000,
  retryDelayMultiplier: 1.5,
  timeout: 20000,
  onRetry: (error: RetryError, attempt: number) => {
    logger.warn(`Critical API retry attempt ${attempt}:`, { error: error.message });
  }
});

export default retryFetch;