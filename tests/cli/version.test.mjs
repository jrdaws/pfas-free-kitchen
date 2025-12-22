import test from "node:test";
import assert from "node:assert/strict";
import { getCurrentVersion, checkForUpdates, getUpgradeCommand, getPackageName } from "../../src/dd/version.mjs";

test("getPackageName returns correct package name", () => {
  const pkgName = getPackageName();
  assert.equal(pkgName, "@jrdaws/framework");
});

test("getCurrentVersion returns a valid semver", () => {
  const version = getCurrentVersion();
  assert.ok(version, "version should exist");
  assert.ok(/^\d+\.\d+\.\d+/.test(version), "version should be semver format");
});

test("getUpgradeCommand returns npm install command", () => {
  const cmd = getUpgradeCommand();
  assert.ok(cmd.includes("npm"), "should include npm");
  assert.ok(cmd.includes("@jrdaws/framework"), "should include package name");
});

test("checkForUpdates handles when already on latest", async () => {
  // This test checks the function doesn't crash
  // Actual update check requires network, so we just verify it runs
  try {
    const result = await checkForUpdates();
    // Result structure depends on whether there's an update
    assert.ok(typeof result === "object", "should return an object");
  } catch (err) {
    // Network errors are acceptable in tests
    assert.ok(err.message.includes("ENOTFOUND") || err.message.includes("fetch"), "expected network error");
  }
});
