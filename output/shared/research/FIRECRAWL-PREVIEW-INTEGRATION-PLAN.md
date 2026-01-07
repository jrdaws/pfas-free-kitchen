# Firecrawl + Dynamic Preview Integration Plan

## Executive Summary

**Goal**: Use Firecrawl to analyze top-performing websites, extract design patterns, and create a truly dynamic WYSIWYG preview system where what users see = what they export.

**Current Gap**:
- Preview → AI-generated HTML (visual mockup)
- Export → Template-based files (real code)
- These are **not connected** — preview doesn't inform export

**Target State**:
- Preview → Component-based rendering with real props
- Export → Same components, same props, same structure
- **Preview IS the export**, just rendered in browser

---

## Part 1: Firecrawl Research — What We Can Learn

### What is Firecrawl?

[Firecrawl](https://www.firecrawl.dev/) is a web crawling API that:
- Extracts clean markdown from any website
- Handles JavaScript-rendered content (SPA crawling)
- Provides structured data extraction
- LLM-ready output format

### High-Value Websites to Analyze

| Category | Websites | What to Learn |
|----------|----------|---------------|
| **SaaS Landing** | linear.app, notion.so, vercel.com | Hero patterns, social proof, pricing tables |
| **E-commerce** | shopify.com/examples, gumroad.com | Product grids, checkout flow, trust signals |
| **Dashboards** | railway.app, planetscale.com | Sidebar navigation, data visualization, settings |
| **Directories** | producthunt.com, alternativeto.net | Grid layouts, filtering, search UX |
| **Blogs** | ghost.org, hashnode.dev | Typography, readability, content structure |
| **Marketing** | stripe.com, openai.com | Animation patterns, storytelling, CTAs |

### Data to Extract Per Website

```typescript
interface WebsiteAnalysis {
  // Visual Design System
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
      scale: number[]; // Font sizes used
    };
    spacing: {
      containerWidth: string;
      sectionPadding: string;
      componentGaps: string[];
    };
    borderRadius: string[];
    shadows: string[];
  };
  
  // Layout Patterns
  layout: {
    headerStyle: 'sticky' | 'fixed' | 'static';
    navigationPattern: 'horizontal' | 'sidebar' | 'hamburger';
    footerSections: number;
    heroPattern: 'centered' | 'split' | 'video' | 'gradient';
    contentWidth: 'full' | 'contained' | 'narrow';
  };
  
  // Component Patterns
  components: {
    buttons: ButtonPattern[];
    cards: CardPattern[];
    forms: FormPattern[];
    modals: ModalPattern[];
    tables: TablePattern[];
  };
  
  // Section Patterns (ordered)
  sections: {
    type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'faq' | 'team';
    layout: 'grid' | 'list' | 'carousel' | 'split';
    itemCount: number;
    animations: boolean;
  }[];
  
  // Conversion Patterns
  conversion: {
    ctaPlacement: string[];
    trustSignals: string[]; // "Trusted by X companies"
    socialProof: boolean;
    pricingTiers: number;
    freeTrialProminent: boolean;
  };
  
  // Technical Stack (inferred)
  tech: {
    framework: 'next' | 'react' | 'vue' | 'astro' | 'unknown';
    uiLibrary: 'tailwind' | 'shadcn' | 'chakra' | 'material' | 'custom';
    animations: 'framer' | 'gsap' | 'css' | 'none';
  };
}
```

---

## Part 2: Pattern Library Creation

### Purpose

Create a curated library of proven design patterns extracted from top websites.

### Structure

```
output/shared/design-patterns/
├── heroes/
│   ├── centered-gradient.json     # From linear.app
│   ├── split-image.json           # From vercel.com
│   ├── video-background.json      # From openai.com
│   └── animated-text.json         # From stripe.com
├── features/
│   ├── icon-grid-3col.json
│   ├── alternating-rows.json
│   ├── bento-grid.json
│   └── comparison-table.json
├── pricing/
│   ├── three-tier-cards.json
│   ├── toggle-monthly-annual.json
│   └── enterprise-contact.json
├── testimonials/
│   ├── carousel-avatars.json
│   ├── grid-quotes.json
│   └── logo-wall.json
├── navigation/
│   ├── sticky-blur.json
│   ├── mega-menu.json
│   └── sidebar-collapsible.json
└── index.json                     # Pattern registry
```

### Pattern Schema

```typescript
interface DesignPattern {
  id: string;
  name: string;
  category: 'hero' | 'features' | 'pricing' | 'testimonials' | 'navigation' | 'cta';
  source: string;                   // "Inspired by linear.app"
  screenshot: string;               // Preview image path
  
  // Component structure
  component: {
    name: string;                   // "HeroCenteredGradient"
    props: Record<string, unknown>; // Default props
    variants: string[];             // ["dark", "light", "image-bg"]
  };
  
  // Style tokens
  tokens: {
    colors: string[];
    fonts: string[];
    spacing: string[];
  };
  
  // Best practices
  bestFor: string[];                // ["SaaS landing", "Product launch"]
  conversionScore: number;          // 1-10 based on industry data
  mobileOptimized: boolean;
}
```

---

## Part 3: Dynamic Preview Architecture

### Current Flow (Broken Connection)

```
[User Input] → [AI Prompt] → [HTML String] → [iframe Preview]
                    ↓
               [Export API] → [Template Files] → [ZIP]
                    
⚠️ Preview and Export are DISCONNECTED
```

### Target Flow (WYSIWYG)

```
[User Input] → [Config Object] → [Component Props]
                                       ↓
                              [Preview Renderer] ← Same components
                                       ↓
                              [Export Generator] ← Same structure
                                       ↓
                              [Matching Output]
```

### Implementation Architecture

```typescript
// Single source of truth for project configuration
interface ProjectDefinition {
  meta: {
    name: string;
    description: string;
    template: string;
  };
  
  // Pages and their component composition
  pages: {
    path: string;
    title: string;
    sections: SectionDefinition[];
  }[];
  
  // Component library (which patterns to include)
  patterns: {
    hero: string;           // Pattern ID from library
    features: string;
    pricing: string;
    // etc.
  };
  
  // Branding applied to all patterns
  branding: {
    colors: ColorScheme;
    fonts: FontScheme;
    logo?: string;
  };
  
  // Integrations affect which components are available
  integrations: Record<string, string>;
}

// Section definition that maps to real components
interface SectionDefinition {
  id: string;
  patternId: string;                // Links to pattern library
  props: Record<string, unknown>;   // Actual component props
  customizations: {
    variant?: string;
    hidden?: boolean;
    order?: number;
  };
}
```

### Preview Renderer (React Components)

```tsx
// website/components/preview/DynamicPreviewRenderer.tsx

interface DynamicPreviewRendererProps {
  definition: ProjectDefinition;
  currentPage: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
}

export function DynamicPreviewRenderer({ 
  definition, 
  currentPage,
  viewport 
}: DynamicPreviewRendererProps) {
  const page = definition.pages.find(p => p.path === currentPage);
  
  return (
    <PreviewFrame viewport={viewport}>
      <ThemeProvider theme={definition.branding}>
        {page?.sections.map(section => (
          <SectionRenderer
            key={section.id}
            patternId={section.patternId}
            props={section.props}
            branding={definition.branding}
          />
        ))}
      </ThemeProvider>
    </PreviewFrame>
  );
}

// Maps pattern IDs to actual React components
function SectionRenderer({ patternId, props, branding }) {
  const Component = PATTERN_REGISTRY[patternId];
  
  if (!Component) {
    return <PlaceholderSection patternId={patternId} />;
  }
  
  return <Component {...props} theme={branding} />;
}
```

### Export Generator (Same Components)

```typescript
// website/lib/generator/definition-to-code.ts

export async function generateFromDefinition(
  definition: ProjectDefinition
): Promise<GeneratedProject> {
  const files: GeneratedFile[] = [];
  
  // 1. Generate page files
  for (const page of definition.pages) {
    const pageCode = generatePageComponent(page, definition.branding);
    files.push({
      path: `app${page.path === '/' ? '' : page.path}/page.tsx`,
      content: pageCode,
      overwrite: true,
    });
  }
  
  // 2. Generate section components
  for (const patternId of Object.values(definition.patterns)) {
    const pattern = PATTERN_LIBRARY[patternId];
    const componentCode = generateSectionComponent(pattern);
    files.push({
      path: `components/sections/${pattern.component.name}.tsx`,
      content: componentCode,
      overwrite: true,
    });
  }
  
  // 3. Generate theme/branding files
  files.push({
    path: 'lib/theme.ts',
    content: generateThemeFile(definition.branding),
    overwrite: true,
  });
  
  // 4. Generate Tailwind config with branding
  files.push({
    path: 'tailwind.config.ts',
    content: generateTailwindConfig(definition.branding),
    overwrite: true,
  });
  
  return { files, /* ... */ };
}
```

---

## Part 4: Firecrawl Integration Workflow

### Step 1: Crawl Inspiration URL

When user adds an inspiration URL in the configurator:

```typescript
// website/app/api/analyze/website/route.ts

import Firecrawl from '@mendable/firecrawl-js';

export async function POST(request: Request) {
  const { url } = await request.json();
  
  const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
  
  // Crawl the page
  const result = await firecrawl.scrapeUrl(url, {
    pageOptions: {
      screenshot: true,
      fullPageScreenshot: true,
      waitFor: 2000, // Wait for JS to render
    },
    extractorOptions: {
      mode: 'llm-extraction',
      extractionPrompt: `
        Analyze this website and extract:
        1. Color palette (primary, secondary, accent colors as hex)
        2. Typography (heading font, body font)
        3. Layout pattern (hero style, navigation style)
        4. Section types in order (hero, features, pricing, etc.)
        5. Component patterns (button styles, card styles)
        6. Conversion elements (CTA placement, trust signals)
      `,
      extractionSchema: WebsiteAnalysisSchema,
    },
  });
  
  return NextResponse.json({
    analysis: result.extraction,
    screenshot: result.screenshot,
    markdown: result.markdown,
  });
}
```

### Step 2: Map to Pattern Library

```typescript
// website/lib/analysis-to-patterns.ts

export function mapAnalysisToPatterns(
  analysis: WebsiteAnalysis
): PatternSelection {
  const selection: PatternSelection = {};
  
  // Map hero style to pattern
  if (analysis.layout.heroPattern === 'centered') {
    if (analysis.design.colorPalette.background[0]?.includes('gradient')) {
      selection.hero = 'centered-gradient';
    } else {
      selection.hero = 'centered-simple';
    }
  }
  
  // Map features layout to pattern
  const featuresSection = analysis.sections.find(s => s.type === 'features');
  if (featuresSection?.layout === 'grid' && featuresSection.itemCount === 3) {
    selection.features = 'icon-grid-3col';
  } else if (featuresSection?.layout === 'grid' && featuresSection.itemCount >= 4) {
    selection.features = 'bento-grid';
  }
  
  // ... more mappings
  
  return selection;
}
```

### Step 3: Generate Project Definition

```typescript
// website/lib/inspiration-to-definition.ts

export function createDefinitionFromInspiration(
  inspiration: WebsiteAnalysis,
  userConfig: UserConfig
): ProjectDefinition {
  // Start with template defaults
  const templateDef = getTemplateDefinition(userConfig.template);
  
  // Override with inspiration patterns
  const patterns = mapAnalysisToPatterns(inspiration);
  
  // Extract and apply branding
  const branding = extractBranding(inspiration);
  
  // Merge user customizations
  return {
    ...templateDef,
    patterns: { ...templateDef.patterns, ...patterns },
    branding: mergeBranding(branding, userConfig.branding),
    meta: {
      ...templateDef.meta,
      name: userConfig.projectName,
      description: userConfig.description,
    },
  };
}
```

---

## Part 5: WYSIWYG Editor Features

### Visual Section Editor

Allow users to:
1. **Drag & drop sections** to reorder
2. **Swap patterns** for any section
3. **Edit props directly** in preview
4. **Toggle visibility** of sections
5. **Add custom sections** from pattern library

```tsx
// website/components/configurator/VisualEditor.tsx

export function VisualEditor({ definition, onChange }) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  return (
    <div className="grid grid-cols-[300px_1fr] h-full">
      {/* Left: Pattern Library */}
      <PatternLibrarySidebar 
        onSelect={(patternId) => addSection(patternId)}
      />
      
      {/* Right: Preview with editing */}
      <DynamicPreviewRenderer
        definition={definition}
        currentPage="/"
        viewport="desktop"
        editable
        onSectionClick={setSelectedSection}
        onSectionReorder={handleReorder}
      />
      
      {/* Floating: Props editor */}
      {selectedSection && (
        <SectionPropsEditor
          section={definition.pages[0].sections.find(s => s.id === selectedSection)}
          onChange={(newProps) => updateSectionProps(selectedSection, newProps)}
        />
      )}
    </div>
  );
}
```

### Inline Editing

Allow text editing directly in preview:

```tsx
// When user clicks on text in preview
function EditableText({ value, onChange, path }) {
  const [editing, setEditing] = useState(false);
  
  if (editing) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(path, e.target.value)}
        onBlur={() => setEditing(false)}
        autoFocus
        className="bg-transparent border-b-2 border-primary outline-none"
      />
    );
  }
  
  return (
    <span 
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:outline hover:outline-primary/50"
    >
      {value}
    </span>
  );
}
```

---

## Part 6: Implementation Phases

### Phase 1: Foundation (Week 1-2)

| Task | Owner | Priority |
|------|-------|----------|
| Set up Firecrawl account and API integration | Platform Agent | P0 |
| Create pattern library schema and 10 starter patterns | Website Agent | P0 |
| Build ProjectDefinition type system | Platform Agent | P0 |
| Create SectionRenderer component | Website Agent | P0 |
| Update export generator to use definitions | CLI Agent | P1 |

**Deliverable**: Working preview that renders from definition object

### Phase 2: Pattern Library (Week 2-3)

| Task | Owner | Priority |
|------|-------|----------|
| Crawl 20 top websites with Firecrawl | Research Agent | P0 |
| Extract patterns from crawl data | Research Agent | P1 |
| Create 30+ patterns across all categories | Website Agent | P0 |
| Build pattern preview/selection UI | Website Agent | P1 |
| Add pattern screenshots to library | Media Agent | P2 |

**Deliverable**: Curated pattern library with visual browser

### Phase 3: WYSIWYG Editor (Week 3-4)

| Task | Owner | Priority |
|------|-------|----------|
| Build drag-and-drop section reordering | Website Agent | P0 |
| Create section props editor panel | Website Agent | P0 |
| Implement inline text editing | Website Agent | P1 |
| Add undo/redo support | Platform Agent | P1 |
| Add multi-page editing | Website Agent | P2 |

**Deliverable**: Full visual editor experience

### Phase 4: Export Parity (Week 4-5)

| Task | Owner | Priority |
|------|-------|----------|
| Generate same components for export | CLI Agent | P0 |
| Ensure exported project matches preview pixel-perfect | Quality Agent | P0 |
| Add E2E tests for preview→export parity | Testing Agent | P1 |
| Document the new system | Documentation Agent | P1 |

**Deliverable**: True WYSIWYG — export matches preview exactly

---

## Part 7: Success Metrics

### Preview Accuracy

| Metric | Target |
|--------|--------|
| Visual match between preview and export | 95%+ |
| Props correctly applied in export | 100% |
| Pattern library coverage | 50+ patterns |
| Time to render preview | < 500ms |

### User Experience

| Metric | Target |
|--------|--------|
| Users using inspiration URLs | 40%+ |
| Users customizing sections | 60%+ |
| Export→build success rate | 95%+ |
| Time from config to export | < 5 minutes |

### Technical Quality

| Metric | Target |
|--------|--------|
| Export passes `npm run build` | 100% |
| Lighthouse score of exports | 90+ |
| Mobile responsiveness | 100% patterns |
| Accessibility compliance | WCAG 2.1 AA |

---

## Part 8: Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Firecrawl API rate limits | Medium | Cache analysis results, batch requests |
| Pattern library maintenance | Medium | Automated tests, version control |
| Complex customizations | High | Limit initial scope, iterate based on usage |
| Export code quality | High | E2E testing, code review automation |
| Performance with many patterns | Medium | Lazy loading, code splitting |

---

## Part 9: Quick Wins (Start Today)

1. **Create 5 hero patterns** from existing templates
2. **Add ProjectDefinition type** to codebase
3. **Build simple SectionRenderer** using existing preview components
4. **Test Firecrawl** on 3 inspiration URLs
5. **Create pattern index.json** with schema

---

## Appendix: Firecrawl Setup

### Installation

```bash
npm install @mendable/firecrawl-js
```

### Environment Variables

```env
FIRECRAWL_API_KEY=your_api_key_here
```

### Basic Usage

```typescript
import Firecrawl from '@mendable/firecrawl-js';

const app = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

// Simple scrape
const result = await app.scrapeUrl('https://example.com');
console.log(result.markdown); // Clean markdown

// With extraction
const extracted = await app.scrapeUrl('https://example.com', {
  extractorOptions: {
    mode: 'llm-extraction',
    extractionPrompt: 'Extract the main features listed on this page',
    extractionSchema: {
      type: 'object',
      properties: {
        features: { type: 'array', items: { type: 'string' } }
      }
    }
  }
});
```

---

## Next Steps

**To proceed, I recommend:**

1. **[Research]** Set up Firecrawl and crawl 5 top SaaS websites
2. **[Code]** Create the ProjectDefinition type system
3. **[Code]** Build initial pattern library with 10 patterns
4. **[Code]** Update preview renderer to use definitions

Would you like me to create tasks for specific agents to start this work?

---

*Generated by Documentation Agent*
*(DOCUMENTATION AGENT)*

