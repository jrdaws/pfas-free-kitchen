import { NextRequest, NextResponse } from "next/server";
import { openai, DEFAULT_SETTINGS } from "../../../../lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, temperature, maxTokens } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_SETTINGS.model,
      messages: [{ role: "user", content: prompt }],
      temperature: temperature ?? DEFAULT_SETTINGS.temperature,
      max_tokens: maxTokens ?? DEFAULT_SETTINGS.maxTokens,
    });

    const completion = response.choices[0]?.message?.content || "";

    return NextResponse.json({
      completion,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error("OpenAI completion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
