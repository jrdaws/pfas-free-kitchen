/**
 * Pattern Library
 * 
 * Main entry point for the pattern system.
 * Exports all types, registry, and pattern components.
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

