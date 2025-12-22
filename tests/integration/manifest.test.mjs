// tests/integration/manifest.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createTempProject, cleanupTempProject, createMockManifest } from '../utils/fixtures.mjs';
import { assertValidManifest } from '../utils/assertions.mjs';
import { writeManifest } from '../../src/dd/manifest.mjs';

test('writeManifest: creates valid manifest', () => {
  const tempDir = createTempProject();

  try {
    const manifestPath = writeManifest(tempDir, {
      templateId: 'saas',
      flags: { afterInstall: 'prompt' },
      resolved: { mode: 'local', localPath: '/path/to/template' },
    });

    assert(fs.existsSync(manifestPath), 'Manifest file not created');
    assertValidManifest(manifestPath);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.templateId, 'saas');
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('writeManifest: includes integrations', () => {
  const tempDir = createTempProject();

  try {
    const manifestPath = writeManifest(tempDir, {
      templateId: 'saas',
      flags: {
        afterInstall: 'prompt',
        integrations: {
          auth: 'supabase',
          payments: 'stripe',
        },
      },
      resolved: { mode: 'local', localPath: '/path/to/template' },
    });

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.integrations.auth, 'supabase');
    assert.equal(manifest.integrations.payments, 'stripe');
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('writeManifest: includes timestamp', () => {
  const tempDir = createTempProject();

  try {
    const beforeTime = new Date().toISOString();
    const manifestPath = writeManifest(tempDir, {
      templateId: 'saas',
      flags: {},
      resolved: { mode: 'local' },
    });
    const afterTime = new Date().toISOString();

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert(manifest.generatedAt, 'Manifest missing generatedAt');
    assert(manifest.generatedAt >= beforeTime, 'Timestamp too early');
    assert(manifest.generatedAt <= afterTime, 'Timestamp too late');
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('manifest validation: rejects invalid manifest', () => {
  const tempDir = createTempProject();

  try {
    const ddDir = path.join(tempDir, '.dd');
    fs.mkdirSync(ddDir, { recursive: true });

    // Create invalid manifest (missing required fields)
    const manifestPath = path.join(ddDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({ invalid: true }));

    assert.throws(() => {
      assertValidManifest(manifestPath);
    }, 'Should reject invalid manifest');
  } finally {
    cleanupTempProject(tempDir);
  }
});

test('manifest validation: accepts valid manifest', () => {
  const tempDir = createTempProject();

  try {
    createMockManifest(tempDir, {
      version: 1,
      templateId: 'saas',
      generatedAt: new Date().toISOString(),
    });

    const manifestPath = path.join(tempDir, '.dd/manifest.json');
    assert.doesNotThrow(() => {
      assertValidManifest(manifestPath);
    });
  } finally {
    cleanupTempProject(tempDir);
  }
});
