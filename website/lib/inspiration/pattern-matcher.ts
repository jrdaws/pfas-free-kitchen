import {
  DetectedSection,
  PatternMapping,
  Pattern,
  SectionType,
} from "./types"

// Default pattern library - in production, load from registry
const DEFAULT_PATTERNS: Pattern[] = [
  // Hero patterns
  { id: "hero-centered", name: "Centered Hero", category: "hero", tags: ["centered", "minimal"], hasImage: false, hasVideo: false },
  { id: "hero-split-image", name: "Split Image Hero", category: "hero", tags: ["split", "image"], hasImage: true, hasVideo: false },
  { id: "hero-video-bg", name: "Video Background Hero", category: "hero", tags: ["video", "immersive"], hasImage: false, hasVideo: true },
  { id: "hero-with-cards", name: "Hero with Cards", category: "hero", tags: ["cards", "grid"], hasImage: true, hasVideo: false, columnCount: 3 },
  { id: "hero-gradient", name: "Gradient Hero", category: "hero", tags: ["gradient", "bold"], hasImage: false, hasVideo: false },

  // Features patterns
  { id: "features-grid", name: "Features Grid", category: "features", tags: ["grid", "cards"], hasImage: true, hasVideo: false, columnCount: 3 },
  { id: "features-alternating", name: "Alternating Features", category: "features", tags: ["alternating", "split"], hasImage: true, hasVideo: false, columnCount: 2 },
  { id: "features-centered", name: "Centered Features", category: "features", tags: ["centered", "list"], hasImage: false, hasVideo: false },
  { id: "features-bento", name: "Bento Grid Features", category: "features", tags: ["bento", "asymmetric"], hasImage: true, hasVideo: false, columnCount: 4 },
  { id: "features-icons", name: "Icon Features", category: "features", tags: ["icons", "minimal"], hasImage: false, hasVideo: false, columnCount: 4 },

  // Pricing patterns
  { id: "pricing-cards", name: "Pricing Cards", category: "pricing", tags: ["cards", "tiers"], hasImage: false, hasVideo: false, columnCount: 3 },
  { id: "pricing-table", name: "Pricing Table", category: "pricing", tags: ["table", "comparison"], hasImage: false, hasVideo: false },
  { id: "pricing-toggle", name: "Toggle Pricing", category: "pricing", tags: ["toggle", "monthly-annual"], hasImage: false, hasVideo: false, columnCount: 3 },

  // Testimonials patterns
  { id: "testimonials-carousel", name: "Testimonials Carousel", category: "testimonials", tags: ["carousel", "slider"], hasImage: true, hasVideo: false },
  { id: "testimonials-grid", name: "Testimonials Grid", category: "testimonials", tags: ["grid", "cards"], hasImage: true, hasVideo: false, columnCount: 3 },
  { id: "testimonials-single", name: "Single Testimonial", category: "testimonials", tags: ["single", "featured"], hasImage: true, hasVideo: false },
  { id: "testimonials-wall", name: "Testimonials Wall", category: "testimonials", tags: ["wall", "masonry"], hasImage: true, hasVideo: false, columnCount: 4 },

  // CTA patterns
  { id: "cta-centered", name: "Centered CTA", category: "cta", tags: ["centered", "simple"], hasImage: false, hasVideo: false },
  { id: "cta-split", name: "Split CTA", category: "cta", tags: ["split", "image"], hasImage: true, hasVideo: false },
  { id: "cta-gradient", name: "Gradient CTA", category: "cta", tags: ["gradient", "bold"], hasImage: false, hasVideo: false },

  // FAQ patterns
  { id: "faq-accordion", name: "FAQ Accordion", category: "faq", tags: ["accordion", "expandable"], hasImage: false, hasVideo: false },
  { id: "faq-grid", name: "FAQ Grid", category: "faq", tags: ["grid", "cards"], hasImage: false, hasVideo: false, columnCount: 2 },

  // Footer patterns
  { id: "footer-columns", name: "Column Footer", category: "footer", tags: ["columns", "links"], hasImage: false, hasVideo: false, columnCount: 4 },
  { id: "footer-minimal", name: "Minimal Footer", category: "footer", tags: ["minimal", "centered"], hasImage: false, hasVideo: false },
  { id: "footer-mega", name: "Mega Footer", category: "footer", tags: ["mega", "comprehensive"], hasImage: false, hasVideo: false, columnCount: 5 },

  // Stats patterns
  { id: "stats-row", name: "Stats Row", category: "stats", tags: ["row", "numbers"], hasImage: false, hasVideo: false, columnCount: 4 },
  { id: "stats-cards", name: "Stats Cards", category: "stats", tags: ["cards", "animated"], hasImage: false, hasVideo: false, columnCount: 3 },

  // Logos patterns
  { id: "logos-row", name: "Logos Row", category: "logos", tags: ["row", "simple"], hasImage: true, hasVideo: false },
  { id: "logos-carousel", name: "Logos Carousel", category: "logos", tags: ["carousel", "animated"], hasImage: true, hasVideo: false },

  // Team patterns
  { id: "team-grid", name: "Team Grid", category: "team", tags: ["grid", "photos"], hasImage: true, hasVideo: false, columnCount: 4 },
  { id: "team-cards", name: "Team Cards", category: "team", tags: ["cards", "detailed"], hasImage: true, hasVideo: false, columnCount: 3 },

  // How it works patterns
  { id: "how-it-works-steps", name: "Steps", category: "how-it-works", tags: ["steps", "numbered"], hasImage: false, hasVideo: false, columnCount: 3 },
  { id: "how-it-works-timeline", name: "Timeline", category: "how-it-works", tags: ["timeline", "vertical"], hasImage: true, hasVideo: false },

  // Blog patterns
  { id: "blog-grid", name: "Blog Grid", category: "blog", tags: ["grid", "cards"], hasImage: true, hasVideo: false, columnCount: 3 },
  { id: "blog-list", name: "Blog List", category: "blog", tags: ["list", "simple"], hasImage: true, hasVideo: false },

  // Integrations patterns
  { id: "integrations-grid", name: "Integrations Grid", category: "integrations", tags: ["grid", "logos"], hasImage: true, hasVideo: false, columnCount: 4 },
  { id: "integrations-categories", name: "Categorized Integrations", category: "integrations", tags: ["categories", "tabs"], hasImage: true, hasVideo: false },

  // Contact patterns
  { id: "contact-split", name: "Split Contact", category: "contact", tags: ["split", "form"], hasImage: false, hasVideo: false },
  { id: "contact-centered", name: "Centered Contact", category: "contact", tags: ["centered", "simple"], hasImage: false, hasVideo: false },

  // Navigation patterns
  { id: "nav-sticky", name: "Sticky Navigation", category: "navigation", tags: ["sticky", "standard"], hasImage: false, hasVideo: false },
  { id: "nav-transparent", name: "Transparent Navigation", category: "navigation", tags: ["transparent", "overlay"], hasImage: false, hasVideo: false },

  // Product patterns
  { id: "product-showcase", name: "Product Showcase", category: "product", tags: ["showcase", "large"], hasImage: true, hasVideo: false },
  { id: "product-demo", name: "Product Demo", category: "product", tags: ["demo", "interactive"], hasImage: true, hasVideo: true },

  // Gallery patterns
  { id: "gallery-masonry", name: "Masonry Gallery", category: "gallery", tags: ["masonry", "images"], hasImage: true, hasVideo: false },
  { id: "gallery-grid", name: "Grid Gallery", category: "gallery", tags: ["grid", "uniform"], hasImage: true, hasVideo: false, columnCount: 4 },
]

