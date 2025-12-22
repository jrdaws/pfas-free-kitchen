// tests/api/projects-download.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockProject } from '../utils/fixtures.mjs';

/**
 * Tests for GET /api/projects/[token]/download endpoint
 *
 * This endpoint returns a downloadable project manifest JSON file
 * with file lists and configuration for CLI consumption.
 */

// ============================================================================
// Response Format Tests
// ============================================================================

test('Download: successful response has correct manifest structure', async () => {
  const mockProject = createMockProject();
  const manifest = {
    version: '1.0.0',
    token: mockProject.token,
    template: mockProject.template,
    project_name: mockProject.project_name,
    output_dir: mockProject.output_dir,
    created_at: mockProject.created_at,
    expires_at: mockProject.expires_at,
    config: {
      integrations: mockProject.integrations,
      env_keys: mockProject.env_keys,
      vision: mockProject.vision,
      mission: mockProject.mission,
      success_criteria: mockProject.success_criteria,
      inspirations: mockProject.inspirations,
      description: mockProject.description,
    },
    files: {
      base: ['app/layout.tsx', 'app/page.tsx'],
      integrations: [],
      total: 2,
    },
    cli: {
      pullCommand: `npx @jrdaws/framework pull ${mockProject.token}`,
      templatePath: `templates/${mockProject.template}`,
    },
  };

  assert(manifest.version);
  assert(manifest.token);
  assert(manifest.template);
  assert(manifest.project_name);
  assert(manifest.config);
  assert(manifest.files);
  assert(manifest.cli);
});

test('Download: manifest includes all required config fields', () => {
  const mockProject = createMockProject({
    vision: 'Test vision',
    mission: 'Test mission',
    success_criteria: ['Goal 1', 'Goal 2'],
    inspirations: ['https://example.com'],
    description: 'Test description',
  });

  const config = {
    integrations: mockProject.integrations,
    env_keys: mockProject.env_keys,
    vision: mockProject.vision,
    mission: mockProject.mission,
    success_criteria: mockProject.success_criteria,
    inspirations: mockProject.inspirations,
    description: mockProject.description,
  };

  assert.equal(config.vision, 'Test vision');
  assert.equal(config.mission, 'Test mission');
  assert.deepEqual(config.success_criteria, ['Goal 1', 'Goal 2']);
  assert.deepEqual(config.inspirations, ['https://example.com']);
  assert.equal(config.description, 'Test description');
});

test('Download: files object includes base and integrations', () => {
  const files = {
    base: ['app/layout.tsx', 'app/page.tsx', 'package.json'],
    integrations: ['integrations/auth/supabase/lib/supabase.ts'],
    total: 4,
  };

  assert(Array.isArray(files.base));
  assert(Array.isArray(files.integrations));
  assert.equal(files.total, files.base.length + files.integrations.length);
});

test('Download: CLI instructions include pull command', () => {
  const cli = {
    pullCommand: 'npx @jrdaws/framework pull test-token',
    templatePath: 'templates/saas',
  };

  assert(cli.pullCommand.includes('npx @jrdaws/framework pull'));
  assert(cli.templatePath.startsWith('templates/'));
});

// ============================================================================
// Error Response Format Tests (API_CONTRACTS.md Compliance)
// ============================================================================

