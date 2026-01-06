import { NextRequest, NextResponse } from "next/server"
import {
  suggestConfiguration,
  generateFollowUpQuestions,
} from "@/lib/ai/config-suggester"
import {
  SuggestConfigRequest,
  SuggestConfigResponse,
} from "@/lib/ai/config-suggester-types"
import { handleApiError } from "@/lib/api-wrapper"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: SuggestConfigRequest = await request.json()

    // Validate input
    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      )
    }

    if (body.description.length < 10) {
      return NextResponse.json(
        { success: false, error: "Description must be at least 10 characters" },
        { status: 400 }
      )
    }

    if (body.description.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Description must be less than 2000 characters" },
        { status: 400 }
      )
    }

    // Validate context if provided
    if (body.context) {
      const validBudgets = ["low", "medium", "high"]
      const validTimelines = ["fast", "normal", "flexible"]
      const validSkills = ["beginner", "intermediate", "advanced"]

      if (body.context.budget && !validBudgets.includes(body.context.budget)) {
        return NextResponse.json(
          { success: false, error: "Invalid budget value" },
          { status: 400 }
        )
      }

      if (body.context.timeline && !validTimelines.includes(body.context.timeline)) {
        return NextResponse.json(
          { success: false, error: "Invalid timeline value" },
          { status: 400 }
        )
      }

      if (body.context.technicalSkill && !validSkills.includes(body.context.technicalSkill)) {
        return NextResponse.json(
          { success: false, error: "Invalid technicalSkill value" },
          { status: 400 }
        )
      }
    }

    // Get AI suggestions
    const suggestions = await suggestConfiguration(body.description, body.context)

    // Generate follow-up questions for low-confidence areas
    const questionsToAsk = generateFollowUpQuestions(suggestions, body.description)

    const processingTime = Date.now() - startTime

    const response: SuggestConfigResponse = {
      success: true,
      suggestions,
      questionsToAsk,
      processingTime,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Config suggestion error:", error)
    return handleApiError(error, "anthropic")
  }
}

// GET for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/suggest-config",
    method: "POST",
    requiredBody: {
      description: "string (10-2000 chars)",
      context: {
        budget: "low | medium | high (optional)",
        timeline: "fast | normal | flexible (optional)",
        technicalSkill: "beginner | intermediate | advanced (optional)",
      },
    },
  })
}

