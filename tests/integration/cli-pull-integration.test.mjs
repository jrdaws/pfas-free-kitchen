// tests/integration/cli-pull-integration.test.mjs
/**
 * Integration test for CLI pull command with new API format
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchProject } from '../../src/dd/pull.mjs';

test('Integration: CLI pull handles new API success format', async () => {
  const originalFetch = global.fetch;

  // Mock the new API format
  global.fetch = async (url) => {
    if (url.includes('/api/projects/test-token-success')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            token: 'test-token-success',
            template: 'saas',
            project_name: 'integration-test',
            output_dir: './integration-test',
            integrations: {
              auth: 'supabase',
              payments: 'stripe',
            },
            env_keys: {
              STRIPE_SECRET_KEY: '',
            },
            vision: 'Test CLI integration',
            mission: 'Verify new API format works',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_accessed_at: new Date().toISOString(),
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    };
  };

  const result = await fetchProject('test-token-success', 'https://dawson.dev');

  // Verify the CLI correctly extracts project from new format
  assert.equal(result.success, true);
  assert(result.project);
  assert.equal(result.project.token, 'test-token-success');
  assert.equal(result.project.template, 'saas');
  assert.equal(result.project.project_name, 'integration-test');
  assert(result.project.integrations);
  assert.equal(result.project.integrations.auth, 'supabase');

  global.fetch = originalFetch;
});

test('Integration: CLI pull handles new API error format with recovery', async () => {
  const originalFetch = global.fetch;

  // Mock the new API error format
  global.fetch = async (url) => {
    if (url.includes('/api/projects/expired-token')) {
      return {
        ok: false,
        status: 410,
        json: async () => ({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Project "expired-token" has expired. Projects expire after 30 days.',
            details: {
              expiredAt: '2025-01-01T00:00:00.000Z',
              helpUrl: 'http://localhost:3000/configure',
            },
            recovery: 'Create a new project configuration at https://dawson.dev/configure',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    };
  };

  const result = await fetchProject('expired-token', 'https://dawson.dev');

  // Verify the CLI correctly extracts error info and recovery guidance
  assert.equal(result.success, false);
  assert.equal(result.status, 410);
  assert(result.error);
  assert(result.error.includes('expired'));
  assert(result.recovery);
  assert(result.recovery.includes('Create a new project'));
  assert(result.recovery.includes('dawson.dev/configure'));

  global.fetch = originalFetch;
});

test('Integration: CLI pull handles TOKEN_NOT_FOUND error', async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url) => {
    if (url.includes('/api/projects/invalid-token')) {
      return {
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: 'Project with token "invalid-token" not found',
            recovery: 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    };
  };

  const result = await fetchProject('invalid-token', 'https://dawson.dev');

  assert.equal(result.success, false);
  assert.equal(result.status, 404);
  assert(result.error.includes('not found'));
  assert(result.recovery.includes('Verify the token'));

  global.fetch = originalFetch;
});

test('Integration: CLI pull handles rate limit error', async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url) => {
    if (url.includes('/api/projects/rate-limited')) {
      return {
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
            details: {
              resetAt: new Date(Date.now() + 900000).toISOString(),
            },
            recovery: 'Wait a few minutes before trying again. Rate limits reset every 15 minutes.',
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }),
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    };
  };

  const result = await fetchProject('rate-limited', 'https://dawson.dev');

  assert.equal(result.success, false);
  assert.equal(result.status, 429);
  assert(result.error.includes('Too many requests'));
  assert(result.recovery.includes('Wait a few minutes'));
  assert(result.recovery.includes('15 minutes'));

  global.fetch = originalFetch;
});

test('Integration: CLI pull backwards compatible with old API format', async () => {
  const originalFetch = global.fetch;

  // Mock the OLD API format (before standardization)
  global.fetch = async (url) => {
    if (url.includes('/api/projects/old-format-token')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          project: {  // Old format used "project" not "data"
            token: 'old-format-token',
            template: 'saas',
            project_name: 'old-format-test',
            output_dir: './old-format-test',
            integrations: {},
            env_keys: {},
          },
        }),
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    };
  };

  const result = await fetchProject('old-format-token', 'https:// dawson.dev');

  // Verify CLI still works with old format
  assert.equal(result.success, true);
  assert(result.project);
  assert.equal(result.project.token, 'old-format-token');
  assert.equal(result.project.template, 'saas');

  global.fetch = originalFetch;
});
