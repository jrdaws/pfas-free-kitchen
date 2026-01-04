import { NextRequest, NextResponse } from "next/server";
import { complete, summarize, analyze, extractJSON } from "@/lib/anthropic";

/**
 * POST /api/ai/completion
 * Generate completions with Claude
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, action, content, schema, model, maxTokens, temperature, system } =
      await request.json();

    let result: string | object;

    switch (action) {
      case "summarize":
        if (!content) {
          return NextResponse.json(
            { error: "Content is required for summarization" },
            { status: 400 }
          );
        }
        result = await summarize(content, { model, maxTokens, temperature });
        break;

      case "analyze":
        if (!content || !prompt) {
          return NextResponse.json(
            { error: "Content and prompt are required for analysis" },
            { status: 400 }
          );
        }
        result = await analyze(content, prompt, { model, maxTokens, temperature });
        break;

      case "extract":
        if (!content || !schema) {
          return NextResponse.json(
            { error: "Content and schema are required for extraction" },
            { status: 400 }
          );
        }
        result = await extractJSON(content, schema, { model, maxTokens });
        break;

      default:
        if (!prompt) {
          return NextResponse.json(
            { error: "Prompt is required" },
            { status: 400 }
          );
        }
        result = await complete(prompt, { model, maxTokens, temperature, system });
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[Claude Completion Error]", error);
    return NextResponse.json(
      { error: "Failed to generate completion" },
      { status: 500 }
    );
  }
}

