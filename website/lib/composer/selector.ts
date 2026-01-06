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
import { mapAestheticToVariant, mapLayoutType, type DesignAnalysis } from "../design-analyzer";

// ============================================================================
// Pattern Registry - Loaded from JSON registry (42 patterns)
// ============================================================================

import { getAllSelectorPatterns, getPatternById as getRegistryPattern, getPatternsByCategory as getRegistryPatternsByCategory } from "./patterns";

// Convert registry patterns to selector format
const AVAILABLE_PATTERNS: Pattern[] = getAllSelectorPatterns();

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
// Design Analysis Integration
// ============================================================================

/**
 * Convert design analysis pattern recommendations to pattern selections
 */
function selectFromDesignAnalysis(
  designAnalysis: DesignAnalysis,
  pageType: PageType
): SelectorOutput {
  const variant = mapAestheticToVariant(designAnalysis.aesthetic);
  const layoutRecommendation = mapLayoutType(designAnalysis.layout) as LayoutType;
  
  // Start with AI recommendations
  const sections: PatternSelection[] = designAnalysis.patternRecommendations.map((rec, index) => ({
    patternId: rec.patternId,
    reason: rec.reason,
    variant,
    order: index + 1,
    confidenceScore: rec.confidence,
  }));
  
  // If no recommendations, fall back to page type defaults
  if (sections.length === 0) {
    return {
      sections: getFallbackSelection(pageType),
      layoutRecommendation,
    };
  }
  
  // Ensure we have navigation and footer
  const hasNav = sections.some(s => s.patternId.includes("nav"));
  const hasFooter = sections.some(s => s.patternId.includes("footer"));
  
  if (!hasNav) {
    sections.unshift({
      patternId: "nav-standard",
      reason: "Navigation added for page structure",
      variant: designAnalysis.layout.navigation === "transparent" ? "transparent" : "solid",
      order: 0,
      confidenceScore: 100,
    });
  }
  
  if (!hasFooter) {
    sections.push({
      patternId: "footer-multi-column",
      reason: "Footer added for page structure",
      variant,
      order: sections.length + 1,
      confidenceScore: 100,
    });
  }
  
  // Renumber orders
  sections.forEach((s, i) => s.order = i + 1);
  
  console.log(`[Selector] Using design analysis - ${sections.length} patterns, layout: ${layoutRecommendation}`);
  
  return {
    sections,
    layoutRecommendation,
  };
}

// ============================================================================
// Main Export
// ============================================================================

export async function selectPatterns(input: SelectorInput): Promise<SelectorOutput> {
  // If we have design analysis with pattern recommendations, use it directly
  if (input.designAnalysis?.patternRecommendations?.length) {
    console.log("[Selector] Using design analysis for pattern selection");
    return selectFromDesignAnalysis(input.designAnalysis, input.pageType);
  }
  
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
  const pattern = getRegistryPattern(id);
  if (!pattern) return undefined;
  return {
    id: pattern.id,
    name: pattern.name,
    category: pattern.category,
    variants: pattern.variants,
    tags: pattern.tags,
    slots: pattern.slots,
  };
}

export function getPatternsByCategory(category: string): Pattern[] {
  return getRegistryPatternsByCategory(category).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    variants: p.variants,
    tags: p.tags,
    slots: p.slots,
  }));
}

