/**
 * Advanced API performance optimization utilities
 * Includes request caching, batching, retry logic, and performance monitoring
 */

import performanceMonitor from './performanceMonitor';
import logger from './logger';

// Configuration constants
const CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 1000,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // Exponential backoff
  BATCH_SIZE: 10,
  BATCH_DELAY: 100, // ms
  CONCURRENT_REQUESTS: 6
};

// Request cache implementation
class RequestCache {
  constructor(maxSize = CONFIG.MAX_CACHE_SIZE, ttl = CONFIG.CACHE_TTL) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
  }

  generateKey(url, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    const keyData = {
      url,
      method,
      body: body ? JSON.stringify(body) : null,
      headers: Object.keys(headers).sort().reduce((acc, key) => {
        acc[key] = headers[key];
        return acc;
      }, {})
    };
    return JSON.stringify(keyData);
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    // Update access time for LRU
    entry.lastAccess = Date.now();
    return entry.data;
  }

  set(key, data) {
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const oldestEntry = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)[0];
      this.cache.delete(oldestEntry[0]);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccess: Date.now()
    });
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      maxSize: this.maxSize
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Import unified cache manager
import cacheManager from './UnifiedCacheManager';

// Legacy RequestCache wrapper for backward compatibility
const requestCache = {
  get: (key) => cacheManager.get(key),
  set: (key, data) => cacheManager.set(key, data),
  generateKey: (url, options) => cacheManager.generateKey(url, options),
  getStats: async () => {
    const stats = await cacheManager.getStats();
    return stats.overall;
  },
  cleanup: () => cacheManager.cleanup(),
  clear: () => cacheManager.clear()
};

// Request batching utility
class RequestBatcher {
  constructor(batchSize = CONFIG.BATCH_SIZE, delay = CONFIG.BATCH_DELAY) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.timer = null;
  }

  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      const results = await this.executeBatch(batch);
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error);
      });
    }
  }

  async executeBatch(batch) {
    const startTime = Date.now();
    
    try {
      const promises = batch.map(item => 
        this.executeRequest(item.url, item.options)
      );
      
      const results = await Promise.all(promises);
      
      performanceMonitor.recordMetric('api-batch-request', Date.now() - startTime, {
        batchSize: batch.length,
        success: true
      });
      
      return results;
    } catch (error) {
      performanceMonitor.recordMetric('api-batch-request', Date.now() - startTime, {
        batchSize: batch.length,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async executeRequest(url, options) {
    // This would be implemented based on your specific batching needs
    // For now, just execute individual requests
    return optimizedFetch(url, options);
  }
}

// Global batcher instance
const requestBatcher = new RequestBatcher();

// Concurrent request limiter
class ConcurrencyLimiter {
  constructor(maxConcurrent = CONFIG.CONCURRENT_REQUESTS) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async execute(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

// Global concurrency limiter
const concurrencyLimiter = new ConcurrencyLimiter();

// Enhanced fetch with optimizations
async function optimizedFetch(url, options = {}) {
  const startTime = Date.now();
  const cacheKey = requestCache.generateKey(url, options);

  // Check cache first
  const cachedResponse = requestCache.get(cacheKey);
  if (cachedResponse) {
    performanceMonitor.recordMetric('api-cache-hit', Date.now() - startTime, {
      url,
      cached: true
    });
    return cachedResponse;
  }

  // Execute request with concurrency limiting
  return concurrencyLimiter.execute(async () => {
    let lastError;
    
    for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const requestTime = Date.now() - startTime;

        // Cache successful responses
        if (response.status >= 200 && response.status < 300) {
          requestCache.set(cacheKey, data);
        }

        performanceMonitor.recordMetric('api-request-success', requestTime, {
          url,
          attempt: attempt + 1,
          status: response.status,
          cached: false
        });

        return data;

      } catch (error) {
        lastError = error;
        
        performanceMonitor.recordMetric('api-request-error', Date.now() - startTime, {
          url,
          attempt: attempt + 1,
          error: error.message,
          type: error.name
        });

        // Don't retry on certain errors
        if (error.name === 'AbortError' || error.message.includes('404')) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < CONFIG.MAX_RETRIES && CONFIG.RETRY_DELAYS[attempt]) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAYS[attempt]));
        }
      }
    }

    // All retries failed
    logger.error('API request failed after all retries', {
      url,
      error: lastError?.message,
      attempts: CONFIG.MAX_RETRIES + 1
    });
    
    throw lastError;
  });
}

