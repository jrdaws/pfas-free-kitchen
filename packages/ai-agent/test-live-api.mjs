#!/usr/bin/env node

/**
 * Comprehensive Live API Test for AI Agent Package
 * 
 * Tests all three model tiers with different project complexities:
 * - fast: Haiku everywhere (cheapest)
 * - balanced: Haiku + Sonnet hybrid (default)
 * - quality: Sonnet everywhere (best quality)
 * 
 * Run with: ANTHROPIC_API_KEY=your_key node test-live-api.mjs
 */

import { generateProject, getGlobalTracker, resetGlobalTracker } from './dist/index.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the project root directory (two levels up from packages/ai-agent)
const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// Change to project root so template paths work
process.chdir(PROJECT_ROOT);

// Test configurations by complexity
const TEST_PROJECTS = {
  simple: {
    description: 'A simple todo list application where users can create, edit, and delete tasks.',
    projectName: 'SimpleTodoApp',
  },
  moderate: {
    description: 'A blog platform with user authentication, markdown editor, image uploads, and comments. Users can create drafts and publish posts.',
    projectName: 'BlogPlatform',
  },
  complex: {
    description: 'A SaaS application for freelancers to manage clients, projects, time tracking, invoicing, and payments. Include subscription tiers (free, pro, enterprise), Stripe integration for payments, and a dashboard with analytics.',
    projectName: 'FreelanceSaaS',
  },
};

const MODEL_TIERS = ['fast', 'balanced', 'quality'];

// Results storage
const results = {
  summary: {},
  tests: [],
  tokenTracking: [],
  jsonRepairs: [],
  errors: [],
};

// Check for API key
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ Error: ANTHROPIC_API_KEY environment variable not set');
  console.error('   Please set it with: export ANTHROPIC_API_KEY=your_key_here');
  process.exit(1);
}

console.log('🚀 Starting Comprehensive Live API Test\n');
console.log('═'.repeat(60));
console.log('');

/**
 * Run a single test
 */
async function runTest(tier, complexity, project, testNumber, totalTests) {
  console.log(`\n📋 Test ${testNumber}/${totalTests}: ${tier.toUpperCase()} tier × ${complexity} complexity`);
  console.log(`   Project: ${project.projectName}`);
  console.log('   Starting generation...');

  resetGlobalTracker();
  const startTime = Date.now();

  try {
    const result = await generateProject(project, {
      apiKey,
      logTokenUsage: false, // We'll log manually
      modelTier: tier,
    });

    const duration = Date.now() - startTime;
    const tracker = getGlobalTracker();
    const summary = tracker.getSessionTotal();

    // Validate result
    const validations = {
      hasIntent: !!result.intent?.category,
      hasFeatures: (result.intent?.features?.length || 0) > 0,
      hasPages: (result.architecture?.pages?.length || 0) > 0,
      hasComponents: (result.architecture?.components?.length || 0) > 0,
      hasCode: (result.code?.files?.length || 0) > 0,
      hasContext: !!result.context?.cursorrules,
      filesHaveContent: result.code?.files?.every(f => f.content?.length > 10) || false,
    };

    const allValid = Object.values(validations).every(v => v);

    console.log(`   ✅ Completed in ${Math.round(duration / 1000)}s`);
    console.log(`   📊 Tokens: ${summary.input} in / ${summary.output} out`);
    console.log(`   💰 Cost: $${summary.estimatedCost.toFixed(4)}`);
    console.log(`   📁 Files: ${result.code?.files?.length || 0}`);
    console.log(`   ✓ Validation: ${allValid ? 'PASSED' : 'FAILED'}`);

    // Store result
    return {
      tier,
      complexity,
      success: true,
      allValid,
      durationMs: duration,
      tokens: {
        input: summary.input,
        output: summary.output,
      },
      cost: summary.estimatedCost,
      fileCount: result.code?.files?.length || 0,
      validations,
      byStage: summary.byStage,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`   ❌ Failed after ${Math.round(duration / 1000)}s`);
    console.log(`   Error: ${error.message}`);

    results.errors.push({
      tier,
      complexity,
      error: error.message,
      code: error.code,
      retryable: error.retryable,
    });

    return {
      tier,
      complexity,
      success: false,
      allValid: false,
      durationMs: duration,
      error: error.message,
    };
  }
}

