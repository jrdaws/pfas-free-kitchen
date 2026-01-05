/**
 * Component Detector
 * 
 * Uses Claude Vision to identify UI component patterns and styles
 * from website screenshots.
 */

import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// Types
// ============================================================================

export interface ButtonStyle {
  style: "solid" | "outline" | "ghost" | "gradient";
  shape: "rounded" | "pill" | "square";
  sizes: ("sm" | "md" | "lg")[];
  primaryColor?: string;
}

export interface CardStyle {
  style: "elevated" | "bordered" | "flat" | "glass";
  hasImage: boolean;
  hasIcon: boolean;
  rounded: "none" | "sm" | "md" | "lg" | "xl";
}

export interface FormStyle {
  inputStyle: "outline" | "filled" | "underline";
  hasLabels: boolean;
  hasFloatingLabels: boolean;
  rounded: "none" | "sm" | "md" | "lg";
}

export interface ImageStyle {
  style: "rounded" | "square" | "circle" | "masked";
  hasOverlays: boolean;
  hasShadows: boolean;
}

export interface TypographyStyle {
  headingStyle: "bold" | "light" | "serif" | "display";
  bodyStyle: "regular" | "light";
  hasAccentFont: boolean;
  textAlignment: "left" | "center" | "mixed";
}

export interface SpacingStyle {
  density: "compact" | "comfortable" | "spacious";
  sectionPadding: "small" | "medium" | "large";
}

export interface DetectedComponents {
  buttons: ButtonStyle;
  cards: CardStyle;
  forms: FormStyle;
  images: ImageStyle;
  typography: TypographyStyle;
  spacing: SpacingStyle;
  animations: {
    hasAnimations: boolean;
    types: ("fade" | "slide" | "scale" | "parallax")[];
  };
}

export interface ComponentDetectionResult {
  success: boolean;
  components: DetectedComponents | null;
  error?: string;
  rawResponse?: string;
}

// ============================================================================
// Prompt
// ============================================================================

const COMPONENT_DETECTION_PROMPT = `Analyze this website screenshot and identify the UI component styles and design patterns.

## Instructions

Look at the visual design elements and identify:

1. **Buttons**: What style are they? (solid/outline/ghost/gradient) What shape? (rounded/pill/square)
2. **Cards**: Are they elevated (shadows), bordered, flat, or glass/frosted?
3. **Forms/Inputs**: Outline, filled, or underline style? Do they have labels?
4. **Images**: Are they rounded, square, circular, or have custom masks?
5. **Typography**: Are headings bold/light/serif? Is there a display font?
6. **Spacing**: Is the layout compact, comfortable, or spacious?
7. **Animations**: Can you see any animation indicators (hover states, transitions)?

## Output Format

Return ONLY valid JSON:

{
  "buttons": {
    "style": "solid",
    "shape": "rounded",
    "sizes": ["md", "lg"]
  },
  "cards": {
    "style": "elevated",
    "hasImage": true,
    "hasIcon": true,
    "rounded": "lg"
  },
  "forms": {
    "inputStyle": "outline",
    "hasLabels": true,
    "hasFloatingLabels": false,
    "rounded": "md"
  },
  "images": {
    "style": "rounded",
    "hasOverlays": false,
    "hasShadows": true
  },
  "typography": {
    "headingStyle": "bold",
    "bodyStyle": "regular",
    "hasAccentFont": false,
    "textAlignment": "left"
  },
  "spacing": {
    "density": "comfortable",
    "sectionPadding": "large"
  },
  "animations": {
    "hasAnimations": true,
    "types": ["fade", "slide"]
  }
}`;

// ============================================================================
// Default Components
// ============================================================================

const DEFAULT_COMPONENTS: DetectedComponents = {
  buttons: { style: "solid", shape: "rounded", sizes: ["md", "lg"] },
  cards: { style: "elevated", hasImage: true, hasIcon: true, rounded: "lg" },
  forms: { inputStyle: "outline", hasLabels: true, hasFloatingLabels: false, rounded: "md" },
  images: { style: "rounded", hasOverlays: false, hasShadows: true },
  typography: { headingStyle: "bold", bodyStyle: "regular", hasAccentFont: false, textAlignment: "left" },
  spacing: { density: "comfortable", sectionPadding: "large" },
  animations: { hasAnimations: true, types: ["fade"] },
};

// ============================================================================
// Parser
// ============================================================================

function parseComponentResponse(text: string): DetectedComponents | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      buttons: {
        style: parsed.buttons?.style || "solid",
        shape: parsed.buttons?.shape || "rounded",
        sizes: parsed.buttons?.sizes || ["md"],
        primaryColor: parsed.buttons?.primaryColor,
      },
      cards: {
        style: parsed.cards?.style || "elevated",
        hasImage: parsed.cards?.hasImage ?? true,
        hasIcon: parsed.cards?.hasIcon ?? false,
        rounded: parsed.cards?.rounded || "lg",
      },
      forms: {
        inputStyle: parsed.forms?.inputStyle || "outline",
        hasLabels: parsed.forms?.hasLabels ?? true,
        hasFloatingLabels: parsed.forms?.hasFloatingLabels ?? false,
        rounded: parsed.forms?.rounded || "md",
      },
      images: {
        style: parsed.images?.style || "rounded",
        hasOverlays: parsed.images?.hasOverlays ?? false,
        hasShadows: parsed.images?.hasShadows ?? true,
      },
      typography: {
        headingStyle: parsed.typography?.headingStyle || "bold",
        bodyStyle: parsed.typography?.bodyStyle || "regular",
        hasAccentFont: parsed.typography?.hasAccentFont ?? false,
        textAlignment: parsed.typography?.textAlignment || "left",
      },
      spacing: {
        density: parsed.spacing?.density || "comfortable",
        sectionPadding: parsed.spacing?.sectionPadding || "large",
      },
      animations: {
        hasAnimations: parsed.animations?.hasAnimations ?? true,
        types: parsed.animations?.types || ["fade"],
      },
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Detect UI component styles from a screenshot.
 */
export async function detectComponents(
  screenshotBase64: string
): Promise<ComponentDetectionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return {
      success: true,
      components: DEFAULT_COMPONENTS,
      error: "No API key - using default components",
    };
  }
  
  const client = new Anthropic({ apiKey });
  
  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
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
              text: COMPONENT_DETECTION_PROMPT,
            },
          ],
        },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    const components = parseComponentResponse(content.text);
    
    if (!components) {
      return {
        success: false,
        components: DEFAULT_COMPONENTS,
        error: "Failed to parse component response",
        rawResponse: content.text,
      };
    }
    
    return {
      success: true,
      components,
      rawResponse: content.text,
    };
  } catch (error) {
    console.error("[ComponentDetector] Detection failed:", error);
    return {
      success: false,
      components: DEFAULT_COMPONENTS,
      error: error instanceof Error ? error.message : "Detection failed",
    };
  }
}

export function getDefaultComponents(): DetectedComponents {
  return { ...DEFAULT_COMPONENTS };
}

