import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Model configurations
export const Models = {
  GPT4: "gpt-4-turbo-preview",
  GPT4_TURBO: "gpt-4-turbo",
  GPT35_TURBO: "gpt-3.5-turbo",
} as const;

// Default settings
export const DEFAULT_SETTINGS = {
  model: Models.GPT4_TURBO,
  temperature: 0.7,
  maxTokens: 1000,
} as const;
