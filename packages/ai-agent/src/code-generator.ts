import { readFile } from "fs/promises";
import { join } from "path";
import { LLMClient, type StreamCallback } from "./utils/llm-client.js";
import { PromptLoader } from "./utils/prompt-loader.js";
import { withRetry } from "./utils/retry-strategy.js";
import { handleLLMError, handleValidationError } from "./error-handler.js";
import { CodeSchema } from "./validators/code-schema.js";
import { repairAndParseJSON } from "./utils/json-repair.js";
import type { ProjectArchitecture, GeneratedCode, ProjectInput } from "./types.js";

/** Options for code generation */
export interface CodeOptions {
  apiKey?: string;
  model?: string;
  stream?: boolean;
  onStream?: StreamCallback;
}

/**
 * Generate code files from project architecture
 *
 * @param architecture - Project architecture definition
 * @param input - Original project input (for context)
 * @param options - Optional API key and model configuration
 * @returns Generated code files
 */
export async function generateCode(
  architecture: ProjectArchitecture,
  input?: ProjectInput,
  options?: string | CodeOptions
): Promise<GeneratedCode> {
  const opts: CodeOptions = typeof options === "string" ? { apiKey: options } : options || {};
  const client = new LLMClient(opts.apiKey);
  const prompts = new PromptLoader();

  return withRetry(async () => {
    try {
      // Load template reference file to show AI the style
      const templateReference = await loadTemplateReference(architecture.template);

      // Prepare prompt variables
      const systemPrompt = await prompts.load("code-generation", {
        architecture: JSON.stringify(architecture, null, 2),
        projectName: input?.projectName || "MyApp",
        templateReference,
      });

      // Use configured model (default to Sonnet for code quality)
      // Reduced to 4096 tokens for cost optimization (output tokens are 5x input cost)
      // Testing shows this is sufficient for most projects without truncation
      const model = opts.model || "claude-sonnet-4-20250514";
      const maxTokens = 4096;
      const response = await client.complete(
        {
          model,
          temperature: 0, // Deterministic
          maxTokens,
          messages: [
            {
              role: "user",
              content: "Generate the code files based on the architecture definition.",
            },
          ],
          system: systemPrompt,
          stream: opts.stream,
          onStream: opts.onStream,
        },
        "code" // Track as code stage
      );

      // Extract and parse JSON with repair fallback
      const repairResult = repairAndParseJSON(response.text);

      if (!repairResult.success) {
        throw new Error(`Failed to parse AI response: ${repairResult.error}. Response: ${response.text.substring(0, 500)}`);
      }

      if (repairResult.repaired) {
        console.log(`[CodeGenerator] JSON repaired: ${repairResult.repairs.join(", ")}`);
      }

      // Validate with Zod
      const validated = CodeSchema.parse(repairResult.data);

      return validated as GeneratedCode;
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        throw handleValidationError(error as any);
      }
      throw handleLLMError(error);
    }
  });
}

/**
 * Load a reference file from the template to show AI the code style
 */
async function loadTemplateReference(templateId: string): Promise<string> {
  try {
    const templatesDir = join(process.cwd(), "templates");
    const pagePath = join(templatesDir, templateId, "app", "page.tsx");
    const content = await readFile(pagePath, "utf-8");

    return `Example page from ${templateId} template:\n\n${content}`;
  } catch (error) {
    console.warn(`[CodeGenerator] Could not load template reference: ${(error as Error).message}`);
    return "// Template reference not available";
  }
}
