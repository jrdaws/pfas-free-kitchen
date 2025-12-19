import { test } from "node:test";
import assert from "node:assert/strict";
import { detectConflicts } from "../scripts/orchestrator/capability-engine.mjs";

test("conflicts: no conflicts when no capabilities enabled", () => {
  const caps = [
    { id: "billing.stripe", enabled: false, conflicts: ["billing.paddle"], label: "Stripe" },
    { id: "billing.paddle", enabled: false, conflicts: ["billing.stripe"], label: "Paddle" },
  ];

  const conflicts = detectConflicts(caps);
  assert.equal(conflicts.length, 0);
});

test("conflicts: no conflicts when capabilities don't conflict", () => {
  const caps = [
    { id: "integrations.github", enabled: true, conflicts: [], label: "GitHub" },
    { id: "integrations.google", enabled: true, conflicts: [], label: "Google" },
  ];

  const conflicts = detectConflicts(caps);
  assert.equal(conflicts.length, 0);
});

test("conflicts: detects conflict when both enabled", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, conflicts: ["billing.paddle"], label: "Stripe" },
    { id: "billing.paddle", enabled: true, conflicts: ["billing.stripe"], label: "Paddle" },
  ];

  const conflicts = detectConflicts(caps);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].capA.id, "billing.stripe");
  assert.equal(conflicts[0].capB.id, "billing.paddle");
  assert.match(conflicts[0].reason, /Stripe.*Paddle/);
});

test("conflicts: no conflict when one is disabled", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, conflicts: ["billing.paddle"], label: "Stripe" },
    { id: "billing.paddle", enabled: false, conflicts: ["billing.stripe"], label: "Paddle" },
  ];

  const conflicts = detectConflicts(caps);
  assert.equal(conflicts.length, 0);
});

test("conflicts: detects multiple conflicts", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, conflicts: ["billing.paddle", "billing.lemon"], label: "Stripe" },
    { id: "billing.paddle", enabled: true, conflicts: ["billing.stripe", "billing.lemon"], label: "Paddle" },
    { id: "billing.lemon", enabled: true, conflicts: ["billing.stripe", "billing.paddle"], label: "Lemon" },
  ];

  const conflicts = detectConflicts(caps);
  // Should detect 3 conflicts: stripe↔paddle, stripe↔lemon, paddle↔lemon
  assert.equal(conflicts.length, 3);
});

test("conflicts: handles empty conflicts array", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, conflicts: [], label: "Stripe" },
    { id: "billing.paddle", enabled: true, conflicts: [], label: "Paddle" },
  ];

  const conflicts = detectConflicts(caps);
  assert.equal(conflicts.length, 0);
});

test("conflicts: handles missing conflicts field", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, label: "Stripe" },
    { id: "billing.paddle", enabled: true, label: "Paddle" },
  ];

  const conflicts = detectConflicts(caps);
  assert.equal(conflicts.length, 0);
});

test("conflicts: avoids duplicate conflicts", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, conflicts: ["billing.paddle"], label: "Stripe" },
    { id: "billing.paddle", enabled: true, conflicts: ["billing.stripe"], label: "Paddle" },
  ];

  const conflicts = detectConflicts(caps);
  // Should only report once, not twice
  assert.equal(conflicts.length, 1);
});
