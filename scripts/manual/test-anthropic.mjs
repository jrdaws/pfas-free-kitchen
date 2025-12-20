#!/usr/bin/env node
/**
 * Test script for Anthropic API connection
 * Usage: node scripts/test-anthropic.mjs
 */

import { callAnthropic } from './providers/anthropic.mjs';
import 'dotenv/config';

async function testAnthropicConnection() {
  console.log('🔍 Testing Anthropic API connection...\n');

  // Check if API key is set
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY is not set in .env file');
    console.log('\nTo fix this:');
    console.log('1. Get an API key from https://console.anthropic.com/');
    console.log('2. Add it to your .env file: ANTHROPIC_API_KEY=sk-ant-api03-xxxxx');
    process.exit(1);
  }

  console.log('✓ API key found in environment');
  console.log(`✓ Using model: ${process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229 (default)'}\n`);

  try {
    console.log('📡 Making test request to Anthropic API...\n');

    const response = await callAnthropic({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      system: 'You are a helpful assistant. Respond concisely.',
      user: 'Say "Hello! API connection successful." and nothing else.',
      max_tokens: 100,
      temperature: 0.2
    });

    console.log('✅ SUCCESS! Anthropic API is connected and working.\n');
    console.log('Response from Claude:');
    console.log('─'.repeat(60));
    console.log(response);
    console.log('─'.repeat(60));
    console.log('\n✓ Your Anthropic API integration is properly configured.');

  } catch (error) {
    console.error('❌ FAILED! Error connecting to Anthropic API:\n');
    console.error(error.message);

    if (error.message.includes('401')) {
      console.log('\n💡 This looks like an authentication error.');
      console.log('   Check that your ANTHROPIC_API_KEY is correct.');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Rate limit exceeded. Wait a moment and try again.');
    } else if (error.message.includes('500') || error.message.includes('503')) {
      console.log('\n💡 Anthropic API server error. Try again in a moment.');
    }

    process.exit(1);
  }
}

testAnthropicConnection();
