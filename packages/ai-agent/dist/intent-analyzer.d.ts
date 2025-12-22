import type { ProjectInput, ProjectIntent } from "./types";
/**
 * Analyze user's project description and extract structured intent
 *
 * @param input - Project input with description and optional metadata
 * @param apiKey - Optional Anthropic API key (uses env var if not provided)
 * @returns Structured project intent with template suggestion and integrations
 */
export declare function analyzeIntent(input: ProjectInput, apiKey?: string): Promise<ProjectIntent>;
//# sourceMappingURL=intent-analyzer.d.ts.map