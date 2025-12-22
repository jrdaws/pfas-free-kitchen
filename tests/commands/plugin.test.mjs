import test from 'node:test';
import assert from 'node:assert/strict';
import { cmdPlugin } from '../../src/commands/plugin.mjs';
import { createTempProject, cleanupTempProject } from '../utils/fixtures.mjs';
import fs from 'node:fs';
import path from 'node:path';

test('plugin: no args shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdPlugin([]);
    assert(output.includes('Plugin Management Commands'));
    assert(output.includes('framework plugin add'));
  } finally {
    console.log = originalLog;
  }
});

test('plugin: help subcommand shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdPlugin(['help']);
    assert(output.includes('Plugin Management Commands'));
  } finally {
    console.log = originalLog;
  }
});

test('plugin: list with no plugins shows message', async () => {
  const tempDir = createTempProject();
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdPlugin(['list', tempDir]);
    assert(output.includes('No plugins installed'));
  } finally {
    console.log = originalLog;
    cleanupTempProject(tempDir);
  }
});

test('plugin: hooks shows available hook points', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdPlugin(['hooks']);
    assert(output.includes('Available Hook Points'));
    assert(output.includes('Export:') || output.includes('pre:export'));
  } finally {
    console.log = originalLog;
  }
});

test('plugin: unknown subcommand exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdPlugin(['unknown-command']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Unknown plugin subcommand'));
  assert.equal(exitCode, 1);
});

test('plugin: add without path exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdPlugin(['add']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Plugin path is required'));
  assert.equal(exitCode, 1);
});

test('plugin: remove without name exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdPlugin(['remove']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Plugin name is required'));
  assert.equal(exitCode, 1);
});

test('plugin: info without path exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdPlugin(['info']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Plugin path is required'));
  assert.equal(exitCode, 1);
});
