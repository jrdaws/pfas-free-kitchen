/**
 * Export Validation Utilities
 * 
 * Functions for validating exported project ZIPs:
 * - Structure validation (expected files present)
 * - Dependency validation (npm install succeeds)
 * - Build validation (npm run build succeeds)
 * - Baseline comparison (diff against known-good exports)
 */

import * as fs from "fs";
import * as path from "path";
import { execSync, spawn } from "child_process";
import * as crypto from "crypto";

// Types
export interface TestConfig {
  id: string;
  name: string;
  tier: number;
  priority: "P0" | "P1" | "P2";
  config: {
    template: string;
    projectName: string;
    integrations: Record<string, string>;
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  expectedFiles: string[];
  expectedEnvVars: string[];
}

export interface ValidationResult {
  passed: boolean;
  expected: number;
  found: number;
  missing: string[];
  extra: string[];
}

export interface BuildResult {
  success: boolean;
  duration: number;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface DiffResult {
  identical: boolean;
  added: string[];
  removed: string[];
  modified: string[];
  checksumMismatches: string[];
}

export interface TestResult {
  id: string;
  name: string;
  tier: number;
  priority: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  structure: ValidationResult;
  dependencies: BuildResult | null;
  build: BuildResult | null;
  baseline: DiffResult | null;
  errors: string[];
  warnings: string[];
}

// Constants
const TIMEOUT_INSTALL = 120000; // 2 minutes
const TIMEOUT_BUILD = 180000;   // 3 minutes

/**
 * Download and extract ZIP from export API
 */
export async function downloadExport(
  config: TestConfig,
  baseUrl: string,
  outputDir: string
): Promise<string> {
  const response = await fetch(`${baseUrl}/api/export/zip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      template: config.config.template,
      projectName: config.config.projectName,
      integrations: config.config.integrations,
      branding: config.config.branding,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Export failed: ${response.status} - ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zipPath = path.join(outputDir, `${config.id}.zip`);
  fs.writeFileSync(zipPath, Buffer.from(arrayBuffer));

  // Extract ZIP
  const extractPath = path.join(outputDir, config.id);
  if (fs.existsSync(extractPath)) {
    fs.rmSync(extractPath, { recursive: true });
  }
  fs.mkdirSync(extractPath, { recursive: true });

  // Use unzip command
  execSync(`unzip -q "${zipPath}" -d "${extractPath}"`, { 
    timeout: 30000,
    stdio: "pipe"
  });

  return extractPath;
}

/**
 * Validate project structure against expected files
 */
export function validateStructure(
  projectPath: string,
  expectedFiles: string[]
): ValidationResult {
  const found: string[] = [];
  const missing: string[] = [];

  for (const file of expectedFiles) {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      found.push(file);
    } else {
      missing.push(file);
    }
  }

  // Get all actual files for comparison
  const actualFiles = getAllFiles(projectPath).map(f => 
    path.relative(projectPath, f)
  );

  // Find extra files (not in expected list, excluding node_modules and common generated)
  const extra = actualFiles.filter(f => 
    !expectedFiles.includes(f) &&
    !f.startsWith("node_modules") &&
    !f.startsWith(".next") &&
    !f.endsWith(".log")
  );

  return {
    passed: missing.length === 0,
    expected: expectedFiles.length,
    found: found.length,
    missing,
    extra,
  };
}

/**
 * Validate .env.local.example contains required env vars
 */
export function validateEnvVars(
  projectPath: string,
  expectedVars: string[]
): ValidationResult {
  const envPath = path.join(projectPath, ".env.local.example");
  
  if (!fs.existsSync(envPath)) {
    return {
      passed: expectedVars.length === 0,
      expected: expectedVars.length,
      found: 0,
      missing: expectedVars,
      extra: [],
    };
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const found: string[] = [];
  const missing: string[] = [];

  for (const v of expectedVars) {
    if (content.includes(v)) {
      found.push(v);
    } else {
      missing.push(v);
    }
  }

  return {
    passed: missing.length === 0,
    expected: expectedVars.length,
    found: found.length,
    missing,
    extra: [],
  };
}

/**
 * Run npm install in project directory
 */
export async function runNpmInstall(projectPath: string): Promise<BuildResult> {
  const start = Date.now();
  
  return new Promise((resolve) => {
    const proc = spawn("npm", ["install", "--legacy-peer-deps"], {
      cwd: projectPath,
      shell: true,
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => { stdout += data.toString(); });
    proc.stderr?.on("data", (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      proc.kill();
      resolve({
        success: false,
        duration: Date.now() - start,
        stdout,
        stderr: stderr + "\n[TIMEOUT: install took too long]",
        exitCode: -1,
      });
    }, TIMEOUT_INSTALL);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0,
        duration: Date.now() - start,
        stdout,
        stderr,
        exitCode: code ?? -1,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        duration: Date.now() - start,
        stdout,
        stderr: stderr + "\n" + err.message,
        exitCode: -1,
      });
    });
  });
}

/**
 * Run npm run build in project directory
 */
export async function runNpmBuild(projectPath: string): Promise<BuildResult> {
  const start = Date.now();
  
  return new Promise((resolve) => {
    const proc = spawn("npm", ["run", "build"], {
      cwd: projectPath,
      shell: true,
      stdio: "pipe",
      env: { ...process.env, CI: "true" },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => { stdout += data.toString(); });
    proc.stderr?.on("data", (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      proc.kill();
      resolve({
        success: false,
        duration: Date.now() - start,
        stdout,
        stderr: stderr + "\n[TIMEOUT: build took too long]",
        exitCode: -1,
      });
    }, TIMEOUT_BUILD);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      resolve({
        success: code === 0,
        duration: Date.now() - start,
        stdout,
        stderr,
        exitCode: code ?? -1,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        duration: Date.now() - start,
        stdout,
        stderr: stderr + "\n" + err.message,
        exitCode: -1,
      });
    });
  });
}

/**
 * Compare project to baseline export
 */
export function compareToBaseline(
  projectPath: string,
  baselinePath: string
): DiffResult {
  if (!fs.existsSync(baselinePath)) {
    return {
      identical: false,
      added: [],
      removed: [],
      modified: [],
      checksumMismatches: ["Baseline does not exist"],
    };
  }

  const projectFiles = getAllFiles(projectPath)
    .map(f => path.relative(projectPath, f))
    .filter(f => !f.startsWith("node_modules") && !f.startsWith(".next"));

  const baselineFiles = getAllFiles(baselinePath)
    .map(f => path.relative(baselinePath, f))
    .filter(f => !f.startsWith("node_modules") && !f.startsWith(".next"));

  const projectSet = new Set(projectFiles);
  const baselineSet = new Set(baselineFiles);

  const added = projectFiles.filter(f => !baselineSet.has(f));
  const removed = baselineFiles.filter(f => !projectSet.has(f));
  const common = projectFiles.filter(f => baselineSet.has(f));

  const checksumMismatches: string[] = [];

  for (const file of common) {
    const projContent = fs.readFileSync(path.join(projectPath, file));
    const baseContent = fs.readFileSync(path.join(baselinePath, file));
    
    const projHash = crypto.createHash("md5").update(projContent).digest("hex");
    const baseHash = crypto.createHash("md5").update(baseContent).digest("hex");
    
    if (projHash !== baseHash) {
      checksumMismatches.push(file);
    }
  }

  return {
    identical: added.length === 0 && removed.length === 0 && checksumMismatches.length === 0,
    added,
    removed,
    modified: checksumMismatches,
    checksumMismatches,
  };
}

/**
 * Generate checksums for all files in a directory
 */
export function generateChecksums(dirPath: string): Record<string, string> {
  const checksums: Record<string, string> = {};
  const files = getAllFiles(dirPath).filter(f => 
    !f.includes("node_modules") && !f.includes(".next")
  );

  for (const file of files) {
    const content = fs.readFileSync(file);
    const hash = crypto.createHash("md5").update(content).digest("hex");
    const relativePath = path.relative(dirPath, file);
    checksums[relativePath] = hash;
  }

  return checksums;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(entry.name)) {
        files.push(...getAllFiles(fullPath));
      }
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Generate summary report
 */
export function generateReport(results: TestResult[]): string {
  const lines: string[] = [
    "Export Validation Results",
    "========================",
    "",
  ];

  // Group by tier
  const byTier: Record<number, TestResult[]> = {};
  for (const r of results) {
    if (!byTier[r.tier]) byTier[r.tier] = [];
    byTier[r.tier].push(r);
  }

  const tierNames = ["", "Single Integration", "Common Combinations", "Full Stack", "Edge Cases"];

  for (const tier of [1, 2, 3, 4]) {
    const tierResults = byTier[tier] || [];
    if (tierResults.length === 0) continue;

    lines.push(`Tier ${tier}: ${tierNames[tier]} Tests`);
    
    for (const r of tierResults) {
      const icon = r.status === "passed" ? "✅" : r.status === "skipped" ? "⏭️" : "❌";
      const buildStatus = r.build 
        ? (r.build.success ? "pass" : "FAIL") 
        : "skip";
      const fileStatus = `${r.structure.found}/${r.structure.expected}`;
      
      lines.push(`  ${icon} ${r.id} ${r.name.padEnd(30)} [build: ${buildStatus}, files: ${fileStatus}]`);
      
      if (r.errors.length > 0) {
        for (const err of r.errors) {
          lines.push(`      ⚠️ ${err}`);
        }
      }
    }
    lines.push("");
  }

  // Summary
  const total = results.length;
  const passed = results.filter(r => r.status === "passed").length;
  const failed = results.filter(r => r.status === "failed").length;

  const byPriority: Record<string, { total: number; passed: number }> = {};
  for (const r of results) {
    if (!byPriority[r.priority]) byPriority[r.priority] = { total: 0, passed: 0 };
    byPriority[r.priority].total++;
    if (r.status === "passed") byPriority[r.priority].passed++;
  }

  lines.push("Summary:");
  lines.push(`  Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  
  for (const p of ["P0", "P1", "P2"]) {
    const stats = byPriority[p];
    if (!stats) continue;
    const pct = Math.round((stats.passed / stats.total) * 100);
    const icon = pct === 100 ? "✅" : pct >= 75 ? "⚠️" : "❌";
    lines.push(`  ${p}: ${stats.passed}/${stats.total} (${pct}%) ${icon}`);
  }

  return lines.join("\n");
}

/**
 * Generate gap analysis markdown report
 */
export function generateGapAnalysis(results: TestResult[]): string {
  const failed = results.filter(r => r.status === "failed");
  
  if (failed.length === 0) {
    return "# Gap Analysis Report\n\n✅ All tests passed! No gaps found.\n";
  }

  const lines: string[] = [
    "# Gap Analysis Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Failed Tests: ${failed.length}/${results.length}`,
    "",
    "---",
    "",
    "## Missing Files",
    "",
    "| Test | Expected | Found | Missing |",
    "|------|----------|-------|---------|",
  ];

  for (const r of failed) {
    if (r.structure.missing.length > 0) {
      const missing = r.structure.missing.slice(0, 3).join(", ");
      const more = r.structure.missing.length > 3 ? ` (+${r.structure.missing.length - 3} more)` : "";
      lines.push(`| ${r.id} | ${r.structure.expected} | ${r.structure.found} | ${missing}${more} |`);
    }
  }

  lines.push("");
  lines.push("## Build Failures");
  lines.push("");
  lines.push("| Test | Error | Root Cause |");
  lines.push("|------|-------|------------|");

  for (const r of failed) {
    if (r.build && !r.build.success) {
      const errorMatch = r.build.stderr.match(/error[:\s]+(.+)/i);
      const error = errorMatch ? errorMatch[1].substring(0, 50) : "Unknown error";
      lines.push(`| ${r.id} | ${error} | See logs |`);
    }
  }

  lines.push("");
  lines.push("## Recommendations");
  lines.push("");

  for (const r of failed) {
    lines.push(`### ${r.id}: ${r.name}`);
    lines.push("");
    
    if (r.structure.missing.length > 0) {
      lines.push(`- Add missing files: ${r.structure.missing.join(", ")}`);
    }
    
    for (const err of r.errors) {
      lines.push(`- Fix: ${err}`);
    }
    
    lines.push("");
  }

  return lines.join("\n");
}