/**
 * Match detected sections to patterns from our library
 */
export function matchSectionsToPatterns(
  sections: DetectedSection[],
  patterns: Pattern[] = DEFAULT_PATTERNS
): PatternMapping[] {
  return sections.map((section, index) => {
    const mapping = findBestPattern(section, patterns)
    return {
      sectionIndex: index,
      ...mapping,
    }
  })
}

/**
 * Find the best matching pattern for a section
 */
function findBestPattern(
  section: DetectedSection,
  patterns: Pattern[]
): Omit<PatternMapping, "sectionIndex"> {
  // Filter to matching category
  const categoryPatterns = patterns.filter((p) => p.category === section.type)

  if (categoryPatterns.length === 0) {
    return {
      patternId: `generic-${section.type}`,
      variant: determineVariant(section),
      confidence: 0.3,
      alternativePatterns: [],
      source: "fallback",
    }
  }

  // Score each pattern
  const scored = categoryPatterns.map((pattern) => ({
    pattern,
    score: calculatePatternScore(section, pattern),
  }))

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  const best = scored[0]
  const alternatives = scored.slice(1, 4).map((s) => s.pattern.id)

  return {
    patternId: best.pattern.id,
    variant: determineVariant(section),
    confidence: Math.min(best.score * section.confidence, 1),
    alternativePatterns: alternatives,
    source: best.score >= 0.8 ? "exact" : best.score >= 0.5 ? "similar" : "fallback",
  }
}

