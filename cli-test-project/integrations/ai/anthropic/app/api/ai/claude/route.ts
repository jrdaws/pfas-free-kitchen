import { NextRequest, NextResponse } from "next/server";
import { anthropic, DEFAULT_SETTINGS } from "../../../../lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { messages, maxTokens } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Convert OpenAI-style messages to Anthropic format
    const anthropicMessages = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: DEFAULT_SETTINGS.model,
      max_tokens: maxTokens ?? DEFAULT_SETTINGS.maxTokens,
      messages: anthropicMessages,
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    return NextResponse.json({
      completion: text,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error("Anthropic API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
