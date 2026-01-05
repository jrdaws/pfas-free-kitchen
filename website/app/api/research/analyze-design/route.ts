import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  type DesignAnalysis,
  DESIGN_ANALYSIS_PROMPT,
  parseDesignAnalysis,
  getDefaultDesignAnalysis,
} from "@/lib/design-analyzer";

interface AnalyzeDesignRequest {
  screenshotBase64: string;
  url?: string;
  mediaType?: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}

interface AnalyzeDesignResponse {
  success: boolean;
  analysis?: DesignAnalysis;
  error?: string;
  source?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeDesignResponse>> {
  try {
    const body: AnalyzeDesignRequest = await request.json();
    const { screenshotBase64, url, mediaType = "image/png" } = body;

    // Validate input
    if (!screenshotBase64) {
      return NextResponse.json(
        { success: false, error: "Screenshot data is required" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("[AnalyzeDesign] No API key, returning default analysis");
      return NextResponse.json({
        success: true,
        analysis: getDefaultDesignAnalysis(),
        source: "fallback",
      });
    }

    const anthropic = new Anthropic({ apiKey });

    console.log(`[AnalyzeDesign] Analyzing screenshot${url ? ` for ${url}` : ""}`);

    // Call Claude Vision API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: screenshotBase64,
              },
            },
            {
              type: "text",
              text: DESIGN_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    // Extract text response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse the response
    const analysis = parseDesignAnalysis(textContent.text);

    if (!analysis) {
      console.error("[AnalyzeDesign] Failed to parse response:", textContent.text.slice(0, 500));
      return NextResponse.json({
        success: true,
        analysis: getDefaultDesignAnalysis(),
        source: "fallback-parse-error",
      });
    }

    console.log(`[AnalyzeDesign] Analysis complete - aesthetic: ${analysis.aesthetic.overall}, layout: ${analysis.layout.heroStyle}`);

    return NextResponse.json({
      success: true,
      analysis,
      source: "ai",
    });
  } catch (error) {
    console.error("[AnalyzeDesign] Error:", error);

    // Return fallback on error rather than failing completely
    return NextResponse.json({
      success: true,
      analysis: getDefaultDesignAnalysis(),
      source: "fallback-error",
      error: error instanceof Error ? error.message : "Analysis failed",
    });
  }
}

