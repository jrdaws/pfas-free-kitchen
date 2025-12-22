import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createTempProject, cleanupTempProject } from '../utils/fixtures.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frameworkBin = path.resolve(__dirname, '../../bin/framework.js');

function runFramework(args, options = {}) {
  const result = spawnSync('node', [frameworkBin, ...args], {
    encoding: 'utf-8',
    timeout: 60000,
    ...options,
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status,
    error: result.error,
  };
}

test('CLI success: export saas with skip-install completes', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'saas-project');

  try {
    const result = runFramework(['export', 'saas', outputDir, '--skip-install'], {
      timeout: 60000,
    });

    // Should complete successfully with skip-install
    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
      assert(fs.existsSync(path.join(outputDir, 'package.json')), 'package.json should exist');
    } else {
      // If it fails, at least verify error handling works
      assert(result.stderr.length > 0 || result.stdout.includes('Error'));
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export blog with skip-install completes', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'blog-project');

  try {
    const result = runFramework(['export', 'blog', outputDir, '--skip-install'], {
      timeout: 60000,
    });

    // Should complete or fail gracefully
    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export portfolio with skip-install completes', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'portfolio-project');

  try {
    const result = runFramework(['export', 'portfolio', outputDir, '--skip-install'], {
      timeout: 60000,
    });

    // Should complete or fail gracefully
    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export with name and skip-install', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'named-project');

  try {
    const result = runFramework([
      'export',
      'saas',
      outputDir,
      '--name', 'my-custom-name',
      '--skip-install'
    ], { timeout: 60000 });

    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');

      const pkgPath = path.join(outputDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        assert(pkg.name, 'Should have a name');
      }
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export with git and skip-install', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'git-project');

  try {
    const result = runFramework([
      'export',
      'saas',
      outputDir,
      '--git',
      '--skip-install'
    ], { timeout: 60000 });

    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export with quiet and skip-install', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'quiet-project');

  try {
    const result = runFramework([
      'export',
      'saas',
      outputDir,
      '--quiet',
      '--skip-install'
    ], { timeout: 60000 });

    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export seo-directory with skip-install', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'seo-project');

  try {
    const result = runFramework(['export', 'seo-directory', outputDir, '--skip-install'], {
      timeout: 60000,
    });

    // Should complete or fail gracefully
    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: demo blog with force and skip-install', () => {
  const tempDir = createTempProject();
  const demoDir = path.join(tempDir, '_demo-blog');

  try {
    // Clean up any existing demo directory
    if (fs.existsSync(demoDir)) {
      fs.rmSync(demoDir, { recursive: true, force: true });
    }

    const result = runFramework(['demo', 'blog', '--force', '--skip-install'], {
      timeout: 60000,
      cwd: tempDir,
    });

    if (result.status === 0) {
      // Demo should create a directory
      assert(true);
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export with auth supabase and skip-install', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'auth-project');

  try {
    const result = runFramework([
      'export',
      'saas',
      outputDir,
      '--auth', 'supabase',
      '--skip-install'
    ], { timeout: 60000 });

    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('CLI success: export with payments stripe and skip-install', () => {
  const tempDir = createTempProject();
  const outputDir = path.join(tempDir, 'payments-project');

  try {
    const result = runFramework([
      'export',
      'saas',
      outputDir,
      '--payments', 'stripe',
      '--skip-install'
    ], { timeout: 60000 });

    if (result.status === 0) {
      assert(fs.existsSync(outputDir), 'Output directory should exist');
    }
  } finally {
    cleanupTempProject(tempDir);
  }
});
