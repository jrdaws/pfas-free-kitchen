import { LLMClient } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError, handleValidationError } from "./error-handler.js";
import { IntentSchema } from "./validators/intent-schema.js";
import { repairAndParseJSON } from "./utils/json-repair.js";
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

      // Call Claude Sonnet for reliable intent analysis
      // Haiku failed to reliably follow enum constraints - validation errors frequent
      // Intent is the foundation; reliability outweighs cost savings here
      const response = await client.complete(
        {
          model: "claude-sonnet-4-20250514",
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

      // Extract and parse JSON with repair fallback
      const repairResult = repairAndParseJSON(response.text);

      if (!repairResult.success) {
        throw new Error(`Failed to parse AI response: ${repairResult.error}. Response: ${response.text.substring(0, 500)}`);
      }

      if (repairResult.repaired) {
        console.log(`[IntentAnalyzer] JSON repaired: ${repairResult.repairs.join(", ")}`);
      }

      // Validate with Zod schema
      const validated = IntentSchema.parse(repairResult.data);

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
