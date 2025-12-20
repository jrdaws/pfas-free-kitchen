import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

function defaultRunner(cmd, args = [], opts = {}) {
  const cwd = opts.cwd || process.cwd();
  try {
    return execFileSync(cmd, args, { cwd, encoding: "utf8" });
  } catch (e) {
    const out = (e && (e.stdout || e.stderr)) ? String(e.stdout || e.stderr) : "";
    throw new Error(`command failed: ${cmd} ${(args || []).join(" ")}\n${out}`.trim());
  }
}

function yn(v) { return v ? "YES" : "NO"; }

function parseYesNo(out) {
  const m = new Map();
  for (const line of String(out || "").split("\n")) {
    const mm = line.match(/^([A-Z0-9_]+)=\s*(YES|NO)\s*$/);
    if (mm) m.set(mm[1], mm[2]);
  }
  return m;
}

function safeCmd(runner, repoPath, cmd, args) {
  try { return String(runner(cmd, args, { cwd: repoPath })).trim(); }
  catch { return "(unavailable)"; }
}

/**
 * Writes repo/env.md (no secrets).
 */
export async function captureEnv({ repoPath, outDir, runner = defaultRunner }) {
  const repoOut = path.join(outDir, "repo");
  fs.mkdirSync(repoOut, { recursive: true });

  const keysToCheck = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY"];
  const envLines = [];

  envLines.push("# Environment capture (no secrets)");
  envLines.push("");
  envLines.push("## Current process (pack generator)");
  for (const k of keysToCheck) envLines.push(`${k}= ${yn(!!process.env[k])}`);
  envLines.push("");

  envLines.push("## Tooling");
  envLines.push(`node: ${safeCmd(runner, repoPath, "node", ["-v"])}`);
  envLines.push(`npm: ${safeCmd(runner, repoPath, "npm", ["-v"])}`);
  envLines.push(`uname: ${safeCmd(runner, repoPath, "uname", ["-a"])}`);
  envLines.push(`SHELL: ${process.env.SHELL || "(unknown)"}`);
  envLines.push("");

  const cmdA = `for k in ${keysToCheck.join(" ")}; do v=""; eval 'v="$'${"k"}'"'; if [ -n "$v" ]; then echo "$k= YES"; else echo "$k= NO"; fi; done`;

  const outLc  = safeCmd(runner, repoPath, "zsh", ["-lc", cmdA]);
  const outLic = safeCmd(runner, repoPath, "zsh", ["-lic", cmdA]);

  const mapLc  = parseYesNo(outLc);
  const mapLic = parseYesNo(outLic);

  envLines.push("## Zsh visibility matrix (no secrets)");
  envLines.push("");
  envLines.push("### zsh -lc");
  envLines.push(outLc || "(no output)");
  envLines.push("");
  envLines.push("### zsh -lic");
  envLines.push(outLic || "(no output)");
  envLines.push("");

  const warnings = [];
  for (const k of keysToCheck) {
    const lc = mapLc.get(k);
    const lic = mapLic.get(k);
    if (lc === "NO" && lic === "YES") {
      warnings.push(
        `WARNING: ${k} is visible in zsh -lic but NOT in zsh -lc. Fix by sourcing your private env from ~/.zshenv (non-interactive) not only ~/.zshrc.`
      );
    }
  }
  if (warnings.length) {
    envLines.push("## Warnings");
    envLines.push(...warnings.map(w => `- ${w}`));
    envLines.push("");
  }

  fs.writeFileSync(path.join(repoOut, "env.md"), envLines.join("\n") + "\n", "utf8");
}

/**
 * Writes git captures and returns { commits, status } for use by caller.
 */
export async function captureRepoAdditions({ repoPath, outDir, runner = defaultRunner }) {
  const repoOut = path.join(outDir, "repo");
  fs.mkdirSync(repoOut, { recursive: true });

  let commits = "";
  let status = "";

  try {
    commits = runner("git", ["log", "--oneline", "--decorate", "-n", "200"], { cwd: repoPath });
    fs.writeFileSync(path.join(repoOut, "git_log_oneline_decorate_n200.txt"), commits, "utf8");
  } catch (e) {
    commits = `ERROR: ${e}`;
    fs.writeFileSync(path.join(repoOut, "git_log_oneline_decorate_n200.txt"), commits + "\n", "utf8");
  }

  try {
    status = runner("git", ["status", "--porcelain"], { cwd: repoPath });
    fs.writeFileSync(path.join(repoOut, "git_status_porcelain.txt"), status, "utf8");
  } catch (e) {
    status = `ERROR: ${e}`;
    fs.writeFileSync(path.join(repoOut, "git_status_porcelain.txt"), status + "\n", "utf8");
  }

  return { commits, status };
}

/**
 * Backward-compatible wrapper.
 */
export async function captureRepoArtifacts({ repoPath, outDir, runner = defaultRunner }) {
  await captureRepoAdditions({ repoPath, outDir, runner });
  await captureEnv({ repoPath, outDir, runner });
}
