# Unified Renderer Architecture Roadmap

**Created:** January 6, 2026  
**Status:** Planning  
**Approach:** Single Composition Model (Approach A)  
**Goal:** True WYSIWYG - Preview IS Export

---

## Executive Summary

This roadmap outlines the implementation of a **Unified Renderer Architecture** where a single composition schema drives both the live preview and project export. This ensures users get exactly what they see - eliminating the trust gap between preview and exported code.

### Why Approach A (Single Model)?

| Factor | Single Model | Dual Model |
|--------|--------------|------------|
| WYSIWYG Guarantee | ✅ Impossible to drift | ❌ Constant drift risk |
| Maintenance Cost | 1x per pattern | 2x per pattern |
| User Trust | High | Erodes over time |
| Testing Burden | Test once | Test twice, plus mapping |
| Export-First Alignment | ✅ Perfect fit | ❌ Conflicts |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PATTERN REGISTRY                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Component    │  │ Schema       │  │ Metadata     │          │
│  │ (React)      │  │ (Slots/AI)   │  │ (UI/Tags)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   COMPOSITION SCHEMA                            │
│  {                                                              │
│    id, projectName, theme, globalStyles,                        │
│    pages: [{ path, sections: [{ patternId, props }] }]         │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   PREVIEW RENDERER      │    │   EXPORT GENERATOR      │
│                         │    │                         │
│  Uses: Pattern.Component│    │  Uses: Pattern.Component│
│  Output: React DOM      │    │  Output: File Tree      │
│  Context: iframe        │    │  Context: zip/deploy    │
└─────────────────────────┘    └─────────────────────────┘
               │                              │
               ▼                              ▼
        [Live Preview]                 [Exported Project]
         (identical)                    (identical)
```

---

## Implementation Phases

### Phase 1: Pattern Definition Interface (Week 1)

**Goal:** Create a type-safe pattern registry interface that supports both preview and export.

#### Deliverables

```typescript
// lib/patterns/types.ts

export interface PatternSlotSchema {
  name: string;
  type: 'text' | 'richText' | 'image' | 'array' | 'boolean' | 'number';
  required?: boolean;
  maxLength?: number;
  aspectRatio?: string;
  aiPrompt?: string;
  defaultValue?: unknown;
  itemSchema?: Record<string, string>; // For array types
}

export interface PatternSchema {
  slots: PatternSlotSchema[];
  variants: string[];
  aiGuidance: string;
}

export interface PatternMetadata {
  name: string;
  description: string;
  category: PatternCategory;
  thumbnail: string;
  tags: string[];
  inspirationSources: string[];
}

export interface PatternDefinition<TProps = Record<string, unknown>> {
  id: string;
  version: string;
  
  // The actual React component
  Component: React.ComponentType<TProps & PatternRenderProps>;
  
  // Schema for validation and AI
  schema: PatternSchema;
  
  // UI metadata
  meta: PatternMetadata;
  
  // Export configuration
  export: {
    dependencies: string[];        // npm packages needed
    peerDependencies: string[];    // shared deps (react, etc.)
    cssImports: string[];          // CSS files to include
  };
}

export interface PatternRenderProps {
  theme: Theme;
  variant?: string;
  className?: string;
}
```

#### Tasks

- [ ] Create `lib/patterns/types.ts` with interfaces
- [ ] Create `lib/patterns/registry.ts` for pattern storage
- [ ] Add pattern validation utilities
- [ ] Add TypeScript codegen for prop types
- [ ] Write unit tests for registry

---

### Phase 2: Pattern Registry Implementation (Week 2)

**Goal:** Build the central registry that stores all patterns with their components, schemas, and metadata.

#### Deliverables

```typescript
// lib/patterns/registry.ts

class PatternRegistry {
  private patterns: Map<string, PatternDefinition> = new Map();
  
  register<TProps>(pattern: PatternDefinition<TProps>): void {
    this.validatePattern(pattern);
    this.patterns.set(pattern.id, pattern);
  }
  
  get(id: string): PatternDefinition | undefined {
    return this.patterns.get(id);
  }
  
  getByCategory(category: PatternCategory): PatternDefinition[] {
    return Array.from(this.patterns.values())
      .filter(p => p.meta.category === category);
  }
  
  getAll(): PatternDefinition[] {
    return Array.from(this.patterns.values());
  }
  
  validateComposition(composition: Composition): ValidationResult {
    // Validate all patterns exist and props match schemas
  }
}

export const patternRegistry = new PatternRegistry();
```

#### Tasks

- [ ] Implement `PatternRegistry` class
- [ ] Add validation logic for patterns
- [ ] Add validation for compositions against patterns
- [ ] Create pattern loading from filesystem
- [ ] Add hot-reload support for development

---

### Phase 3: Migrate Existing Patterns (Weeks 3-4)

**Goal:** Convert all existing patterns from JSON registry to new `PatternDefinition` format with actual React components.

#### Pattern Migration Template

```typescript
// patterns/hero/hero-split-image.tsx

import { PatternDefinition } from '@/lib/patterns/types';
import { cn } from '@/lib/utils';

interface HeroSplitImageProps {
  headline: string;
  subheadline?: string;
  ctaText: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image: string;
  imageAlt?: string;
  reversed?: boolean;
}

function HeroSplitImageComponent({
  headline,
  subheadline,
  ctaText,
  ctaLink = '#',
  secondaryCtaText,
  secondaryCtaLink,
  image,
  imageAlt,
  reversed = false,
  theme,
  variant,
  className,
}: HeroSplitImageProps & PatternRenderProps) {
  return (
    <section 
      className={cn(
        "grid md:grid-cols-2 gap-8 p-8 md:p-16 items-center",
        reversed && "md:flex-row-reverse",
        className
      )}
      style={{ 
        background: `linear-gradient(135deg, ${theme.primaryColor}10 0%, ${theme.secondaryColor}10 100%)` 
      }}
    >
      <div className={cn(reversed ? "md:order-2" : "md:order-1")}>
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: theme.textColor }}
        >
          {headline}
        </h1>
        {subheadline && (
          <p className="text-xl text-gray-600 mb-8">{subheadline}</p>
        )}
        <div className="flex gap-4">
          <a
            href={ctaLink}
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {ctaText}
          </a>
          {secondaryCtaText && (
            <a
              href={secondaryCtaLink || '#'}
              className="px-6 py-3 rounded-lg font-medium border-2"
              style={{ 
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              }}
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
      <div className={cn(reversed ? "md:order-1" : "md:order-2")}>
        <img
          src={image}
          alt={imageAlt || headline}
          className="w-full h-auto rounded-xl shadow-lg object-cover"
        />
      </div>
    </section>
  );
}

export const HeroSplitImage: PatternDefinition<HeroSplitImageProps> = {
  id: 'hero-split-image',
  version: '1.0.0',
  
  Component: HeroSplitImageComponent,
  
  schema: {
    slots: [
      { name: 'headline', type: 'text', required: true, maxLength: 80, aiPrompt: 'Main value proposition in 6-10 words' },
      { name: 'subheadline', type: 'text', maxLength: 200, aiPrompt: 'Supporting text explaining the benefit' },
      { name: 'ctaText', type: 'text', required: true, maxLength: 30 },
      { name: 'ctaLink', type: 'text' },
      { name: 'secondaryCtaText', type: 'text', maxLength: 30 },
      { name: 'secondaryCtaLink', type: 'text' },
      { name: 'image', type: 'image', required: true, aspectRatio: '16:9' },
      { name: 'imageAlt', type: 'text' },
    ],
    variants: ['default', 'reversed', 'dark'],
    aiGuidance: 'Perfect for product showcases, app demos, or when the visual representation is key to understanding the offering.',
  },
  
  meta: {
    name: 'Hero with Split Image',
    description: 'Two-column hero with headline and CTA on one side, large image on the other',
    category: 'hero',
    thumbnail: '/patterns/hero-split-image.png',
    tags: ['hero', 'image', 'product', 'landing'],
    inspirationSources: ['stripe.com', 'linear.app'],
  },
  
  export: {
    dependencies: [],
    peerDependencies: ['react', 'react-dom'],
    cssImports: [],
  },
};
```

#### Migration Checklist

| Category | Count | Patterns |
|----------|-------|----------|
| Hero | 6 | centered, split-image, video-bg, parallax, carousel, animated |
| Features | 5 | grid, alternating, bento, comparison, showcase |
| Pricing | 4 | three-tier, calculator, comparison, single |
| Testimonials | 5 | grid, carousel, logos, video, social-wall |
| CTA | 3 | simple, newsletter, download |
| Footer | 2 | multi-column, minimal |
| Navigation | 1 | standard |
| Stats | 2 | simple, animated |
| Team | 1 | grid |
| FAQ | 1 | accordion |
| **Total** | **30** | |

#### Tasks

- [ ] Create pattern file structure: `patterns/{category}/{pattern-id}.tsx`
- [ ] Migrate Hero patterns (6)
- [ ] Migrate Features patterns (5)
- [ ] Migrate Pricing patterns (4)
- [ ] Migrate Testimonials patterns (5)
- [ ] Migrate CTA patterns (3)
- [ ] Migrate Footer patterns (2)
- [ ] Migrate Navigation patterns (1)
- [ ] Migrate Stats patterns (2)
- [ ] Migrate Team patterns (1)
- [ ] Migrate FAQ patterns (1)
- [ ] Register all patterns in central registry
- [ ] Add pattern thumbnails

---

### Phase 4: Unified Renderer (Week 5)

**Goal:** Build the renderer that uses pattern components for both preview and export.

#### Deliverables

```typescript
// lib/renderer/unified-renderer.ts

export interface RenderContext {
  mode: 'preview' | 'export';
  theme: Theme;
  assets: AssetResolver;
  baseUrl?: string;
}

export interface PreviewOutput {
  element: React.ReactElement;
  css: string;
}

export interface ExportOutput {
  files: Map<string, string>;  // path -> content
  assets: Map<string, Buffer>; // path -> binary
}

export class UnifiedRenderer {
  constructor(private registry: PatternRegistry) {}
  
  renderPreview(composition: Composition, context: RenderContext): PreviewOutput {
    const pages = this.renderPages(composition, context);
    
    return {
      element: this.assemblePreviewApp(pages, composition, context),
      css: this.collectCSS(composition),
    };
  }
  
  renderExport(composition: Composition, context: RenderContext): ExportOutput {
    const files = new Map<string, string>();
    const assets = new Map<string, Buffer>();
    
    // Generate page components
    for (const page of composition.pages) {
      const pagePath = this.getPagePath(page);
      files.set(pagePath, this.generatePageComponent(page, composition));
    }
    
    // Generate pattern components
    for (const patternId of this.getUsedPatterns(composition)) {
      const pattern = this.registry.get(patternId);
      if (pattern) {
        files.set(
          `components/patterns/${patternId}.tsx`,
          this.extractComponentSource(pattern)
        );
      }
    }
    
    // Generate framework files
    files.set('package.json', this.generatePackageJson(composition));
    files.set('next.config.js', this.generateNextConfig());
    files.set('tailwind.config.js', this.generateTailwindConfig(composition.theme));
    files.set('app/layout.tsx', this.generateLayout(composition));
    files.set('app/globals.css', this.generateGlobalCSS(composition));
    
    return { files, assets };
  }
  
  private renderPages(composition: Composition, context: RenderContext) {
    return composition.pages.map(page => ({
      path: page.path,
      element: this.renderPage(page, composition, context),
    }));
  }
  
  private renderPage(page: Page, composition: Composition, context: RenderContext) {
    return (
      <main>
        {page.sections.map((section, index) => {
          const pattern = this.registry.get(section.patternId);
          if (!pattern) {
            return <UnknownPattern key={index} patternId={section.patternId} />;
          }
          
          const props = this.resolveProps(section.props, context);
          
          return (
            <pattern.Component
              key={section.id || index}
              {...props}
              theme={composition.theme}
              variant={section.variant}
            />
          );
        })}
      </main>
    );
  }
  
  private resolveProps(props: SlotValues, context: RenderContext): SlotValues {
    const resolved: SlotValues = {};
    
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string' && this.isAssetUrl(value)) {
        resolved[key] = context.assets.resolve(value);
      } else if (Array.isArray(value)) {
        resolved[key] = value.map(item => 
          typeof item === 'object' ? this.resolveProps(item, context) : item
        );
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }
}
```

#### Tasks

- [ ] Create `UnifiedRenderer` class
- [ ] Implement `renderPreview` method
- [ ] Implement `renderExport` method
- [ ] Create asset resolver for images
- [ ] Generate framework files (package.json, next.config, etc.)
- [ ] Handle theme injection
- [ ] Add CSS collection/generation

---

### Phase 5: Update Preview System (Week 6)

**Goal:** Replace current `ComposedPreview` with unified renderer preview mode.

#### Tasks

- [ ] Create `UnifiedPreviewFrame` component
- [ ] Replace `ComposedPreview` usage in `LivePreviewPanel`
- [ ] Update `PreviewWithImages` to work with unified renderer
- [ ] Add iframe sandboxing for preview
- [ ] Implement preview navigation
- [ ] Add responsive viewport switching
- [ ] Test all patterns in preview

---

### Phase 6: Update Export System (Week 7)

**Goal:** Replace current export logic with unified renderer export mode.

#### Tasks

- [ ] Update export API to use `UnifiedRenderer`
- [ ] Generate pattern component files
- [ ] Generate page components
- [ ] Generate app layout and routing
- [ ] Include theme configuration
- [ ] Add README and documentation
- [ ] Test export builds successfully
- [ ] Test exported projects match preview

---

### Phase 7: Parity Testing (Week 8)

**Goal:** Ensure preview and export are visually identical.

#### Test Strategy

```typescript
// __tests__/parity/visual-parity.test.ts

import { patternRegistry } from '@/lib/patterns/registry';
import { UnifiedRenderer } from '@/lib/renderer/unified-renderer';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('Visual Parity Tests', () => {
  const renderer = new UnifiedRenderer(patternRegistry);
  const patterns = patternRegistry.getAll();
  
  for (const pattern of patterns) {
    describe(pattern.id, () => {
      const variants = pattern.schema.variants;
      
      for (const variant of variants) {
        it(`${variant} variant matches between preview and export`, async () => {
          const composition = createTestComposition(pattern.id, variant);
          
          // Render preview
          const preview = renderer.renderPreview(composition, previewContext);
          const previewScreenshot = await captureScreenshot(preview.element);
          
          // Render export and build
          const exportOutput = renderer.renderExport(composition, exportContext);
          const builtApp = await buildExportedProject(exportOutput);
          const exportScreenshot = await captureScreenshot(builtApp);
          
          // Compare
          expect(previewScreenshot).toMatchImageSnapshot({
            customDiffConfig: { threshold: 0.01 },
            failureThreshold: 0.001,
            failureThresholdType: 'percent',
          });
          
          expect(exportScreenshot).toMatchImageSnapshot({
            customSnapshotIdentifier: `${pattern.id}-${variant}-export`,
          });
          
          // Pixel diff between preview and export
          const diff = await compareImages(previewScreenshot, exportScreenshot);
          expect(diff.percentDifferent).toBeLessThan(0.1);
        });
      }
    });
  }
});
```

#### Tasks

- [ ] Set up visual regression testing (Playwright + jest-image-snapshot)
- [ ] Create test composition generator
- [ ] Write parity tests for all patterns
- [ ] Add to CI pipeline
- [ ] Create diff reporting dashboard
- [ ] Document acceptable variance thresholds

---

## Timeline Summary

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Pattern Definition Interface | Type-safe interfaces, registry types |
| 2 | Pattern Registry Implementation | Central registry with validation |
| 3-4 | Migrate Existing Patterns | 30 patterns as React components |
| 5 | Unified Renderer | Single renderer for preview + export |
| 6 | Update Preview System | Live preview using unified renderer |
| 7 | Update Export System | Export using unified renderer |
| 8 | Parity Testing | Visual regression tests, CI integration |

**Total Duration:** 8 weeks

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Visual Parity | < 0.1% pixel diff | Automated visual regression |
| Pattern Coverage | 100% | All patterns migrated |
| Export Build Success | 100% | All exports build without errors |
| Preview Performance | < 100ms render | Lighthouse metrics |
| Test Coverage | > 90% | Jest coverage report |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Pattern migration takes longer | Medium | Medium | Parallelize with multiple devs |
| Performance regression | Low | High | Benchmark early and often |
| CSS conflicts between patterns | Medium | Medium | CSS modules or scoped styles |
| Breaking changes to existing users | Low | High | Version composition schema |
| Image asset handling complexity | Medium | Medium | Abstract asset resolver |

---

## Dependencies

### External
- React 18+
- Next.js 14+
- Tailwind CSS 3+
- TypeScript 5+

### Internal
- Current pattern JSON registry (to migrate from)
- Existing composition types
- Theme system
- Image generation system

---

## Next Steps

1. **Approve this roadmap** - Confirm scope and timeline
2. **Create Phase 1 branch** - `feature/unified-renderer-phase-1`
3. **Assign resources** - Developer allocation
4. **Set up tracking** - GitHub project board
5. **Schedule reviews** - Weekly architecture reviews

---

## Appendix: Deep Dive Analysis

### Failure Modes at Scale (100+ patterns, 50+ page types)

**Single Composition Model:**

| Failure Mode | Likelihood | Impact | Mitigation |
|--------------|------------|--------|------------|
| Render performance degrades | Medium | High | Virtualization, lazy loading |
| Schema bloat | High | Medium | Normalized schema with refs |
| Pattern CSS collisions | Medium | High | Scoped CSS, CSS modules |
| TypeScript type explosion | Medium | Low | Discriminated unions, codegen |
| Breaking changes affect both | High | Critical | Versioned pattern schemas |

### Pattern Versioning Strategy

```typescript
interface VersionedPattern {
  id: string;
  version: string;  // semver
  
  // Migration from previous versions
  migrations: {
    from: string;
    to: string;
    migrate: (props: unknown) => unknown;
  }[];
}

// At load time
function loadComposition(stored: StoredComposition): Composition {
  return {
    ...stored,
    pages: stored.pages.map(page => ({
      ...page,
      sections: page.sections.map(section => {
        const pattern = registry.get(section.patternId);
        const migratedProps = migrateProps(
          section.props,
          section.patternVersion,
          pattern.version,
          pattern.migrations
        );
        return { ...section, props: migratedProps };
      }),
    })),
  };
}
```

### Real-Time Collaboration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Collaboration Server                     │
│                     (Y.js / CRDT)                          │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │ User A  │     │ User B  │     │ User C  │
        └─────────┘     └─────────┘     └─────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                 ┌────────────────────────┐
                 │   Composition State    │
                 │   (Single Document)    │
                 └────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     ┌─────────────────┐             ┌─────────────────┐
     │ Preview Render  │             │ Export Generate │
     │ (All see same)  │             │ (Same output)   │
     └─────────────────┘             └─────────────────┘
```

---

*Document Version: 1.0*  
*Last Updated: January 6, 2026*  
*Author: Website Agent*

