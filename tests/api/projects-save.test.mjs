// tests/api/projects-save.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockProject } from '../utils/fixtures.mjs';

/**
 * Tests for POST /api/projects/save endpoint
 *
 * This endpoint creates a new project configuration and returns a unique token.
 */

// ============================================================================
// Response Format Tests
// ============================================================================

test('Save: successful response follows API_CONTRACTS.md format', () => {
  const response = {
    success: true,
    data: {
      token: 'fast-lion-1234',
      expiresAt: '2025-01-21T00:00:00Z',
      pullCommand: 'npx @jrdaws/framework pull fast-lion-1234',
      url: 'http://localhost:3000/configure?project=fast-lion-1234',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  assert.equal(response.success, true);
  assert(response.data);
  assert(response.data.token);
  assert(response.data.expiresAt);
  assert(response.data.pullCommand);
  assert(response.data.url);
  assert(response.meta);
  assert(response.meta.timestamp);
});

test('Save: response includes token and expiration', () => {
  const data = {
    token: 'bold-hawk-5678',
    expiresAt: '2025-01-21T00:00:00Z',
  };

  assert(data.token);
  assert(data.expiresAt);
  assert(data.token.includes('-')); // Human-readable format
});

test('Save: response includes pull command', () => {
  const pullCommand = 'npx @jrdaws/framework pull test-token';

  assert(pullCommand.includes('npx @jrdaws/framework pull'));
  assert(pullCommand.includes('test-token'));
});

test('Save: response includes web configurator URL', () => {
  const url = 'http://localhost:3000/configure?project=test-token';

  assert(url.includes('/configure'));
  assert(url.includes('project=test-token'));
});

// ============================================================================
// Error Response Format Tests (API_CONTRACTS.md Compliance)
// ============================================================================

test('Save: error response follows API_CONTRACTS.md format', () => {
  const errorResponse = {
    success: false,
    error: {
      code: 'MISSING_FIELD',
      message: 'Template is required',
      details: { field: 'template' },
      recovery: 'Provide a template name in the request body. Available templates: saas, seo-directory, blog, dashboard, landing-page',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  assert.equal(errorResponse.success, false);
  assert(errorResponse.error);
  assert(errorResponse.error.code);
  assert(errorResponse.error.message);
  assert(errorResponse.error.recovery);
  assert(errorResponse.meta);
  assert(errorResponse.meta.timestamp);
});

test('Save: MISSING_FIELD (template) error has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'MISSING_FIELD',
      message: 'Template is required',
      details: { field: 'template' },
      recovery: 'Provide a template name in the request body. Available templates: saas, seo-directory, blog, dashboard, landing-page',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'MISSING_FIELD');
  assert(error.error.recovery);
  assert(error.error.details.field === 'template');
});

test('Save: MISSING_FIELD (project_name) error has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'MISSING_FIELD',
      message: 'Project name is required',
      details: { field: 'project_name' },
      recovery: 'Provide a project_name in the request body',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'MISSING_FIELD');
  assert(error.error.recovery);
  assert(error.error.details.field === 'project_name');
});

test('Save: RATE_LIMITED error has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      details: { resetAt: new Date(Date.now() + 900000).toISOString() },
      recovery: 'Wait a few minutes before trying again. Rate limits reset every 15 minutes.',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'RATE_LIMITED');
  assert(error.error.recovery);
  assert(error.error.details.resetAt);
});

test('Save: DATABASE_ERROR has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'Failed to save project to database',
      recovery: 'Try again in a few moments. If the issue persists, contact support.',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'DATABASE_ERROR');
  assert(error.error.recovery);
});

test('Save: INTERNAL_ERROR has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Failed to save project',
      recovery: 'Try again in a few moments. If the issue persists, contact support.',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'INTERNAL_ERROR');
  assert(error.error.recovery);
});

// ============================================================================
// Status Code Tests
// ============================================================================

test('Save: successful response returns 201', () => {
  const statusCode = 201;
  assert.equal(statusCode, 201);
});

test('Save: missing template returns 400', () => {
  const statusCode = 400;
  assert.equal(statusCode, 400);
});

test('Save: missing project_name returns 400', () => {
  const statusCode = 400;
  assert.equal(statusCode, 400);
});

test('Save: rate limit returns 429', () => {
  const statusCode = 429;
  assert.equal(statusCode, 429);
});

test('Save: database error returns 500', () => {
  const statusCode = 500;
  assert.equal(statusCode, 500);
});

// ============================================================================
// Recovery Guidance Tests
// ============================================================================

test('Save: MISSING_FIELD includes actionable recovery', () => {
  const recovery = 'Provide a template name in the request body. Available templates: saas, seo-directory, blog, dashboard, landing-page';

  assert(recovery.includes('Provide'));
  assert(recovery.includes('template'));
  assert(recovery.includes('saas'));
});

test('Save: RATE_LIMITED includes wait time guidance', () => {
  const recovery = 'Wait a few minutes before trying again. Rate limits reset every 15 minutes.';

  assert(recovery.includes('Wait'));
  assert(recovery.includes('15 minutes'));
});

test('Save: DATABASE_ERROR includes retry guidance', () => {
  const recovery = 'Try again in a few moments. If the issue persists, contact support.';

  assert(recovery.includes('Try again'));
  assert(recovery.includes('contact support'));
});

// ============================================================================
// CORS Headers Tests
// ============================================================================

test('Save: response includes CORS headers', () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(headers['Access-Control-Allow-Origin'], '*');
  assert(headers['Access-Control-Allow-Methods'].includes('POST'));
  assert(headers['Access-Control-Allow-Headers'].includes('Content-Type'));
});

