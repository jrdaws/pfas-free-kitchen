# Research Phase Optimization Specification

**Version**: 1.0  
**Date**: January 5, 2026  
**Author**: Research Agent  
**Status**: Ready for Implementation

---

## Executive Summary

This document specifies improvements to the research phase to capture richer user intent and produce more accurate project configurations. The current single-pass research approach will be enhanced with multi-source inputs, iterative refinement, persistent context, and competitive analysis.

---

## 1. Multi-Source Research Input

### 1.1 Current State

Currently, research accepts:
- Text description (domain/niche)
- Inspiration URLs (homepage only)
- Vision statement (optional)

### 1.2 Proposed Input Sources

| Source Type | Description | Priority | Effort |
|-------------|-------------|----------|--------|
| Text Description | Current domain/niche input | ✅ Existing | - |
| Inspiration URLs | Enhanced with deep crawling | P0 | Medium |
| Image Uploads | Screenshots analyzed for design patterns | P1 | High |
| Figma Links | Extract design tokens, colors, typography | P2 | High |
| Competitor URLs | Dedicated competitive analysis | P0 | Medium |
| Voice Input | Speak your vision (transcribe + analyze) | P2 | Low |

### 1.3 Enhanced URL Input Specification

```typescript
interface EnhancedUrlInput {
  url: string;
  crawlDepth: 1 | 2 | 3;        // How many levels deep to crawl
  includeSubpages: boolean;     // Crawl pricing, features, about pages
  extractScreenshots: boolean;  // Capture visual design
  analyzeStack: boolean;        // Detect tech stack via Wappalyzer
}

interface UrlCrawlResult {
  homepage: PageAnalysis;
  subpages: PageAnalysis[];
  screenshots: {
    url: string;
    imageUrl: string;           // Stored in Cloudinary/S3
    analysis: VisualAnalysis;
  }[];
  techStack: {
    frontend: string[];         // React, Vue, etc.
    backend: string[];          // Node, Python, etc.
    infrastructure: string[];   // Vercel, AWS, etc.
    analytics: string[];        // GA, Mixpanel, etc.
  };
}
```

### 1.4 Image Upload Specification

```typescript
interface ImageUpload {
  file: File;
  type: "screenshot" | "design" | "logo" | "mockup";
  context?: string;             // User's description
}

interface ImageAnalysis {
  // Extracted via Claude Vision
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingStyle: "serif" | "sans-serif" | "display" | "mono";
    bodyStyle: "serif" | "sans-serif";
    estimatedFonts: string[];
  };
  layout: {
    style: "minimal" | "dense" | "magazine" | "dashboard";
    hasHero: boolean;
    hasSidebar: boolean;
    gridColumns: number;
  };
  components: string[];         // ["navbar", "hero", "pricing-table", ...]
  designStyle: "minimal" | "bold" | "playful" | "corporate" | "dark";
  mood: string[];               // ["professional", "modern", "trustworthy"]
}
```

### 1.5 Figma Integration Specification

```typescript
interface FigmaInput {
  fileUrl: string;              // Figma share link
  accessToken?: string;         // Optional: user's Figma token
}

interface FigmaAnalysis {
  designTokens: {
    colors: Record<string, string>;
    typography: {
      fontFamilies: string[];
      fontSizes: number[];
      lineHeights: number[];
    };
    spacing: number[];
    borderRadius: number[];
  };
  components: {
    name: string;
    variants: number;
    props: string[];
  }[];
  pages: string[];
  styleGuide: {
    primaryFont: string;
    headingFont: string;
    colorScheme: "light" | "dark" | "both";
  };
}
```

### 1.6 API Endpoint Updates

```typescript
// POST /api/research/analyze
interface ResearchRequest {
  // Existing
  domain: string;
  vision?: string;
  
  // Enhanced
  inputs: {
    urls?: EnhancedUrlInput[];
    images?: string[];          // Base64 or Cloudinary URLs
    figmaUrl?: string;
    competitorUrls?: string[];
  };
  
  // New: iteration context
  previousResults?: ResearchResult;
  refinementFeedback?: RefinementFeedback;
}
```

