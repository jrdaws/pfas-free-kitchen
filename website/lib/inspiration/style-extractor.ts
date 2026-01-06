import Anthropic from "@anthropic-ai/sdk"
import {
  ExtractedStyles,
  ExtractedColors,
  ExtractedTypography,
  ExtractedSpacing,
  AnalysisInput,
} from "./types"

const anthropic = new Anthropic()

/**
 * Extract visual styles from inspiration content
 */
export async function extractStyles(
  input: AnalysisInput
): Promise<ExtractedStyles> {
  const results: Partial<ExtractedStyles>[] = []

  // Try CSS parsing first (most accurate for colors/fonts)
  if (input.css) {
    const cssStyles = extractFromCSS(input.css)
    results.push(cssStyles)
  }

  // Try HTML inline styles
  if (input.html) {
    const htmlStyles = extractFromHTML(input.html)
    results.push(htmlStyles)
  }

  // Use Vision for visual estimation
  if (input.screenshot) {
    try {
      const visionStyles = await extractFromScreenshot(input.screenshot)
      results.push(visionStyles)
    } catch (error) {
      console.error("[StyleExtractor] Vision extraction failed:", error)
    }
  }

  // Merge results with priority weighting
  return mergeStyles(results)
}

/**
 * Extract styles from CSS
 */
function extractFromCSS(css: string): Partial<ExtractedStyles> {
  const colors = extractColorsFromCSS(css)
  const typography = extractTypographyFromCSS(css)
  const spacing = extractSpacingFromCSS(css)

  return {
    colors,
    typography,
    spacing,
    borderRadius: extractBorderRadius(css),
    shadows: extractShadows(css),
    animations: extractAnimations(css),
  }
}

