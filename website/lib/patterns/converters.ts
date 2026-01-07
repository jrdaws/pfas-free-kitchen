/**
 * State Converters
 *
 * Utilities to convert between ConfiguratorState and ProjectDefinition.
 * This enables bidirectional data flow:
 *   ConfiguratorState → ProjectDefinition → Export
 *   WebsiteAnalysis → ProjectDefinition → ConfiguratorState
 */

import type { ConfiguratorState, COLOR_SCHEMES } from "../configurator-state";
import type {
  ProjectDefinition,
  BrandingConfig,
  PageConfig,
  SectionConfig,
  WebsiteAnalysis,
  DEFAULT_BRANDING,
} from "./types";
import { DEFAULT_BRANDING as BRANDING_DEFAULTS } from "./types";

// ============================================================================
// ConfiguratorState → ProjectDefinition
// ============================================================================

/**
 * Convert current configurator state to a ProjectDefinition
 */
export function configStateToDefinition(
  state: Partial<ConfiguratorState>
): ProjectDefinition {
  // Build branding from state colors
  const branding = buildBrandingFromState(state);

  // Build pages from template and features
  const pages = buildPagesFromState(state);

  // Build navigation
  const navigation = {
    patternId: "nav-standard",
    props: {
      logo: state.projectName || "Brand",
      links: getDefaultNavLinks(state.template || "saas"),
      cta: {
        text: "Get Started",
        href: "/signup",
      },
    },
  };

  // Build footer
  const footer = {
    patternId: "footer-multi-column",
    props: {
      logo: state.projectName || "Brand",
      columns: getDefaultFooterColumns(state.template || "saas"),
      copyright: `© ${new Date().getFullYear()} ${state.projectName || "Company"}. All rights reserved.`,
    },
  };

  return {
    meta: {
      name: state.projectName || "Untitled Project",
      description: state.description || state.vision || "",
      template: state.template || "saas",
      createdAt: new Date().toISOString(),
      version: "1.0.0",
    },
    branding,
    pages,
    navigation,
    footer,
    integrations: state.integrations || {},
    features: getSelectedFeaturesList(state.selectedFeatures || {}),
    inspiration: state.designAnalysis
      ? {
          url: state.inspirationUrls?.[0] || "",
          analyzedAt: new Date().toISOString(),
          appliedPatterns: [],
        }
      : undefined,
  };
}

// ============================================================================
// ProjectDefinition → ConfiguratorState
// ============================================================================

/**
 * Convert ProjectDefinition back to configurator state
 * Used when loading a saved project
 */
export function definitionToConfigState(
  definition: ProjectDefinition
): Partial<ConfiguratorState> {
  return {
    projectName: definition.meta.name,
    description: definition.meta.description,
    template: definition.meta.template as ConfiguratorState["template"],
    integrations: definition.integrations || {},
    selectedFeatures: groupFeaturesByCategory(definition.features || []),
    customColors: {
      primary: definition.branding.colors.primary,
      secondary: definition.branding.colors.secondary,
      accent: definition.branding.colors.accent,
      background: definition.branding.colors.background,
      foreground: definition.branding.colors.foreground,
    },
    colorScheme: "custom",
    // Note: Detailed page/section data is stored in the definition itself
  };
}

// ============================================================================
// WebsiteAnalysis → Partial<ProjectDefinition>
// ============================================================================

/**
 * Convert website analysis from Firecrawl to a partial ProjectDefinition
 * This can be merged with user preferences
 */