---

## 2. Iterative Research Refinement

### 2.1 Problem Statement

Users currently get one-shot recommendations with no ability to guide the AI toward better results. This leads to:
- Suboptimal template selection
- Missing important features
- Irrelevant suggestions

### 2.2 Refinement UX Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Initial Research                                   │
│  ┌─────────────────────────────────────────────────────────┤
│  │ Domain: "Pet food subscription service"                  │
│  │ [+ Add URLs] [+ Upload Screenshots] [🎤 Voice]          │
│  │                                    [Analyze →]           │
│  └─────────────────────────────────────────────────────────┘
│                           ↓                                 │
│  Step 2: Review Results                                     │
│  ┌─────────────────────────────────────────────────────────┤
│  │ Suggested Template: E-commerce ✓                        │
│  │                                                          │
│  │ Suggested Features:                                      │
│  │ ┌──────────────────┐ ┌──────────────────┐               │
│  │ │ ✓ Subscriptions  │ │ ✓ User accounts  │               │
│  │ │ [Keep] [Remove]  │ │ [Keep] [Remove]  │               │
│  │ └──────────────────┘ └──────────────────┘               │
│  │                                                          │
│  │ Missing something? [+ Add feature request]               │
│  │                                                          │
│  │ Feedback: "More emphasis on mobile app, less on blog"   │
│  │ [Refine Recommendations]                                 │
│  └─────────────────────────────────────────────────────────┘
│                           ↓                                 │
│  Step 3: Refined Results (iteration 2)                      │
│  ┌─────────────────────────────────────────────────────────┤
│  │ Updated based on your feedback:                          │
│  │ + Added: Push notifications, Mobile-first design        │
│  │ - Removed: Blog, RSS feed                                │
│  │                                                          │
│  │ [Refine Again] [Accept & Continue →]                     │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Refinement Data Model

```typescript
interface RefinementFeedback {
  iteration: number;            // 1, 2, or 3 (max)
  
  // Explicit feature feedback
  keepFeatures: string[];       // Features user confirmed
  removeFeatures: string[];     // Features user rejected
  addFeatures: string[];        // Features user requested
  
  // Template feedback
  templateAccepted: boolean;
  alternativeTemplate?: string;
  
  // Natural language feedback
  freeformFeedback?: string;    // "More like X, less like Y"
  
  // Priority adjustments
  priorityChanges?: {
    feature: string;
    direction: "higher" | "lower";
  }[];
}

interface RefinedResearchResult extends ResearchResult {
  iteration: number;
  changes: {
    added: string[];
    removed: string[];
    priorityChanged: string[];
  };
  confidence: number;           // 0-100, increases with iterations
}
```

### 2.4 Refinement API

```typescript
// POST /api/research/refine
interface RefineRequest {
  originalResults: ResearchResult;
  feedback: RefinementFeedback;
}

interface RefineResponse {
  success: boolean;
  refinedResults: RefinedResearchResult;
  suggestedNextStep: "refine_again" | "accept" | "start_over";
  remainingIterations: number;  // Max 3 total
}
```

### 2.5 AI Prompt for Refinement

```markdown
## Refinement Context

Previous recommendations for "${domain}":
- Template: ${previousTemplate}
- Features: ${previousFeatures.join(", ")}

## User Feedback
${freeformFeedback}

Kept: ${keepFeatures.join(", ")}
Removed: ${removeFeatures.join(", ")}
Requested: ${addFeatures.join(", ")}

## Your Task
Refine the recommendations based on this feedback. The user wants:
- More emphasis on: ${inferredEmphasis}
- Less emphasis on: ${inferredDeEmphasis}

Provide updated recommendations that better match their vision.
```

---

## 3. Research Context Persistence

### 3.1 Problem Statement

Research insights are currently lost after the research step:
- Preview generation doesn't use research context
- Exports don't include research rationale
- Component generation ignores domain insights

