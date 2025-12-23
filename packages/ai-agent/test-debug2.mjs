import { analyzeIntent } from './dist/index.js';

const apiKey = process.env.ANTHROPIC_API_KEY;

// Same description as test-live-api.mjs
const description = 'A simple todo list application where users can create, edit, and delete tasks.';

console.log('Testing with description:', description);
console.log('');

for (let i = 0; i < 3; i++) {
  console.log(`\n--- Attempt ${i + 1} ---`);
  try {
    const result = await analyzeIntent(
      { description },
      { apiKey, model: 'claude-3-haiku-20240307' }
    );
    console.log('Result:', JSON.stringify(result.integrations, null, 2));
  } catch (error) {
    console.log('Error:', error.message);
    if (error.context?.errors) {
      console.log('Validation errors:', JSON.stringify(error.context.errors, null, 2));
    }
  }
}
