#!/usr/bin/env node
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import { realpathSync } from "node:fs";
import fse from "fs-extra";
import degit from "degit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

const __cwd = process.cwd();

const TEMPLATES = {
  "seo-directory": "jrdaws/dawson-does-framework/templates/seo-directory",
  "saas": "jrdaws/dawson-does-framework/templates/saas",
  "internal-tool": "jrdaws/dawson-does-framework/templates/internal-tool",
  "automation": "jrdaws/dawson-does-framework/templates/automation",
};

/**
 * Parse export command flags from argv array
 * @param {string[]} args - Rest of argv after templateId and projectDir
 * @returns {object} Parsed flags
 */
export function parseExportFlags(args) {
  const flags = {
    name: null,
    remote: null,
    push: false,
    branch: "main",
    dryRun: false,
    force: false,
  };

  // Helper: check if next arg exists and is a value (not another flag)
  const hasValue = (idx) => args[idx + 1] && !args[idx + 1].startsWith("--");

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--name" && hasValue(i)) {
      flags.name = args[++i];
    } else if (arg === "--remote" && hasValue(i)) {
      flags.remote = args[++i];
    } else if (arg === "--push") {
      flags.push = true;
    } else if (arg === "--branch" && hasValue(i)) {
      flags.branch = args[++i];
    } else if (arg === "--dry-run") {
      flags.dryRun = true;
    } else if (arg === "--force") {
      flags.force = true;
    }
  }

  return flags;
}

/**
 * Run a command in a specific directory
 * @param {string} dir - Working directory
 * @param {string} cmd - Command to run
 * @param {string[]} args - Command arguments
 * @param {object} opts - Additional options
 * @returns {object} spawnSync result
 */
function runIn(dir, cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: dir,
    stdio: "inherit",
    ...opts,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const err = new Error(`Command failed: ${cmd} ${args.join(" ")} (exit ${result.status})`);
    err.exitCode = result.status;
    throw err;
  }
  return result;
}

/**
 * Check if git is available
 * @returns {boolean}
 */
