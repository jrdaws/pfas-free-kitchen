import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { withServiceLimits } from "@/lib/api-wrapper"

const anthropic = new Anthropic()

interface GenerateContentRequest {
  fieldType: string
  context: {
    projectName?: string
    industry?: string
    projectType?: string
    targetAudience?: string
    uniqueValue?: string
    domain?: string
  }
  currentValue?: string
  tone?: "professional" | "casual" | "bold" | "friendly"
  length?: "short" | "medium" | "long"
}

const TONE_GUIDE: Record<string, string> = {
  professional: "Use formal, authoritative language",
  casual: "Use friendly, approachable language",
  bold: "Use confident, impactful language with strong verbs",
  friendly: "Use warm, personable language",
}

const LENGTH_GUIDE: Record<string, string> = {
  short: "5-10 words",
  medium: "15-25 words",
  long: "30-50 words",
}

const FIELD_PROMPTS: Record<string, string> = {
  headline: `Write a compelling hero headline that captures attention and communicates the main value proposition.
Return ONLY the headline text, no quotes or explanation.`,

  subheadline: `Write a supporting subheadline that expands on the value proposition and encourages action.
Return ONLY the subheadline text, no quotes or explanation.`,

  "feature-title": `Write a concise feature title that highlights a key benefit.
Return ONLY the title text, 3-6 words.`,

  "feature-description": `Write a brief feature description that explains the benefit clearly.
Return ONLY the description text, 15-30 words.`,

  "testimonial-quote": `Write a realistic customer testimonial quote.
Return ONLY the quote text, 20-40 words. Make it sound authentic and specific.`,

  "testimonial-name": `Write a realistic customer name.
Return ONLY the full name, nothing else.`,

  "testimonial-role": `Write a realistic job title and company.
Return ONLY the role like "CEO at TechCorp", nothing else.`,

  "faq-question": `Write a frequently asked question that potential customers might have.
Return ONLY the question text.`,

  "faq-answer": `Write a clear, helpful answer to a FAQ.
Return ONLY the answer text, 30-60 words.`,

  "cta-text": `Write compelling call-to-action button text.
Return ONLY the button text, 2-5 words. Make it action-oriented.`,

  "cta-subtext": `Write brief supporting text for a CTA section.
Return ONLY the supporting text, 10-20 words.`,

  "pricing-name": `Write a pricing tier name.
Return ONLY the tier name, 1-2 words like "Starter", "Pro", "Enterprise".`,

  "pricing-description": `Write a brief pricing tier description.
Return ONLY the description text, 10-20 words.`,

  "pricing-feature": `Write a feature bullet point for a pricing tier.
Return ONLY the feature text, 3-8 words.`,

  "section-title": `Write a section heading.
Return ONLY the heading text, 2-6 words.`,

  "section-subtitle": `Write a section subtitle or description.
Return ONLY the subtitle text, 15-30 words.`,

  "product-name": `Write a product name.
Return ONLY the product name, 1-3 words.`,

  "product-description": `Write a brief product description.
Return ONLY the description text, 15-25 words.`,

  "team-name": `Write a realistic person's name.
Return ONLY the full name, nothing else.`,

  "team-role": `Write a job title.
Return ONLY the job title like "Head of Design" or "Senior Engineer".`,

  "team-bio": `Write a brief professional bio.
Return ONLY the bio text, 20-40 words.`,
}

function buildPrompt(
  fieldType: string,
  context: GenerateContentRequest["context"],
  currentValue: string | undefined,
  tone: string,
  length: string
): string {
  const baseContext = `You are writing copy for a ${context.projectType || "business"} website in the ${context.industry || "general"} industry.
Business name: ${context.projectName || "the business"}
${context.domain ? `Domain: ${context.domain}` : ""}
${context.targetAudience ? `Target audience: ${context.targetAudience}` : ""}
${context.uniqueValue ? `Key value proposition: ${context.uniqueValue}` : ""}

Tone: ${TONE_GUIDE[tone] || TONE_GUIDE.professional}
Length: ${LENGTH_GUIDE[length] || LENGTH_GUIDE.medium}`

  const fieldPrompt = FIELD_PROMPTS[fieldType] || FIELD_PROMPTS.headline
  const currentContext = currentValue
    ? `\nCurrent value to improve: "${currentValue}"`
    : "\nCreate new content from scratch."

  return baseContext + "\n\n" + fieldPrompt + currentContext
}

function getMaxTokens(fieldType: string, length: string): number {
  const base: Record<string, number> = {
    short: 30,
    medium: 60,
    long: 120,
  }
  return base[length] || 60
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateContentRequest = await request.json()
    const {
      fieldType,
      context,
      currentValue,
      tone = "professional",
      length = "medium",
    } = body

    if (!fieldType || !context) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const prompt = buildPrompt(fieldType, context, currentValue, tone, length)

    const result = await withServiceLimits("anthropic", async () => {
      return anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: getMaxTokens(fieldType, length),
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })
    })

    if (!result.success) {
      return result.response
    }

    const response = result.data
    const textContent = response.content.find((c) => c.type === "text")
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json(
        { success: false, error: "No text response from AI" },
        { status: 500 }
      )
    }

    // Clean up the response - remove quotes if present
    let content = textContent.text.trim()
    if (content.startsWith('"') && content.endsWith('"')) {
      content = content.slice(1, -1)
    }

    // Generate alternatives by making additional requests with higher temperature
    const alternatives: string[] = []

    // Only generate alternatives for short content types
    if (["headline", "cta-text", "feature-title"].includes(fieldType)) {
      try {
        const altResult = await withServiceLimits("anthropic", async () => {
          return anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: getMaxTokens(fieldType, length) * 2,
            temperature: 0.9,
            messages: [
              {
                role: "user",
                content:
                  prompt +
                  `\n\nProvide 2 different alternatives, each on a new line. No numbering or bullets.`,
              },
            ],
          })
        })

        if (altResult.success) {
          const altText = altResult.data.content.find((c) => c.type === "text")
          if (altText && altText.type === "text") {
            const lines = altText.text
              .split("\n")
              .map((l) => l.trim())
              .filter((l) => l.length > 0 && l !== content)
              .slice(0, 2)
            alternatives.push(...lines)
          }
        }
      } catch {
        // Ignore errors for alternatives - they're optional
      }
    }

    return NextResponse.json({
      success: true,
      content,
      alternatives,
      fieldType,
      tone,
    })
  } catch (error) {
    console.error("[Content Generation Error]", error)
    return NextResponse.json(
      { success: false, error: "Content generation failed" },
      { status: 500 }
    )
  }
}

