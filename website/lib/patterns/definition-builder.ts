/**
 * DefinitionBuilder
 *
 * Builder pattern for constructing ProjectDefinition objects.
 * Provides a fluent API for creating, modifying, and composing definitions.
 */

import type {
  ProjectDefinition,
  BrandingConfig,
  PageConfig,
  SectionConfig,
  WebsiteAnalysis,
  ColorScheme,
  FontScheme,
  SpacingScheme,
} from "./types";
import { DEFAULT_BRANDING } from "./types";
import { analysisToDefinition } from "./converters";

// ============================================================================
// Template Presets
// ============================================================================

const TEMPLATE_PRESETS: Record<string, Partial<ProjectDefinition>> = {
  saas: {
    meta: {
      name: "My SaaS",
      description: "A modern SaaS application",
      template: "saas",
    },
    pages: [
      {
        path: "/",
        title: "Home",
        sections: [
          { id: "hero", patternId: "hero-split-image", props: {} },
          { id: "features", patternId: "features-icon-grid", props: {} },
          { id: "testimonials", patternId: "testimonials-grid", props: {} },
          { id: "pricing", patternId: "pricing-three-tier", props: {} },
          { id: "cta", patternId: "cta-simple", props: {} },
        ],
      },
    ],
    navigation: {
      patternId: "nav-standard",
      props: {},
    },
    footer: {
      patternId: "footer-multi-column",
      props: {},
    },
  },
  ecommerce: {
    meta: {
      name: "My Store",
      description: "An online store",
      template: "ecommerce",
    },
    pages: [
      {
        path: "/",
        title: "Home",
        sections: [
          { id: "hero", patternId: "hero-split-image", props: {} },
          { id: "featured", patternId: "product-grid", props: {} },
          { id: "categories", patternId: "categories-grid", props: {} },
        ],
      },
    ],
    navigation: {
      patternId: "nav-ecommerce",
      props: {},
    },
    footer: {
      patternId: "footer-multi-column",
      props: {},
    },
  },
  portfolio: {
    meta: {
      name: "My Portfolio",
      description: "Personal portfolio",
      template: "portfolio",
    },
    pages: [
      {
        path: "/",
        title: "Home",
        sections: [
          { id: "hero", patternId: "hero-centered", props: {} },
          { id: "work", patternId: "portfolio-grid", props: {} },
          { id: "about", patternId: "about-split", props: {} },
        ],
      },
    ],
    navigation: {
      patternId: "nav-minimal",
      props: {},
    },
    footer: {
      patternId: "footer-simple",
      props: {},
    },
  },
  landing: {
    meta: {
      name: "Landing Page",
      description: "High-converting landing page",
      template: "landing",
    },
    pages: [
      {
        path: "/",
        title: "Home",
        sections: [
          { id: "hero", patternId: "hero-centered-gradient", props: {} },
          { id: "features", patternId: "features-bento-grid", props: {} },
          { id: "social-proof", patternId: "testimonials-carousel", props: {} },
          { id: "cta", patternId: "cta-simple", props: {} },
        ],
      },
    ],
    navigation: {
      patternId: "nav-transparent",
      props: {},
    },
    footer: {
      patternId: "footer-simple",
      props: {},
    },
  },
};

// ============================================================================
// DefinitionBuilder Class
// ============================================================================

export class DefinitionBuilder {
  private definition: Partial<ProjectDefinition>;

  private constructor(initial: Partial<ProjectDefinition> = {}) {
    this.definition = initial;
  }

  // ============================================================================
  // Factory Methods
  // ============================================================================

  /**
   * Create a new builder with default values
   */
  static create(): DefinitionBuilder {
    return new DefinitionBuilder({
      meta: {
        name: "Untitled Project",
        description: "",
        template: "saas",
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      },
      branding: DEFAULT_BRANDING,
      pages: [],
      navigation: {
        patternId: "nav-standard",
        props: {},
      },
      footer: {
        patternId: "footer-multi-column",
        props: {},
      },
      integrations: {},
      features: [],
    });
  }

  /**
   * Create a builder from a template preset
   */
  static fromTemplate(template: string): DefinitionBuilder {
    const preset = TEMPLATE_PRESETS[template] || TEMPLATE_PRESETS.saas;
    return new DefinitionBuilder({
      ...preset,
      meta: {
        ...preset.meta!,
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      },
      branding: DEFAULT_BRANDING,
      integrations: {},
      features: [],
    });
  }

