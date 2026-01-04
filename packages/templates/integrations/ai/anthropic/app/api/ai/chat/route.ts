import { NextRequest, NextResponse } from "next/server";
import { streamChat, ChatMessage } from "@/lib/anthropic";

export const runtime = "edge";

/**
 * POST /api/ai/chat
 * Chat with Claude AI
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, model, system, maxTokens, temperature } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const chatStream = streamChat(messages as ChatMessage[], {
            model,
            system,
            maxTokens,
            temperature,
          });

          for await (const chunk of chatStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("[Claude Stream Error]", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Claude Chat Error]", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

