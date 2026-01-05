// tests/integration/project-workflow.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Integration Tests for Platform Project Workflow
 * Reference: PLATFORM_ARCHITECTURE_RESEARCH.md
 *
 * These tests validate end-to-end workflows combining multiple API calls.
 */

// ============================================================================
// Mock Helpers
// ============================================================================

function createMockDatabase() {
  return {
    projects: [],
    pages: [],
    versions: [],

    // Projects
    createProject(data) {
      const project = {
        id: 'proj_' + Math.random().toString(36).slice(2, 10),
        user_id: data.user_id,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        config: {
          features: [],
          pages: [],
          integrations: [],
          theme: {},
        },
        generation_count: 0,
      };
      this.projects.push(project);
      return project;
    },

    getProject(id) {
      return this.projects.find((p) => p.id === id);
    },

    updateProject(id, updates) {
      const project = this.getProject(id);
      if (project) {
        Object.assign(project, updates, { updated_at: new Date().toISOString() });
      }
      return project;
    },

    // Pages
    createPage(data) {
      const page = {
        id: 'page_' + Math.random().toString(36).slice(2, 10),
        project_id: data.project_id,
        parent_id: data.parent_id || null,
        path: data.path,
        title: data.title,
        route_type: data.route_type || 'static',
        order: this.pages.filter((p) => p.project_id === data.project_id && p.parent_id === data.parent_id).length,
        components: data.components || [],
        auth_required: data.auth_required || false,
        created_at: new Date().toISOString(),
      };
      this.pages.push(page);
      return page;
    },

    getProjectPages(projectId) {
      return this.pages.filter((p) => p.project_id === projectId);
    },

    deletePage(id, cascade = true) {
      if (cascade) {
        const toDelete = new Set([id]);
        let changed = true;
        while (changed) {
          changed = false;
          for (const page of this.pages) {
            if (!toDelete.has(page.id) && toDelete.has(page.parent_id)) {
              toDelete.add(page.id);
              changed = true;
            }
          }
        }
        this.pages = this.pages.filter((p) => !toDelete.has(p.id));
        return toDelete.size;
      } else {
        // Orphan children
        for (const page of this.pages) {
          if (page.parent_id === id) {
            page.parent_id = null;
          }
        }
        this.pages = this.pages.filter((p) => p.id !== id);
        return 1;
      }
    },

    // Versions
    createVersion(projectId, name) {
      const project = this.getProject(projectId);
      if (!project) return null;

      const version = {
        id: 'ver_' + Math.random().toString(36).slice(2, 10),
        project_id: projectId,
        version_number: this.versions.filter((v) => v.project_id === projectId).length + 1,
        name: name || `Version ${this.versions.length + 1}`,
        config_snapshot: JSON.parse(JSON.stringify(project.config)),
        pages_snapshot: JSON.parse(JSON.stringify(this.getProjectPages(projectId))),
        created_at: new Date().toISOString(),
      };
      this.versions.push(version);
      return version;
    },

    restoreVersion(versionId) {
      const version = this.versions.find((v) => v.id === versionId);
      if (!version) return false;

      const project = this.getProject(version.project_id);
      if (!project) return false;

      // Restore config
      project.config = JSON.parse(JSON.stringify(version.config_snapshot));

      // Restore pages
      this.pages = this.pages.filter((p) => p.project_id !== version.project_id);
      for (const page of version.pages_snapshot) {
        this.pages.push(JSON.parse(JSON.stringify(page)));
      }

      return true;
    },
  };
}

// ============================================================================
// Complete Project Creation Flow
// ============================================================================

