/**
 * AI Template Composer
 * 
 * Analyzes project requirements and composes optimal page structures
 * from the pattern library.
 */

import fs from "fs-extra";
import path from "path";

// Types
export interface PatternSlot {
  slot: string;
  pattern: string;
  reason: string;
  props?: Record<string, unknown>;
}

export interface PageComposition {
  path: string;
  title: string;
  layout: string;
  auth?: boolean;
  dynamic?: boolean;
  slots: PatternSlot[];
}

export interface TemplateComposition {
  id: string;
  name: string;
  description: string;
  pages: PageComposition[];
  layouts: Record<string, {
    component: string | null;
    config: Record<string, unknown>;
  }>;
  theme: {
    primaryColor: string;
    style: string;
  };
}

export interface ProjectContext {
  name: string;
  type: "saas" | "ecommerce" | "blog" | "portfolio" | "agency" | "custom";
  description: string;
  targetAudience?: string;
  features?: string[];
  style?: "modern" | "minimal" | "bold" | "classic";
}

export interface PatternRegistry {
  patterns: {
    id: string;
    name: string;
    category: string;
    description: string;
    path: string;
    bestFor: string[];
    tags: string[];
  }[];
}

/**
 * Load pattern registry
 */
export async function loadPatternRegistry(): Promise<PatternRegistry> {
  const registryPath = path.join(__dirname, "..", "registry.json");
  
  if (!fs.existsSync(registryPath)) {
    throw new Error("Pattern registry not found");
  }
  
  return fs.readJSON(registryPath);
}

/**
 * Load a pre-built composition
 */
export async function loadComposition(compositionId: string): Promise<TemplateComposition> {
  const compositionsDir = path.join(__dirname, "..", "..", "compositions");
  const compositionPath = path.join(compositionsDir, `${compositionId}.json`);
  
  if (!fs.existsSync(compositionPath)) {
    throw new Error(`Composition not found: ${compositionId}`);
  }
  
  return fs.readJSON(compositionPath);
}

/**
 * Find patterns matching criteria
 */
export function findPatterns(
  registry: PatternRegistry,
  criteria: {
    category?: string;
    bestFor?: string[];
    tags?: string[];
  }
): PatternRegistry["patterns"] {
  return registry.patterns.filter((pattern) => {
    if (criteria.category && pattern.category !== criteria.category) {
      return false;
    }
    
    if (criteria.bestFor?.length) {
      const hasMatch = criteria.bestFor.some((b) => pattern.bestFor.includes(b));
      if (!hasMatch) return false;
    }
    
    if (criteria.tags?.length) {
      const hasMatch = criteria.tags.some((t) => pattern.tags.includes(t));
      if (!hasMatch) return false;
    }
    
    return true;
  });
}

/**
 * Score a pattern for a given context
 */
export function scorePattern(
  pattern: PatternRegistry["patterns"][0],
  context: ProjectContext
): number {
  let score = 0;
  
  // Type match
  if (pattern.bestFor.includes(context.type)) {
    score += 10;
  }
  
  // Style match
  if (context.style && pattern.tags.includes(context.style)) {
    score += 5;
  }
  
  // Feature keywords in description
  if (context.features) {
    for (const feature of context.features) {
      if (pattern.description.toLowerCase().includes(feature.toLowerCase())) {
        score += 3;
      }
    }
  }
  
  return score;
}

/**
 * Recommend best pattern for a slot
 */
