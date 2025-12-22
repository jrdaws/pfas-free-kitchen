import test from 'node:test';
import assert from 'node:assert/strict';
import { cmdAuth } from '../../src/commands/auth.mjs';

test('auth: no args shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdAuth([]);
    assert(output.includes('Usage: framework auth'));
    assert(output.includes('test'));
  } finally {
    console.log = originalLog;
  }
});

test('auth: help shows usage', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdAuth(['help']);
    assert(output.includes('Usage: framework auth'));
  } finally {
    console.log = originalLog;
  }
});

test('auth: unknown subcommand shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdAuth(['unknown']);
    assert(output.includes('Usage: framework auth'));
  } finally {
    console.log = originalLog;
  }
});