/**
 * Calculate how well a pattern matches a section
 */
function calculatePatternScore(section: DetectedSection, pattern: Pattern): number {
  let score = 0.5 // Base score for category match

  // Image match
  if (section.hasImage === pattern.hasImage) {
    score += 0.15
  } else if (section.hasImage && !pattern.hasImage) {
    score -= 0.1 // Section has image but pattern doesn't
  }

  // Video match
  if (section.hasVideo === pattern.hasVideo) {
    score += 0.1
  }

  // Column count match
  if (section.columnCount && pattern.columnCount) {
    if (section.columnCount === pattern.columnCount) {
      score += 0.2
    } else if (Math.abs(section.columnCount - pattern.columnCount) === 1) {
      score += 0.1 // Close match
    }
  }

  // Height-based tag matching
  if (section.heightRatio > 0.7) {
    // Large section - prefer "large", "immersive", "featured"
    if (pattern.tags.some((t) => ["large", "immersive", "featured", "full"].includes(t))) {
      score += 0.1
    }
  } else if (section.heightRatio < 0.3) {
    // Small section - prefer "minimal", "simple", "compact"
    if (pattern.tags.some((t) => ["minimal", "simple", "compact", "row"].includes(t))) {
      score += 0.1
    }
  }

  // Text content heuristics
  if (section.textContent) {
    const lowerText = section.textContent.toLowerCase()

    // Check for specific patterns
    if (lowerText.includes("grid") && pattern.tags.includes("grid")) {
      score += 0.1
    }
    if (lowerText.includes("carousel") && pattern.tags.includes("carousel")) {
      score += 0.1
    }
    if (lowerText.includes("step") && pattern.tags.includes("steps")) {
      score += 0.1
    }
  }

  return Math.min(score, 1)
}

/**
 * Determine variant (light/dark/gradient) from section
 */
function determineVariant(section: DetectedSection): "light" | "dark" | "gradient" {
  // Default based on common patterns
  const darkSections: SectionType[] = ["hero", "cta", "footer", "testimonials"]

  if (darkSections.includes(section.type)) {
    return "dark"
  }

  // Higher in page = more likely gradient
  if (section.order === 1 && section.type === "hero") {
    return "gradient"
  }

  return "light"
}

/**
 * Get patterns for a specific category
 */
export function getPatternsForCategory(
  category: SectionType,
  patterns: Pattern[] = DEFAULT_PATTERNS
): Pattern[] {
  return patterns.filter((p) => p.category === category)
}

/**
 * Get all available patterns
 */
export function getAllPatterns(): Pattern[] {
  return DEFAULT_PATTERNS
}

/**
 * Find a pattern by ID
 */
export function getPatternById(
  id: string,
  patterns: Pattern[] = DEFAULT_PATTERNS
): Pattern | undefined {
  return patterns.find((p) => p.id === id)
}

