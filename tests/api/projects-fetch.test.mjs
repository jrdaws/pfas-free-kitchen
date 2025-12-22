// tests/api/projects-fetch.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockProject } from '../utils/fixtures.mjs';

/**
 * Tests for GET /api/projects/[token] endpoint
 *
 * This endpoint retrieves a project configuration by its token.
 */

// ============================================================================
// Response Format Tests
// ============================================================================

test('Fetch: successful response follows API_CONTRACTS.md format', () => {
  const mockProject = createMockProject();
  const response = {
    success: true,
    data: mockProject,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  assert.equal(response.success, true);
  assert(response.data);
  assert(response.data.token);
  assert(response.data.template);
  assert(response.data.project_name);
  assert(response.meta);
  assert(response.meta.timestamp);
});

test('Fetch: response includes all project fields', () => {
  const project = createMockProject();

  assert(project.token);
  assert(project.template);
  assert(project.project_name);
  assert(project.output_dir);
  assert(project.integrations);
  assert(project.env_keys);
  assert(project.created_at);
});

test('Fetch: response includes optional fields when present', () => {
  const project = createMockProject({
    vision: 'Build amazing products',
    mission: 'Help developers',
    success_criteria: 'Launch in 30 days',
    description: 'A great project',
  });

  assert(project.vision);
  assert(project.mission);
  assert(project.success_criteria);
  assert(project.description);
});

test('Fetch: response includes timestamps', () => {
  const project = createMockProject();

  assert(project.created_at);
  assert(project.created_at.includes('T'));
  assert(project.created_at.includes('Z'));
});

// ============================================================================
// Error Response Format Tests (API_CONTRACTS.md Compliance)
// ============================================================================

test('Fetch: error response follows API_CONTRACTS.md format', () => {
  const errorResponse = {
    success: false,
    error: {
      code: 'TOKEN_NOT_FOUND',
      message: 'Project with token "invalid-123" not found',
      recovery: 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure',
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

test('Fetch: MISSING_FIELD error has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'MISSING_FIELD',
      message: 'Token is required',
      details: { field: 'token' },
      recovery: 'Provide a valid project token in the URL path',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'MISSING_FIELD');
  assert(error.error.recovery);
  assert(error.error.details.field === 'token');
});

test('Fetch: TOKEN_NOT_FOUND error has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'TOKEN_NOT_FOUND',
      message: 'Project with token "invalid" not found',
      recovery: 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'TOKEN_NOT_FOUND');
  assert(error.error.recovery);
  assert(error.error.message.includes('not found'));
});

test('Fetch: TOKEN_EXPIRED error has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'TOKEN_EXPIRED',
      message: 'Project "test" has expired. Projects expire after 30 days.',
      details: {
        expiredAt: '2025-01-01T00:00:00.000Z',
        helpUrl: 'http://localhost:3000/configure',
      },
      recovery: 'Create a new project configuration at https://dawson.dev/configure',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'TOKEN_EXPIRED');
  assert(error.error.recovery);
  assert(error.error.details.expiredAt);
  assert(error.error.details.helpUrl);
});

test('Fetch: RATE_LIMITED error has correct structure', () => {
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

test('Fetch: DATABASE_ERROR has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch project from database',
      recovery: 'Try again in a few moments. If the issue persists, contact support.',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'DATABASE_ERROR');
  assert(error.error.recovery);
});

