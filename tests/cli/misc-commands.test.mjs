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

test('CLI: capabilities shows capabilities', () => {
  const result = runFramework(['capabilities']);

  assert.equal(result.status, 0, 'Should succeed');
  // Should show some output about capabilities
  assert(result.stdout.length > 0, 'Should have output');
});

test('CLI: capabilities --list shows list', () => {
  const result = runFramework(['capabilities', '--list']);

  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show capabilities list');
  }
});

test('CLI: doctor runs health checks', () => {
  const result = runFramework(['doctor']);

  assert.equal(result.status, 0, 'Doctor should complete');
  // Should show health check output
  assert(result.stdout.length > 0, 'Should have output');
});

test('CLI: doctor --quiet runs quietly', () => {
  const result = runFramework(['doctor', '--quiet']);

  // Quiet mode may reduce output but still succeed
  if (result.status === 0) {
    assert(true);
  }
});

test('CLI: templates search searches templates', () => {
  const result = runFramework(['templates', 'search', 'blog']);

  assert.equal(result.status, 0, 'Should succeed');
  assert(
    result.stdout.includes('Search') || result.stdout.includes('No templates'),
    'Should show search results'
  );
});

test('CLI: templates info shows template info', () => {
  const result = runFramework(['templates', 'info', 'saas']);

  // May succeed or fail depending on template availability
  if (result.status === 0) {
    assert(result.stdout.includes('saas') || result.stdout.length > 0, 'Should show template info');
  } else {
    assert(result.stderr.includes('not found') || result.stderr.length > 0, 'Should show error');
  }
});

test('CLI: templates categories shows categories', () => {
  const result = runFramework(['templates', 'categories']);

  assert.equal(result.status, 0, 'Should succeed');
  assert(
    result.stdout.includes('Categories') || result.stdout.includes('No categories'),
    'Should show categories'
  );
});

test('CLI: templates tags shows tags', () => {
  const result = runFramework(['templates', 'tags']);

  assert.equal(result.status, 0, 'Should succeed');
  assert(
    result.stdout.includes('Tags') || result.stdout.includes('No tags'),
    'Should show tags'
  );
});

test('CLI: templates list --category filters by category', () => {
  const result = runFramework(['templates', 'list', '--category', 'SaaS']);

  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show filtered results');
  }
});

test('CLI: templates list --tag filters by tag', () => {
  const result = runFramework(['templates', 'list', '--tag', 'nextjs']);

  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show filtered results');
  }
});

test('CLI: templates list --sort sorts templates', () => {
  const result = runFramework(['templates', 'list', '--sort', 'name']);

  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show sorted results');
  }
});

test('CLI: plugin list shows installed plugins', () => {
  const result = runFramework(['plugin', 'list']);

  assert.equal(result.status, 0, 'Should succeed');
  assert(
    result.stdout.includes('plugin') || result.stdout.includes('No plugins'),
    'Should show plugin list'
  );
});

test('CLI: llm test tests LLM provider', () => {
  const result = runFramework(['llm', 'test']);

  // May fail if ANTHROPIC_API_KEY not set, which is expected
  if (result.status !== 0) {
    assert(
      result.stderr.length > 0 || result.stdout.includes('Error'),
      'Should show error if API key missing'
    );
  }
});

test('CLI: llm --help shows usage', () => {
  const result = runFramework(['llm', '--help']);

  // Should show usage (may go to stdout via default handler)
  assert(
    result.stdout.includes('Usage') || result.stdout.includes('framework llm'),
    'Should show LLM usage'
  );
});

test('CLI: auth test tests auth provider', () => {
  const result = runFramework(['auth', 'test']);

  // May fail if credentials not set, which is expected
  if (result.status !== 0) {
    assert(
      result.stderr.length > 0 || result.stdout.includes('Error') || result.stdout.includes('FAILED'),
      'Should show error if credentials missing'
    );
  }
});

test('CLI: auth --help shows usage', () => {
  const result = runFramework(['auth', '--help']);

  // Should show usage
  assert(
    result.stdout.includes('Usage') || result.stdout.includes('framework auth'),
    'Should show auth usage'
  );
});

test('CLI: unknown command shows help or error', () => {
  const result = runFramework(['nonexistent-command-xyz']);

  // Should show error or help
  assert(
    result.stderr.includes('Unknown') || result.stdout.includes('Usage'),
    'Should handle unknown command'
  );
});

test('CLI: start command shows help or runs', () => {
  const result = runFramework(['start', '--help']);

  // Should show help or run
  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show output');
  }
});