export function analysisToDefinition(
  analysis: WebsiteAnalysis,
  template: string
): Partial<ProjectDefinition> {
  // Map design analysis to branding
  const branding = mapAnalysisToBranding(analysis);

  // Map detected sections to pages
  const pages = mapAnalysisToPages(analysis, template);

  return {
    branding,
    pages,
    inspiration: {
      url: analysis.url,
      analyzedAt: analysis.analyzedAt,
      appliedPatterns: analysis.sections.map((s) => s.type),
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildBrandingFromState(
  state: Partial<ConfiguratorState>
): BrandingConfig {
  const colors = state.customColors || {
    primary: BRANDING_DEFAULTS.colors.primary,
    secondary: BRANDING_DEFAULTS.colors.secondary,
    accent: BRANDING_DEFAULTS.colors.accent,
    background: BRANDING_DEFAULTS.colors.background,
    foreground: BRANDING_DEFAULTS.colors.foreground,
  };

  return {
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      foreground: colors.foreground,
      muted: BRANDING_DEFAULTS.colors.muted,
      border: BRANDING_DEFAULTS.colors.border,
      card: BRANDING_DEFAULTS.colors.card,
      destructive: BRANDING_DEFAULTS.colors.destructive,
      success: BRANDING_DEFAULTS.colors.success,
    },
    fonts: {
      heading: "Inter",
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
}

function buildPagesFromState(
  state: Partial<ConfiguratorState>
): PageConfig[] {
  const template = state.template || "saas";

  // Get template-appropriate default pages
  const defaultPages = getDefaultPagesForTemplate(template);

  // Map to PageConfig with sections
  return defaultPages.map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
    sections: getDefaultSectionsForPage(page.path, template),
    layout: "default" as const,
  }));
}

function getDefaultPagesForTemplate(
  template: string
): Array<{ path: string; title: string; description: string }> {
  const templatePages: Record<
    string,
    Array<{ path: string; title: string; description: string }>
  > = {
    saas: [
      { path: "/", title: "Home", description: "Welcome to our platform" },
      { path: "/pricing", title: "Pricing", description: "Choose your plan" },
      { path: "/features", title: "Features", description: "What we offer" },
      { path: "/about", title: "About", description: "Our story" },
    ],
    ecommerce: [
      { path: "/", title: "Home", description: "Shop our collection" },
      { path: "/products", title: "Products", description: "Browse all products" },
      { path: "/about", title: "About", description: "Our story" },
    ],
    blog: [
      { path: "/", title: "Home", description: "Latest articles" },
      { path: "/about", title: "About", description: "About the blog" },
    ],
    portfolio: [
      { path: "/", title: "Home", description: "Welcome to my portfolio" },
      { path: "/work", title: "Work", description: "My projects" },
      { path: "/about", title: "About", description: "About me" },
      { path: "/contact", title: "Contact", description: "Get in touch" },
    ],
    landing: [
      { path: "/", title: "Home", description: "Welcome" },
    ],
  };

  return templatePages[template] || templatePages.saas;
}

function getDefaultSectionsForPage(
  pagePath: string,
  template: string
): SectionConfig[] {
  // Home page sections vary by template
  if (pagePath === "/") {
    return getHomeSections(template);
  }

  // Standard page patterns
  const pagePatterns: Record<string, SectionConfig[]> = {
    "/pricing": [
      {
        id: "pricing-hero",
        patternId: "hero-centered",
        props: { headline: "Simple, transparent pricing" },
      },
      {
        id: "pricing-tiers",
        patternId: "pricing-three-tier",
        props: {},
      },
      {
        id: "pricing-faq",
        patternId: "faq-accordion",
        props: {},
      },
      {
        id: "pricing-cta",
        patternId: "cta-simple",
        props: { headline: "Ready to get started?" },
      },
    ],
    "/features": [
      {
        id: "features-hero",
        patternId: "hero-split-image",
        props: { headline: "Powerful features for modern teams" },
      },
      {
        id: "features-grid",
        patternId: "features-icon-grid",
        props: {},
      },
      {
        id: "features-cta",
        patternId: "cta-simple",
        props: {},
      },
    ],
    "/about": [
      {
        id: "about-hero",
        patternId: "hero-centered",
        props: { headline: "Our Story" },
      },
      {
        id: "about-team",
        patternId: "team-grid",
        props: {},
      },
    ],
  };

  return pagePatterns[pagePath] || [];
}

function getHomeSections(template: string): SectionConfig[] {
  const templateSections: Record<string, SectionConfig[]> = {
    saas: [
      {
        id: "home-hero",
        patternId: "hero-split-image",
        variantId: "dark",
        props: {},
      },
      {
        id: "home-logos",
        patternId: "logos-simple",
        props: {},
      },
      {
        id: "home-features",
        patternId: "features-icon-grid",
        props: {},
      },
      {
        id: "home-testimonials",
        patternId: "testimonials-grid",
        props: {},
      },
      {
        id: "home-pricing",
        patternId: "pricing-three-tier",
        props: {},
      },
      {
        id: "home-cta",
        patternId: "cta-simple",
        props: {},
      },
    ],
    ecommerce: [
      {
        id: "home-hero",
        patternId: "hero-split-image",
        props: {},
      },
      {
        id: "home-featured",
        patternId: "product-grid",
        props: {},
      },
      {
        id: "home-categories",
        patternId: "categories-grid",
        props: {},
      },
      {
        id: "home-testimonials",
        patternId: "testimonials-carousel",
        props: {},
      },
    ],
    portfolio: [
      {
        id: "home-hero",
        patternId: "hero-centered",
        props: {},
      },
      {
        id: "home-work",
        patternId: "portfolio-grid",
        props: {},
      },
      {
        id: "home-about",
        patternId: "about-split",
        props: {},
      },
      {
        id: "home-contact",
        patternId: "cta-simple",
        props: {},
      },
    ],
    landing: [
      {
        id: "home-hero",
        patternId: "hero-centered-gradient",
        props: {},
      },
      {
        id: "home-features",
        patternId: "features-bento-grid",
        props: {},
      },
      {
        id: "home-social-proof",
        patternId: "testimonials-carousel",
        props: {},
      },
      {
        id: "home-cta",
        patternId: "cta-simple",
        props: {},
      },
    ],
  };

  return templateSections[template] || templateSections.saas;
}

function getDefaultNavLinks(
  template: string
): Array<{ label: string; href: string }> {
  const links: Record<string, Array<{ label: string; href: string }>> = {
    saas: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ],
    ecommerce: [
      { label: "Products", href: "/products" },
      { label: "Collections", href: "/collections" },
      { label: "About", href: "/about" },
    ],
    portfolio: [
      { label: "Work", href: "/work" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    blog: [
      { label: "Articles", href: "/articles" },
      { label: "About", href: "/about" },
    ],
    landing: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  };

  return links[template] || links.saas;
}

function getDefaultFooterColumns(
  template: string
): Array<{ title: string; links: Array<{ label: string; href: string }> }> {
  return [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];
}

function getSelectedFeaturesList(
  selectedFeatures: Record<string, string[]>
): string[] {
  return Object.values(selectedFeatures).flat();
}

function groupFeaturesByCategory(
  features: string[]
): Record<string, string[]> {
  // Simple grouping - in practice this would use feature metadata
  const groups: Record<string, string[]> = {};
  for (const feature of features) {
    const category = feature.split("-")[0] || "general";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(feature);
  }
  return groups;
}

function mapAnalysisToBranding(analysis: WebsiteAnalysis): BrandingConfig {
  const { colorPalette, typography, style } = analysis.design;

  // Map border radius
  let borderRadius: BrandingConfig["borderRadius"] = "md";
  if (style.borderRadius.includes("0")) borderRadius = "none";
  else if (style.borderRadius.includes("sm") || style.borderRadius.includes("4px"))
    borderRadius = "sm";
  else if (style.borderRadius.includes("lg") || style.borderRadius.includes("16px"))
    borderRadius = "lg";
  else if (style.borderRadius.includes("full") || style.borderRadius.includes("9999"))
    borderRadius = "full";

  // Map shadow style
  let shadowStyle: BrandingConfig["shadowStyle"] = "medium";
  if (style.shadows.length === 0) shadowStyle = "none";
  else if (style.shadows.some((s) => s.includes("0 1px"))) shadowStyle = "subtle";
  else if (style.shadows.some((s) => s.includes("0 25px"))) shadowStyle = "dramatic";

  return {
    colors: {
      primary: colorPalette.primary,
      secondary: colorPalette.secondary,
      accent: colorPalette.accent,
      background: colorPalette.background[0] || "#ffffff",
      foreground: colorPalette.text[0] || "#000000",
      muted: colorPalette.text[1] || "#6b7280",
      border: "#e5e7eb",
      card: colorPalette.background[1] || "#f9fafb",
      destructive: "#ef4444",
      success: "#22c55e",
    },
    fonts: {
      heading: typography.headingFont || "Inter",
      body: typography.bodyFont || "Inter",
      mono: "JetBrains Mono",
    },
    spacing: {
      containerMax: analysis.design.spacing.containerWidth || "1280px",
      sectionPadding: analysis.design.spacing.sectionPadding || "py-24",
      componentGap: "gap-8",
    },
    borderRadius,
    shadowStyle,
  };
}

function mapAnalysisToPages(
  analysis: WebsiteAnalysis,
  template: string
): PageConfig[] {
  // Build home page from detected sections
  const homeSections: SectionConfig[] = analysis.sections.map((section, index) => ({
    id: `detected-${section.type}-${index}`,
    patternId: mapSectionTypeToPattern(section.type, section.layout),
    props: {},
    customizations: {
      order: section.order,
    },
  }));

  return [
    {
      path: "/",
      title: "Home",
      description: "Inspired by " + analysis.url,
      sections: homeSections,
      layout: analysis.layout.contentWidth === "narrow" ? "narrow" : "default",
    },
  ];
}

function mapSectionTypeToPattern(
  type: string,
  layout: string
): string {
  // Map detected section types to available patterns
  const patternMap: Record<string, Record<string, string>> = {
    hero: {
      centered: "hero-centered",
      split: "hero-split-image",
      gradient: "hero-centered-gradient",
      video: "hero-video-background",
      image: "hero-split-image",
    },
    features: {
      grid: "features-icon-grid",
      list: "features-alternating",
      carousel: "features-cards",
      stacked: "features-alternating",
    },
    pricing: {
      grid: "pricing-three-tier",
      default: "pricing-three-tier",
    },
    testimonials: {
      grid: "testimonials-grid",
      carousel: "testimonials-carousel",
      stacked: "testimonials-grid",
    },
    cta: {
      default: "cta-simple",
    },
    faq: {
      default: "faq-accordion",
    },
    footer: {
      default: "footer-multi-column",
    },
  };

  const typePatterns = patternMap[type] || {};
  return typePatterns[layout] || typePatterns.default || `${type}-default`;
}

