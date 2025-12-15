#!/usr/bin/env node
import degit from "degit";
import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";

const TEMPLATE_MAP = {
  "seo-directory": "jrdaws/dawson-does-framework/templates/seo-directory",
  "saas": "jrdaws/dawson-does-framework/templates/saas",
  "internal-tool": "jrdaws/dawson-does-framework/templates/internal-tool",
  "automation": "jrdaws/dawson-does-framework/templates/automation"
};

function usage() {
  console.log("Usage:");
  console.log("  npx @jrdaws/framework <templateId> <projectDir>");
  console.log("Example:");
  console.log("  npx @jrdaws/framework seo-directory my-project");
}

async function main() {
  const templateId = process.argv[2];
  const projectDir = process.argv[3];

  if (!templateId || !projectDir) {
    usage();
    process.exit(1);
  }

  const repoPath = TEMPLATE_MAP[templateId];
  if (!repoPath) {
    console.error(`Unknown templateId: ${templateId}`);
    console.error(`Valid: ${Object.keys(TEMPLATE_MAP).join(", ")}`);
    process.exit(1);
  }

  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    console.error(`Target directory "${projectDir}" exists and is not empty.`);
    process.exit(1);
  }

  console.log(`Cloning template "${templateId}" into "${projectDir}"...`);
  const emitter = degit(repoPath, { cache: false, force: true, verbose: true });
  await emitter.clone(projectDir);

  // Ensure env example exists
  const envExample = path.join(projectDir, ".env.local.example");
  if (!fs.existsSync(envExample)) {
    fs.writeFileSync(envExample, "OPENAI_API_KEY=\nANTHROPIC_API_KEY=\n", "utf8");
  }

  // Copy your superprompt into the new project root
  const superPromptSrc = path.resolve("prompts/superprompt/v0.1.md");
  const superPromptDst = path.join(projectDir, "SUPER_PROMPT.md");
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * framework start <projectDir?>
 * - prints prompts/tasks/framework-start.md
 * - optionally writes START_PROMPT.md into project dir
 */
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

/**
 * Simple dispatcher:
 * - framework start <projectDir?>
 * - framework <templateId> <projectDir>
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , a, b, c] = process.argv;

  if (a === "start") {
    await cmdStart(b);
    process.exit(0);
  }
}
