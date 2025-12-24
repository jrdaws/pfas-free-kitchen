#!/usr/bin/env node
import { runPostExportHooks } from "../src/dd/post-export-hooks.mjs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import fs from "node:fs";
import { realpathSync } from "node:fs";
import fse from "fs-extra";
import degit from "degit";
import { writeManifest } from "../src/dd/manifest.mjs";
import { validateConfig } from "../src/dd/config-schema.mjs";
import { detectDrift } from "../src/dd/drift.mjs";
import { checkPlanCompliance } from "../src/dd/plan-compliance.mjs";
import { cmdLLM } from "../src/commands/llm.mjs";
import { cmdAuth } from "../src/commands/auth.mjs";
import { cmdPlugin } from "../src/commands/plugin.mjs";
import { cmdTemplates } from "../src/commands/templates.mjs";
import { cmdDeploy, cmdDeployAuth } from "../src/commands/deploy.mjs";
import { cmdGenerate } from "../src/dd/generate.mjs";
import { executeHooks } from "../src/dd/plugins.mjs";
import * as logger from "../src/dd/logger.mjs";
import { getCurrentVersion, checkForUpdates, getUpgradeCommand, getPackageName } from "../src/dd/version.mjs";
import { createCheckpoint, restoreCheckpoint, listCheckpoints, cleanupCheckpoints, getAuditLog } from "../src/dd/agent-safety.mjs";
import { validateIntegrations, applyIntegrations } from "../src/dd/integrations.mjs";
import { parsePullFlags, getApiUrl, fetchProject, generateEnvExample, generateContext, openInCursor, formatIntegrations } from "../src/dd/pull.mjs";
import { generateCursorRules, generateStartPrompt } from "../src/dd/cursorrules.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");

const __cwd = process.cwd();
const TEMPLATES = {
  "seo-directory": "jrdaws/dawson-does-framework/templates/seo-directory",
  "saas": "jrdaws/dawson-does-framework/templates/saas",
  "blog": "jrdaws/dawson-does-framework/templates/blog",
  "dashboard": "jrdaws/dawson-does-framework/templates/dashboard",
  "landing-page": "jrdaws/dawson-does-framework/templates/landing-page",
  "flagship-saas": "jrdaws/dawson-does-framework/templates/flagship-saas",
  // "internal-tool": "jrdaws/dawson-does-framework/templates/internal-tool",  // TODO: add template content
  // "automation": "jrdaws/dawson-does-framework/templates/automation",        // TODO: add template content
};


function resolveTemplateRef({ templateId, templateSource, frameworkVersion }) {
  // Env defaults (env is useful for dev loops)
  const envSource = (process.env.FRAMEWORK_TEMPLATE_SOURCE || "").trim();
  const envVersion = (process.env.FRAMEWORK_VERSION || "").trim();

  // If templateSource not provided (or auto), allow env to steer it
  if (!templateSource || templateSource === "auto") {
    if (envSource === "local" || envSource === "remote" || envSource === "auto") templateSource = envSource || "auto";
    else templateSource = templateSource || "auto";
  }

  // Allow env version pinning if not provided
  if (!frameworkVersion && envVersion) frameworkVersion = envVersion;

  // Local template directory inside the framework repo
  const localTplDir = path.join(PKG_ROOT, "templates", templateId);
  const hasLocal = fs.existsSync(localTplDir);

  // Resolve policy
  if (templateSource === "local") {
    if (!hasLocal) throw new Error(`Local template not found: ${localTplDir}`);
    return { mode: "local", localPath: localTplDir };
  }

  if (templateSource === "auto" && hasLocal) {
    return { mode: "local", localPath: localTplDir };
  }

  const source = templateSource || "auto";
  const localDir = path.join(PKG_ROOT, "templates", templateId);

  const localExists = (() => {
    try { return fs.existsSync(localDir) && fs.statSync(localDir).isDirectory(); } catch { return false; }
  })();

  let mode = source;
  if (mode === "auto") mode = localExists ? "local" : "remote";

  if (mode === "local") {
    if (!localExists) {
      throw new Error(`Local template not found: ${localDir}`);
    }
    return { mode: "local", localPath: localDir, remoteRef: null };
  }

  // remote
  const base = TEMPLATES[templateId];
  if (!base) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }
  const remoteRef = frameworkVersion ? `${base}#${frameworkVersion}` : base;
  return { mode: "remote", localPath: null, remoteRef };
}

function copyDirRecursive(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const from = path.join(src, e.name);
    const to = path.join(dst, e.name);
    if (e.isDirectory()) copyDirRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
}

const args = process.argv.slice(2);

// Subcommand: demo
if (args[0] === "demo") {
  // Usage: framework demo <templateId?> <projectDir?> [--after-install prompt|auto|off]
  await cmdDemo(args.slice(1));
  process.exit(0);
}


/**
 * Parse export command flags from argv array
 * @param {string[]} args - Rest of argv after templateId and projectDir
 * @returns {object} Parsed flags
 */
export function parseExportFlags(args) {
  const flags = {
      templateSource: "auto",
      frameworkVersion: null,
    afterInstall: "prompt",
    name: null,
    remote: null,
    push: false,
    branch: "main",
    dryRun: false,
    force: false,
    listIntegrations: false,
    integrations: {
      auth: null,
      payments: null,
      email: null,
      db: null,
      ai: null,
      analytics: null,
      storage: null,
    },
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
    } else if (arg === "--list-integrations") {
      flags.listIntegrations = true;
    } else if (arg === "--after-install" && hasValue(i)) {
      const v = String(args[++i]).trim();
      if (v === "prompt" || v === "auto" || v === "off") flags.afterInstall = v;
    }
      else if (arg === "--template-source" && hasValue(i)) {
        const v2 = String(args[++i]).trim();
        if (v2 === "local" || v2 === "remote" || v2 === "auto") flags.templateSource = v2;
      } else if (arg === "--framework-version" && hasValue(i)) {
        flags.frameworkVersion = String(args[++i]).trim();
      }
      // Integration flags
      else if (arg === "--auth" && hasValue(i)) {
        flags.integrations.auth = String(args[++i]).trim();
      } else if (arg === "--payments" && hasValue(i)) {
        flags.integrations.payments = String(args[++i]).trim();
      } else if (arg === "--email" && hasValue(i)) {
        flags.integrations.email = String(args[++i]).trim();
      } else if (arg === "--db" && hasValue(i)) {
        flags.integrations.db = String(args[++i]).trim();
      } else if (arg === "--ai" && hasValue(i)) {
        flags.integrations.ai = String(args[++i]).trim();
      } else if (arg === "--analytics" && hasValue(i)) {
        flags.integrations.analytics = String(args[++i]).trim();
      } else if (arg === "--storage" && hasValue(i)) {
        flags.integrations.storage = String(args[++i]).trim();
      }

  }

  return flags;
}

/**
 * List available integrations for a template
 * @param {string} templatePath - Path to the template directory
 */
