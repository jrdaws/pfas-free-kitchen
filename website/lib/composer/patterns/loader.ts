/**
 * Pattern Registry Loader
 * 
 * Loads patterns from the JSON registry and provides utility functions
 * for querying and filtering patterns.
 */

import registryData from "./registry.json";

// ============================================================================
// Types
// ============================================================================

export interface PatternSlot {
  name: string;
  type: string;
  required: boolean;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  defaultValue?: unknown;
  options?: string[];
  aiPrompt?: string;
  validation?: string;
  aspectRatio?: string;
  min?: number;
  max?: number;
  itemSchema?: Record<string, string | { type: string; options?: string[] }>;
}

export interface RegistryPattern {
  id: string;
  name: string;
  category: string;
  variants: string[];
  tags: string[];
  slots: PatternSlot[];
  aiGuidance: string;
  inspirationSources: string[];
}

export interface PatternRegistry {
  $schema: string;
  version: string;
  totalPatterns: number;
  categories: string[];
  patterns: RegistryPattern[];
}

// ============================================================================
// Registry Access
// ============================================================================

const registry = registryData as PatternRegistry;

/**
 * Get all patterns from the registry
 */
export function getAllPatterns(): RegistryPattern[] {
  return registry.patterns;
}

/**
 * Get a single pattern by ID
 */
export function getPatternById(id: string): RegistryPattern | undefined {
  return registry.patterns.find(p => p.id === id);
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(category: string): RegistryPattern[] {
  return registry.patterns.filter(p => p.category === category);
}

/**
 * Get patterns by tag
 */
export function getPatternsByTag(tag: string): RegistryPattern[] {
  return registry.patterns.filter(p => p.tags.includes(tag));
}

/**
 * Get patterns by multiple tags (OR match)
 */
export function getPatternsByTags(tags: string[]): RegistryPattern[] {
  return registry.patterns.filter(p => 
    tags.some(tag => p.tags.includes(tag))
  );
}

/**
 * Get all available categories
 */
export function getCategories(): string[] {
  return registry.categories;
}

/**
 * Get registry metadata
 */
export function getRegistryInfo(): { version: string; totalPatterns: number; categories: string[] } {
  return {
    version: registry.version,
    totalPatterns: registry.totalPatterns,
    categories: registry.categories,
  };
}

/**
 * Search patterns by text (searches name, tags, and aiGuidance)
 */
export function searchPatterns(query: string): RegistryPattern[] {
  const lowerQuery = query.toLowerCase();
  return registry.patterns.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    p.aiGuidance.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get patterns similar to a given pattern based on tags
 */
export function getSimilarPatterns(patternId: string, limit = 5): RegistryPattern[] {
  const pattern = getPatternById(patternId);
  if (!pattern) return [];

  return registry.patterns
    .filter(p => p.id !== patternId)
    .map(p => ({
      pattern: p,
      score: p.tags.filter(t => pattern.tags.includes(t)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ pattern }) => pattern);
}

/**
 * Get patterns inspired by a specific source
 */
export function getPatternsByInspiration(source: string): RegistryPattern[] {
  const lowerSource = source.toLowerCase();
  return registry.patterns.filter(p => 
    p.inspirationSources.some(s => s.toLowerCase().includes(lowerSource))
  );
}

/**
 * Convert registry pattern to the selector format
 */
export function toSelectorPattern(pattern: RegistryPattern): {
  id: string;
  name: string;
  category: string;
  variants: string[];
  tags: string[];
  slots: PatternSlot[];
} {
  return {
    id: pattern.id,
    name: pattern.name,
    category: pattern.category,
    variants: pattern.variants,
    tags: pattern.tags,
    slots: pattern.slots,
  };
}

/**
 * Get all patterns in selector format
 */
export function getAllSelectorPatterns() {
  return registry.patterns.map(toSelectorPattern);
}

/**
 * Get patterns recommended for a specific use case
 */
export function getRecommendedPatterns(useCase: {
  type?: 'saas' | 'ecommerce' | 'portfolio' | 'blog' | 'dashboard';
  tone?: 'minimal' | 'playful' | 'professional' | 'premium';
  features?: string[];
}): RegistryPattern[] {
  const { type, tone, features = [] } = useCase;
  
  // Build tag list based on use case
  const targetTags: string[] = [...features];
  
  if (type === 'saas') targetTags.push('saas', 'subscription', 'product');
  if (type === 'ecommerce') targetTags.push('ecommerce', 'shop', 'product');
  if (type === 'portfolio') targetTags.push('portfolio', 'creative', 'showcase');
  if (type === 'blog') targetTags.push('blog', 'content', 'editorial');
  if (type === 'dashboard') targetTags.push('dashboard', 'analytics', 'data');
  
  if (tone === 'minimal') targetTags.push('minimal', 'clean');
  if (tone === 'playful') targetTags.push('dynamic', 'creative', 'modern');
  if (tone === 'professional') targetTags.push('professional', 'trust');
  if (tone === 'premium') targetTags.push('premium', 'luxury');
  
  // Score patterns by tag matches
  return registry.patterns
    .map(p => ({
      pattern: p,
      score: p.tags.filter(t => targetTags.includes(t)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ pattern }) => pattern);
}

/**
 * Get AI guidance for pattern selection
 */
export function getPatternGuidance(patternId: string): string | undefined {
  return getPatternById(patternId)?.aiGuidance;
}

/**
 * Validate if a pattern exists
 */
export function patternExists(patternId: string): boolean {
  return registry.patterns.some(p => p.id === patternId);
}

