import { LLMClient } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError, handleValidationError } from "./error-handler.js";
import { ArchitectureSchema } from "./validators/architecture-schema.js";
import { TemplateSelector } from "./template-selector.js";
/**
 * Generate project architecture from analyzed intent
 *
 * @param intent - Analyzed project intent
 * @param apiKey - Optional Anthropic API key
 * @returns Project architecture with pages, components, and routes
 */
export async function generateArchitecture(intent, apiKey) {
    const client = new LLMClient(apiKey);
    const prompts = new PromptLoader();
    const selector = new TemplateSelector();
    return withRetry(async () => {
        try {
            // Load template metadata
            const template = await selector.selectTemplate(intent);
            // Validate integrations
            const validatedIntegrations = await selector.validateIntegrations(template, intent.integrations);
            // Prepare prompt variables
            const systemPrompt = await prompts.load("architecture-design", {
                intent: JSON.stringify(intent, null, 2),
                template: template.id,
                features: template.features.join(", "),
                supportedIntegrations: JSON.stringify(template.supportedIntegrations, null, 2),
            });
            // Call Claude
            const response = await client.complete({
                model: "claude-sonnet-4-20250514",
                temperature: 0, // Deterministic
                maxTokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: "Design the project architecture based on the intent analysis.",
                    },
                ],
                system: systemPrompt,
            });
            // Extract JSON
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in AI response. Response: " + response.text.substring(0, 500));
            }
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate with Zod
            const validated = ArchitectureSchema.parse(parsed);
            // Return with validated integrations
            return {
                ...validated,
                integrations: validatedIntegrations,
            };
        }
        catch (error) {
            if (error instanceof Error && error.name === "ZodError") {
                throw handleValidationError(error);
            }
            throw handleLLMError(error);
        }
    });
}