### 3.2 Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                      Research Phase                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  User Input │───▶│  AI Analysis │───▶│  Research Results   │  │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │
└─────────────────────────────────────────────────────┼────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────┐
                    │                                 ▼             │
                    │  ┌───────────────────────────────────────┐   │
                    │  │         Research Context Store         │   │
                    │  │  ┌─────────────┐  ┌─────────────────┐ │   │
                    │  │  │  Zustand    │  │   Supabase DB   │ │   │
                    │  │  │  (session)  │  │  (persistent)   │ │   │
                    │  │  └──────┬──────┘  └────────┬────────┘ │   │
                    │  └─────────┼──────────────────┼──────────┘   │
                    │            │                  │               │
                    └────────────┼──────────────────┼───────────────┘
                                 │                  │
         ┌───────────────────────┼──────────────────┼───────────────┐
         │                       ▼                  ▼               │
         │  ┌─────────────────────────────────────────────────────┐│
         │  │                 Consumers                            ││
         │  │                                                      ││
         │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ ││
         │  │  │   Preview    │  │   Export     │  │  Component │ ││
         │  │  │  Generation  │  │   Builder    │  │ Generation │ ││
         │  │  └──────────────┘  └──────────────┘  └────────────┘ ││
         │  └─────────────────────────────────────────────────────┘│
         └─────────────────────────────────────────────────────────┘
```

### 3.3 Zustand State Extension

```typescript
// Add to configurator-state.ts

interface ResearchContext {
  // Core insights
  domainInsights: {
    overview: string;
    targetAudience: string;
    problemSolved: string;
    keyDifferentiators: string[];
  };
  
  // Analysis results
  competitorAnalysis: {
    competitors: string[];
    theirStrengths: string[];
    ourOpportunities: string[];
  };
  
  // Extracted design direction
  designDirection: {
    style: DesignStyle;
    colorPreferences: string[];
    layoutPreferences: string[];
    inspirationSources: string[];
  };
  
  // Feature rationale
  featureRationale: Record<string, string>;  // feature -> why it matters
  
  // Iteration history
  iterations: {
    timestamp: number;
    feedback: string;
    changes: string[];
  }[];
  
  // Confidence scores
  confidence: {
    template: number;
    features: number;
    design: number;
    overall: number;
  };
}

interface ConfiguratorState {
  // ... existing fields ...
  
  // New: Research context
  researchContext: ResearchContext | null;
  setResearchContext: (context: ResearchContext) => void;
  updateResearchContext: (updates: Partial<ResearchContext>) => void;
}
```

### 3.4 Database Schema

```sql
-- Add to Supabase migrations

CREATE TABLE research_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Core research data
  domain TEXT NOT NULL,
  vision TEXT,
  
  -- Analysis results (JSONB for flexibility)
  domain_insights JSONB,
  competitor_analysis JSONB,
  design_direction JSONB,
  feature_rationale JSONB,
  
  -- Iteration tracking
  iteration_count INTEGER DEFAULT 1,
  iterations JSONB DEFAULT '[]',
  
  -- Confidence scores
  confidence_scores JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  finalized_at TIMESTAMPTZ  -- When user accepted results
);

-- Index for quick lookups
CREATE INDEX idx_research_contexts_project ON research_contexts(project_id);
CREATE INDEX idx_research_contexts_user ON research_contexts(user_id);
```

### 3.5 Context Usage in Preview Generation

```typescript
// In preview generation API

interface PreviewRequest {
  template: string;
  description: string;
  
  // NEW: Include research context
  researchContext?: ResearchContext;
}

// AI Prompt enhancement
const previewPrompt = `
You are generating a preview for: ${description}

## Research Context (use this to inform your design decisions)
${researchContext ? `
- Target Audience: ${researchContext.domainInsights.targetAudience}
- Key Differentiators: ${researchContext.domainInsights.keyDifferentiators.join(", ")}
- Design Style: ${researchContext.designDirection.style}
- Color Preferences: ${researchContext.designDirection.colorPreferences.join(", ")}
- Competitors do: ${researchContext.competitorAnalysis.theirStrengths.join(", ")}
- Our opportunity: ${researchContext.competitorAnalysis.ourOpportunities.join(", ")}
` : "No research context provided."}

Generate a preview that specifically addresses these insights...
`;
```

### 3.6 Export README Enhancement

```markdown
# Project Export README

