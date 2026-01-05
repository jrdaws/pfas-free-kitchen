/**
 * Pattern Loader
 * 
 * Utilities to load and instantiate patterns.
 */

import type { 
  Pattern, 
  PatternInstance, 
  PatternMetadata, 
  PatternContext,
  PatternVariant 
} from './types';
import { PATTERN_REGISTRY, getPattern, getCompatiblePatterns } from './registry';

/**
 * Load a pattern by ID
 */
export function loadPattern(patternId: string): Pattern | null {
  const pattern = getPattern(patternId);
  if (!pattern) {
    console.warn(`Pattern not found: ${patternId}`);
    return null;
  }
  return pattern;
}

/**
 * Load multiple patterns
 */
export function loadPatterns(patternIds: string[]): Pattern[] {
  return patternIds
    .map((id) => loadPattern(id))
    .filter((p): p is Pattern => p !== null);
}

/**
 * Get a pattern's variant by ID
 */
export function getPatternVariant(pattern: Pattern, variantId: string): PatternVariant | undefined {
  return pattern.variants.find((v) => v.id === variantId);
}

/**
 * Resolve pattern dependencies
 */
export function resolvePatternDependencies(patternId: string): Pattern[] {
  const pattern = loadPattern(patternId);
  if (!pattern) return [];
  
  const dependencies: Pattern[] = [];
  const seen = new Set<string>();
  
  function collectDeps(p: Pattern) {
    for (const depId of p.requires) {
      if (seen.has(depId)) continue;
      seen.add(depId);
      
      const dep = loadPattern(depId);
      if (dep) {
        dependencies.push(dep);
        collectDeps(dep);
      }
    }
  }
  
  collectDeps(pattern);
  return dependencies;
}

/**
 * Get all NPM dependencies for a set of patterns
 */
export function collectNpmDependencies(patterns: Pattern[]): string[] {
  const deps = new Set<string>();
  
  for (const pattern of patterns) {
    for (const dep of pattern.dependencies) {
      deps.add(dep);
    }
    
    // Also collect from required patterns
    for (const reqId of pattern.requires) {
      const req = loadPattern(reqId);
      if (req) {
        for (const dep of req.dependencies) {
          deps.add(dep);
        }
      }
    }
  }
  
  return Array.from(deps);
}

/**
 * Validate pattern props against slot definitions
 */
