#!/usr/bin/env node

/**
 * Model Tier Comparison Test
 * 
 * Tests all three model tiers to compare:
 * - Speed
 * - Cost
 * - Output quality
 */

import { generateProject, getGlobalTracker, resetGlobalTracker } from './dist/index.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// Change to project root so template paths work
process.chdir(PROJECT_ROOT);

const tiers = ['fast', 'balanced', 'quality'];

async function testTier(tier) {
  console.log(`\n${'═'.repeat(50)}`);
  console.log(`=== Testing ${tier.toUpperCase()} tier ===`);
  console.log('═'.repeat(50));
  
  resetGlobalTracker();
  const start = Date.now();
  
  try {
    const result = await generateProject(
      { 
        description: 'A simple todo list app with user authentication',
        projectName: `Test-${tier}`
      },
      { 
        modelTier: tier,
        logTokenUsage: false
      }
    );
    
    const duration = (Date.now() - start) / 1000;
    const tracker = getGlobalTracker();
    const summary = tracker.getSessionTotal();
    
    console.log(`✅ Success in ${duration.toFixed(1)}s`);
    console.log(`   Pages: ${result.architecture.pages.length}`);
    console.log(`   Components: ${result.architecture.components.length}`);
    console.log(`   Files: ${result.code.files.length}`);
    console.log(`   Tokens: ${summary.input} in / ${summary.output} out`);
    console.log(`   Cost: $${summary.estimatedCost.toFixed(4)}`);
    
    return {
      tier,
      success: true,
      duration,
      pages: result.architecture.pages.length,
      components: result.architecture.components.length,
      files: result.code.files.length,
      tokens: {
        input: summary.input,
        output: summary.output,
      },
      cost: summary.estimatedCost,
    };
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    console.log(`❌ Failed after ${duration.toFixed(1)}s: ${error.message}`);
    
    return {
      tier,
      success: false,
      duration,
      error: error.message,
    };
  }
}

console.log('🚀 Model Tier Comparison Test');
console.log('Testing all 3 tiers with the same project...\n');

const results = [];
for (const tier of tiers) {
  const result = await testTier(tier);
  results.push(result);
  
  // Brief pause between tests
  if (tier !== 'quality') {
    console.log('\n⏳ Waiting 2s before next tier...');
    await new Promise(r => setTimeout(r, 2000));
  }
}

// Summary
console.log('\n\n📊 TIER COMPARISON SUMMARY');
console.log('═'.repeat(60));
console.log('');
console.log('| Tier       | Time  | Files | Cost    | Status |');
console.log('|------------|-------|-------|---------|--------|');

for (const r of results) {
  if (r.success) {
    console.log(`| ${r.tier.padEnd(10)} | ${r.duration.toFixed(0).padStart(3)}s  | ${String(r.files).padStart(5)} | $${r.cost.toFixed(4).padStart(6)} | ✅ PASS |`);
  } else {
    console.log(`| ${r.tier.padEnd(10)} | ${r.duration.toFixed(0).padStart(3)}s  |   N/A |     N/A | ❌ FAIL |`);
  }
}

console.log('');
console.log('Model Configuration:');
console.log('  fast     : Haiku for all stages (cheapest)');
console.log('  balanced : Haiku + Sonnet for code (default, recommended)');
console.log('  quality  : Sonnet for all stages (best quality)');
console.log('');

const allPassed = results.every(r => r.success);
if (allPassed) {
  console.log('✅ All tiers passed successfully!');
} else {
  console.log('⚠️  Some tiers failed - see details above');
}

process.exit(allPassed ? 0 : 1);

