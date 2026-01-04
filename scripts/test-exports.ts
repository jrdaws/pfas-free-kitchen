#!/usr/bin/env npx tsx

/**
 * Export Validation Test Runner
 * 
 * Validates that framework exports produce valid, buildable projects.
 * 
 * Usage:
 *   npm run test:exports             # Run all tests
 *   npm run test:exports -- --tier=1 # Run tier 1 only
 *   npm run test:exports -- --id=T01 # Run single test
 *   npm run test:exports -- --quick  # Structure only, no build
 *   npm run test:exports -- --compare # Compare to baseline
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  TestConfig,
  TestResult,
  downloadExport,
  validateStructure,
  validateEnvVars,
  runNpmInstall,
  runNpmBuild,
  compareToBaseline,
  generateReport,
  generateGapAnalysis,
  generateChecksums,
} from "./lib/export-validator.js";

// Configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "test-configs", "export-tests.json");
const OUTPUT_DIR = path.join(process.cwd(), "output", "agents", "quality", "workspace", "export-tests-run");
const BASELINE_DIR = path.join(process.cwd(), "output", "agents", "quality", "baseline-exports");
const RESULTS_PATH = path.join(process.cwd(), "output", "agents", "quality", "workspace", "export-validation-results.json");
const GAP_ANALYSIS_PATH = path.join(process.cwd(), "output", "agents", "quality", "workspace", "gap-analysis.md");

// Parse command line args
const args = process.argv.slice(2);
const tier = args.find(a => a.startsWith("--tier="))?.split("=")[1];
const testId = args.find(a => a.startsWith("--id="))?.split("=")[1];
const quickMode = args.includes("--quick");
const compareMode = args.includes("--compare");
const updateBaseline = args.includes("--update-baseline");
const priority = args.find(a => a.startsWith("--priority="))?.split("=")[1];
const baseUrl = args.find(a => a.startsWith("--url="))?.split("=")[1] || "http://localhost:3000";

async function main() {
  console.log("Export Validation Test Runner");
  console.log("=============================\n");

  // Load test configurations
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`❌ Config file not found: ${CONFIG_PATH}`);
    process.exit(1);
  }

  const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  let tests: TestConfig[] = configData.tests;

  // Filter tests based on args
  if (tier) {
    tests = tests.filter(t => t.tier === parseInt(tier));
    console.log(`📋 Running tier ${tier} tests only (${tests.length} tests)\n`);
  } else if (testId) {
    tests = tests.filter(t => t.id === testId);
    console.log(`📋 Running single test: ${testId}\n`);
  } else if (priority) {
    tests = tests.filter(t => t.priority === priority);
    console.log(`📋 Running ${priority} priority tests (${tests.length} tests)\n`);
  } else {
    console.log(`📋 Running all ${tests.length} tests\n`);
  }

  if (tests.length === 0) {
    console.error("❌ No tests match the specified criteria");
    process.exit(1);
  }

  // Mode info
  if (quickMode) {
    console.log("⚡ Quick mode: Structure validation only (no npm install/build)\n");
  }
  if (compareMode) {
    console.log("🔍 Compare mode: Comparing to baseline exports\n");
  }

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Check if dev server is running
  console.log(`🌐 Using API at: ${baseUrl}`);
  try {
    const healthCheck = await fetch(`${baseUrl}/api/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000)
    });
    if (!healthCheck.ok) {
      console.warn("⚠️  API health check failed, but continuing...\n");
    } else {
      console.log("✅ API is reachable\n");
    }
  } catch {
    console.error("❌ Cannot reach API. Start the dev server first:");
    console.error("   cd website && npm run dev\n");
    process.exit(1);
  }

  // Run tests
  const results: TestResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`[${i + 1}/${tests.length}] ${test.id}: ${test.name}`);

    const result = await runTest(test, quickMode, compareMode);
    results.push(result);

    // Print result
    const icon = result.status === "passed" ? "✅" : result.status === "skipped" ? "⏭️" : "❌";
    console.log(`  ${icon} ${result.status.toUpperCase()} (${result.duration}ms)`);
    
    if (result.errors.length > 0) {
      for (const err of result.errors.slice(0, 3)) {
        console.log(`     ⚠️ ${err}`);
      }
    }
    console.log("");
  }

  const totalDuration = Date.now() - startTime;

  // Generate reports
  console.log("\n" + generateReport(results));

  // Save JSON results
  const jsonResults = {
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    mode: quickMode ? "quick" : "full",
    baseUrl,
    summary: {
      total: results.length,
      passed: results.filter(r => r.status === "passed").length,
      failed: results.filter(r => r.status === "failed").length,
      skipped: results.filter(r => r.status === "skipped").length,
      byPriority: ["P0", "P1", "P2"].reduce((acc, p) => {
        const filtered = results.filter(r => r.priority === p);
        acc[p] = {
          total: filtered.length,
          passed: filtered.filter(r => r.status === "passed").length,
        };
        return acc;
      }, {} as Record<string, { total: number; passed: number }>),
    },
    results,
  };

  fs.writeFileSync(RESULTS_PATH, JSON.stringify(jsonResults, null, 2));
  console.log(`\n💾 Results saved to: ${RESULTS_PATH}`);

  // Generate gap analysis for failures
  const gapAnalysis = generateGapAnalysis(results);
  fs.writeFileSync(GAP_ANALYSIS_PATH, gapAnalysis);
  console.log(`📊 Gap analysis saved to: ${GAP_ANALYSIS_PATH}`);

  // Update baseline if requested
  if (updateBaseline) {
    const passed = results.filter(r => r.status === "passed");
    console.log(`\n🔄 Updating baseline with ${passed.length} passing tests...`);
    
    for (const r of passed) {
      const projectPath = path.join(OUTPUT_DIR, r.id);
      const baselinePath = path.join(BASELINE_DIR, r.id);
      
      if (fs.existsSync(projectPath)) {
        fs.mkdirSync(baselinePath, { recursive: true });
        
        // Copy files (excluding node_modules)
        copyDirSync(projectPath, baselinePath, ["node_modules", ".next"]);
        
        // Save checksums
        const checksums = generateChecksums(baselinePath);
        fs.writeFileSync(
          path.join(baselinePath, "checksums.json"),
          JSON.stringify(checksums, null, 2)
        );
        
        console.log(`  ✅ Updated baseline: ${r.id}`);
      }
    }
  }

  // Exit code based on results
  const allP0Passed = results
    .filter(r => r.priority === "P0")
    .every(r => r.status === "passed");

  if (!allP0Passed) {
    console.log("\n❌ Some P0 tests failed - blocking release");
    process.exit(1);
  }

  const overallPass = results.every(r => r.status === "passed");
  if (!overallPass) {
    console.log("\n⚠️ Some tests failed, but all P0 tests passed");
    process.exit(0);
  }

  console.log("\n✅ All tests passed!");
  process.exit(0);
}

async function runTest(
  test: TestConfig,
  quickMode: boolean,
  compareMode: boolean
): Promise<TestResult> {
  const start = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  const result: TestResult = {
    id: test.id,
    name: test.name,
    tier: test.tier,
    priority: test.priority,
    status: "passed",
    duration: 0,
    structure: { passed: false, expected: 0, found: 0, missing: [], extra: [] },
    dependencies: null,
    build: null,
    baseline: null,
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Download and extract ZIP
    console.log("  📥 Downloading export...");
    const projectPath = await downloadExport(test, baseUrl, OUTPUT_DIR);

    // Step 2: Validate structure
    console.log("  📁 Validating structure...");
    result.structure = validateStructure(projectPath, test.expectedFiles);
    
    if (!result.structure.passed) {
      errors.push(`Missing files: ${result.structure.missing.join(", ")}`);
    }

    // Step 3: Validate env vars
    const envResult = validateEnvVars(projectPath, test.expectedEnvVars);
    if (!envResult.passed) {
      errors.push(`Missing env vars: ${envResult.missing.join(", ")}`);
    }

    // Step 4: npm install (skip in quick mode)
    if (!quickMode) {
      console.log("  📦 Running npm install...");
      result.dependencies = await runNpmInstall(projectPath);
      
      if (!result.dependencies.success) {
        errors.push("npm install failed");
      }

      // Step 5: npm run build (skip for P2 or if install failed)
      if (result.dependencies.success && test.priority !== "P2") {
        console.log("  🔨 Running build...");
        result.build = await runNpmBuild(projectPath);
        
        if (!result.build.success) {
          // Extract meaningful error
          const tsError = result.build.stderr.match(/error TS\d+: .+/g);
          if (tsError) {
            errors.push(`TypeScript: ${tsError[0]}`);
          } else {
            errors.push("Build failed (see logs)");
          }
        }
      }
    }

    // Step 6: Compare to baseline (if requested)
    if (compareMode) {
      const baselinePath = path.join(BASELINE_DIR, test.id);
      result.baseline = compareToBaseline(projectPath, baselinePath);
      
      if (!result.baseline.identical) {
        warnings.push(`Baseline diff: +${result.baseline.added.length}, -${result.baseline.removed.length}, ~${result.baseline.modified.length}`);
      }
    }

  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  result.duration = Date.now() - start;
  result.errors = errors;
  result.warnings = warnings;

  // Determine final status
  if (errors.length > 0) {
    result.status = "failed";
  } else if (result.structure.missing.length > 0) {
    result.status = "failed";
  } else if (result.build && !result.build.success) {
    result.status = "failed";
  }

  return result;
}

/**
 * Copy directory recursively, excluding specified directories
 */
function copyDirSync(src: string, dest: string, exclude: string[] = []): void {
  if (!fs.existsSync(src)) return;
  
  fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Run
main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