function extractColorsFromCSS(css: string): ExtractedColors {
  // Look for CSS custom properties first
  const varPatterns: Record<string, RegExp[]> = {
    primary: [
      /--primary[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
      /--brand[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
      /--accent[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
    ],
    secondary: [
      /--secondary[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
    ],
    background: [
      /--background[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
      /--bg[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
    ],
    text: [
      /--foreground[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
      /--text[^:]*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/gi,
    ],
  }

  const extractColor = (patterns: RegExp[]): string | null => {
    for (const pattern of patterns) {
      const match = css.match(pattern)
      if (match) {
        const colorMatch = match[0].match(/(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/)
        if (colorMatch) return colorMatch[0]
      }
    }
    return null
  }

  // Fallback: find most common colors in CSS
  const allColors = css.match(/#[0-9a-fA-F]{3,8}/g) || []
  const colorCounts = new Map<string, number>()
  for (const color of allColors) {
    const normalized = normalizeHex(color)
    colorCounts.set(normalized, (colorCounts.get(normalized) || 0) + 1)
  }

  const sortedColors = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)

  return {
    primary: extractColor(varPatterns.primary) || sortedColors[0] || "#000000",
    secondary: extractColor(varPatterns.secondary) || sortedColors[1] || "#666666",
    accent: sortedColors[2] || "#0066FF",
    background: extractColor(varPatterns.background) || "#FFFFFF",
    text: extractColor(varPatterns.text) || "#000000",
    confidence: extractColor(varPatterns.primary) ? 0.9 : 0.5,
  }
}

function normalizeHex(hex: string): string {
  hex = hex.toUpperCase()
  if (hex.length === 4) {
    // #RGB -> #RRGGBB
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return hex.slice(0, 7) // Remove alpha if present
}

function extractTypographyFromCSS(css: string): ExtractedTypography {
  // Look for font-family declarations
  const fontFamilyPattern = /font-family:\s*['"]?([^'",;]+)/gi
  const fonts: string[] = []

  let match: RegExpExecArray | null
  while ((match = fontFamilyPattern.exec(css)) !== null) {
    const font = match[1].trim()
    if (!isSystemFont(font)) {
      fonts.push(font)
    }
  }

  // Look for Google Fonts imports
  const googleFontPattern = /fonts\.googleapis\.com\/css[^"']+family=([^&"']+)/gi
  while ((match = googleFontPattern.exec(css)) !== null) {
    const fontName = decodeURIComponent(match[1]).replace(/\+/g, " ").split(":")[0]
    fonts.unshift(fontName) // Google Fonts are likely intentional
  }

  // Extract font sizes
  const h1Size = css.match(/h1[^{]*\{[^}]*font-size:\s*([^;]+)/i)?.[1] || "3rem"
  const h2Size = css.match(/h2[^{]*\{[^}]*font-size:\s*([^;]+)/i)?.[1] || "2rem"
  const h3Size = css.match(/h3[^{]*\{[^}]*font-size:\s*([^;]+)/i)?.[1] || "1.5rem"

  return {
    headingFont: fonts[0] || "sans-serif",
    bodyFont: fonts[1] || fonts[0] || "sans-serif",
    headingSizes: {
      h1: h1Size,
      h2: h2Size,
      h3: h3Size,
    },
    fontWeight: css.includes("font-weight: 700") || css.includes("font-weight: bold")
      ? "bold"
      : css.includes("font-weight: 300") || css.includes("font-weight: light")
        ? "light"
        : "normal",
    letterSpacing: css.includes("letter-spacing: -")
      ? "tight"
      : css.includes("letter-spacing: 0.1")
        ? "wide"
        : "normal",
    confidence: fonts.length > 0 ? 0.8 : 0.4,
  }
}

function isSystemFont(font: string): boolean {
  const systemFonts = [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
    "serif",
    "monospace",
  ]
  return systemFonts.some((sf) => font.toLowerCase().includes(sf.toLowerCase()))
}

function extractSpacingFromCSS(css: string): ExtractedSpacing {
  // Look for section padding
  const sectionPadding = css.match(/section[^{]*\{[^}]*padding[^:]*:\s*([^;]+)/i)?.[1] ||
    css.match(/--section-padding:\s*([^;]+)/i)?.[1] ||
    "4rem"

  // Look for gap
  const gap = css.match(/gap:\s*([^;]+)/i)?.[1] || "1.5rem"

  // Container width
  let containerWidth: ExtractedSpacing["containerWidth"] = "standard"
  if (css.includes("max-width: 1400") || css.includes("max-width: 1536")) {
    containerWidth = "wide"
  } else if (css.includes("max-width: 100%") || css.includes("max-width: 100vw")) {
    containerWidth = "full"
  } else if (css.includes("max-width: 768") || css.includes("max-width: 800")) {
    containerWidth = "narrow"
  }

  return {
    sectionPadding,
    elementGap: gap,
    containerWidth,
    confidence: 0.6,
  }
}

function extractBorderRadius(css: string): ExtractedStyles["borderRadius"] {
  const radiusMatch = css.match(/border-radius:\s*([^;]+)/i)
  if (!radiusMatch) return "md"

  const value = radiusMatch[1].trim()
  if (value === "0" || value === "0px") return "none"
  if (value.includes("9999") || value.includes("50%") || value === "full") return "full"
  if (value.includes("0.25rem") || value.includes("4px")) return "sm"
  if (value.includes("1rem") || value.includes("16px")) return "lg"
  return "md"
}

function extractShadows(css: string): ExtractedStyles["shadows"] {
  if (!css.includes("box-shadow") && !css.includes("shadow")) return "none"

  const shadowCount = (css.match(/box-shadow/gi) || []).length
  if (shadowCount > 5) return "dramatic"
  if (shadowCount > 2) return "medium"
  return "subtle"
}

function extractAnimations(css: string): ExtractedStyles["animations"] {
  const hasAnimations = css.includes("@keyframes") || css.includes("animation:")
  const hasTransitions = css.includes("transition:")

  if (hasAnimations) return "rich"
  if (hasTransitions) return "subtle"
  return "none"
}

/**
 * Extract styles from HTML inline styles
 */
function extractFromHTML(html: string): Partial<ExtractedStyles> {
  // Extract inline styles
  const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || []
  const inlineCSS = styleBlocks.map((block) => block.replace(/<\/?style[^>]*>/gi, "")).join("\n")

  if (inlineCSS) {
    return extractFromCSS(inlineCSS)
  }

  return {}
}

/**
 * Extract styles using Claude Vision
 */
async function extractFromScreenshot(
  screenshot: string
): Promise<Partial<ExtractedStyles>> {
  const isUrl = screenshot.startsWith("http")
  const imageSource = isUrl
    ? { type: "url" as const, url: screenshot }
    : {
        type: "base64" as const,
        media_type: "image/png" as const,
        data: screenshot.replace(/^data:image\/\w+;base64,/, ""),
      }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: imageSource,
          },
          {
            type: "text",
            text: STYLE_VISION_PROMPT,
          },
        ],
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Vision API")
  }

  return parseStyleVisionResponse(textContent.text)
}

const STYLE_VISION_PROMPT = `Analyze this website screenshot and extract visual styles.

Provide:
1. colors: Extract the 5 main colors (primary, secondary, accent, background, text) as hex codes
2. typography: Describe the font style (modern/classic/geometric/humanist), weight (light/normal/bold), letter-spacing (tight/normal/wide)
3. spacing: Estimate section padding (compact/normal/spacious), container width (narrow/standard/wide/full)
4. borderRadius: Overall corner style (none/sm/md/lg/full)
5. shadows: Shadow usage (none/subtle/medium/dramatic)
6. animations: Animation level (none/subtle/rich)

Return ONLY valid JSON:
{
  "colors": {
    "primary": "#5E6AD2",
    "secondary": "#3D4270",
    "accent": "#FFD700",
    "background": "#0D0E14",
    "text": "#FFFFFF"
  },
  "typography": {
    "style": "modern",
    "weight": "normal",
    "letterSpacing": "tight"
  },
  "spacing": {
    "sectionPadding": "spacious",
    "containerWidth": "standard"
  },
  "borderRadius": "lg",
  "shadows": "subtle",
  "animations": "subtle"
}`

function parseStyleVisionResponse(text: string): Partial<ExtractedStyles> {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return {}

    const parsed = JSON.parse(jsonMatch[0])

    return {
      colors: {
        primary: parsed.colors?.primary || "#000000",
        secondary: parsed.colors?.secondary || "#666666",
        accent: parsed.colors?.accent || "#0066FF",
        background: parsed.colors?.background || "#FFFFFF",
        text: parsed.colors?.text || "#000000",
        confidence: 0.7,
      },
      typography: {
        headingFont: parsed.typography?.style === "classic" ? "serif" : "sans-serif",
        bodyFont: "sans-serif",
        headingSizes: { h1: "3rem", h2: "2rem", h3: "1.5rem" },
        fontWeight: parsed.typography?.weight || "normal",
        letterSpacing: parsed.typography?.letterSpacing || "normal",
        confidence: 0.6,
      },
      spacing: {
        sectionPadding: mapSpacing(parsed.spacing?.sectionPadding),
        elementGap: "1.5rem",
        containerWidth: parsed.spacing?.containerWidth || "standard",
        confidence: 0.5,
      },
      borderRadius: parsed.borderRadius || "md",
      shadows: parsed.shadows || "subtle",
      animations: parsed.animations || "none",
    }
  } catch (error) {
    console.error("[StyleExtractor] Failed to parse Vision response:", error)
    return {}
  }
}

function mapSpacing(value: string): string {
  switch (value) {
    case "compact":
      return "2rem"
    case "spacious":
      return "6rem"
    default:
      return "4rem"
  }
}

/**
 * Merge multiple style extractions with priority
 */
function mergeStyles(results: Partial<ExtractedStyles>[]): ExtractedStyles {
  // Default values
  const merged: ExtractedStyles = {
    colors: {
      primary: "#000000",
      secondary: "#666666",
      accent: "#0066FF",
      background: "#FFFFFF",
      text: "#000000",
      confidence: 0,
    },
    typography: {
      headingFont: "sans-serif",
      bodyFont: "sans-serif",
      headingSizes: { h1: "3rem", h2: "2rem", h3: "1.5rem" },
      fontWeight: "normal",
      letterSpacing: "normal",
      confidence: 0,
    },
    spacing: {
      sectionPadding: "4rem",
      elementGap: "1.5rem",
      containerWidth: "standard",
      confidence: 0,
    },
    borderRadius: "md",
    shadows: "subtle",
    animations: "none",
  }

  // Merge by highest confidence
  for (const result of results) {
    if (result.colors && result.colors.confidence > merged.colors.confidence) {
      merged.colors = result.colors
    }
    if (result.typography && result.typography.confidence > merged.typography.confidence) {
      merged.typography = result.typography
    }
    if (result.spacing && result.spacing.confidence > merged.spacing.confidence) {
      merged.spacing = result.spacing
    }
    if (result.borderRadius) merged.borderRadius = result.borderRadius
    if (result.shadows) merged.shadows = result.shadows
    if (result.animations) merged.animations = result.animations
  }

  return merged
}

