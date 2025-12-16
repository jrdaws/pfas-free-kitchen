import test from "node:test";
import assert from "node:assert/strict";
import { can } from "../src/platform/entitlements/can.ts";

test("free cannot access pro", () => {
  const r = can({ id: "x", tier: "pro" }, { plan: "free" });
  assert.equal(r.ok, false);
});

test("team can access pro", () => {
  const r = can({ id: "x", tier: "pro" }, { plan: "team" });
  assert.equal(r.ok, true);
});

test("override off blocks", () => {
  const r = can({ id: "cap.a", tier: "free" }, { plan: "team", flags: { "cap.a": false } });
  assert.equal(r.ok, false);
});