function isGitAvailable() {
  try {
    const result = spawnSync("git", ["--version"], { stdio: "pipe" });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Export command: clone template into a new project directory and initialize git
 */
async function cmdExport(templateId, projectDir, restArgs) {
  const flags = parseExportFlags(restArgs || []);
  const dryRun = flags.dryRun;

  // Validate required args
  if (!templateId || !projectDir) {
    console.error("Usage: framework export <templateId> <projectDir> [options]\n");
    console.error("Options:");
    console.error("  --name <repoName>    Name for the project (defaults to folder name)");
    console.error("  --remote <gitUrl>    Git remote URL to add as origin");
    console.error("  --push               Push to remote after init (requires --remote)");
    console.error("  --branch <branch>    Branch name (default: main)");
    console.error("  --dry-run            Show what would happen without making changes");
    console.error("  --force              Overwrite existing directory");
    console.error("\nValid templates:", Object.keys(TEMPLATES).join(", "));
    process.exit(1);
  }

  // Validate template
  if (!TEMPLATES[templateId]) {
    console.error(`Unknown templateId: ${templateId}`);
    console.error(`Valid templates: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  // Validate --push requires --remote
  if (flags.push && !flags.remote) {
    console.error("Error: --push requires --remote to be specified.");
    console.error("Example: framework export saas ./my-app --remote https://github.com/me/my-app.git --push");
    process.exit(1);
  }

  // Resolve projectDir to absolute path
  const absProjectDir = path.resolve(projectDir);
  const projectName = flags.name || path.basename(absProjectDir);

  // Check if projectDir exists and is not empty
  if (fs.existsSync(absProjectDir)) {
    const contents = fs.readdirSync(absProjectDir);
    if (contents.length > 0 && !flags.force) {
      console.error(`Error: Directory "${absProjectDir}" exists and is not empty.`);
      console.error("Use --force to overwrite.");
      process.exit(1);
    }
  }

  // Check git is available (needed for git init/commit/push)
  if (!isGitAvailable()) {
    console.error("Error: git is required for export flow.");
    console.error("Please install git and ensure it's in your PATH.");
    process.exit(1);
  }

  // Dry run mode: print operations and exit
  if (dryRun) {
    console.log("DRY RUN - The following operations would be performed:\n");
    console.log(`1. Clone template "${templateId}" into "${absProjectDir}"`);
    console.log(`   degit ${TEMPLATES[templateId]}`);
    console.log(`\n2. Create starter files in "${absProjectDir}":`);
    console.log("   - README.md");
    console.log("   - .gitignore");
    console.log("   - .dd/config.json");
    console.log("   - .dd/health.sh (if source exists)");
    console.log("   - START_PROMPT.md (if source exists)");
    console.log(`\n3. Initialize git repository:`);
    console.log(`   git init -b ${flags.branch}`);
    console.log(`   git add -A`);
    console.log(`   git commit -m "Initial commit (exported via dawson-does-framework)"`);
    if (flags.remote) {
      console.log(`\n4. Add remote origin:`);
      console.log(`   git remote add origin ${flags.remote}`);
    }
    if (flags.push) {
      console.log(`\n5. Push to remote:`);
      console.log(`   git push -u origin ${flags.branch}`);
    }
    console.log("\nDRY RUN complete. No changes made.");
    return;
  }

  // ---- ACTUAL OPERATIONS (not dry run) ----

  console.log(`\nExporting template "${templateId}" to "${absProjectDir}"...\n`);

  // 1. Clone template using degit
  console.log(`[1/5] Cloning template...`);
  const repoPath = TEMPLATES[templateId];
  const emitter = degit(repoPath, { cache: false, force: flags.force, verbose: false });
  await emitter.clone(absProjectDir);
  console.log(`     ✓ Template cloned`);

  // 2. Create starter files
  console.log(`[2/5] Creating starter files...`);

  // README.md
  const readmePath = path.join(absProjectDir, "README.md");
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# ${projectName}

> Exported from [dawson-does-framework](https://github.com/jrdaws/dawson-does-framework) using template: \`${templateId}\`

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Next Steps

1. Open this folder in Cursor
2. Review and customize the code
3. Update this README with your project details

---

*Generated by dawson-does-framework export*
`;
    await fse.writeFile(readmePath, readmeContent, "utf8");
    console.log(`     ✓ README.md created`);
  } else {
    console.log(`     - README.md already exists, skipped`);
  }

  // .gitignore
  const gitignorePath = path.join(absProjectDir, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Misc
.cache/
`;
    await fse.writeFile(gitignorePath, gitignoreContent, "utf8");
    console.log(`     ✓ .gitignore created`);
  } else {
    console.log(`     - .gitignore already exists, skipped`);
  }

  // .dd/config.json
  const ddDir = path.join(absProjectDir, ".dd");
  const ddConfigPath = path.join(ddDir, "config.json");
  await fse.ensureDir(ddDir);
  if (!fs.existsSync(ddConfigPath)) {
    const ddConfig = {
      plan: "free",
      featureOverrides: {},
    };
    await fse.writeJson(ddConfigPath, ddConfig, { spaces: 2 });
    console.log(`     ✓ .dd/config.json created`);
  } else {
    console.log(`     - .dd/config.json already exists, skipped`);
  }

  // START_PROMPT.md (copy from package resources if available)
  const startPromptDst = path.join(absProjectDir, "START_PROMPT.md");
  if (!fs.existsSync(startPromptDst)) {
    // Try to locate from installed package
    const startPromptSrc = path.join(PKG_ROOT, "prompts", "tasks", "framework-start.md");
    if (fs.existsSync(startPromptSrc)) {
      await fse.copy(startPromptSrc, startPromptDst);
      console.log(`     ✓ START_PROMPT.md created`);
    } else {
      console.log(`     - START_PROMPT.md source not found, skipped (this is OK)`);
    }
  } else {
    console.log(`     - START_PROMPT.md already exists, skipped`);
  }

  // .dd/health.sh (copy framework health script if present)
  const srcHealth = path.join(PKG_ROOT, ".dd", "health.sh");
  const dstHealth = path.join(absProjectDir, ".dd", "health.sh");
  try {
    if (fs.existsSync(srcHealth)) {
      await fse.ensureDir(path.dirname(dstHealth));
      await fse.copy(srcHealth, dstHealth, { overwrite: true });
      await fse.chmod(dstHealth, 0o755);
      console.log(`     ✓ .dd/health.sh created`);
    } else {
      console.log(`     - .dd/health.sh not found in framework package, skipped`);
    }
  } catch (e) {
    console.log(`     - failed to copy .dd/health.sh (non-fatal): ${e?.message || e}`);
  }

    // .dd/after-install.sh (copy framework after-install hook if present)
  try {
    const srcAfterInstall = path.join(__dirname, "..", ".dd", "after-install.sh");
    const dstAfterInstall = path.join(outDir, ".dd", "after-install.sh");

    if (fs.existsSync(srcAfterInstall)) {
      fs.copyFileSync(srcAfterInstall, dstAfterInstall);
      fs.chmodSync(dstAfterInstall, 0o755);
      console.log(`     ✓ .dd/after-install.sh created`);
    } else {
      console.log(`     - .dd/after-install.sh not found in framework package, skipped`);
    }
  } catch (e) {
    console.log(`     - failed to copy .dd/after-install.sh (non-fatal): ${e?.message || e}`);
  }


  // 3. Initialize git (use -b to set initial branch, requires git 2.28+)
  console.log(`[3/5] Initializing git repository...`);
  runIn(absProjectDir, "git", ["init", "-q", "-b", flags.branch]);
  console.log(`     ✓ Git initialized on branch "${flags.branch}"`);

  // 4. Commit
  console.log(`[4/5] Creating initial commit...`);
  runIn(absProjectDir, "git", ["add", "-A"]);
  runIn(absProjectDir, "git", ["commit", "-q", "-m", "Initial commit (exported via dawson-does-framework)"]);
  console.log(`     ✓ Initial commit created`);

  // 5. Remote + push (optional)
  if (flags.remote) {
    console.log(`[5/5] Setting up remote...`);
    let remoteConfigured = false;
    try {
      // Check if origin already exists
      const remoteCheck = spawnSync("git", ["remote", "get-url", "origin"], { cwd: absProjectDir, stdio: "pipe" });
      if (remoteCheck.status === 0) {
        runIn(absProjectDir, "git", ["remote", "set-url", "origin", flags.remote], { stdio: "pipe" });
        console.log(`     ✓ Remote origin updated to ${flags.remote}`);
      } else {
        runIn(absProjectDir, "git", ["remote", "add", "origin", flags.remote], { stdio: "pipe" });
        console.log(`     ✓ Remote origin added: ${flags.remote}`);
      }
      remoteConfigured = true;
    } catch (e) {
      console.error(`     ✗ Failed to configure remote: ${e?.message || e}`);
      console.error(`     You can add it manually: git remote add origin ${flags.remote}`);
    }

    if (flags.push && remoteConfigured) {
      console.log(`     Pushing to origin/${flags.branch}...`);
      try {
        runIn(absProjectDir, "git", ["push", "-u", "origin", flags.branch], { stdio: "inherit" });
        console.log(`     ✓ Pushed to origin/${flags.branch}`);
      } catch {
        console.error("     ✗ Push failed. You can push manually later.");
      }
    } else if (flags.push && !remoteConfigured) {
      console.error("     ✗ Push skipped (remote not configured).");
    }
  } else {
    console.log(`[5/5] Remote setup skipped (no --remote provided)`);
  }

  console.log(`\n✅ Export complete!\n`);
  console.log(`Next steps:`);
  console.log(`  cd ${absProjectDir}`);
  console.log(`  npm install`);
  console.log(`  npm run dev`);
  if (!flags.remote) {
    console.log(`\nTo add a remote later:`);
    console.log(`  git remote add origin <your-repo-url>`);
    console.log(`  git push -u origin ${flags.branch}`);
  }
}

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
  framework export <templateId> <projectDir> [options]
  framework <templateId> <projectDir>

Export Options:
  --name <repoName>    Name for the project (defaults to folder name)
  --remote <gitUrl>    Git remote URL to add as origin
  --push               Push to remote after init (requires --remote)
  --branch <branch>    Branch name (default: main)
  --dry-run            Show what would happen without making changes
  --force              Overwrite existing directory

Valid Templates:
  seo-directory, saas, internal-tool, automation

Examples:
  framework help
  framework start
  framework start /Users/joseph.dawson/Documents/dd-cli-test
  framework capabilities .
  framework phrases .
  framework toggle figma.parse on .
  framework doctor .
  framework seo-directory my-project
  framework export seo-directory ~/Documents/Cursor/my-app
  framework export saas ~/Documents/Cursor/my-saas --remote https://github.com/me/my-saas.git --push
  framework export internal-tool ./tool --name tool --branch main
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
  if (a === "export") {
    const restArgs = process.argv.slice(5); // Everything after "export <templateId> <projectDir>"
    await cmdExport(b, c, restArgs);
    process.exit(0);
  }

  // otherwise treat as template
  await main(); // <-- your existing template clone flow
}
