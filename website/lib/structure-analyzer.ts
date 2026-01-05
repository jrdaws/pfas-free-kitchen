/**
 * Structure Analyzer
 * 
 * Uses Claude Vision to analyze website screenshots and detect page structure,
 * layout patterns, and section organization.
 */

import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// Types
// ============================================================================

export type SectionType = 
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "cta"
  | "faq"
  | "footer"
  | "header"
  | "stats"
  | "team"
  | "blog"
  | "product-grid"
  | "gallery"
  | "contact"
  | "custom";

export type LayoutType = 
  | "centered"
  | "split"
  | "grid"
  | "list"
  | "asymmetric"
  | "full-width";

export type HeightEstimate = 
  | "small"
  | "medium"
  | "large"
  | "full-viewport";

export interface SectionInfo {
  type: SectionType;
  position: number;
  layout: LayoutType;
  hasImage: boolean;
  hasVideo: boolean;
  estimatedHeight: HeightEstimate;
  description?: string;
}

export interface NavigationInfo {
  type: "sticky" | "static" | "transparent";
  items: string[];
  hasCta: boolean;
  hasLogo: boolean;
  hasMobileMenu: boolean;
}

export interface FooterInfo {
  columns: number;
  hasNewsletter: boolean;
  hasSocialLinks: boolean;
  hasLogo: boolean;
}

export interface PageStructure {
  sections: SectionInfo[];
  navigation: NavigationInfo;
  footer: FooterInfo;
  overallStyle: "modern" | "classic" | "minimal" | "bold" | "playful";
  colorTheme: "dark" | "light" | "mixed";
}

export interface StructureAnalysisResult {
  success: boolean;
  structure: PageStructure | null;
  error?: string;
  rawResponse?: string;
}

// ============================================================================
// Prompt
// ============================================================================

const STRUCTURE_ANALYSIS_PROMPT = `Analyze this website screenshot and identify its complete structure.

## Instructions

Look at the entire page and identify EVERY distinct section from top to bottom.

For EACH SECTION, determine:
1. **type**: What kind of section is it? (hero, features, pricing, testimonials, cta, faq, footer, header, stats, team, blog, product-grid, gallery, contact, or custom)
2. **position**: Order on page (1 = first/top, 2 = second, etc.)
3. **layout**: How is content arranged? (centered, split, grid, list, asymmetric, full-width)
4. **hasImage**: Does it contain images or illustrations?
5. **hasVideo**: Does it have video content or video embeds?
6. **estimatedHeight**: Relative to viewport (small, medium, large, full-viewport)

Also identify:
- **Navigation**: Is it sticky, static, or transparent? What menu items are visible? Is there a CTA button?
- **Footer**: How many columns? Newsletter signup? Social links?
- **Overall Style**: modern, classic, minimal, bold, or playful
- **Color Theme**: dark, light, or mixed

## Output Format

Return ONLY valid JSON (no markdown, no explanation):

{
  "sections": [
    { "type": "hero", "position": 1, "layout": "split", "hasImage": true, "hasVideo": false, "estimatedHeight": "full-viewport" },
    { "type": "features", "position": 2, "layout": "grid", "hasImage": true, "hasVideo": false, "estimatedHeight": "large" }
  ],
  "navigation": { 
    "type": "sticky", 
    "items": ["Home", "Features", "Pricing", "About"], 
    "hasCta": true,
    "hasLogo": true,
    "hasMobileMenu": true
  },
  "footer": { 
    "columns": 4, 
    "hasNewsletter": true, 
    "hasSocialLinks": true,
    "hasLogo": true
  },
  "overallStyle": "modern",
  "colorTheme": "dark"
}`;

// ============================================================================
// Default Structure
// ============================================================================

const DEFAULT_STRUCTURE: PageStructure = {
  sections: [
    { type: "hero", position: 1, layout: "centered", hasImage: false, hasVideo: false, estimatedHeight: "full-viewport" },
    { type: "features", position: 2, layout: "grid", hasImage: true, hasVideo: false, estimatedHeight: "large" },
    { type: "cta", position: 3, layout: "centered", hasImage: false, hasVideo: false, estimatedHeight: "medium" },
    { type: "footer", position: 4, layout: "full-width", hasImage: false, hasVideo: false, estimatedHeight: "small" },
  ],
  navigation: { type: "sticky", items: ["Home", "Features", "Pricing", "About"], hasCta: true, hasLogo: true, hasMobileMenu: true },
  footer: { columns: 4, hasNewsletter: true, hasSocialLinks: true, hasLogo: true },
  overallStyle: "modern",
  colorTheme: "dark",
};

// ============================================================================
// Parser
// ============================================================================

function parseStructureResponse(text: string): PageStructure | null {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize
    return {
      sections: (parsed.sections || []).map((s: Partial<SectionInfo>, i: number) => ({
        type: s.type || "custom",
        position: s.position || i + 1,
        layout: s.layout || "centered",
        hasImage: s.hasImage ?? false,
        hasVideo: s.hasVideo ?? false,
        estimatedHeight: s.estimatedHeight || "medium",
        description: s.description,
      })),
      navigation: {
        type: parsed.navigation?.type || "sticky",
        items: parsed.navigation?.items || [],
        hasCta: parsed.navigation?.hasCta ?? true,
        hasLogo: parsed.navigation?.hasLogo ?? true,
        hasMobileMenu: parsed.navigation?.hasMobileMenu ?? true,
      },
      footer: {
        columns: parsed.footer?.columns || 4,
        hasNewsletter: parsed.footer?.hasNewsletter ?? false,
        hasSocialLinks: parsed.footer?.hasSocialLinks ?? true,
        hasLogo: parsed.footer?.hasLogo ?? true,
      },
      overallStyle: parsed.overallStyle || "modern",
      colorTheme: parsed.colorTheme || "dark",
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Analyze page structure from a screenshot using Claude Vision.
 */
export async function analyzePageStructure(
  screenshotBase64: string
): Promise<StructureAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.warn("[StructureAnalyzer] No API key, using default structure");
    return {
      success: true,
      structure: DEFAULT_STRUCTURE,
      error: "No API key - using default structure",
    };
  }
  
  const client = new Anthropic({ apiKey });
  
  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307", // Use Haiku for speed
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: screenshotBase64,
              },
            },
            {
              type: "text",
              text: STRUCTURE_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    const structure = parseStructureResponse(content.text);
    
    if (!structure) {
      return {
        success: false,
        structure: DEFAULT_STRUCTURE,
        error: "Failed to parse structure response",
        rawResponse: content.text,
      };
    }
    
    return {
      success: true,
      structure,
      rawResponse: content.text,
    };
  } catch (error) {
    console.error("[StructureAnalyzer] Analysis failed:", error);
    return {
      success: false,
      structure: DEFAULT_STRUCTURE,
      error: error instanceof Error ? error.message : "Analysis failed",
    };
  }
}

export function getDefaultStructure(): PageStructure {
  return { ...DEFAULT_STRUCTURE };
}

