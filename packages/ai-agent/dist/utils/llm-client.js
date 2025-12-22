import Anthropic from "@anthropic-ai/sdk";
// Singleton Anthropic client
let _client = null;
function getAnthropicClient(apiKey) {
    if (!_client) {
        const key = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!key) {
            throw new Error("ANTHROPIC_API_KEY environment variable is not set");
        }
        _client = new Anthropic({ apiKey: key });
    }
    return _client;
}
export class LLMClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async complete(req) {
        const client = getAnthropicClient(this.apiKey);
        try {
            // Separate system messages from others
            const systemMessages = req.messages.filter((m) => m.role === "system");
            const nonSystemMessages = req.messages.filter((m) => m.role !== "system");
            // Build system prompt
            let systemPrompt = req.system || "";
            if (systemMessages.length > 0) {
                systemPrompt = systemMessages.map((m) => m.content).join("\n");
            }
            const response = await client.messages.create({
                model: req.model || "claude-sonnet-4-20250514",
                max_tokens: req.maxTokens || 4096,
                temperature: req.temperature ?? 0, // Deterministic by default
                system: systemPrompt || undefined,
                messages: nonSystemMessages.map((m) => ({
                    role: m.role === "assistant" ? "assistant" : "user",
                    content: m.content,
                })),
            });
            // Extract text from response
            const text = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("");
            return {
                id: response.id,
                text,
                usage: {
                    inputTokens: response.usage.input_tokens,
                    outputTokens: response.usage.output_tokens,
                },
            };
        }
        catch (error) {
            // Re-throw with context - error handling will be done by error-handler.ts
            throw error;
        }
    }
}
