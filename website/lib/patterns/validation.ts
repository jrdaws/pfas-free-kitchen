/**
 * Validation Utilities
 *
 * Validates ProjectDefinition, SectionConfig, and BrandingConfig
 * to catch common errors before export.
 */

import type {
  ProjectDefinition,
  SectionConfig,
  BrandingConfig,
  PageConfig,
  ColorScheme,
  PatternCategory,
} from "./types";

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Color Validation
// ============================================================================

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const CSS_VAR_REGEX = /^var\(--[a-zA-Z0-9-]+\)$/;

function isValidColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color) || CSS_VAR_REGEX.test(color);
}

// ============================================================================
// Known Patterns (should match registry)
// ============================================================================

const KNOWN_PATTERN_PREFIXES = [
  "hero-",
  "features-",
  "pricing-",
  "testimonials-",
  "cta-",
  "faq-",
  "team-",
  "stats-",
  "logos-",
  "footer-",
  "nav-",
  "product-",
  "portfolio-",
  "about-",
  "contact-",
  "blog-",
  "categories-",
  "custom-", // Allow custom patterns
];

function isKnownPatternId(patternId: string): boolean {
  return KNOWN_PATTERN_PREFIXES.some((prefix) => patternId.startsWith(prefix));
}

// ============================================================================
// Section Validation
// ============================================================================

/**
 * Validate a single section configuration
 */