/**
 * Test streaming functionality
 */
async function testStreaming() {
  console.log('\n\n📡 Testing Streaming Functionality');
  console.log('═'.repeat(60));

  const project = TEST_PROJECTS.simple;
  let chunkCount = 0;
  let totalChars = 0;
  const stageProgress = {};

  const startTime = Date.now();

  try {
    await generateProject(project, {
      apiKey,
      logTokenUsage: false,
      modelTier: 'balanced',
      stream: true,
      onProgress: (event) => {
        if (event.type === 'start') {
          stageProgress[event.stage] = { started: true, chunks: 0, chars: 0 };
        } else if (event.type === 'chunk' && event.chunk) {
          chunkCount++;
          totalChars += event.chunk.length;
          if (stageProgress[event.stage]) {
            stageProgress[event.stage].chunks++;
            stageProgress[event.stage].chars += event.chunk.length;
          }
        } else if (event.type === 'complete') {
          if (stageProgress[event.stage]) {
            stageProgress[event.stage].completed = true;
          }
        }
      },
    });

    const duration = Date.now() - startTime;

    console.log(`\n   ✅ Streaming test completed in ${Math.round(duration / 1000)}s`);
    console.log(`   📊 Total chunks: ${chunkCount}`);
    console.log(`   📊 Total characters streamed: ${totalChars}`);
    console.log('\n   Stage breakdown:');
    for (const [stage, data] of Object.entries(stageProgress)) {
      console.log(`      ${stage}: ${data.chunks} chunks, ${data.chars} chars, completed: ${data.completed}`);
    }

    return {
      success: true,
      chunkCount,
      totalChars,
      stageProgress,
      durationMs: duration,
    };
  } catch (error) {
    console.log(`   ❌ Streaming test failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify token tracking accuracy
 */
async function verifyTokenTracking() {
  console.log('\n\n🔢 Verifying Token Tracking Accuracy');
  console.log('═'.repeat(60));

  resetGlobalTracker();

  const project = TEST_PROJECTS.simple;
  const startTime = Date.now();

  try {
    await generateProject(project, {
      apiKey,
      logTokenUsage: false,
      modelTier: 'balanced',
    });

    const tracker = getGlobalTracker();
    const summary = tracker.getSessionTotal();

    console.log('\n   Token tracking results:');
    console.log(tracker.exportMetrics());

    // Verify summary calculations - sum up byStage values
    const stages = ['intent', 'architecture', 'code', 'context'];
    const sumInput = stages.reduce((acc, s) => acc + (summary.byStage[s]?.input || 0), 0);
    const sumOutput = stages.reduce((acc, s) => acc + (summary.byStage[s]?.output || 0), 0);

    const inputMatch = sumInput === summary.input;
    const outputMatch = sumOutput === summary.output;

    console.log(`\n   Verification:`);
    console.log(`      Input tokens sum: ${inputMatch ? '✅' : '❌'} (${sumInput} vs ${summary.input})`);
    console.log(`      Output tokens sum: ${outputMatch ? '✅' : '❌'} (${sumOutput} vs ${summary.output})`);

    // Cost estimation check
    // Haiku: $0.25/1M in, $1.25/1M out
    // Sonnet: $3.00/1M in, $15.00/1M out
    console.log(`      Estimated cost: $${summary.estimatedCost.toFixed(4)}`);

    return {
      success: inputMatch && outputMatch,
      summary,
      inputMatch,
      outputMatch,
    };
  } catch (error) {
    console.log(`   ❌ Token tracking test failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main test runner
 */
async function main() {
  const allResults = [];

  // Select which tests to run based on args
  const args = process.argv.slice(2);
  const runFull = args.includes('--full');
  const runQuick = args.includes('--quick') || (!runFull && args.length === 0);

  if (runQuick) {
    console.log('🏃 Running quick test (simple complexity, all tiers)');
    console.log('   Use --full for comprehensive testing\n');
  }

  const complexities = runFull ? ['simple', 'moderate', 'complex'] : ['simple'];
  const tiers = MODEL_TIERS;

  const totalTests = complexities.length * tiers.length;
  let testNumber = 0;

  // Run model tier tests
  for (const complexity of complexities) {
    for (const tier of tiers) {
      testNumber++;
      const result = await runTest(tier, complexity, TEST_PROJECTS[complexity], testNumber, totalTests);
      allResults.push(result);

      // Add small delay between tests to avoid rate limiting
      if (testNumber < totalTests) {
        console.log('   ⏳ Waiting 2s before next test...');
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  // Test streaming
  const streamingResult = await testStreaming();

  // Verify token tracking
  const tokenResult = await verifyTokenTracking();

  // Generate summary
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(60));

  // Success rate by tier
  console.log('\n🎯 Success Rate by Model Tier:');
  for (const tier of tiers) {
    const tierResults = allResults.filter(r => r.tier === tier);
    const successCount = tierResults.filter(r => r.success && r.allValid).length;
    console.log(`   ${tier.padEnd(10)}: ${successCount}/${tierResults.length} (${Math.round(successCount / tierResults.length * 100)}%)`);
  }

  // Average cost by tier
  console.log('\n💰 Average Cost by Model Tier:');
  for (const tier of tiers) {
    const tierResults = allResults.filter(r => r.tier === tier && r.cost !== undefined);
    if (tierResults.length > 0) {
      const avgCost = tierResults.reduce((acc, r) => acc + r.cost, 0) / tierResults.length;
      console.log(`   ${tier.padEnd(10)}: $${avgCost.toFixed(4)}`);
    }
  }

  // Average duration by tier
  console.log('\n⏱️  Average Duration by Model Tier:');
  for (const tier of tiers) {
    const tierResults = allResults.filter(r => r.tier === tier);
    const avgDuration = tierResults.reduce((acc, r) => acc + r.durationMs, 0) / tierResults.length;
    console.log(`   ${tier.padEnd(10)}: ${Math.round(avgDuration / 1000)}s`);
  }

  // Streaming summary
  console.log('\n📡 Streaming Test:');
  console.log(`   ${streamingResult.success ? '✅ PASSED' : '❌ FAILED'}`);
  if (streamingResult.success) {
    console.log(`   Chunks received: ${streamingResult.chunkCount}`);
  }

  // Token tracking summary
  console.log('\n🔢 Token Tracking:');
  console.log(`   ${tokenResult.success ? '✅ ACCURATE' : '❌ MISMATCH'}`);

  // Errors
  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors Encountered:');
    results.errors.forEach(e => {
      console.log(`   - ${e.tier}/${e.complexity}: ${e.error}`);
    });
  }

  // Save results (use __dirname to save in ai-agent package)
  const outputDir = join(__dirname, 'test-output-live');
  await mkdir(outputDir, { recursive: true });

  const fullResults = {
    timestamp: new Date().toISOString(),
    testType: runFull ? 'full' : 'quick',
    tierTests: allResults,
    streaming: streamingResult,
    tokenTracking: tokenResult,
    errors: results.errors,
  };

  await writeFile(
    join(outputDir, 'live-test-results.json'),
    JSON.stringify(fullResults, null, 2)
  );
  console.log(`\n💾 Full results saved to: test-output-live/live-test-results.json`);

  // Exit with appropriate code
  const allPassed = allResults.every(r => r.success && r.allValid) &&
                    streamingResult.success &&
                    tokenResult.success;

  console.log('\n' + '═'.repeat(60));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED');
  } else {
    console.log('⚠️  SOME TESTS FAILED - See details above');
  }
  console.log('═'.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