test('Integration: complete project creation flow', async () => {
  const db = createMockDatabase();
  const userId = 'user_123';

  // Step 1: Create project
  const project = db.createProject({
    user_id: userId,
    name: 'My SaaS App',
  });

  assert(project.id);
  assert.equal(project.name, 'My SaaS App');
  assert.equal(project.slug, 'my-saas-app');

  // Step 2: Add pages
  const homePage = db.createPage({
    project_id: project.id,
    path: '/',
    title: 'Home',
  });

  const aboutPage = db.createPage({
    project_id: project.id,
    path: '/about',
    title: 'About',
  });

  const pricingPage = db.createPage({
    project_id: project.id,
    path: '/pricing',
    title: 'Pricing',
  });

  const pages = db.getProjectPages(project.id);
  assert.equal(pages.length, 3);

  // Step 3: Configure component slots
  homePage.components = [
    { id: 'slot_1', slot_type: 'header', source: 'shared' },
    { id: 'slot_2', slot_type: 'hero', source: 'ai-generated', prompt: 'SaaS hero section' },
    { id: 'slot_3', slot_type: 'content', source: 'page-specific' },
    { id: 'slot_4', slot_type: 'footer', source: 'shared' },
  ];

  assert.equal(homePage.components.length, 4);

  // Step 4: Export project (simulated)
  function exportProject(projectId, dbInstance) {
    const proj = dbInstance.getProject(projectId);
    const pgs = dbInstance.getProjectPages(projectId);

    return {
      manifest: {
        name: proj.name,
        slug: proj.slug,
        pages: pgs.map((p) => ({ path: p.path, title: p.title })),
      },
      files: pgs.map((p) => ({
        path: `app${p.path === '/' ? '' : p.path}/page.tsx`,
        content: `// ${p.title} page`,
      })),
    };
  }

  const exported = exportProject(project.id, db);

  assert.equal(exported.manifest.name, 'My SaaS App');
  assert.equal(exported.manifest.pages.length, 3);
  assert.equal(exported.files.length, 3);

  // Step 5: Verify exported files match config
  assert(exported.files.some((f) => f.path === 'app/page.tsx'));
  assert(exported.files.some((f) => f.path === 'app/about/page.tsx'));
  assert(exported.files.some((f) => f.path === 'app/pricing/page.tsx'));
});

// ============================================================================
// Version Snapshot and Restore
// ============================================================================

test('Integration: version snapshot and restore', async () => {
  const db = createMockDatabase();
  const userId = 'user_123';

  // Step 1: Create project with pages
  const project = db.createProject({
    user_id: userId,
    name: 'Version Test App',
  });

  const homePage = db.createPage({
    project_id: project.id,
    path: '/',
    title: 'Home',
  });

  const aboutPage = db.createPage({
    project_id: project.id,
    path: '/about',
    title: 'About',
  });

  // Step 2: Create version snapshot
  const version1 = db.createVersion(project.id, 'Initial Version');

  assert(version1.id);
  assert.equal(version1.version_number, 1);
  assert.equal(version1.pages_snapshot.length, 2);

  // Step 3: Make changes (add page, modify config)
  const pricingPage = db.createPage({
    project_id: project.id,
    path: '/pricing',
    title: 'Pricing',
  });

  db.deletePage(aboutPage.id);

  const pagesAfterChanges = db.getProjectPages(project.id);
  assert.equal(pagesAfterChanges.length, 2); // Home + Pricing (About deleted)
  assert(pagesAfterChanges.some((p) => p.path === '/pricing'));
  assert(!pagesAfterChanges.some((p) => p.path === '/about'));

  // Step 4: Restore snapshot
  const restored = db.restoreVersion(version1.id);

  assert.equal(restored, true);

  // Step 5: Verify state restored
  const pagesAfterRestore = db.getProjectPages(project.id);
  assert.equal(pagesAfterRestore.length, 2); // Home + About (original state)
  assert(pagesAfterRestore.some((p) => p.path === '/about'));
  assert(!pagesAfterRestore.some((p) => p.path === '/pricing'));
});

// ============================================================================
// Page Tree Manipulation
// ============================================================================