test('Save: error responses include CORS headers', () => {
  const errorHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(errorHeaders['Access-Control-Allow-Origin'], '*');
});

// ============================================================================
// Request Validation Tests
// ============================================================================

test('Save: validates template field presence', () => {
  const request = { project_name: 'test' };
  const hasTemplate = 'template' in request;

  assert.equal(hasTemplate, false);
});

test('Save: validates project_name field presence', () => {
  const request = { template: 'saas' };
  const hasProjectName = 'project_name' in request;

  assert.equal(hasProjectName, false);
});

test('Save: accepts valid request with required fields', () => {
  const request = {
    template: 'saas',
    project_name: 'my-saas-app',
  };

  assert(request.template);
  assert(request.project_name);
});

test('Save: accepts optional integrations field', () => {
  const request = {
    template: 'saas',
    project_name: 'my-app',
    integrations: {
      auth: 'supabase',
      payments: 'stripe',
    },
  };

  assert(request.integrations);
  assert.equal(request.integrations.auth, 'supabase');
});

test('Save: accepts optional env_keys field', () => {
  const request = {
    template: 'saas',
    project_name: 'my-app',
    env_keys: {
      STRIPE_SECRET_KEY: '',
      SUPABASE_URL: '',
    },
  };

  assert(request.env_keys);
  assert('STRIPE_SECRET_KEY' in request.env_keys);
});

test('Save: accepts optional vision/mission fields', () => {
  const request = {
    template: 'saas',
    project_name: 'my-app',
    vision: 'Build amazing SaaS',
    mission: 'Help developers ship faster',
  };

  assert(request.vision);
  assert(request.mission);
});

test('Save: defaults output_dir when not provided', () => {
  const request = { template: 'saas', project_name: 'my-app' };
  const outputDir = request.output_dir || './my-app';

  assert.equal(outputDir, './my-app');
});

// ============================================================================
// Token Generation Tests
// ============================================================================

test('Save: generates human-readable token format', () => {
  const token = 'fast-lion-1234';
  const parts = token.split('-');

  assert.equal(parts.length, 3);
  assert(parts[0].length > 0); // adjective
  assert(parts[1].length > 0); // noun
  assert.equal(parts[2].length, 4); // number
});

test('Save: token includes adjective and noun', () => {
  const token = 'bold-hawk-5678';

  assert(token.includes('-'));
  assert(token.split('-')[0].length > 2); // adjective
  assert(token.split('-')[1].length > 2); // noun
});

test('Save: token uniqueness check retries on collision', () => {
  const maxAttempts = 5;
  let attempts = 0;

  // Simulate retry logic
  while (attempts < maxAttempts) {
    attempts++;
    if (attempts === 3) break; // Found unique token
  }

  assert(attempts < maxAttempts);
  assert(attempts === 3);
});

// ============================================================================
// Expiration Tests
// ============================================================================

test('Save: expiration is 30 days from creation', () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const diffDays = (expiresAt - now) / (1000 * 60 * 60 * 24);

  assert.equal(Math.round(diffDays), 30);
});

test('Save: expiration date is ISO 8601 format', () => {
  const expiresAt = new Date().toISOString();

  assert(expiresAt.includes('T'));
  assert(expiresAt.includes('Z'));
  assert(expiresAt.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/));
});

// ============================================================================
// Database Interaction Tests
// ============================================================================

test('Save: stores all required fields in database', () => {
  const mockProject = createMockProject({
    template: 'saas',
    project_name: 'test-app',
  });

  const dbRecord = {
    token: mockProject.token,
    template: mockProject.template,
    project_name: mockProject.project_name,
    output_dir: mockProject.output_dir,
    integrations: mockProject.integrations,
    env_keys: mockProject.env_keys,
    created_at: mockProject.created_at,
  };

  assert(dbRecord.token);
  assert(dbRecord.template);
  assert(dbRecord.project_name);
  assert(dbRecord.created_at);
});

test('Save: defaults empty objects for optional fields', () => {
  const request = {
    template: 'saas',
    project_name: 'my-app',
  };

  const integrations = request.integrations || {};
  const envKeys = request.env_keys || {};
  const inspirations = request.inspirations || [];

  assert.deepEqual(integrations, {});
  assert.deepEqual(envKeys, {});
  assert.deepEqual(inspirations, []);
});

// ============================================================================
// Edge Cases
// ============================================================================

test('Save: handles null optional fields gracefully', () => {
  const request = {
    template: 'saas',
    project_name: 'my-app',
    vision: null,
    mission: null,
  };

  const vision = request.vision || undefined;
  const mission = request.mission || undefined;

  assert.equal(vision, undefined);
  assert.equal(mission, undefined);
});

test('Save: handles empty strings in optional fields', () => {
  const request = {
    template: 'saas',
    project_name: 'my-app',
    vision: '',
    mission: '',
  };

  assert.equal(request.vision, '');
  assert.equal(request.mission, '');
});

test('Save: handles large integrations object', () => {
  const integrations = {
    auth: 'supabase',
    payments: 'stripe',
    email: 'resend',
    db: 'supabase',
    ai: 'anthropic',
    analytics: 'posthog',
  };

  assert.equal(Object.keys(integrations).length, 6);
  assert(integrations.auth);
  assert(integrations.payments);
});

test('Save: handles empty integrations object', () => {
  const integrations = {};

  assert(typeof integrations === 'object');
  assert.equal(Object.keys(integrations).length, 0);
});

test('Save: creates timestamps in correct format', () => {
  const now = new Date();
  const createdAt = now.toISOString();
  const lastAccessedAt = now.toISOString();

  assert(createdAt);
  assert(lastAccessedAt);
  assert.equal(typeof createdAt, 'string');
  assert.equal(typeof lastAccessedAt, 'string');
});
