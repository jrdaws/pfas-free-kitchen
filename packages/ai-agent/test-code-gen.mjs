#!/usr/bin/env node

/**
 * Test code generation specifically
 */

import { generateCode } from './dist/code-generator.js';
import { getGlobalTracker, resetGlobalTracker } from './dist/utils/token-tracker.js';

// Simple architecture for testing
const simpleArchitecture = {
  template: "saas",
  pages: [
    { name: "Home", path: "/", layout: "default", description: "Landing page" },
    { name: "Login", path: "/login", layout: "auth", description: "Login page" },
  ],
  components: [
    { name: "Hero", type: "feature", template: "create-new", description: "Hero section" },
  ],
  routes: [
    { path: "/api/auth/login", method: "POST", description: "Login endpoint" },
  ],
  integrations: {
    auth: "supabase",
    db: "supabase",
  },
};

const input = {
  projectName: "TestApp",
  description: "A simple test app",
};

console.log('🧪 Testing Code Generation with Sonnet (16K tokens)\n');

resetGlobalTracker();
const start = Date.now();

try {
  const result = await generateCode(simpleArchitecture, input, {
    model: 'claude-sonnet-4-20250514',
  });
  
  const duration = Math.round((Date.now() - start) / 1000);
  const tracker = getGlobalTracker();
  const summary = tracker.getSummary();
  
  console.log(`✅ Success in ${duration}s`);
  console.log(`📊 Tokens: ${summary.totalInputTokens} in / ${summary.totalOutputTokens} out`);
  console.log(`📁 Files generated: ${result.files.length}`);
  console.log(`🔧 Integration code: ${result.integrationCode?.length || 0}`);
  console.log('\nGenerated files:');
  result.files.forEach(f => console.log(`   - ${f.path} (${f.content.length} chars)`));
  
} catch (error) {
  console.log(`❌ Failed: ${error.message}`);
  console.log('\nFull error:');
  console.log(error);
}

