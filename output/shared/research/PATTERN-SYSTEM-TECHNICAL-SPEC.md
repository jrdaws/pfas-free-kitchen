# Pattern System Technical Specification

## Overview

This document defines the TypeScript types and React components for the WYSIWYG pattern library and section renderer system.

---

## Part 1: Core Type Definitions

### `website/lib/patterns/types.ts`

```typescript
/**
 * PATTERN SYSTEM TYPES
 * Single source of truth for preview and export
 */

// ============================================
// DESIGN TOKENS
// ============================================

export interface ColorScheme {
  primary: string;       // Main brand color
  secondary: string;     // Supporting color
  accent: string;        // Highlight/CTA color
  background: string;    // Page background
  foreground: string;    // Primary text
  muted: string;         // Secondary text
  border: string;        // Borders
  card: string;          // Card backgrounds
  destructive: string;   // Error states
  success: string;       // Success states
}

export interface FontScheme {
  heading: string;       // e.g., "Cal Sans", "Inter"
  body: string;          // e.g., "Inter", "system-ui"
  mono: string;          // e.g., "JetBrains Mono"
}

export interface SpacingScheme {
  containerMax: string;  // e.g., "1280px"
  sectionPadding: string; // e.g., "py-24"
  componentGap: string;   // e.g., "gap-8"
}

export interface BrandingConfig {
  colors: ColorScheme;
  fonts: FontScheme;
  spacing: SpacingScheme;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadowStyle: 'none' | 'subtle' | 'medium' | 'dramatic';
}

// ============================================
// PATTERN DEFINITIONS
// ============================================

export type PatternCategory = 
  | 'hero'
  | 'features'
  | 'pricing'
  | 'testimonials'
  | 'cta'
  | 'faq'
  | 'team'
  | 'stats'
  | 'logos'
  | 'footer'
  | 'navigation';

export interface PatternMetadata {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  thumbnail: string;           // Path to preview image
  source?: string;             // "Inspired by linear.app"
  tags: string[];              // ["saas", "minimal", "dark"]
  bestFor: string[];           // ["landing-page", "saas"]
  mobileOptimized: boolean;
  conversionScore?: number;    // 1-10 industry rating
}

export interface PatternVariant {
  id: string;
  name: string;
  description: string;
  defaultProps: Record<string, unknown>;
}

export interface PatternDefinition extends PatternMetadata {
  variants: PatternVariant[];
  defaultVariant: string;
  requiredProps: string[];
  optionalProps: string[];
  defaultProps: Record<string, unknown>;
}

// ============================================
// SECTION CONFIGURATION
// ============================================

export interface SectionConfig {
  id: string;                  // Unique ID for this section instance
  patternId: string;           // Links to pattern in registry
  variantId?: string;          // Specific variant to use
  props: Record<string, unknown>;  // Actual props for component
  customizations: {
    hidden?: boolean;          // Don't render this section
    order?: number;            // Override default ordering
    className?: string;        // Additional CSS classes
  };
}

// ============================================
// PAGE CONFIGURATION
// ============================================

export interface PageConfig {
  path: string;                // "/" or "/pricing"
  title: string;               // Page title
  description?: string;        // Meta description
  sections: SectionConfig[];   // Ordered sections
  layout?: 'default' | 'narrow' | 'full-width';
}

// ============================================
// PROJECT DEFINITION
// ============================================

export interface ProjectDefinition {
  meta: {
    name: string;
    description: string;
    template: string;          // "saas", "ecommerce", etc.
    createdAt: string;
    version: string;
  };
  
  branding: BrandingConfig;
  
  pages: PageConfig[];
  
  // Global components
  navigation: {
    patternId: string;
    props: Record<string, unknown>;
  };
  footer: {
    patternId: string;
    props: Record<string, unknown>;
  };
  
  // Integration configuration
  integrations: Record<string, string>;
  
  // Features enabled
  features: string[];
  
  // Source inspiration
  inspiration?: {
    url: string;
    analyzedAt: string;
    appliedPatterns: string[];
  };
}

// ============================================
// PATTERN REGISTRY
// ============================================

export interface PatternRegistry {
  patterns: Record<string, PatternDefinition>;
  categories: Record<PatternCategory, string[]>;  // Category → pattern IDs
  
  getPattern(id: string): PatternDefinition | null;
  getByCategory(category: PatternCategory): PatternDefinition[];
  search(query: string): PatternDefinition[];
}

// ============================================
// WEBSITE ANALYSIS (from Firecrawl)
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
    headerStyle: 'sticky' | 'fixed' | 'static';
    navigationPattern: 'horizontal' | 'sidebar' | 'hamburger' | 'mega-menu';
    footerSections: number;
    heroPattern: 'centered' | 'split' | 'video' | 'gradient' | 'image';
    contentWidth: 'full' | 'contained' | 'narrow';
  };
  
  sections: {
    type: PatternCategory;
    layout: 'grid' | 'list' | 'carousel' | 'split' | 'stacked';
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
    framework: 'next' | 'react' | 'vue' | 'astro' | 'unknown';
    uiLibrary: 'tailwind' | 'shadcn' | 'chakra' | 'material' | 'custom';
    animations: 'framer' | 'gsap' | 'css' | 'none';
  };
}
```

