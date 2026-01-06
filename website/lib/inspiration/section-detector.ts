import Anthropic from "@anthropic-ai/sdk"
import {
  DetectedSection,
  SectionType,
  SECTION_INDICATORS,
  AnalysisInput,
} from "./types"

const anthropic = new Anthropic()

/**
 * Detect sections from inspiration content
 * Uses Vision API if screenshot provided, otherwise falls back to HTML parsing
 */
export async function detectSections(
  input: AnalysisInput
): Promise<DetectedSection[]> {
  // Prefer Vision analysis if screenshot available
  if (input.screenshot) {
    try {
      const sections = await detectFromScreenshot(input.screenshot)
      if (sections.length > 0) {
        return sections
      }
    } catch (error) {
      console.error("[SectionDetector] Vision analysis failed:", error)
    }
  }

  // Fall back to HTML parsing
  if (input.html) {
    return detectFromHTML(input.html)
  }

  console.warn("[SectionDetector] No content to analyze")
  return []
}

/**
 * Detect sections using Claude Vision
 */
async function detectFromScreenshot(
  screenshot: string
): Promise<DetectedSection[]> {
  // Determine if screenshot is URL or base64
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
    max_tokens: 2000,
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
            text: VISION_ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Vision API")
  }

  return parseVisionResponse(textContent.text)
}

const VISION_ANALYSIS_PROMPT = `Analyze this webpage screenshot and identify all distinct sections from top to bottom.

For EACH section visible on the page, provide:
1. type: One of: hero, features, pricing, testimonials, faq, cta, footer, navigation, stats, team, blog, product, how-it-works, integrations, logos, gallery, contact, unknown
2. order: Position from top (1 = first/top)
3. heightRatio: Approximate height as decimal (0.1 = 10% of page, 1.0 = full page)
4. hasImage: true/false - contains significant images
5. hasVideo: true/false - contains video embeds
6. columnCount: Number of columns in grid layouts (1-4), null if not a grid
7. textContent: Key headline or description text (max 100 chars)
8. confidence: Your confidence in this classification (0.0-1.0)

Return ONLY valid JSON array:
[
  {
    "type": "hero",
    "order": 1,
    "heightRatio": 0.8,
    "hasImage": true,
    "hasVideo": false,
    "columnCount": null,
    "textContent": "Build faster with AI",
    "confidence": 0.95
  },
  {
    "type": "features",
    "order": 2,
    "heightRatio": 0.6,
    "hasImage": true,
    "hasVideo": false,
    "columnCount": 3,
    "textContent": "Everything you need",
    "confidence": 0.9
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`

function parseVisionResponse(text: string): DetectedSection[] {
  try {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error("[SectionDetector] No JSON array found in response")
      return []
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate and transform
    return parsed
      .filter((s: Record<string, unknown>) => s && typeof s === "object")
      .map((s: Record<string, unknown>, index: number) => ({
        type: validateSectionType(s.type as string),
        order: typeof s.order === "number" ? s.order : index + 1,
        heightRatio: typeof s.heightRatio === "number" ? s.heightRatio : 0.5,
        hasImage: Boolean(s.hasImage),
        hasVideo: Boolean(s.hasVideo),
        columnCount: typeof s.columnCount === "number" ? s.columnCount : undefined,
        textContent: typeof s.textContent === "string" ? s.textContent : undefined,
        confidence: typeof s.confidence === "number" ? s.confidence : 0.5,
      }))
  } catch (error) {
    console.error("[SectionDetector] Failed to parse Vision response:", error)
    return []
  }
}

function validateSectionType(type: string): SectionType {
  const validTypes: SectionType[] = [
    "hero",
    "features",
    "pricing",
    "testimonials",
    "faq",
    "cta",
    "footer",
    "navigation",
    "stats",
    "team",
    "blog",
    "product",
    "how-it-works",
    "integrations",
    "logos",
    "gallery",
    "contact",
  ]

  const normalized = type?.toLowerCase().trim()
  if (validTypes.includes(normalized as SectionType)) {
    return normalized as SectionType
  }
  return "unknown"
}

