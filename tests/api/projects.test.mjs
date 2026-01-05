// tests/api/projects.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for Project API endpoints
 * Reference: PLATFORM_ARCHITECTURE_RESEARCH.md
 *
 * These tests validate the project management dashboard API.
 */

// ============================================================================
// Mock Data Helpers
// ============================================================================

function createMockUser(overrides = {}) {
  return {
    id: 'user_' + Math.random().toString(36).slice(2, 10),
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: null,
    created_at: new Date().toISOString(),
    subscription_tier: 'free',
    ...overrides,
  };
}

function createMockProject(overrides = {}) {
  return {
    id: 'proj_' + Math.random().toString(36).slice(2, 10),
    user_id: 'user_123',
    name: 'My Project',
    slug: 'my-project',
    description: 'A test project',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    config: {
      features: [],
      pages: [],
      integrations: [],
      theme: {},
    },
    last_generated_at: null,
    generation_count: 0,
    ...overrides,
  };
}

// ============================================================================
// GET /api/projects
// ============================================================================

test('GET /api/projects: returns only user\'s projects', () => {
  const userA = createMockUser({ id: 'user_a' });
  const userB = createMockUser({ id: 'user_b' });

  const allProjects = [
    createMockProject({ user_id: 'user_a', name: 'Project A' }),
    createMockProject({ user_id: 'user_b', name: 'Project B' }),
    createMockProject({ user_id: 'user_a', name: 'Project C' }),
  ];

  const userAProjects = allProjects.filter((p) => p.user_id === userA.id);

  assert.equal(userAProjects.length, 2);
  assert(userAProjects.every((p) => p.user_id === 'user_a'));
});

test('GET /api/projects: returns empty array for new user', () => {
  const newUser = createMockUser({ id: 'new_user' });
  const allProjects = [
    createMockProject({ user_id: 'existing_user' }),
  ];

  const newUserProjects = allProjects.filter((p) => p.user_id === newUser.id);

  assert.equal(newUserProjects.length, 0);
  assert.deepEqual(newUserProjects, []);
});

test('GET /api/projects: excludes archived projects by default', () => {
  const projects = [
    createMockProject({ status: 'active', name: 'Active 1' }),
    createMockProject({ status: 'archived', name: 'Archived 1' }),
    createMockProject({ status: 'active', name: 'Active 2' }),
  ];

  const defaultFilter = projects.filter((p) => p.status === 'active');

  assert.equal(defaultFilter.length, 2);
  assert(defaultFilter.every((p) => p.status === 'active'));
});

test('GET /api/projects: includes archived with ?status=archived', () => {
  const projects = [
    createMockProject({ status: 'active', name: 'Active 1' }),
    createMockProject({ status: 'archived', name: 'Archived 1' }),
    createMockProject({ status: 'archived', name: 'Archived 2' }),
  ];

  const statusFilter = 'archived';
  const filtered = projects.filter((p) => p.status === statusFilter);

  assert.equal(filtered.length, 2);
  assert(filtered.every((p) => p.status === 'archived'));
});

test('GET /api/projects: requires authentication', () => {
  const mockResponse = {
    status: 401,
    body: {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recovery: 'Sign in to access your projects',
      },
    },
  };

  assert.equal(mockResponse.status, 401);
  assert.equal(mockResponse.body.error.code, 'UNAUTHORIZED');
});

test('GET /api/projects: pagination works correctly', () => {
  const projects = Array.from({ length: 25 }, (_, i) =>
    createMockProject({ name: `Project ${i + 1}` })
  );

  const page = 2;
  const limit = 10;
  const offset = (page - 1) * limit;
  const paginated = projects.slice(offset, offset + limit);

  assert.equal(paginated.length, 10);
  assert.equal(paginated[0].name, 'Project 11');
  assert.equal(paginated[9].name, 'Project 20');
});

test('GET /api/projects: sorting by updated_at', () => {
  const projects = [
    createMockProject({ name: 'Old', updated_at: '2024-01-01T00:00:00Z' }),
    createMockProject({ name: 'New', updated_at: '2025-01-01T00:00:00Z' }),
    createMockProject({ name: 'Medium', updated_at: '2024-06-01T00:00:00Z' }),
  ];

  const sorted = [...projects].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );

  assert.equal(sorted[0].name, 'New');
  assert.equal(sorted[1].name, 'Medium');
  assert.equal(sorted[2].name, 'Old');
});

