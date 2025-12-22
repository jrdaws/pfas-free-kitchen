import { LLMClient } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError, handleValidationError } from "./error-handler.js";
import { IntentSchema } from "./validators/intent-schema.js";
import type { ProjectInput, ProjectIntent } from "./types.js";

/**
 * Analyze user's project description and extract structured intent
 *
 * @param input - Project input with description and optional metadata
 * @param apiKey - Optional Anthropic API key (uses env var if not provided)
 * @returns Structured project intent with template suggestion and integrations
 */
export async function analyzeIntent(
  input: ProjectInput,
  apiKey?: string
): Promise<ProjectIntent> {
  const client = new LLMClient(apiKey);
  const prompts = new PromptLoader();

  return withRetry(async () => {
    try {
      // Load prompt with description
      const systemPrompt = await prompts.load("intent-analysis", {
        description: input.description,
      });

      // Call Claude Haiku for cost-efficient intent analysis
      // Haiku is sufficient for pattern-matching tasks (33% cost reduction)
      const response = await client.complete(
        {
          model: "claude-3-haiku-20240307",
          temperature: 0, // Deterministic
          maxTokens: 2048,
          messages: [
            {
              role: "user",
              content: `Analyze this project description: ${input.description}`,
            },
          ],
          system: systemPrompt,
        },
        "intent" // Track as intent stage
      );

      // Extract JSON from response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response. Response: " + response.text.substring(0, 500));
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate with Zod schema
      const validated = IntentSchema.parse(parsed);

      return validated as ProjectIntent;
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && error.name === "ZodError") {
        throw handleValidationError(error as any);
      }

      // Handle LLM errors
      throw handleLLMError(error);
    }
  });
}