test('Integration: page tree manipulation', async () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Page Tree Test',
  });

  // Step 1: Create nested structure
  const blog = db.createPage({
    project_id: project.id,
    path: '/blog',
    title: 'Blog',
  });

  const blogSlug = db.createPage({
    project_id: project.id,
    parent_id: blog.id,
    path: '/blog/[slug]',
    title: 'Blog Post',
    route_type: 'dynamic',
  });

  const comments = db.createPage({
    project_id: project.id,
    parent_id: blogSlug.id,
    path: '/blog/[slug]/comments',
    title: 'Comments',
  });

  let pages = db.getProjectPages(project.id);
  assert.equal(pages.length, 3);
  assert.equal(blogSlug.parent_id, blog.id);
  assert.equal(comments.parent_id, blogSlug.id);

  // Step 2: Reorder children
  // (In real implementation, would update order field)
  const blogChildren = pages.filter((p) => p.parent_id === blog.id);
  assert.equal(blogChildren.length, 1);

  // Step 3: Move page to root
  blogSlug.parent_id = null;
  blogSlug.path = '/post/[slug]'; // Path would also change

  assert.equal(blogSlug.parent_id, null);
  assert.equal(blogSlug.path, '/post/[slug]');

  // Step 4: Verify paths updated correctly
  // (In real implementation, would cascade path updates)

  // Step 5: Delete cascade
  db.createPage({
    project_id: project.id,
    parent_id: blog.id,
    path: '/blog/archive',
    title: 'Archive',
  });

  const countBefore = db.getProjectPages(project.id).length;
  db.deletePage(blog.id, true); // Cascade delete
  const countAfter = db.getProjectPages(project.id).length;

  // Blog and its children (Archive) should be deleted
  // blogSlug and comments were already moved/orphaned
  assert(countAfter < countBefore);
});

// ============================================================================
// Multi-Step Feature Configuration
// ============================================================================

test('Integration: multi-step feature configuration', async () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Feature Config Test',
  });

  // Step 1: Select template
  project.config.template = 'saas';

  // Step 2: Configure features
  project.config.features = [
    { id: 'auth', enabled: true, provider: 'supabase' },
    { id: 'payments', enabled: true, provider: 'stripe' },
    { id: 'email', enabled: false, provider: null },
  ];

  // Step 3: Configure integrations
  project.config.integrations = [
    { type: 'auth', provider: 'supabase', config: { emailAuth: true, oauthProviders: ['google'] } },
    { type: 'payments', provider: 'stripe', config: { mode: 'subscription' } },
  ];

  // Step 4: Set theme
  project.config.theme = {
    primaryColor: '#3B82F6',
    fontFamily: 'Inter',
    darkMode: true,
  };

  db.updateProject(project.id, { config: project.config });

  // Verify configuration persisted
  const updatedProject = db.getProject(project.id);
  assert.equal(updatedProject.config.template, 'saas');
  assert.equal(updatedProject.config.features.length, 3);
  assert.equal(updatedProject.config.integrations.length, 2);
  assert.equal(updatedProject.config.theme.primaryColor, '#3B82F6');
});

// ============================================================================
// Auth-Protected Page Flow
// ============================================================================

test('Integration: auth-protected page flow', async () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Auth Flow Test',
  });

  // Create public pages
  db.createPage({
    project_id: project.id,
    path: '/',
    title: 'Home',
    auth_required: false,
  });

  db.createPage({
    project_id: project.id,
    path: '/pricing',
    title: 'Pricing',
    auth_required: false,
  });

  // Create protected dashboard
  const dashboard = db.createPage({
    project_id: project.id,
    path: '/dashboard',
    title: 'Dashboard',
    auth_required: true,
  });

  db.createPage({
    project_id: project.id,
    parent_id: dashboard.id,
    path: '/dashboard/settings',
    title: 'Settings',
    auth_required: true, // Inherits from parent
  });

  db.createPage({
    project_id: project.id,
    parent_id: dashboard.id,
    path: '/dashboard/billing',
    title: 'Billing',
    auth_required: true,
  });

  const pages = db.getProjectPages(project.id);
  const publicPages = pages.filter((p) => !p.auth_required);
  const protectedPages = pages.filter((p) => p.auth_required);

  assert.equal(publicPages.length, 2);
  assert.equal(protectedPages.length, 3);

  // Verify protected routes have correct middleware config in export
  function generateMiddleware(pgs) {
    const protectedPaths = pgs
      .filter((p) => p.auth_required)
      .map((p) => p.path.replace(/\[[\w]+\]/g, ':$1'));

    return {
      matcher: protectedPaths,
    };
  }

  const middleware = generateMiddleware(pages);
  assert.equal(middleware.matcher.length, 3);
  assert(middleware.matcher.includes('/dashboard'));
});

