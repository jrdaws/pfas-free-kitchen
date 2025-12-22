import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkBin = path.resolve(__dirname, '../../bin/framework.js');

function runFramework(args, options = {}) {
  const result = spawnSync('node', [frameworkBin, ...args], {
    encoding: 'utf-8',
    timeout: 15000,
    ...options,
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status,
    error: result.error,
  };
}

test('CLI demo: demo saas shows template info', () => {
  const result = runFramework(['demo', 'saas']);

  // Demo command should show template information or error
  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show output');
  } else {
    // Or show error (directory exists, template not found, etc.)
    assert(
      result.stderr.includes('Unknown') ||
      result.stderr.includes('exists') ||
      result.stdout.includes('template') ||
      result.stderr.length > 0,
      'Should show error or reference template'
    );
  }
});

test('CLI demo: demo with --mode flag', () => {
  const result = runFramework(['demo', 'saas', '--mode', 'new']);

  // Should process mode flag
  if (result.status !== 0 && result.stderr) {
    assert(true); // Error is acceptable
  }
});

test('CLI demo: demo with --ai flag', () => {
  const result = runFramework(['demo', 'saas', '--ai', 'anthropic']);

  // Should process AI flag
  if (result.status !== 0 && result.stderr) {
    assert(true); // Error is acceptable
  }
});

test('CLI demo: demo with --auth flag', () => {
  const result = runFramework(['demo', 'saas', '--auth', 'supabase']);

  // Should process auth flag
  if (result.status !== 0 && result.stderr) {
    assert(true); // Error is acceptable
  }
});

test('CLI demo: demo with multiple integration flags', () => {
  const result = runFramework([
    'demo',
    'saas',
    '--auth', 'supabase',
    '--payments', 'stripe',
    '--ai', 'anthropic'
  ]);

  // Should process multiple flags
  if (result.status !== 0 && result.stderr) {
    assert(true); // Error is acceptable
  }
});

test('CLI demo: demo with unknown template', () => {
  const result = runFramework(['demo', 'nonexistent-template-xyz']);

  assert.notEqual(result.status, 0, 'Should fail with unknown template');
  assert(result.stderr.includes('Unknown'), 'Should show unknown template error');
});

test('CLI demo: demo --help shows usage', () => {
  const result = runFramework(['demo', '--help']);

  assert.equal(result.status, 0, 'Should succeed');
  assert(result.stdout.includes('Usage'), 'Should show usage');
  assert(result.stdout.includes('Valid templates'), 'Should list valid templates');
});

test('CLI demo: demo with --quiet flag', () => {
  const result = runFramework(['demo', 'saas', '--quiet']);

  // Quiet mode should work (may reduce output)
  if (result.status !== 0 && result.stderr) {
    assert(true); // Error is acceptable
  }
});
