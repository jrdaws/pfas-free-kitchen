import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG_SCHEMA, validateConfig } from '../../src/dd/config-schema.mjs';

test('configSchema: validates empty config', () => {
  const config = {};
  const result = validateConfig(config);
  assert(result.valid, 'Empty config should be valid');
});

test('configSchema: validates plan field', () => {
  const config = { plan: 'pro' };
  const result = validateConfig(config);
  assert(result.valid, 'Config with valid plan should be valid');
});

test('configSchema: rejects invalid plan', () => {
  const config = { plan: 'invalid' };
  const result = validateConfig(config);
  assert(!result.valid, 'Config with invalid plan should fail');
  assert(result.errors.length > 0, 'Should have error messages');
});

test('configSchema: validates integrations field', () => {
  const config = {
    integrations: {
      auth: { enabled: true },
      payments: { enabled: false },
    },
  };
  const result = validateConfig(config);
  assert(result.valid, 'Config with integrations should be valid');
});

test('configSchema: rejects invalid integration enabled', () => {
  const config = {
    integrations: {
      auth: { enabled: 'yes' },
    },
  };
  const result = validateConfig(config);
  assert(!result.valid, 'Config with non-boolean enabled should fail');
});

test('configSchema: validates featureOverrides field', () => {
  const config = {
    featureOverrides: {
      auth: true,
      billing: false,
    },
  };
  const result = validateConfig(config);
  assert(result.valid, 'Config with featureOverrides should be valid');
});

test('configSchema: rejects invalid featureOverride value', () => {
  const config = {
    featureOverrides: {
      auth: 'yes',
    },
  };
  const result = validateConfig(config);
  assert(!result.valid, 'Config with non-boolean featureOverride should fail');
});

test('configSchema: validates afterInstall policy', () => {
  const config = {
    afterInstall: {
      policy: 'prompt',
    },
  };
  const result = validateConfig(config);
  assert(result.valid, 'Config with afterInstall should be valid');
});

test('configSchema: rejects unknown config keys', () => {
  const config = { unknownKey: 'value' };
  const result = validateConfig(config);
  assert(!result.valid, 'Config with unknown keys should fail');
  assert(result.errors.some(e => e.includes('Unknown config keys')), 'Should mention unknown keys');
});
