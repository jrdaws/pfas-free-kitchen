import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model configurations
export const Models = {
  CLAUDE_35_SONNET: "claude-3-5-sonnet-20241022",
  CLAUDE_3_OPUS: "claude-3-opus-20240229",
  CLAUDE_3_SONNET: "claude-3-sonnet-20240229",
  CLAUDE_3_HAIKU: "claude-3-haiku-20240307",
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  model: Models.CLAUDE_35_SONNET,
  maxTokens: 1024,
} as const;
