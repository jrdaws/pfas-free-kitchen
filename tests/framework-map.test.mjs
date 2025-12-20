import test from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";

test("framework-map: Recent changes lines are bullet-prefixed and single-line", () => {
  execSync("node scripts/orchestrator/framework-map.mjs", { stdio: "ignore" });

  const md = fs.readFileSync("FRAMEWORK_MAP.md", "utf8");
  const lines = md.split("\n");

  const start = lines.findIndex((l) => l.trim() === "## Recent changes");
  assert.ok(start >= 0, "Missing '## Recent changes' header");

  // capture until next header
  const section = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("## ")) break;
    if (l.trim() === "") continue;
    section.push(l);
  }

  assert.ok(section.length > 0, "Recent changes section is empty");

  for (const l of section) {
    assert.ok(l.startsWith("- "), `Line missing bullet prefix: ${l}`);
    assert.ok(!l.includes("\r"), `Line contains CR: ${l}`);
  }
});