## Research Summary

This project was configured based on research into the **${domain}** domain.

### Target Audience
${researchContext.domainInsights.targetAudience}

### Problem Being Solved
${researchContext.domainInsights.problemSolved}

### Competitive Landscape
We analyzed these competitors: ${competitors.join(", ")}

Key differentiators for this project:
${keyDifferentiators.map(d => `- ${d}`).join("\n")}

### Design Decisions

The ${designStyle} design style was chosen because:
${designRationale}

### Feature Selection Rationale

| Feature | Why It's Included |
|---------|-------------------|
${features.map(f => `| ${f.name} | ${f.rationale} |`).join("\n")}

---

*Generated by Dawson-Does Framework on ${date}*
```

---

## 4. Competitive Analysis Feature

### 4.1 Feature Overview

When users provide competitor URLs, the system should:
1. Deep-crawl each competitor site
2. Extract features, pricing, positioning
3. Identify gaps and opportunities
4. Map to available integrations
5. Suggest differentiation strategies

### 4.2 Competitor Input UX

```
┌─────────────────────────────────────────────────────────────┐
│  Competitive Analysis                                        │
│  ─────────────────────                                       │
│  Add your competitors to find opportunities:                 │
│                                                              │
│  ┌────────────────────────────────────┐ [+ Add]             │
│  │ https://competitor1.com            │                      │
│  └────────────────────────────────────┘                      │
│                                                              │
│  Added competitors:                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔗 competitor1.com          [Analyzing...] ⟳           │ │
│  │ 🔗 competitor2.com          [✓ Analyzed]   [Remove]    │ │
│  │ 🔗 competitor3.com          [✓ Analyzed]   [Remove]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [View Comparison Matrix]                                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Competitive Analysis Data Model

```typescript
interface Competitor {
  url: string;
  name: string;
  tagline: string;
  
  // Extracted data
  features: {
    name: string;
    category: string;
    importance: "core" | "secondary" | "nice-to-have";
  }[];
  
  pricing: {
    model: "freemium" | "subscription" | "one-time" | "enterprise";
    lowestTier: number;
    highestTier: number;
    currency: string;
  };
  
  targetAudience: string;
  positioning: string;         // Their main value prop
  
  techStack: {
    frontend: string[];
    integrations: string[];
  };
  
  strengths: string[];
  weaknesses: string[];        // Inferred from reviews, missing features
}

interface CompetitiveAnalysis {
  competitors: Competitor[];
  
  // Feature comparison matrix
  featureMatrix: {
    feature: string;
    category: string;
    competitors: Record<string, boolean>;  // url -> has feature
    opportunity: "gap" | "parity" | "saturated";
  }[];
  
  // Strategic insights
  insights: {
    marketGaps: string[];        // Features no one has
    parityFeatures: string[];    // Must-have to compete
    differentiators: string[];   // Unique opportunities
    pricingOpportunity: string;  // Pricing strategy suggestion
  };
  
  // Recommendations
  recommendations: {
    mustHave: string[];          // To compete at all
    shouldHave: string[];        // To be competitive
    couldDifferentiate: string[];// To stand out
  };
}
```

### 4.4 Comparison Matrix UI

