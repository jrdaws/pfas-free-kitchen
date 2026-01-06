import {
  InspirationComposition,
  LayoutInfo,
  DetectedSection,
  ExtractedStyles,
  MergedAnalysis,
  Pattern,
  AnalysisInput,
  SectionType,
} from "./types"
import { detectSections } from "./section-detector"
import { matchSectionsToPatterns, getAllPatterns } from "./pattern-matcher"
import { extractStyles } from "./style-extractor"

interface AnalysisResult {
  url: string
  sections: DetectedSection[]
  styles: ExtractedStyles
  timestamp: number
}

/**
 * Compose a full layout from inspiration URL(s)
 * This is the main entry point for inspiration-driven composition
 */
export async function composeFromInspiration(
  inspirationUrls: string[],
  patterns: Pattern[] = getAllPatterns()
): Promise<InspirationComposition> {
  const startTime = Date.now()

  // Analyze each URL in parallel
  const analyses = await Promise.all(
    inspirationUrls.map((url) => analyzeInspiration(url))
  )

  // Filter out failed analyses
  const validAnalyses = analyses.filter(
    (a): a is AnalysisResult => a !== null && a.sections.length > 0
  )

  if (validAnalyses.length === 0) {
    throw new Error("No valid analyses from inspiration URLs")
  }

  // Merge results from multiple URLs
  const merged = mergeAnalyses(validAnalyses)

  // Match detected sections to our pattern library
  const patternMappings = matchSectionsToPatterns(merged.sections, patterns)

  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence(patternMappings, merged.styles)

  return {
    sections: patternMappings,
    styles: merged.styles,
    layout: merged.layout,
    detectedSections: merged.sections,
    metadata: {
      sourceUrl: inspirationUrls[0],
      analysisTime: Date.now() - startTime,
      overallConfidence,
    },
  }
}

/**
 * Analyze a single inspiration URL
 */
async function analyzeInspiration(url: string): Promise<AnalysisResult | null> {
  try {
    // For now, we'll use URL as input and let detectors handle fetching
    // In production, this would fetch HTML/CSS/screenshot via Firecrawl
    const input: AnalysisInput = { url }

    // Detect sections
    const sections = await detectSections(input)

    // Extract styles
    const styles = await extractStyles(input)

    return {
      url,
      sections,
      styles,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`[LayoutComposer] Failed to analyze ${url}:`, error)
    return null
  }
}

/**
 * Merge analyses from multiple URLs
 * Primary URL takes precedence
 */
function mergeAnalyses(analyses: AnalysisResult[]): MergedAnalysis {
  // Primary analysis (first URL)
  const primary = analyses[0]

  // Use primary sections as base
  const sections = primary.sections

  // Merge styles - primary takes precedence for high-confidence values
  const styles = mergeStyleResults(analyses.map((a) => a.styles))

  // Infer layout from sections
  const layout = inferLayout(sections)

  return {
    sections,
    styles,
    layout,
  }
}

/**
 * Merge style results from multiple analyses
 */
function mergeStyleResults(styleResults: ExtractedStyles[]): ExtractedStyles {
  if (styleResults.length === 0) {
    throw new Error("No style results to merge")
  }

  if (styleResults.length === 1) {
    return styleResults[0]
  }

  // Take the result with highest confidence for each category
  const merged = { ...styleResults[0] }

  for (const result of styleResults.slice(1)) {
    if (result.colors.confidence > merged.colors.confidence) {
      merged.colors = result.colors
    }
    if (result.typography.confidence > merged.typography.confidence) {
      merged.typography = result.typography
    }
    if (result.spacing.confidence > merged.spacing.confidence) {
      merged.spacing = result.spacing
    }
  }

  return merged
}

/**
 * Infer layout type from detected sections
 */
function inferLayout(sections: DetectedSection[]): LayoutInfo {
  const sectionTypes = sections.map((s) => s.type)

  // Determine layout type
  let layoutType: LayoutInfo["type"] = "marketing"

  if (sectionTypes.includes("product") || sectionTypes.some((t) => t === "gallery")) {
    if (sectionTypes.includes("pricing")) {
      layoutType = "ecommerce"
    } else {
      layoutType = "portfolio"
    }
  } else if (sectionTypes.includes("blog") && sectionTypes.filter((t) => t === "blog").length > 1) {
    layoutType = "blog"
  } else if (sections.some((s) => s.type === "navigation" && s.columnCount && s.columnCount > 3)) {
    layoutType = "dashboard"
  }

  // Determine navigation style
  let navigation: LayoutInfo["navigation"] = "fixed"
  const navSection = sections.find((s) => s.type === "navigation")
  const heroSection = sections.find((s) => s.type === "hero")

  if (navSection) {
    if (heroSection && heroSection.order === 1 && navSection.order === 1) {
      // Nav overlaps hero
      navigation = "transparent"
    } else if (navSection.heightRatio > 0.15) {
      navigation = "sidebar"
    }
  } else {
    navigation = "minimal"
  }

  // Determine content width
  let contentWidth: LayoutInfo["contentWidth"] = "standard"
  const avgColumnCount =
    sections
      .filter((s) => s.columnCount)
      .reduce((sum, s) => sum + (s.columnCount || 0), 0) /
    sections.filter((s) => s.columnCount).length

  if (avgColumnCount > 3.5) {
    contentWidth = "wide"
  } else if (avgColumnCount < 2) {
    contentWidth = "narrow"
  }

  return {
    type: layoutType,
    navigation,
    contentWidth,
  }
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(
  patternMappings: InspirationComposition["sections"],
  styles: ExtractedStyles
): number {
  // Weight: pattern matching 60%, styles 40%
  const patternConfidence =
    patternMappings.reduce((sum, m) => sum + m.confidence, 0) /
    Math.max(patternMappings.length, 1)

  const styleConfidence =
    (styles.colors.confidence + styles.typography.confidence + styles.spacing.confidence) / 3

  return patternConfidence * 0.6 + styleConfidence * 0.4
}

/**
 * Quick analysis - just sections, no styles (faster)
 */
export async function quickSectionAnalysis(url: string): Promise<DetectedSection[]> {
  return detectSections({ url })
}

/**
 * Get a human-readable summary of the composition
 */
export function summarizeComposition(composition: InspirationComposition): string {
  const { sections, layout, metadata } = composition

  const sectionSummary = sections
    .map((s) => `${s.patternId} (${Math.round(s.confidence * 100)}%)`)
    .join(", ")

  return `
Layout: ${layout.type} with ${layout.navigation} navigation
Sections: ${sectionSummary}
Overall confidence: ${Math.round(metadata.overallConfidence * 100)}%
Analysis time: ${metadata.analysisTime}ms
`.trim()
}

/**
 * Export composition as JSON for debugging
 */
export function exportComposition(composition: InspirationComposition): string {
  return JSON.stringify(composition, null, 2)
}

