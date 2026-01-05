/**
 * Color Extractor
 * 
 * Extracts color palettes from inspiration URLs using Claude Vision.
 * Maps extracted colors to our semantic color scheme.
 */

import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// Types
// ============================================================================

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
}

export interface ColorExtractionResult {
  success: boolean;
  palette: ColorPalette | null;
  error?: string;
  reasoning?: string;
}

// ============================================================================
// Default Colors
// ============================================================================

const DEFAULT_PALETTE: ColorPalette = {
  primary: "#F97316",     // Orange
  secondary: "#EA580C",   // Dark orange
  accent: "#FB923C",      // Light orange
  background: "#0A0A0A",  // Dark
  foreground: "#FFFFFF",  // White
  muted: "#78716C",       // Stone
};

// ============================================================================
// Color Utilities
// ============================================================================

function isValidHex(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function sanitizeHex(color: string): string {
  // Handle various formats
  let hex = color.trim().toUpperCase();
  
  // Add # if missing
  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }
  
  // Handle 3-digit hex
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  return isValidHex(hex) ? hex : DEFAULT_PALETTE.primary;
}

function parseColorResponse(text: string): ColorPalette | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      primary: sanitizeHex(parsed.primary || parsed.Primary || DEFAULT_PALETTE.primary),
      secondary: sanitizeHex(parsed.secondary || parsed.Secondary || DEFAULT_PALETTE.secondary),
      accent: sanitizeHex(parsed.accent || parsed.Accent || DEFAULT_PALETTE.accent),
      background: sanitizeHex(parsed.background || parsed.Background || DEFAULT_PALETTE.background),
      foreground: sanitizeHex(parsed.foreground || parsed.Foreground || DEFAULT_PALETTE.foreground),
      muted: sanitizeHex(parsed.muted || parsed.Muted || DEFAULT_PALETTE.muted),
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Screenshot Taking (using external services)
// ============================================================================

/**
 * Takes a screenshot of a URL using a screenshot API.
 * Returns base64-encoded image data.
 */
async function takeScreenshot(url: string): Promise<string | null> {
  // Option 1: Use screenshotapi.net (has free tier)
  const screenshotApiKey = process.env.SCREENSHOT_API_KEY;
  
  if (screenshotApiKey) {
    try {
      const apiUrl = `https://shot.screenshotapi.net/screenshot?token=${screenshotApiKey}&url=${encodeURIComponent(url)}&output=image&file_type=png&wait_for_event=load&delay=2000&width=1280&height=800`;
      
      const response = await fetch(apiUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      }
    } catch (error) {
      console.error("[ColorExtractor] Screenshot API failed:", error);
    }
  }
  
  // Option 2: Use thum.io (free, no API key needed)
  try {
    const thumbUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodeURIComponent(url)}`;
    const response = await fetch(thumbUrl);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    }
  } catch (error) {
    console.error("[ColorExtractor] thum.io failed:", error);
  }
  
  return null;
}

// ============================================================================
// Claude Vision Color Extraction
// ============================================================================

const COLOR_EXTRACTION_PROMPT = `Analyze this website screenshot and extract the main color palette.

Return a JSON object with exactly these 6 colors as hex codes:
{
  "primary": "#XXXXXX",     // Main brand/accent color (buttons, links, highlights)
  "secondary": "#XXXXXX",   // Secondary accent color
  "accent": "#XXXXXX",      // Tertiary accent or hover states
  "background": "#XXXXXX",  // Main background color
  "foreground": "#XXXXXX",  // Main text color
  "muted": "#XXXXXX"        // Muted/secondary text color
}

Rules:
1. Return ONLY the JSON object, no other text
2. Use proper 6-digit hex codes (e.g., #F97316)
3. Ensure good contrast between background and foreground
4. Primary should be the most prominent brand color
5. If the site is dark-themed, background should be dark (#0A0A0A or similar)
6. If the site is light-themed, background should be light (#FFFFFF or similar)`;

export async function extractColorsFromScreenshot(
  screenshotBase64: string
): Promise<ColorExtractionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      palette: DEFAULT_PALETTE,
      error: "No API key configured",
    };
  }
  
  const client = new Anthropic({ apiKey });
  
  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 256,
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
              text: COLOR_EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    });
    
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }
    
    const palette = parseColorResponse(content.text);
    
    if (!palette) {
      return {
        success: false,
        palette: DEFAULT_PALETTE,
        error: "Failed to parse color response",
        reasoning: content.text,
      };
    }
    
    return {
      success: true,
      palette,
      reasoning: content.text,
    };
  } catch (error) {
    console.error("[ColorExtractor] Claude Vision failed:", error);
    return {
      success: false,
      palette: DEFAULT_PALETTE,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// Main Export
// ============================================================================

export async function extractColorsFromUrl(url: string): Promise<ColorExtractionResult> {
  // Step 1: Take screenshot
  const screenshot = await takeScreenshot(url);
  
  if (!screenshot) {
    return {
      success: false,
      palette: DEFAULT_PALETTE,
      error: "Failed to capture screenshot",
    };
  }
  
  // Step 2: Extract colors using Claude Vision
  return extractColorsFromScreenshot(screenshot);
}

/**
 * Extract colors from an image URL directly
 */
export async function extractColorsFromImageUrl(imageUrl: string): Promise<ColorExtractionResult> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return {
        success: false,
        palette: DEFAULT_PALETTE,
        error: "Failed to fetch image",
      };
    }
    
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    
    return extractColorsFromScreenshot(base64);
  } catch (error) {
    return {
      success: false,
      palette: DEFAULT_PALETTE,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getDefaultPalette(): ColorPalette {
  return { ...DEFAULT_PALETTE };
}

