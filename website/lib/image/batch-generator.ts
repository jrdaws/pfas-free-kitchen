/**
 * Batch Image Generator
 * 
 * Generates images for all slots in a composition using the Replicate API.
 * Handles concurrency limits, caching, and error recovery.
 */

import Replicate from "replicate";
import {
  type ImageSlot,
  detectImageSlots,
  filterSlotsNeedingGeneration,
  groupSlotsByPriority,
} from "./slot-detector";
import {
  buildImagePrompt,
  getRecommendedModelTier,
  type VisionContext,
  type StyleContext,
} from "./prompt-builder";
import type { ProjectComposition } from "@/lib/composer/types";

// Model IDs for different quality tiers
const MODEL_TIERS = {
  fast: "black-forest-labs/flux-schnell",
  balanced: "black-forest-labs/flux-dev",
  quality: "black-forest-labs/flux-1.1-pro",
} as const;

export type ModelTier = keyof typeof MODEL_TIERS;

export interface BatchGenerationOptions {
  maxConcurrent?: number;
  skipLowPriority?: boolean;
  modelTier?: ModelTier;
  onProgress?: (progress: GenerationProgress) => void;
}

export interface GenerationProgress {
  total: number;
  completed: number;
  cached: number;
  failed: number;
  currentSlot?: string;
}

export interface BatchGenerationResult {
  images: Map<string, string>;
  timing: {
    total: number;
    cached: number;
    generated: number;
    avgPerImage: number;
  };
  errors: Array<{ slotKey: string; error: string }>;
  stats: {
    total: number;
    generated: number;
    cached: number;
    failed: number;
  };
}

// In-memory cache for server-side (same session)
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Generate hash for caching
 */
function hashPrompt(prompt: string, style: string, aspectRatio: string): string {
  const key = `${prompt}-${style}-${aspectRatio}`;
  // Simple hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `img_${Math.abs(hash).toString(36)}`;
}

/**
 * Check cache for existing image
 */
function getCachedImage(hash: string): string | null {
  const cached = imageCache.get(hash);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    imageCache.delete(hash);
    return null;
  }
  
  return cached.url;
}

/**
 * Cache a generated image
 */
function cacheImage(hash: string, url: string): void {
  imageCache.set(hash, { url, timestamp: Date.now() });
}

/**
 * Registry pattern type (minimal for detection)
 */
interface RegistryPattern {
  id: string;
  category: string;
  slots: Array<{
    name: string;
    type: string;
    required?: boolean;
    aspectRatio?: string;
  }>;
}

/**
 * Generate images for all slots in a composition
 */
