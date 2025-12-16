#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { realpathSync } from "node:fs";
import fse from "fs-extra";
import degit from "degit";

const __cwd = process.cwd();

const TEMPLATES = {
  "seo-directory": "jrdaws/dawson-does-framework/templates/seo-directory",
  "saas": "jrdaws/dawson-does-framework/templates/saas",
  "internal-tool": "jrdaws/dawson-does-framework/templates/internal-tool",
  "automation": "jrdaws/dawson-does-framework/templates/automation",
};


function runOrExit(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.error) throw r.error;
  if (typeof r.status === "number" && r.status !== 0) process.exit(r.status);
}
function usage() {
  console.log(`Usage:
  framework start [projectDir]
  framework <templateId> <projectDir>

Examples:
  framework start
  framework start /Users/joseph.dawson/Documents/dd-cli-test
  framework seo-directory my-project
`);
}

async function cmdStart(projectDirArg) {
  const startPromptPath = path.resolve("prompts/tasks/framework-start.md");
  if (!fs.existsSync(startPromptPath)) {
    console.error("Missing prompts/tasks/framework-start.md");
    process.exit(1);
  }
  const content = fs.readFileSync(startPromptPath, "utf8");
  console.log(content);

  if (projectDirArg) {
    const outPath = path.join(path.resolve(projectDirArg), "START_PROMPT.md");
    await fse.ensureDir(path.dirname(outPath));
    await fse.writeFile(outPath, content, "utf8");
    console.log(`\nWrote: ${outPath}`);
  }
}