---

## Part 2: Pattern Registry Implementation

### `website/lib/patterns/registry.ts`

```typescript
import { PatternDefinition, PatternCategory, PatternRegistry } from './types';

// Pattern definitions will be imported from individual files
import * as heroPatterns from './patterns/heroes';
import * as featurePatterns from './patterns/features';
import * as pricingPatterns from './patterns/pricing';
import * as testimonialPatterns from './patterns/testimonials';
import * as ctaPatterns from './patterns/ctas';
import * as navigationPatterns from './patterns/navigation';
import * as footerPatterns from './patterns/footers';

// Build the registry
const allPatterns: Record<string, PatternDefinition> = {
  ...heroPatterns,
  ...featurePatterns,
  ...pricingPatterns,
  ...testimonialPatterns,
  ...ctaPatterns,
  ...navigationPatterns,
  ...footerPatterns,
};

// Index by category
const categoryIndex: Record<PatternCategory, string[]> = {
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
};

// Build category index
Object.entries(allPatterns).forEach(([id, pattern]) => {
  categoryIndex[pattern.category].push(id);
});

export const patternRegistry: PatternRegistry = {
  patterns: allPatterns,
  categories: categoryIndex,
  
  getPattern(id: string) {
    return allPatterns[id] || null;
  },
  
  getByCategory(category: PatternCategory) {
    return categoryIndex[category].map(id => allPatterns[id]);
  },
  
  search(query: string) {
    const lowerQuery = query.toLowerCase();
    return Object.values(allPatterns).filter(pattern => 
      pattern.name.toLowerCase().includes(lowerQuery) ||
      pattern.description.toLowerCase().includes(lowerQuery) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },
};

export default patternRegistry;
```

---

## Part 3: Example Pattern Definition

### `website/lib/patterns/patterns/heroes/centered-gradient.ts`

```typescript
import { PatternDefinition } from '../../types';

export const heroCenteredGradient: PatternDefinition = {
  id: 'hero-centered-gradient',
  name: 'Centered Gradient Hero',
  category: 'hero',
  description: 'A centered hero with gradient background, headline, subheadline, and dual CTAs',
  thumbnail: '/patterns/hero-centered-gradient.png',
  source: 'Inspired by Linear.app',
  tags: ['saas', 'modern', 'gradient', 'centered'],
  bestFor: ['saas', 'landing-page', 'product-launch'],
  mobileOptimized: true,
  conversionScore: 9,
  
  variants: [
    {
      id: 'dark',
      name: 'Dark Mode',
      description: 'Dark gradient background with light text',
      defaultProps: {
        gradientFrom: '#0f0f0f',
        gradientTo: '#1a1a2e',
        textColor: 'white',
      },
    },
    {
      id: 'light',
      name: 'Light Mode',
      description: 'Light gradient background with dark text',
      defaultProps: {
        gradientFrom: '#fafafa',
        gradientTo: '#f0f0f0',
        textColor: 'black',
      },
    },
    {
      id: 'brand',
      name: 'Brand Gradient',
      description: 'Uses primary brand colors for gradient',
      defaultProps: {
        gradientFrom: 'var(--primary)',
        gradientTo: 'var(--secondary)',
        textColor: 'white',
      },
    },
  ],
  
  defaultVariant: 'dark',
  
  requiredProps: ['headline', 'subheadline'],
  optionalProps: ['primaryCta', 'secondaryCta', 'badge', 'image'],
  
  defaultProps: {
    headline: 'Build the Future of Your Product',
    subheadline: 'A modern platform that helps you ship faster with less complexity.',
    primaryCta: {
      text: 'Get Started Free',
      href: '/signup',
    },
    secondaryCta: {
      text: 'Watch Demo',
      href: '/demo',
    },
    badge: 'Now in public beta',
    showGradientOrb: true,
    animate: true,
  },
};
```