export async function generateCompositionImages(
  composition: ProjectComposition,
  patterns: RegistryPattern[],
  vision: VisionContext,
  styleContext: StyleContext,
  options: BatchGenerationOptions = {}
): Promise<BatchGenerationResult> {
  const startTime = Date.now();
  const {
    maxConcurrent = 3,
    skipLowPriority = false,
    modelTier = "balanced",
    onProgress,
  } = options;

  // Check for API token
  if (!process.env.REPLICATE_API_TOKEN) {
    console.warn("[ImageGenerator] No REPLICATE_API_TOKEN - using placeholders");
    return {
      images: new Map(),
      timing: { total: 0, cached: 0, generated: 0, avgPerImage: 0 },
      errors: [{ slotKey: "all", error: "No API token configured" }],
      stats: { total: 0, generated: 0, cached: 0, failed: 0 },
    };
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  // Detect all image slots
  let slots = detectImageSlots(composition, patterns);
  
  // Filter to only slots needing generation
  slots = filterSlotsNeedingGeneration(slots);

  if (skipLowPriority) {
    slots = slots.filter((s) => s.priority !== "low");
  }

  const images = new Map<string, string>();
  const errors: BatchGenerationResult["errors"] = [];
  let cachedCount = 0;
  let generatedCount = 0;

  const progress: GenerationProgress = {
    total: slots.length,
    completed: 0,
    cached: 0,
    failed: 0,
  };

  // Group by priority for reporting
  const groupedSlots = groupSlotsByPriority(slots);
  console.log(
    `[ImageGenerator] Processing ${slots.length} slots ` +
      `(${groupedSlots.high.length} high, ${groupedSlots.medium.length} medium, ${groupedSlots.low.length} low)`
  );

  // Process in batches with concurrency limit
  for (let i = 0; i < slots.length; i += maxConcurrent) {
    const batch = slots.slice(i, i + maxConcurrent);

    const results = await Promise.allSettled(
      batch.map(async (slot) => {
        const slotKey = `${slot.pageId}-${slot.patternId}-${slot.slotName}`;
        progress.currentSlot = slotKey;
        onProgress?.(progress);

        // Build prompt
        const generated = buildImagePrompt({
          slot,
          vision,
          style: styleContext,
        });

        // Check cache
        const hash = hashPrompt(
          generated.prompt,
          generated.style,
          generated.aspectRatio
        );
        const cached = getCachedImage(hash);

        if (cached) {
          cachedCount++;
          progress.cached++;
          return { slotKey, url: cached, cached: true };
        }

        // Determine model tier based on slot priority or override
        const tier = modelTier !== "balanced" ? modelTier : getRecommendedModelTier(slot.priority);
        const model = MODEL_TIERS[tier];

        // Generate image
        try {
          const output = await replicate.run(model, {
            input: {
              prompt: generated.prompt,
              aspect_ratio: generated.aspectRatio,
              output_format: "webp",
              output_quality: 80,
            },
          });

          // Extract URL from output
          let imageUrl: string;
          if (Array.isArray(output)) {
            imageUrl = output[0] as string;
          } else if (typeof output === "string") {
            imageUrl = output;
          } else {
            throw new Error("Unexpected output format from Replicate");
          }

          // Cache the result
          cacheImage(hash, imageUrl);
          generatedCount++;

          return { slotKey, url: imageUrl, cached: false };
        } catch (error) {
          throw new Error(
            `Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      })
    );

    // Process results
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const slot = batch[j];
      const slotKey = `${slot.pageId}-${slot.patternId}-${slot.slotName}`;

      progress.completed++;

      if (result.status === "fulfilled") {
        images.set(slotKey, result.value.url);
      } else {
        progress.failed++;
        errors.push({
          slotKey,
          error: result.reason?.message || "Unknown error",
        });
        // Use placeholder on failure
        images.set(slotKey, getPlaceholderUrl(slot.context.aspectRatio));
      }

      onProgress?.(progress);
    }
  }

  const totalTime = Date.now() - startTime;

  return {
    images,
    timing: {
      total: totalTime,
      cached: cachedCount,
      generated: generatedCount,
      avgPerImage: generatedCount > 0 ? totalTime / generatedCount : 0,
    },
    errors,
    stats: {
      total: slots.length,
      generated: generatedCount,
      cached: cachedCount,
      failed: errors.length,
    },
  };
}

/**
 * Generate a single image for a specific slot
 */
export async function generateSingleImage(
  slot: ImageSlot,
  vision: VisionContext,
  styleContext: StyleContext,
  modelTier: ModelTier = "balanced"
): Promise<{ url: string; cached: boolean } | { error: string }> {
  if (!process.env.REPLICATE_API_TOKEN) {
    return { error: "No API token configured" };
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  const generated = buildImagePrompt({ slot, vision, style: styleContext });
  const hash = hashPrompt(generated.prompt, generated.style, generated.aspectRatio);

  // Check cache
  const cached = getCachedImage(hash);
  if (cached) {
    return { url: cached, cached: true };
  }

  try {
    const model = MODEL_TIERS[modelTier];
    const output = await replicate.run(model, {
      input: {
        prompt: generated.prompt,
        aspect_ratio: generated.aspectRatio,
        output_format: "webp",
        output_quality: 80,
      },
    });

    const imageUrl = Array.isArray(output) ? output[0] : output;
    if (typeof imageUrl !== "string") {
      return { error: "Invalid output format" };
    }

    cacheImage(hash, imageUrl);
    return { url: imageUrl, cached: false };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

/**
 * Get placeholder URL for a given aspect ratio
 */
function getPlaceholderUrl(aspectRatio: string): string {
  const dimensions: Record<string, { w: number; h: number }> = {
    "1:1": { w: 512, h: 512 },
    "16:9": { w: 1344, h: 768 },
    "4:3": { w: 800, h: 600 },
    "3:2": { w: 900, h: 600 },
    "21:9": { w: 1680, h: 720 },
    "9:16": { w: 768, h: 1344 },
  };

  const { w, h } = dimensions[aspectRatio] || { w: 800, h: 600 };
  return `https://placehold.co/${w}x${h}/1e293b/6366f1?text=Image`;
}

/**
 * Get cache statistics
 */
export function getImageCacheStats(): {
  size: number;
  entries: number;
} {
  return {
    size: imageCache.size,
    entries: imageCache.size,
  };
}

/**
 * Clear the image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
}

