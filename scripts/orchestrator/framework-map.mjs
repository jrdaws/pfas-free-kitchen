import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const ENTRY = path.resolve("bin/framework.js");
const OUT = path.resolve("FRAMEWORK_MAP.md");

const EXT_CANDIDATES = [".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".mts", ".cts"];

// --------- capability metadata (edit this as you grow) ----------
const CAPABILITY_RULES = [
  {
    id: "cli.core",
    tier: "free",
    optional: false,
    color: "🟦",
    match: (p) => p.endsWith("bin/framework.js"),
  },
  {
    id: "figma.parse",
    tier: "pro",
    optional: true,
    color: "🟣",
    match: (p) => p.includes("/scripts/figma/"),
  },
  {
    id: "cost.logging",
    tier: "pro",
    optional: true,
    color: "🟠",
    match: (p) => p.includes("/scripts/orchestrator/cost"),
  },
  {
    id: "capabilities.engine",
    tier: "free",
    optional: false,
    color: "🟩",
    match: (p) =>
      p.includes("/scripts/orchestrator/capability") ||
      p.includes("/scripts/orchestrator/project-config") ||
      p.includes("/scripts/orchestrator/capabilities.json"),
  },
  {
    id: "templates",
    tier: "free",
    optional: false,
    color: "🟨",
    match: (p) => p.includes("/templates/"),
  },
];

function norm(p) {
  return p.replaceAll("\\", "/");
}

function rel(p) {
  return norm(path.relative(ROOT, p));
}

function capFor(filePathAbs) {
  const r = rel(filePathAbs);
  for (const rule of CAPABILITY_RULES) {
    if (rule.match(r)) return rule;
  }
  return { id: "unknown", tier: "free", optional: false, color: "⬜" };
}

function readText(p) {
  return fs.readFileSync(p, "utf8");
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function resolveImport(fromFileAbs, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;

  const fromDir = path.dirname(fromFileAbs);
  let target = spec.startsWith("/")
    ? path.resolve(ROOT, "." + spec)
    : path.resolve(fromDir, spec);

  // If spec includes extension and exists
  if (exists(target) && fs.statSync(target).isFile()) return target;

  // Try extension candidates
  for (const ext of EXT_CANDIDATES) {
    if (exists(target + ext) && fs.statSync(target + ext).isFile()) return target + ext;
  }

  // If it’s a directory, try index.*
  if (exists(target) && fs.statSync(target).isDirectory()) {
    for (const ext of EXT_CANDIDATES) {
      const idx = path.join(target, "index" + ext);
      if (exists(idx) && fs.statSync(idx).isFile()) return idx;
    }
  }

  return null;
}

function extractImports(code) {
  const imports = new Set();

  // import ... from "x"
  const re1 = /\bimport\s+[^;]*?\s+from\s+["']([^"']+)["']/g;
  // import("x")
  const re2 = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  // require("x")
  const re3 = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(code))) imports.add(m[1]);
  }
  return [...imports];
}

function buildGraph(entryAbs) {
  const adj = new Map(); // fileAbs -> Set(fileAbs)
  const all = new Set();
  const q = [entryAbs];
  all.add(entryAbs);

  while (q.length) {
    const cur = q.shift();
    const code = readText(cur);
    const specs = extractImports(code);
    const children = new Set();

    for (const spec of specs) {
      const resolved = resolveImport(cur, spec);
      if (!resolved) continue;
      children.add(resolved);
      if (!all.has(resolved)) {
        all.add(resolved);
        q.push(resolved);
      }
    }

    adj.set(cur, children);
  }

  // ensure every node has a set
  for (const n of all) if (!adj.has(n)) adj.set(n, new Set());
  return adj;
}

function bfsLevels(adj, entryAbs) {
  const dist = new Map();
  const parent = new Map();
  const levels = new Map(); // depth -> array

  const q = [entryAbs];
  dist.set(entryAbs, 0);
  parent.set(entryAbs, null);

  while (q.length) {
    const cur = q.shift();
    const d = dist.get(cur) ?? 0;
    if (!levels.has(d)) levels.set(d, []);
    levels.get(d).push(cur);

    for (const ch of adj.get(cur) ?? []) {
      if (!dist.has(ch)) {
        dist.set(ch, d + 1);
        parent.set(ch, cur);
        q.push(ch);
      }
    }
  }

  return { levels, dist, parent };
}

