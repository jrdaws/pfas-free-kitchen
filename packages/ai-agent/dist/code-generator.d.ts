import type { ProjectArchitecture, GeneratedCode, ProjectInput } from "./types";
/**
 * Generate code files from project architecture
 *
 * @param architecture - Project architecture definition
 * @param input - Original project input (for context)
 * @param apiKey - Optional Anthropic API key
 * @returns Generated code files
 */
export declare function generateCode(architecture: ProjectArchitecture, input?: ProjectInput, apiKey?: string): Promise<GeneratedCode>;
//# sourceMappingURL=code-generator.d.ts.map