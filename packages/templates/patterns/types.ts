/**
 * Pattern Schema Types
 * 
 * Defines the structure every pattern must follow.
 * Enables atomic design composition with AI-generated content.
 */

export type PatternCategory = 'atom' | 'molecule' | 'organism' | 'section' | 'layout';

export type SlotType = 'text' | 'image' | 'component' | 'array' | 'boolean' | 'number' | 'object';

export interface PatternSlot {
  /** Slot identifier (e.g., "headline", "image") */
  name: string;
  
  /** Type of content this slot accepts */
  type: SlotType;
  
  /** Whether this slot must be provided */
  required: boolean;
  
  /** Default value if not provided */
  defaultValue?: unknown;
  
  /** AI prompt to generate this content */
  aiPrompt?: string;
  
  /** Whether AI should generate this automatically */
  aiGenerate?: boolean;
  
  /** Human-readable description */
  description?: string;
  
  /** Validation rules */
  validation?: {
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    pattern?: string;
  };
}

export interface PatternVariant {
  /** Variant identifier (e.g., "light", "dark", "minimal") */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Tailwind classes or CSS overrides */
  className?: string;
  
  /** Component path for full variant replacement */
  component?: string;
}

export interface Pattern {
  /** Unique pattern identifier (e.g., "hero-split-image") */
  id: string;
  
  /** Human-readable name (e.g., "Hero with Split Image") */
  name: string;
  
  /** Pattern category in atomic design hierarchy */
  category: PatternCategory;
  
  /** Brief description */
  description: string;
  
  /** Version for tracking changes */
  version: string;
  
  /** Content slots this pattern accepts */
  slots: PatternSlot[];
  
  /** Template types this works with */
  compatibleWith: ('saas' | 'ecommerce' | 'blog' | 'portfolio' | 'agency' | 'all')[];
  
  /** Pattern IDs this depends on */
  requires: string[];
  
  /** Available style variants */
  variants: PatternVariant[];
  
  /** Path to React component */
  component: string;
  
  /** Path to preview thumbnail */
  thumbnail?: string;
  
  /** NPM dependencies required */
  dependencies: string[];
  
  /** Tags for search/filtering */
  tags: string[];
  
  /** Best use cases */
  bestFor: string[];
}

/**
 * Pattern Metadata (JSON file format)
 */
export interface PatternMetadata {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  version: string;
  slots: PatternSlot[];
  compatibleWith: string[];
  requires: string[];
  variants: PatternVariant[];
  dependencies: string[];
  tags: string[];
  bestFor: string[];
}

/**
 * Page Composition
 */
export interface PageSlot {
  /** Slot position (e.g., "hero", "features") */
  slot: string;
  
  /** Pattern ID to use */
  patternId: string;
  
  /** Pattern variant to apply */
  variant?: string;
  
  /** Props to pass to pattern */
  props?: Record<string, unknown>;
  
  /** AI generation context */
  aiContext?: string;
}

export interface PageComposition {
  /** Page path (e.g., "/", "/pricing") */
  path: string;
  
  /** Page title */
  title: string;
  
  /** Layout pattern ID */
  layout: string;
  
  /** Whether page requires authentication */
  auth?: boolean;
  
  /** Pattern slots for this page */
  slots: PageSlot[];
}

export interface TemplateComposition {
  /** Unique composition ID */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Pages in this composition */
  pages: PageComposition[];
  
  /** Theme configuration */
  theme: {
    primaryColor: string;
    style: 'modern' | 'minimal' | 'bold' | 'classic';
    fontFamily?: string;
  };
  
  /** Global metadata */
  metadata: {
    author?: string;
    version: string;
    createdAt: string;
  };
}

/**
 * Pattern Instance (runtime)
 */
export interface PatternInstance {
  /** Pattern definition */
  pattern: Pattern;
  
  /** Resolved props */
  props: Record<string, unknown>;
  
  /** Applied variant */
  variant?: PatternVariant;
  
  /** React component */
  Component: React.ComponentType<Record<string, unknown>>;
}

/**
 * Pattern Context for AI generation
 */
export interface PatternContext {
  projectName: string;
  projectType: string;
  projectDescription: string;
  targetAudience?: string;
  voiceTone?: string;
  existingPatterns?: string[];
}

