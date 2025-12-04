/**
 * API Middleware - Centralized rate limiting and security for API routes
 *
 * Usage:
 *   import { withRateLimit } from '@/lib/api-middleware';
 *
 *   export default withRateLimit(handler, { maxRequests: 100 });
 */

import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { createRateLimitMiddleware } from '@/utils/rateLimiter';
import logger from '@/utils/logger';

interface RateLimitConfig {
  maxRequests?: number;
  windowMs?: number;
  type?: 'sliding' | 'token' | 'fixed' | 'adaptive';
  keyPrefix?: string;
}

// Shared rate limiter store to persist across requests
const rateLimitStore = new Map<string, any>();

/**
 * Extract client IP from request
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Simple sliding window rate limiter
 * Uses in-memory storage (shared across requests in same process)
 */
function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or initialize request timestamps for this key
  let requests = rateLimitStore.get(key) as number[] || [];

  // Remove expired requests
  requests = requests.filter((timestamp: number) => timestamp > windowStart);

  const remaining = Math.max(0, maxRequests - requests.length);
  const resetTime = requests.length > 0 ? Math.min(...requests) + windowMs : now + windowMs;

  if (requests.length >= maxRequests) {
    rateLimitStore.set(key, requests);
    return { allowed: false, remaining: 0, resetTime };
  }

  // Add current request
  requests.push(now);
  rateLimitStore.set(key, requests);

  return { allowed: true, remaining: remaining - 1, resetTime };
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes max age

    for (const [key, requests] of rateLimitStore.entries()) {
      if (Array.isArray(requests)) {
        const filtered = requests.filter((t: number) => now - t < maxAge);
        if (filtered.length === 0) {
          rateLimitStore.delete(key);
        } else {
          rateLimitStore.set(key, filtered);
        }
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Wrap an API handler with rate limiting
 *
 * @param handler - The API route handler
 * @param config - Rate limiting configuration
 */
export function withRateLimit(
  handler: NextApiHandler,
  config: RateLimitConfig = {}
): NextApiHandler {
  const {
    maxRequests = 100, // 100 requests per window
    windowMs = 60 * 1000, // 1 minute window
    keyPrefix = 'api'
  } = config;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const clientIP = getClientIP(req);
    const rateLimitKey = `${keyPrefix}:${clientIP}`;

    const result = checkRateLimit(rateLimitKey, maxRequests, windowMs);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());

      logger.warn('Rate limit exceeded', {
        ip: clientIP,
        endpoint: req.url,
        method: req.method,
        retryAfter
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }

    // Call the actual handler
    return handler(req, res);
  };
}

/**
 * Preset rate limit configurations for different endpoint types
 */
export const RateLimitPresets = {
  // Standard API endpoints: 100 requests/minute
  standard: { maxRequests: 100, windowMs: 60 * 1000 },

  // Search endpoints: 60 requests/minute (more expensive)
  search: { maxRequests: 60, windowMs: 60 * 1000 },

  // Data-heavy endpoints: 30 requests/minute
  heavy: { maxRequests: 30, windowMs: 60 * 1000 },

  // Admin endpoints: 10 requests/minute
  admin: { maxRequests: 10, windowMs: 60 * 1000 },

  // Lenient for static/cached data: 200 requests/minute
  cached: { maxRequests: 200, windowMs: 60 * 1000 }
};

export default withRateLimit;
