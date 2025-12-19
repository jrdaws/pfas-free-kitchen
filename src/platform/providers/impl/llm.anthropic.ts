import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider } from "../llm";
import type { LLMRequest, LLMResponse, ProviderHealth } from "../types";

// Singleton Anthropic client
let _client: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    _client = new Anthropic({
      apiKey,
    });
  }
  return _client;
}

// Error mapping utility
class AnthropicLLMError extends Error {
  readonly code: string;
  readonly type: string;
  readonly statusCode?: number;
  readonly originalError?: unknown;

  constructor(
    message: string,
    code: string,
    type: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = "AnthropicLLMError";
    this.code = code;
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

function mapAnthropicError(error: unknown, context: string): AnthropicLLMError {
  if (error instanceof Anthropic.APIError) {
    return new AnthropicLLMError(
      `[${context}] Anthropic API error: ${error.message}`,
      error.type || "unknown",
      "api_error",
      error.status,
      error
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return new AnthropicLLMError(
    `[${context}] ${message}`,
    "internal_error",
    "unknown_error",
    undefined,
    error
  );
}

const provider: LLMProvider = {
  name: "llm.anthropic",

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const client = getAnthropicClient();
    try {
      // Map framework messages to Anthropic format
      const systemMessages = req.messages.filter((m) => m.role === "system");
      const nonSystemMessages = req.messages.filter((m) => m.role !== "system");

      const response = await client.messages.create({
        model: req.model || "claude-3-5-sonnet-20241022",
        max_tokens: req.maxTokens || 4096,
        temperature: req.temperature,
        system: systemMessages.length > 0 ? systemMessages.map((m) => m.content).join("\n") : undefined,
        messages: nonSystemMessages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      });

      // Extract text from response
      const outputText = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("");

      return {
        id: response.id,
        model: response.model,
        outputText,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        raw: response,
      };
    } catch (error) {
      throw mapAnthropicError(error, "complete");
    }
  },

  async health(): Promise<ProviderHealth> {
    try {
      const client = getAnthropicClient();

      // Lightweight health check - just verify we can create a client
      // Don't make an actual API call to avoid costs
      return {
        ok: true,
        provider: "llm.anthropic",
        details: {
          configured: Boolean(process.env.ANTHROPIC_API_KEY),
          sdk: "ok",
        },
      };
    } catch (error) {
      return {
        ok: false,
        provider: "llm.anthropic",
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  },
};

export default provider;
