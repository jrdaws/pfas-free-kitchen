/**
 * Pattern Registry
 * 
 * Provides access to all pattern definitions and their React components.
 * Integrates with the existing composer/patterns registry.
 */

import { PatternDefinition, PatternCategory, PatternRegistryInterface } from "./types";
import { getAllPatterns, getPatternById } from "../composer/patterns";
import type { RegistryPattern } from "../composer/patterns";

// Convert composer registry pattern to our PatternDefinition format
function toPatternDefinition(pattern: RegistryPattern): PatternDefinition {
  return {
    id: pattern.id,
    name: pattern.name,
    category: pattern.category as PatternCategory,
    description: pattern.aiGuidance,
    tags: pattern.tags || [],
    variants: pattern.variants || ["default"],
    slots: (pattern.slots || []).map((slot) => ({
      name: slot.name,
      type: slot.type as "text" | "richText" | "image" | "array" | "boolean" | "number",
      required: slot.required,
      maxLength: slot.maxLength,
      defaultValue: slot.defaultValue,
      aspectRatio: slot.aspectRatio,
      aiPrompt: slot.aiPrompt,
    })),
    bestFor: pattern.tags?.filter((t) => ["saas", "ecommerce", "portfolio", "landing"].includes(t)),
    mobileOptimized: true,
    inspirationSources: pattern.inspirationSources,
    aiGuidance: pattern.aiGuidance,
    defaultVariant: pattern.variants?.[0] || "default",
    defaultProps: extractDefaultProps(pattern),
  };
}

// Extract default props from slot definitions
function extractDefaultProps(pattern: RegistryPattern): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const slot of pattern.slots || []) {
    if (slot.defaultValue !== undefined) {
      props[slot.name] = slot.defaultValue;
    }
  }
  return props;
}

// Build the pattern registry
class PatternRegistry implements PatternRegistryInterface {
  patterns: Record<string, PatternDefinition> = {};
  categories: Record<PatternCategory, string[]> = {
    hero: [],
    features: [],
    pricing: [],
    testimonials: [],
    cta: [],
    faq: [],
    team: [],
    stats: [],
    logos: [],
    footer: [],
    navigation: [],
    content: [],
    commerce: [],
    dashboard: [],
    auth: [],
  };

  constructor() {
    this.loadPatterns();
  }

  private loadPatterns(): void {
    const registryPatterns = getAllPatterns();

    for (const pattern of registryPatterns) {
      const def = toPatternDefinition(pattern);
      this.patterns[def.id] = def;

      const category = def.category as PatternCategory;
      if (this.categories[category]) {
        this.categories[category].push(def.id);
      }
    }
  }

  getPattern(id: string): PatternDefinition | null {
    return this.patterns[id] || null;
  }

  getByCategory(category: PatternCategory): PatternDefinition[] {
    const ids = this.categories[category] || [];
    return ids.map((id) => this.patterns[id]).filter(Boolean);
  }

  search(query: string): PatternDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.patterns).filter(
      (pattern) =>
        pattern.name.toLowerCase().includes(lowerQuery) ||
        pattern.description?.toLowerCase().includes(lowerQuery) ||
        pattern.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getPatternIds(): string[] {
    return Object.keys(this.patterns);
  }

  getAllCategories(): PatternCategory[] {
    return Object.keys(this.categories) as PatternCategory[];
  }
}

// Singleton instance
export const patternRegistry = new PatternRegistry();

// Convenience exports
export const getPattern = (id: string) => patternRegistry.getPattern(id);
export const getByCategory = (category: PatternCategory) => patternRegistry.getByCategory(category);
export const searchPatterns = (query: string) => patternRegistry.search(query);
export const getAllPatternIds = () => patternRegistry.getPatternIds();
export const getAllCategories = () => patternRegistry.getAllCategories();

export default patternRegistry;

