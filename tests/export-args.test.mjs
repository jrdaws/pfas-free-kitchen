import test from "node:test";
import assert from "node:assert/strict";
import { parseExportFlags } from "../bin/framework.js";

test("parseExportFlags: empty args returns defaults", () => {
  const result = parseExportFlags([]);
  assert.deepEqual(result, {
    name: null,
    remote: null,
    push: false,
    branch: "main",
    dryRun: false,
    force: false,
  });
});

test("parseExportFlags: --name flag", () => {
  const result = parseExportFlags(["--name", "my-project"]);
  assert.equal(result.name, "my-project");
});

test("parseExportFlags: --remote flag", () => {
  const result = parseExportFlags(["--remote", "https://github.com/me/repo.git"]);
  assert.equal(result.remote, "https://github.com/me/repo.git");
});

test("parseExportFlags: --push flag", () => {
  const result = parseExportFlags(["--push"]);
  assert.equal(result.push, true);
});

test("parseExportFlags: --branch flag", () => {
  const result = parseExportFlags(["--branch", "develop"]);
  assert.equal(result.branch, "develop");
});

test("parseExportFlags: --dry-run flag", () => {
  const result = parseExportFlags(["--dry-run"]);
  assert.equal(result.dryRun, true);
});

test("parseExportFlags: --force flag", () => {
  const result = parseExportFlags(["--force"]);
  assert.equal(result.force, true);
});

test("parseExportFlags: all flags combined", () => {
  const result = parseExportFlags([
    "--name", "my-app",
    "--remote", "https://github.com/me/my-app.git",
    "--push",
    "--branch", "main",
    "--dry-run",
    "--force",
  ]);
  assert.deepEqual(result, {
    name: "my-app",
    remote: "https://github.com/me/my-app.git",
    push: true,
    branch: "main",
    dryRun: true,
    force: true,
  });
});

test("parseExportFlags: flags in different order", () => {
  const result = parseExportFlags([
    "--push",
    "--branch", "feature",
    "--name", "test-proj",
  ]);
  assert.equal(result.push, true);
  assert.equal(result.branch, "feature");
  assert.equal(result.name, "test-proj");
});

test("parseExportFlags: ignores unknown flags", () => {
  const result = parseExportFlags(["--unknown", "value", "--push"]);
  assert.equal(result.push, true);
  assert.equal(result.name, null); // unknown flag doesn't break parsing
});

test("parseExportFlags: flag without value is ignored for value flags", () => {
  // --name at end without value should not crash
  const result = parseExportFlags(["--push", "--name"]);
  assert.equal(result.push, true);
  assert.equal(result.name, null); // no value provided
});

test("parseExportFlags: flag followed by another flag treats value as missing", () => {
  // --name followed by --remote should NOT assign "--remote" as the name
  const result = parseExportFlags(["--name", "--remote", "https://github.com/me/repo.git"]);
  assert.equal(result.name, null); // value starts with "--", so treated as missing
  assert.equal(result.remote, "https://github.com/me/repo.git");
});

test("parseExportFlags: --branch followed by flag keeps default", () => {
  const result = parseExportFlags(["--branch", "--push"]);
  assert.equal(result.branch, "main"); // default preserved, "--push" not assigned
  assert.equal(result.push, true);
});


test("parseExportFlags: --after-install prompt|auto|off", async () => {
  const m = await import("../bin/framework.js");
  const d1 = m.parseExportFlags(["--after-install", "prompt"]);
  const d2 = m.parseExportFlags(["--after-install", "auto"]);
  const d3 = m.parseExportFlags(["--after-install", "off"]);
  assert.equal(d1.afterInstall, "prompt");
  assert.equal(d2.afterInstall, "auto");
  assert.equal(d3.afterInstall, "off");
});
