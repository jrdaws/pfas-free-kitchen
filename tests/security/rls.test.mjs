// tests/security/rls.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Row Level Security (RLS) Tests
 * Reference: PLATFORM_ARCHITECTURE_RESEARCH.md
 *
 * These tests validate that data access is properly restricted by user.
 * In production, these would run against actual Supabase RLS policies.
 */

// ============================================================================
// Mock RLS Layer
// ============================================================================

function createMockRLSDatabase() {
  const db = {
    users: [
      { id: 'user_1', email: 'user1@example.com' },
      { id: 'user_2', email: 'user2@example.com' },
      { id: 'admin_1', email: 'admin@example.com', role: 'admin' },
    ],
    projects: [
      { id: 'proj_1', user_id: 'user_1', name: 'User 1 Project A' },
      { id: 'proj_2', user_id: 'user_1', name: 'User 1 Project B' },
      { id: 'proj_3', user_id: 'user_2', name: 'User 2 Project' },
    ],
    pages: [
      { id: 'page_1', project_id: 'proj_1', path: '/', title: 'Home' },
      { id: 'page_2', project_id: 'proj_1', path: '/about', title: 'About' },
      { id: 'page_3', project_id: 'proj_3', path: '/', title: 'Home' },
    ],
    service_connections: [
      { id: 'conn_1', user_id: 'user_1', service: 'stripe', access_token: 'token_1' },
      { id: 'conn_2', user_id: 'user_2', service: 'supabase', access_token: 'token_2' },
    ],
    versions: [
      { id: 'ver_1', project_id: 'proj_1', version_number: 1 },
      { id: 'ver_2', project_id: 'proj_3', version_number: 1 },
    ],
  };

  // RLS-aware query functions
  return {
    ...db,

    // Project queries with RLS
    selectProjects(authUserId) {
      return db.projects.filter((p) => p.user_id === authUserId);
    },

    updateProject(authUserId, projectId, updates) {
      const project = db.projects.find((p) => p.id === projectId);
      if (!project) return { error: 'NOT_FOUND' };
      if (project.user_id !== authUserId) return { error: 'RLS_VIOLATION' };
      Object.assign(project, updates);
      return { data: project };
    },

    deleteProject(authUserId, projectId) {
      const project = db.projects.find((p) => p.id === projectId);
      if (!project) return { error: 'NOT_FOUND' };
      if (project.user_id !== authUserId) return { error: 'RLS_VIOLATION' };
      db.projects = db.projects.filter((p) => p.id !== projectId);
      return { success: true };
    },

    // Page queries with RLS (inherits from project)
    selectPages(authUserId, projectId) {
      const project = db.projects.find((p) => p.id === projectId);
      if (!project || project.user_id !== authUserId) return [];
      return db.pages.filter((p) => p.project_id === projectId);
    },

    updatePage(authUserId, pageId, updates) {
      const page = db.pages.find((p) => p.id === pageId);
      if (!page) return { error: 'NOT_FOUND' };

      const project = db.projects.find((p) => p.id === page.project_id);
      if (!project || project.user_id !== authUserId) return { error: 'RLS_VIOLATION' };

      Object.assign(page, updates);
      return { data: page };
    },

    // Service connection queries with RLS
    selectServiceConnections(authUserId) {
      return db.service_connections.filter((c) => c.user_id === authUserId);
    },

    updateServiceConnection(authUserId, connectionId, updates) {
      const connection = db.service_connections.find((c) => c.id === connectionId);
      if (!connection) return { error: 'NOT_FOUND' };
      if (connection.user_id !== authUserId) return { error: 'RLS_VIOLATION' };
      Object.assign(connection, updates);
      return { data: connection };
    },

    // Version queries with RLS (inherits from project)
    selectVersions(authUserId, projectId) {
      const project = db.projects.find((p) => p.id === projectId);
      if (!project || project.user_id !== authUserId) return [];
      return db.versions.filter((v) => v.project_id === projectId);
    },

    restoreVersion(authUserId, versionId) {
      const version = db.versions.find((v) => v.id === versionId);
      if (!version) return { error: 'NOT_FOUND' };

      const project = db.projects.find((p) => p.id === version.project_id);
      if (!project || project.user_id !== authUserId) return { error: 'RLS_VIOLATION' };

      return { success: true };
    },
  };
}

