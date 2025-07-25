/**
 * Advanced API caching system with multiple strategies and offline support
 */

import logger from './logger';

// Type definitions
type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate';

interface CacheConfig {
  name: string;
  maxAge: number;
  strategy: CacheStrategy;
}

interface CacheConfigs {
  pokemon: CacheConfig;
  cards: CacheConfig;
  search: CacheConfig;
  prices: CacheConfig;
}

interface CacheEntry<T = any> {
  key: string;
  data: T;
  url: string;
  timestamp: number;
}

interface FetchOptions extends RequestInit {
  cacheType?: keyof CacheConfigs;
  forceRefresh?: boolean;
  timeout?: number;
  retryCount?: number;
}

interface InternalFetchOptions extends FetchOptions {
  cacheKey: string;
  config: CacheConfig;
}

interface CacheStats {
  memoryEntries: number;
  queuedRequests: number;
  configurations: string[];
}

class APICache {
  private readonly isClient: boolean;
  private readonly cacheConfigs: CacheConfigs;
  private readonly memoryCache: Map<string, CacheEntry>;
  private readonly requestQueue: Map<string, Promise<any>>;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    
    // Cache configurations
    this.cacheConfigs = {
      pokemon: {
        name: 'pokemon-data',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        strategy: 'cache-first'
      },
      cards: {
        name: 'card-data', 
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
        strategy: 'stale-while-revalidate'
      },
      search: {
        name: 'search-cache',
        maxAge: 30 * 60 * 1000, // 30 minutes
        strategy: 'network-first'
      },
      prices: {
        name: 'price-data',
        maxAge: 5 * 60 * 1000, // 5 minutes
        strategy: 'network-first'
      }
    };

