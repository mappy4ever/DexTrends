/**
 * Advanced API caching system with multiple strategies and offline support
 */

import logger from './logger';

class APICache {
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
  async fetchWithCache(url, options = {}) {
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
      const requestPromise = this.executeRequest(url, {
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

  async executeRequest(url, options) {
    const { cacheKey, config } = options;

    switch (config.strategy) {
      case 'cache-first':
        return await this.cacheFirstStrategy(url, cacheKey, config, options);
      
      case 'network-first':
        return await this.networkFirstStrategy(url, cacheKey, config, options);
      
      case 'stale-while-revalidate':
        return await this.staleWhileRevalidateStrategy(url, cacheKey, config, options);
      
      default:
        return await this.networkFirstStrategy(url, cacheKey, config, options);
    }
  }

  async cacheFirstStrategy(url, cacheKey, config, options) {
    // Try cache first
    if (!options.forceRefresh) {
      const cachedData = this.getCachedData(cacheKey, config);
      if (cachedData) {
        logger.debug('Cache hit (cache-first)', { url });
        return cachedData.data;
      }
    }

    // Fallback to network
    try {
      const data = await this.fetchFromNetwork(url, options);
      this.setCachedData(cacheKey, config, data, url);
      return data;
    } catch (error) {
      // If network fails, try cache again (even if stale)
      const staleData = this.getCachedData(cacheKey, config, true);
      if (staleData) {
        logger.warn('Using stale cache data due to network error', { url });
        return staleData.data;
      }
      throw error;
    }
  }

  async networkFirstStrategy(url, cacheKey, config, options) {
    try {
      // Try network first
      const data = await this.fetchFromNetwork(url, options);
      this.setCachedData(cacheKey, config, data, url);
      return data;
    } catch (error) {
      // Fallback to cache
      const cachedData = this.getCachedData(cacheKey, config, true);
      if (cachedData) {
        logger.warn('Using cached data due to network error', { url });
        return cachedData.data;
      }
      throw error;
    }
  }

  async staleWhileRevalidateStrategy(url, cacheKey, config, options) {
    const cachedData = this.getCachedData(cacheKey, config, true);
    
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
    return await this.fetchFromNetwork(url, options);
  }

  async revalidateInBackground(url, cacheKey, config, options) {
    try {
      const data = await this.fetchFromNetwork(url, options);
      this.setCachedData(cacheKey, config, data, url);
      logger.debug('Background revalidation complete', { url });
    } catch (error) {
      logger.warn('Background revalidation failed', { url, error });
    }
  }

  async fetchFromNetwork(url, options) {
    const { timeout = 10000, retryCount = 3, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError;
    
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
        
        return data;
      } catch (error) {
        lastError = error;
        logger.warn(`Network request failed (attempt ${attempt})`, { url, error: error.message });
        
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

  getCachedData(cacheKey, config, allowStale = false) {
    const data = this.memoryCache.get(cacheKey);
    if (!data) return null;

    const age = Date.now() - data.timestamp;
    if (allowStale || age < config.maxAge) {
      return data;
    }

    // Remove expired data
    this.memoryCache.delete(cacheKey);
    return null;
  }

  setCachedData(cacheKey, config, data, url) {
    const cacheEntry = {
      key: cacheKey,
      data,
      url,
      timestamp: Date.now()
    };

    this.memoryCache.set(cacheKey, cacheEntry);

    // Limit memory cache size
    if (this.memoryCache.size > 1000) {
      const oldest = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.memoryCache.delete(oldest[0]);
    }
  }

  generateCacheKey(url, options = {}) {
    const keyData = {
      url: url.replace(/[?&]timestamp=\d+/, ''),
      method: options.method || 'GET',
      body: options.body || null
    };
    
    return btoa(JSON.stringify(keyData)).replace(/[^a-zA-Z0-9]/g, '');
  }

  clearCache(cacheType = null) {
    if (cacheType) {
      // Clear specific cache type
      const keysToDelete = [];
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

  getCacheStats() {
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