// ============================================================================
// Project Access Control
// ============================================================================

test('RLS: user cannot read other user projects', () => {
  const db = createMockRLSDatabase();

  // User 1 queries projects
  const user1Projects = db.selectProjects('user_1');
  assert.equal(user1Projects.length, 2);
  assert(user1Projects.every((p) => p.user_id === 'user_1'));

  // User 2 queries projects
  const user2Projects = db.selectProjects('user_2');
  assert.equal(user2Projects.length, 1);
  assert(user2Projects.every((p) => p.user_id === 'user_2'));

  // User 1 cannot see User 2's projects
  assert(!user1Projects.some((p) => p.user_id === 'user_2'));
});

test('RLS: user cannot update other user projects', () => {
  const db = createMockRLSDatabase();

  // User 2 tries to update User 1's project
  const result = db.updateProject('user_2', 'proj_1', { name: 'Hacked!' });

  assert.equal(result.error, 'RLS_VIOLATION');

  // Verify project unchanged
  const originalProject = db.projects.find((p) => p.id === 'proj_1');
  assert.equal(originalProject.name, 'User 1 Project A');
});

test('RLS: user cannot delete other user projects', () => {
  const db = createMockRLSDatabase();

  const projectCountBefore = db.projects.length;

  // User 2 tries to delete User 1's project
  const result = db.deleteProject('user_2', 'proj_1');

  assert.equal(result.error, 'RLS_VIOLATION');
  assert.equal(db.projects.length, projectCountBefore);
});

test('RLS: user can CRUD own projects', () => {
  const db = createMockRLSDatabase();

  // User 1 updates own project
  const updateResult = db.updateProject('user_1', 'proj_1', { name: 'Updated Name' });
  assert(!updateResult.error);
  assert.equal(updateResult.data.name, 'Updated Name');

  // User 1 deletes own project
  const deleteResult = db.deleteProject('user_1', 'proj_2');
  assert(deleteResult.success);
  assert.equal(db.projects.filter((p) => p.user_id === 'user_1').length, 1);
});

// ============================================================================
// Page Access Control
// ============================================================================

test('RLS: pages inherit project access', () => {
  const db = createMockRLSDatabase();

  // User 1 can see pages in their project
  const user1Pages = db.selectPages('user_1', 'proj_1');
  assert.equal(user1Pages.length, 2);

  // User 1 cannot see pages in User 2's project
  const user2Pages = db.selectPages('user_1', 'proj_3');
  assert.equal(user2Pages.length, 0);
});

test('RLS: cannot modify pages in other user\'s project', () => {
  const db = createMockRLSDatabase();

  // User 1 tries to modify User 2's page
  const result = db.updatePage('user_1', 'page_3', { title: 'Hacked!' });

  assert.equal(result.error, 'RLS_VIOLATION');

  // Verify page unchanged
  const originalPage = db.pages.find((p) => p.id === 'page_3');
  assert.equal(originalPage.title, 'Home');
});

test('RLS: user can modify pages in own project', () => {
  const db = createMockRLSDatabase();

  // User 1 modifies own page
  const result = db.updatePage('user_1', 'page_1', { title: 'New Title' });

  assert(!result.error);
  assert.equal(result.data.title, 'New Title');
});

// ============================================================================
// Service Connections
// ============================================================================

test('RLS: user cannot see other\'s connected services', () => {
  const db = createMockRLSDatabase();

  // User 1 queries connections
  const user1Connections = db.selectServiceConnections('user_1');
  assert.equal(user1Connections.length, 1);
  assert.equal(user1Connections[0].service, 'stripe');

  // User 2 queries connections
  const user2Connections = db.selectServiceConnections('user_2');
  assert.equal(user2Connections.length, 1);
  assert.equal(user2Connections[0].service, 'supabase');

  // No cross-access
  assert(!user1Connections.some((c) => c.user_id === 'user_2'));
});