  /**
   * Create a builder from website analysis
   */
  static fromAnalysis(analysis: WebsiteAnalysis): DefinitionBuilder {
    const partial = analysisToDefinition(analysis, "saas");
    return new DefinitionBuilder({
      meta: {
        name: "Inspired Project",
        description: `Inspired by ${analysis.url}`,
        template: "saas",
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      },
      ...partial,
      navigation: {
        patternId: "nav-standard",
        props: {},
      },
      footer: {
        patternId: "footer-multi-column",
        props: {},
      },
      integrations: {},
      features: [],
    });
  }

  /**
   * Create a builder from an existing definition
   */
  static fromDefinition(definition: ProjectDefinition): DefinitionBuilder {
    return new DefinitionBuilder(structuredClone(definition));
  }

  // ============================================================================
  // Meta Setters
  // ============================================================================

  /**
   * Set project metadata
   */
  setMeta(meta: Partial<ProjectDefinition["meta"]>): this {
    this.definition.meta = {
      ...this.definition.meta!,
      ...meta,
    };
    return this;
  }

  /**
   * Set project name
   */
  setName(name: string): this {
    if (this.definition.meta) {
      this.definition.meta.name = name;
    }
    return this;
  }

  /**
   * Set project description
   */
  setDescription(description: string): this {
    if (this.definition.meta) {
      this.definition.meta.description = description;
    }
    return this;
  }

  /**
   * Set template type
   */
  setTemplate(template: string): this {
    if (this.definition.meta) {
      this.definition.meta.template = template;
    }
    return this;
  }

  // ============================================================================
  // Branding Setters
  // ============================================================================

  /**
   * Set complete branding config
   */
  setBranding(branding: BrandingConfig): this {
    this.definition.branding = branding;
    return this;
  }

  /**
   * Set color scheme
   */
  setColors(colors: Partial<ColorScheme>): this {
    if (this.definition.branding) {
      this.definition.branding.colors = {
        ...this.definition.branding.colors,
        ...colors,
      };
    }
    return this;
  }

  /**
   * Set font scheme
   */
  setFonts(fonts: Partial<FontScheme>): this {
    if (this.definition.branding) {
      this.definition.branding.fonts = {
        ...this.definition.branding.fonts,
        ...fonts,
      };
    }
    return this;
  }

  /**
   * Set spacing scheme
   */
  setSpacing(spacing: Partial<SpacingScheme>): this {
    if (this.definition.branding) {
      this.definition.branding.spacing = {
        ...this.definition.branding.spacing,
        ...spacing,
      };
    }
    return this;
  }

  /**
   * Set border radius
   */
  setBorderRadius(radius: BrandingConfig["borderRadius"]): this {
    if (this.definition.branding) {
      this.definition.branding.borderRadius = radius;
    }
    return this;
  }

  /**
   * Set shadow style
   */
  setShadowStyle(style: BrandingConfig["shadowStyle"]): this {
    if (this.definition.branding) {
      this.definition.branding.shadowStyle = style;
    }
    return this;
  }

  // ============================================================================
  // Page Management
  // ============================================================================

  /**
   * Add a page to the project
   */
  addPage(page: PageConfig): this {
    if (!this.definition.pages) {
      this.definition.pages = [];
    }
    this.definition.pages.push(page);
    return this;
  }

  /**
   * Remove a page by path
   */
  removePage(path: string): this {
    if (this.definition.pages) {
      this.definition.pages = this.definition.pages.filter(
        (p) => p.path !== path
      );
    }
    return this;
  }

  /**
   * Update an existing page
   */
  updatePage(path: string, updates: Partial<PageConfig>): this {
    if (this.definition.pages) {
      const pageIndex = this.definition.pages.findIndex((p) => p.path === path);
      if (pageIndex !== -1) {
        this.definition.pages[pageIndex] = {
          ...this.definition.pages[pageIndex],
          ...updates,
        };
      }
    }
    return this;
  }

  /**
   * Get a page by path
   */
  getPage(path: string): PageConfig | undefined {
    return this.definition.pages?.find((p) => p.path === path);
  }

  // ============================================================================
  // Section Management
  // ============================================================================

  /**
   * Set a section at a specific position within a page
   */
  setSection(
    pageIndex: number,
    sectionIndex: number,
    section: SectionConfig
  ): this {
    if (this.definition.pages && this.definition.pages[pageIndex]) {
      const page = this.definition.pages[pageIndex];
      if (sectionIndex >= 0 && sectionIndex < page.sections.length) {
        page.sections[sectionIndex] = section;
      }
    }
    return this;
  }

