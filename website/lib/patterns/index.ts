/**
 * Pattern Library
 * 
 * Main entry point for the pattern system.
 * Exports all types, registry, pattern components, and utilities.
 */

// Types
export * from "./types";

// Registry
export { 
  patternRegistry,
  getPattern,
  getByCategory,
  searchPatterns,
  getAllPatternIds,
  getAllCategories,
} from "./registry";

// Converters (ConfiguratorState ↔ ProjectDefinition)
export {
  configStateToDefinition,
  definitionToConfigState,
  analysisToDefinition,
} from "./converters";

// Builder (fluent API for ProjectDefinition)
export { DefinitionBuilder } from "./definition-builder";

// Validation
export {
  validateDefinition,
  validateSection,
  validateBranding,
  validatePage,
  isValidForPreview,
  isValidForExport,
  suggestFixes,
  type ValidationResult,
} from "./validation";

// Pattern Migration (for swapping patterns)
export {
  migratePatternProps,
  duplicateSection,
  generateSectionId,
} from "./pattern-migration";

// Hero patterns
export {
  HeroCenteredGradient,
  HeroSplitImage,
  HeroVideoBackground,
  HeroAnimatedText,
  HeroSimpleCentered,
} from "./patterns/heroes";

// Feature patterns
export {
  FeaturesIconGrid,
  FeaturesBentoGrid,
  FeaturesAlternatingRows,
  FeaturesComparisonTable,
  FeaturesCards,
} from "./patterns/features";

// Social proof patterns
export {
  LogoWall,
  TestimonialCards,
} from "./patterns/social-proof";

// Pricing patterns
export { PricingTable3Tier } from "./patterns/pricing";

// CTA patterns
export { CTASection } from "./patterns/cta";

// FAQ patterns
export { FAQAccordion } from "./patterns/faq";

// Image generation for patterns
export {
  generatePatternImages,
  generateCompositionSectionImages,
  getPatternImageConfig,
  patternNeedsImages,
  getPatternsNeedingImages,
  getImageGenerationStats,
  type ImageGenerationContext,
  type PatternImageGenerationResult,
  type GeneratedImageResult,
} from "./image-generator";
