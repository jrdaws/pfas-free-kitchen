// Types for Inspiration → Layout Mapping System

export type SectionType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "faq"
  | "cta"
  | "footer"
  | "navigation"
  | "stats"
  | "team"
  | "blog"
  | "product"
  | "how-it-works"
  | "integrations"
  | "logos"
  | "gallery"
  | "contact"
  | "unknown"

export interface DetectedSection {
  type: SectionType
  order: number // Position on page (1-based)
  heightRatio: number // Approximate height (0-1 of viewport)
  hasImage: boolean
  hasVideo: boolean
  columnCount?: number // For grids
  textContent?: string // Key text snippets
  confidence: number // 0-1
}

export interface PatternMapping {
  sectionIndex: number // Which detected section
  patternId: string // Our pattern ID
  variant: "light" | "dark" | "gradient"
  confidence: number // 0-1
  alternativePatterns: string[] // Other possible matches
  source: "exact" | "similar" | "fallback"
}

export interface ExtractedColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  muted?: string
  confidence: number
}

export interface ExtractedTypography {
  headingFont: string
  bodyFont: string
  headingSizes: {
    h1: string
    h2: string
    h3: string
  }
  fontWeight: "light" | "normal" | "bold"
  letterSpacing: "tight" | "normal" | "wide"
  confidence: number
}

export interface ExtractedSpacing {
  sectionPadding: string
  elementGap: string
  containerWidth: "narrow" | "standard" | "wide" | "full"
  confidence: number
}

export interface ExtractedStyles {
  colors: ExtractedColors
  typography: ExtractedTypography
  spacing: ExtractedSpacing
  borderRadius: "none" | "sm" | "md" | "lg" | "full"
  shadows: "none" | "subtle" | "medium" | "dramatic"
  animations: "none" | "subtle" | "rich"
}

export interface LayoutInfo {
  type: "marketing" | "dashboard" | "blog" | "ecommerce" | "portfolio"
  navigation: "fixed" | "transparent" | "sidebar" | "minimal"
  contentWidth: "narrow" | "standard" | "wide" | "full"
}

export interface InspirationComposition {
  sections: PatternMapping[]
  styles: ExtractedStyles
  layout: LayoutInfo
  detectedSections: DetectedSection[]
  metadata: {
    sourceUrl: string
    analysisTime: number
    overallConfidence: number
  }
}

export interface AnalysisInput {
  url: string
  html?: string
  css?: string
  screenshot?: string // Base64 or URL
}

export interface MergedAnalysis {
  sections: DetectedSection[]
  styles: ExtractedStyles
  layout: LayoutInfo
}

// Pattern type from our pattern library
export interface Pattern {
  id: string
  name: string
  category: SectionType
  tags: string[]
  hasImage: boolean
  hasVideo: boolean
  columnCount?: number
  inspirationSources?: string[]
  component?: string
}

// Section indicators for HTML parsing
export const SECTION_INDICATORS: Record<SectionType, string[]> = {
  hero: ["hero", "banner", "welcome", "jumbotron", "landing", "headline"],
  features: ["features", "benefits", "capabilities", "why-", "advantages"],
  pricing: ["pricing", "plans", "price", "tier", "subscription", "packages"],
  testimonials: ["testimonials", "reviews", "customers", "quotes", "social-proof"],
  faq: ["faq", "questions", "help", "accordion", "support"],
  cta: ["cta", "signup", "get-started", "trial", "action", "convert"],
  footer: ["footer", "site-footer", "bottom"],
  navigation: ["nav", "header", "menu", "navbar"],
  stats: ["stats", "numbers", "metrics", "achievements", "counter"],
  team: ["team", "about-us", "people", "leadership", "founders"],
  blog: ["blog", "posts", "articles", "news", "updates"],
  product: ["product", "showcase", "demo", "preview"],
  "how-it-works": ["how-it-works", "process", "steps", "workflow"],
  integrations: ["integrations", "partners", "connect", "apps"],
  logos: ["logos", "clients", "trusted", "companies", "brands"],
  gallery: ["gallery", "portfolio", "showcase", "images"],
  contact: ["contact", "get-in-touch", "reach-us"],
  unknown: [],
}

