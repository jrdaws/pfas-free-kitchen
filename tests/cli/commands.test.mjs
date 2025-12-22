import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkBin = path.resolve(__dirname, "../../bin/framework.js");

/**
 * Helper to run framework CLI and capture output
 */
function runFramework(args, options = {}) {
  const result = spawnSync("node", [frameworkBin, ...args], {
    encoding: "utf-8",
    ...options,
  });
  return {
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    status: result.status,
    error: result.error,
  };
}

test("CLI: version command", () => {
  const result = runFramework(["version"]);
  assert.equal(result.status, 0, "version command should exit with 0");
  assert.ok(result.stdout.includes("@jrdaws/framework"), "should show package name");
});

test("CLI: help command", () => {
  const result = runFramework(["help"]);
  assert.equal(result.status, 0, "help command should exit with 0");
  assert.ok(result.stdout.includes("Usage:"), "should show usage information");
  assert.ok(result.stdout.includes("framework"), "should list framework commands");
});

test("CLI: help with --help flag", () => {
  const result = runFramework(["--help"]);
  assert.equal(result.status, 0, "--help should exit with 0");
  assert.ok(result.stdout.includes("Usage:"), "should show usage information");
});

test("CLI: demo command with --help", () => {
  const result = runFramework(["demo", "--help"]);
  assert.equal(result.status, 0, "demo --help should exit with 0");
  assert.ok(result.stdout.includes("Usage:"), "should show demo usage");
  assert.ok(result.stdout.includes("Valid templates:"), "should list valid templates");
});

test("CLI: demo command with invalid template", () => {
  const result = runFramework(["demo", "invalid-template"]);
  assert.notEqual(result.status, 0, "should fail with invalid template");
  assert.ok(result.stderr.includes("Unknown template"), "should show unknown template error");
});

test("CLI: llm command requires subcommand", () => {
  const result = runFramework(["llm"]);
  // Should either show help or error about missing subcommand
  assert.ok(
    result.stderr.includes("Usage") || result.stdout.includes("Usage"),
    "should show usage information"
  );
});

test("CLI: auth command requires subcommand", () => {
  const result = runFramework(["auth"]);
  // Should either show help or error about missing subcommand
  assert.ok(
    result.stderr.includes("Usage") || result.stdout.includes("Usage"),
    "should show usage information"
  );
});

test("CLI: plugin command requires subcommand", () => {
  const result = runFramework(["plugin"]);
  // Should either show help or error about missing subcommand
  assert.ok(
    result.stderr.includes("Usage") || result.stdout.includes("Usage") ||
    result.stdout.includes("Plugin Management Commands"),
    "should show usage information"
  );
});

test("CLI: unknown command shows error", () => {
  const result = runFramework(["unknown-command"]);
  // Should show unknown command error or help
  assert.ok(
    result.stderr.includes("Unknown") || result.stdout.includes("Usage"),
    "should handle unknown command"
  );
});

test("CLI: export requires templateId and projectDir", () => {
  const result = runFramework(["export"]);
  assert.notEqual(result.status, 0, "should fail without required args");
  assert.ok(result.stderr.includes("Usage"), "should show usage error");
});

test("CLI: export with unknown template fails", () => {
  const result = runFramework(["export", "unknown-template", "./test-output"]);
  assert.notEqual(result.status, 0, "should fail with unknown template");
  assert.ok(result.stderr.includes("Unknown templateId"), "should show template error");
});

test("CLI: export --push requires --remote", () => {
  const result = runFramework(["export", "saas", "./test-output", "--push"]);
  assert.notEqual(result.status, 0, "should fail when --push without --remote");
  assert.ok(
    result.stderr.includes("--push requires --remote"),
    "should show requirement error"
  );
});

test("CLI: templates list command", () => {
  const result = runFramework(["templates", "list"]);
  assert.equal(result.status, 0, "templates list should exit with 0");
  assert.ok(
    result.stdout.includes("Available Templates") || result.stdout.includes("No templates found"),
    "should show templates list"
  );
});

test("CLI: templates help command", () => {
  const result = runFramework(["templates", "help"]);
  assert.equal(result.status, 0, "templates help should exit with 0");
  assert.ok(result.stdout.includes("Template Management Commands"), "should show templates help");
});

test("CLI: plugin help command", () => {
  const result = runFramework(["plugin", "help"]);
  assert.equal(result.status, 0, "plugin help should exit with 0");
  assert.ok(result.stdout.includes("Plugin Management Commands"), "should show plugin help");
});

test("CLI: plugin hooks command", () => {
  const result = runFramework(["plugin", "hooks"]);
  assert.equal(result.status, 0, "plugin hooks should exit with 0");
  assert.ok(result.stdout.includes("Available Hook Points"), "should show hook points");
});

test("CLI: no command shows help", () => {
  const result = runFramework([]);
  assert.equal(result.status, 0, "no command should exit with 0");
  assert.ok(result.stdout.includes("Usage:"), "should show usage information");
});

test("CLI: capabilities command", () => {
  const result = runFramework(["capabilities"]);
  assert.equal(result.status, 0, "capabilities should exit with 0");
  // Should show capabilities output or help
});

test("CLI: doctor command", () => {
  const result = runFramework(["doctor"]);
  assert.equal(result.status, 0, "doctor should exit with 0 or run successfully");
  // Doctor command may have various outputs depending on system state
});

test("CLI: pull command without token shows usage", () => {
  const result = runFramework(["pull"]);
  // Pull without token shows usage, which may exit with 0 or 1
  assert.ok(result.stdout.includes("Usage") || result.stdout.includes("token"), "should show usage");
});