/**
 * Detect sections from HTML structure
 * Uses class names, IDs, and semantic elements
 */
function detectFromHTML(html: string): DetectedSection[] {
  const sections: DetectedSection[] = []
  const lowerHtml = html.toLowerCase()

  // Find all potential section containers
  const sectionPattern =
    /<(section|div|header|footer|main|article)[^>]*class\s*=\s*["']([^"']+)["'][^>]*>/gi
  let match: RegExpExecArray | null
  let order = 1

  while ((match = sectionPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const classes = match[2].toLowerCase()

    // Check against indicators
    for (const [type, indicators] of Object.entries(SECTION_INDICATORS)) {
      if (type === "unknown") continue

      const matchedIndicator = indicators.some(
        (indicator) =>
          classes.includes(indicator) || match![0].toLowerCase().includes(`id="${indicator}`)
      )

      if (matchedIndicator) {
        // Extract section content for analysis
        const sectionStart = match.index
        const sectionContent = extractSectionContent(html, sectionStart)

        sections.push({
          type: type as SectionType,
          order: order++,
          heightRatio: estimateHeight(type as SectionType),
          hasImage: /<img[^>]+>/i.test(sectionContent),
          hasVideo:
            /<video[^>]+>/i.test(sectionContent) || /youtube|vimeo/i.test(sectionContent),
          columnCount: estimateColumns(sectionContent),
          textContent: extractHeadline(sectionContent),
          confidence: 0.7, // Lower confidence for HTML parsing
        })
        break
      }
    }
  }

  // Also check for semantic elements
  if (/<header[^>]*>/i.test(lowerHtml) && !sections.some((s) => s.type === "navigation")) {
    sections.unshift({
      type: "navigation",
      order: 0,
      heightRatio: 0.1,
      hasImage: false,
      hasVideo: false,
      confidence: 0.8,
    })
  }

  if (/<footer[^>]*>/i.test(lowerHtml) && !sections.some((s) => s.type === "footer")) {
    sections.push({
      type: "footer",
      order: sections.length + 1,
      heightRatio: 0.2,
      hasImage: false,
      hasVideo: false,
      confidence: 0.8,
    })
  }

  // Re-order sections by their appearance
  return sections
    .sort((a, b) => a.order - b.order)
    .map((s, i) => ({ ...s, order: i + 1 }))
}

function extractSectionContent(html: string, startIndex: number): string {
  // Get up to 5000 chars after start for analysis
  return html.slice(startIndex, startIndex + 5000)
}

function estimateHeight(type: SectionType): number {
  const heights: Record<SectionType, number> = {
    hero: 0.9,
    navigation: 0.08,
    features: 0.6,
    pricing: 0.7,
    testimonials: 0.5,
    faq: 0.5,
    cta: 0.3,
    footer: 0.2,
    stats: 0.3,
    team: 0.6,
    blog: 0.5,
    product: 0.8,
    "how-it-works": 0.5,
    integrations: 0.4,
    logos: 0.15,
    gallery: 0.6,
    contact: 0.4,
    unknown: 0.4,
  }
  return heights[type] || 0.4
}

function estimateColumns(content: string): number | undefined {
  // Look for grid patterns
  const gridPatterns = [
    /grid-cols-(\d)/i,
    /col-span/i,
    /flex.*gap/i,
    /display:\s*grid/i,
  ]

  const gridMatch = content.match(/grid-cols-(\d)/)
  if (gridMatch) {
    return parseInt(gridMatch[1], 10)
  }

  // Count repeated similar elements
  const cardPattern =
    /<(div|article)[^>]*class[^>]*(card|feature|item|column)[^>]*>/gi
  const cardMatches = content.match(cardPattern)
  if (cardMatches && cardMatches.length >= 2) {
    return Math.min(cardMatches.length, 4)
  }

  return undefined
}

function extractHeadline(content: string): string | undefined {
  // Look for h1, h2, or strong text
  const headlineMatch = content.match(/<h[12][^>]*>([^<]+)</i)
  if (headlineMatch) {
    return headlineMatch[1].trim().slice(0, 100)
  }
  return undefined
}