---

## Part 4: Section Renderer Component

### `website/components/preview/SectionRenderer.tsx`

```tsx
import React from 'react';
import { SectionConfig, BrandingConfig } from '@/lib/patterns/types';
import { patternRegistry } from '@/lib/patterns/registry';

// Import all pattern components
import { HeroCenteredGradient } from './sections/HeroCenteredGradient';
import { HeroSplitImage } from './sections/HeroSplitImage';
import { FeaturesIconGrid } from './sections/FeaturesIconGrid';
import { FeaturesBentoGrid } from './sections/FeaturesBentoGrid';
import { PricingThreeTier } from './sections/PricingThreeTier';
import { TestimonialsCarousel } from './sections/TestimonialsCarousel';
import { CtaSimple } from './sections/CtaSimple';
// ... more imports

// Component registry maps pattern IDs to React components
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'hero-centered-gradient': HeroCenteredGradient,
  'hero-split-image': HeroSplitImage,
  'features-icon-grid': FeaturesIconGrid,
  'features-bento-grid': FeaturesBentoGrid,
  'pricing-three-tier': PricingThreeTier,
  'testimonials-carousel': TestimonialsCarousel,
  'cta-simple': CtaSimple,
  // ... more mappings
};

interface SectionRendererProps {
  section: SectionConfig;
  branding: BrandingConfig;
  editable?: boolean;
  onPropsChange?: (newProps: Record<string, unknown>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function SectionRenderer({
  section,
  branding,
  editable = false,
  onPropsChange,
  onSelect,
  isSelected = false,
}: SectionRendererProps) {
  const Component = COMPONENT_MAP[section.patternId];
  
  if (!Component) {
    return (
      <div className="p-8 bg-muted text-center">
        <p className="text-muted-foreground">
          Pattern not found: <code>{section.patternId}</code>
        </p>
      </div>
    );
  }
  
  // Get variant props if specified
  const pattern = patternRegistry.getPattern(section.patternId);
  const variant = section.variantId 
    ? pattern?.variants.find(v => v.id === section.variantId)
    : pattern?.variants.find(v => v.id === pattern.defaultVariant);
  
  // Merge props: default → variant → section-specific
  const mergedProps = {
    ...pattern?.defaultProps,
    ...variant?.defaultProps,
    ...section.props,
  };
  
  if (section.customizations.hidden) {
    return null;
  }
  
  return (
    <div
      className={cn(
        'relative group',
        section.customizations.className,
        isSelected && 'ring-2 ring-primary ring-offset-2',
        editable && 'cursor-pointer hover:ring-1 hover:ring-muted-foreground/50',
      )}
      onClick={editable ? onSelect : undefined}
      data-section-id={section.id}
      data-pattern-id={section.patternId}
    >
      {editable && isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <SectionToolbar
            section={section}
            pattern={pattern!}
            onPropsChange={onPropsChange}
          />
        </div>
      )}
      
      <Component
        {...mergedProps}
        branding={branding}
        editable={editable}
        onTextChange={editable ? (path: string, value: string) => {
          onPropsChange?.({ ...mergedProps, [path]: value });
        } : undefined}
      />
    </div>
  );
}

// Utility for className merging
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
```

---

## Part 5: Dynamic Preview Renderer

### `website/components/preview/DynamicPreviewRenderer.tsx`

