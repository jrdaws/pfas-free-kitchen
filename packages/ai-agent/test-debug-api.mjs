#!/usr/bin/env node

/**
 * Debug script to test raw API calls with different models
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function testModel(model, maxTokens) {
  console.log(`\nTesting ${model} with maxTokens=${maxTokens}`);
  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: 'Say "Hello" and nothing else.' }]
    });
    console.log(`✅ Success: ${response.content[0].text}`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.status) console.log(`   Status: ${error.status}`);
    if (error.error) console.log(`   Details: ${JSON.stringify(error.error)}`);
    return false;
  }
}

// Test Haiku with different token limits
console.log('=== Testing Haiku Token Limits ===');
await testModel('claude-3-haiku-20240307', 4096);
await testModel('claude-3-haiku-20240307', 8192);
await testModel('claude-3-haiku-20240307', 16000);

// Test Sonnet with different token limits
console.log('\n=== Testing Sonnet Token Limits ===');
await testModel('claude-sonnet-4-20250514', 4096);
await testModel('claude-sonnet-4-20250514', 8192);
await testModel('claude-sonnet-4-20250514', 16000);

console.log('\n=== Done ===');

