/**
 * Advanced rate limiting system with multiple strategies
 * Protects against DDoS attacks and API abuse
 */

import { NextApiRequest, NextApiResponse } from 'next';
import logger from './logger';

interface StoreEntry<T> {
  value: T;
  expiresAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: number;
  retryAfter?: number;
  tokensRemaining?: number;
  msUntilRefill?: number;
}

interface TokenBucketOptions {
  capacity?: number;
  refillRate?: number;
  windowMs?: number;
  store?: RateLimiterStore;
}

interface SlidingWindowOptions {
  windowMs?: number;
  maxRequests?: number;
  store?: RateLimiterStore;
}

interface FixedWindowOptions {
  windowMs?: number;
  maxRequests?: number;
  store?: RateLimiterStore;
}

interface AdaptiveRateLimiterOptions {
  baseLimit?: number;
  windowMs?: number;
  store?: RateLimiterStore;
  loadThreshold?: number;
  adjustmentFactor?: number;
}

interface TierConfig {
  requests: number;
  windowMs: number;
}

interface TieredRateLimiterOptions {
  tiers?: Record<string, TierConfig>;
  store?: RateLimiterStore;
}

interface DistributedRateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
  store?: RateLimiterStore;
}

type RateLimiterType = 'token' | 'bucket' | 'sliding' | 'sliding-window' | 'fixed' | 'fixed-window' | 'adaptive' | 'tiered' | 'distributed';

interface RateLimitMiddlewareOptions {
  type?: RateLimiterType;
  keyGenerator?: (req: NextApiRequest) => string;
  skip?: (req: NextApiRequest, res: NextApiResponse) => boolean;
  onLimitReached?: (req: NextApiRequest, res: NextApiResponse, result: RateLimitResult) => void | Promise<void>;
  maxRequests?: number;
  windowMs?: number;
  capacity?: number;
  refillRate?: number;
  baseLimit?: number;
  loadThreshold?: number;
  adjustmentFactor?: number;
  tiers?: Record<string, TierConfig>;
  keyPrefix?: string;
  store?: RateLimiterStore;
}

interface MemoryStats {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

interface HealthCheckResult {
  status: string;
  storeSize: number;
  timestamp: string;
  memoryUsage: MemoryStats;
  uptime: number;
}

interface LimiterStats {
  type: string;
  config: {
    windowMs?: number;
    maxRequests?: number;
    baseLimit?: number;
    capacity?: number;
  };
  store: {
    size: number;
  };
  timestamp: string;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Rate limiter storage interface
 */
export class RateLimiterStore {
  private store: Map<string, StoreEntry<any>>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = this.cleanup();
  }

  set<T>(key: string, value: T, ttl: number = 60000): void {
    const expiresAt = Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Clean up expired entries
  private cleanup(): NodeJS.Timeout {
    return setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.expiresAt) {
          this.store.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  size(): number {
    return this.store.size;
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Token bucket rate limiter
 */
export class TokenBucketLimiter {
  private capacity: number;
  private refillRate: number;
  private windowMs: number;
  private store: RateLimiterStore;

  constructor(options: TokenBucketOptions = {}) {
    this.capacity = options.capacity || 10;
    this.refillRate = options.refillRate || 1; // tokens per second
    this.windowMs = options.windowMs || 1000;
    this.store = options.store || new RateLimiterStore();
  }

  async isAllowed(key: string, tokens: number = 1): Promise<RateLimitResult> {
    const now = Date.now();
    const bucketKey = `bucket:${key}`;
    
    let bucket = this.store.get<Bucket>(bucketKey);
    
    if (!bucket) {
      bucket = {
        tokens: this.capacity,
        lastRefill: now
      };
    }

    // Calculate tokens to add based on elapsed time
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / this.windowMs) * this.refillRate);
    
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if request can be allowed
    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      this.store.set(bucketKey, bucket, this.windowMs * this.capacity);
      
      return {
        allowed: true,
        tokensRemaining: bucket.tokens,
        msUntilRefill: this.windowMs - (now % this.windowMs)
      };
    }

    this.store.set(bucketKey, bucket, this.windowMs * this.capacity);
    
    return {
      allowed: false,
      tokensRemaining: bucket.tokens,
      msUntilRefill: Math.ceil((tokens - bucket.tokens) / this.refillRate * this.windowMs)
    };
  }
}

/**
 * Sliding window rate limiter
 */
export class SlidingWindowLimiter {
  public windowMs: number;
  public maxRequests: number;
  private store: RateLimiterStore;

  constructor(options: SlidingWindowOptions = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.store = options.store || new RateLimiterStore();
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requestKey = `sliding:${key}`;
    
    let requests = this.store.get<number[]>(requestKey) || [];
    
    // Remove expired requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    if (requests.length >= this.maxRequests) {
      this.store.set(requestKey, requests, this.windowMs);
      
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + this.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    // Add current request
    requests.push(now);
    this.store.set(requestKey, requests, this.windowMs);
    
    return {
      allowed: true,
      remaining: this.maxRequests - requests.length,
      resetTime: now + this.windowMs,
      retryAfter: 0
    };
  }
}

/**
 * Fixed window rate limiter
 */
export class FixedWindowLimiter {
  public windowMs: number;
  public maxRequests: number;
  private store: RateLimiterStore;

