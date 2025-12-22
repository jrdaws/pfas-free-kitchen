// tests/cli/flags.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExportFlags } from '../../bin/framework.js';
import { parsePullFlags } from '../../src/dd/pull.mjs';

// Export flags tests
test('parseExportFlags: handles all integration flags', () => {
  const flags = parseExportFlags([
    '--auth', 'supabase',
    '--payments', 'stripe',
    '--email', 'resend',
    '--db', 'postgresql',
    '--ai', 'openai',
    '--analytics', 'posthog',
    '--storage', 's3',
  ]);

  assert.equal(flags.integrations.auth, 'supabase');
  assert.equal(flags.integrations.payments, 'stripe');
  assert.equal(flags.integrations.email, 'resend');
  assert.equal(flags.integrations.db, 'postgresql');
  assert.equal(flags.integrations.ai, 'openai');
  assert.equal(flags.integrations.analytics, 'posthog');
  assert.equal(flags.integrations.storage, 's3');
});

test('parseExportFlags: handles --template-source local', () => {
  const flags = parseExportFlags(['--template-source', 'local']);
  assert.equal(flags.templateSource, 'local');
});

test('parseExportFlags: handles --template-source remote', () => {
  const flags = parseExportFlags(['--template-source', 'remote']);
  assert.equal(flags.templateSource, 'remote');
});

test('parseExportFlags: handles --framework-version', () => {
  const flags = parseExportFlags(['--framework-version', 'v1.0.0']);
  assert.equal(flags.frameworkVersion, 'v1.0.0');
});

test('parseExportFlags: ignores integration flag without value', () => {
  const flags = parseExportFlags(['--auth']);
  assert.equal(flags.integrations.auth, null);
});

test('parseExportFlags: handles mixed flags and integrations', () => {
  const flags = parseExportFlags([
    '--name', 'my-app',
    '--auth', 'supabase',
    '--force',
    '--payments', 'stripe',
    '--dry-run',
  ]);

  assert.equal(flags.name, 'my-app');
  assert.equal(flags.integrations.auth, 'supabase');
  assert.equal(flags.force, true);
  assert.equal(flags.integrations.payments, 'stripe');
  assert.equal(flags.dryRun, true);
});

test('parseExportFlags: handles --after-install with all values', () => {
  const prompt = parseExportFlags(['--after-install', 'prompt']);
  const auto = parseExportFlags(['--after-install', 'auto']);
  const off = parseExportFlags(['--after-install', 'off']);

  assert.equal(prompt.afterInstall, 'prompt');
  assert.equal(auto.afterInstall, 'auto');
  assert.equal(off.afterInstall, 'off');
});

test('parseExportFlags: ignores invalid --after-install value', () => {
  const flags = parseExportFlags(['--after-install', 'invalid']);
  assert.equal(flags.afterInstall, 'prompt');
});

// Pull flags tests
test('parsePullFlags: all flags work together', () => {
  const flags = parsePullFlags([
    '--dry-run',
    '--cursor',
    '--open',
    '--force',
    '--dev',
  ]);

  assert.equal(flags.dryRun, true);
  assert.equal(flags.cursor, true);
  assert.equal(flags.open, true);
  assert.equal(flags.force, true);
  assert.equal(flags.dev, true);
});

test('parsePullFlags: ignores unknown flags gracefully', () => {
  const flags = parsePullFlags(['--unknown', '--cursor']);
  assert.equal(flags.cursor, true);
  assert.equal(flags.dryRun, false);
});

// Edge cases
test('parseExportFlags: handles empty string values', () => {
  const flags = parseExportFlags(['--name', '']);
  assert.equal(flags.name, '');
});

test('parseExportFlags: handles special characters in values', () => {
  const flags = parseExportFlags(['--name', 'my-app@2024']);
  assert.equal(flags.name, 'my-app@2024');
});

test('parseExportFlags: handles URL with special chars', () => {
  const flags = parseExportFlags([
    '--remote',
    'https://github.com/user/repo.git?foo=bar',
  ]);
  assert.equal(flags.remote, 'https://github.com/user/repo.git?foo=bar');
});

test('parseExportFlags: case sensitive integration values', () => {
  const flags = parseExportFlags(['--auth', 'Supabase']);
  assert.equal(flags.integrations.auth, 'Supabase');
});

test('parseExportFlags: handles multiple dashes in branch name', () => {
  const flags = parseExportFlags(['--branch', 'feature-branch-name']);
  assert.equal(flags.branch, 'feature-branch-name');
});