```tsx
import React, { useState } from 'react';
import { ProjectDefinition, PageConfig, BrandingConfig } from '@/lib/patterns/types';
import { SectionRenderer } from './SectionRenderer';
import { NavigationRenderer } from './NavigationRenderer';
import { FooterRenderer } from './FooterRenderer';

interface DynamicPreviewRendererProps {
  definition: ProjectDefinition;
  currentPage?: string;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  editable?: boolean;
  onDefinitionChange?: (newDef: ProjectDefinition) => void;
}

export function DynamicPreviewRenderer({
  definition,
  currentPage = '/',
  viewport = 'desktop',
  editable = false,
  onDefinitionChange,
}: DynamicPreviewRendererProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  const page = definition.pages.find(p => p.path === currentPage);
  
  if (!page) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Page not found: {currentPage}</p>
      </div>
    );
  }
  
  const viewportWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  }[viewport];
  
  const handleSectionPropsChange = (sectionId: string, newProps: Record<string, unknown>) => {
    if (!onDefinitionChange) return;
    
    const updatedPages = definition.pages.map(p => {
      if (p.path !== currentPage) return p;
      
      return {
        ...p,
        sections: p.sections.map(s => 
          s.id === sectionId ? { ...s, props: newProps } : s
        ),
      };
    });
    
    onDefinitionChange({
      ...definition,
      pages: updatedPages,
    });
  };
  
  return (
    <div 
      className="bg-background overflow-auto"
      style={{ width: viewportWidth, margin: viewport !== 'desktop' ? '0 auto' : undefined }}
    >
      <ThemeProvider branding={definition.branding}>
        {/* Navigation */}
        <NavigationRenderer
          config={definition.navigation}
          branding={definition.branding}
          pages={definition.pages.map(p => ({ path: p.path, title: p.title }))}
          editable={editable}
        />
        
        {/* Page Sections */}
        <main>
          {page.sections
            .sort((a, b) => (a.customizations.order ?? 0) - (b.customizations.order ?? 0))
            .map(section => (
              <SectionRenderer
                key={section.id}
                section={section}
                branding={definition.branding}
                editable={editable}
                isSelected={selectedSectionId === section.id}
                onSelect={() => setSelectedSectionId(section.id)}
                onPropsChange={(newProps) => handleSectionPropsChange(section.id, newProps)}
              />
            ))}
        </main>
        
        {/* Footer */}
        <FooterRenderer
          config={definition.footer}
          branding={definition.branding}
          editable={editable}
        />
      </ThemeProvider>
    </div>
  );
}

// Theme provider that applies branding as CSS variables
function ThemeProvider({ 
  branding, 
  children 
}: { 
  branding: BrandingConfig; 
  children: React.ReactNode;
}) {
  const style = {
    '--primary': branding.colors.primary,
    '--secondary': branding.colors.secondary,
    '--accent': branding.colors.accent,
    '--background': branding.colors.background,
    '--foreground': branding.colors.foreground,
    '--muted': branding.colors.muted,
    '--border': branding.colors.border,
    '--card': branding.colors.card,
    '--font-heading': branding.fonts.heading,
    '--font-body': branding.fonts.body,
    '--font-mono': branding.fonts.mono,
    '--container-max': branding.spacing.containerMax,
  } as React.CSSProperties;
  
  return (
    <div style={style} className="font-body">
      {children}
    </div>
  );
}
```

---

## Part 6: Export Generator Integration

### `website/lib/generator/definition-to-code.ts`

```typescript
import { ProjectDefinition, SectionConfig } from '@/lib/patterns/types';
import { GeneratedFile } from './types';
import { patternRegistry } from '@/lib/patterns/registry';

/**
 * Generate project files from a ProjectDefinition
 * Ensures preview matches export exactly
 */
export async function generateFromDefinition(
  definition: ProjectDefinition
): Promise<{
  files: GeneratedFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}> {
  const files: GeneratedFile[] = [];
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {};
  
  // 1. Generate theme file
  files.push({
    path: 'lib/theme.ts',
    content: generateThemeFile(definition.branding),
    overwrite: true,
  });
  
  // 2. Generate Tailwind config
  files.push({
    path: 'tailwind.config.ts',
    content: generateTailwindConfig(definition.branding),
    overwrite: true,
  });
  
  // 3. Generate page files
  for (const page of definition.pages) {
    files.push({
      path: `app${page.path === '/' ? '' : page.path}/page.tsx`,
      content: generatePageComponent(page, definition),
      overwrite: true,
    });
  }
  
  // 4. Generate section components (only those used)
  const usedPatterns = new Set<string>();
  for (const page of definition.pages) {
    for (const section of page.sections) {
      usedPatterns.add(section.patternId);
    }
  }
  usedPatterns.add(definition.navigation.patternId);
  usedPatterns.add(definition.footer.patternId);
  
  for (const patternId of usedPatterns) {
    const pattern = patternRegistry.getPattern(patternId);
    if (pattern) {
      files.push({
        path: `components/sections/${toComponentName(patternId)}.tsx`,
        content: generateSectionComponent(patternId),
        overwrite: true,
      });
    }
  }
  
  // 5. Generate root layout
  files.push({
    path: 'app/layout.tsx',
    content: generateRootLayout(definition),
    overwrite: true,
  });
  
  // Add required dependencies
  dependencies['@radix-ui/react-slot'] = '^1.0.2';
  dependencies['class-variance-authority'] = '^0.7.0';
  dependencies['clsx'] = '^2.1.0';
  dependencies['tailwind-merge'] = '^2.2.0';
  
  if (definition.branding.fonts.heading !== 'system-ui') {
    dependencies['@next/font'] = 'latest';
  }
  
  return { files, dependencies, devDependencies };
}

function generateThemeFile(branding: BrandingConfig): string {
  return `// Auto-generated theme from project definition
