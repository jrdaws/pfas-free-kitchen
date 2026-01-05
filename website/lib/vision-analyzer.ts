/**
 * Vision Analyzer - Claude Vision for Screenshot Analysis
 * Analyzes website screenshots to extract:
 * - Layout patterns and section structure
 * - Component styles (buttons, cards, images, icons)
 * - Color palette extraction
 */

import Anthropic from "@anthropic-ai/sdk";

// Layout analysis types
export interface SectionLayout {
  type: "hero" | "features" | "pricing" | "testimonials" | "cta" | "faq" | "footer" | "nav" | "other";
  pattern: "centered" | "split-left" | "split-right" | "grid-2" | "grid-3" | "grid-4" | "alternating" | "masonry";
  background: "solid" | "gradient" | "image" | "pattern" | "transparent";
  height: string; // e.g., "100vh", "auto", "500px"
}

export interface PageLayout {
  sections: SectionLayout[];
  overallStyle: "minimal" | "bold" | "corporate" | "playful" | "dark" | "light";
}

// Component style types
export interface ComponentStyles {
  buttons: {
    shape: "pill" | "rounded" | "square";
    style: "solid" | "outline" | "gradient" | "ghost";
  };
  cards: {
    style: "elevated" | "bordered" | "flat" | "glass";
    corners: "rounded" | "sharp" | "extra-rounded";
  };
  images: {
    treatment: "rounded" | "sharp" | "circle" | "masked";
  };
  icons: {
    style: "line" | "filled" | "duotone";
    size: "sm" | "md" | "lg";
  };
}

// Color palette types
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

export interface VisionAnalysisResult {
  layout: PageLayout;
  components: ComponentStyles;
  colorPalette: ColorPalette;
  confidence: number; // 0-1 confidence score
}

const VISION_ANALYSIS_PROMPT = `
Analyze this website screenshot in detail as a UI/UX designer would.

## Layout Analysis
For each visible section (from top to bottom):
1. Section type (hero, features, pricing, testimonials, cta, faq, footer, nav, other)
2. Layout pattern:
   - "centered": Content centered, no side elements
   - "split-left": Image/media on left, text on right
   - "split-right": Text on left, image/media on right
   - "grid-2": 2-column grid
   - "grid-3": 3-column grid
   - "grid-4": 4-column grid
   - "alternating": Alternating left/right sections
   - "masonry": Pinterest-style layout
3. Background treatment (solid, gradient, image, pattern, transparent)
4. Approximate height (vh units like "100vh", or "auto")

## Component Styles
Identify styles used for:
- Buttons: shape (pill, rounded, square), style (solid, outline, gradient, ghost)
- Cards: style (elevated, bordered, flat, glass), corners (rounded, sharp, extra-rounded)
- Images: treatment (rounded, sharp, circle, masked)
- Icons: style (line, filled, duotone), size (sm, md, lg)

## Color Palette
Extract exact hex colors visible:
- Primary (main brand color, usually buttons/links)
- Secondary (supporting color)
- Accent (highlights, CTAs, special emphasis)
- Background (main page background)
- Foreground (primary text color)
- Muted (secondary text, borders)

## Overall Style
Determine the overall design style: minimal, bold, corporate, playful, dark, or light

Return ONLY valid JSON in this exact structure:
{
  "layout": {
    "sections": [
      { "type": "hero", "pattern": "split-right", "background": "gradient", "height": "100vh" },
      { "type": "features", "pattern": "grid-3", "background": "solid", "height": "auto" }
    ],
    "overallStyle": "minimal"
  },
  "components": {
    "buttons": { "shape": "pill", "style": "gradient" },
    "cards": { "style": "elevated", "corners": "rounded" },
    "images": { "treatment": "rounded" },
    "icons": { "style": "duotone", "size": "md" }
  },
  "colorPalette": {
    "primary": "#5E6AD2",
    "secondary": "#3D4270",
    "accent": "#FFD700",
    "background": "#0D0E14",
    "foreground": "#FFFFFF",
    "muted": "#6B7280"
  },
  "confidence": 0.85
}
`;