```
┌──────────────────────────────────────────────────────────────────────┐
│  Feature Comparison Matrix                                            │
│  ────────────────────────                                             │
│                                                                       │
│  Feature              │ Comp1 │ Comp2 │ Comp3 │ Opportunity │ Yours  │
│  ─────────────────────┼───────┼───────┼───────┼─────────────┼────────│
│  User Authentication  │  ✓    │  ✓    │  ✓    │ Parity      │  ✓     │
│  Subscription Billing │  ✓    │  ✓    │  ✗    │ Parity      │  ✓     │
│  AI Recommendations   │  ✗    │  ✓    │  ✗    │ Differentiate│ ⭐     │
│  Mobile App           │  ✓    │  ✗    │  ✓    │ Parity      │  ?     │
│  API Access           │  ✗    │  ✗    │  ✗    │ Gap!        │  ⭐     │
│  ─────────────────────┴───────┴───────┴───────┴─────────────┴────────│
│                                                                       │
│  Legend: ✓ Has feature  ✗ Missing  ⭐ Recommended  ? Undecided       │
│                                                                       │
│  ───────────────────────────────────────────────────────────────────  │
│  Key Insights:                                                        │
│  • Gap opportunity: API Access (no one offers this)                  │
│  • Differentiate with: AI Recommendations                            │
│  • Must have for parity: Auth, Billing, Mobile                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.5 Competitive Analysis API

```typescript
// POST /api/research/competitors
interface CompetitorsRequest {
  competitorUrls: string[];
  domain: string;              // For context
  vision?: string;             // What user wants to build
}

interface CompetitorsResponse {
  success: boolean;
  analysis: CompetitiveAnalysis;
  crawlResults: {
    url: string;
    success: boolean;
    pagesAnalyzed: number;
  }[];
}
```

### 4.6 AI Prompt for Competitive Analysis

```markdown
## Competitive Analysis Task

Analyze these competitors in the ${domain} space:

${competitors.map(c => `
### ${c.name} (${c.url})
${c.crawledContent}
`).join("\n")}

## User's Vision
${vision}

## Your Analysis

1. **Feature Extraction**: List every feature each competitor has
2. **Pricing Analysis**: Identify pricing models and tiers
3. **Gap Analysis**: Find features no competitor has
4. **Parity Requirements**: What must the user have to compete?
5. **Differentiation Opportunities**: How can they stand out?
6. **Strategic Recommendations**: Prioritized feature list

Output as JSON:
{
  "competitors": [...],
  "featureMatrix": [...],
  "insights": {
    "marketGaps": [...],
    "parityFeatures": [...],
    "differentiators": [...]
  },
  "recommendations": {
    "mustHave": [...],
    "shouldHave": [...],
    "couldDifferentiate": [...]
  }
}
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Extend Zustand state with ResearchContext
- [ ] Create database migration for research_contexts
- [ ] Update research API to accept enhanced inputs
- [ ] Implement context persistence

### Phase 2: Multi-Source Inputs (Week 2-3)
- [ ] Enhanced URL crawling with depth control
- [ ] Image upload + Claude Vision analysis
- [ ] Tech stack detection
- [ ] Figma integration (if feasible)

### Phase 3: Iterative Refinement (Week 3-4)
- [ ] Refinement UI components
- [ ] Refine API endpoint
- [ ] Feedback data model
- [ ] Max 3 iterations logic

### Phase 4: Competitive Analysis (Week 4-5)
- [ ] Competitor input UI
- [ ] Multi-site crawling
- [ ] Feature comparison matrix
- [ ] Strategic recommendations

### Phase 5: Context Integration (Week 5-6)
- [ ] Preview generation enhancement
- [ ] Export README generation
- [ ] Component generation context
- [ ] End-to-end testing

---

## 6. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Research completion rate | ~60% | 85% |
| Template accuracy | Unknown | 90% user acceptance |
| Feature relevance | Unknown | 80% kept by users |
| User satisfaction | N/A | 4.5/5 rating |
| Time to complete research | 30-60s | <45s |

---

## 7. Open Questions

1. **Figma Integration**: Requires Figma API access. Should we require user tokens or use a service account?

2. **Rate Limiting**: Crawling multiple competitors could hit rate limits. Implement queuing?

3. **Privacy**: Storing research context means storing user intent. GDPR implications?

4. **Cost**: More AI calls = more cost. Should refinement iterations count against usage?

---

## 8. Handoff to Platform Agent

Once approved, the Platform Agent should:

1. Implement database migrations
2. Create/update API endpoints
3. Integrate with existing research flow
4. Add usage tracking for new features

**Next Agent**: Platform Agent  
**Task**: Implement Research Optimization Phase 1 (Foundation)

---

*Document prepared by Research Agent | January 5, 2026*

