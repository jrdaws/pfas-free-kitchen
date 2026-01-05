/**
 * Pattern Selector AI
 * 
 * Analyzes user requirements and selects the best patterns for each page section.
 * Uses Claude to make intelligent pattern selections based on vision, research, and context.
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  SelectorInput,
  SelectorOutput,
  PatternSelection,
  Pattern,
  VisionDocument,
  ResearchResult,
  PageType,
  LayoutType,
} from "./types";

// ============================================================================
// Pattern Registry (will be expanded by Template Agent)
// ============================================================================

const AVAILABLE_PATTERNS: Pattern[] = [
  {
    id: "hero-centered",
    name: "Centered Hero",
    category: "hero",
    variants: ["dark", "light", "gradient"],
    tags: ["minimal", "professional", "clean"],
    slots: [
      { name: "headline", type: "text", required: true, maxLength: 80 },
      { name: "subheadline", type: "text", required: false, maxLength: 160 },
      { name: "ctaText", type: "text", required: true, maxLength: 30 },
      { name: "ctaLink", type: "text", required: true },
      { name: "secondaryCta", type: "text", required: false },
    ],
  },
  {
    id: "hero-split-image",
    name: "Split Hero with Image",
    category: "hero",
    variants: ["dark", "light", "gradient"],
    tags: ["product", "visual", "showcase"],
    slots: [
      { name: "headline", type: "text", required: true, maxLength: 80 },
      { name: "subheadline", type: "text", required: false, maxLength: 200 },
      { name: "ctaText", type: "text", required: true, maxLength: 30 },
      { name: "image", type: "image", required: true },
      { name: "imageAlt", type: "text", required: true },
    ],
  },
  {
    id: "features-grid",
    name: "Features Grid",
    category: "features",
    variants: ["dark", "light", "cards"],
    tags: ["3-column", "icons", "benefits"],
    slots: [
      { name: "title", type: "text", required: true, maxLength: 60 },
      { name: "subtitle", type: "text", required: false, maxLength: 120 },
      { name: "features", type: "array", required: true },
    ],
  },
  {
    id: "features-alternating",
    name: "Alternating Features",
    category: "features",
    variants: ["dark", "light"],
    tags: ["detailed", "images", "storytelling"],
    slots: [
      { name: "features", type: "array", required: true },
    ],
  },
  {
    id: "pricing-three-tier",
    name: "Three Tier Pricing",
    category: "pricing",
    variants: ["dark", "light", "gradient"],
    tags: ["saas", "comparison", "popular"],
    slots: [
      { name: "title", type: "text", required: true },
      { name: "plans", type: "array", required: true },
      { name: "showToggle", type: "boolean", required: false, defaultValue: true },
    ],
  },
  {
    id: "testimonials-grid",
    name: "Testimonials Grid",
    category: "testimonials",
    variants: ["dark", "light"],
    tags: ["social-proof", "reviews", "trust"],
    slots: [
      { name: "title", type: "text", required: true },
      { name: "testimonials", type: "array", required: true },
    ],
  },
  {
    id: "testimonials-carousel",
    name: "Testimonials Carousel",
    category: "testimonials",
    variants: ["dark", "light"],
    tags: ["dynamic", "featured", "quotes"],
    slots: [
      { name: "testimonials", type: "array", required: true },
    ],
  },
  {
    id: "cta-simple",
    name: "Simple CTA",
    category: "cta",
    variants: ["dark", "light", "gradient"],
    tags: ["conversion", "action", "minimal"],
    slots: [
      { name: "headline", type: "text", required: true, maxLength: 60 },
      { name: "subheadline", type: "text", required: false },
      { name: "ctaText", type: "text", required: true },
      { name: "ctaLink", type: "text", required: true },
    ],
  },
  {
    id: "faq-accordion",
    name: "FAQ Accordion",
    category: "faq",
    variants: ["dark", "light"],
    tags: ["questions", "support", "expandable"],
    slots: [
      { name: "title", type: "text", required: true },
      { name: "items", type: "array", required: true },
    ],
  },
  {
    id: "footer-multi-column",
    name: "Multi-Column Footer",
    category: "footer",
    variants: ["dark", "light"],
    tags: ["links", "comprehensive", "social"],
    slots: [
      { name: "projectName", type: "text", required: true },
      { name: "description", type: "text", required: false },
      { name: "links", type: "array", required: true },
      { name: "showSocial", type: "boolean", required: false, defaultValue: true },
    ],
  },
  {
    id: "nav-standard",
    name: "Standard Navigation",
    category: "navigation",
    variants: ["solid", "transparent"],
    tags: ["header", "menu", "auth"],
    slots: [
      { name: "projectName", type: "text", required: true },
      { name: "links", type: "array", required: true },
      { name: "showAuth", type: "boolean", required: false, defaultValue: true },
    ],
  },
  {
    id: "stats-simple",
    name: "Stats Section",
    category: "stats",
    variants: ["dark", "light", "gradient"],
    tags: ["numbers", "metrics", "social-proof"],
    slots: [
      { name: "stats", type: "array", required: true },
    ],
  },
];

// ============================================================================
// Selector Implementation
// ============================================================================

const SELECTOR_PROMPT_TEMPLATE = `You are a senior UI/UX expert selecting page patterns for a web application.

## Context
Project: {{projectName}}
Vision: {{vision}}
Audience: {{audience}}
Tone: {{tone}}
Template: {{template}}
Page Type: {{pageType}}

## Research Insights
{{research}}

## Available Patterns
{{patterns}}

## Task
Select the best patterns for each section of the {{pageType}} page.

For each selection:
1. Choose the pattern that best fits the user's vision and audience
2. Select the appropriate variant (light/dark/gradient)
3. Explain WHY this pattern fits their needs
4. Consider the flow - patterns should tell a cohesive story

## Selection Guidelines
- Hero: Match energy to tone (playful = dynamic, professional = clean)
- Features: Match layout to number of features (3 = grid, 6+ = carousel)
- Testimonials: Include if trust-building is important
- Pricing: Include for SaaS/products, skip for portfolios
- CTA: Strong for conversion-focused, subtle for content-focused
- FAQ: Include for complex products/services

## Output Format
Return valid JSON only:
{
  "sections": [
    {
      "patternId": "hero-split-image",
      "reason": "User mentioned showcasing their product - split layout allows prominent product image while maintaining clear value proposition",
      "variant": "dark",
      "order": 1,
      "confidenceScore": 92
    }
  ],
  "layoutRecommendation": "layout-marketing"
}

## Rules
- Order sections logically (hero first, CTA near end, footer last)
- Don't include redundant sections (one hero, one footer max)
- Match variant to overall color scheme preference
- Confidence score: 90+ = strong fit, 70-89 = good fit, <70 = fallback choice`;

function formatPatterns(patterns: Pattern[]): string {
  return patterns
    .map(p => `- ${p.id} (${p.category}): ${p.name} | variants: ${p.variants.join(", ")} | tags: ${p.tags.join(", ")}`)
    .join("\n");
}

function formatResearch(research?: ResearchResult): string {
  if (!research) return "No research available.";
  
  const insights = research.insights?.join("\n- ") || "None";
  const recommendations = research.recommendations?.join("\n- ") || "None";
  
  return `Insights:\n- ${insights}\n\nRecommendations:\n- ${recommendations}`;
}

function buildPrompt(input: SelectorInput): string {
  const { vision, research, pageType } = input;
  
  return SELECTOR_PROMPT_TEMPLATE
    .replace(/\{\{projectName\}\}/g, vision.projectName)
    .replace(/\{\{vision\}\}/g, vision.description)
    .replace(/\{\{audience\}\}/g, vision.audience || "general audience")
    .replace(/\{\{tone\}\}/g, vision.tone || "professional")
    .replace(/\{\{template\}\}/g, "saas")
    .replace(/\{\{pageType\}\}/g, pageType)
    .replace(/\{\{research\}\}/g, formatResearch(research))
    .replace(/\{\{patterns\}\}/g, formatPatterns(input.availablePatterns));
}

function parseResponse(response: string): SelectorOutput {
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse selector response: no JSON found");
  }
  
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      sections: parsed.sections || [],
      layoutRecommendation: parsed.layoutRecommendation || "layout-marketing",
    };
  } catch (e) {
    throw new Error(`Failed to parse selector response: ${e}`);
  }
}

// ============================================================================
// Page Type to Pattern Mapping (Fallback)
// ============================================================================

const PAGE_TYPE_PATTERNS: Record<PageType, string[]> = {
  home: ["nav-standard", "hero-centered", "features-grid", "testimonials-grid", "cta-simple", "footer-multi-column"],
  about: ["nav-standard", "hero-centered", "features-alternating", "footer-multi-column"],
  pricing: ["nav-standard", "pricing-three-tier", "faq-accordion", "cta-simple", "footer-multi-column"],
  features: ["nav-standard", "hero-centered", "features-alternating", "cta-simple", "footer-multi-column"],
  blog: ["nav-standard", "hero-centered", "footer-multi-column"],
  "blog-post": ["nav-standard", "footer-multi-column"],
  contact: ["nav-standard", "cta-simple", "footer-multi-column"],
  product: ["nav-standard", "hero-split-image", "features-grid", "testimonials-grid", "pricing-three-tier", "footer-multi-column"],
  dashboard: ["nav-standard", "stats-simple"],
  settings: ["nav-standard"],
  auth: ["nav-standard"],
};

function getFallbackSelection(pageType: PageType): PatternSelection[] {
  const patterns = PAGE_TYPE_PATTERNS[pageType] || PAGE_TYPE_PATTERNS.home;
  
  return patterns.map((patternId, index) => ({
    patternId,
    reason: "Fallback selection based on page type",
    variant: "dark",
    order: index + 1,
    confidenceScore: 60,
  }));
}

// ============================================================================
// Main Export
// ============================================================================

export async function selectPatterns(input: SelectorInput): Promise<SelectorOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  // If no API key, use fallback
  if (!apiKey) {
    console.warn("[Selector] No API key, using fallback selection");
    return {
      sections: getFallbackSelection(input.pageType),
      layoutRecommendation: "layout-marketing",
    };
  }
  
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt({
    ...input,
    availablePatterns: input.availablePatterns.length > 0 
      ? input.availablePatterns 
      : AVAILABLE_PATTERNS,
  });
  
  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        { role: "user", content: prompt },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    return parseResponse(content.text);
  } catch (error) {
    console.error("[Selector] AI selection failed, using fallback:", error);
    return {
      sections: getFallbackSelection(input.pageType),
      layoutRecommendation: "layout-marketing",
    };
  }
}

export function getAvailablePatterns(): Pattern[] {
  return AVAILABLE_PATTERNS;
}

export function getPatternById(id: string): Pattern | undefined {
  return AVAILABLE_PATTERNS.find(p => p.id === id);
}

export function getPatternsByCategory(category: string): Pattern[] {
  return AVAILABLE_PATTERNS.filter(p => p.category === category);
}