function renderBfsOutline(levels) {
  const depths = [...levels.keys()].sort((a, b) => a - b);
  const lines = [];
  for (const d of depths) {
    lines.push(`### Depth ${d}`);
    for (const n of levels.get(d)) {
      const cap = capFor(n);
      lines.push(`- ${cap.color} \`${rel(n)}\`  _(${cap.id}, ${cap.tier}${cap.optional ? ", optional" : ""})_`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// BFS but grouped as parent -> children, level by level
function renderBfsGrouped(adj, levels) {
  const depths = [...levels.keys()].sort((a, b) => a - b);
  const lines = [];
  for (const d of depths) {
    lines.push(`### Depth ${d} (parents grouped)`);
    for (const parent of levels.get(d)) {
      const capP = capFor(parent);
      lines.push(`- ${capP.color} \`${rel(parent)}\`  _(${capP.id}, ${capP.tier}${capP.optional ? ", optional" : ""})_`);
      const children = [...(adj.get(parent) ?? [])].sort();
      if (!children.length) {
        lines.push(`  - (no local imports)`);
      } else {
        for (const ch of children) {
          const capC = capFor(ch);
          lines.push(`  - ${capC.color} \`${rel(ch)}\`  _(${capC.id}, ${capC.tier}${capC.optional ? ", optional" : ""})_`);
        }
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

// Structural tree (DFS). De-dupe with backrefs.
function renderStructuralTree(adj, entryAbs) {
  const seen = new Set();
  const lines = [];

  function walk(node, prefix, isLast) {
    const cap = capFor(node);
    const label = `${cap.color} \`${rel(node)}\`  _(${cap.id}, ${cap.tier}${cap.optional ? ", optional" : ""})_`;

    lines.push(prefix + (prefix ? (isLast ? "└─ " : "├─ ") : "") + label);

    if (seen.has(node)) {
      lines.push(prefix + (prefix ? (isLast ? "   " : "│  ") : "") + "↩︎ (already shown above)");
      return;
    }
    seen.add(node);

    const kids = [...(adj.get(node) ?? [])].sort();
    const nextPrefix = prefix + (prefix ? (isLast ? "   " : "│  ") : "");
    kids.forEach((k, i) => walk(k, nextPrefix, i === kids.length - 1));
  }

  walk(entryAbs, "", true);
  return lines.join("\n");
}

function buildReverseGraph(adj) {
  const rev = new Map(); // node -> Set(parents)
  for (const [p, kids] of adj.entries()) {
    for (const k of kids) {
      if (!rev.has(k)) rev.set(k, new Set());
      rev.get(k).add(p);
    }
  }
  // ensure every node exists
  for (const n of adj.keys()) if (!rev.has(n)) rev.set(n, new Set());
  return rev;
}

function renderReverseGraph(rev) {
  const nodes = [...rev.keys()].sort();
  const lines = [];
  for (const n of nodes) {
    const capN = capFor(n);
    const deps = [...rev.get(n)].sort();
    lines.push(`- ${capN.color} \`${rel(n)}\``);
    if (!deps.length) {
      lines.push(`  - (no dependents)`);
    } else {
      for (const d of deps) {
        const capD = capFor(d);
        lines.push(`  - ${capD.color} \`${rel(d)}\``);
      }
    }
  }
  return lines.join("\n");
}

function renderLegend() {
  const byId = new Map();
  for (const r of CAPABILITY_RULES) byId.set(r.id, r);
  const ids = [...byId.keys()].sort();

  const lines = [];
  lines.push(`- 🟦 \`cli.core\` (free, required)`);
  for (const id of ids) {
    if (id === "cli.core") continue;
    const r = byId.get(id);
    lines.push(`- ${r.color} \`${r.id}\` (${r.tier}${r.optional ? ", optional" : ""})`);
  }
  lines.push(`- ⬜ \`unknown\` (free, fallback)`);
  return lines.join("\n");
}

function recentChanges() {
  try {
    const out = execSync(`git log -n 15 --date=short --pretty=format:"- %ad %h %s"`, {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString("utf8");
    return out.trim() || "(no recent commits)";
  } catch {
    return "(git log unavailable)";
  }
}

function main() {
  if (!exists(ENTRY)) {
    console.error(`Missing entrypoint: ${ENTRY}`);
    process.exit(1);
  }

  const adj = buildGraph(ENTRY);
  const { levels } = bfsLevels(adj, ENTRY);
  const rev = buildReverseGraph(adj);

  const md = [];
  md.push(`# FRAMEWORK_MAP`);
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push(`Entrypoint: \`${rel(ENTRY)}\``);
  md.push("");

  md.push(`## Legend`);
  md.push(renderLegend());
  md.push("");

  md.push(`## Recent changes`);
  md.push(recentChanges());
  md.push("");

  md.push(`## Call Graph (Execution BFS)`);
  md.push(`Used for: Runtime reasoning - Blast-radius analysis - Debugging`);
  md.push("");

  md.push(`### BFS outline (levels)`);
  md.push(renderBfsOutline(levels));
  md.push("");

  md.push(`### BFS grouped (tree-like, parent -> children, still BFS-layered)`);
  md.push(renderBfsGrouped(adj, levels));
  md.push("");

  md.push(`## Dependency Tree (Structural)`);
  md.push(`Used for: Onboarding - Refactors - Capability ownership`);
  md.push("");
  md.push("```");
  md.push(renderStructuralTree(adj, ENTRY));
  md.push("```");
  md.push("");

  md.push(`## Reverse graph (what depends on this file)`);
  md.push("");
  md.push(renderReverseGraph(rev));
  md.push("");

  fs.writeFileSync(OUT, md.join("\n"), "utf8");
  console.log(`Wrote ${rel(OUT)}`);
}

main();
