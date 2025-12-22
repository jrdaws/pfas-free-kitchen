import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "node:child_process";

const REPO_ROOT = process.cwd();
const ENTRY = path.join(REPO_ROOT, "bin", "framework.js");
const CAPS_PATH = path.join(REPO_ROOT, "scripts", "orchestrator", "capabilities.json");
const OUT = path.join(REPO_ROOT, "FRAMEWORK_MAP.md");

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function listAllFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === ".next") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else out.push(p);
    }
  }
  return out;
}

function sha1(s) {
  return crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
}

function extractImports(code) {
  const imports = new Set();
  const re1 = /\bimport\s+(?:[^'"]+from\s+)?["']([^"']+)["']/g;
  const re2 = /\brequire\(\s*["']([^"']+)["']\s*\)/g;
  const re3 = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(code))) imports.add(m[1]);
  }
  return [...imports];
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;
  const base = spec.startsWith("/") ? path.join(REPO_ROOT, spec) : path.resolve(path.dirname(fromFile), spec);
  const cands = [
    base,
    base + ".js",
    base + ".mjs",
    base + ".cjs",
    base + ".ts",
    base + ".tsx",
    path.join(base, "index.js"),
    path.join(base, "index.mjs"),
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ];
  for (const c of cands) if (exists(c) && fs.statSync(c).isFile()) return c;
  return null;
}

function buildGraphs(entry) {
  const edges = new Map();
  const reverse = new Map();
  const seen = new Set();
  const q = [entry];

  while (q.length) {
    const f = q.shift();
    if (seen.has(f)) continue;
    seen.add(f);

    const code = readText(f);
    const specs = extractImports(code);
    const kids = [];

    for (const s of specs) {
      const r = resolveImport(f, s);
      if (!r) continue;
      kids.push(r);
      if (!reverse.has(r)) reverse.set(r, new Set());
      reverse.get(r).add(f);
      q.push(r);
    }

    edges.set(f, kids);
  }

  return { edges, reverse };
}

function bfsOutline(entry, edges) {
  const out = [];
  const q = [entry];
  const dist = new Map([[entry, 0]]);
  while (q.length) {
    const n = q.shift();
    const d = dist.get(n) ?? 0;
    out.push({ file: n, depth: d });
    for (const k of edges.get(n) ?? []) {
      if (!dist.has(k)) {
        dist.set(k, d + 1);
        q.push(k);
      }
    }
  }
  return out;
}

function treeView(entry, edges) {
  const lines = [];
  const visited = new Set();

  function walk(node, prefix) {
    lines.push(prefix + node);
    if (visited.has(node)) return;
    visited.add(node);
    const kids = edges.get(node) ?? [];
    for (let i = 0; i < kids.length; i++) {
      const isLast = i === kids.length - 1;
      const p2 = prefix + (isLast ? "   " : "│  ");
      const branch = prefix + (isLast ? "└─ " : "├─ ");
      lines.push(branch + kids[i]);
      walk(kids[i], p2);
    }
  }

  walk(entry, "");
  return lines;
}

function loadCaps() {
  const raw = JSON.parse(readText(CAPS_PATH));
  const caps = raw.caps || [];
  const byPath = new Map();
  for (const c of caps) {
    for (const p of c.paths || []) {
      const abs = path.join(REPO_ROOT, p);
      if (!byPath.has(abs)) byPath.set(abs, []);
      byPath.get(abs).push(c);
    }
  }
  return { caps, byPath };
}

function formatCapBadges(capsForFile) {
  return (capsForFile || []).map(c => {
    const opt = c.optional ? "optional" : "required";
    return `${c.id} [${c.tier}/${opt}/${c.color}]`;
  });
}

function rel(p) {
  return path.relative(REPO_ROOT, p);
}