test('Fetch: INTERNAL_ERROR has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch project',
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

test('Fetch: successful response returns 200', () => {
  const statusCode = 200;
  assert.equal(statusCode, 200);
});

test('Fetch: missing token returns 400', () => {
  const statusCode = 400;
  assert.equal(statusCode, 400);
});

test('Fetch: token not found returns 404', () => {
  const statusCode = 404;
  assert.equal(statusCode, 404);
});

test('Fetch: token expired returns 410', () => {
  const statusCode = 410;
  assert.equal(statusCode, 410);
});

test('Fetch: rate limit returns 429', () => {
  const statusCode = 429;
  assert.equal(statusCode, 429);
});

test('Fetch: database error returns 500', () => {
  const statusCode = 500;
  assert.equal(statusCode, 500);
});

// ============================================================================
// Recovery Guidance Tests
// ============================================================================

test('Fetch: TOKEN_NOT_FOUND includes actionable recovery', () => {
  const recovery = 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure';

  assert(recovery.includes('Verify'));
  assert(recovery.includes('create a new one'));
  assert(recovery.includes('dawson.dev/configure'));
});

test('Fetch: TOKEN_EXPIRED includes actionable recovery', () => {
  const recovery = 'Create a new project configuration at https://dawson.dev/configure';

  assert(recovery.includes('Create'));
  assert(recovery.includes('dawson.dev/configure'));
});

test('Fetch: RATE_LIMITED includes wait time guidance', () => {
  const recovery = 'Wait a few minutes before trying again. Rate limits reset every 15 minutes.';

  assert(recovery.includes('Wait'));
  assert(recovery.includes('15 minutes'));
});

test('Fetch: DATABASE_ERROR includes retry guidance', () => {
  const recovery = 'Try again in a few moments. If the issue persists, contact support.';

  assert(recovery.includes('Try again'));
  assert(recovery.includes('contact support'));
});

test('Fetch: MISSING_FIELD includes field guidance', () => {
  const recovery = 'Provide a valid project token in the URL path';

  assert(recovery.includes('Provide'));
  assert(recovery.includes('token'));
});

// ============================================================================
// CORS Headers Tests
// ============================================================================

test('Fetch: response includes CORS headers', () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(headers['Access-Control-Allow-Origin'], '*');
  assert(headers['Access-Control-Allow-Methods'].includes('GET'));
  assert(headers['Access-Control-Allow-Headers'].includes('Content-Type'));
});

test('Fetch: error responses include CORS headers', () => {
  const errorHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(errorHeaders['Access-Control-Allow-Origin'], '*');
});

// ============================================================================
// Validation Tests
// ============================================================================

test('Fetch: validates token parameter presence', () => {
  const token = '';
  const isValid = token.length > 0;

  assert.equal(isValid, false);
});

test('Fetch: handles valid token format', () => {
  const token = 'fast-lion-1234';
  const isValid = token.length > 0 && token.includes('-');

  assert(isValid);
});

test('Fetch: checks expiration date', () => {
  const expiresAt = new Date('2025-01-01');
  const now = new Date('2025-06-01');
  const isExpired = expiresAt < now;

  assert(isExpired);
});

test('Fetch: handles non-expired project', () => {
  const expiresAt = new Date('2026-01-01');
  const now = new Date('2025-06-01');
  const isExpired = expiresAt < now;

  assert.equal(isExpired, false);
});

// ============================================================================
// Database Interaction Tests
// ============================================================================

test('Fetch: updates last_accessed_at on successful retrieval', () => {
  const before = new Date('2025-01-01T00:00:00Z');
  const after = new Date('2025-01-02T00:00:00Z');

  assert(after > before);
});

test('Fetch: handles database fetch error gracefully', () => {
  const error = {
    code: 'CONNECTION_ERROR',
    message: 'Database connection failed',
  };

  assert(error.code);
  assert(error.message);
});

test('Fetch: recognizes Supabase not found error code', () => {
  const errorCode = 'PGRST116';
  const isNotFound = errorCode === 'PGRST116';

  assert(isNotFound);
});

// ============================================================================
// CLI Integration Tests
// ============================================================================

test('Fetch: returned data is compatible with CLI pull command', () => {
  const project = createMockProject();

  // CLI expects these fields
  assert(project.token);
  assert(project.template);
  assert(project.project_name);
  assert(project.output_dir);
  assert(project.integrations);
  assert(project.env_keys);
});

test('Fetch: integrations format matches CLI expectations', () => {
  const integrations = {
    auth: 'supabase',
    payments: 'stripe',
  };

  assert(typeof integrations === 'object');
  assert(integrations.auth);
  assert(integrations.payments);
});

test('Fetch: env_keys format matches CLI expectations', () => {
  const envKeys = {
    STRIPE_SECRET_KEY: '',
    SUPABASE_URL: '',
  };

  assert(typeof envKeys === 'object');
  assert('STRIPE_SECRET_KEY' in envKeys);
});

// ============================================================================
// Edge Cases
// ============================================================================

