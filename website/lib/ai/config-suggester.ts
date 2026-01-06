import Anthropic from "@anthropic-ai/sdk"
import {
  SuggestConfigRequest,
  ConfigSuggestions,
} from "./config-suggester-types"

const anthropic = new Anthropic()

const SUGGESTER_PROMPT = `You are a product strategy expert analyzing a brief description to suggest optimal web application configuration.

## User Description
{{description}}

## Context
- Budget: {{budget}}
- Timeline: {{timeline}}
- Technical Skill: {{technicalSkill}}

## Your Task
Analyze this description and provide comprehensive configuration suggestions.

For each category:
1. Provide your recommendation
2. Explain your reasoning (1 sentence)
3. Rate your confidence (0-1)

## Output Format
Return valid JSON matching this exact schema:
{
  "audience": {
    "primary": "string - main target user type",
    "secondary": "string or null - secondary audience",
    "painPoints": ["string array - problems they face"],
    "goals": ["string array - what they want to achieve"],
    "confidence": 0.85,
    "reasoning": "one sentence explaining why"
  },
  "design": {
    "aesthetic": "minimal|bold|playful|luxurious|corporate|technical",
    "colorMode": "dark|light|system",
    "suggestedPrimaryColor": "#hexcolor",
    "typography": "modern|classic|geometric|humanist",
    "imagery": "photography|illustrations|3d|abstract|none",
    "confidence": 0.8,
    "reasoning": "one sentence"
  },
  "features": {
    "required": ["must have features"],
    "niceToHave": ["optional features"],
    "excluded": ["features to avoid"],
    "confidence": 0.9,
    "reasoning": "one sentence"
  },
  "monetization": {
    "model": "freemium|subscription|one-time|marketplace|free|advertising",
    "suggestedTiers": 3,
    "priceRange": { "low": 9, "high": 99 },
    "confidence": 0.7,
    "reasoning": "one sentence"
  },
  "pages": {
    "required": ["home", "about"],
    "optional": ["blog", "faq"],
    "confidence": 0.85,
    "reasoning": "one sentence"
  },
  "template": {
    "recommended": "saas|ecommerce|blog|portfolio|marketplace",
    "alternatives": ["other options"],
    "confidence": 0.9,
    "reasoning": "one sentence"
  },
  "inspiration": {
    "suggestedUrls": ["https://example.com - real successful products in this space"],
    "industry": "the industry/niche",
    "competitors": ["competitor names"],
    "confidence": 0.75,
    "reasoning": "one sentence"
  },
  "integrations": {
    "recommended": {
      "auth": "supabase|clerk|auth0",
      "payments": "stripe|lemonsqueezy",
      "analytics": "posthog|mixpanel",
      "email": "resend|sendgrid"
    },
    "optional": ["other integrations"],
    "confidence": 0.85,
    "reasoning": "one sentence"
  },
  "overallConfidence": 0.82,
  "summary": "2-3 sentence summary of the recommended configuration and why"
}

## Rules
- Be specific to this product, not generic
- Consider industry norms and best practices
- Features should match the product type exactly
- Inspiration URLs should be real, successful products (check they're valid)
- If the description is too vague, lower confidence and note in reasoning
- Price ranges should be realistic for the market
- Integration choices should match the technical skill level`

function buildPrompt(
  description: string,
  context?: SuggestConfigRequest["context"]
): string {
  return SUGGESTER_PROMPT
    .replace("{{description}}", description)
    .replace("{{budget}}", context?.budget || "not specified")
    .replace("{{timeline}}", context?.timeline || "not specified")
    .replace("{{technicalSkill}}", context?.technicalSkill || "not specified")
}

export async function suggestConfiguration(
  description: string,
  context?: SuggestConfigRequest["context"]
): Promise<ConfigSuggestions> {
  const prompt = buildPrompt(description, context)

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  // Extract text content
  const textContent = response.content.find((c) => c.type === "text")
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from AI")
  }

  // Parse JSON from response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not find JSON in AI response")
  }

  const suggestions = JSON.parse(jsonMatch[0]) as ConfigSuggestions

  // Validate required fields
  validateSuggestions(suggestions)

  return suggestions
}

function validateSuggestions(suggestions: ConfigSuggestions): void {
  const requiredKeys = [
    "audience",
    "design",
    "features",
    "monetization",
    "pages",
    "template",
    "inspiration",
    "integrations",
    "overallConfidence",
    "summary",
  ]

  for (const key of requiredKeys) {
    if (!(key in suggestions)) {
      throw new Error(`Missing required field: ${key}`)
    }
  }

  // Validate confidence scores are 0-1
  const confidenceFields = [
    suggestions.audience.confidence,
    suggestions.design.confidence,
    suggestions.features.confidence,
    suggestions.monetization.confidence,
    suggestions.pages.confidence,
    suggestions.template.confidence,
    suggestions.inspiration.confidence,
    suggestions.integrations.confidence,
    suggestions.overallConfidence,
  ]

  for (const conf of confidenceFields) {
    if (typeof conf !== "number" || conf < 0 || conf > 1) {
      throw new Error(`Invalid confidence score: ${conf}`)
    }
  }
}

export function generateFollowUpQuestions(
  suggestions: ConfigSuggestions,
  description: string
): string[] {
  const questions: string[] = []

  // Low confidence areas
  if (suggestions.monetization.confidence < 0.7) {
    questions.push(
      "Will users pay per transaction, subscription, or one-time purchase?"
    )
  }

  if (suggestions.audience.confidence < 0.7) {
    questions.push(
      "Who is your primary target user? (e.g., small business owners, developers, students)"
    )
  }

  if (suggestions.design.confidence < 0.7) {
    questions.push(
      "What feeling should your product evoke? (e.g., professional, fun, luxurious)"
    )
  }

  if (suggestions.features.confidence < 0.7) {
    questions.push("What is the ONE core feature users must have on day one?")
  }

  // Missing key info detection
  const lowerDesc = description.toLowerCase()

  if (!lowerDesc.includes("mobile") && !lowerDesc.includes("desktop")) {
    questions.push("Should this be mobile-first or desktop-first?")
  }

  if (!lowerDesc.includes("team") && !lowerDesc.includes("individual")) {
    questions.push("Is this for individual users or teams/organizations?")
  }

  if (
    !lowerDesc.includes("b2b") &&
    !lowerDesc.includes("b2c") &&
    !lowerDesc.includes("business") &&
    !lowerDesc.includes("consumer")
  ) {
    questions.push("Is this a B2B (business) or B2C (consumer) product?")
  }

  // Return top 3 most important
  return questions.slice(0, 3)
}

