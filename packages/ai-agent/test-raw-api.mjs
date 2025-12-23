#!/usr/bin/env node

/**
 * Test raw API to verify maxTokens is being respected
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

const client = new Anthropic();

// Load the code-generation prompt
const promptPath = join(process.cwd(), 'packages/ai-agent/dist/prompts/code-generation.md');
let promptTemplate;
try {
  promptTemplate = await readFile(promptPath, 'utf-8');
} catch {
  // Fallback to src
  promptTemplate = await readFile(join(process.cwd(), 'packages/ai-agent/src/prompts/code-generation.md'), 'utf-8');
}

// Simple architecture
const architecture = {
  template: "saas",
  pages: [
    { name: "Home", path: "/", layout: "default", description: "Landing page" },
  ],
  components: [],
  routes: [],
  integrations: {},
};

const systemPrompt = promptTemplate
  .replace('{architecture}', JSON.stringify(architecture, null, 2))
  .replace('{projectName}', 'TestApp')
  .replace('{templateReference}', '// No template reference');

console.log('=== System Prompt ===');
console.log(systemPrompt.substring(0, 500) + '...\n');
console.log(`System prompt length: ${systemPrompt.length} chars\n`);

console.log('=== Calling API with max_tokens=16000 ===\n');

const start = Date.now();

try {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    temperature: 0,
    system: systemPrompt,
    messages: [
      { role: 'user', content: 'Generate the code files based on the architecture definition.' }
    ]
  });
  
  const duration = Math.round((Date.now() - start) / 1000);
  const text = response.content[0].text;
  
  console.log(`✅ Response received in ${duration}s`);
  console.log(`📊 Input tokens: ${response.usage.input_tokens}`);
  console.log(`📊 Output tokens: ${response.usage.output_tokens}`);
  console.log(`📊 Stop reason: ${response.stop_reason}`);
  console.log(`📊 Response length: ${text.length} chars`);
  
  console.log('\n=== Response Preview ===');
  console.log(text.substring(0, 1000));
  console.log('\n...\n');
  console.log(text.substring(text.length - 500));
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  if (error.status) console.log(`Status: ${error.status}`);
}

