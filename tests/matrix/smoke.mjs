#!/usr/bin/env node
/**
 * Matrix smoke test - test all templates × scenarios
 * Run with: npm run matrix:smoke
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TEMPLATES = ["saas", "seo-directory"];
const TEST_DIR = "./_matrix-test";

function runCommand(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
  return result;
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    console.log(`🧹 Cleaning up ${TEST_DIR}`);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

async function testTemplate(templateId) {
  const projectDir = path.join(TEST_DIR, templateId);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📦 Testing template: ${templateId}`);
  console.log(`${"=".repeat(60)}\n`);

  // 1. Export template
  console.log(`1️⃣  Exporting template...`);
  runCommand("node", [
    "bin/framework.js",
    "export",
    templateId,
    projectDir,
    "--template-source",
    "local",
    "--after-install",
    "off",
    "--force",
  ]);

  // 2. Check manifest exists
  const manifestPath = path.join(projectDir, ".dd/template-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing manifest: ${manifestPath}`);
  }
  console.log(`✅ Manifest created`);

  // 3. Check drift (should be zero on fresh export)
  console.log(`2️⃣  Checking drift...`);
  runCommand("node", ["bin/framework.js", "drift", projectDir]);
  console.log(`✅ Drift check passed`);

  // 4. Install dependencies
  console.log(`3️⃣  Installing dependencies...`);
  runCommand("npm", ["install"], { cwd: projectDir });
  console.log(`✅ Dependencies installed`);

  // 5. Build project
  console.log(`4️⃣  Building project...`);
  runCommand("npm", ["run", "build"], { cwd: projectDir });
  console.log(`✅ Build succeeded`);

  console.log(`\n✅ ${templateId} passed all smoke tests!\n`);
}

async function main() {
  console.log("🧪 Matrix Smoke Test");
  console.log(`Testing ${TEMPLATES.length} templates\n`);

  // Cleanup before starting
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const templateId of TEMPLATES) {
    try {
      await testTemplate(templateId);
      passed++;
    } catch (err) {
      console.error(`\n❌ ${templateId} failed:`, err.message);
      failed++;
      failures.push({ templateId, error: err.message });
    }
  }

  // Cleanup after tests
  cleanup();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Test Summary`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Passed: ${passed}/${TEMPLATES.length}`);
  console.log(`Failed: ${failed}/${TEMPLATES.length}`);

  if (failures.length > 0) {
    console.log(`\nFailures:`);
    failures.forEach(f => console.log(`  - ${f.templateId}: ${f.error}`));
    process.exit(1);
  }

  console.log(`\n✅ All templates passed smoke tests!`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  cleanup();
  process.exit(1);
});
