import { loadRegistry, resolveEnabledCaps, requiredEnvKeysForCap } from "./capability-engine.mjs";

function usage() {
  console.log("Usage:");
  console.log("  node scripts/orchestrator/caps-explain.mjs <capId>");
  process.exit(2);
}

function stableSort(arr) {
  return [...arr].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function fmtBool(v) {
  return v ? "true" : "false";
}

function printSection(title, lines) {
  console.log("");
  console.log(title);
  for (const line of lines) console.log(line);
}

function formatEnv(envList) {
  const env = Array.isArray(envList) ? envList : [];
  const rows = env
    .filter((e) => e && typeof e.key === "string")
    .map((e) => ({
      key: e.key,
      required: e.required === true,
      runtime: typeof e.runtime === "string" ? e.runtime : "server",
      secret: e.secret === true,
    }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  if (rows.length === 0) return ["(none)"];

  return rows.map(
    (r) =>
      `${r.key}  required=${fmtBool(r.required)}  runtime=${r.runtime}  secret=${fmtBool(
        r.secret
      )}`
  );
}

async function main() {
  const capId = process.argv[2];
  if (!capId) usage();

  const registry = loadRegistry();
  const cap = registry.find((c) => c && c.id === capId);

  if (!cap) {
    console.error(`cap not found: ${capId}`);
    const ids = stableSort(registry.map((c) => c.id));
    console.error("");
    console.error("Known capability IDs:");
    for (const id of ids) console.error(`- ${id}`);
    process.exit(1);
  }

  const resolved = await resolveEnabledCaps(process.cwd());
  const rcap = resolved.find((c) => c && c.id === capId) || cap;

  console.log(`Capability: ${capId}`);
  printSection("Meta", [
    `label: ${cap.label || ""}`,
    `group: ${cap.group || ""}`,
    `enabled (this project/env): ${fmtBool(rcap.enabled === true)}`,
  ]);

  printSection("Provides", stableSort(Array.isArray(cap.provides) ? cap.provides : []).map((x) => `- ${x}`));
  printSection("Requires", stableSort(Array.isArray(cap.requires) ? cap.requires : []).map((x) => `- ${x}`));
  printSection(
    "Conflicts",
    stableSort(Array.isArray(cap.conflicts) ? cap.conflicts : []).map((x) => `- ${x}`)
  );

  printSection(
    "Files owned",
    stableSort(Array.isArray(cap.filesOwned) ? cap.filesOwned : []).map((x) => `- ${x}`)
  );

  printSection("Env contract", formatEnv(cap.env));

  const requiredKeys = requiredEnvKeysForCap(cap);
  printSection(
    "Required env keys (gating)",
    requiredKeys.length ? requiredKeys.map((k) => `- ${k}`) : ["(none)"]
  );

  printSection(
    "Templates",
    stableSort(Array.isArray(cap.templates) ? cap.templates : []).map((x) => `- ${x}`)
  );

  printSection(
    "Post-install",
    stableSort(Array.isArray(cap.postInstall) ? cap.postInstall : []).map((x) => `- ${x}`)
  );

  printSection(
    "Tests",
    stableSort(Array.isArray(cap.tests) ? cap.tests : []).map((x) => `- ${x}`)
  );

  console.log("");
}

main().catch((e) => {
  console.error(e?.stack || String(e));
  process.exit(1);
});
