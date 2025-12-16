import fs from "fs";
import { execSync } from "node:child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }).trim();
  } catch (e) {
    const out = e?.stdout?.toString?.() ?? "";
    const err = e?.stderr?.toString?.() ?? "";
    return (out + "\n" + err).trim();
  }
}

function exists(p) { return fs.existsSync(p); }

const lines = [];
lines.push(`# Repo Audit Report`);
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(``);

lines.push(`## Git`);
lines.push("```");
lines.push(run("git rev-parse --show-toplevel"));
lines.push(run("git status -sb"));
lines.push("```");
lines.push("");

lines.push(`## Runtime`);
lines.push("```");
lines.push(`node: ${run("node -v")}`);
lines.push(`npm: ${run("npm -v")}`);
lines.push("```");
lines.push("");

lines.push(`## Framework map`);
lines.push("```");
lines.push(run("npm run -s framework:map || true"));
lines.push("```");
lines.push("");

lines.push(`## Quick checks`);
lines.push("```");
lines.push(exists("node_modules") ? "node_modules: present" : "node_modules: missing (run npm i)");
lines.push("");
lines.push("Syntax:");
lines.push(run("node -c bin/framework.js || true"));
lines.push(run("node -c scripts/orchestrator/framework-map.mjs || true"));
lines.push("```");
lines.push("");

fs.writeFileSync("AUDIT_REPORT.md", lines.join("\n") + "\n", "utf8");
console.log("Wrote: AUDIT_REPORT.md");