export function recommendPattern(
  registry: PatternRegistry,
  category: string,
  context: ProjectContext
): PatternRegistry["patterns"][0] | null {
  const candidates = findPatterns(registry, { category });
  
  if (candidates.length === 0) {
    return null;
  }
  
  // Score and sort
  const scored = candidates.map((p) => ({
    pattern: p,
    score: scorePattern(p, context),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0].pattern;
}

/**
 * Compose a full template based on project context
 */
export async function composeTemplate(
  context: ProjectContext
): Promise<TemplateComposition> {
  const registry = await loadPatternRegistry();
  
  // Determine pages based on project type
  const pages: PageComposition[] = [];
  
  // Home page (always)
  const heroPattern = recommendPattern(registry, "landing", context);
  const featuresPattern = recommendPattern(registry, "features", context);
  const testimonialsPattern = recommendPattern(registry, "testimonials", context);
  const ctaPattern = recommendPattern(registry, "cta", context);
  
  pages.push({
    path: "/",
    title: "Home",
    layout: "marketing",
    slots: [
      heroPattern && {
        slot: "hero",
        pattern: heroPattern.id,
        reason: `Selected ${heroPattern.name} as best fit for ${context.type}`,
      },
      featuresPattern && {
        slot: "features",
        pattern: featuresPattern.id,
        reason: `${featuresPattern.name} showcases product capabilities`,
      },
      testimonialsPattern && {
        slot: "testimonials",
        pattern: testimonialsPattern.id,
        reason: `${testimonialsPattern.name} provides social proof`,
      },
      ctaPattern && {
        slot: "cta",
        pattern: ctaPattern.id,
        reason: `${ctaPattern.name} drives conversions`,
      },
    ].filter(Boolean) as PatternSlot[],
  });
  
  // Pricing page (for SaaS/subscription)
  if (context.type === "saas" || context.features?.includes("pricing")) {
    const pricingPattern = recommendPattern(registry, "pricing", context);
    const faqPattern = recommendPattern(registry, "faq", context);
    
    pages.push({
      path: "/pricing",
      title: "Pricing",
      layout: "marketing",
      slots: [
        pricingPattern && {
          slot: "pricing",
          pattern: pricingPattern.id,
          reason: `${pricingPattern.name} for plan comparison`,
        },
        faqPattern && {
          slot: "faq",
          pattern: faqPattern.id,
          reason: `${faqPattern.name} answers pricing questions`,
        },
      ].filter(Boolean) as PatternSlot[],
    });
  }
  
  // Dashboard (for apps)
  if (context.type === "saas" || context.features?.includes("dashboard")) {
    const dashboardPattern = recommendPattern(registry, "dashboard", context);
    
    pages.push({
      path: "/dashboard",
      title: "Dashboard",
      layout: "app",
      auth: true,
      slots: dashboardPattern
        ? [
            {
              slot: "content",
              pattern: dashboardPattern.id,
              reason: `${dashboardPattern.name} for app dashboard`,
            },
          ]
        : [],
    });
  }
  
  // Determine theme based on style
  const themeColors: Record<string, string> = {
    modern: "#6366f1",
    minimal: "#0ea5e9",
    bold: "#dc2626",
    classic: "#1e40af",
  };
  
  return {
    id: `custom-${Date.now()}`,
    name: context.name,
    description: context.description,
    pages,
    layouts: {
      marketing: {
        component: "marketing-layout",
        config: {
          logoText: context.name,
          navItems: [
            { label: "Features", href: "#features" },
            ...(pages.some((p) => p.path === "/pricing")
              ? [{ label: "Pricing", href: "/pricing" }]
              : []),
          ],
          ctaText: "Get Started",
          ctaHref: "/signup",
        },
      },
      app: {
        component: "app-layout",
        config: {},
      },
    },
    theme: {
      primaryColor: themeColors[context.style || "modern"],
      style: context.style || "modern",
    },
  };
}

/**
 * Validate a composition
 */
export async function validateComposition(
  composition: TemplateComposition
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
  const registry = await loadPatternRegistry();
  const patternIds = new Set(registry.patterns.map((p) => p.id));
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const page of composition.pages) {
    for (const slot of page.slots) {
      if (!patternIds.has(slot.pattern)) {
        errors.push(`Unknown pattern "${slot.pattern}" in page ${page.path}`);
      }
    }
    
    if (!page.layout) {
      warnings.push(`Page ${page.path} has no layout specified`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default {
  loadPatternRegistry,
  loadComposition,
  findPatterns,
  scorePattern,
  recommendPattern,
  composeTemplate,
  validateComposition,
};

