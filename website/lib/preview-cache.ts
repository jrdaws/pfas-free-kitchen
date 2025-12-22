/**
 * Preview Cache Layer
 *
 * Provides a unified caching interface with Redis support and in-memory fallback.
 * Separates caching concerns from business logic in the preview generation API.
 */

import { Redis } from "@upstash/redis";

export interface CacheEntry {
  html: string;
  components: string[];
  generatedAt: string;
  expiresAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  redis?: Redis | null;
}

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

// In-memory fallback cache
const memoryCache = new Map<string, CacheEntry>();

/**
 * Preview Cache Manager
 *
 * Provides caching with Redis (production) and in-memory (development) fallback.
 */
export class PreviewCache {
  private redis: Redis | null;
  private ttl: number;

  constructor(options: CacheOptions = {}) {
    this.redis = options.redis || null;
    this.ttl = options.ttl || DEFAULT_TTL;
  }

  /**
   * Get a cached preview by key
   */
  async get(key: string): Promise<CacheEntry | null> {
    // Try Redis first (if available)
    if (this.redis) {
      try {
        const cached = await this.redis.get<CacheEntry>(key);
        if (cached && cached.expiresAt > Date.now()) {
          console.log(`[Preview Cache] Redis hit: ${key}`);
          return cached;
        }
      } catch (error) {
        console.error("[Preview Cache] Redis get failed:", error);
        // Fall through to memory cache
      }
    }

    // Fallback to in-memory cache
    const memoryCached = memoryCache.get(key);
    if (memoryCached && memoryCached.expiresAt > Date.now()) {
      console.log(`[Preview Cache] Memory hit: ${key}`);
      return memoryCached;
    }

    // Clean up expired entry
    if (memoryCached) {
      memoryCache.delete(key);
    }

    console.log(`[Preview Cache] Miss: ${key}`);
    return null;
  }

  /**
   * Set a cached preview
   */
  async set(key: string, entry: Omit<CacheEntry, "expiresAt">): Promise<void> {
    const cacheEntry: CacheEntry = {
      ...entry,
      expiresAt: Date.now() + this.ttl,
    };

    // Try Redis first (if available)
    if (this.redis) {
      try {
        await this.redis.setex(key, Math.floor(this.ttl / 1000), cacheEntry);
        console.log(`[Preview Cache] Redis set: ${key} (TTL: ${this.ttl}ms)`);
      } catch (error) {
        console.error("[Preview Cache] Redis set failed:", error);
        // Fall through to memory cache
      }
    }

    // Always set in memory as fallback
    memoryCache.set(key, cacheEntry);
    console.log(`[Preview Cache] Memory set: ${key}`);
  }

  /**
   * Invalidate a cached preview
   */
  async invalidate(key: string): Promise<void> {
    // Remove from Redis
    if (this.redis) {
      try {
        await this.redis.del(key);
        console.log(`[Preview Cache] Redis invalidate: ${key}`);
      } catch (error) {
        console.error("[Preview Cache] Redis invalidate failed:", error);
      }
    }

    // Remove from memory
    memoryCache.delete(key);
    console.log(`[Preview Cache] Memory invalidate: ${key}`);
  }

  /**
   * Clear all cached previews
   * Warning: Only clears memory cache, not Redis
   */
  clearMemory(): void {
    memoryCache.clear();
    console.log("[Preview Cache] Memory cache cleared");
  }

  /**
   * Clean up expired entries from memory cache
   */
  cleanupExpired(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt < now) {
        memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Preview Cache] Cleaned ${cleaned} expired entries`);
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memorySize: number;
    redisAvailable: boolean;
    ttl: number;
  } {
    return {
      memorySize: memoryCache.size,
      redisAvailable: this.redis !== null,
      ttl: this.ttl,
    };
  }
}

/**
 * Create a singleton preview cache instance
 * Uses environment variables to configure Redis
 */
export function createPreviewCache(): PreviewCache {
  let redis: Redis | null = null;

  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log("[Preview Cache] Redis initialized");
    } else {
      console.log("[Preview Cache] Redis not configured, using memory cache");
    }
  } catch (error) {
    console.error("[Preview Cache] Redis initialization failed:", error);
    redis = null;
  }

  return new PreviewCache({
    redis,
    ttl: DEFAULT_TTL,
  });
}

// Global cache instance
let globalCache: PreviewCache | null = null;

/**
 * Get the global preview cache instance
 */
export function getPreviewCache(): PreviewCache {
  if (!globalCache) {
    globalCache = createPreviewCache();
  }
  return globalCache;
}

/**
 * Reset the global cache instance (useful for testing)
 */
export function resetPreviewCache(): void {
  if (globalCache) {
    globalCache.clearMemory();
  }
  globalCache = null;
}