function recentChanges(n = 20) {
  try {
    // Fetch more commits to account for filtered ones
    const out = execSync(`git log -n ${n * 2} --pretty=format:%h\\ %ad\\ %s --date=short`, { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString();
    const lines = out.trim().split("\n");
    // Exclude map-update commits to avoid circular dependency
    const filtered = lines.filter(line => {
      const lower = line.toLowerCase();
      // Filter: framework_map, framework-map, framework:map, and FRAMEWORK_MAP.md
      return !lower.includes("framework_map") && 
             !lower.includes("framework-map") && 
             !lower.includes("framework:map");
    });
    return filtered.slice(0, n);
  } catch {
    return [];
  }
}

function main() {
  if (!exists(ENTRY)) {
    console.error("Missing entry:", ENTRY);
    process.exit(1);
  }
  if (!exists(CAPS_PATH)) {
    console.error("Missing capabilities.json:", CAPS_PATH);
    process.exit(1);
  }

  const { edges, reverse } = buildGraphs(ENTRY);
  const outline = bfsOutline(ENTRY, edges);
  const tree = treeView(ENTRY, edges);
  const { caps, byPath } = loadCaps();
  const changes = recentChanges(25);

  const allFiles = listAllFiles(REPO_ROOT);
  const capCoverage = caps.map(c => ({
    id: c.id,
    tier: c.tier,
    optional: c.optional,
    color: c.color,
    phrase: c.phrase,
    command: c.command,
    paths: c.paths || []
  }));

  const lines = [];
  lines.push(`# FRAMEWORK_MAP`);
  lines.push(``);
  lines.push(`Generated: (deterministic)`);
  lines.push(`Hash: ${sha1(outline.map(x=>x.file).join("|"))}`);
  lines.push(``);

  lines.push(`## Recent changes`);
  if (changes.length) lines.push(...changes.map(l => `- ${l}`));
  else lines.push(`- (git log unavailable)`);
  lines.push(``);

  // Agent Governance Structure
  const agentPoliciesPath = path.join(REPO_ROOT, "prompts", "agents", "AGENT_POLICIES.md");
  if (exists(agentPoliciesPath)) {
    lines.push(`## Agent Governance Structure`);
    lines.push(``);
    lines.push(`The project uses a role-based agent system for AI-assisted development.`);
    lines.push(``);
    lines.push(`### Core Governance Documents`);
    lines.push(``);
    lines.push(`| File | Purpose | Version |`);
    lines.push(`|------|---------|---------|`);
    lines.push(`| \`AGENT_CONTEXT.md\` | Mandatory context for all agents, verification test | Required reading |`);
    lines.push(`| \`CLAUDE.md\` | Claude Code CLI auto-loaded instructions | Auto-loaded |`);
    lines.push(`| \`prompts/agents/AGENT_POLICIES.md\` | Universal agent policies and protocols | v1.0 |`);
    lines.push(`| \`prompts/agents/HANDOFF_TEMPLATE.md\` | Template for cross-agent handoffs | - |`);
    lines.push(``);
    lines.push(`### Agent Roles`);
    lines.push(``);
    lines.push(`7 specialized agents with distinct domains:`);
    lines.push(``);
    lines.push(`| Role | Files | Domain | Key Responsibilities |`);
    lines.push(`|------|-------|--------|---------------------|`);
    lines.push(`| **CLI Agent** | \`prompts/agents/roles/CLI_AGENT.md\` | \`bin/framework.js\`, \`src/dd/*.mjs\`, \`src/commands/*.mjs\` | CLI commands, core framework logic, integrations system |`);
    lines.push(`| **Website Agent** | \`prompts/agents/roles/WEBSITE_AGENT.md\` | \`website/\`, Next.js app | Web configurator, UI components, API routes |`);
    lines.push(`| **Template Agent** | \`prompts/agents/roles/TEMPLATE_AGENT.md\` | \`templates/\`, \`template.json\` | Starter templates, template structure, content |`);
    lines.push(`| **Integration Agent** | \`prompts/agents/roles/INTEGRATION_AGENT.md\` | \`src/platform/providers/\` | Auth, payments, analytics, third-party integrations |`);
    lines.push(`| **Documentation Agent** | \`prompts/agents/roles/DOCUMENTATION_AGENT.md\` | \`docs/\`, \`*.md\`, governance | User docs, guides, agent context, governance |`);
    lines.push(`| **Testing Agent** | \`prompts/agents/roles/TESTING_AGENT.md\` | \`tests/\`, CI/CD | Unit tests, E2E tests, coverage, quality assurance |`);
    lines.push(`| **Platform Agent** | \`prompts/agents/roles/PLATFORM_AGENT.md\` | \`packages/\`, API routes | Platform APIs, deployment, preview, packages |`);
    lines.push(``);
    lines.push(`### Agent Memory System`);
    lines.push(``);
    lines.push(`Session continuity tracked in \`prompts/agents/memory/\`:`);
    lines.push(``);
    lines.push(`- \`CLI_MEMORY.md\` - CLI Agent session history`);
    lines.push(`- \`WEBSITE_MEMORY.md\` - Website Agent session history`);
    lines.push(`- \`TEMPLATE_MEMORY.md\` - Template Agent session history`);
    lines.push(`- \`INTEGRATION_MEMORY.md\` - Integration Agent session history`);
    lines.push(`- \`DOCUMENTATION_MEMORY.md\` - Documentation Agent session history`);
    lines.push(`- \`TESTING_MEMORY.md\` - Testing Agent session history`);
    lines.push(`- \`PLATFORM_MEMORY.md\` - Platform Agent session history`);
    lines.push(``);
    lines.push(`Each memory file tracks:`);
    lines.push(`- Current priorities`);
    lines.push(`- Known blockers`);
    lines.push(`- Session history with date, work completed, next steps`);
    lines.push(`- Handoff notes for continuity`);
    lines.push(``);
    lines.push(`### Agent Initialization Flow`);
    lines.push(``);
    lines.push(`\`\`\``);
    lines.push(`1. Read AGENT_CONTEXT.md (mandatory)`);
    lines.push(`2. Pass verification test (5 questions)`);
    lines.push(`3. Read AGENT_POLICIES.md`);
    lines.push(`4. Identify role from task assignment`);
    lines.push(`5. Load role file: prompts/agents/roles/[ROLE]_AGENT.md`);
    lines.push(`6. Load memory: prompts/agents/memory/[ROLE]_MEMORY.md`);
    lines.push(`7. Establish continuity from previous sessions`);
    lines.push(`8. Confirm ready and begin work`);
    lines.push(`\`\`\``);
    lines.push(``);
    lines.push(`### Session Completion Protocol`);
    lines.push(``);
    lines.push(`Every agent must:`);
    lines.push(`1. Update their memory file with session entry`);
    lines.push(`2. Run \`npm test\` before committing`);
    lines.push(`3. Provide summary of work completed`);
    lines.push(`4. Document blockers and next priorities`);
    lines.push(`5. Provide handoff notes if cross-role work needed`);
    lines.push(``);
    lines.push(`### Code Standards by Agent`);
    lines.push(``);
    lines.push(`- **CLI Agent**: JavaScript (.mjs), no semicolons, 2-space indent, use \`logger.mjs\``);
    lines.push(`- **Website/Platform Agents**: TypeScript (.ts/.tsx), semicolons, 2-space indent`);
    lines.push(`- **All Agents**: Conventional commits, run tests before commit, update docs`);
    lines.push(``);
    lines.push(`### Governance Version`);
    lines.push(``);
    lines.push(`- **Version**: 1.0`);
    lines.push(`- **Created**: 2025-12-22`);
    lines.push(`- **Status**: Operational`);
    lines.push(``);
  }

  lines.push(`## Capability registry`);
  lines.push(`| id | tier | optional | color | phrase | command | paths |`);
  lines.push(`|---|---|---:|---|---|---|---|`);
  for (const c of capCoverage) {
    const pathsStr = (c.paths || []).map(p => `\`${p}\``).join(", ");
    lines.push(`| \`${c.id}\` | \`${c.tier}\` | ${c.optional ? "yes" : "no"} | \`${c.color}\` | ${c.phrase} | \`${c.command}\` | ${pathsStr} |`);
  }
  lines.push(``);

  lines.push(`## Call Graph (Execution BFS)`);
  lines.push(`Used for: runtime reasoning, blast-radius analysis, debugging`);
  lines.push(``);
  for (const x of outline) {
    const r = path.relative(REPO_ROOT, x.file);
    const badges = formatCapBadges(byPath.get(x.file));
    const badgeStr = badges.length ? `  -  ${badges.join(", ")}` : "";
    lines.push(`${"  ".repeat(x.depth)}- \`${r}\`${badgeStr}`);
  }
  lines.push(``);

  lines.push(`## Dependency Tree (Structural)`);
  lines.push(`Used for: onboarding, refactors, capability ownership`);
  lines.push(``);
  for (const t of tree) {
    const p = t.replace(REPO_ROOT + path.sep, "");
    const abs = path.join(REPO_ROOT, p);
    const badges = formatCapBadges(byPath.get(abs));
    const badgeStr = badges.length ? `  -  ${badges.join(", ")}` : "";
    lines.push(`- \`${p}\`${badgeStr}`);
  }
  lines.push(``);

  lines.push(`## Reverse graph (What depends on this file)`);
  lines.push(``);
  const nodes = [...new Set(outline.map(x => x.file))];
  for (const n of nodes) {
    const deps = [...(reverse.get(n) || [])].map(rel);
    if (!deps.length) continue;
    lines.push(`- \`${rel(n)}\` <- ${deps.map(d => `\`${d}\``).join(", ")}`);
  }
  lines.push(``);

  lines.push(`## Notes`);
  lines.push(`- Optional integrations should never block progress. If env is missing, skip with a clear message.`);
  lines.push(``);

  fs.writeFileSync(OUT, lines.join("\n") + "\n", "utf8");
  console.log("Wrote:", OUT);
}

main();