  constructor(options: FixedWindowOptions = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxRequests = options.maxRequests || 100;
    this.store = options.store || new RateLimiterStore();
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
    const windowKey = `fixed:${key}:${windowStart}`;
    
    let count = this.store.get<number>(windowKey) || 0;
    
    if (count >= this.maxRequests) {
      const resetTime = windowStart + this.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    count++;
    this.store.set(windowKey, count, this.windowMs);
    
    return {
      allowed: true,
      remaining: this.maxRequests - count,
      resetTime: windowStart + this.windowMs,
      retryAfter: 0
    };
  }
}

/**
 * Adaptive rate limiter that adjusts based on system load
 */
export class AdaptiveRateLimiter {
  public baseLimit: number;
  public windowMs: number;
  private store: RateLimiterStore;
  private loadThreshold: number;
  private adjustmentFactor: number;
  private slidingWindow: SlidingWindowLimiter;

  constructor(options: AdaptiveRateLimiterOptions = {}) {
    this.baseLimit = options.baseLimit || 100;
    this.windowMs = options.windowMs || 60000;
    this.store = options.store || new RateLimiterStore();
    this.loadThreshold = options.loadThreshold || 0.8;
    this.adjustmentFactor = options.adjustmentFactor || 0.5;
    
    this.slidingWindow = new SlidingWindowLimiter({
      windowMs: this.windowMs,
      maxRequests: this.baseLimit,
      store: this.store
    });
  }

  private async getSystemLoad(): Promise<number> {
    // Simple system load approximation
    // In production, you might use actual system metrics
    const memoryUsage = process.memoryUsage();
    const heapUsed = memoryUsage.heapUsed;
    const heapTotal = memoryUsage.heapTotal;
    
    return heapUsed / heapTotal;
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const systemLoad = await this.getSystemLoad();
    let effectiveLimit = this.baseLimit;
    
    // Reduce limit under high load
    if (systemLoad > this.loadThreshold) {
      effectiveLimit = Math.floor(this.baseLimit * this.adjustmentFactor);
      logger.warn('High system load detected, reducing rate limits', {
        systemLoad,
        originalLimit: this.baseLimit,
        effectiveLimit
      });
    }

    // Update sliding window limiter
    this.slidingWindow.maxRequests = effectiveLimit;
    
    return await this.slidingWindow.isAllowed(key);
  }
}

/**
 * Rate limiter with different limits for different user types
 */
export class TieredRateLimiter {
  private tiers: Record<string, TierConfig>;
  private store: RateLimiterStore;
  private limiters: Record<string, SlidingWindowLimiter>;

  constructor(options: TieredRateLimiterOptions = {}) {
    this.tiers = options.tiers || {
      anonymous: { requests: 10, windowMs: 60000 },
      user: { requests: 100, windowMs: 60000 },
      premium: { requests: 1000, windowMs: 60000 },
      admin: { requests: 10000, windowMs: 60000 }
    };
    this.store = options.store || new RateLimiterStore();
    this.limiters = {};
    
    // Create limiter for each tier
    for (const [tier, config] of Object.entries(this.tiers)) {
      this.limiters[tier] = new SlidingWindowLimiter({
        maxRequests: config.requests,
        windowMs: config.windowMs,
        store: this.store
      });
    }
  }

  async isAllowed(key: string, userTier: string = 'anonymous'): Promise<RateLimitResult> {
    const limiter = this.limiters[userTier] || this.limiters.anonymous;
    return await limiter.isAllowed(key);
  }

  getTierLimits(tier: string = 'anonymous'): TierConfig {
    return this.tiers[tier] || this.tiers.anonymous;
  }
}

/**
 * Distributed rate limiter (for multiple server instances)
 */
export class DistributedRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyPrefix: string;
  private store: RateLimiterStore;

  constructor(options: DistributedRateLimiterOptions = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxRequests = options.maxRequests || 100;
    this.keyPrefix = options.keyPrefix || 'rate_limit:';
    
    // In production, this would be Redis or another distributed store
    this.store = options.store || new RateLimiterStore();
  }