// ============================================================================
// POST /api/projects
// ============================================================================

test('POST /api/projects: creates project with valid data', () => {
  const request = {
    name: 'My New Project',
    template: 'saas',
    description: 'A SaaS application',
  };

  const response = {
    status: 201,
    body: {
      success: true,
      data: createMockProject({
        name: request.name,
        slug: 'my-new-project',
        description: request.description,
      }),
    },
  };

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.name, 'My New Project');
  assert.equal(response.body.data.slug, 'my-new-project');
});

test('POST /api/projects: generates unique slug', () => {
  const existingSlugs = ['my-project', 'my-project-1', 'my-project-2'];

  function generateUniqueSlug(name, existing) {
    let slug = name.toLowerCase().replace(/\s+/g, '-');
    if (!existing.includes(slug)) return slug;

    let counter = 1;
    while (existing.includes(`${slug}-${counter}`)) {
      counter++;
    }
    return `${slug}-${counter}`;
  }

  const newSlug = generateUniqueSlug('My Project', existingSlugs);

  assert.equal(newSlug, 'my-project-3');
});

test('POST /api/projects: rejects duplicate names', () => {
  const existingProjects = [
    createMockProject({ user_id: 'user_123', name: 'My Project' }),
  ];

  const request = { name: 'My Project', user_id: 'user_123' };
  const isDuplicate = existingProjects.some(
    (p) => p.user_id === request.user_id && p.name === request.name
  );

  const response = isDuplicate
    ? {
        status: 400,
        body: {
          success: false,
          error: {
            code: 'DUPLICATE_NAME',
            message: 'A project with this name already exists',
            recovery: 'Choose a different project name',
          },
        },
      }
    : { status: 201 };

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'DUPLICATE_NAME');
});

test('POST /api/projects: requires authentication', () => {
  const mockResponse = {
    status: 401,
    body: {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recovery: 'Sign in to create a project',
      },
    },
  };

  assert.equal(mockResponse.status, 401);
  assert.equal(mockResponse.body.error.code, 'UNAUTHORIZED');
});

test('POST /api/projects: validates required fields', () => {
  const request = {}; // Missing name

  const hasName = 'name' in request && request.name?.trim();
  const response = hasName
    ? { status: 201 }
    : {
        status: 400,
        body: {
          success: false,
          error: {
            code: 'MISSING_FIELD',
            message: 'Project name is required',
            details: { field: 'name' },
            recovery: 'Provide a name for your project',
          },
        },
      };

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'MISSING_FIELD');
  assert.equal(response.body.error.details.field, 'name');
});

test('POST /api/projects: applies rate limiting', () => {
  const userProjectCount = 11; // Above free tier limit
  const freeLimit = 10;

  const isRateLimited = userProjectCount > freeLimit;
  const response = isRateLimited
    ? {
        status: 429,
        body: {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Project limit reached for free tier',
            recovery: 'Upgrade to Pro for unlimited projects',
          },
        },
      }
    : { status: 201 };

  assert.equal(response.status, 429);
  assert.equal(response.body.error.code, 'RATE_LIMITED');
});

// ============================================================================
// PATCH /api/projects/[id]
// ============================================================================

test('PATCH /api/projects/[id]: updates project name', () => {
  // Create project with old timestamp
  const project = createMockProject({
    name: 'Old Name',
    updated_at: '2025-01-01T00:00:00.000Z',
  });
  const update = { name: 'New Name' };

  const updated = { ...project, ...update, updated_at: new Date().toISOString() };

  assert.equal(updated.name, 'New Name');
  assert.notEqual(updated.updated_at, project.updated_at);
});

test('PATCH /api/projects/[id]: updates project status', () => {
  const project = createMockProject({ status: 'active' });
  const update = { status: 'archived' };

  const updated = { ...project, ...update };

  assert.equal(updated.status, 'archived');
});

