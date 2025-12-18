import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
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
 * Stable post-export hook pipeline.
 * - Deterministic config output: always writes .dd/config.json with afterInstall.policy
 * - No hidden behavior: hook runs only per policy and explicit consent (prompt) or auto policy
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
    execSync(`bash "${hookPath}"`, { stdio: "inherit", cwd: outDir });
    return;
  }

  // policy === "prompt"
  console.log("");
  console.log("Post-export setup:");
  const runNow = await askYesNo("[ ] Run first-time setup now? (installs packages)", true);
  if (!runNow) return;

  execSync(`bash "${hookPath}"`, { stdio: "inherit", cwd: outDir });
}
