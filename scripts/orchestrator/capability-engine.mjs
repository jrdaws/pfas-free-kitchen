import fs from "node:fs";
import path from "node:path";
import { loadProjectConfig } from "./project-config.mjs";

/**
 * Load capability registry from scripts/orchestrator/capabilities.json.
 * Contract: { version: "1", capabilities: Capability[] }
 * This function is intentionally read-only and deterministic.
 */
export function loadRegistry() {
  const p = path.resolve("scripts/orchestrator/capabilities.json");
  const raw = fs.readFileSync(p, "utf8");
  const j = JSON.parse(raw);

  const caps = j?.capabilities;
  if (!Array.isArray(caps)) {
    throw new Error(
      `capability-engine: capabilities.json must contain a top-level "capabilities" array`
    );
  }
  return caps;
}

/**
 * Returns true if all keys are present in process.env (non-empty string).
 */
export function envHasAll(keys) {
  if (!keys || keys.length === 0) return true;
  return keys.every((k) => {
    const v = process.env[k];
    return typeof v === "string" && v.length > 0;
  });
}

/**
 * Capability schema uses:
 *   env: Array<{ key: string, required?: boolean, runtime?: "build"|"server"|"client", secret?: boolean }>
 * We gate enablement ONLY on env entries where required === true.
 */
export function requiredEnvKeysForCap(cap) {
  const envList = Array.isArray(cap?.env) ? cap.env : [];
  return envList
    .filter((e) => e && typeof e.key === "string" && e.key.length > 0)
    .filter((e) => e.required === true)
    .map((e) => e.key);
}

/**
 * Resolve enabled capabilities for a given project directory.
 * Rules (in order):
 *  1) Default enabled = true
 *  2) Per-project override (boolean) wins
 *  3) If no override: missing required env disables the capability (safety gating)
 */
export async function resolveEnabledCaps(projectDir) {
  const cfg = await loadProjectConfig(projectDir);
  const overrides = cfg?.featureOverrides || {};

  const caps = loadRegistry();

  return caps.map((c) => {
    let enabled = true;

    if (typeof overrides[c.id] === "boolean") {
      enabled = overrides[c.id];
    } else {
      const requiredKeys = requiredEnvKeysForCap(c);
      if (!envHasAll(requiredKeys)) enabled = false;
    }

    return { ...c, enabled };
  });
}
