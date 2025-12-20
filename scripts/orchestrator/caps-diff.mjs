import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function usage() {
  console.log("Usage:");
  console.log("  node scripts/orchestrator/caps-diff.mjs --from <path|gitref> --to <path|gitref>");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/orchestrator/caps-diff.mjs --from HEAD~1 --to HEAD");
  console.log("  node scripts/orchestrator/caps-diff.mjs --from scripts/orchestrator/capabilities.json --to /tmp/capabilities.json");
  process.exit(2);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from") args.from = argv[++i];
    else if (a === "--to") args.to = argv[++i];
  }
  return args;
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function readCapsJson(source) {
  const defaultPath = "scripts/orchestrator/capabilities.json";

  if (isFile(source)) {
    return fs.readFileSync(source, "utf8");
  }

  const ref = source;
  const spec = `${ref}:${defaultPath}`;
  try {
    return execSync(`git show ${spec}`, { stdio: ["ignore", "pipe", "pipe"] }).toString("utf8");
  } catch (e) {
    throw new Error(`Unable to read capabilities.json from "${source}". Provide a file path or a git ref (e.g. HEAD~1).`);
  }
}

function normalize(jsonText) {
  const j = JSON.parse(jsonText);
  const caps = j?.capabilities;
  if (!Array.isArray(caps)) throw new Error(`Invalid capabilities.json: missing top-level "capabilities" array`);
  const byId = new Map();
  for (const c of caps) {
    if (!c || typeof c.id !== "string") continue;
    byId.set(c.id, c);
  }
  return byId;
}

function stableSort(arr) {
  return [...arr].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function envRequiredKeys(cap) {
  const env = Array.isArray(cap?.env) ? cap.env : [];
  return stableSort(
    env
      .filter((e) => e && typeof e.key === "string" && e.required === true)
      .map((e) => e.key)
  );
}

function stableArr(x) {
  return stableSort(Array.isArray(x) ? x : []);
}

function diffField(name, aArr, bArr) {
  const a = new Set(stableArr(aArr));
  const b = new Set(stableArr(bArr));
  const added = stableSort([...b].filter((x) => !a.has(x)));
  const removed = stableSort([...a].filter((x) => !b.has(x)));
  if (added.length === 0 && removed.length === 0) return null;
  return { name, added, removed };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.from || !args.to) usage();

  const fromText = readCapsJson(args.from);
  const toText = readCapsJson(args.to);

  const A = normalize(fromText);
  const B = normalize(toText);

  const aIds = new Set(A.keys());
  const bIds = new Set(B.keys());

  const addedCaps = stableSort([...bIds].filter((id) => !aIds.has(id)));
  const removedCaps = stableSort([...aIds].filter((id) => !bIds.has(id)));
  const shared = stableSort([...aIds].filter((id) => bIds.has(id)));

  console.log(`caps:diff from=${args.from} to=${args.to}`);
  console.log("");

  if (addedCaps.length) {
    console.log("Added capabilities:");
    for (const id of addedCaps) console.log(`- ${id}`);
    console.log("");
  }

  if (removedCaps.length) {
    console.log("Removed capabilities:");
    for (const id of removedCaps) console.log(`- ${id}`);
    console.log("");
  }

  let anyChanged = false;

  for (const id of shared) {
    const a = A.get(id);
    const b = B.get(id);

    const changes = [];

    const provides = diffField("provides", a.provides, b.provides);
    if (provides) changes.push(provides);

    const requires = diffField("requires", a.requires, b.requires);
    if (requires) changes.push(requires);

    const conflicts = diffField("conflicts", a.conflicts, b.conflicts);
    if (conflicts) changes.push(conflicts);

    const filesOwned = diffField("filesOwned", a.filesOwned, b.filesOwned);
    if (filesOwned) changes.push(filesOwned);

    const reqEnv = diffField("requiredEnv", envRequiredKeys(a), envRequiredKeys(b));
    if (reqEnv) changes.push(reqEnv);

    if (changes.length) {
      anyChanged = true;
      console.log(`Changed: ${id}`);
      for (const ch of changes) {
        if (ch.added.length) {
          console.log(`  ${ch.name} added:`);
          for (const x of ch.added) console.log(`    + ${x}`);
        }
        if (ch.removed.length) {
          console.log(`  ${ch.name} removed:`);
          for (const x of ch.removed) console.log(`    - ${x}`);
        }
      }
      console.log("");
    }
  }

  if (!addedCaps.length && !removedCaps.length && !anyChanged) {
    console.log("No changes.");
  }
}

try {
  main();
} catch (e) {
  console.error(e?.stack || String(e));
  process.exit(1);
}
