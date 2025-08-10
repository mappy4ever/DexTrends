/**
 * Advanced API performance optimization utilities
 * Includes request caching, batching, retry logic, and performance monitoring
 */

import React from 'react';
import performanceMonitor from './performanceMonitor';
import logger from './logger';
import cacheManager from './UnifiedCacheManager';
import type { UnknownError } from '../types/common';

// Type definitions
interface Config {
  CACHE_TTL: number;
  MAX_CACHE_SIZE: number;
  REQUEST_TIMEOUT: number;
  MAX_RETRIES: number;
  RETRY_DELAYS: number[];
  BATCH_SIZE: number;
  BATCH_DELAY: number;
  CONCURRENT_REQUESTS: number;
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  lastAccess: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  maxSize: number;
}

interface BatchRequest<T = unknown> {
  url: string;
  options?: RequestInit;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: UnknownError) => void;
}

interface QueueItem<T> {
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: UnknownError) => void;
}

interface SWROptions<T = unknown> {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  fallbackData?: T;
  suspense?: boolean;
}

interface SWRReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<void>;
}

interface APIMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
}

interface PerformanceReport {
  cache: CacheStats;
  requests: {
    total: number;
    successful: number;
    failed: number;
    batched: number;
    averageResponseTime: number;
  };
  performance: {
    fastRequests: number;
    slowRequests: number;
  };
}

// Configuration constants
const CONFIG: Config = {
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
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private readonly ttl: number;
  private hits: number;
  private misses: number;

  constructor(maxSize: number = CONFIG.MAX_CACHE_SIZE, ttl: number = CONFIG.CACHE_TTL) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.hits = 0;
    this.misses = 0;
  }

  generateKey(url: string, options: RequestInit = {}): string {
    const { method = 'GET', body, headers = {} } = options;
    const keyData = {
      url,
      method,
      body: body ? JSON.stringify(body) : null,
      headers: Object.keys(headers).sort().reduce((acc: Record<string, string>, key) => {
        acc[key] = (headers as Record<string, string>)[key];
        return acc;
      }, {})
    };
    return JSON.stringify(keyData);
  }

  get<T = unknown>(key: string): T | null {
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
    return entry.data as T;
  }

  set<T = any>(key: string, data: T): void {
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      const oldestEntry = entries.sort(([, a], [, b]) => a.lastAccess - b.lastAccess)[0];
      if (oldestEntry) {
        this.cache.delete(oldestEntry[0]);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccess: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * 100 : 0,
      maxSize: this.maxSize
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Legacy RequestCache wrapper for backward compatibility
const requestCache = {
  get: <T = any>(key: string) => cacheManager.get<T>(key),
  set: <T = any>(key: string, data: T) => cacheManager.set(key, data),
  generateKey: (url: string, options?: Record<string, any>) => cacheManager.generateKey(url, options),
  getStats: async (): Promise<CacheStats> => {
    const stats = await cacheManager.getStats();
    return {
      size: stats.entries,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hitRate,
      maxSize: 1000
    };
  },
  cleanup: () => cacheManager.cleanup(),
  clear: () => cacheManager.clear()
};

// Request batching utility
class RequestBatcher {
  private readonly batchSize: number;
  private readonly delay: number;
  private queue: BatchRequest[];
  private timer: NodeJS.Timeout | null;

  constructor(batchSize: number = CONFIG.BATCH_SIZE, delay: number = CONFIG.BATCH_DELAY) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.timer = null;
  }

  add(request: Omit<BatchRequest, 'resolve' | 'reject'>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject });

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  async flush(): Promise<void> {
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

  private async executeBatch(batch: BatchRequest[]): Promise<any[]> {
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      performanceMonitor.recordMetric('api-batch-request', Date.now() - startTime, {
        batchSize: batch.length,
        success: false,
        error: errorMessage
      });
      throw error;
    }
  }

  private async executeRequest(url: string, options?: RequestInit): Promise<unknown> {
    // This would be implemented based on your specific batching needs
    // For now, just execute individual requests
    return optimizedFetch(url, options);
  }
}

// Global batcher instance
const requestBatcher = new RequestBatcher();

// Concurrent request limiter
class ConcurrencyLimiter {
  private readonly maxConcurrent: number;
  private running: number;
  private queue: QueueItem<any>[];

  constructor(maxConcurrent: number = CONFIG.CONCURRENT_REQUESTS) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ 
        fn, 
        resolve: (value: T | PromiseLike<T>) => resolve(value), 
        reject: (reason: UnknownError) => reject(reason) 
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.running++;
    const item = this.queue.shift();
    if (!item) return;

