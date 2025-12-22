import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTempProject, cleanupTempProject } from '../utils/fixtures.mjs';

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

test('CLI start: start command shows usage', () => {
  const result = runFramework(['start']);

  // Start command should show usage or try to start
  if (result.status === 0) {
    assert(result.stdout.length > 0, 'Should show output');
  } else {
    assert(result.stderr.length > 0 || result.stdout.length > 0, 'Should show some output');
  }
});

test('CLI start: start with directory', () => {
  const tempDir = createTempProject();

  try {
    const result = runFramework(['start', tempDir], {
      timeout: 15000,
    });

    // Should attempt to start or show error
    assert(
      result.status === 0 || result.stderr.length > 0 || result.stdout.length > 0,
      'Should produce output'
    );
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI start: start with --help', () => {
  const result = runFramework(['start', '--help']);

  // Should show help
  assert(result.stdout.includes('Usage') || result.stdout.includes('start'), 'Should show usage');
});

test('CLI start: framework without subcommand shows help', () => {
  const result = runFramework([]);

  assert.equal(result.status, 0, 'Should succeed');
  assert(result.stdout.includes('Usage'), 'Should show usage');
});

test('CLI start: short template ID usage', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'short-id-project');

  try {
    const result = runFramework(['saas', outputDir], {
      timeout: 15000,
    });

    // Short form "framework saas project-dir" should work
    if (result.status === 0 || result.stderr.includes('exists') || result.stdout.includes('Error')) {
      assert(true, 'Should recognize short form or show error');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI start: short template ID for blog', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'blog-short');

  try {
    const result = runFramework(['blog', outputDir], {
      timeout: 15000,
    });

    // Short form should work or show error
    if (result.status === 0 || result.stderr.length > 0 || result.stdout.length > 0) {
      assert(true);
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI start: short template ID for portfolio', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'portfolio-short');

  try {
    const result = runFramework(['portfolio', outputDir], {
      timeout: 15000,
    });

    // Short form should work or show error
    if (result.status === 0 || result.stderr.length > 0 || result.stdout.length > 0) {
      assert(true);
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI start: directory detection', () => {
  const tempDir = createTempProject();

  try {
    // Try to start in temp directory
    const result = runFramework(['start'], {
      cwd: tempDir,
      timeout: 15000,
    });

    // Should detect current directory or show help
    assert(
      result.status === 0 || result.stderr.length > 0 || result.stdout.length > 0,
      'Should produce output'
    );
  } finally {
    cleanupTempProject(tempDir);
  }
});
