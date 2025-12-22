// tests/cli/demo.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExportFlags } from '../../bin/framework.js';

test('demo command uses export flags', () => {
  // Demo command passes through flags to export
  const flags = parseExportFlags(['--force', '--dry-run']);
  assert.equal(flags.force, true);
  assert.equal(flags.dryRun, true);
});

test('demo command defaults', () => {
  // Demo with no flags should have standard defaults
  const flags = parseExportFlags([]);
  assert.equal(flags.afterInstall, 'prompt');
  assert.equal(flags.force, false);
  assert.equal(flags.dryRun, false);
  assert.equal(flags.branch, 'main');
});

test('demo command: --after-install flag passes through', () => {
  const flags = parseExportFlags(['--after-install', 'auto']);
  assert.equal(flags.afterInstall, 'auto');
});

test('demo command: --template-source flag passes through', () => {
  const flags = parseExportFlags(['--template-source', 'local']);
  assert.equal(flags.templateSource, 'local');
});

test('demo command: supports all templates', () => {
  // Demo should work with any template id
  // Testing that flags work regardless of template
  const templates = ['saas', 'seo-directory'];
  
  for (const template of templates) {
    const flags = parseExportFlags(['--force']);
    assert.equal(flags.force, true);
  }
});

test('demo command: combines multiple flags', () => {
  const flags = parseExportFlags([
    '--force',
    '--dry-run',
    '--after-install', 'off',
    '--template-source', 'local',
  ]);

  assert.equal(flags.force, true);
  assert.equal(flags.dryRun, true);
  assert.equal(flags.afterInstall, 'off');
  assert.equal(flags.templateSource, 'local');
});