test('RLS: cannot modify other\'s service connections', () => {
  const db = createMockRLSDatabase();

  // User 1 tries to modify User 2's connection
  const result = db.updateServiceConnection('user_1', 'conn_2', { access_token: 'stolen!' });

  assert.equal(result.error, 'RLS_VIOLATION');
});

test('RLS: OAuth tokens isolated per user', () => {
  const db = createMockRLSDatabase();

  // User 1 can only access their tokens
  const user1Connections = db.selectServiceConnections('user_1');
  const tokens = user1Connections.map((c) => c.access_token);

  assert(tokens.includes('token_1'));
  assert(!tokens.includes('token_2'));
});

// ============================================================================
// Version History
// ============================================================================

test('RLS: version history scoped to project owner', () => {
  const db = createMockRLSDatabase();

  // User 1 queries versions for their project
  const user1Versions = db.selectVersions('user_1', 'proj_1');
  assert.equal(user1Versions.length, 1);

  // User 1 cannot query versions for User 2's project
  const user2Versions = db.selectVersions('user_1', 'proj_3');
  assert.equal(user2Versions.length, 0);
});

test('RLS: restore only works for own projects', () => {
  const db = createMockRLSDatabase();

  // User 1 tries to restore User 2's version
  const result = db.restoreVersion('user_1', 'ver_2');

  assert.equal(result.error, 'RLS_VIOLATION');
});

test('RLS: user can restore own project versions', () => {
  const db = createMockRLSDatabase();

  // User 1 restores own version
  const result = db.restoreVersion('user_1', 'ver_1');

  assert(result.success);
});

// ============================================================================
// API Layer Validation
// ============================================================================

test('API: validates ownership before mutation', () => {
  const db = createMockRLSDatabase();

  // Simulate API endpoint behavior
  function apiUpdateProject(authUserId, projectId, updates) {
    // First check: Fetch project and verify ownership
    const project = db.projects.find((p) => p.id === projectId);

    if (!project) {
      return { status: 404, error: 'NOT_FOUND' };
    }

    if (project.user_id !== authUserId) {
      return { status: 403, error: 'FORBIDDEN' };
    }

    // Only then perform update
    return { status: 200, data: { ...project, ...updates } };
  }

  // User 2 tries to update User 1's project via API
  const result = apiUpdateProject('user_2', 'proj_1', { name: 'Hacked!' });

  assert.equal(result.status, 403);
  assert.equal(result.error, 'FORBIDDEN');
});

test('API: validates project ownership for page operations', () => {
  const db = createMockRLSDatabase();

  function apiCreatePage(authUserId, projectId, pageData) {
    // Verify project ownership first
    const project = db.projects.find((p) => p.id === projectId);

    if (!project) {
      return { status: 404, error: 'PROJECT_NOT_FOUND' };
    }

    if (project.user_id !== authUserId) {
      return { status: 403, error: 'FORBIDDEN' };
    }

    // Create page
    const page = { id: 'new_page', project_id: projectId, ...pageData };
    return { status: 201, data: page };
  }

  // User 2 tries to create page in User 1's project
  const result = apiCreatePage('user_2', 'proj_1', { path: '/hacked', title: 'Hacked' });

  assert.equal(result.status, 403);
  assert.equal(result.error, 'FORBIDDEN');
});

// ============================================================================
// Edge Cases
// ============================================================================

test('RLS: handles non-existent user', () => {
  const db = createMockRLSDatabase();

  // Non-existent user queries projects
  const projects = db.selectProjects('non_existent_user');

  assert.equal(projects.length, 0);
});

