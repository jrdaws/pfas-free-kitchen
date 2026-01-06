// Inspiration → Layout Mapping System
// Main entry point

// Types
export * from "./types"

// Core functions
export { detectSections } from "./section-detector"
export {
  matchSectionsToPatterns,
  getPatternsForCategory,
  getAllPatterns,
  getPatternById,
} from "./pattern-matcher"
export { extractStyles } from "./style-extractor"
export {
  composeFromInspiration,
  quickSectionAnalysis,
  summarizeComposition,
  exportComposition,
} from "./layout-composer"

