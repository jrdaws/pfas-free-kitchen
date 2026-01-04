import Anthropic from "@anthropic-ai/sdk";

// Lazy initialization to avoid build errors
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export { getAnthropicClient };

export type ClaudeModel =
  | "claude-3-opus-20240229"
  | "claude-3-sonnet-20240229"
  | "claude-3-haiku-20240307"
  | "claude-3-5-sonnet-20241022";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeOptions {
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
  system?: string;
  stream?: boolean;
}

/**
 * Send a message to Claude and get a response
 */
export async function chat(
  messages: ChatMessage[],
  options: ClaudeOptions = {}
): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: options.model || "claude-3-5-sonnet-20241022",
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature ?? 0.7,
    system: options.system,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  // Extract text from the response
  const textContent = response.content.find((c) => c.type === "text");
  return textContent?.text || "";
}

/**
 * Stream a chat response from Claude
 */
export async function* streamChat(
  messages: ChatMessage[],
  options: ClaudeOptions = {}
): AsyncGenerator<string, void, unknown> {
  const anthropic = getAnthropicClient();

  const stream = await anthropic.messages.stream({
    model: options.model || "claude-3-5-sonnet-20241022",
    max_tokens: options.maxTokens || 4096,
    temperature: options.temperature ?? 0.7,
    system: options.system,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * Generate a text completion (single message)
 */
export async function complete(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  return chat([{ role: "user", content: prompt }], options);
}

/**
 * Analyze content with Claude
 */
export async function analyze(
  content: string,
  instruction: string,
  options: ClaudeOptions = {}
): Promise<string> {
  return chat(
    [
      {
        role: "user",
        content: `${instruction}\n\nContent to analyze:\n${content}`,
      },
    ],
    options
  );
}

/**
 * Summarize text with Claude
 */
export async function summarize(
  text: string,
  options: ClaudeOptions = {}
): Promise<string> {
  return complete(
    `Please summarize the following text concisely:\n\n${text}`,
    options
  );
}

/**
 * Extract structured data from text
 */
export async function extractJSON<T>(
  text: string,
  schema: string,
  options: ClaudeOptions = {}
): Promise<T> {
  const response = await complete(
    `Extract structured data from the following text and return it as JSON matching this schema:\n\nSchema: ${schema}\n\nText: ${text}\n\nReturn only valid JSON, no explanations.`,
    { ...options, temperature: 0 }
  );

  // Parse the JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }

  return JSON.parse(jsonMatch[0]) as T;
}