/**
 * Analyze a screenshot using Claude Vision
 * @param screenshot Base64-encoded image data (with or without data URI prefix)
 * @returns Structured analysis of layout, components, and colors
 */
export async function analyzeScreenshotWithVision(
  screenshot: string
): Promise<VisionAnalysisResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[Vision] Anthropic API key not configured");
    return null;
  }

  // Remove data URI prefix if present
  const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");

  try {
    const anthropic = new Anthropic({ apiKey });

    console.log("[Vision] Analyzing screenshot with Claude Vision...");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: base64Data,
            },
          },
          {
            type: "text",
            text: VISION_ANALYSIS_PROMPT,
          },
        ],
      }],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      console.error("[Vision] No text response from Claude");
      return null;
    }

    // Parse JSON response
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("[Vision] No JSON found in response");
        return null;
      }
      
      const result = JSON.parse(jsonMatch[0]) as VisionAnalysisResult;
      console.log(`[Vision] Analysis complete: ${result.layout.sections.length} sections, style=${result.layout.overallStyle}`);
      return result;
    } catch (parseError) {
      console.error("[Vision] Failed to parse response:", parseError);
      console.error("[Vision] Raw response:", textContent.text.slice(0, 500));
      return null;
    }
  } catch (error) {
    console.error("[Vision] API error:", error);
    return null;
  }
}

/**
 * Analyze multiple screenshots and aggregate results
 */
export async function analyzeMultipleScreenshots(
  screenshots: { url: string; screenshot: string }[]
): Promise<Record<string, VisionAnalysisResult>> {
  const results: Record<string, VisionAnalysisResult> = {};

  for (const { url, screenshot } of screenshots) {
    const analysis = await analyzeScreenshotWithVision(screenshot);
    if (analysis) {
      results[url] = analysis;
    }
  }

  return results;
}

/**
 * Extract common patterns from multiple vision analyses
 */
export function extractCommonPatterns(
  analyses: VisionAnalysisResult[]
): {
  commonSectionTypes: string[];
  dominantStyle: string;
  averageColors: ColorPalette;
  componentTrends: {
    buttonShape: string;
    cardStyle: string;
    iconStyle: string;
  };
} {
  if (analyses.length === 0) {
    return {
      commonSectionTypes: [],
      dominantStyle: "minimal",
      averageColors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        accent: "#F97316",
        background: "#FFFFFF",
        foreground: "#111827",
        muted: "#6B7280",
      },
      componentTrends: {
        buttonShape: "rounded",
        cardStyle: "bordered",
        iconStyle: "line",
      },
    };
  }

  // Count section types
  const sectionCounts: Record<string, number> = {};
  analyses.forEach(a => {
    a.layout.sections.forEach(s => {
      sectionCounts[s.type] = (sectionCounts[s.type] || 0) + 1;
    });
  });

  // Count styles
  const styleCounts: Record<string, number> = {};
  analyses.forEach(a => {
    styleCounts[a.layout.overallStyle] = (styleCounts[a.layout.overallStyle] || 0) + 1;
  });

  // Count button shapes
  const buttonCounts: Record<string, number> = {};
  analyses.forEach(a => {
    buttonCounts[a.components.buttons.shape] = (buttonCounts[a.components.buttons.shape] || 0) + 1;
  });

  // Most common of each
  const sortByCount = (counts: Record<string, number>) => 
    Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    commonSectionTypes: sortByCount(sectionCounts).slice(0, 5).map(([k]) => k),
    dominantStyle: sortByCount(styleCounts)[0]?.[0] || "minimal",
    averageColors: analyses[0].colorPalette, // Use first as reference
    componentTrends: {
      buttonShape: sortByCount(buttonCounts)[0]?.[0] || "rounded",
      cardStyle: analyses[0].components.cards.style,
      iconStyle: analyses[0].components.icons.style,
    },
  };
}

