/**
 * Image Generation Module
 * 
 * Provides utilities for detecting image slots in compositions,
 * generating AI images, and injecting them into section props.
 */

// Slot Detection
export {
  detectImageSlots,
  filterSlotsNeedingGeneration,
  groupSlotsByPriority,
  slotNeedsImage,
  getImageSlotStats,
  type ImageSlot,
  type ImageContext,
  type AspectRatio,
  type ImageStyle,
  type SectionType,
} from "./slot-detector";

// Prompt Building
export {
  buildImagePrompt,
  buildSimplePrompt,
  getRecommendedModelTier,
  type VisionContext,
  type StyleContext,
  type PromptContext,
  type GeneratedPrompt,
} from "./prompt-builder";

// Batch Generation
export {
  generateCompositionImages,
  generateSingleImage,
  getImageCacheStats,
  clearImageCache,
  type ModelTier,
  type BatchGenerationOptions,
  type BatchGenerationResult,
  type GenerationProgress,
} from "./batch-generator";

// Props Injection
export {
  injectImageProps,
  createPlaceholderMap,
  countImageSlots,
  mergeCompositionImages,
} from "./props-injector";

