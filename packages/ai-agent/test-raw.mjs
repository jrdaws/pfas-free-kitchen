import { LLMClient } from './dist/utils/llm-client.js';
import { PromptLoader } from './dist/utils/prompt-loader.js';

const apiKey = process.env.ANTHROPIC_API_KEY;
const description = 'A simple todo list application where users can create, edit, and delete tasks.';

const client = new LLMClient(apiKey);
const prompts = new PromptLoader();

const systemPrompt = await prompts.load("intent-analysis", { description });

console.log('System Prompt:', systemPrompt.substring(0, 500));
console.log('\n--- Making request to Haiku ---\n');

const response = await client.complete({
  model: 'claude-3-haiku-20240307',
  temperature: 0,
  maxTokens: 2048,
  messages: [{ role: 'user', content: `Analyze this project description: ${description}` }],
  system: systemPrompt,
});

console.log('Raw response:');
console.log(response.text);