async function cmdScaffold(templateId, projectDir) {
  if (!templateId || !projectDir) {
    usage();
    process.exit(1);
  }
  if (!TEMPLATES[templateId]) {
    console.error(`Unknown templateId: ${templateId}`);
    console.error(`Valid: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  console.log(`Cloning template "${templateId}" into "${projectDir}"...`);
  const repoPath = TEMPLATES[templateId];
  const emitter = degit(repoPath, { cache: false, force: true, verbose: false });
  await emitter.clone(projectDir);

  const superPromptSrc = path.resolve("prompts/superprompt/v0.1.md");
  const superPromptDst = path.join(path.resolve(projectDir), "SUPER_PROMPT.md");
  if (fs.existsSync(superPromptSrc)) {
    await fse.copy(superPromptSrc, superPromptDst, { overwrite: true });
  }

  console.log("\nNext steps:");
  console.log(`  cd ${projectDir}`);
  console.log("  npm install");
  console.log("  npm run dev");
  console.log("\nCursor:");
  console.log("  Open this folder in Cursor");
  console.log("  Open SUPER_PROMPT.md, fill variables, paste into Cursor chat");
}

async function ensureFrameworkMapFresh() {
  try {
    // Best-effort; never blocks CLI
    spawnSync("npm", ["run", "framework:map"], { stdio: "ignore" });
  } catch {
    // ignore
  }
}

async function main() {
  const [, , a, b] = process.argv;

  if (!a || a === "--help" || a === "-h") {
    usage();
    process.exit(0);
  }

  if (a === "start") {
    await cmdStart(b);
    process.exit(0);
  }

  await cmdScaffold(a, b);
}


import { resolveProjectDir, loadProjectConfig, saveProjectConfig } from "../scripts/orchestrator/project-config.mjs";
import { resolveEnabledCaps } from "../scripts/orchestrator/capability-engine.mjs";

async function cmdHelp() {
  console.log(`Usage:
  framework help
  framework start [projectDir]
  framework capabilities [projectDir]
  framework phrases [projectDir]
  framework toggle <capId> on|off [projectDir]
  framework figma:parse
  framework cost:summary
  framework doctor [projectDir]
  framework <templateId> <projectDir>

Examples:
  framework help
  framework start
  framework start /Users/joseph.dawson/Documents/dd-cli-test
  framework capabilities .
  framework phrases .
  framework toggle figma.parse on .
  framework doctor .
  framework seo-directory my-project
`);
}

async function cmdCapabilities(projectDirArg) {
  await ensureFrameworkMapFresh();
  const projectDir = resolveProjectDir(projectDirArg);
  const caps = await resolveEnabledCaps(projectDir);
  const cfg = await loadProjectConfig(projectDir);

  console.log(JSON.stringify({
    projectDir,
    plan: cfg.plan || "free",
    enabled: caps.filter(c => c.enabled).map(c => c.id),
    disabled: caps.filter(c => !c.enabled).map(c => ({ id: c.id, reason: (c.requiresEnv?.length ? "missing env or overridden off" : "overridden off") }))
  }, null, 2));
}

async function cmdPhrases(projectDirArg) {
  await ensureFrameworkMapFresh();
  const projectDir = resolveProjectDir(projectDirArg);
  const caps = await resolveEnabledCaps(projectDir);

  console.log("FRAMEWORK PHRASES (dynamic):\n");
  for (const c of caps) {
    const status = c.enabled ? "ON " : "OFF";
    console.log(`- [${status}] ${c.phrase}`);
    console.log(`  -> ${c.command}`);
    if (!c.enabled && c.requiresEnv?.length) {
      console.log(`     (Enable by setting env: ${c.requiresEnv.join(", ")}, or toggling on in .dd/config.json)`);
    }
  }
}

async function cmdToggle(capId, onOff, projectDirArg) {
  if (!capId || !onOff || !["on","off"].includes(onOff)) {
    console.error("Usage: framework toggle <capId> on|off [projectDir]");
    process.exit(1);
  }
  const projectDir = resolveProjectDir(projectDirArg);
  const cfg = await loadProjectConfig(projectDir);
  cfg.featureOverrides = cfg.featureOverrides || {};
  cfg.featureOverrides[capId] = (onOff === "on");
  const out = await saveProjectConfig(projectDir, cfg);
  console.log(`Saved: ${out}`);
}

async function cmdFigmaParse() {
  // truly optional: if not configured, don’t error
  const token = process.env.FIGMA_TOKEN;
  const key = process.env.FIGMA_FILE_KEY;
  if (!token || !key) {
    console.log("Figma integration is optional. Skipping because no FIGMA_TOKEN / FIGMA_FILE_KEY found.");
    return;
  }
  runOrExit("node", ["scripts/figma/parse-figma.mjs"]);
}

async function cmdCostSummary() {
  runOrExit("node", ["scripts/orchestrator/cost-summary.mjs"]);
}

async function cmdDoctor(projectDirArg) {
  const projectDir = resolveProjectDir(projectDirArg);
  const healthPath = path.join(projectDir, ".dd", "health.sh");

  if (!fs.existsSync(healthPath)) {
    console.error("Missing:", healthPath);
    console.error("Expected a health script at .dd/health.sh in the target project/repo.");
    process.exit(1);
  }

  runOrExit("bash", [healthPath]);
}

/**
 * Unified dispatcher (single source of truth)
 */
const selfPath = realpathSync(fileURLToPath(import.meta.url));
let argvPath = process.argv[1];
try { argvPath = realpathSync(argvPath); } catch {}
const isEntrypoint = selfPath === argvPath;
if (isEntrypoint) {
  const [, , a, b, c, d] = process.argv;

  // Keep FRAMEWORK_MAP.md fresh on every CLI invocation (never blocks)
  await ensureFrameworkMapFresh();

  // help first
  if (!a || a === "help" || a === "--help" || a === "-h") {
    await cmdHelp();
    process.exit(0);
  }

  // framework commands
  if (a === "start") { await cmdStart(b); process.exit(0); }
  if (a === "capabilities") { await cmdCapabilities(b); process.exit(0); }
  if (a === "phrases") { await cmdPhrases(b); process.exit(0); }
  if (a === "toggle") { await cmdToggle(b, c, d); process.exit(0); }
  if (a === "figma:parse") { await cmdFigmaParse(); process.exit(0); }
  if (a === "cost:summary") { await cmdCostSummary(); process.exit(0); }
  if (a === "doctor") { await cmdDoctor(b); process.exit(0); }

  // otherwise treat as template
  await main(); // <-- your existing template clone flow
}
