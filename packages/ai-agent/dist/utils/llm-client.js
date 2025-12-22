import Anthropic from "@anthropic-ai/sdk";
import { getGlobalTracker } from "./token-tracker.js";
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
    constructor(apiKeyOrOptions) {
        if (typeof apiKeyOrOptions === "string") {
            this.apiKey = apiKeyOrOptions;
            this.trackUsage = true;
        }
        else {
            this.apiKey = apiKeyOrOptions?.apiKey;
            this.trackUsage = apiKeyOrOptions?.trackUsage ?? true;
        }
    }
    /**
     * Complete a request with optional token tracking
     *
     * @param req - LLM request parameters
     * @param stage - Pipeline stage for token tracking (optional)
     */
    async complete(req, stage) {
        const client = getAnthropicClient(this.apiKey);
        const startTime = Date.now();
        try {
            // Separate system messages from others
            const systemMessages = req.messages.filter((m) => m.role === "system");
            const nonSystemMessages = req.messages.filter((m) => m.role !== "system");
            // Build system prompt
            let systemPrompt = req.system || "";
            if (systemMessages.length > 0) {
                systemPrompt = systemMessages.map((m) => m.content).join("\n");
            }
            const model = req.model || "claude-sonnet-4-20250514";
            const response = await client.messages.create({
                model,
                max_tokens: req.maxTokens || 4096,
                temperature: req.temperature ?? 0, // Deterministic by default
                system: systemPrompt || undefined,
                messages: nonSystemMessages.map((m) => ({
                    role: m.role === "assistant" ? "assistant" : "user",
                    content: m.content,
                })),
            });
            const durationMs = Date.now() - startTime;
            // Extract text from response
            const text = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("");
            const usage = {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
            };
            // Track token usage if stage is provided
            if (this.trackUsage && stage) {
                const tracker = getGlobalTracker();
                tracker.record({
                    stage,
                    inputTokens: usage.inputTokens,
                    outputTokens: usage.outputTokens,
                    model,
                    timestamp: new Date(),
                    cached: false, // TODO: detect cache hits when Anthropic supports it
                    durationMs,
                });
            }
            return {
                id: response.id,
                text,
                usage,
            };
        }
        catch (error) {
            // Re-throw with context - error handling will be done by error-handler.ts
            throw error;
        }
    }
}