export function validatePatternProps(
  pattern: Pattern, 
  props: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const slot of pattern.slots) {
    const value = props[slot.name];
    
    // Check required
    if (slot.required && value === undefined) {
      errors.push(`Missing required prop: ${slot.name}`);
      continue;
    }
    
    // Skip validation if not provided
    if (value === undefined) continue;
    
    // Type validation
    switch (slot.type) {
      case 'text':
        if (typeof value !== 'string') {
          errors.push(`${slot.name} must be a string`);
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          errors.push(`${slot.name} must be a number`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${slot.name} must be a boolean`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${slot.name} must be an array`);
        } else if (slot.validation) {
          if (slot.validation.minItems && value.length < slot.validation.minItems) {
            errors.push(`${slot.name} must have at least ${slot.validation.minItems} items`);
          }
          if (slot.validation.maxItems && value.length > slot.validation.maxItems) {
            errors.push(`${slot.name} must have at most ${slot.validation.maxItems} items`);
          }
        }
        break;
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get default props for a pattern
 */
export function getPatternDefaults(pattern: Pattern): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  
  for (const slot of pattern.slots) {
    if (slot.defaultValue !== undefined) {
      defaults[slot.name] = slot.defaultValue;
    }
  }
  
  return defaults;
}

/**
 * Merge props with defaults
 */
export function mergePatternProps(
  pattern: Pattern, 
  props: Record<string, unknown>
): Record<string, unknown> {
  const defaults = getPatternDefaults(pattern);
  return { ...defaults, ...props };
}

/**
 * Get slots that need AI generation
 */
export function getAiGeneratableSlots(pattern: Pattern): Pattern['slots'] {
  return pattern.slots.filter((slot) => slot.aiGenerate);
}

/**
 * Generate AI prompts for a pattern's slots
 */
export function generateAiPrompts(
  pattern: Pattern, 
  context: PatternContext
): Record<string, string> {
  const prompts: Record<string, string> = {};
  
  const aiSlots = getAiGeneratableSlots(pattern);
  
  for (const slot of aiSlots) {
    let prompt = slot.aiPrompt || `Generate ${slot.name} for a ${slot.type}`;
    
    // Add context
    prompt += `\n\nProject context:`;
    prompt += `\n- Name: ${context.projectName}`;
    prompt += `\n- Type: ${context.projectType}`;
    prompt += `\n- Description: ${context.projectDescription}`;
    
    if (context.targetAudience) {
      prompt += `\n- Target audience: ${context.targetAudience}`;
    }
    if (context.voiceTone) {
      prompt += `\n- Voice/tone: ${context.voiceTone}`;
    }
    
    prompts[slot.name] = prompt;
  }
  
  return prompts;
}

/**
 * Find patterns that match criteria
 */
export function findPatterns(criteria: {
  category?: Pattern['category'];
  tags?: string[];
  compatibleWith?: string;
  bestFor?: string[];
}): Pattern[] {
  return Object.values(PATTERN_REGISTRY).filter((pattern) => {
    if (criteria.category && pattern.category !== criteria.category) {
      return false;
    }
    
    if (criteria.compatibleWith) {
      const isCompatible = 
        pattern.compatibleWith.includes('all') || 
        pattern.compatibleWith.includes(criteria.compatibleWith as any);
      if (!isCompatible) return false;
    }
    
    if (criteria.tags?.length) {
      const hasTag = criteria.tags.some((t) => pattern.tags.includes(t));
      if (!hasTag) return false;
    }
    
    if (criteria.bestFor?.length) {
      const hasBestFor = criteria.bestFor.some((b) => pattern.bestFor.includes(b));
      if (!hasBestFor) return false;
    }
    
    return true;
  });
}

/**
 * Get pattern hierarchy (dependencies in correct order)
 */
export function getPatternHierarchy(patternId: string): Pattern[] {
  const pattern = loadPattern(patternId);
  if (!pattern) return [];
  
  const hierarchy: Pattern[] = [];
  const visited = new Set<string>();
  
  function visit(p: Pattern) {
    if (visited.has(p.id)) return;
    visited.add(p.id);
    
    // Visit dependencies first
    for (const depId of p.requires) {
      const dep = loadPattern(depId);
      if (dep) visit(dep);
    }
    
    hierarchy.push(p);
  }
  
  visit(pattern);
  return hierarchy;
}

/**
 * Check if patterns are compatible together
 */
export function arePatternsCompatible(patternIds: string[]): boolean {
  const patterns = loadPatterns(patternIds);
  if (patterns.length !== patternIds.length) return false;
  
  // Check if any pattern excludes others
  // For now, all patterns are compatible
  return true;
}

/**
 * Create pattern summary for documentation
 */
export function createPatternSummary(pattern: Pattern): string {
  const requiredSlots = pattern.slots.filter((s) => s.required);
  const optionalSlots = pattern.slots.filter((s) => !s.required);
  
  return `# ${pattern.name}

${pattern.description}

**Category:** ${pattern.category}
**Version:** ${pattern.version}

## Slots

### Required
${requiredSlots.map((s) => `- \`${s.name}\` (${s.type}): ${s.description || 'No description'}`).join('\n') || 'None'}

### Optional
${optionalSlots.map((s) => `- \`${s.name}\` (${s.type}): ${s.description || 'No description'}`).join('\n') || 'None'}

## Variants
${pattern.variants.map((v) => `- **${v.name}** (\`${v.id}\`)`).join('\n')}

## Dependencies
${pattern.dependencies.length > 0 ? pattern.dependencies.join(', ') : 'None'}

## Tags
${pattern.tags.join(', ')}
`;
}

export default {
  loadPattern,
  loadPatterns,
  getPatternVariant,
  resolvePatternDependencies,
  collectNpmDependencies,
  validatePatternProps,
  getPatternDefaults,
  mergePatternProps,
  getAiGeneratableSlots,
  generateAiPrompts,
  findPatterns,
  getPatternHierarchy,
  arePatternsCompatible,
  createPatternSummary,
};

