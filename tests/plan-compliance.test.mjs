import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPlanCompliance } from "../src/dd/plan-compliance.mjs";

test("compliance: all capabilities compliant on free plan", () => {
  const caps = [
    { id: "feature.a", enabled: true, tier: "free", label: "Feature A" },
    { id: "feature.b", enabled: true, tier: "free", label: "Feature B" },
  ];

  const result = checkPlanCompliance(caps, "free");
  assert.equal(result.compliant, true);
  assert.equal(result.violations.length, 0);
});

test("compliance: pro capability violates free plan", () => {
  const caps = [
    { id: "feature.basic", enabled: true, tier: "free", label: "Basic" },
    { id: "billing.stripe", enabled: true, tier: "pro", label: "Stripe Billing" },
  ];

  const result = checkPlanCompliance(caps, "free");
  assert.equal(result.compliant, false);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].capId, "billing.stripe");
  assert.equal(result.violations[0].requiredTier, "pro");
  assert.equal(result.violations[0].currentPlan, "free");
});

test("compliance: team capability violates pro plan", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, tier: "pro", label: "Stripe" },
    { id: "billing.lemon", enabled: true, tier: "team", label: "Lemon Squeezy" },
  ];

  const result = checkPlanCompliance(caps, "pro");
  assert.equal(result.compliant, false);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].capId, "billing.lemon");
  assert.equal(result.violations[0].requiredTier, "team");
});

test("compliance: team plan can access all tiers", () => {
  const caps = [
    { id: "feature.free", enabled: true, tier: "free", label: "Free" },
    { id: "feature.pro", enabled: true, tier: "pro", label: "Pro" },
    { id: "feature.team", enabled: true, tier: "team", label: "Team" },
  ];

  const result = checkPlanCompliance(caps, "team");
  assert.equal(result.compliant, true);
  assert.equal(result.violations.length, 0);
});

test("compliance: disabled capabilities don't cause violations", () => {
  const caps = [
    { id: "billing.stripe", enabled: false, tier: "pro", label: "Stripe" },
    { id: "billing.lemon", enabled: false, tier: "team", label: "Lemon" },
  ];

  const result = checkPlanCompliance(caps, "free");
  assert.equal(result.compliant, true);
  assert.equal(result.violations.length, 0);
});

test("compliance: missing tier defaults to free", () => {
  const caps = [
    { id: "feature.a", enabled: true, label: "Feature A" },
  ];

  const result = checkPlanCompliance(caps, "free");
  assert.equal(result.compliant, true);
  assert.equal(result.violations.length, 0);
});

test("compliance: multiple violations detected", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, tier: "pro", label: "Stripe" },
    { id: "billing.lemon", enabled: true, tier: "team", label: "Lemon" },
  ];

  const result = checkPlanCompliance(caps, "free");
  assert.equal(result.compliant, false);
  assert.equal(result.violations.length, 2);
});

test("compliance: undefined plan defaults to free", () => {
  const caps = [
    { id: "billing.stripe", enabled: true, tier: "pro", label: "Stripe" },
  ];

  const result = checkPlanCompliance(caps, undefined);
  assert.equal(result.compliant, false);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].currentPlan, "free");
});