    this.memoryCache = new Map();
    this.requestQueue = new Map();
  }

  /**
   * Main caching method with multiple strategies
   */
  async fetchWithCache<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
    const {
      cacheType = 'cards',
      forceRefresh = false,
      timeout = 10000,
      retryCount = 3,
      ...fetchOptions
    } = options;

    const config = this.cacheConfigs[cacheType];
    const cacheKey = this.generateCacheKey(url, fetchOptions);

    try {
      // Check if request is already in progress
      if (this.requestQueue.has(cacheKey)) {
        return await this.requestQueue.get(cacheKey);
      }

      // Create request promise
      const requestPromise = this.executeRequest<T>(url, {
        cacheKey,
        config,
        forceRefresh,
        timeout,
        retryCount,
        ...fetchOptions
      });

      // Queue the request
      this.requestQueue.set(cacheKey, requestPromise);

      const result = await requestPromise;
      
      // Remove from queue when complete
      this.requestQueue.delete(cacheKey);
      
      return result;
    } catch (error) {
      this.requestQueue.delete(cacheKey);
      throw error;
    }
  }

  private async executeRequest<T>(url: string, options: InternalFetchOptions): Promise<T> {
    const { cacheKey, config } = options;

    switch (config.strategy) {
      case 'cache-first':
        return await this.cacheFirstStrategy<T>(url, cacheKey, config, options);
      
      case 'network-first':
        return await this.networkFirstStrategy<T>(url, cacheKey, config, options);
      
      case 'stale-while-revalidate':
        return await this.staleWhileRevalidateStrategy<T>(url, cacheKey, config, options);
      
      default:
        return await this.networkFirstStrategy<T>(url, cacheKey, config, options);
    }
  }

  private async cacheFirstStrategy<T>(
    url: string, 
    cacheKey: string, 
    config: CacheConfig, 
    options: InternalFetchOptions
  ): Promise<T> {
    // Try cache first
    if (!options.forceRefresh) {
      const cachedData = this.getCachedData<T>(cacheKey, config);
      if (cachedData) {
        logger.debug('Cache hit (cache-first)', { url });
        return cachedData.data;
      }
    }

    // Fallback to network
    try {
      const data = await this.fetchFromNetwork<T>(url, options);
      this.setCachedData(cacheKey, config, data, url);
      return data;
    } catch (error) {
      // If network fails, try cache again (even if stale)
      const staleData = this.getCachedData<T>(cacheKey, config, true);
      if (staleData) {
        logger.warn('Using stale cache data due to network error', { url });
        return staleData.data;
      }
      throw error;
    }
  }

  private async networkFirstStrategy<T>(
    url: string, 
    cacheKey: string, 
    config: CacheConfig, 
    options: InternalFetchOptions
  ): Promise<T> {
    try {
      // Try network first
      const data = await this.fetchFromNetwork<T>(url, options);
      this.setCachedData(cacheKey, config, data, url);
      return data;
    } catch (error) {
      // Fallback to cache
      const cachedData = this.getCachedData<T>(cacheKey, config, true);
      if (cachedData) {
        logger.warn('Using cached data due to network error', { url });
        return cachedData.data;
      }
      throw error;
    }
  }

  private async staleWhileRevalidateStrategy<T>(
    url: string, 
    cacheKey: string, 
    config: CacheConfig, 
    options: InternalFetchOptions
  ): Promise<T> {
    const cachedData = this.getCachedData<T>(cacheKey, config, true);
    
    // Always try to revalidate in background
    this.revalidateInBackground(url, cacheKey, config, options);

    if (cachedData) {
      const age = Date.now() - cachedData.timestamp;
      
      if (age < config.maxAge) {
        logger.debug('Cache hit (fresh)', { url, age });
        return cachedData.data;
      } else {
        logger.debug('Cache hit (stale)', { url, age });
        return cachedData.data;
      }
    }

    // No cache, wait for network
    return await this.fetchFromNetwork<T>(url, options);
  }

  private async revalidateInBackground(
    url: string, 
    cacheKey: string, 
    config: CacheConfig, 
    options: InternalFetchOptions
  ): Promise<void> {
    try {
      const data = await this.fetchFromNetwork(url, options);
      this.setCachedData(cacheKey, config, data, url);
      logger.debug('Background revalidation complete', { url });
    } catch (error: any) {
      logger.warn('Background revalidation failed', { url, error: error.message });
    }
  }

  private async fetchFromNetwork<T>(url: string, options: InternalFetchOptions): Promise<T> {
    const { timeout = 10000, retryCount = 3, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        logger.debug(`Network request attempt ${attempt}`, { url });
        
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            ...fetchOptions.headers
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('Network request successful', { url, attempt });
        
        return data as T;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Network request failed (attempt ${attempt})`, { url, error: lastError.message });
        
        if (attempt < retryCount) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError;
  }

  private getCachedData<T>(cacheKey: string, config: CacheConfig, allowStale: boolean = false): CacheEntry<T> | null {
    const data = this.memoryCache.get(cacheKey) as CacheEntry<T> | undefined;
    if (!data) return null;

    const age = Date.now() - data.timestamp;
    if (allowStale || age < config.maxAge) {
      return data;
    }

    // Remove expired data
    this.memoryCache.delete(cacheKey);
    return null;
  }

  private setCachedData<T>(cacheKey: string, config: CacheConfig, data: T, url: string): void {
    const cacheEntry: CacheEntry<T> = {
      key: cacheKey,
      data,
      url,
      timestamp: Date.now()
    };

    this.memoryCache.set(cacheKey, cacheEntry);

    // Limit memory cache size
    if (this.memoryCache.size > 1000) {
      const entries = Array.from(this.memoryCache.entries());
      const oldest = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) {
        this.memoryCache.delete(oldest[0]);
      }
    }
  }

  private generateCacheKey(url: string, options: RequestInit = {}): string {
    const keyData = {
      url: url.replace(/[?&]timestamp=\d+/, ''),
      method: options.method || 'GET',
      body: options.body || null
    };
    
    // Use btoa if available (browser), otherwise Buffer
    if (typeof btoa !== 'undefined') {
      return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '');
    } else {
      return Buffer.from(JSON.stringify(keyData)).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    }
  }

  clearCache(cacheType: string | null = null): void {
    if (cacheType) {
      // Clear specific cache type
      const keysToDelete: string[] = [];
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.url && entry.url.includes(cacheType)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.memoryCache.delete(key));
    } else {
      this.memoryCache.clear();
    }
    
    logger.debug('Cache cleared', { cacheType });
  }

  getCacheStats(): CacheStats {
    return {
      memoryEntries: this.memoryCache.size,
      queuedRequests: this.requestQueue.size,
      configurations: Object.keys(this.cacheConfigs)
    };
  }
}

// Create global instance
const apiCache = new APICache();

export default apiCache;