  /**
   * Add a section to a page
   */
  addSection(pagePath: string, section: SectionConfig, position?: number): this {
    const page = this.definition.pages?.find((p) => p.path === pagePath);
    if (page) {
      if (position !== undefined && position >= 0) {
        page.sections.splice(position, 0, section);
      } else {
        page.sections.push(section);
      }
    }
    return this;
  }

  /**
   * Remove a section from a page
   */
  removeSection(pagePath: string, sectionId: string): this {
    const page = this.definition.pages?.find((p) => p.path === pagePath);
    if (page) {
      page.sections = page.sections.filter((s) => s.id !== sectionId);
    }
    return this;
  }

  /**
   * Update a section's props
   */
  updateSectionProps(
    pagePath: string,
    sectionId: string,
    props: Record<string, unknown>
  ): this {
    const page = this.definition.pages?.find((p) => p.path === pagePath);
    if (page) {
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) {
        section.props = { ...section.props, ...props };
      }
    }
    return this;
  }

  /**
   * Change a section's pattern
   */
  changeSectionPattern(
    pagePath: string,
    sectionId: string,
    newPatternId: string,
    variantId?: string
  ): this {
    const page = this.definition.pages?.find((p) => p.path === pagePath);
    if (page) {
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) {
        section.patternId = newPatternId;
        section.variantId = variantId;
        // Reset props when changing pattern
        section.props = {};
      }
    }
    return this;
  }

  /**
   * Reorder sections within a page
   */
  reorderSections(pagePath: string, sectionIds: string[]): this {
    const page = this.definition.pages?.find((p) => p.path === pagePath);
    if (page) {
      const sectionMap = new Map(page.sections.map((s) => [s.id, s]));
      const reordered = sectionIds
        .map((id) => sectionMap.get(id))
        .filter(Boolean) as SectionConfig[];
      page.sections = reordered;
    }
    return this;
  }

  // ============================================================================
  // Global Components
  // ============================================================================

  /**
   * Set navigation config
   */
  setNavigation(patternId: string, props: Record<string, unknown> = {}): this {
    this.definition.navigation = { patternId, props };
    return this;
  }

  /**
   * Set footer config
   */
  setFooter(patternId: string, props: Record<string, unknown> = {}): this {
    this.definition.footer = { patternId, props };
    return this;
  }

  // ============================================================================
  // Integrations & Features
  // ============================================================================

  /**
   * Set integrations
   */
  setIntegrations(integrations: Record<string, string>): this {
    this.definition.integrations = integrations;
    return this;
  }

  /**
   * Add an integration
   */
  addIntegration(category: string, provider: string): this {
    if (!this.definition.integrations) {
      this.definition.integrations = {};
    }
    this.definition.integrations[category] = provider;
    return this;
  }

  /**
   * Remove an integration
   */
  removeIntegration(category: string): this {
    if (this.definition.integrations) {
      delete this.definition.integrations[category];
    }
    return this;
  }

  /**
   * Set features
   */
  setFeatures(features: string[]): this {
    this.definition.features = features;
    return this;
  }

  /**
   * Add a feature
   */
  addFeature(feature: string): this {
    if (!this.definition.features) {
      this.definition.features = [];
    }
    if (!this.definition.features.includes(feature)) {
      this.definition.features.push(feature);
    }
    return this;
  }

  /**
   * Remove a feature
   */
  removeFeature(feature: string): this {
    if (this.definition.features) {
      this.definition.features = this.definition.features.filter(
        (f) => f !== feature
      );
    }
    return this;
  }

  // ============================================================================
  // Inspiration
  // ============================================================================

  /**
   * Set inspiration data
   */
  setInspiration(
    url: string,
    appliedPatterns: string[] = []
  ): this {
    this.definition.inspiration = {
      url,
      analyzedAt: new Date().toISOString(),
      appliedPatterns,
    };
    return this;
  }

  // ============================================================================
  // Build
  // ============================================================================

  /**
   * Build the final ProjectDefinition
   * Validates required fields and returns the complete definition
   */
  build(): ProjectDefinition {
    // Ensure required fields have defaults
    const result: ProjectDefinition = {
      meta: this.definition.meta || {
        name: "Untitled Project",
        description: "",
        template: "saas",
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      },
      branding: this.definition.branding || DEFAULT_BRANDING,
      pages: this.definition.pages || [],
      navigation: this.definition.navigation,
      footer: this.definition.footer,
      integrations: this.definition.integrations,
      features: this.definition.features,
      inspiration: this.definition.inspiration,
    };

    return result;
  }

  /**
   * Get the current state without building
   * Useful for debugging or partial inspections
   */
  getPartial(): Partial<ProjectDefinition> {
    return structuredClone(this.definition);
  }
}

