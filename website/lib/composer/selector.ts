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
  ComposerMode,
} from "./types";
import { mapAestheticToVariant, mapLayoutType, type DesignAnalysis } from "../design-analyzer";
import type { InspirationComposition } from "../inspiration/types";

// ============================================================================
// Mode-Specific System Prompts
// ============================================================================

const MODE_SYSTEM_PROMPTS: Record<ComposerMode, string> = {
  registry: `You are selecting patterns for a web page.
STRICT RULE: Only select from the provided pattern IDs.
Do NOT suggest custom sections or patterns not in the registry.
If no pattern fits a section type, SKIP that section entirely.
Prioritize using established patterns for consistency.
Your selections must ONLY use patterns from the "Available Patterns" list.`,

  hybrid: `You are selecting patterns for a web page.
Prefer patterns from the registry where they fit well.
For unique requirements not covered by registry patterns, you may suggest custom section structures.
Mark custom sections with patternId starting with "custom-".
Balance between consistency (patterns) and customization (custom sections).
Aim for 70-80% registry patterns, 20-30% custom if needed.`,

  auto: `You are designing an optimal web page layout with full creative control.
You can freely combine registry patterns with custom designs.
Feel free to suggest:
- Novel section arrangements
- Creative component combinations
- Unique layout variations
- Custom section structures (use patternId: "custom-*")
Prioritize the best user experience over pattern reuse.
Be creative and don't feel constrained by the pattern library.`,
};

// ============================================================================
// Pattern Registry - Loaded from JSON registry (42 patterns)
// ============================================================================

import { getAllSelectorPatterns, getPatternById as getRegistryPattern, getPatternsByCategory as getRegistryPatternsByCategory, toSelectorPattern } from "./patterns";

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
  const { vision, research, pageType, composerMode = "hybrid" } = input;
  
  // Get mode-specific instructions
  const modeInstructions = MODE_SYSTEM_PROMPTS[composerMode];
  
  const basePrompt = SELECTOR_PROMPT_TEMPLATE
    .replace(/\{\{projectName\}\}/g, vision.projectName)
    .replace(/\{\{vision\}\}/g, vision.description)
    .replace(/\{\{audience\}\}/g, vision.audience || "general audience")
    .replace(/\{\{tone\}\}/g, vision.tone || "professional")
    .replace(/\{\{template\}\}/g, "saas")
    .replace(/\{\{pageType\}\}/g, pageType)
    .replace(/\{\{research\}\}/g, formatResearch(research))
    .replace(/\{\{patterns\}\}/g, formatPatterns(input.availablePatterns));
  
  // Prepend mode-specific system instructions
  return `## Mode: ${composerMode.toUpperCase()}
${modeInstructions}

${basePrompt}`;
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
  // Use hero-split-image for home to enable image generation
  home: ["nav-standard", "hero-split-image", "features-grid", "testimonials-grid", "cta-simple", "footer-multi-column"],
  about: ["nav-standard", "hero-split-image", "features-alternating", "footer-multi-column"],
  pricing: ["nav-standard", "pricing-three-tier", "faq-accordion", "cta-simple", "footer-multi-column"],
  features: ["nav-standard", "hero-split-image", "features-alternating", "cta-simple", "footer-multi-column"],
  blog: ["nav-standard", "hero-split-image", "footer-multi-column"],
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
// Inspiration Composition Integration
// ============================================================================

/**
 * Convert inspiration composition to pattern selections
 * This uses detected sections from inspiration sites mapped to our patterns
 */
