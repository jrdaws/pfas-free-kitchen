import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { captureRepoArtifacts } from "../tools/handoff-pack/lib/repo_capture.mjs";

test("handoff-pack env: warns when key is interactive-only", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ddfw-envtest-"));
  const outDir = path.join(tmp, "out");
  const repoPath = tmp;

  // stub runner: simulate visibility differences
  const runner = (cmd, args) => {
    const a = [cmd, ...(args || [])].join(" ");
    if (a.startsWith("git log")) return "abc123 (HEAD -> main) test\n";
    if (a.startsWith("git status")) return "";
    if (a === "node -v") return "v24.12.0";
    if (a === "npm -v") return "10.9.0";
    if (a.startsWith("uname -a")) return "Darwin test";
    if (a.startsWith("zsh -lc")) return "ANTHROPIC_API_KEY= NO\nOPENAI_API_KEY= NO\n";
    if (a.startsWith("zsh -lic")) return "ANTHROPIC_API_KEY= YES\nOPENAI_API_KEY= YES\n";
    return "";
  };

  await captureRepoArtifacts({ repoPath, outDir, runner });

  const envPath = path.join(outDir, "repo", "env.md");
  assert.ok(fs.existsSync(envPath), "env.md not written");
  const md = fs.readFileSync(envPath, "utf8");
  assert.match(md, /## Warnings/);
  assert.match(md, /WARNING: ANTHROPIC_API_KEY.*NOT in zsh -lc/);
  assert.match(md, /WARNING: OPENAI_API_KEY.*NOT in zsh -lc/);
});