async function listAvailableIntegrations(templatePath, templateId) {
  const integrationsPath = path.join(templatePath, "integrations");

  if (!fs.existsSync(integrationsPath)) {
    console.log(`\nTemplate "${templateId}" does not have any integrations.\n`);
    return;
  }

  console.log(`\nAvailable integrations for ${templateId} template:\n`);

  const types = fs.readdirSync(integrationsPath).filter(d => {
    const stat = fs.statSync(path.join(integrationsPath, d));
    return stat.isDirectory() && !d.startsWith("_");
  });

  for (const type of types.sort()) {
    const typePath = path.join(integrationsPath, type);
    const providers = fs.readdirSync(typePath).filter(p => {
      const pPath = path.join(typePath, p);
      return fs.statSync(pPath).isDirectory() && fs.existsSync(path.join(pPath, "integration.json"));
    });

    if (providers.length === 0) continue;

    console.log(`${type.toUpperCase()}`);

    for (const provider of providers.sort()) {
      const integrationJsonPath = path.join(typePath, provider, "integration.json");
      try {
        const metadata = JSON.parse(fs.readFileSync(integrationJsonPath, "utf8"));
        const desc = metadata.description || "";
        const shortDesc = desc.length > 50 ? desc.substring(0, 47) + "..." : desc;
        console.log(`  ${provider.padEnd(12)} ${shortDesc}`);
      } catch {
        console.log(`  ${provider.padEnd(12)} (integration available)`);
      }
    }
    console.log("");
  }

  // Show usage example
  console.log(`Use: framework export ${templateId} ./myapp --auth supabase --payments stripe\n`);
}

/**
 * Demo command: quick golden-path runner.
 * Usage: framework demo <templateId?> <projectDir?> [--after-install prompt|auto|off]
 */