    const { fn, resolve, reject } = item;

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
async function optimizedFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const startTime = Date.now();
  const cacheKey = requestCache.generateKey(url, options);

  // Check cache first
  const cachedResponse = await requestCache.get<T>(cacheKey);
  if (cachedResponse) {
    performanceMonitor.recordMetric('api-cache-hit', Date.now() - startTime, {
      url,
      cached: true
    });
    return cachedResponse;
  }

  // Execute request with concurrency limiting
  return concurrencyLimiter.execute<T>(async () => {
    let lastError: Error = new Error('Unknown error');
    
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
          await requestCache.set(cacheKey, data);
        }

        performanceMonitor.recordMetric('api-request-success', requestTime, {
          url,
          attempt: attempt + 1,
          status: response.status,
          cached: false
        });

        return data as T;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        performanceMonitor.recordMetric('api-request-error', Date.now() - startTime, {
          url,
          attempt: attempt + 1,
          error: lastError.message,
          type: lastError.name
        });

        // Don't retry on certain errors
        if (lastError.name === 'AbortError' || lastError.message.includes('404')) {
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
export const batchedFetch = <T = unknown>(url: string, options: RequestInit = {}): Promise<T> => {
  return requestBatcher.add({ url, options });
};

// SWR-like data fetching hook with optimizations
export const useOptimizedSWR = <T = unknown>(
  key: string, 
  fetcher: (key: string) => Promise<T>, 
  options: SWROptions<T> = {}
): SWRReturn<T> => {
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
  const [data, setData] = React.useState<T | null>(fallbackData);
  const [error, setError] = React.useState<Error | null>(null);
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
      setError(err as Error);
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
export const useAPIPerformance = (): APIMetrics => {
  const [metrics, setMetrics] = React.useState<APIMetrics>({
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
          const successRequests = Array.isArray(apiMetrics) ? [] : (apiMetrics['api-request-success'] || []);
          const errorRequests = Array.isArray(apiMetrics) ? [] : (apiMetrics['api-request-error'] || []);
          const cacheHits = Array.isArray(apiMetrics) ? [] : (apiMetrics['api-cache-hit'] || []);
          
          const totalRequests = successRequests.length + errorRequests.length;
          const successRate = totalRequests > 0 ? (successRequests.length / totalRequests) * 100 : 0;
          const averageResponseTime = successRequests.length > 0 
            ? successRequests.reduce((acc: number, m) => acc + (typeof m === 'object' && m !== null && 'value' in m ? Number(m.value) : 0), 0) / successRequests.length 
            : 0;
          
          requestCache.getStats().then(cacheStats => {
            setMetrics({
              totalRequests,
              successRate,
              averageResponseTime,
              cacheHitRate: cacheStats.hitRate,
              errorRate: 100 - successRate
            });
          });
          
          return prev;
        });
      }
    });

    return unsubscribe;
  }, []);

  return metrics;
};

// Request deduplication
class RequestDeduplicator {
  private inFlight: Map<string, Promise<unknown>>;

  constructor() {
    this.inFlight = new Map();
  }

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>;
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
export const cleanupAPIOptimizations = (): void => {
  requestCache.cleanup();
  requestBatcher.flush();
};

// Performance reporting
export const getAPIPerformanceReport = async (): Promise<PerformanceReport> => {
  const cacheStats = await requestCache.getStats();
  const apiMetrics = performanceMonitor.getMetrics();
  
  const successRequests = Array.isArray(apiMetrics) ? [] : (apiMetrics['api-request-success'] || []);
  const errorRequests = Array.isArray(apiMetrics) ? [] : (apiMetrics['api-request-error'] || []);
  const batchRequests = Array.isArray(apiMetrics) ? [] : (apiMetrics['api-batch-request'] || []);
  
  return {
    cache: cacheStats,
    requests: {
      total: successRequests.length + errorRequests.length,
      successful: successRequests.length,
      failed: errorRequests.length,
      batched: batchRequests.length,
      averageResponseTime: successRequests.length > 0 
        ? successRequests.reduce((acc: number, m) => acc + (typeof m === 'object' && m !== null && 'value' in m ? Number(m.value) : 0), 0) / successRequests.length 
        : 0
    },
    performance: {
      fastRequests: successRequests.filter((m) => typeof m === 'object' && m !== null && 'value' in m && Number(m.value) < 1000).length,
      slowRequests: successRequests.filter((m) => typeof m === 'object' && m !== null && 'value' in m && Number(m.value) > 5000).length
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