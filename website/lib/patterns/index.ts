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