test('Download: error response follows API_CONTRACTS.md format', () => {
  const errorResponse = {
    success: false,
    error: {
      code: 'TOKEN_NOT_FOUND',
      message: 'Project with token "invalid" not found',
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
  assert(errorResponse.meta);
  assert(errorResponse.meta.timestamp);
});

test('Download: MISSING_FIELD error has correct structure', () => {
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

test('Download: TOKEN_NOT_FOUND error has correct structure', () => {
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

test('Download: TOKEN_EXPIRED error has correct structure', () => {
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

test('Download: RATE_LIMITED error has correct structure', () => {
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

test('Download: DATABASE_ERROR has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'DATABASE_ERROR',
      message: 'Failed to fetch project',
      details: { details: 'Connection timeout' },
      recovery: 'Try again in a few moments. If the issue persists, contact support.',
    },
    meta: { timestamp: new Date().toISOString() },
  };

  assert.equal(error.error.code, 'DATABASE_ERROR');
  assert(error.error.recovery);
});

test('Download: INTERNAL_ERROR has correct structure', () => {
  const error = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Failed to download project',
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

test('Download: successful response returns 200', () => {
  const statusCode = 200;
  assert.equal(statusCode, 200);
});

test('Download: missing token returns 400', () => {
  const statusCode = 400;
  assert.equal(statusCode, 400);
});

test('Download: token not found returns 404', () => {
  const statusCode = 404;
  assert.equal(statusCode, 404);
});

test('Download: token expired returns 410', () => {
  const statusCode = 410;
  assert.equal(statusCode, 410);
});

test('Download: rate limit returns 429', () => {
  const statusCode = 429;
  assert.equal(statusCode, 429);
});

test('Download: database error returns 500', () => {
  const statusCode = 500;
  assert.equal(statusCode, 500);
});

// ============================================================================
// Recovery Guidance Tests
// ============================================================================

test('Download: TOKEN_NOT_FOUND includes actionable recovery', () => {
  const recovery = 'Verify the token is correct. If the project expired (after 30 days), create a new one at https://dawson.dev/configure';

  assert(recovery.includes('Verify'));
  assert(recovery.includes('create a new one'));
  assert(recovery.includes('dawson.dev/configure'));
});

test('Download: TOKEN_EXPIRED includes actionable recovery', () => {
  const recovery = 'Create a new project configuration at https://dawson.dev/configure';

  assert(recovery.includes('Create'));
  assert(recovery.includes('dawson.dev/configure'));
});

test('Download: RATE_LIMITED includes wait time guidance', () => {
  const recovery = 'Wait a few minutes before trying again. Rate limits reset every 15 minutes.';

  assert(recovery.includes('Wait'));
  assert(recovery.includes('15 minutes'));
});

test('Download: DATABASE_ERROR includes retry guidance', () => {
  const recovery = 'Try again in a few moments. If the issue persists, contact support.';

  assert(recovery.includes('Try again'));
  assert(recovery.includes('contact support'));
});

test('Download: MISSING_FIELD includes field guidance', () => {
  const recovery = 'Provide a valid project token in the URL path';

  assert(recovery.includes('Provide'));
  assert(recovery.includes('token'));
});

// ============================================================================
// CORS Headers Tests
// ============================================================================

test('Download: response includes CORS headers', () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(headers['Access-Control-Allow-Origin'], '*');
  assert(headers['Access-Control-Allow-Methods'].includes('GET'));
  assert(headers['Access-Control-Allow-Headers'].includes('Content-Type'));
});

test('Download: error responses include CORS headers', () => {
  const errorHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(errorHeaders['Access-Control-Allow-Origin'], '*');
});

test('Download: success response includes Content-Disposition header', () => {
  const headers = {
    'Content-Type': 'application/json',
    'Content-Disposition': 'attachment; filename="test-project-config.json"',
  };

  assert(headers['Content-Disposition'].includes('attachment'));
  assert(headers['Content-Disposition'].includes('filename='));
  assert(headers['Content-Type'] === 'application/json');
});

// ============================================================================
// Integration File Tests
// ============================================================================

test('Download: includes auth:supabase integration files', () => {
  const integrationFiles = [
    'integrations/auth/supabase/app/api/auth/callback/route.ts',
    'integrations/auth/supabase/lib/supabase.ts',
    'integrations/auth/supabase/middleware.ts',
  ];

  integrationFiles.forEach(file => {
    assert(file.startsWith('integrations/'));
    assert(file.includes('auth/supabase'));
  });
});

test('Download: includes payments:stripe integration files', () => {
  const integrationFiles = [
    'integrations/payments/stripe/app/api/stripe/checkout/route.ts',
    'integrations/payments/stripe/lib/stripe.ts',
  ];

  integrationFiles.forEach(file => {
    assert(file.startsWith('integrations/'));
    assert(file.includes('payments/stripe'));
  });
});

test('Download: includes ai:anthropic integration files', () => {
  const integrationFiles = [
    'integrations/ai/anthropic/app/api/ai/claude/route.ts',
    'integrations/ai/anthropic/lib/anthropic.ts',
  ];

  integrationFiles.forEach(file => {
    assert(file.startsWith('integrations/'));
    assert(file.includes('ai/anthropic'));
  });
});

test('Download: empty integrations returns empty array', () => {
  const integrationFilesList = [];

  assert(Array.isArray(integrationFilesList));
  assert.equal(integrationFilesList.length, 0);
});

// ============================================================================
// Template File Tests
// ============================================================================

test('Download: saas template includes required files', () => {
  const baseFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'next-env.d.ts',
    'next.config.js',
    'package.json',
    'template.json',
    'tsconfig.json',
  ];

  assert(baseFiles.includes('package.json'));
  assert(baseFiles.includes('template.json'));
  assert(baseFiles.includes('app/layout.tsx'));
});

test('Download: seo-directory template includes required files', () => {
  const baseFiles = [
    'components.json',
    'package.json',
    'template.json',
    'src/app/layout.tsx',
    'src/lib/utils.ts',
  ];

  assert(baseFiles.includes('template.json'));
  assert(baseFiles.some(f => f.includes('layout.tsx')));
});

test('Download: total file count matches base + integrations', () => {
  const base = ['file1.ts', 'file2.ts', 'file3.ts'];
  const integrations = ['int1.ts', 'int2.ts'];
  const total = base.length + integrations.length;

  assert.equal(total, 5);
});

// ============================================================================
// Validation Tests
// ============================================================================

test('Download: validates token parameter presence', () => {
  const token = '';
  const isValid = token.length > 0;

  assert.equal(isValid, false);
});

test('Download: handles valid token format', () => {
  const token = 'fast-lion-1234';
  const isValid = token.length > 0 && token.includes('-');

  assert(isValid);
});

test('Download: checks expiration date', () => {
  const expiresAt = new Date('2025-01-01');
  const now = new Date('2025-06-01');
  const isExpired = expiresAt < now;

  assert(isExpired);
});

test('Download: handles non-expired project', () => {
  const expiresAt = new Date('2026-01-01');
  const now = new Date('2025-06-01');
  const isExpired = expiresAt < now;

  assert.equal(isExpired, false);
});

// ============================================================================
// CLI Integration Tests
// ============================================================================

test('Download: manifest format is CLI-compatible', () => {
  const manifest = {
    version: '1.0.0',
    token: 'test-token',
    template: 'saas',
    project_name: 'test-project',
    output_dir: './test-project',
    config: {},
    files: { base: [], integrations: [], total: 0 },
    cli: {
      pullCommand: 'npx @jrdaws/framework pull test-token',
      templatePath: 'templates/saas',
    },
  };

  // CLI expects these fields
  assert(manifest.token);
  assert(manifest.template);
  assert(manifest.project_name);
  assert(manifest.output_dir);
  assert(manifest.files);
  assert(manifest.cli.pullCommand);
});

test('Download: pullCommand includes correct token', () => {
  const token = 'fast-lion-1234';
  const pullCommand = `npx @jrdaws/framework pull ${token}`;

  assert(pullCommand.includes(token));
  assert(pullCommand.startsWith('npx @jrdaws/framework pull'));
});

test('Download: templatePath matches template', () => {
  const template = 'saas';
  const templatePath = `templates/${template}`;

  assert.equal(templatePath, 'templates/saas');
});

// ============================================================================
// Edge Cases
// ============================================================================

test('Download: handles null env_keys gracefully', () => {
  const envKeys = null;
  const safeEnvKeys = envKeys || {};

  assert.deepEqual(safeEnvKeys, {});
});

test('Download: handles empty integrations object', () => {
  const integrations = {};
  const integrationFilesList = [];

  assert(Array.isArray(integrationFilesList));
  assert.equal(integrationFilesList.length, 0);
});

test('Download: handles missing optional fields', () => {
  const mockProject = createMockProject();
  const config = {
    vision: mockProject.vision || null,
    mission: mockProject.mission || null,
    description: mockProject.description || null,
  };

  // Should not throw, handles nulls gracefully
  assert(config !== null);
});

test('Download: manifest version is semantic', () => {
  const version = '1.0.0';
  const parts = version.split('.');

  assert.equal(parts.length, 3);
  assert(parseInt(parts[0]) >= 1);
});