// Batched request utility
export const batchedFetch = (url, options = {}) => {
  return requestBatcher.add({ url, options });
};

// SWR-like data fetching hook with optimizations
export const useOptimizedSWR = (key, fetcher, options = {}) => {
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    dedupingInterval = 2000,
    errorRetryCount = 3,
    errorRetryInterval = 5000,
    fallbackData = null,
    suspense = false
  } = options;

  // This would be a full SWR implementation
  // For now, we'll provide a simplified version
  const [data, setData] = React.useState(fallbackData);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isValidating, setIsValidating] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setIsValidating(true);
      setError(null);
      
      const result = await fetcher(key);
      setData(result);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    } finally {
      setIsValidating(false);
    }
  }, [key, fetcher]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate: fetchData
  };
};

// Performance monitoring for API calls
export const useAPIPerformance = () => {
  const [metrics, setMetrics] = React.useState({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0
  });

  React.useEffect(() => {
    const unsubscribe = performanceMonitor.onVitalsChange((metric) => {
      if (metric.name.startsWith('api-')) {
        // Update metrics based on the received data
        setMetrics(prev => {
          const apiMetrics = performanceMonitor.getMetrics();
          const successRequests = apiMetrics['api-request-success'] || [];
          const errorRequests = apiMetrics['api-request-error'] || [];
          const cacheHits = apiMetrics['api-cache-hit'] || [];
          
          const totalRequests = successRequests.length + errorRequests.length;
          const successRate = totalRequests > 0 ? (successRequests.length / totalRequests) * 100 : 0;
          const averageResponseTime = successRequests.length > 0 
            ? successRequests.reduce((acc, m) => acc + m.value, 0) / successRequests.length 
            : 0;
          
          const cacheStats = requestCache.getStats();
          
          return {
            totalRequests,
            successRate,
            averageResponseTime,
            cacheHitRate: cacheStats.hitRate,
            errorRate: 100 - successRate
          };
        });
      }
    });

    return unsubscribe;
  }, []);

  return metrics;
};

// Request deduplication
class RequestDeduplicator {
  constructor() {
    this.inFlight = new Map();
  }

  async dedupe(key, requestFn) {
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    const promise = requestFn().finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }
}

const requestDeduplicator = new RequestDeduplicator();

// Export main utilities
export {
  optimizedFetch,
  requestCache,
  requestBatcher,
  concurrencyLimiter,
  requestDeduplicator
};

// Cleanup utilities
export const cleanupAPIOptimizations = () => {
  requestCache.cleanup();
  requestBatcher.flush();
};

// Performance reporting
export const getAPIPerformanceReport = () => {
  const cacheStats = requestCache.getStats();
  const apiMetrics = performanceMonitor.getMetrics();
  
  const successRequests = apiMetrics['api-request-success'] || [];
  const errorRequests = apiMetrics['api-request-error'] || [];
  const batchRequests = apiMetrics['api-batch-request'] || [];
  
  return {
    cache: cacheStats,
    requests: {
      total: successRequests.length + errorRequests.length,
      successful: successRequests.length,
      failed: errorRequests.length,
      batched: batchRequests.length,
      averageResponseTime: successRequests.length > 0 
        ? successRequests.reduce((acc, m) => acc + m.value, 0) / successRequests.length 
        : 0
    },
    performance: {
      fastRequests: successRequests.filter(m => m.value < 1000).length,
      slowRequests: successRequests.filter(m => m.value > 5000).length
    }
  };
};

// Initialize cleanup interval
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupAPIOptimizations();
  }, 5 * 60 * 1000); // Every 5 minutes
}

export default {
  optimizedFetch,
  batchedFetch,
  useOptimizedSWR,
  useAPIPerformance,
  getAPIPerformanceReport,
  cleanupAPIOptimizations
};