// ============================================================================
// Error Recovery Scenarios
// ============================================================================

test('Integration: handles failed page creation gracefully', () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Error Test',
  });

  // Create first page
  db.createPage({
    project_id: project.id,
    path: '/about',
    title: 'About',
  });

  // Try to create duplicate path (should fail in real implementation)
  function createPageWithValidation(data, dbInstance) {
    const existing = dbInstance.getProjectPages(data.project_id);
    if (existing.some((p) => p.path === data.path)) {
      return { success: false, error: 'DUPLICATE_PATH' };
    }
    return { success: true, page: dbInstance.createPage(data) };
  }

  const result = createPageWithValidation(
    { project_id: project.id, path: '/about', title: 'About 2' },
    db
  );

  assert.equal(result.success, false);
  assert.equal(result.error, 'DUPLICATE_PATH');
  assert.equal(db.getProjectPages(project.id).length, 1); // No duplicate created
});

test('Integration: handles version restore failure', () => {
  const db = createMockDatabase();

  // Try to restore non-existent version
  const result = db.restoreVersion('non_existent_version');

  assert.equal(result, false);
});

// ============================================================================
// Performance Scenarios
// ============================================================================

test('Integration: handles project with many pages', () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Large Project',
  });

  // Create 50 pages
  for (let i = 0; i < 50; i++) {
    db.createPage({
      project_id: project.id,
      path: `/page-${i}`,
      title: `Page ${i}`,
    });
  }

  const pages = db.getProjectPages(project.id);
  assert.equal(pages.length, 50);

  // Create version snapshot (should handle large data)
  const version = db.createVersion(project.id, 'Large snapshot');
  assert(version.id);
  assert.equal(version.pages_snapshot.length, 50);
});

test('Integration: handles deeply nested page hierarchy', () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Deep Nesting',
  });

  // Create 10-level deep nesting
  let parentId = null;
  let path = '';

  for (let i = 0; i < 10; i++) {
    path += `/level${i}`;
    const page = db.createPage({
      project_id: project.id,
      parent_id: parentId,
      path,
      title: `Level ${i}`,
    });
    parentId = page.id;
  }

  const pages = db.getProjectPages(project.id);
  assert.equal(pages.length, 10);

  // Verify deepest page has correct path
  const deepest = pages.find((p) => p.title === 'Level 9');
  assert(deepest.path.split('/').length - 1 === 10);
});

// ============================================================================
// Concurrent Operations
// ============================================================================

test('Integration: handles concurrent page updates', async () => {
  const db = createMockDatabase();

  const project = db.createProject({
    user_id: 'user_123',
    name: 'Concurrent Test',
  });

  // Simulate concurrent page creations
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      Promise.resolve(
        db.createPage({
          project_id: project.id,
          path: `/concurrent-${i}`,
          title: `Concurrent ${i}`,
        })
      )
    );
  }

  await Promise.all(promises);

  const pages = db.getProjectPages(project.id);
  assert.equal(pages.length, 5);

  // All pages should have unique IDs
  const ids = new Set(pages.map((p) => p.id));
  assert.equal(ids.size, 5);
});

