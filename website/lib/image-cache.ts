/**
 * Image Cache
 * 
 * Caches generated images to avoid redundant API calls.
 * Uses in-memory cache for the session.
 */

// In-memory cache for generated images
const IMAGE_CACHE = new Map<string, CachedImage>();

interface CachedImage {
  url: string;
  prompt: string;
  createdAt: number;
  expiresAt: number;
}

// Cache expiry in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Generate a hash for a prompt to use as cache key
 */
export function hashPrompt(prompt: string, style?: string, aspectRatio?: string): string {
  const key = `${prompt}-${style || "default"}-${aspectRatio || "16:9"}`;
  // Simple hash using btoa (base64)
  try {
    return btoa(key).substring(0, 32);
  } catch {
    // Fallback for non-ASCII characters
    return key.replace(/[^a-zA-Z0-9]/g, "").substring(0, 32);
  }
}

/**
 * Get a cached image if it exists and hasn't expired
 */
export function getCachedImage(promptHash: string): string | null {
  const cached = IMAGE_CACHE.get(promptHash);
  
  if (!cached) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > cached.expiresAt) {
    IMAGE_CACHE.delete(promptHash);
    return null;
  }
  
  return cached.url;
}

/**
 * Cache a generated image
 */
export function cacheImage(
  promptHash: string, 
  url: string, 
  prompt: string
): void {
  IMAGE_CACHE.set(promptHash, {
    url,
    prompt,
    createdAt: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
  });
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
  IMAGE_CACHE.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: IMAGE_CACHE.size,
    entries: Array.from(IMAGE_CACHE.keys()),
  };
}

/**
 * Generate image with caching
 */
export async function generateImageWithCache(params: {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  colorPalette?: string[];
}): Promise<string | null> {
  const { prompt, style, aspectRatio, colorPalette } = params;
  const hash = hashPrompt(prompt, style, aspectRatio);
  
  // Check cache first
  const cached = getCachedImage(hash);
  if (cached) {
    console.log("[ImageCache] Cache hit for:", prompt.substring(0, 30) + "...");
    return cached;
  }
  
  // Generate new image
  try {
    const response = await fetch("/api/generate/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style, aspectRatio, colorPalette }),
    });
    
    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      cacheImage(hash, data.imageUrl, prompt);
      return data.imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error("[ImageCache] Generation failed:", error);
    return null;
  }
}