export function validateSection(section: SectionConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: id
  if (!section.id || typeof section.id !== "string") {
    errors.push("Section missing required 'id' field");
  } else if (section.id.length < 1) {
    errors.push("Section 'id' must not be empty");
  }

  // Required: patternId
  if (!section.patternId || typeof section.patternId !== "string") {
    errors.push("Section missing required 'patternId' field");
  } else {
    if (!isKnownPatternId(section.patternId)) {
      warnings.push(
        `Unknown pattern '${section.patternId}' - ensure it exists in registry`
      );
    }
  }

  // Optional: props must be object
  if (section.props && typeof section.props !== "object") {
    errors.push("Section 'props' must be an object");
  }

  // Optional: customizations validation
  if (section.customizations) {
    if (
      section.customizations.order !== undefined &&
      typeof section.customizations.order !== "number"
    ) {
      errors.push("Section customizations.order must be a number");
    }
    if (
      section.customizations.className !== undefined &&
      typeof section.customizations.className !== "string"
    ) {
      errors.push("Section customizations.className must be a string");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Branding Validation
// ============================================================================

/**
 * Validate branding configuration
 */
export function validateBranding(branding: BrandingConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate colors
  if (!branding.colors) {
    errors.push("Branding missing 'colors' configuration");
  } else {
    const colorFields: (keyof ColorScheme)[] = [
      "primary",
      "secondary",
      "accent",
      "background",
      "foreground",
      "muted",
      "border",
      "card",
    ];

    for (const field of colorFields) {
      const color = branding.colors[field];
      if (!color) {
        warnings.push(`Branding colors.${field} is not set`);
      } else if (!isValidColor(color)) {
        errors.push(
          `Branding colors.${field} has invalid color value: ${color}`
        );
      }
    }

    // Check for sufficient contrast (basic check)
    if (branding.colors.background && branding.colors.foreground) {
      const bgBrightness = getColorBrightness(branding.colors.background);
      const fgBrightness = getColorBrightness(branding.colors.foreground);
      
      if (bgBrightness !== null && fgBrightness !== null) {
        const contrast = Math.abs(bgBrightness - fgBrightness);
        if (contrast < 100) {
          warnings.push(
            "Low contrast between background and foreground colors - may affect readability"
          );
        }
      }
    }
  }

  // Validate fonts
  if (!branding.fonts) {
    errors.push("Branding missing 'fonts' configuration");
  } else {
    if (!branding.fonts.heading) {
      warnings.push("Branding fonts.heading is not set");
    }
    if (!branding.fonts.body) {
      warnings.push("Branding fonts.body is not set");
    }
  }

  // Validate spacing
  if (!branding.spacing) {
    errors.push("Branding missing 'spacing' configuration");
  }

  // Validate borderRadius
  const validBorderRadius = ["none", "sm", "md", "lg", "full"];
  if (
    branding.borderRadius &&
    !validBorderRadius.includes(branding.borderRadius)
  ) {
    errors.push(
      `Branding borderRadius has invalid value: ${branding.borderRadius}`
    );
  }

  // Validate shadowStyle
  const validShadowStyles = ["none", "subtle", "medium", "dramatic"];
  if (branding.shadowStyle && !validShadowStyles.includes(branding.shadowStyle)) {
    errors.push(
      `Branding shadowStyle has invalid value: ${branding.shadowStyle}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Page Validation
// ============================================================================

/**
 * Validate a single page configuration
 */
export function validatePage(page: PageConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: path
  if (!page.path || typeof page.path !== "string") {
    errors.push("Page missing required 'path' field");
  } else if (!page.path.startsWith("/")) {
    errors.push("Page 'path' must start with '/'");
  }

  // Required: title
  if (!page.title || typeof page.title !== "string") {
    errors.push("Page missing required 'title' field");
  }

  // Optional: description
  if (page.description && typeof page.description !== "string") {
    errors.push("Page 'description' must be a string");
  }

  // Required: sections array
  if (!Array.isArray(page.sections)) {
    errors.push("Page 'sections' must be an array");
  } else {
    // Validate each section
    const sectionIds = new Set<string>();
    
    page.sections.forEach((section, index) => {
      const sectionResult = validateSection(section);
      errors.push(
        ...sectionResult.errors.map((e) => `Section ${index}: ${e}`)
      );
      warnings.push(
        ...sectionResult.warnings.map((w) => `Section ${index}: ${w}`)
      );

      // Check for duplicate IDs
      if (section.id) {
        if (sectionIds.has(section.id)) {
          errors.push(
            `Duplicate section ID '${section.id}' in page '${page.path}'`
          );
        }
        sectionIds.add(section.id);
      }
    });

    // Warn if page has no sections
    if (page.sections.length === 0) {
      warnings.push(`Page '${page.path}' has no sections`);
    }
  }

  // Optional: layout
  const validLayouts = ["default", "narrow", "full-width"];
  if (page.layout && !validLayouts.includes(page.layout)) {
    errors.push(`Page 'layout' has invalid value: ${page.layout}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// ProjectDefinition Validation
// ============================================================================

/**
 * Validate complete ProjectDefinition
 */
export function validateDefinition(
  definition: ProjectDefinition
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate meta
  if (!definition.meta) {
    errors.push("Definition missing 'meta' object");
  } else {
    if (!definition.meta.name) {
      errors.push("Definition meta.name is required");
    }
    if (!definition.meta.template) {
      warnings.push("Definition meta.template is not set");
    }
    if (definition.meta.version && !/^\d+\.\d+\.\d+$/.test(definition.meta.version)) {
      warnings.push("Definition meta.version should follow semver format");
    }
  }

  // Validate branding
  if (!definition.branding) {
    errors.push("Definition missing 'branding' configuration");
  } else {
    const brandingResult = validateBranding(definition.branding);
    errors.push(...brandingResult.errors.map((e) => `Branding: ${e}`));
    warnings.push(...brandingResult.warnings.map((w) => `Branding: ${w}`));
  }

  // Validate pages
  if (!Array.isArray(definition.pages)) {
    errors.push("Definition 'pages' must be an array");
  } else {
    const pagePaths = new Set<string>();

    definition.pages.forEach((page, index) => {
      const pageResult = validatePage(page);
      errors.push(...pageResult.errors.map((e) => `Page ${index}: ${e}`));
      warnings.push(...pageResult.warnings.map((w) => `Page ${index}: ${w}`));

      // Check for duplicate paths
      if (page.path) {
        if (pagePaths.has(page.path)) {
          errors.push(`Duplicate page path: ${page.path}`);
        }
        pagePaths.add(page.path);
      }
    });

    // Warn if no home page
    if (!pagePaths.has("/")) {
      warnings.push("No home page (/) defined");
    }

    // Warn if no pages
    if (definition.pages.length === 0) {
      warnings.push("Definition has no pages");
    }
  }

  // Validate navigation (optional)
  if (definition.navigation) {
    if (!definition.navigation.patternId) {
      warnings.push("Navigation missing patternId");
    }
  }

  // Validate footer (optional)
  if (definition.footer) {
    if (!definition.footer.patternId) {
      warnings.push("Footer missing patternId");
    }
  }

  // Validate integrations (optional)
  if (definition.integrations && typeof definition.integrations !== "object") {
    errors.push("Definition 'integrations' must be an object");
  }

  // Validate features (optional)
  if (definition.features && !Array.isArray(definition.features)) {
    errors.push("Definition 'features' must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Quick Validation
// ============================================================================

/**
 * Quick check if a definition is minimally valid for preview
 */
export function isValidForPreview(definition: Partial<ProjectDefinition>): boolean {
  return (
    !!definition.branding &&
    !!definition.pages &&
    definition.pages.length > 0 &&
    definition.pages.some((p) => p.sections && p.sections.length > 0)
  );
}

/**
 * Quick check if a definition is valid for export
 */
export function isValidForExport(definition: ProjectDefinition): boolean {
  const result = validateDefinition(definition);
  return result.valid;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate color brightness (0-255)
 * Returns null if not a valid hex color
 */
function getColorBrightness(color: string): number | null {
  if (!HEX_COLOR_REGEX.test(color)) {
    return null;
  }

  let hex = color.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Relative luminance formula
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/**
 * Suggest fixes for common validation errors
 */
export function suggestFixes(result: ValidationResult): string[] {
  const suggestions: string[] = [];

  for (const error of result.errors) {
    if (error.includes("missing required 'id'")) {
      suggestions.push("Generate unique IDs for sections using UUID or nanoid");
    }
    if (error.includes("missing required 'patternId'")) {
      suggestions.push(
        "Specify a patternId from the pattern registry (e.g., 'hero-centered')"
      );
    }
    if (error.includes("invalid color value")) {
      suggestions.push("Use hex colors (#RRGGBB) or CSS variables (var(--color))");
    }
    if (error.includes("Duplicate section ID")) {
      suggestions.push("Ensure all section IDs are unique within each page");
    }
    if (error.includes("Duplicate page path")) {
      suggestions.push("Ensure all page paths are unique");
    }
  }

  for (const warning of result.warnings) {
    if (warning.includes("Low contrast")) {
      suggestions.push(
        "Consider using darker text on light backgrounds or vice versa"
      );
    }
    if (warning.includes("has no sections")) {
      suggestions.push(
        "Add at least one section to the page (e.g., a hero section)"
      );
    }
    if (warning.includes("No home page")) {
      suggestions.push("Create a page with path '/' to serve as the home page");
    }
  }

  return [...new Set(suggestions)]; // Remove duplicates
}