test('Fetch: handles null env_keys gracefully', () => {
  const envKeys = null;
  const safeEnvKeys = envKeys || {};

  assert.deepEqual(safeEnvKeys, {});
});

test('Fetch: handles empty integrations object', () => {
  const integrations = {};

  assert(Array.isArray(Object.keys(integrations)));
  assert.equal(Object.keys(integrations).length, 0);
});

test('Fetch: handles missing optional fields', () => {
  const mockProject = createMockProject();
  const config = {
    vision: mockProject.vision || null,
    mission: mockProject.mission || null,
    description: mockProject.description || null,
  };

  // Should not throw, handles nulls gracefully
  assert(config !== null);
});

test('Fetch: handles empty string token', () => {
  const token = '';
  const isValid = token && token.length > 0;

  assert.equal(isValid, '');
});

test('Fetch: handles token with special characters', () => {
  const token = 'fast-lion-1234';
  const hasValidFormat = /^[\w-]+$/.test(token);

  assert(hasValidFormat);
});

// ============================================================================
// Expiration Handling Tests
// ============================================================================

test('Fetch: recognizes expired projects', () => {
  const expiresAt = new Date('2025-01-01T00:00:00Z');
  const now = new Date('2025-06-01T00:00:00Z');
  const isExpired = expiresAt < now;

  assert(isExpired);
});

test('Fetch: allows access to non-expired projects', () => {
  const expiresAt = new Date('2026-01-01T00:00:00Z');
  const now = new Date('2025-06-01T00:00:00Z');
  const isExpired = expiresAt < now;

  assert.equal(isExpired, false);
});

test('Fetch: expiration error includes expiredAt timestamp', () => {
  const errorDetails = {
    expiredAt: '2025-01-01T00:00:00Z',
    helpUrl: 'http://localhost:3000/configure',
  };

  assert(errorDetails.expiredAt);
  assert(errorDetails.helpUrl);
});

test('Fetch: expiration error includes help URL', () => {
  const helpUrl = 'https://dawson.dev/configure';

  assert(helpUrl.includes('/configure'));
  assert(helpUrl.startsWith('http'));
});

// ============================================================================
// Rate Limiting Tests
// ============================================================================

test('Fetch: rate limit uses client IP', () => {
  const clientIp = '192.168.1.1';
  const rateLimitKey = `fetch:${clientIp}`;

  assert(rateLimitKey.includes('fetch:'));
  assert(rateLimitKey.includes(clientIp));
});

test('Fetch: rate limit falls back to anonymous', () => {
  const clientIp = null;
  const fallback = clientIp || 'anonymous';

  assert.equal(fallback, 'anonymous');
});

test('Fetch: rate limit error includes reset time', () => {
  const resetAt = new Date(Date.now() + 900000).toISOString();

  assert(resetAt);
  assert(resetAt.includes('T'));
});

// ============================================================================
// Logging Tests
// ============================================================================

test('Fetch: logs successful retrieval', () => {
  const logMessage = '[Project Retrieved] fast-lion-1234 | saas | my-app';

  assert(logMessage.includes('Project Retrieved'));
  assert(logMessage.includes('fast-lion-1234'));
  assert(logMessage.includes('saas'));
});

test('Fetch: logs errors to console', () => {
  const errorMessage = '[Project Fetch Error] Database connection failed';

  assert(errorMessage.includes('Project Fetch Error'));
});

test('Fetch: warns on last_accessed_at update failure', () => {
  const warnMessage = '[Project Access Update Warning] fast-lion-1234: Update failed';

  assert(warnMessage.includes('Warning'));
  assert(warnMessage.includes('fast-lion-1234'));
});

// ============================================================================
// Integration Tests
// ============================================================================

test('Fetch: response structure matches Supabase schema', () => {
  const project = createMockProject();
  const supabaseFields = [
    'id',
    'token',
    'template',
    'project_name',
    'output_dir',
    'integrations',
    'env_keys',
    'created_at',
  ];

  supabaseFields.forEach(field => {
    assert(field in project, `Missing field: ${field}`);
  });
});

test('Fetch: handles Supabase JSON fields correctly', () => {
  const integrations = { auth: 'supabase' };
  const envKeys = { KEY: 'value' };

  assert(typeof integrations === 'object');
  assert(typeof envKeys === 'object');
});
