// tests/dd/logger.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as logger from '../../src/dd/logger.mjs';

test('logger: log outputs message', () => {
  assert.doesNotThrow(() => logger.log('test message'));
});

test('logger: formatStep formats step correctly', () => {
  const formatted = logger.formatStep(1, 5, 'Test step');
  assert(formatted.includes('[1/5]'));
  assert(formatted.includes('Test step'));
});
