/**
 * Rate limiting middleware for PFAS-Free Kitchen Platform API
 * STUB: Implement Redis-backed rate limiting in production
 */

import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors/AppError.js';
import { hashIp } from '../utils/hash.js';
import { logger } from '../config/logger.js';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store for development - replace with Redis in production
const rateLimitStore = new Map<string, RateLimitRecord>();

// Default rate limit configurations
export const RATE_LIMITS = {
  // Public endpoints
  public: { windowMs: 60_000, maxRequests: 100, keyPrefix: 'pub' },
  // Search endpoints (higher limit)
  search: { windowMs: 60_000, maxRequests: 60, keyPrefix: 'search' },
  // Report submission (stricter)
  reports: { windowMs: 3600_000, maxRequests: 10, keyPrefix: 'report' },
  // Admin endpoints
  admin: { windowMs: 60_000, maxRequests: 200, keyPrefix: 'admin' },
  // Affiliate clicks (moderate)
  clicks: { windowMs: 60_000, maxRequests: 30, keyPrefix: 'click' },
} as const;

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredEntries, 60_000);

/**
 * Get rate limit key for request
 */
function getRateLimitKey(req: Request, prefix: string): string {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const hashedIp = hashIp(ip);
  return `${prefix}:${hashedIp}`;
}

/**
 * Create rate limiting middleware with specified config
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyPrefix = 'default' } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = getRateLimitKey(req, keyPrefix);
    const now = Date.now();

    let record = rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!record || record.resetAt < now) {
      record = {
        count: 0,
        resetAt: now + windowMs,
      };
    }

    record.count++;
    rateLimitStore.set(key, record);

    // Calculate remaining requests
    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    // Check if over limit
    if (record.count > maxRequests) {
      logger.warn({
        requestId: req.requestId,
        key,
        count: record.count,
        limit: maxRequests,
        resetIn: resetSeconds,
      }, 'Rate limit exceeded');

      res.setHeader('Retry-After', resetSeconds);
      return next(new RateLimitError(
        `Rate limit exceeded. Try again in ${resetSeconds} seconds.`,
        resetSeconds
      ));
    }

    next();
  };
}

/**
 * Pre-configured rate limiters
 */
export const publicRateLimit = rateLimit(RATE_LIMITS.public);
export const searchRateLimit = rateLimit(RATE_LIMITS.search);
export const reportRateLimit = rateLimit(RATE_LIMITS.reports);
export const adminRateLimit = rateLimit(RATE_LIMITS.admin);
export const clickRateLimit = rateLimit(RATE_LIMITS.clicks);
