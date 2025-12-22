import test from 'node:test';
import assert from 'node:assert/strict';
import { cmdLLM } from '../../src/commands/llm.mjs';

test('llm: no args shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdLLM([]);
    assert(output.includes('Usage: framework llm'));
    assert(output.includes('test'));
  } finally {
    console.log = originalLog;
  }
});

test('llm: help shows usage', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdLLM(['help']);
    assert(output.includes('Usage: framework llm'));
  } finally {
    console.log = originalLog;
  }
});

test('llm: unknown subcommand shows help', async () => {
  let output = '';
  const originalLog = console.log;
  console.log = (msg) => { output += msg + '\n'; };

  try {
    await cmdLLM(['unknown']);
    assert(output.includes('Usage: framework llm'));
  } finally {
    console.log = originalLog;
  }
});
