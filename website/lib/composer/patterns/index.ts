/**
 * Pattern Library
 * 
 * Exports pattern registry and utilities for the page composer.
 */

export {
  getAllPatterns,
  getPatternById,
  getPatternsByCategory,
  getPatternsByTag,
  getPatternsByTags,
  getCategories,
  getRegistryInfo,
  searchPatterns,
  getSimilarPatterns,
  getPatternsByInspiration,
  toSelectorPattern,
  getAllSelectorPatterns,
  getRecommendedPatterns,
  getPatternGuidance,
  patternExists,
} from "./loader";

export type {
  PatternSlot,
  RegistryPattern,
  PatternRegistry,
} from "./loader";

