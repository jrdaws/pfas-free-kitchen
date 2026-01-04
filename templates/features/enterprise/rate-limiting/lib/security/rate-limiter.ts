/**
 * Rate Limiter
 * 
 * Protect APIs from abuse using Upstash Redis.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limit configurations
export const rateLimiters = {
  // Standard API rate limit: 100 requests per minute
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:standard",
  }),

  // Strict rate limit for auth endpoints: 10 requests per minute
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
  }),

  // Heavy operations: 10 requests per hour
  heavy: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:heavy",
  }),

  // Search/export: 30 requests per minute
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "ratelimit:search",
  }),
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "standard"
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const ratelimiter = rateLimiters[type];
  const result = await ratelimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}

/**
 * Check if request should be rate limited
 */
export async function shouldRateLimit(
  request: Request,
  type: RateLimitType = "standard"
): Promise<{
  limited: boolean;
  headers: Record<string, string>;
}> {
  // Get identifier from IP or auth
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] || "anonymous";

  // Can also use user ID if authenticated
  const authHeader = request.headers.get("authorization");
  const identifier = authHeader || ip;

  const result = await checkRateLimit(identifier, type);

  return {
    limited: !result.success,
    headers: getRateLimitHeaders(result),
  };
}

/**
 * Create rate limited response
 */
export function rateLimitedResponse(
  headers: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    }
  );
}