function selectFromInspiration(
  composition: InspirationComposition,
  pageType: PageType
): SelectorOutput {
  const sections: PatternSelection[] = composition.sections.map((mapping) => ({
    patternId: mapping.patternId,
    reason: `Matched from inspiration site (${mapping.source}, ${Math.round(mapping.confidence * 100)}% confidence)`,
    variant: mapping.variant,
    order: mapping.sectionIndex + 1,
    confidenceScore: Math.round(mapping.confidence * 100),
  }));

  // Map layout type
  const layoutMap: Record<string, LayoutType> = {
    marketing: "layout-marketing",
    dashboard: "layout-dashboard",
    blog: "layout-blog",
    ecommerce: "layout-ecommerce",
    portfolio: "layout-marketing",
  };

  const layoutRecommendation = layoutMap[composition.layout.type] || "layout-marketing";

  // Ensure we have navigation and footer
  const hasNav = sections.some((s) => s.patternId.includes("nav"));
  const hasFooter = sections.some((s) => s.patternId.includes("footer"));

  if (!hasNav) {
    const navVariant = composition.layout.navigation === "transparent" ? "transparent" : "solid";
    sections.unshift({
      patternId: "nav-standard",
      reason: "Navigation added for page structure",
      variant: navVariant as "light" | "dark" | "gradient",
      order: 0,
      confidenceScore: 100,
    });
  }

  if (!hasFooter) {
    sections.push({
      patternId: "footer-multi-column",
      reason: "Footer added for page structure",
      variant: "dark",
      order: sections.length + 1,
      confidenceScore: 100,
    });
  }

  // Renumber orders
  sections.forEach((s, i) => (s.order = i + 1));

  console.log(
    `[Selector] Using inspiration composition - ${sections.length} patterns, layout: ${layoutRecommendation}, confidence: ${Math.round(composition.metadata.overallConfidence * 100)}%`
  );

  return {
    sections,
    layoutRecommendation,
  };
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
// Mode-Specific Selection Functions
// ============================================================================

/**
 * Registry mode: ONLY use patterns from the registry, no custom sections
 */
function selectFromRegistryStrict(
  input: SelectorInput,
  aiResult: SelectorOutput
): SelectorOutput {
  // Filter out any custom patterns (those starting with "custom-")
  const filteredSections = aiResult.sections.filter(
    (s) => !s.patternId.startsWith("custom-")
  );

  // Ensure all patterns exist in registry
  const validPatterns = AVAILABLE_PATTERNS.map((p) => p.id);
  const validSections = filteredSections.filter((s) =>
    validPatterns.includes(s.patternId)
  );

  console.log(
    `[Selector] Registry mode: ${validSections.length} patterns (filtered ${aiResult.sections.length - validSections.length} custom/invalid)`
  );

  return {
    sections: validSections,
    layoutRecommendation: aiResult.layoutRecommendation,
  };
}

/**
 * Auto mode: Allow more creative sections, mark AI-generated ones
 */
function enhanceForAutoMode(aiResult: SelectorOutput): SelectorOutput {
  // In auto mode, we accept all results including custom sections
  const enhancedSections = aiResult.sections.map((s) => ({
    ...s,
    // Mark custom sections for the UI
    reason: s.patternId.startsWith("custom-")
      ? `[AI Generated] ${s.reason}`
      : s.reason,
  }));

  console.log(
    `[Selector] Auto mode: ${enhancedSections.length} patterns (${enhancedSections.filter((s) => s.patternId.startsWith("custom-")).length} custom)`
  );

  return {
    sections: enhancedSections,
    layoutRecommendation: aiResult.layoutRecommendation,
  };
}

// ============================================================================
// Main Export
// ============================================================================

export async function selectPatterns(input: SelectorInput): Promise<SelectorOutput> {
  const mode = input.composerMode || "hybrid";
  console.log(`[Selector] Mode: ${mode.toUpperCase()}`);

  // Priority 1: Use inspiration composition if available (from analyzed inspiration URLs)
  if (input.inspirationComposition?.sections?.length) {
    console.log("[Selector] Using inspiration-driven pattern selection");
    return selectFromInspiration(input.inspirationComposition, input.pageType);
  }

  // Priority 2: Use design analysis with pattern recommendations
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
    composerMode: mode,
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
    
    const aiResult = parseResponse(content.text);
    
    // Apply mode-specific post-processing
    switch (mode) {
      case "registry":
        return selectFromRegistryStrict(input, aiResult);
      case "auto":
        return enhanceForAutoMode(aiResult);
      case "hybrid":
      default:
        // Hybrid mode: use AI result as-is but log it
        console.log(`[Selector] Hybrid mode: ${aiResult.sections.length} patterns`);
        return aiResult;
    }
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
  return toSelectorPattern(pattern) as Pattern;
}

export function getPatternsByCategory(category: string): Pattern[] {
  return getRegistryPatternsByCategory(category).map(p => toSelectorPattern(p) as Pattern);
}