  async isAllowed(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const window = Math.floor(now / this.windowMs);
    const distributedKey = `${this.keyPrefix}${key}:${window}`;
    
    // Atomic increment operation (would be Redis INCR in production)
    let count = this.store.get<number>(distributedKey) || 0;
    count++;
    this.store.set(distributedKey, count, this.windowMs);
    
    if (count > this.maxRequests) {
      const resetTime = (window + 1) * this.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    return {
      allowed: true,
      remaining: this.maxRequests - count,
      resetTime: (window + 1) * this.windowMs,
      retryAfter: 0
    };
  }
}

type RateLimiter = TokenBucketLimiter | SlidingWindowLimiter | FixedWindowLimiter | AdaptiveRateLimiter | TieredRateLimiter | DistributedRateLimiter;

/**
 * Rate limiter factory
 */
export class RateLimiterFactory {
  static create(type: RateLimiterType = 'sliding', options: Record<string, unknown> = {}): RateLimiter {
    const store = new RateLimiterStore();
    
    switch (type.toLowerCase() as RateLimiterType) {
      case 'token':
      case 'bucket':
        return new TokenBucketLimiter({ ...options, store });
      
      case 'sliding':
      case 'sliding-window':
        return new SlidingWindowLimiter({ ...options, store });
      
      case 'fixed':
      case 'fixed-window':
        return new FixedWindowLimiter({ ...options, store });
      
      case 'adaptive':
        return new AdaptiveRateLimiter({ ...options, store });
      
      case 'tiered':
        return new TieredRateLimiter({ ...options, store });
      
      case 'distributed':
        return new DistributedRateLimiter({ ...options, store });
      
      default:
        throw new Error(`Unknown rate limiter type: ${type}`);
    }
  }
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function createRateLimitMiddleware(options: RateLimitMiddlewareOptions = {}) {
  const {
    type = 'sliding',
    keyGenerator = (req) => req.headers['x-forwarded-for'] as string || req.socket?.remoteAddress || 'unknown',
    skip = () => false,
    onLimitReached = null,
    ...limiterOptions
  } = options;

  const limiter = RateLimiterFactory.create(type, limiterOptions);

  return async (req: NextApiRequest, res: NextApiResponse, next?: () => void | Promise<void>) => {
    try {
      // Skip rate limiting based on condition
      if (skip(req, res)) {
        return next ? next() : true;
      }

      const key = keyGenerator(req);
      const result = await limiter.isAllowed(key);

      // Set rate limit headers
      if (result.remaining !== undefined) {
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      }
      if (result.resetTime) {
        res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
      }
      if (result.retryAfter) {
        res.setHeader('Retry-After', result.retryAfter.toString());
      }

      if (!result.allowed) {
        // Log rate limit exceeded
        logger.warn('Rate limit exceeded', {
          key,
          ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
          url: req.url,
          method: req.method
        });

        // Call custom handler if provided
        if (onLimitReached) {
          return onLimitReached(req, res, result);
        }

        // Default response
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter || 60} seconds.`,
          retryAfter: result.retryAfter || 60
        });
      }

      return next ? next() : true;

    } catch (error) {
      logger.error('Rate limiting error', { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
      
      // Don't block requests on rate limiter errors
      return next ? next() : true;
    }
  };
}

/**
 * Predefined rate limiters for common use cases
 */
export const CommonLimiters = {
  // Strict API rate limiting
  api: () => RateLimiterFactory.create('sliding', {
    maxRequests: 100,
    windowMs: 60000 // 100 requests per minute
  }),

  // Authentication endpoints (stricter)
  auth: () => RateLimiterFactory.create('sliding', {
    maxRequests: 5,
    windowMs: 60000 // 5 requests per minute
  }),

  // Search endpoints
  search: () => RateLimiterFactory.create('token', {
    capacity: 20,
    refillRate: 2, // 2 tokens per second
    windowMs: 1000
  }),

  // File upload endpoints
  upload: () => RateLimiterFactory.create('fixed', {
    maxRequests: 10,
    windowMs: 300000 // 10 uploads per 5 minutes
  }),

  // General web requests
  web: () => RateLimiterFactory.create('adaptive', {
    baseLimit: 200,
    windowMs: 60000,
    loadThreshold: 0.7
  }),

  // Admin endpoints
  admin: () => RateLimiterFactory.create('tiered', {
    tiers: {
      admin: { requests: 1000, windowMs: 60000 },
      user: { requests: 10, windowMs: 60000 },
      anonymous: { requests: 1, windowMs: 60000 }
    }
  })
};

/**
 * Rate limiter health check
 */
export function getRateLimiterHealth(): HealthCheckResult {
  const store = new RateLimiterStore();
  
  return {
    status: 'healthy',
    storeSize: store.size(),
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
}

/**
 * Rate limiter statistics
 */
export function getRateLimiterStats(limiter: RateLimiter): LimiterStats {
  const config: LimiterStats['config'] = {};
  
  if ('windowMs' in limiter) config.windowMs = (limiter as any).windowMs;
  if ('maxRequests' in limiter) config.maxRequests = (limiter as any).maxRequests;
  if ('baseLimit' in limiter) config.baseLimit = (limiter as any).baseLimit;
  if ('capacity' in limiter) config.capacity = (limiter as any).capacity;

  return {
    type: limiter.constructor.name,
    config,
    store: {
      size: 0 // Would need to expose store size in implementations
    },
    timestamp: new Date().toISOString()
  };
}

export default {
  RateLimiterFactory,
  createRateLimitMiddleware,
  CommonLimiters,
  getRateLimiterHealth,
  getRateLimiterStats
};