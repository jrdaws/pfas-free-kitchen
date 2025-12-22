import test from 'node:test';
import assert from 'node:assert/strict';
import { cmdTemplates } from '../../src/commands/templates.mjs';

test('templates: no args shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdTemplates([]);
    assert(output.includes('Template Management Commands'));
    assert(output.includes('framework templates list'));
  } finally {
    console.log = originalLog;
  }
});

test('templates: help subcommand shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdTemplates(['help']);
    assert(output.includes('Template Management Commands'));
  } finally {
    console.log = originalLog;
  }
});

test('templates: list shows templates', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdTemplates(['list']);
    assert(output.includes('Available Templates') || output.includes('No templates found'));
  } finally {
    console.log = originalLog;
  }
});

test('templates: categories shows categories', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdTemplates(['categories']);
    assert(output.includes('Template Categories') || output.includes('No categories found'));
  } finally {
    console.log = originalLog;
  }
});

test('templates: tags shows tags', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdTemplates(['tags']);
    assert(output.includes('Template Tags') || output.includes('No tags found'));
  } finally {
    console.log = originalLog;
  }
});

test('templates: unknown subcommand exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdTemplates(['unknown-command']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Unknown templates subcommand'));
  assert.equal(exitCode, 1);
});

test('templates: search without query exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdTemplates(['search']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Search query is required'));
  assert.equal(exitCode, 1);
});

test('templates: info without id exits with error', async () => {
  let errorOutput = '';
  const originalError = console.error;
  const originalExit = process.exit;
  let exitCode = null;

  console.error = (msg) => { errorOutput += msg + '\n'; };
  process.exit = (code) => { exitCode = code; throw new Error('EXIT'); };

  try {
    await cmdTemplates(['info']);
  } catch (e) {
    if (e.message !== 'EXIT') throw e;
  } finally {
    console.error = originalError;
    process.exit = originalExit;
  }

  assert(errorOutput.includes('Template ID is required'));
  assert.equal(exitCode, 1);
});

test('templates: search with query shows results', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdTemplates(['search', 'saas']);
    assert(output.includes('Search Results') || output.includes('No templates found'));
  } finally {
    console.log = originalLog;
  }
});
