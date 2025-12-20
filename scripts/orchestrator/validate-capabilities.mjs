import fs from "node:fs";
import path from "node:path";
import { CapabilitiesFileSchema } from "./capabilities.schema.mjs";

function fail(msg) {
  console.error("❌", msg);
  process.exit(1);
}

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function buildGraph(caps) {
  const byId = new Map(caps.map((c) => [c.id, c]));
  return { byId };
}

function detectCycles(caps) {
  const byId = new Map(caps.map((c) => [c.id, c]));
  const visiting = new Set();
  const visited = new Set();

  function dfs(id, stack = []) {
    if (visiting.has(id)) return [true, [...stack, id]];
    if (visited.has(id)) return [false, []];
    visiting.add(id);

    const cap = byId.get(id);
    if (!cap) return [false, []];

    for (const dep of cap.requires || []) {
      const [cyc, cycStack] = dfs(dep, [...stack, id]);
      if (cyc) return [true, cycStack];
    }

    visiting.delete(id);
    visited.add(id);
    return [false, []];
  }

  for (const c of caps) {
    const [cyc, stack] = dfs(c.id, []);
    if (cyc) return stack;
  }
  return null;
}

function validateConflicts(caps) {
  const byId = new Map(caps.map((c) => [c.id, c]));
  for (const c of caps) {
    for (const x of c.conflicts || []) {
      if (!byId.has(x)) fail(`Capability "${c.id}" conflicts with missing id "${x}"`);
      const other = byId.get(x);
      // recommend symmetric but not required
      if (!(other.conflicts || []).includes(c.id)) {
        console.warn(`⚠️  conflict is not symmetric: "${c.id}" conflicts "${x}" but not vice versa`);
      }
    }
  }
}

function validateDepsExist(caps) {
  const byId = new Map(caps.map((c) => [c.id, c]));
  for (const c of caps) {
    for (const dep of c.requires || []) {
      if (!byId.has(dep)) fail(`Capability "${c.id}" requires missing id "${dep}"`);
    }
  }
}

function validateUniqueIds(caps) {
  const seen = new Set();
  for (const c of caps) {
    if (seen.has(c.id)) fail(`Duplicate capability id "${c.id}"`);
    seen.add(c.id);
  }
}

function validateFilesOwned(caps) {
  // light check: must not be empty for "code" capabilities (optional)
  // keep simple for now
  return true;
}

const capPath = path.resolve("scripts/orchestrator/capabilities.json");
if (!fs.existsSync(capPath)) fail(`Missing: ${capPath}`);

const raw = loadJSON(capPath);
const parsed = CapabilitiesFileSchema.safeParse(raw);
if (!parsed.success) {
  console.error(parsed.error.flatten());
  fail("capabilities.json failed schema validation");
}

const caps = parsed.data.capabilities;
validateUniqueIds(caps);
validateDepsExist(caps);
validateConflicts(caps);

const cycle = detectCycles(caps);
if (cycle) fail(`Dependency cycle detected: ${cycle.join(" -> ")}`);

validateFilesOwned(caps);

console.log("✅ capabilities.json validated");