export const theme = ${JSON.stringify(branding, null, 2)} as const;

export type Theme = typeof theme;
`;
}

function generateTailwindConfig(branding: BrandingConfig): string {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${branding.colors.primary}",
        secondary: "${branding.colors.secondary}",
        accent: "${branding.colors.accent}",
        background: "${branding.colors.background}",
        foreground: "${branding.colors.foreground}",
        muted: "${branding.colors.muted}",
        border: "${branding.colors.border}",
        card: "${branding.colors.card}",
      },
      fontFamily: {
        heading: ["${branding.fonts.heading}", "sans-serif"],
        body: ["${branding.fonts.body}", "sans-serif"],
        mono: ["${branding.fonts.mono}", "monospace"],
      },
      borderRadius: {
        DEFAULT: "${branding.borderRadius === 'none' ? '0' : branding.borderRadius === 'sm' ? '0.25rem' : branding.borderRadius === 'md' ? '0.5rem' : branding.borderRadius === 'lg' ? '1rem' : '9999px'}",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

function generatePageComponent(page: PageConfig, definition: ProjectDefinition): string {
  const imports = page.sections
    .map(s => `import { ${toComponentName(s.patternId)} } from "@/components/sections/${toComponentName(s.patternId)}";`)
    .join('\n');
  
  const sections = page.sections
    .filter(s => !s.customizations.hidden)
    .sort((a, b) => (a.customizations.order ?? 0) - (b.customizations.order ?? 0))
    .map(s => `      <${toComponentName(s.patternId)} ${generatePropsString(s.props)} />`)
    .join('\n');
  
  return `${imports}

export default function ${toPageName(page.path)}() {
  return (
    <main>
${sections}
    </main>
  );
}
`;
}

function toComponentName(patternId: string): string {
  return patternId
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toPageName(path: string): string {
  if (path === '/') return 'HomePage';
  return path
    .split('/')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Page';
}

function generatePropsString(props: Record<string, unknown>): string {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`;
      }
      return `${key}={${JSON.stringify(value)}}`;
    })
    .join(' ');
}
```

---

## Part 7: Firecrawl Integration

### `website/app/api/analyze/website/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Firecrawl from '@mendable/firecrawl-js';
import { WebsiteAnalysis } from '@/lib/patterns/types';

const firecrawl = new Firecrawl({ 
  apiKey: process.env.FIRECRAWL_API_KEY! 
});

