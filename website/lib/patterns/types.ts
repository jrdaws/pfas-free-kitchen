/**
 * PATTERN SYSTEM TYPES
 * Single source of truth for preview and export
 */

// ============================================
// DESIGN TOKENS
// ============================================

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  card: string;
  destructive: string;
  success: string;
}

export interface FontScheme {
  heading: string;
  body: string;
  mono: string;
}

export interface SpacingScheme {
  containerMax: string;
  sectionPadding: string;
  componentGap: string;
}

export interface BrandingConfig {
  colors: ColorScheme;
  fonts: FontScheme;
  spacing: SpacingScheme;
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  shadowStyle: "none" | "subtle" | "medium" | "dramatic";
}

// ============================================
// PATTERN DEFINITIONS
// ============================================

export type PatternCategory =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "faq"
  | "team"
  | "stats"
  | "logos"
  | "footer"
  | "navigation"
  | "content"
  | "commerce"
  | "dashboard"
  | "auth";

export interface PatternSlot {
  name: string;
  type: "text" | "richText" | "image" | "array" | "boolean" | "number";
  required: boolean;
  description?: string;
  maxLength?: number;
  defaultValue?: unknown;
  aspectRatio?: string;
  aiPrompt?: string;
}

export interface PatternVariant {
  id: string;
  name: string;
  description?: string;
  defaultProps?: Record<string, unknown>;
}

export interface PatternMetadata {
  id: string;
  name: string;
  category: PatternCategory;
  description?: string;
  thumbnail?: string;
  source?: string;
  tags: string[];
  bestFor?: string[];
  mobileOptimized?: boolean;
  conversionScore?: number;
  inspirationSources?: string[];
  aiGuidance?: string;
}

export interface PatternDefinition extends PatternMetadata {
  variants: string[];
  slots: PatternSlot[];
  defaultVariant?: string;
  defaultProps?: Record<string, unknown>;
}

// ============================================
// SECTION CONFIGURATION
// ============================================

export interface SectionConfig {
  id: string;
  patternId: string;
  variantId?: string;
  props: Record<string, unknown>;
  customizations?: {
    hidden?: boolean;
    order?: number;
    className?: string;
  };
}

// ============================================
// PAGE CONFIGURATION
// ============================================

export interface PageConfig {
  path: string;
  title: string;
  description?: string;
  sections: SectionConfig[];
  layout?: "default" | "narrow" | "full-width";
}

// ============================================
// PROJECT DEFINITION
// ============================================

export interface ProjectDefinition {
  meta: {
    name: string;
    description: string;
    template: string;
    createdAt?: string;
    version?: string;
  };

  branding: BrandingConfig;

  pages: PageConfig[];

  navigation?: {
    patternId: string;
    props: Record<string, unknown>;
  };

  footer?: {
    patternId: string;
    props: Record<string, unknown>;
  };

  integrations?: Record<string, string>;
  features?: string[];

  inspiration?: {
    url: string;
    analyzedAt: string;
    appliedPatterns: string[];
  };
}

// ============================================
// COMPONENT PROPS (for actual rendering)
// ============================================

export interface BasePatternProps {
  branding?: BrandingConfig;
  variant?: string;
  className?: string;
  editable?: boolean;
  onTextChange?: (path: string, value: string) => void;
}

export interface HeroPatternProps extends BasePatternProps {
  headline: string;
  subheadline?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  badge?: string;
  image?: string;
  backgroundImage?: string;
  videoUrl?: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface FeaturesPatternProps extends BasePatternProps {
  title?: string;
  subtitle?: string;
  features?: FeatureItem[]; // Optional - has default values in components
  columns?: 2 | 3 | 4;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

export interface TestimonialsPatternProps extends BasePatternProps {
  title?: string;
  testimonials: TestimonialItem[];
  layout?: "grid" | "carousel" | "stacked";
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  cta?: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
}

export interface PricingPatternProps extends BasePatternProps {
  title?: string;
  subtitle?: string;
  tiers: PricingTier[];
  showToggle?: boolean;
}

export interface CTAPatternProps extends BasePatternProps {
  headline: string;
  subheadline?: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  backgroundImage?: string;
}

// ============================================
// PATTERN REGISTRY INTERFACE
// ============================================

export interface PatternRegistryInterface {
  patterns: Record<string, PatternDefinition>;
  categories: Record<PatternCategory, string[]>;

  getPattern(id: string): PatternDefinition | null;
  getByCategory(category: PatternCategory): PatternDefinition[];
  search(query: string): PatternDefinition[];
}

// ============================================
// WEBSITE ANALYSIS (from Firecrawl/Inspiration)
// ============================================

export interface WebsiteAnalysis {
  url: string;
  analyzedAt: string;
  
  design: {
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string[];
      text: string[];
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      sizes: number[];
    };
    spacing: {
      containerWidth: string;
      sectionPadding: string;
    };
    style: {
      borderRadius: string;
      shadows: string[];
      animations: boolean;
    };
  };
  
  layout: {
    headerStyle: "sticky" | "fixed" | "static";
    navigationPattern: "horizontal" | "sidebar" | "hamburger" | "mega-menu";
    footerSections: number;
    heroPattern: "centered" | "split" | "video" | "gradient" | "image";
    contentWidth: "full" | "contained" | "narrow";
  };
  
  sections: {
    type: PatternCategory;
    layout: "grid" | "list" | "carousel" | "split" | "stacked";
    itemCount: number;
    hasAnimations: boolean;
    order: number;
  }[];
  
  conversion: {
    ctaPlacements: string[];
    trustSignals: string[];
    socialProof: boolean;
    pricingTiers: number;
  };
  
  tech: {
    framework: "next" | "react" | "vue" | "astro" | "unknown";
    uiLibrary: "tailwind" | "shadcn" | "chakra" | "material" | "custom";
    animations: "framer" | "gsap" | "css" | "none";
  };
}

// ============================================
// RENDERER PROPS
// ============================================

export interface SectionRendererProps {
  section: SectionConfig;
  branding: BrandingConfig;
  editable?: boolean;
  onPropsChange?: (newProps: Record<string, unknown>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export interface DynamicPreviewRendererProps {
  definition: ProjectDefinition;
  currentPage?: string;
  viewport?: "desktop" | "tablet" | "mobile";
  editable?: boolean;
  onDefinitionChange?: (newDef: ProjectDefinition) => void;
}

// ============================================
// DEFAULT BRANDING
// ============================================

export const DEFAULT_BRANDING: BrandingConfig = {
  colors: {
    primary: "#F97316",
    secondary: "#1E293B",
    accent: "#F97316",
    background: "#0A0A0A",
    foreground: "#FFFFFF",
    muted: "#78716C",
    border: "#27272A",
    card: "#18181B",
    destructive: "#EF4444",
    success: "#22C55E",
  },
  fonts: {
    heading: "Cal Sans",
    body: "Inter",
    mono: "JetBrains Mono",
  },
  spacing: {
    containerMax: "1280px",
    sectionPadding: "py-24",
    componentGap: "gap-8",
  },
  borderRadius: "md",
  shadowStyle: "medium",
};

