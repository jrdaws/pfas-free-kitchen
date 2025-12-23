import { analyzeIntent } from './dist/index.js';

const apiKey = process.env.ANTHROPIC_API_KEY;

try {
  const result = await analyzeIntent(
    { description: 'A simple todo list application' },
    { apiKey, model: 'claude-3-haiku-20240307' }
  );
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('Error:', error.message);
  console.log('Context:', error.context);
}
