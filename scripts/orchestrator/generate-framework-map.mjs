import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function sh(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
}

function safeRead(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}

function listGitFiles() {
  const out = sh("git ls-files");
  return out.split("\n").map(s => s.trim()).filter(Boolean);
}

function summarizeTree(files) {
  const top = new Map();
  for (const f of files) {
    const parts = f.split("/");
    const k = parts[0];
    top.set(k, (top.get(k) || 0) + 1);
  }
  const rows = [...top.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`- \`${k}/\` (${v} files)`);
  return rows.join("\n");
}

function extractCliCommands(frameworkJs) {
  const cmds = new Set();
  const re = /if\s*\(\s*a\s*===\s*["'`](.+?)["'`]\s*\)/g;
  let m;
  while ((m = re.exec(frameworkJs))) cmds.add(m[1]);
  return [...cmds].sort();
}

function loadCapabilities() {
  const p = path.resolve("scripts/orchestrator/capabilities.json");
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

const files = listGitFiles();
const now = new Date().toISOString();
const lastCommit = sh("git log -1 --pretty=format:%H").trim();

const frameworkJs = safeRead(path.resolve("bin/framework.js"));
const cliCommands = frameworkJs ? extractCliCommands(frameworkJs) : [];

const caps = loadCapabilities();

const important = [
  "README.md",
  "DESIGN.md",
  ".cursor/rules.md",
  "prompts/superprompt/v0.1.md",
  "orchestrator.config.json",
  "scripts/orchestrator/capabilities.json",
  "scripts/orchestrator/capability-engine.mjs",
  "scripts/orchestrator/project-config.mjs",
  "scripts/figma/parse-figma.mjs",
  "bin/framework.js"
].filter(f => files.includes(f));

const out = [];
out.push(`# Dawson Does Framework Map`);
out.push(``);
out.push(`Last generated: \`${now}\``);
out.push(`Repo HEAD: \`${lastCommit}\``);
out.push(``);
out.push(`## What this is`);
out.push(`This file is a living roadmap for humans + AI agents: structure, entrypoints, commands, key docs, and where to modify things safely.`);
out.push(``);
out.push(`## Top-level structure (tracked files)`);
out.push(summarizeTree(files));
out.push(``);
out.push(`## Key entrypoints`);
out.push(`- CLI: \`bin/framework.js\``);
out.push(`- Prompts: \`prompts/\``);
out.push(`- Templates: \`templates/\``);
out.push(`- Automation scripts: \`scripts/\``);
out.push(`- Cursor rules: \`.cursor/rules.md\``);
out.push(``);
out.push(`## “Start here” docs`);
for (const f of important) out.push(`- \`${f}\``);
out.push(``);
out.push(`## CLI commands detected`);
if (cliCommands.length === 0) out.push(`- (none detected)`); 
else for (const c of cliCommands) out.push(`- \`framework ${c}\``);
out.push(``);
out.push(`## Capability registry`);
if (!caps || !caps.caps) {
  out.push(`- No capability registry found (expected at \`scripts/orchestrator/capabilities.json\`).`);
} else {
  for (const c of caps.caps) {
    out.push(`- \`${c.id}\` (${c.phrase})`);
    out.push(`  - Command: \`${c.command}\``);
    out.push(`  - Requires env: \`${(c.requiresEnv || []).join(", ") || "none"}\``);
  }
}
out.push(``);
out.push(`## Update rules (for agents)`);
out.push(`- Any new script/feature should update:`);
out.push(`  - \`scripts/orchestrator/capabilities.json\` (capability + phrase + command)`);
out.push(`  - \`bin/framework.js\` (wire command)`);
out.push(`  - \`prompts/superprompt/v0.1.md\` (capability negotiation guidance if needed)`);
out.push(`- Never break “optional integrations”: missing env must not block.`);
out.push(``);

fs.writeFileSync(path.resolve("docs/FRAMEWORK_MAP.md"), out.join("\n"), "utf8");
console.log("Wrote docs/FRAMEWORK_MAP.md");
