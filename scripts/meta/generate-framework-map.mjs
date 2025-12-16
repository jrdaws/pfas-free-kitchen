import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8").trim();
  } catch {
    return "";
  }
}

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readText(p) {
  const full = path.join(ROOT, p);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function safeJson(p) {
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

function listTrackedFiles() {
  const out = sh("git ls-files");
  return out ? out.split("\n").filter(Boolean) : [];
}

function groupByTopLevel(files) {
  const groups = new Map();
  for (const f of files) {
    const top = f.split("/")[0] || ".";
    if (!groups.has(top)) groups.set(top, []);
    groups.get(top).push(f);
  }
  return [...groups.entries()].sort((a,b) => a[0].localeCompare(b[0]));
}

function pickKeyFiles(files) {
  const important = [
    "README.md",
    "DESIGN.md",
    ".cursor/rules.md",
    "orchestrator.config.json",
    ".env.example",
    "bin/framework.js",
    "scripts/orchestrator/capabilities.json",
    "scripts/orchestrator/capability-engine.mjs",
    "scripts/orchestrator/project-config.mjs",
    "scripts/orchestrator/cost.mjs",
    "scripts/orchestrator/cost-summary.mjs",
    "scripts/figma/parse-figma.mjs",
    "prompts/superprompt/v0.1.md",
  ].filter((p) => files.includes(p));

  return important;
}

function summarizeFile(p) {
  const txt = readText(p);
  if (!txt) return "";
  const firstNonEmpty = txt.split("\n").map(l => l.trim()).find(l => l.length > 0) || "";
  return firstNonEmpty.slice(0, 140);
}

function loadCaps() {
  const capsPath = "scripts/orchestrator/capabilities.json";
  if (!exists(capsPath)) return [];
  try {
    const j = JSON.parse(readText(capsPath));
    return Array.isArray(j.caps) ? j.caps : [];
  } catch {
    return [];
  }
}

function nowIso() {
  return new Date().toISOString();
}

function mdEscape(s) {
  return (s || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const pkg = safeJson("package.json") || {};
const repoUrl = (pkg.repository && (pkg.repository.url || pkg.repository)) || "";
const branch = sh("git rev-parse --abbrev-ref HEAD");
const head = sh("git rev-parse --short HEAD");

const files = listTrackedFiles();
const grouped = groupByTopLevel(files);
const keyFiles = pickKeyFiles(files);
const caps = loadCaps();

let out = "";
out += `# Dawson Does Framework Map\n\n`;
out += `Generated: ${nowIso()}\n\n`;
out += `Git: ${mdEscape(branch)} @ ${mdEscape(head)}\n\n`;
if (repoUrl) out += `Repo: ${mdEscape(repoUrl)}\n\n`;

out += `## Purpose\n`;
out += `This file is the "road map" for humans and AI agents to understand the repo structure, entrypoints, capabilities, and how to troubleshoot.\n\n`;

out += `## Entrypoints\n`;
out += `- CLI entry: \`bin/framework.js\`\n`;
out += `- Default template scaffold: \`templates/\`\n`;
out += `- Prompts: \`prompts/\`\n`;
out += `- Scripts/tools: \`scripts/\`\n\n`;

out += `## Key Files\n\n`;
for (const p of keyFiles) {
  const summary = summarizeFile(p);
  out += `- \`${p}\`${summary ? ` - ${mdEscape(summary)}` : ""}\n`;
}
out += `\n`;

out += `## CLI Commands (from capabilities registry)\n\n`;
if (!caps.length) {
  out += `No capabilities registry found or it is empty.\n\n`;
} else {
  out += `| Phrase | Command | Requires Env |\n|---|---|---|\n`;
  for (const c of caps) {
    const phrase = c.phrase || c.id || "";
    const command = c.command || "";
    const req = Array.isArray(c.requiresEnv) ? c.requiresEnv.join(", ") : "";
    out += `| ${mdEscape(phrase)} | \`${mdEscape(command)}\` | ${mdEscape(req)} |\n`;
  }
  out += `\n`;
}

out += `## Project Feature Toggles\n`;
out += `Per-project toggles live at: \`.dd/config.json\` (within a project folder).\n\n`;
out += `Typical flow:\n`;
out += `- \`framework capabilities <projectDir>\`\n`;
out += `- \`framework phrases <projectDir>\`\n`;
out += `- \`framework toggle <capId> on|off <projectDir>\`\n\n`;

out += `## Directory Index (tracked files)\n\n`;
for (const [top, arr] of grouped) {
  const count = arr.length;
  out += `### ${top} (${count})\n`;
  const sample = arr.slice(0, 60);
  for (const f of sample) out += `- \`${f}\`\n`;
  if (arr.length > sample.length) out += `- ... (${arr.length - sample.length} more)\n`;
  out += `\n`;
}

out += `## Troubleshooting Quick Notes\n\n`;
out += `- If CLI breaks, run: \`node bin/framework.js help\` and fix syntax errors first.\n`;
out += `- If optional integrations are missing credentials, the correct behavior is to skip with a clear message.\n`;
out += `- If Figma parsing fails, confirm \`FIGMA_TOKEN\` + \`FIGMA_FILE_KEY\` are set (or run without them).\n\n`;

fs.writeFileSync(path.join(ROOT, "FRAMEWORK_MAP.md"), out, "utf8");