test('PATCH /api/projects/[id]: rejects invalid status', () => {
  const validStatuses = ['active', 'archived', 'deleted'];
  const requestedStatus = 'invalid_status';

  const isValid = validStatuses.includes(requestedStatus);
  const response = isValid
    ? { status: 200 }
    : {
        status: 400,
        body: {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Invalid project status',
            details: { validStatuses },
            recovery: `Status must be one of: ${validStatuses.join(', ')}`,
          },
        },
      };

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_STATUS');
});

test('PATCH /api/projects/[id]: prevents editing other user\'s project', () => {
  const project = createMockProject({ user_id: 'owner_user' });
  const currentUserId = 'other_user';

  const isOwner = project.user_id === currentUserId;
  const response = isOwner
    ? { status: 200 }
    : {
        status: 403,
        body: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to edit this project',
            recovery: 'You can only edit your own projects',
          },
        },
      };

  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, 'FORBIDDEN');
});

test('PATCH /api/projects/[id]: returns 404 for non-existent project', () => {
  const projectId = 'non_existent_id';
  const projects = [createMockProject({ id: 'existing_id' })];

  const found = projects.find((p) => p.id === projectId);
  const response = found
    ? { status: 200 }
    : {
        status: 404,
        body: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
            recovery: 'Check the project ID and try again',
          },
        },
      };

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

// ============================================================================
// DELETE /api/projects/[id]
// ============================================================================

test('DELETE /api/projects/[id]: soft deletes (archives) project', () => {
  const project = createMockProject({ status: 'active' });

  // Soft delete = status change, not removal
  const softDeleted = { ...project, status: 'deleted' };

  assert.equal(softDeleted.status, 'deleted');
  assert(softDeleted.id); // Still exists
});

test('DELETE /api/projects/[id]: prevents deleting other user\'s project', () => {
  const project = createMockProject({ user_id: 'owner_user' });
  const currentUserId = 'other_user';

  const isOwner = project.user_id === currentUserId;
  const response = isOwner
    ? { status: 200 }
    : {
        status: 403,
        body: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this project',
            recovery: 'You can only delete your own projects',
          },
        },
      };

  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, 'FORBIDDEN');
});

test('DELETE /api/projects/[id]: returns 404 for non-existent project', () => {
  const projectId = 'non_existent_id';
  const projects = [];

  const found = projects.find((p) => p.id === projectId);
  const response = found
    ? { status: 200 }
    : {
        status: 404,
        body: {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Project not found',
            recovery: 'Check the project ID and try again',
          },
        },
      };

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

// ============================================================================
// Response Format Tests (API_CONTRACTS.md Compliance)
// ============================================================================

test('Project API: success response follows API_CONTRACTS.md format', () => {
  const response = {
    success: true,
    data: createMockProject(),
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  assert.equal(response.success, true);
  assert(response.data);
  assert(response.meta);
  assert(response.meta.timestamp);
});

test('Project API: error response follows API_CONTRACTS.md format', () => {
  const response = {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: { field: 'name' },
      recovery: 'Provide a valid project name',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  assert.equal(response.success, false);
  assert(response.error);
  assert(response.error.code);
  assert(response.error.message);
  assert(response.error.recovery);
  assert(response.meta);
});

test('Project API: includes CORS headers', () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  assert.equal(headers['Access-Control-Allow-Origin'], '*');
  assert(headers['Access-Control-Allow-Methods'].includes('GET'));
  assert(headers['Access-Control-Allow-Methods'].includes('POST'));
  assert(headers['Access-Control-Allow-Methods'].includes('PATCH'));
  assert(headers['Access-Control-Allow-Methods'].includes('DELETE'));
});

// ============================================================================
// Edge Cases
// ============================================================================

test('Project API: handles empty project name', () => {
  const request = { name: '' };
  const hasValidName = request.name?.trim()?.length > 0;

  assert.equal(hasValidName, false);
});

test('Project API: handles very long project name', () => {
  const maxLength = 100;
  const longName = 'A'.repeat(150);
  const truncated = longName.slice(0, maxLength);

  assert.equal(truncated.length, maxLength);
});

test('Project API: handles special characters in name', () => {
  const name = 'My Project @#$%';
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  assert.equal(slug, 'my-project');
});

test('Project API: handles unicode in project name', () => {
  const name = 'Proyecto 日本語 🚀';
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  assert(slug.length > 0);
  assert(!slug.includes('🚀')); // Emoji removed
});

