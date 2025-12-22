// tests/cli/pull.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePullFlags,
  getApiUrl,
  fetchProject,
  generateEnvExample,
  generateContext,
  formatIntegrations,
} from '../../src/dd/pull.mjs';
import { createMockProject, createMockFetch } from '../utils/fixtures.mjs';

test('parsePullFlags: empty args returns defaults', () => {
  const flags = parsePullFlags([]);
  assert.deepEqual(flags, {
    dryRun: false,
    cursor: false,
    open: false,
    force: false,
    dev: false,
  });
});

test('parsePullFlags: --dry-run flag', () => {
  const flags = parsePullFlags(['--dry-run']);
  assert.equal(flags.dryRun, true);
});

test('parsePullFlags: --cursor flag', () => {
  const flags = parsePullFlags(['--cursor']);
  assert.equal(flags.cursor, true);
});

test('parsePullFlags: --open flag', () => {
  const flags = parsePullFlags(['--open']);
  assert.equal(flags.open, true);
});

test('parsePullFlags: --force flag', () => {
  const flags = parsePullFlags(['--force']);
  assert.equal(flags.force, true);
});

test('parsePullFlags: --dev flag', () => {
  const flags = parsePullFlags(['--dev']);
  assert.equal(flags.dev, true);
});

test('parsePullFlags: multiple flags', () => {
  const flags = parsePullFlags(['--cursor', '--open', '--force']);
  assert.equal(flags.cursor, true);
  assert.equal(flags.open, true);
  assert.equal(flags.force, true);
});

test('getApiUrl: returns production URL by default', () => {
  const originalEnv = process.env.DD_API_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  delete process.env.DD_API_URL;
  delete process.env.NODE_ENV;

  const url = getApiUrl();
  assert.equal(url, 'https://dawson.dev');

  // Restore env
  if (originalEnv) process.env.DD_API_URL = originalEnv;
  if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv;
});

test('getApiUrl: returns dev URL when dev=true', () => {
  const originalEnv = process.env.DD_API_URL;
  delete process.env.DD_API_URL;

  const url = getApiUrl(true);
  assert.equal(url, 'http://localhost:3002');

  if (originalEnv) process.env.DD_API_URL = originalEnv;
});

test('getApiUrl: respects DD_API_URL env var', () => {
  const originalEnv = process.env.DD_API_URL;
  process.env.DD_API_URL = 'https://custom-api.com';

  const url = getApiUrl();
  assert.equal(url, 'https://custom-api.com');

  if (originalEnv) process.env.DD_API_URL = originalEnv;
  else delete process.env.DD_API_URL;
});

test('fetchProject: handles successful response', async () => {
  const mockProject = createMockProject();
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: mockProject,
      meta: { timestamp: new Date().toISOString() },
    }),
  });

  const result = await fetchProject('test-token', 'https://dawson.dev');
  assert.equal(result.success, true);
  assert.deepEqual(result.project, mockProject);

  global.fetch = originalFetch;
});

test('fetchProject: handles 404 error', async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({
      success: false,
      error: {
        code: 'TOKEN_NOT_FOUND',
        message: 'Project with token "invalid-token" not found',
        recovery: 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure',
      },
      meta: { timestamp: new Date().toISOString() },
    }),
  });

  const result = await fetchProject('invalid-token', 'https://dawson.dev');
  assert.equal(result.success, false);
  assert.equal(result.status, 404);
  assert(result.error.includes('not found'));
  assert(result.recovery.includes('Verify the token'));

  global.fetch = originalFetch;
});

test('fetchProject: handles network error', async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    throw new Error('Network error');
  };

  const result = await fetchProject('test-token', 'https://dawson.dev');
  assert.equal(result.success, false);
  assert(result.error.includes('Network error'));

  global.fetch = originalFetch;
});

test('generateEnvExample: creates basic env file', () => {
  const project = createMockProject();
  const envContent = generateEnvExample(project);

  assert(envContent.includes('# Environment Variables'));
  assert(envContent.includes('NEXT_PUBLIC_APP_URL='));
});

test('generateEnvExample: includes Supabase auth vars', () => {
  const project = createMockProject({
    integrations: { auth: 'supabase' },
  });
  const envContent = generateEnvExample(project);

  assert(envContent.includes('# Supabase'));
  assert(envContent.includes('NEXT_PUBLIC_SUPABASE_URL='));
  assert(envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY='));
});

test('generateEnvExample: includes Stripe payment vars', () => {
  const project = createMockProject({
    integrations: { payments: 'stripe' },
  });
  const envContent = generateEnvExample(project);

  assert(envContent.includes('# Stripe'));
  assert(envContent.includes('STRIPE_SECRET_KEY='));
  assert(envContent.includes('STRIPE_WEBHOOK_SECRET='));
});

test('generateEnvExample: includes custom env_keys', () => {
  const project = createMockProject({
    env_keys: {
      CUSTOM_API_KEY: 'test-key',
      ANOTHER_VAR: 'test-value',
    },
  });
  const envContent = generateEnvExample(project);

  assert(envContent.includes('CUSTOM_API_KEY=test-key'));
  assert(envContent.includes('ANOTHER_VAR=test-value'));
});

test('generateContext: creates valid context object', () => {
  const project = createMockProject({
    vision: 'Build the best app',
    mission: 'Help users succeed',
  });

  const context = generateContext(project);

  assert.equal(context.schemaVersion, 1);
  assert(context.generatedAt);
  assert.equal(context.project.name, 'test-project');
  assert.equal(context.project.template, 'saas');
  assert.equal(context.context.vision, 'Build the best app');
  assert.equal(context.context.mission, 'Help users succeed');
});

test('formatIntegrations: handles no integrations', () => {
  const result = formatIntegrations({});
  assert.equal(result, 'none');
});

test('formatIntegrations: handles null integrations', () => {
  const result = formatIntegrations(null);
  assert.equal(result, 'none');
});

test('formatIntegrations: formats single integration', () => {
  const result = formatIntegrations({ auth: 'supabase' });
  assert.equal(result, 'auth:supabase');
});

test('formatIntegrations: formats multiple integrations', () => {
  const result = formatIntegrations({
    auth: 'supabase',
    payments: 'stripe',
    email: 'resend',
  });
  assert(result.includes('auth:supabase'));
  assert(result.includes('payments:stripe'));
  assert(result.includes('email:resend'));
});

test('formatIntegrations: ignores null values', () => {
  const result = formatIntegrations({
    auth: 'supabase',
    payments: null,
    email: 'resend',
  });
  assert(result.includes('auth:supabase'));
  assert(!result.includes('payments'));
  assert(result.includes('email:resend'));
});