async function cmdDemo(restArgs) {
  const templateId = restArgs[0] || "saas";
  
  // Handle help and invalid args
  if (templateId === "--help" || templateId === "-h" || templateId === "help") {
    console.log(`Usage: framework demo [templateId] [projectDir] [options]

Quick export for testing. Creates a demo project with sensible defaults.

Arguments:
  templateId     Template to use (default: saas)
  projectDir     Output directory (default: ./_demo-<templateId>)

Options:
  --force                           Overwrite existing directory
  --dry-run                         Preview without making changes
  --after-install prompt|auto|off   Post-install behavior (default: prompt)
  --template-source local|remote|auto  Template source (default: auto)

Valid templates: ${Object.keys(TEMPLATES).join(", ")}

Examples:
  framework demo                         # Export saas to ./_demo-saas
  framework demo seo-directory           # Export seo-directory to ./_demo-seo-directory
  framework demo saas ./my-test --force  # Overwrite existing ./my-test
`);
    return;
  }

  // Validate template exists
  if (!TEMPLATES[templateId]) {
    console.error(`Unknown template: ${templateId}`);
    console.error(`Valid templates: ${Object.keys(TEMPLATES).join(", ")}`);
    console.error(`\nRun 'framework demo --help' for usage.`);
    process.exit(1);
  }

  // Check if second arg is a flag (starts with --) or a directory
  const secondArg = restArgs[1];
  const isFlag = secondArg && secondArg.startsWith("--");
  
  const projectDir = (isFlag || !secondArg) ? `./_demo-${templateId}` : secondArg;
  // Pass through all flags to cmdExport (it will parse them itself)
  // If secondArg was a flag, include it; otherwise start from restArgs[2]
  const flagArgs = isFlag ? restArgs.slice(1) : restArgs.slice(2);
  await cmdExport(templateId, projectDir, flagArgs);
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
  // Handle help flag
  if (!templateId || templateId === "--help" || templateId === "-h" || templateId === "help") {
    console.log(`Usage: framework export <templateId> <projectDir> [options]

Export a template to create a new project.

Arguments:
  templateId    Template to export (see list below)
  projectDir    Output directory for the project

Options:
  --name <repoName>       Name for the project (defaults to folder name)
  --remote <gitUrl>       Git remote URL to add as origin
  --push                  Push to remote after init (requires --remote)
  --branch <branch>       Branch name (default: main)
  --dry-run               Show what would happen without making changes
  --force                 Overwrite existing directory
  --list-integrations     List available integrations for the template

Integration Options:
  --auth <provider>      Auth integration (supabase, clerk, nextauth)
  --payments <provider>  Payments integration (stripe, paddle, lemon-squeezy)
  --email <provider>     Email integration (resend, sendgrid, postmark)
  --ai <provider>        AI integration (openai, anthropic)
  --analytics <provider> Analytics integration (posthog, plausible, mixpanel)
  --storage <provider>   Storage integration (supabase, cloudflare, s3)

Valid templates: ${Object.keys(TEMPLATES).join(", ")}

Examples:
  framework export saas ./my-app
  framework export saas ./my-app --auth supabase --payments stripe
  framework export blog ./my-blog --dry-run
  framework export dashboard ./admin --force
`);
    return;
  }

  const flags = parseExportFlags(restArgs || []);
const dryRun = flags.dryRun;

  // Handle --list-integrations flag
  if (flags.listIntegrations) {
    // Validate template exists
    if (!TEMPLATES[templateId]) {
      console.error(`Unknown templateId: ${templateId}`);
      console.error(`Valid templates: ${Object.keys(TEMPLATES).join(", ")}`);
      process.exit(1);
    }
    const templatePath = path.join(PKG_ROOT, "templates", templateId);
    await listAvailableIntegrations(templatePath, templateId);
    return;
  }

  // Validate required args BEFORE resolving template
  if (!projectDir) {
    console.log("Usage: framework export <templateId> <projectDir> [options]\n");
    console.log("Options:");
    console.log("  --name <repoName>    Name for the project (defaults to folder name)");
    console.log("  --remote <gitUrl>    Git remote URL to add as origin");
    console.log("  --push               Push to remote after init (requires --remote)");
    console.log("  --branch <branch>    Branch name (default: main)");
    console.log("  --dry-run            Show what would happen without making changes");
    console.log("  --force              Overwrite existing directory");
    console.log("\nValid templates:", Object.keys(TEMPLATES).join(", "));
    console.log("\nRun 'framework export --help' for more details.");
    process.exit(1);
  }

  // Validate template BEFORE resolving
  if (!TEMPLATES[templateId]) {
    console.error(`Unknown templateId: ${templateId}`);
    console.error(`Valid templates: ${Object.keys(TEMPLATES).join(", ")}`);
    process.exit(1);
  }

  // Now safe to resolve template reference
  const resolved = resolveTemplateRef({
    templateId,
    templateSource: flags.templateSource,
    frameworkVersion: flags.frameworkVersion,
  });

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
    console.log(`Project: ${projectName}`);
    console.log(`Directory: ${absProjectDir}`);
    console.log(`Template: ${templateId}`);
    console.log(`Branch: ${flags.branch}`);
    console.log("");

    // Step 1: Clone template
    console.log(`[1/5] Clone template`);
    if (resolved && resolved.localPath) {
      console.log(`      Source: ${resolved.localPath} (local)`);
    } else {
      console.log(`      Source: ${resolved.remoteRef} (remote)`);
    }
    console.log(`      Destination: ${absProjectDir}`);

    // Step 2: Create files
    console.log(`\n[2/5] Create starter files`);
    console.log(`      - .dd/manifest.json (template metadata)`);
    console.log(`      - README.md (project documentation)`);
    console.log(`      - .gitignore (git exclusions)`);
    console.log(`      - .dd/config.json (framework configuration)`);

    // Check if optional files exist
    const startPromptSrc = path.join(PKG_ROOT, "prompts", "tasks", "framework-start.md");
    const healthSrc = path.join(PKG_ROOT, ".dd", "health.sh");
    const afterInstallSrc = path.join(__dirname, "..", ".dd", "after-install.sh");

    if (fs.existsSync(startPromptSrc)) {
      console.log(`      - START_PROMPT.md (onboarding guide)`);
    }
    if (fs.existsSync(healthSrc)) {
      console.log(`      - .dd/health.sh (health check script)`);
    }
    if (fs.existsSync(afterInstallSrc)) {
      console.log(`      - .dd/after-install.sh (post-export setup hook)`);
    }

    // Step 3: Git operations
    console.log(`\n[3/5] Initialize git repository`);
    console.log(`      git init -b ${flags.branch}`);
    console.log(`      git add -A`);
    console.log(`      git commit -m "Initial commit (exported via dawson-does-framework)"`);

    // Step 4: Remote setup
    console.log(`\n[4/5] Remote setup`);
    if (flags.remote) {
      console.log(`      git remote add origin ${flags.remote}`);
    if (flags.push) {
        console.log(`      git push -u origin ${flags.branch}`);
      }
    } else {
      console.log(`      (skipped - no --remote specified)`);
    }

    // Step 5: Post-export hooks
    console.log(`\n[5/5] Post-export hooks`);
    const afterInstallPolicy = flags.afterInstall || "prompt";
    console.log(`      Policy: ${afterInstallPolicy}`);

    if (!fs.existsSync(afterInstallSrc)) {
      console.log(`      (no after-install.sh found - skipped)`);
    } else if (afterInstallPolicy === "off") {
      console.log(`      (disabled via --after-install off)`);
    } else if (afterInstallPolicy === "auto") {
      console.log(`      Would run: bash .dd/after-install.sh`);
      console.log(`      (installs dependencies, runs setup)`);
    } else {
      console.log(`      Would prompt: "Run first-time setup now?"`);
      console.log(`      (user can accept/decline interactively)`);
    }

    console.log("\n" + "─".repeat(60));
    console.log("DRY RUN complete. No changes made.");
    console.log("Run without --dry-run to execute these operations.");
    return;
  }

  // ---- ACTUAL OPERATIONS (not dry run) ----

  // Execute pre:export hooks
  const preExportContext = {
    templateId,
    projectDir: absProjectDir,
    projectName,
    flags,
  };

  const preExportResult = await executeHooks("pre:export", preExportContext, ".");
  if (!preExportResult.allSucceeded) {
    console.error("\n❌ Pre-export hooks failed:");
    for (const result of preExportResult.results) {
      if (!result.success) {
        console.error(`   ${result.plugin}: ${result.message}`);
      }
    }
    process.exit(1);
  }

  logger.log(`\nExporting template "${templateId}" to "${absProjectDir}"...\n`);

  // Execute pre:export:clone hooks
  const preCloneContext = {
    ...preExportContext,
    resolvedTemplate: resolved,
  };

  const preCloneResult = await executeHooks("pre:export:clone", preCloneContext, ".");
  if (!preCloneResult.allSucceeded) {
    console.error("\n❌ Pre-clone hooks failed:");
    for (const result of preCloneResult.results) {
      if (!result.success) {
        console.error(`   ${result.plugin}: ${result.message}`);
      }
    }
    process.exit(1);
  }

  // 1. Clone template using degit
  logger.startStep("clone", logger.formatStep(1, 5, "Cloning template..."));
  const repoPath = TEMPLATES[templateId];
    // Clone/copy template into the project directory
    if (resolved && resolved.localPath) {
      fse.copySync(resolved.localPath, absProjectDir, {
        overwrite: true,
        errorOnExist: false,
        filter: (src) => {
          const bn = path.basename(src);
          if (bn === "node_modules" || bn === ".git" || bn === ".next") return false;
          return true;
        },
      });
    } else {
      const emitter = degit(resolved.remoteRef, {
        cache: false,
        force: true,
        verbose: true,
      });
      await emitter.clone(absProjectDir);
    }

  logger.stepSuccess("Template cloned");
  // Write template manifest immediately after template clone/copy,
  // before we add starter files (README/.dd extras etc.)
  try {
    const manifestPath = writeManifest(absProjectDir, { templateId, flags, resolved });
    logger.stepSuccess(`Manifest written`);
  } catch (e) {
    logger.error("Error: failed to write template manifest");
    logger.error(e);
    process.exit(1);
  }
  logger.endStep("clone", "     Template ready");

  // Execute post:export:clone hooks
  const postCloneContext = {
    ...preCloneContext,
    manifestPath: path.join(absProjectDir, ".dd", "manifest.json"),
  };

  await executeHooks("post:export:clone", postCloneContext, ".");

  // Apply integrations if any were requested
  const hasIntegrations = Object.values(flags.integrations).some((v) => v);
  if (hasIntegrations) {
    logger.startStep("integrations", logger.formatStep(2, 6, "Applying integrations..."));

    // Determine template path for validation
    const templatePath = resolved.localPath || path.join(PKG_ROOT, "templates", templateId);

    // Validate integrations
    const validation = await validateIntegrations(templatePath, flags.integrations);

    if (validation.warnings.length > 0) {
      logger.stepWarning("Integration warnings:");
      validation.warnings.forEach((w) => logger.stepInfo(`  ⚠️  ${w}`));
    }

    if (!validation.valid) {
      logger.stepError("Integration validation failed:");
      validation.errors.forEach((e) => logger.stepInfo(`  ❌ ${e}`));
      process.exit(1);
    }

    // Apply integrations
    const application = await applyIntegrations(
      absProjectDir,
      templatePath,
      flags.integrations
    );

    if (!application.success) {
      logger.stepError("Failed to apply integrations:");
      application.errors.forEach((e) => logger.stepInfo(`  ❌ ${e}`));
      process.exit(1);
    }

    // Log applied integrations
    for (const integration of application.applied) {
      logger.stepSuccess(
        `${integration.type}/${integration.provider} (v${integration.version}) applied`
      );
      if (integration.postInstallInstructions) {
        logger.stepInfo(`  ℹ️  ${integration.postInstallInstructions}`);
      }
    }

    logger.endStep("integrations", "     Integrations configured");
  }

  // 2. Create starter files
  logger.startStep("files", logger.formatStep(2, 5, "Creating starter files..."));

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
    logger.stepSuccess("README.md created");
  } else {
    logger.stepInfo("README.md already exists, skipped");
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
    logger.stepSuccess(".gitignore created");
  } else {
    logger.stepInfo(".gitignore already exists, skipped");
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
    logger.stepSuccess(".dd/config.json created");
  } else {
    logger.stepInfo(".dd/config.json already exists, skipped");
  }

  // Validate config (warn but don't block)
  const existingConfig = await fse.readJson(ddConfigPath);
  const validation = validateConfig(existingConfig);
  if (!validation.valid) {
    logger.stepWarning("Config validation warnings:");
    validation.errors.forEach(err => logger.stepInfo(`  - ${err}`));
    logger.stepInfo("(Config will still work, but consider fixing these issues)");
  }

  // START_PROMPT.md (copy from package resources if available)
  const startPromptDst = path.join(absProjectDir, "START_PROMPT.md");
  if (!fs.existsSync(startPromptDst)) {
    // Try to locate from installed package
    const startPromptSrc = path.join(PKG_ROOT, "prompts", "tasks", "framework-start.md");
    if (fs.existsSync(startPromptSrc)) {
      await fse.copy(startPromptSrc, startPromptDst);
      logger.stepSuccess("START_PROMPT.md created");
    } else {
      logger.stepInfo("START_PROMPT.md source not found, skipped (this is OK)");
    }
  } else {
    logger.stepInfo("START_PROMPT.md already exists, skipped");
  }

  // .dd/health.sh (copy framework health script if present)
  const srcHealth = path.join(PKG_ROOT, ".dd", "health.sh");
  const dstHealth = path.join(absProjectDir, ".dd", "health.sh");
  try {
    if (fs.existsSync(srcHealth)) {
      await fse.ensureDir(path.dirname(dstHealth));
      await fse.copy(srcHealth, dstHealth, { overwrite: true });
      await fse.chmod(dstHealth, 0o755);
      logger.stepSuccess(".dd/health.sh created");
    } else {
      logger.stepInfo(".dd/health.sh not found in framework package, skipped");
    }
  } catch (e) {
    logger.stepInfo(`failed to copy .dd/health.sh (non-fatal): ${e?.message || e}`);
  }

    // .dd/after-install.sh (copy framework after-install hook if present)
  try {
    const srcAfterInstall = path.join(__dirname, "..", ".dd", "after-install.sh");
    const dstAfterInstall = path.join(absProjectDir, ".dd", "after-install.sh");

    if (fs.existsSync(srcAfterInstall)) {
      fs.copyFileSync(srcAfterInstall, dstAfterInstall);
      fs.chmodSync(dstAfterInstall, 0o755);
      logger.stepSuccess(".dd/after-install.sh created");
    } else {
      logger.stepInfo(".dd/after-install.sh not found in framework package, skipped");
    }
  } catch (e) {
    logger.stepInfo(`failed to copy .dd/after-install.sh (non-fatal): ${e?.message || e}`);
  }

  // Generate .env.example with integration env vars
  const envExamplePath = path.join(absProjectDir, ".env.example");
  if (!fs.existsSync(envExamplePath)) {
    const envLines = [
      "# Environment Variables",
      "# Copy this file to .env.local and fill in your values",
      "",
      "# App Configuration",
      "NEXT_PUBLIC_APP_URL=http://localhost:3000",
      "",
    ];

    // Add integration-specific env vars
    const ints = flags.integrations;
    if (ints.auth === "supabase" || ints.db === "supabase") {
      envLines.push("# Supabase");
      envLines.push("NEXT_PUBLIC_SUPABASE_URL=");
      envLines.push("NEXT_PUBLIC_SUPABASE_ANON_KEY=");
      envLines.push("SUPABASE_SERVICE_ROLE_KEY=");
      envLines.push("");
    }
    if (ints.auth === "clerk") {
      envLines.push("# Clerk");
      envLines.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=");
      envLines.push("CLERK_SECRET_KEY=");
      envLines.push("");
    }
    if (ints.payments === "stripe") {
      envLines.push("# Stripe");
      envLines.push("STRIPE_SECRET_KEY=");
      envLines.push("STRIPE_WEBHOOK_SECRET=");
      envLines.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=");
      envLines.push("");
    }
    if (ints.email === "resend") {
      envLines.push("# Resend");
      envLines.push("RESEND_API_KEY=");
      envLines.push("");
    }
    if (ints.ai === "openai") {
      envLines.push("# OpenAI");
      envLines.push("OPENAI_API_KEY=");
      envLines.push("");
    }
    if (ints.ai === "anthropic") {
      envLines.push("# Anthropic");
      envLines.push("ANTHROPIC_API_KEY=");
      envLines.push("");
    }
    if (ints.analytics === "posthog") {
      envLines.push("# PostHog");
      envLines.push("NEXT_PUBLIC_POSTHOG_KEY=");
      envLines.push("NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com");
      envLines.push("");
    }
    if (ints.storage === "uploadthing") {
      envLines.push("# UploadThing");
      envLines.push("UPLOADTHING_SECRET=");
      envLines.push("UPLOADTHING_APP_ID=");
      envLines.push("");
    }

    await fse.writeFile(envExamplePath, envLines.join("\n"), "utf8");
    logger.stepSuccess(".env.example created");
  } else {
    logger.stepInfo(".env.example already exists, skipped");
  }

  logger.endStep("files", "     Starter files ready");

  // 3. Initialize git (use -b to set initial branch, requires git 2.28+)
  logger.startStep("git-init", logger.formatStep(3, 5, "Initializing git repository..."));
  runIn(absProjectDir, "git", ["init", "-q", "-b", flags.branch]);
  logger.stepSuccess(`Git initialized on branch "${flags.branch}"`);
  logger.endStep("git-init", "     Repository initialized");

  // 4. Commit
  logger.startStep("commit", logger.formatStep(4, 5, "Creating initial commit..."));
  runIn(absProjectDir, "git", ["add", "-A"]);
  runIn(absProjectDir, "git", ["commit", "-q", "-m", "Initial commit (exported via dawson-does-framework)"]);
  logger.stepSuccess("Initial commit created");
  logger.endStep("commit", "     Commit created");

  // 5. Remote + push (optional)
  if (flags.remote) {
    logger.startStep("remote", logger.formatStep(5, 5, "Setting up remote..."));
    let remoteConfigured = false;
    try {
      // Check if origin already exists
      const remoteCheck = spawnSync("git", ["remote", "get-url", "origin"], { cwd: absProjectDir, stdio: "pipe" });
      if (remoteCheck.status === 0) {
        runIn(absProjectDir, "git", ["remote", "set-url", "origin", flags.remote], { stdio: "pipe" });
        logger.stepSuccess(`Remote origin updated to ${flags.remote}`);
      } else {
        runIn(absProjectDir, "git", ["remote", "add", "origin", flags.remote], { stdio: "pipe" });
        logger.stepSuccess(`Remote origin added: ${flags.remote}`);
      }
      remoteConfigured = true;
    } catch (e) {
      logger.stepError(`Failed to configure remote: ${e?.message || e}`);
      logger.stepInfo(`You can add it manually: git remote add origin ${flags.remote}`);
    }

    if (flags.push && remoteConfigured) {
      logger.stepInfo(`Pushing to origin/${flags.branch}...`);
      try {
        runIn(absProjectDir, "git", ["push", "-u", "origin", flags.branch], { stdio: "inherit" });
        logger.stepSuccess(`Pushed to origin/${flags.branch}`);
      } catch {
        logger.stepError("Push failed. You can push manually later.");
      }
    } else if (flags.push && !remoteConfigured) {
      logger.stepError("Push skipped (remote not configured).");
    }
    logger.endStep("remote", "     Remote configured");
  } else {
    logger.log(`[5/5] Remote setup skipped (no --remote provided)`);
  }

  // Execute post:export hooks
  const postExportContext = {
    ...preExportContext,
    manifestPath: path.join(absProjectDir, ".dd", "manifest.json"),
    gitInitialized: true,
    remoteConfigured: !!flags.remote,
  };

  await executeHooks("post:export", postExportContext, ".");

  logger.log(`\n✅ Export complete!\n`);
  await runPostExportHooks({ outDir: absProjectDir, afterInstall: flags.afterInstall });
  logger.log(`Next steps:`);
  logger.log(`  cd ${absProjectDir}`);
  logger.log(`  npm install`);
  logger.log(`  npm run dev`);
  if (!flags.remote) {
    logger.log(`\nTo add a remote later:`);
    logger.log(`  git remote add origin <your-repo-url>`);
    logger.log(`  git push -u origin ${flags.branch}`);
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
  // Skip during test runs to prevent false positives in git status checks
  // NODE_TEST is set by Node.js test runner, CI is set in CI environments
  if (process.env.NODE_TEST || process.env.CI || process.env.SKIP_MAP_REGEN) {
    return
  }

  try {
    // Best-effort; never blocks CLI
    spawnSync("npm", ["run", "framework:map"], { stdio: "ignore" })
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
import { resolveEnabledCaps, requiredEnvKeysForCap, detectConflicts } from "../scripts/orchestrator/capability-engine.mjs";

async function cmdHelp() {
  console.log(`Usage:
  framework help
  framework version
  framework upgrade
  framework start [projectDir]
  framework generate [options]                          # AI-powered project generation
  framework capabilities [projectDir]
  framework phrases [projectDir]
  framework toggle <capId> on|off [projectDir]
  framework figma:parse
  framework cost:summary
  framework doctor [projectDir]
  framework drift [projectDir]
  framework plugin <add|remove|list|hooks|info>
  framework templates <list|search|info|categories|tags>
  framework export <templateId> <projectDir> [options]
  framework pull <token> [output-dir] [options]
  framework <templateId> <projectDir>

Export Options:
  --name <repoName>    Name for the project (defaults to folder name)
  --remote <gitUrl>    Git remote URL to add as origin
  --push               Push to remote after init (requires --remote)
  --branch <branch>    Branch name (default: main)
  --dry-run            Show what would happen without making changes
  --force              Overwrite existing directory

Pull Options:
  --cursor             Generate .cursorrules and START_PROMPT.md for AI
  --open               Open the project in Cursor after scaffolding
  --dry-run            Show what would happen without making changes
  --force              Overwrite existing directory
  --dev                Use localhost:3002 instead of production API

Generate Options:
  -d, --description    Project description (required)
  -n, --name           Project name
  -t, --template       Template to use (saas, flagship-saas, seo-directory)
  --tier               Model tier: fast, balanced, quality (default: balanced)
  -o, --output         Output directory (default: ./)

Valid Templates:
  ${Object.keys(TEMPLATES).join(", ")}

Examples:
  framework help
  framework start
  framework demo                    # Quick export for testing
  framework demo saas ./my-test     # Export saas to ./my-test
  framework capabilities .
  framework phrases .
  framework toggle figma.parse on .
  framework doctor .
  framework export seo-directory ~/Documents/Cursor/my-app
  framework export saas ~/Documents/Cursor/my-saas --remote https://github.com/me/my-saas.git --push
  framework pull fast-lion-1234                      # Pull project from web platform
  framework pull fast-lion-1234 --cursor --open      # Pull with Cursor AI files and open
  framework pull fast-lion-1234 ./my-app --dry-run   # Preview without making changes
  framework generate -d "A fitness app" -n fittrack  # AI-generate a project
  framework generate                                 # Interactive AI generation
`);
}

async function cmdCapabilities(projectDirArg) {
  await ensureFrameworkMapFresh();
  const projectDir = resolveProjectDir(projectDirArg);
  const caps = await resolveEnabledCaps(projectDir);
  const cfg = await loadProjectConfig(projectDir);
  const conflicts = detectConflicts(caps);
  const compliance = checkPlanCompliance(caps, cfg.plan || "free");

  console.log(JSON.stringify({
    projectDir,
    plan: cfg.plan || "free",
    enabled: caps.filter(c => c.enabled).map(c => c.id),
    disabled: caps.filter(c => !c.enabled).map(c => {
      const reqKeys = requiredEnvKeysForCap(c);
      return { id: c.id, reason: (reqKeys.length ? "missing env or overridden off" : "overridden off") };
    }),
    conflicts: conflicts.map(conf => ({
      capA: conf.capA.id,
      capB: conf.capB.id,
      reason: conf.reason
    })),
    planCompliance: {
      compliant: compliance.compliant,
      violations: compliance.violations
    }
  }, null, 2));

  if (conflicts.length > 0) {
    console.log(`\n⚠️  WARNING: ${conflicts.length} capability conflict(s) detected!`);
    conflicts.forEach(conf => {
      console.log(`   - ${conf.reason}`);
    });
    console.log(`\nTo resolve: disable one of the conflicting capabilities in .dd/config.json`);
  }

  if (!compliance.compliant) {
    console.log(`\n⚠️  WARNING: ${compliance.violations.length} plan compliance violation(s) detected!`);
    compliance.violations.forEach(v => {
      console.log(`   - ${v.message}`);
    });
    // Find highest required tier among all violations
    const tierRank = { free: 0, pro: 1, team: 2 };
    const highestTier = compliance.violations.reduce((max, v) => 
      (tierRank[v.requiredTier] || 0) > (tierRank[max] || 0) ? v.requiredTier : max
    , "free");
    console.log(`\nTo resolve: upgrade to ${highestTier} plan or disable these capabilities`);
  }
}

async function cmdPhrases(projectDirArg) {
  await ensureFrameworkMapFresh();
  const projectDir = resolveProjectDir(projectDirArg);
  const caps = await resolveEnabledCaps(projectDir);
  const conflicts = detectConflicts(caps);

  console.log("FRAMEWORK CAPABILITIES (dynamic):\n");
  for (const c of caps) {
    const status = c.enabled ? "ON " : "OFF";
    console.log(`- [${status}] ${c.label} (${c.id})`);
    console.log(`     group: ${c.group}`);
    const reqKeys = requiredEnvKeysForCap(c);
    if (!c.enabled && reqKeys.length) {
      console.log(`     (Enable by setting env: ${reqKeys.join(", ")}, or toggling on in .dd/config.json)`);
    }
  }

  if (conflicts.length > 0) {
    console.log(`\n⚠️  WARNING: ${conflicts.length} capability conflict(s) detected!`);
    conflicts.forEach(conf => {
      console.log(`   - ${conf.reason}`);
    });
    console.log(`\nTo resolve: disable one of the conflicting capabilities using 'framework toggle <capId> off .'`);
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

async function cmdDrift(projectDirArg) {
  const projectDir = resolveProjectDir(projectDirArg);
  const result = detectDrift(projectDir);

  if (result.error) {
    console.log(`❌ ${result.error}`);
    return;
  }

  if (!result.hasDrift) {
    console.log(`✅ No drift detected (${result.unchanged} files unchanged)`);
    return;
  }

  console.log(`⚠️  Drift detected:\n`);

  if (result.added.length > 0) {
    console.log(`   Added (${result.added.length}):`);
    result.added.forEach(f => console.log(`     + ${f}`));
  }

  if (result.modified.length > 0) {
    console.log(`   Modified (${result.modified.length}):`);
    result.modified.forEach(f => console.log(`     ~ ${f}`));
  }

  if (result.deleted.length > 0) {
    console.log(`   Deleted (${result.deleted.length}):`);
    result.deleted.forEach(f => console.log(`     - ${f}`));
  }

  console.log(`\n   Unchanged: ${result.unchanged} files`);
}

async function cmdVersion() {
  const version = getCurrentVersion();
  const packageName = getPackageName();
  console.log(`${packageName} v${version}`);
}

async function cmdCheckpoint(args) {
  const [subcommand, arg1, arg2] = args;

  if (!subcommand || subcommand === "help") {
    console.log(`
Checkpoint Commands (AI Agent Safety):

  framework checkpoint create <description>  Create a checkpoint before major changes
  framework checkpoint list                  List available checkpoints  
  framework checkpoint restore <id>          Restore from a checkpoint
  framework checkpoint cleanup [keep]        Remove old checkpoints (default: keep 5)
  framework checkpoint log                   Show audit log

Examples:
  framework checkpoint create "Before auth refactor"
  framework checkpoint restore agent-checkpoint-1734567890
  framework checkpoint cleanup 3
`);
    return;
  }

  if (subcommand === "create") {
    const description = arg1 || "Manual checkpoint";
    const result = createCheckpoint(description);
    if (result.created) {
      console.log(`✅ ${result.message}`);
      console.log(`   To restore: framework checkpoint restore ${result.id}`);
    } else {
      console.log(`ℹ️  ${result.message}`);
    }
    return;
  }

  if (subcommand === "list") {
    const checkpoints = listCheckpoints();
    if (checkpoints.length === 0) {
      console.log("No checkpoints found.");
      return;
    }
    console.log(`Found ${checkpoints.length} checkpoint(s):\n`);
    for (const cp of checkpoints) {
      console.log(`  ${cp.stashRef} | ${cp.id}`);
      console.log(`    ${cp.description}\n`);
    }
    return;
  }

  if (subcommand === "restore") {
    if (!arg1) {
      console.error("❌ Please provide a checkpoint ID.");
      console.error("   Run 'framework checkpoint list' to see available checkpoints.");
      process.exit(1);
    }
    const result = restoreCheckpoint(arg1);
    if (result.restored) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ ${result.message}`);
      process.exit(1);
    }
    return;
  }

  if (subcommand === "cleanup") {
    const keep = arg1 ? parseInt(arg1, 10) : 5;
    const result = cleanupCheckpoints(keep);
    console.log(`Removed ${result.removed} checkpoint(s), kept ${result.kept}.`);
    return;
  }

  if (subcommand === "log") {
    const log = getAuditLog();
    if (log.length === 0) {
      console.log("No audit log entries.");
      return;
    }
    console.log(`Audit log (${log.length} entries):\n`);
    for (const entry of log.slice(-20)) {
      console.log(`  ${entry.timestamp} | ${entry.action} | ${entry.checkpointId}`);
      if (entry.description) console.log(`    ${entry.description}`);
      if (entry.error) console.log(`    ❌ ${entry.error}`);
    }
    return;
  }

  console.error(`Unknown checkpoint command: ${subcommand}`);
  console.error("Run 'framework checkpoint help' for usage.");
  process.exit(1);
}

async function cmdUpgrade(dryRun = false) {
  console.log(`🔍 Checking for updates${dryRun ? ' (dry-run mode)' : ''}...\n`);

  const result = await checkForUpdates();

  if (result.error) {
    console.error(`❌ Failed to check for updates: ${result.error}`);
    console.error("\nYou can check manually:");
    console.error(`   npm view ${result.packageName || '@jrdaws/framework'} version`);
    process.exit(1);
  }

  console.log(`   Current version: ${result.current}`);
  console.log(`   Latest version:  ${result.latest}`);

  if (!result.hasUpdate) {
    console.log("\n✅ You're already on the latest version!");
    return;
  }

  console.log("\n📦 A new version is available!");

  // Check for breaking changes
  const hasBreakingChanges = result.latest.split('.')[0] !== result.current.split('.')[0];
  if (hasBreakingChanges) {
    console.log("\n⚠️  WARNING: This is a MAJOR version upgrade with potential breaking changes!");
    console.log(`   ${result.current} → ${result.latest}`);
    console.log("\n   Before upgrading:");
    console.log(`   1. Review the changelog: https://github.com/jrdaws/framework/blob/main/CHANGELOG.md`);
    console.log("   2. Backup your project configuration");
    console.log("   3. Test the upgrade in a non-production environment\n");
  }

  if (dryRun) {
    console.log("\n📋 Upgrade Preview (--dry-run):\n");
    console.log("   Actions that would be performed:");
    console.log(`   1. Backup current version: ${result.current}`);
    console.log("   2. Check for configuration migration needs");
    console.log(`   3. Install version: ${result.latest}`);
    console.log("   4. Verify installation succeeded\n");
    console.log("   Configuration files:");
    console.log("   - .dd/config.json (will be backed up if exists)");
    console.log("   - Project-specific settings (preserved)\n");
    console.log("   No changes will be made in dry-run mode.");
    console.log(`\n   To perform the upgrade, run:`);
    console.log(`   ${getUpgradeCommand(result.packageName)}`);
  } else {
    console.log("\n💡 Safety Tips:");
    console.log("   • Preview changes first: framework upgrade --dry-run");
    console.log("   • Your config will be automatically backed up");
    console.log(`   • To rollback: npm install -g ${result.packageName}@${result.current}\n`);
    console.log("To upgrade, run:");
    console.log(`   ${getUpgradeCommand(result.packageName)}`);
    console.log("\nOr use npm:");
    console.log(`   npm install -g ${result.packageName}@latest`);
  }
}

/**
 * Pull a project from the web platform using a token
 * Usage: framework pull <token> [output-dir] [--cursor] [--open] [--dry-run] [--force]
 */
async function cmdPull(token, extraArgs = []) {
  // Handle help
  if (!token || token === "--help" || token === "-h" || token === "help") {
    console.log(`Usage: framework pull <token> [output-dir] [options]

Download a project configuration from the Dawson-Does platform and scaffold it locally.

Arguments:
  token         Project token (e.g., swift-eagle-1234)
  output-dir    Output directory (default: ./<project-name>)

Options:
  --cursor      Generate .cursorrules and START_PROMPT.md for Cursor AI
  --open        Open the project in Cursor after scaffolding
  --dry-run     Show what would happen without making changes
  --force       Overwrite existing directory
  --dev         Use localhost:3002 instead of production API

Examples:
  framework pull swift-eagle-1234
  framework pull swift-eagle-1234 ./my-project
  framework pull swift-eagle-1234 --cursor --open
  framework pull swift-eagle-1234 --dry-run
`);
    if (!token) process.exit(1);
    return;
  }

  // Parse flags
  // First arg after token might be output-dir or a flag
  let outputDir = null;
  let flagArgs = extraArgs;
  
  if (extraArgs[0] && !extraArgs[0].startsWith("--")) {
    outputDir = extraArgs[0];
    flagArgs = extraArgs.slice(1);
  }
  
  const flags = parsePullFlags(flagArgs);
  const apiUrl = getApiUrl(flags.dev);

  logger.log(`\n🔍 Fetching project configuration for token: ${token}...`);
  logger.log(`   API: ${apiUrl}\n`);

  // Fetch project from API
  const result = await fetchProject(token, apiUrl);

  if (!result.success) {
    console.error(`❌ Failed to fetch project: ${result.error}`);

    // Display recovery guidance if provided by API
    if (result.recovery) {
      console.log(`\n💡 ${result.recovery}`);
    } else {
      // Fallback guidance for older API or network errors
      if (result.status === 404) {
        console.log("\nPossible reasons:");
        console.log("  • Token is incorrect or misspelled");
        console.log("  • Project was deleted");
        console.log("  • Token has expired (projects expire after 30 days)");
        console.log("\nTo create a new project, visit:");
        console.log(`  ${apiUrl}/configure`);
      } else if (result.status === 410) {
        console.log("\nProjects created on the web platform expire after 30 days.");
        console.log("Please create a new project at:");
        console.log(`  ${apiUrl}/configure`);
      }
    }

    process.exit(1);
  }

  const project = result.project;

  logger.log(`✅ Found project: "${project.project_name}"`);
  logger.log(`   Template: ${project.template}`);
  logger.log(`   Integrations: ${formatIntegrations(project.integrations)}`);
  if (project.vision) logger.log(`   Vision: ${project.vision.substring(0, 60)}${project.vision.length > 60 ? '...' : ''}`);
  logger.log("");

  // Determine output directory
  const targetDir = outputDir || project.output_dir || `./${project.project_name}`;
  const absTargetDir = path.resolve(targetDir);

  // Check if directory exists
  if (fs.existsSync(absTargetDir)) {
    if (!flags.force) {
      console.error(`❌ Directory already exists: ${absTargetDir}`);
      console.log("\nUse --force to overwrite, or choose a different directory.");
      process.exit(1);
    }
    if (!flags.dryRun) {
      logger.log(`⚠️  Overwriting existing directory (--force)`);
    }
  }

  // Dry run mode
  if (flags.dryRun) {
    console.log("DRY RUN - The following operations would be performed:\n");
    console.log(`Project: ${project.project_name}`);
    console.log(`Token: ${token}`);
    console.log(`Directory: ${absTargetDir}`);
    console.log(`Template: ${project.template}`);
    console.log("");

    console.log(`[1/6] Clone template`);
    console.log(`      Template: ${project.template}`);
    console.log(`      Destination: ${absTargetDir}`);

    console.log(`\n[2/6] Apply integrations`);
    const integrations = project.integrations || {};
    const activeIntegrations = Object.entries(integrations).filter(([, v]) => v);
    if (activeIntegrations.length > 0) {
      for (const [type, provider] of activeIntegrations) {
        console.log(`      - ${type}: ${provider}`);
      }
    } else {
      console.log(`      (no integrations selected)`);
    }

    console.log(`\n[3/6] Write project context`);
    console.log(`      - .dd/context.json (project metadata)`);
    console.log(`      - .dd/manifest.json (template manifest)`);
    if (project.vision) console.log(`      - .dd/vision.md`);
    if (project.mission) console.log(`      - .dd/mission.md`);
    if (project.success_criteria) console.log(`      - .dd/success-criteria.md`);
    if (project.description) console.log(`      - .dd/description.md`);
    if (project.inspirations?.length > 0) console.log(`      - .dd/inspirations.md`);

    console.log(`\n[4/6] Generate environment files`);
    console.log(`      - .env.example (required env vars)`);

    console.log(`\n[5/6] Generate Cursor files`);
    if (flags.cursor) {
      console.log(`      - .cursorrules (AI context)`);
      console.log(`      - START_PROMPT.md (onboarding prompt)`);
    } else {
      console.log(`      (skipped - use --cursor to generate)`);
    }

    console.log(`\n[6/6] Initialize git repository`);
    console.log(`      git init -b main`);
    console.log(`      git add -A`);
    console.log(`      git commit -m "Initial commit (pulled via framework)"`);

    if (flags.open) {
      console.log(`\n[Post] Open in Cursor`);
      console.log(`      Would open: ${absTargetDir}`);
    }

    console.log("\n" + "─".repeat(60));
    console.log("DRY RUN complete. No changes made.");
    console.log("Run without --dry-run to execute these operations.");
    return;
  }

  // ---- ACTUAL OPERATIONS (not dry run) ----

  logger.log(`📦 Exporting to: ${absTargetDir}\n`);

  // Build export flags from project configuration
  const exportFlags = ["--force"]; // Force since we already checked above

  // Add integrations
  if (project.integrations) {
    for (const [type, provider] of Object.entries(project.integrations)) {
      if (provider) {
        exportFlags.push(`--${type}`, provider);
      }
    }
  }

  // Add project name
  if (project.project_name) {
    exportFlags.push("--name", project.project_name);
  }

  // Call the export command with the project configuration
  await cmdExport(project.template, absTargetDir, exportFlags);

  // After export, write additional .dd files with context
  const ddDir = path.join(absTargetDir, ".dd");
  fs.mkdirSync(ddDir, { recursive: true });

  logger.log("");
  logger.startStep("context", "Writing project context...");

  // Write context.json
  const contextData = generateContext(project);
  fs.writeFileSync(
    path.join(ddDir, "context.json"),
    JSON.stringify(contextData, null, 2),
    "utf8"
  );
  logger.stepSuccess("context.json written");

  // Write vision/mission/success criteria if provided
  if (project.vision) {
    fs.writeFileSync(path.join(ddDir, "vision.md"), project.vision, "utf8");
    logger.stepSuccess("vision.md written");
  }

  if (project.mission) {
    fs.writeFileSync(path.join(ddDir, "mission.md"), project.mission, "utf8");
    logger.stepSuccess("mission.md written");
  }

  if (project.success_criteria) {
    fs.writeFileSync(path.join(ddDir, "success-criteria.md"), project.success_criteria, "utf8");
    logger.stepSuccess("success-criteria.md written");
  }

  if (project.description) {
    fs.writeFileSync(path.join(ddDir, "description.md"), project.description, "utf8");
    logger.stepSuccess("description.md written");
  }

  if (project.inspirations && project.inspirations.length > 0) {
    const inspirationsContent = project.inspirations
      .map((insp, idx) => `${idx + 1}. [${insp.type}] ${insp.value}`)
      .join("\n");
    fs.writeFileSync(path.join(ddDir, "inspirations.md"), inspirationsContent, "utf8");
    logger.stepSuccess("inspirations.md written");
  }

  logger.endStep("context", "     Project context ready");

  // Generate .env.example
  logger.startStep("env", "Generating environment template...");
  const envExampleContent = generateEnvExample(project);
  fs.writeFileSync(path.join(absTargetDir, ".env.example"), envExampleContent, "utf8");
  logger.stepSuccess(".env.example generated");

  // Also write .env.local with any provided values
  if (project.env_keys && Object.keys(project.env_keys).length > 0) {
    let envLocalContent = envExampleContent;
    for (const [key, value] of Object.entries(project.env_keys)) {
      if (value) {
        const regex = new RegExp(`${key}=.*`, "g");
        if (envLocalContent.match(regex)) {
          envLocalContent = envLocalContent.replace(regex, `${key}=${value}`);
        } else {
          envLocalContent += `\n${key}=${value}`;
        }
      }
    }
    fs.writeFileSync(path.join(absTargetDir, ".env.local"), envLocalContent, "utf8");
    logger.stepSuccess(".env.local populated with provided values");
  }
  logger.endStep("env", "     Environment files ready");

  // Always generate START_PROMPT.md with project context (P2 fix)
  // This ensures vision/mission/successCriteria are included
  const hasContext = project.vision || project.mission || project.success_criteria || project.description;
  if (hasContext) {
    logger.startStep("start-prompt", "Generating START_PROMPT.md with project context...");
    const startPromptContent = generateStartPrompt(project);
    fs.writeFileSync(path.join(absTargetDir, "START_PROMPT.md"), startPromptContent, "utf8");
    logger.stepSuccess("START_PROMPT.md generated with vision/mission context");
    logger.endStep("start-prompt", "     Start prompt ready");
  }

  // Generate .cursorrules if --cursor flag
  if (flags.cursor) {
    logger.startStep("cursor", "Generating Cursor AI files...");
    
    // Generate .cursorrules
    const cursorRulesContent = generateCursorRules(project);
    fs.writeFileSync(path.join(absTargetDir, ".cursorrules"), cursorRulesContent, "utf8");
    logger.stepSuccess(".cursorrules generated");

    // Also generate START_PROMPT.md if it wasn't already generated above
    if (!hasContext) {
      const startPromptContent = generateStartPrompt(project);
      fs.writeFileSync(path.join(absTargetDir, "START_PROMPT.md"), startPromptContent, "utf8");
      logger.stepSuccess("START_PROMPT.md generated");
    }
    
    logger.endStep("cursor", "     Cursor files ready");
  }

  // Write pull metadata
  const pullMetadata = {
    pulledAt: new Date().toISOString(),
    token: project.token,
    platformUrl: apiUrl,
    template: project.template,
    integrations: project.integrations,
    flags: {
      cursor: flags.cursor,
      open: flags.open,
    },
  };
  fs.writeFileSync(
    path.join(ddDir, "pull-metadata.json"),
    JSON.stringify(pullMetadata, null, 2),
    "utf8"
  );

  // Amend the git commit to include our new files
  try {
    runIn(absTargetDir, "git", ["add", "-A"]);
    runIn(absTargetDir, "git", ["commit", "--amend", "-q", "-m", `Initial commit (pulled via framework: ${token})`]);
  } catch {
    // Non-fatal if git amend fails
    logger.stepInfo("Note: Could not amend git commit with context files");
  }

  logger.log(`\n✅ Project pulled successfully from platform!\n`);
  logger.log(`Token: ${token}`);
  logger.log(`Directory: ${absTargetDir}`);
  logger.log("");

  // Open in Cursor if --open flag
  if (flags.open) {
    logger.log("Opening in Cursor...");
    const opened = openInCursor(absTargetDir);
    if (opened) {
      logger.log("   ✓ Opened in Cursor");
    } else {
      logger.log("   ⚠️  Could not open in Cursor automatically");
      logger.log(`   Open manually: cursor ${absTargetDir}`);
    }
    logger.log("");
  }

  logger.log("Next steps:");
  logger.log(`  cd ${targetDir}`);
  logger.log(`  npm install`);
  logger.log(`  npm run dev`);
  
  if (!flags.cursor) {
    logger.log("");
    logger.log("💡 Tip: Use --cursor flag to generate .cursorrules for AI assistance:");
    logger.log(`  framework pull ${token} --cursor`);
  }
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
  if (a === "drift") { await cmdDrift(b); process.exit(0); }
  if (a === "version") { await cmdVersion(); process.exit(0); }
  if (a === "upgrade") { await cmdUpgrade(b === "--dry-run"); process.exit(0); }
  if (a === "llm") { await cmdLLM([b, c, d]); process.exit(0); }
  if (a === "auth") { await cmdAuth([b, c, d]); process.exit(0); }
  if (a === "plugin") { await cmdPlugin([b, c, d]); process.exit(0); }
  if (a === "templates") { await cmdTemplates([b, c, d]); process.exit(0); }
  if (a === "checkpoint") { await cmdCheckpoint([b, c, d]); process.exit(0); }
  if (a === "deploy") {
    const deployArgs = process.argv.slice(3); // Everything after "framework deploy"
    await cmdDeploy(deployArgs);
    process.exit(0);
  }
  if (a === "generate") {
    const generateArgs = process.argv.slice(3); // Everything after "framework generate"
    await cmdGenerate(generateArgs);
    process.exit(0);
  }
  if (a === "deploy:auth") {
    const authArgs = process.argv.slice(3); // Everything after "framework deploy:auth"
    await cmdDeployAuth(authArgs);
    process.exit(0);
  }
  if (a === "pull") { 
    const pullArgs = process.argv.slice(4); // Everything after "framework pull <token>"
    await cmdPull(b, pullArgs); 
    process.exit(0); 
  }
  if (a === "demo") {
    const restArgs = process.argv.slice(3); // Everything after "demo" (includes templateId)
    await cmdDemo(restArgs);
    process.exit(0);
  }
  if (a === "export") {
    // Handle case where second arg is a flag (like --list-integrations)
    let templateId = b;
    let projectDir = c;
    let restArgs;
    
    if (c && c.startsWith("--")) {
      // No projectDir provided, c is actually a flag
      projectDir = null;
      restArgs = process.argv.slice(4); // Everything after "export <templateId>"
    } else {
      restArgs = process.argv.slice(5); // Everything after "export <templateId> <projectDir>"
    }
    
    await cmdExport(templateId, projectDir, restArgs);
    process.exit(0);
  }

  // otherwise treat as template
  await main(); // <-- your existing template clone flow
}
