/**
 * Stub for @dawson-framework/ai-agent package
 * Used when the package is not available (e.g., Vercel build)
 */

export interface ProjectInput {
  description: string;
  projectName?: string;
  template?: string;
  vision?: string;
  mission?: string;
  inspirations?: Array<{
    type: "url" | "image" | "figma";
    value: string;
    preview?: string;
  }>;
}

export interface StreamEvent {
  stage: string;
  type: string;
  message: string;
}

export interface GenerateOptions {
  apiKey: string;
  modelTier?: "fast" | "balanced" | "quality";
  stream?: boolean;
  onProgress?: (event: StreamEvent) => void;
}

export interface GenerateProjectResult {
  intent: {
    suggestedTemplate: string;
    [key: string]: unknown;
  };
  architecture: Record<string, unknown>;
  code: {
    files: Array<{ path: string; content: string }>;
    integrationCode?: Record<string, string>;
  };
  context: {
    cursorrules?: string;
    startPrompt?: string;
  };
}

export async function generateProject(
  _input: ProjectInput,
  _options?: GenerateOptions
): Promise<GenerateProjectResult> {
  throw new Error("AI agent not available in this build. This is a stub for type checking only.");
}

export default {
  generateProject,
};

