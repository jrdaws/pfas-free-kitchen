import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import readline from "node:readline";

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

export async function askYesNo(question, defaultNo = true) {
  return await new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const suffix = defaultNo ? " [y/N] " : " [Y/n] ";
    rl.question(question + suffix, (answer) => {
      rl.close();
      const a = String(answer || "").trim().toLowerCase();
      if (!a) return resolve(!defaultNo);
      resolve(a === "y" || a === "yes");
    });
  });
}

/**
 * Check if running in a non-interactive environment (CI, piped input, etc.)
 */
function isNonInteractive() {
  return !process.stdin.isTTY || process.env.CI === "true" || process.env.CI === "1";
}

/**
 * Stable post-export hook pipeline.
 * - Deterministic config output: always writes .dd/config.json with afterInstall.policy
 * - No hidden behavior: hook runs only per policy and explicit consent (prompt) or auto policy
 * - Non-interactive environments skip prompts safely
 */
export async function runPostExportHooks({ outDir, afterInstall }) {
  const ddDir = path.join(outDir, ".dd");
  const configPath = path.join(ddDir, "config.json");
  const hookPath = path.join(ddDir, "after-install.sh");

  const cfg = readJson(configPath) || {};
  cfg.afterInstall = cfg.afterInstall || {};
  cfg.afterInstall.policy = afterInstall || "prompt";
  writeJson(configPath, cfg);

  if (!fs.existsSync(hookPath)) return;

  const policy = cfg.afterInstall.policy;

  if (policy === "off") return;

  if (policy === "auto") {
    console.log("\n[after-install: auto] Running setup...");
    const result = spawnSync("bash", [hookPath], { stdio: "inherit", cwd: outDir });
    if (result.status !== 0) process.exit(result.status ?? 1);
    return;
  }

  // policy === "prompt"
  // Skip prompting in non-interactive environments
  if (isNonInteractive()) {
    console.log("\n[after-install: prompt] Non-interactive environment detected.");
    console.log("Skipping setup prompt. Run manually: cd " + outDir + " && bash .dd/after-install.sh");
    return;
  }

  console.log("");
  console.log("Post-export setup:");
  const runNow = await askYesNo("[ ] Run first-time setup now? (installs packages)", true);
  if (!runNow) return;

  const result = spawnSync("bash", [hookPath], { stdio: "inherit", cwd: outDir });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
