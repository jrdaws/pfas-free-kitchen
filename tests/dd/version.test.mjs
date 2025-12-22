import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentVersion, getPackageName, compareVersions, getUpgradeCommand } from '../../src/dd/version.mjs';

test('version: getCurrentVersion returns version string', () => {
  const version = getCurrentVersion();
  assert(typeof version === 'string');
  assert(version.length > 0);
  assert(version.match(/^\d+\.\d+\.\d+/));
});

test('version: getPackageName returns package name', () => {
  const name = getPackageName();
  assert(typeof name === 'string');
  assert(name.length > 0);
});

test('version: compareVersions compares versions correctly', () => {
  assert.equal(compareVersions('1.0.0', '1.0.0'), 0);
  assert.equal(compareVersions('1.0.1', '1.0.0'), 1);
  assert.equal(compareVersions('1.0.0', '1.0.1'), -1);
  assert.equal(compareVersions('2.0.0', '1.9.9'), 1);
  assert.equal(compareVersions('1.9.9', '2.0.0'), -1);
});

test('version: compareVersions handles major versions', () => {
  assert.equal(compareVersions('2.0.0', '1.0.0'), 1);
  assert.equal(compareVersions('1.0.0', '2.0.0'), -1);
});

test('version: compareVersions handles minor versions', () => {
  assert.equal(compareVersions('1.2.0', '1.1.0'), 1);
  assert.equal(compareVersions('1.1.0', '1.2.0'), -1);
});

test('version: compareVersions handles patch versions', () => {
  assert.equal(compareVersions('1.0.2', '1.0.1'), 1);
  assert.equal(compareVersions('1.0.1', '1.0.2'), -1);
});

test('version: compareVersions handles equal versions', () => {
  assert.equal(compareVersions('1.5.3', '1.5.3'), 0);
});

test('version: compareVersions returns 1 for higher version', () => {
  assert.equal(compareVersions('2.0.0', '1.5.0'), 1);
});

test('version: compareVersions returns -1 for lower version', () => {
  assert.equal(compareVersions('1.0.0', '1.5.0'), -1);
});

test('version: getUpgradeCommand returns npm command', () => {
  const command = getUpgradeCommand('@jrdaws/framework');
  assert(typeof command === 'string');
  assert(command.includes('npm install -g'));
  assert(command.includes('@jrdaws/framework'));
});
