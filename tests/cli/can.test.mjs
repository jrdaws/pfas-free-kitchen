import test from "node:test";
import assert from "node:assert/strict";
import { canCore } from "../../src/platform/entitlements/can-core.ts";

test("free cannot access pro", () => {
  const r = canCore({ id: "x", tier: "pro", enabled: true }, { plan: "free" });
  assert.equal(r.ok, false);
});

test("team can access pro", () => {
  const r = canCore({ id: "x", tier: "pro", enabled: true }, { plan: "team" });
  assert.equal(r.ok, true);
});

test("override off blocks", () => {
  const r = canCore({ id: "cap.a", tier: "free", enabled: true }, { plan: "team", flags: { "cap.a": false } });
  assert.equal(r.ok, false);
});
