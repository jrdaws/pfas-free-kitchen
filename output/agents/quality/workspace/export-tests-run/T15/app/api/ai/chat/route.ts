import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import { openai, DEFAULT_SETTINGS } from "../../../../lib/openai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature, maxTokens } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_SETTINGS.model,
      messages: messages,
      temperature: temperature ?? DEFAULT_SETTINGS.temperature,
      max_tokens: maxTokens ?? DEFAULT_SETTINGS.maxTokens,
      stream: true,
    });

    // Convert the response to a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error("OpenAI chat error:", error);
    return new Response(error.message || "Internal server error", {
      status: 500,
    });
  }
}
