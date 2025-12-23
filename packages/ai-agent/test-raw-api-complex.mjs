#!/usr/bin/env node

/**
 * Test raw API with complex architecture like what test-live-api uses
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
  promptTemplate = await readFile(join(process.cwd(), 'packages/ai-agent/src/prompts/code-generation.md'), 'utf-8');
}

// Complex architecture (similar to what live tests generate)
const architecture = {
  template: "saas",
  pages: [
    { name: "Home", path: "/", layout: "default", description: "Landing page with hero, features, pricing" },
    { name: "Login", path: "/login", layout: "auth", description: "User login page" },
    { name: "Register", path: "/register", layout: "auth", description: "User registration page" },
    { name: "Dashboard", path: "/dashboard", layout: "app", description: "Main user dashboard" },
    { name: "Tasks", path: "/dashboard/tasks", layout: "app", description: "Task management view" },
    { name: "Settings", path: "/dashboard/settings", layout: "app", description: "User settings" },
  ],
  components: [
    { name: "Hero", type: "feature", template: "create-new", description: "Hero section with CTA" },
    { name: "Features", type: "feature", template: "create-new", description: "Features grid" },
    { name: "Pricing", type: "feature", template: "create-new", description: "Pricing cards" },
    { name: "TaskList", type: "feature", template: "create-new", description: "List of tasks" },
    { name: "TaskItem", type: "ui", template: "create-new", description: "Single task item" },
    { name: "AddTaskForm", type: "form", template: "create-new", description: "Form to add new task" },
  ],
  routes: [
    { path: "/api/auth/login", method: "POST", description: "Login endpoint" },
    { path: "/api/auth/register", method: "POST", description: "Registration endpoint" },
    { path: "/api/tasks", method: "GET", description: "Get all tasks" },
    { path: "/api/tasks", method: "POST", description: "Create task" },
    { path: "/api/tasks/[id]", method: "GET", description: "Get single task" },
    { path: "/api/tasks/[id]", method: "PATCH", description: "Update task" },
    { path: "/api/tasks/[id]", method: "DELETE", description: "Delete task" },
  ],
  integrations: {
    auth: "supabase",
    db: "supabase",
  },
};

// Load template reference
let templateRef = '// No template reference';
try {
  templateRef = await readFile(join(process.cwd(), 'templates/saas/app/page.tsx'), 'utf-8');
  templateRef = `Example page from saas template:\n\n${templateRef}`;
} catch (e) {
  console.log('Could not load template reference');
}

const systemPrompt = promptTemplate
  .replace('{architecture}', JSON.stringify(architecture, null, 2))
  .replace('{projectName}', 'TodoApp')
  .replace('{templateReference}', templateRef);

console.log('=== System Prompt Stats ===');
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
  
  // Check if response is valid JSON
  try {
    // Extract JSON from markdown if present
    let jsonStr = text;
    if (text.includes('```json')) {
      jsonStr = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonStr = text.split('```')[1].split('```')[0].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    console.log(`\n✅ Valid JSON!`);
    console.log(`📁 Files: ${parsed.files?.length || 0}`);
    console.log(`🔧 Integration code: ${parsed.integrationCode?.length || 0}`);
    
    if (parsed.files) {
      console.log('\nGenerated files:');
      parsed.files.forEach(f => console.log(`   - ${f.path} (${f.content?.length || 0} chars)`));
    }
  } catch (e) {
    console.log(`\n❌ JSON parse failed: ${e.message}`);
    console.log('\n=== Response Preview ===');
    console.log(text.substring(0, 500));
    console.log('\n...\n');
    console.log(text.substring(text.length - 500));
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  if (error.status) console.log(`Status: ${error.status}`);
}

