import { test } from "node:test";
import assert from "node:assert/strict";
import { validateConfig } from "../src/dd/config-schema.mjs";

test("config validation: valid config passes", () => {
  const config = {
    plan: "free",
    featureOverrides: {},
  };
  const result = validateConfig(config);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("config validation: valid config with all fields passes", () => {
  const config = {
    plan: "pro",
    featureOverrides: {
      "auth.google": true,
      "billing.stripe": false,
    },
    integrations: {
      figma: { enabled: true },
      supabase: { enabled: false },
    },
    afterInstall: {
      policy: "auto",
    },
  };
  const result = validateConfig(config);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("config validation: invalid plan value fails", () => {
  const config = {
    plan: "enterprise",
    featureOverrides: {},
  };
  const result = validateConfig(config);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /Invalid plan.*enterprise/);
});

test("config validation: non-boolean featureOverride fails", () => {
  const config = {
    plan: "free",
    featureOverrides: {
      "auth.google": "yes",
    },
  };
  const result = validateConfig(config);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /featureOverrides.*must be a boolean/);
});

test("config validation: invalid afterInstall policy fails", () => {
  const config = {
    plan: "free",
    featureOverrides: {},
    afterInstall: {
      policy: "always",
    },
  };
  const result = validateConfig(config);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /afterInstall.policy.*prompt, auto, off/);
});

test("config validation: unknown top-level key fails", () => {
  const config = {
    plan: "free",
    unknownField: "value",
  };
  const result = validateConfig(config);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /Unknown config keys.*unknownField/);
});

test("config validation: non-object config fails", () => {
  const result = validateConfig("not an object");
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /Config must be an object/);
});

test("config validation: null config fails", () => {
  const result = validateConfig(null);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /Config must be an object/);
});

test("config validation: integration with non-boolean enabled fails", () => {
  const config = {
    plan: "free",
    integrations: {
      figma: { enabled: "true" },
    },
  };
  const result = validateConfig(config);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /integrations.*enabled must be a boolean/);
});
