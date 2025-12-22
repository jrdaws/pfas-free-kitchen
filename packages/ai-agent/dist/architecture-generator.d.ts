import type { ProjectIntent, ProjectArchitecture } from "./types";
/**
 * Generate project architecture from analyzed intent
 *
 * @param intent - Analyzed project intent
 * @param apiKey - Optional Anthropic API key
 * @returns Project architecture with pages, components, and routes
 */
export declare function generateArchitecture(intent: ProjectIntent, apiKey?: string): Promise<ProjectArchitecture>;
//# sourceMappingURL=architecture-generator.d.ts.map