const analysisSchema = {
  type: 'object',
  properties: {
    design: {
      type: 'object',
      properties: {
        colorPalette: {
          type: 'object',
          properties: {
            primary: { type: 'string', description: 'Primary brand color as hex' },
            secondary: { type: 'string', description: 'Secondary color as hex' },
            accent: { type: 'string', description: 'Accent/CTA color as hex' },
            background: { type: 'array', items: { type: 'string' } },
            text: { type: 'array', items: { type: 'string' } },
          },
        },
        typography: {
          type: 'object',
          properties: {
            headingFont: { type: 'string' },
            bodyFont: { type: 'string' },
            sizes: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
    layout: {
      type: 'object',
      properties: {
        headerStyle: { type: 'string', enum: ['sticky', 'fixed', 'static'] },
        navigationPattern: { type: 'string', enum: ['horizontal', 'sidebar', 'hamburger', 'mega-menu'] },
        heroPattern: { type: 'string', enum: ['centered', 'split', 'video', 'gradient', 'image'] },
      },
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          layout: { type: 'string' },
          itemCount: { type: 'number' },
          order: { type: 'number' },
        },
      },
    },
    tech: {
      type: 'object',
      properties: {
        framework: { type: 'string' },
        uiLibrary: { type: 'string' },
      },
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    const result = await firecrawl.scrapeUrl(url, {
      pageOptions: {
        screenshot: true,
        fullPageScreenshot: true,
        waitFor: 2000,
      },
      extractorOptions: {
        mode: 'llm-extraction',
        extractionPrompt: `
          Analyze this website and extract detailed design information:
          
          1. COLOR PALETTE: Identify the primary brand color, secondary color, 
             accent/CTA color, background colors, and text colors. Provide as hex codes.
          
          2. TYPOGRAPHY: Identify the heading font family and body font family.
             List the font sizes used (in pixels).
          
          3. LAYOUT: Describe the header style (sticky/fixed/static), 
             navigation pattern (horizontal/sidebar/hamburger/mega-menu),
             and hero section pattern (centered/split/video/gradient/image).
          
          4. SECTIONS: List all page sections in order with their type 
             (hero, features, pricing, testimonials, cta, faq, team, stats, logos, footer),
             layout pattern (grid/list/carousel/split/stacked), 
             and number of items if applicable.
          
          5. TECH STACK: Identify the framework (next/react/vue/astro) 
             and UI library (tailwind/shadcn/chakra/material/custom) if detectable.
        `,
        extractionSchema: analysisSchema,
      },
    });
    
    const analysis: WebsiteAnalysis = {
      url,
      analyzedAt: new Date().toISOString(),
      ...result.extraction,
    };
    
    return NextResponse.json({
      success: true,
      analysis,
      screenshot: result.screenshot,
      markdown: result.markdown?.slice(0, 2000), // Truncate for response size
    });
    
  } catch (error: any) {
    console.error('Website analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

---

## Part 8: Pattern Library Browser Component

### `website/components/configurator/PatternBrowser.tsx`

```tsx
import React, { useState } from 'react';
import { PatternCategory, PatternDefinition } from '@/lib/patterns/types';
import { patternRegistry } from '@/lib/patterns/registry';
import { cn } from '@/lib/utils';

interface PatternBrowserProps {
  category?: PatternCategory;
  onSelect: (patternId: string) => void;
  selectedPatternId?: string;
}

const CATEGORY_LABELS: Record<PatternCategory, string> = {
  hero: 'Hero Sections',
  features: 'Features',
  pricing: 'Pricing Tables',
  testimonials: 'Testimonials',
  cta: 'Call to Action',
  faq: 'FAQ Sections',
  team: 'Team Sections',
  stats: 'Statistics',
  logos: 'Logo Walls',
  footer: 'Footers',
  navigation: 'Navigation',
};

export function PatternBrowser({ 
  category, 
  onSelect,
  selectedPatternId,
}: PatternBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<PatternCategory>(category || 'hero');
  const [searchQuery, setSearchQuery] = useState('');
  
  const patterns = searchQuery
    ? patternRegistry.search(searchQuery)
    : patternRegistry.getByCategory(activeCategory);
  
  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search patterns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex overflow-x-auto border-b px-4 gap-1 py-2">
          {(Object.keys(CATEGORY_LABELS) as PatternCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}
      
      {/* Pattern Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {patterns.map(pattern => (
            <PatternCard
              key={pattern.id}
              pattern={pattern}
              isSelected={selectedPatternId === pattern.id}
              onSelect={() => onSelect(pattern.id)}
            />
          ))}
        </div>
        
        {patterns.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No patterns found
          </div>
        )}
      </div>
    </div>
  );
}

function PatternCard({ 
  pattern, 
  isSelected,
  onSelect,
}: { 
  pattern: PatternDefinition;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex flex-col rounded-lg border overflow-hidden text-left transition-all',
        isSelected 
          ? 'ring-2 ring-primary border-primary'
          : 'hover:border-muted-foreground/50'
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative">
        {pattern.thumbnail ? (
          <img 
            src={pattern.thumbnail} 
            alt={pattern.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No preview
          </div>
        )}
        
        {pattern.conversionScore && pattern.conversionScore >= 8 && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
            High converting
          </span>
        )}
      </div>
      
      {/* Info */}
      <div className="p-3">
        <h4 className="font-medium text-sm">{pattern.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {pattern.description}
        </p>
        
        {pattern.source && (
          <p className="text-xs text-muted-foreground/70 mt-2 italic">
            {pattern.source}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-2">
          {pattern.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="text-xs bg-muted px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `website/lib/patterns/types.ts`
- [ ] Create `website/lib/patterns/registry.ts`
- [ ] Create 5 hero pattern definitions
- [ ] Create 5 feature pattern definitions
- [ ] Build `SectionRenderer` component
- [ ] Build `DynamicPreviewRenderer` component

### Phase 2: Integration
- [ ] Add Firecrawl dependency and API route
- [ ] Create analysis-to-patterns mapper
- [ ] Connect to existing configurator flow
- [ ] Update export generator

### Phase 3: Polish
- [ ] Build `PatternBrowser` component
- [ ] Add pattern thumbnails
- [ ] Add inline editing capability
- [ ] Add drag-and-drop reordering

---

*Generated by Documentation Agent*

