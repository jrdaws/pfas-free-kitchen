import fs from "node:fs";
import path from "node:path";
import { loadProjectConfig } from "./project-config.mjs";

export function loadRegistry() {
  const p = path.resolve("scripts/orchestrator/capabilities.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  return j.caps || [];
}

export function envHasAll(keys) {
  if (!keys || keys.length === 0) return true;
  return keys.every((k) => !!process.env[k]);
}

export async function resolveEnabledCaps(projectDir) {
  const cfg = await loadProjectConfig(projectDir);
  const overrides = cfg.featureOverrides || {};

  const caps = loadRegistry();

  return caps.map((c) => {
    // default: enabled unless env requirements missing
    let enabled = true;

    // per-project override wins
    if (typeof overrides[c.id] === "boolean") enabled = overrides[c.id];

    // env gating (only disables if required env missing)
    if (!envHasAll(c.requiresEnv)) enabled = false;

    return { ...c, enabled };
  });
}