test('RLS: handles non-existent project', () => {
  const db = createMockRLSDatabase();

  // User tries to update non-existent project
  const result = db.updateProject('user_1', 'non_existent_project', { name: 'Test' });

  assert.equal(result.error, 'NOT_FOUND');
});

test('RLS: handles deleted project access', () => {
  const db = createMockRLSDatabase();

  // Delete a project
  db.deleteProject('user_1', 'proj_1');

  // Try to access deleted project's pages
  const pages = db.selectPages('user_1', 'proj_1');

  assert.equal(pages.length, 0);
});

test('RLS: handles null/undefined user ID', () => {
  const db = createMockRLSDatabase();

  // Null user queries
  const projects1 = db.selectProjects(null);
  const projects2 = db.selectProjects(undefined);

  assert.equal(projects1.length, 0);
  assert.equal(projects2.length, 0);
});

// ============================================================================
// Attack Vectors
// ============================================================================

test('Security: prevents SQL injection in user ID', () => {
  // In real implementation, parameterized queries prevent injection
  // This test validates the mock behaves safely

  const db = createMockRLSDatabase();
  const maliciousUserId = "user_1' OR '1'='1";

  const projects = db.selectProjects(maliciousUserId);

  // Should return empty, not all projects
  assert.equal(projects.length, 0);
});

test('Security: prevents ID enumeration attacks', () => {
  const db = createMockRLSDatabase();

  // Attacker tries to enumerate project IDs
  const guessedIds = ['proj_1', 'proj_2', 'proj_3', 'proj_4', 'proj_5'];
  const accessibleProjects = [];

  for (const id of guessedIds) {
    const result = db.updateProject('attacker', id, { name: 'test' });
    if (!result.error) {
      accessibleProjects.push(id);
    }
  }

  // Attacker should not be able to access any projects
  assert.equal(accessibleProjects.length, 0);
});

test('Security: validates user ID format', () => {
  function isValidUserId(userId) {
    if (!userId) return false;
    if (typeof userId !== 'string') return false;
    if (userId.length > 100) return false;
    // Allow alphanumeric, underscore, hyphen
    return /^[a-zA-Z0-9_-]+$/.test(userId);
  }

  assert.equal(isValidUserId('user_123'), true);
  assert.equal(isValidUserId('user-abc'), true);
  assert.equal(isValidUserId(null), false);
  assert.equal(isValidUserId(undefined), false);
  assert.equal(isValidUserId(''), false);
  assert.equal(isValidUserId("user' OR 1=1"), false);
  assert.equal(isValidUserId('<script>'), false);
  assert.equal(isValidUserId('a'.repeat(200)), false);
});

// ============================================================================
// Audit Logging
// ============================================================================

test('Security: logs access attempts', () => {
  const accessLog = [];

  function loggedQuery(userId, operation, resource, resourceId) {
    accessLog.push({
      timestamp: new Date().toISOString(),
      userId,
      operation,
      resource,
      resourceId,
    });
  }

  // Simulate logged operations
  loggedQuery('user_1', 'SELECT', 'projects', null);
  loggedQuery('user_2', 'UPDATE', 'projects', 'proj_1'); // RLS violation attempt
  loggedQuery('user_1', 'DELETE', 'projects', 'proj_1');

  assert.equal(accessLog.length, 3);
  assert(accessLog.some((l) => l.operation === 'UPDATE' && l.userId === 'user_2'));
});

test('Security: logs RLS violations', () => {
  const violations = [];

  function logViolation(userId, operation, resource, resourceId, ownerId) {
    violations.push({
      timestamp: new Date().toISOString(),
      userId,
      operation,
      resource,
      resourceId,
      ownerId,
      type: 'RLS_VIOLATION',
    });
  }

  // Simulate violation logging
  logViolation('user_2', 'UPDATE', 'projects', 'proj_1', 'user_1');

  assert.equal(violations.length, 1);
  assert.equal(violations[0].type, 'RLS_VIOLATION');
  assert.equal(violations[0].userId, 'user_2');
  assert.equal(violations[0].ownerId, 'user_1');
});

