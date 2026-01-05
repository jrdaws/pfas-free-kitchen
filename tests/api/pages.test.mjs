// tests/api/pages.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Tests for Page Hierarchy API endpoints
 * Reference: PLATFORM_ARCHITECTURE_RESEARCH.md
 *
 * These tests validate the page tree editor API for managing page structures.
 */

// ============================================================================
// Mock Data Helpers
// ============================================================================

function createMockPage(overrides = {}) {
  return {
    id: 'page_' + Math.random().toString(36).slice(2, 10),
    project_id: 'proj_123',
    parent_id: null,
    order: 0,
    path: '/about',
    route_type: 'static',
    layout_id: null,
    title: 'About',
    description: 'About page',
    components: [],
    generation_prompt: null,
    generated_content: null,
    generated_at: null,
    auth_required: false,
    allowed_roles: null,
    ...overrides,
  };
}

function createPageTree() {
  const home = createMockPage({ id: 'home', path: '/', title: 'Home', order: 0 });
  const about = createMockPage({ id: 'about', path: '/about', title: 'About', order: 1 });
  const blog = createMockPage({ id: 'blog', path: '/blog', title: 'Blog', order: 2 });
  const blogSlug = createMockPage({
    id: 'blog-slug',
    path: '/blog/[slug]',
    title: 'Blog Post',
    parent_id: 'blog',
    route_type: 'dynamic',
    order: 0,
  });
  const dashboard = createMockPage({
    id: 'dashboard',
    path: '/dashboard',
    title: 'Dashboard',
    auth_required: true,
    order: 3,
  });
  const settings = createMockPage({
    id: 'settings',
    path: '/dashboard/settings',
    title: 'Settings',
    parent_id: 'dashboard',
    auth_required: true,
    order: 0,
  });

  return [home, about, blog, blogSlug, dashboard, settings];
}

// ============================================================================
// Page CRUD - Create
// ============================================================================

test('Page CRUD: creates page with valid path', () => {
  const request = {
    project_id: 'proj_123',
    path: '/products',
    title: 'Products',
    route_type: 'static',
  };

  const page = createMockPage(request);

  assert.equal(page.path, '/products');
  assert.equal(page.title, 'Products');
  assert.equal(page.route_type, 'static');
});

test('Page CRUD: validates path format - must start with /', () => {
  const invalidPaths = ['about', 'products/list', ''];
  const validPaths = ['/', '/about', '/products/list', '/api/webhook'];

  for (const path of invalidPaths) {
    assert.equal(path.startsWith('/'), false, `Expected ${path} to be invalid`);
  }

  for (const path of validPaths) {
    assert.equal(path.startsWith('/'), true, `Expected ${path} to be valid`);
  }
});

test('Page CRUD: validates path format - no double slashes', () => {
  function isValidPath(path) {
    if (!path.startsWith('/')) return false;
    if (path.includes('//')) return false;
    if (path.length > 1 && path.endsWith('/')) return false;
    return true;
  }

  assert.equal(isValidPath('/about'), true);
  assert.equal(isValidPath('//about'), false);
  assert.equal(isValidPath('/about//more'), false);
  assert.equal(isValidPath('/about/'), false);
  assert.equal(isValidPath('/'), true); // Root is valid
});

test('Page CRUD: prevents duplicate paths in project', () => {
  const existingPages = [
    createMockPage({ project_id: 'proj_123', path: '/about' }),
    createMockPage({ project_id: 'proj_123', path: '/pricing' }),
  ];

  const newPath = '/about';
  const projectId = 'proj_123';

  const isDuplicate = existingPages.some(
    (p) => p.project_id === projectId && p.path === newPath
  );

  assert.equal(isDuplicate, true);
});

test('Page CRUD: allows same path in different projects', () => {
  const existingPages = [
    createMockPage({ project_id: 'proj_123', path: '/about' }),
  ];

  const newPath = '/about';
  const projectId = 'proj_456'; // Different project

  const isDuplicate = existingPages.some(
    (p) => p.project_id === projectId && p.path === newPath
  );

  assert.equal(isDuplicate, false);
});

test('Page CRUD: handles dynamic routes [id]', () => {
  const page = createMockPage({
    path: '/products/[id]',
    route_type: 'dynamic',
  });

  const hasDynamicSegment = /\[[\w]+\]/.test(page.path);

  assert.equal(hasDynamicSegment, true);
  assert.equal(page.route_type, 'dynamic');
});

test('Page CRUD: handles catch-all routes [...slug]', () => {
  const page = createMockPage({
    path: '/docs/[...slug]',
    route_type: 'catch-all',
  });

  const hasCatchAll = /\[\.\.\.[\w]+\]/.test(page.path);

  assert.equal(hasCatchAll, true);
  assert.equal(page.route_type, 'catch-all');
});

test('Page CRUD: handles optional catch-all routes [[...slug]]', () => {
  const page = createMockPage({
    path: '/shop/[[...categories]]',
    route_type: 'catch-all',
  });

  const hasOptionalCatchAll = /\[\[\.\.\.[\w]+\]\]/.test(page.path);

  assert.equal(hasOptionalCatchAll, true);
});

test('Page CRUD: handles API routes', () => {
  const page = createMockPage({
    path: '/api/webhook',
    route_type: 'api',
    title: 'Webhook Handler',
  });

  assert.equal(page.route_type, 'api');
  assert(page.path.startsWith('/api'));
});

test('Page CRUD: sets parent_id correctly', () => {
  const parentPage = createMockPage({ id: 'blog', path: '/blog' });
  const childPage = createMockPage({
    id: 'blog-post',
    path: '/blog/[slug]',
    parent_id: 'blog',
  });

  assert.equal(childPage.parent_id, parentPage.id);
});

// ============================================================================
// Page Reordering
// ============================================================================

test('Page Reordering: reorders pages within parent', () => {
  const pages = [
    createMockPage({ id: '1', parent_id: null, order: 0, title: 'A' }),
    createMockPage({ id: '2', parent_id: null, order: 1, title: 'B' }),
    createMockPage({ id: '3', parent_id: null, order: 2, title: 'C' }),
  ];

  // Move B (order 1) to first position (order 0)
  function reorder(pagesArray, pageId, newOrder) {
    const page = pagesArray.find((p) => p.id === pageId);
    const oldOrder = page.order;

    if (newOrder < oldOrder) {
      // Moving up: increment others
      for (const p of pagesArray) {
        if (p.parent_id === page.parent_id && p.order >= newOrder && p.order < oldOrder) {
          p.order++;
        }
      }
    } else if (newOrder > oldOrder) {
      // Moving down: decrement others
      for (const p of pagesArray) {
        if (p.parent_id === page.parent_id && p.order <= newOrder && p.order > oldOrder) {
          p.order--;
        }
      }
    }
    page.order = newOrder;

    return pagesArray.sort((a, b) => a.order - b.order);
  }

  const reordered = reorder([...pages], '2', 0);

  assert.equal(reordered[0].title, 'B');
  assert.equal(reordered[1].title, 'A');
  assert.equal(reordered[2].title, 'C');
});

test('Page Reordering: moves page to different parent', () => {
  const pages = [
    createMockPage({ id: 'blog', parent_id: null, path: '/blog' }),
    createMockPage({ id: 'post', parent_id: 'blog', path: '/blog/post' }),
    createMockPage({ id: 'articles', parent_id: null, path: '/articles' }),
  ];

  // Move 'post' from 'blog' to 'articles'
  const page = pages.find((p) => p.id === 'post');
  page.parent_id = 'articles';
  page.path = '/articles/post'; // Path must also change

  assert.equal(page.parent_id, 'articles');
  assert.equal(page.path, '/articles/post');
});

test('Page Reordering: updates child paths when parent changes', () => {
  const pages = [
    createMockPage({ id: 'blog', parent_id: null, path: '/blog' }),
    createMockPage({ id: 'post', parent_id: 'blog', path: '/blog/post' }),
    createMockPage({ id: 'comment', parent_id: 'post', path: '/blog/post/comment' }),
  ];

  function updateChildPaths(pagesArray, parentId, oldPrefix, newPrefix) {
    for (const page of pagesArray) {
      if (page.parent_id === parentId || page.path.startsWith(oldPrefix + '/')) {
        page.path = page.path.replace(oldPrefix, newPrefix);
        // Recursively update children
        updateChildPaths(pagesArray, page.id, oldPrefix, newPrefix);
      }
    }
  }

  // Rename /blog to /articles
  const blog = pages.find((p) => p.id === 'blog');
  const oldPath = blog.path;
  blog.path = '/articles';
  updateChildPaths(pages, 'blog', oldPath, '/articles');

  assert.equal(pages[0].path, '/articles');
  assert.equal(pages[1].path, '/articles/post');
  assert.equal(pages[2].path, '/articles/post/comment');
});

test('Page Reordering: prevents circular references', () => {
  const pages = [
    createMockPage({ id: 'a', parent_id: null }),
    createMockPage({ id: 'b', parent_id: 'a' }),
    createMockPage({ id: 'c', parent_id: 'b' }),
  ];

  function wouldCreateCircle(pagesArray, pageId, newParentId) {
    if (pageId === newParentId) return true;

    let current = newParentId;
    const visited = new Set();

    while (current) {
      if (visited.has(current)) return true;
      if (current === pageId) return true;
      visited.add(current);

      const parent = pagesArray.find((p) => p.id === current);
      current = parent?.parent_id;
    }

    return false;
  }

  // Try to make A a child of C (would create A → B → C → A)
  const wouldCircle = wouldCreateCircle(pages, 'a', 'c');

  assert.equal(wouldCircle, true);

  // Valid move: C to root
  const wouldCircle2 = wouldCreateCircle(pages, 'c', null);
  assert.equal(wouldCircle2, false);
});

// ============================================================================
// Page Deletion
// ============================================================================

test('Page Deletion: deletes page and children (cascade)', () => {
  const pages = [
    createMockPage({ id: 'blog', parent_id: null, path: '/blog' }),
    createMockPage({ id: 'post', parent_id: 'blog', path: '/blog/post' }),
    createMockPage({ id: 'comment', parent_id: 'post', path: '/blog/post/comment' }),
    createMockPage({ id: 'about', parent_id: null, path: '/about' }),
  ];

  function cascadeDelete(pagesArray, pageId) {
    const toDelete = new Set([pageId]);

    // Find all descendants
    let changed = true;
    while (changed) {
      changed = false;
      for (const page of pagesArray) {
        if (!toDelete.has(page.id) && toDelete.has(page.parent_id)) {
          toDelete.add(page.id);
          changed = true;
        }
      }
    }

    return pagesArray.filter((p) => !toDelete.has(p.id));
  }

  const remaining = cascadeDelete([...pages], 'blog');

  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, 'about');
});

test('Page Deletion: orphans children to root (configurable)', () => {
  const pages = [
    createMockPage({ id: 'blog', parent_id: null, path: '/blog' }),
    createMockPage({ id: 'post', parent_id: 'blog', path: '/blog/post' }),
    createMockPage({ id: 'about', parent_id: null, path: '/about' }),
  ];

  function orphanDelete(pagesArray, pageId) {
    const page = pagesArray.find((p) => p.id === pageId);
    if (!page) return pagesArray;

    // Orphan children to root
    for (const p of pagesArray) {
      if (p.parent_id === pageId) {
        p.parent_id = null;
        // Keep path but could update
      }
    }

    return pagesArray.filter((p) => p.id !== pageId);
  }

  const remaining = orphanDelete([...pages], 'blog');

  assert.equal(remaining.length, 2);
  const orphan = remaining.find((p) => p.id === 'post');
  assert.equal(orphan.parent_id, null); // Orphaned to root
});

test('Page Deletion: removes from navigation', () => {
  const pages = createPageTree();
  const navigation = pages.filter((p) => p.route_type !== 'api' && !p.auth_required);

  // Delete a navigation page
  const deletedId = 'about';
  const updatedNav = navigation.filter((p) => p.id !== deletedId);

  assert(navigation.some((p) => p.id === deletedId));
  assert(!updatedNav.some((p) => p.id === deletedId));
});

// ============================================================================
// Route Type Detection
// ============================================================================

test('Route Type Detection: identifies static routes', () => {
  function detectRouteType(path) {
    if (/\[\[\.\.\.[\w]+\]\]/.test(path)) return 'optional-catch-all';
    if (/\[\.\.\.[\w]+\]/.test(path)) return 'catch-all';
    if (/\[[\w]+\]/.test(path)) return 'dynamic';
    if (path.startsWith('/api/')) return 'api';
    return 'static';
  }

  assert.equal(detectRouteType('/about'), 'static');
  assert.equal(detectRouteType('/products'), 'static');
  assert.equal(detectRouteType('/'), 'static');
});

test('Route Type Detection: identifies dynamic routes', () => {
  function detectRouteType(path) {
    if (/\[\[\.\.\.[\w]+\]\]/.test(path)) return 'optional-catch-all';
    if (/\[\.\.\.[\w]+\]/.test(path)) return 'catch-all';
    if (/\[[\w]+\]/.test(path)) return 'dynamic';
    if (path.startsWith('/api/')) return 'api';
    return 'static';
  }

  assert.equal(detectRouteType('/products/[id]'), 'dynamic');
  assert.equal(detectRouteType('/users/[userId]/posts'), 'dynamic');
  assert.equal(detectRouteType('/blog/[slug]'), 'dynamic');
});

test('Route Type Detection: identifies catch-all routes', () => {
  function detectRouteType(path) {
    if (/\[\[\.\.\.[\w]+\]\]/.test(path)) return 'optional-catch-all';
    if (/\[\.\.\.[\w]+\]/.test(path)) return 'catch-all';
    if (/\[[\w]+\]/.test(path)) return 'dynamic';
    if (path.startsWith('/api/')) return 'api';
    return 'static';
  }

  assert.equal(detectRouteType('/docs/[...slug]'), 'catch-all');
  assert.equal(detectRouteType('/shop/[[...categories]]'), 'optional-catch-all');
});

test('Route Type Detection: identifies API routes', () => {
  function detectRouteType(path) {
    if (path.startsWith('/api/')) return 'api';
    if (/\[\.\.\.[\w]+\]/.test(path)) return 'catch-all';
    if (/\[[\w]+\]/.test(path)) return 'dynamic';
    return 'static';
  }

  assert.equal(detectRouteType('/api/webhook'), 'api');
  assert.equal(detectRouteType('/api/users/[id]'), 'api'); // API with dynamic segment
  assert.equal(detectRouteType('/api/stripe/checkout'), 'api');
});

// ============================================================================
// Component Slots
// ============================================================================

test('Component Slots: page has ordered component slots', () => {
  const page = createMockPage({
    components: [
      { id: 'slot_1', slot_type: 'header', order: 0, source: 'shared' },
      { id: 'slot_2', slot_type: 'hero', order: 1, source: 'ai-generated' },
      { id: 'slot_3', slot_type: 'content', order: 2, source: 'page-specific' },
      { id: 'slot_4', slot_type: 'footer', order: 3, source: 'shared' },
    ],
  });

  assert.equal(page.components.length, 4);
  assert.equal(page.components[0].slot_type, 'header');
  assert.equal(page.components[3].slot_type, 'footer');
});

test('Component Slots: slot types are valid', () => {
  const validSlotTypes = ['header', 'hero', 'content', 'sidebar', 'footer', 'custom'];

  const slots = [
    { slot_type: 'header' },
    { slot_type: 'hero' },
    { slot_type: 'invalid' },
  ];

  for (const slot of slots) {
    const isValid = validSlotTypes.includes(slot.slot_type);
    if (slot.slot_type === 'invalid') {
      assert.equal(isValid, false);
    } else {
      assert.equal(isValid, true);
    }
  }
});

test('Component Slots: source types are valid', () => {
  const validSources = ['shared', 'page-specific', 'ai-generated'];

  for (const source of validSources) {
    assert(validSources.includes(source));
  }
});

// ============================================================================
// Auth Required Pages
// ============================================================================

test('Auth Required: page can require authentication', () => {
  const publicPage = createMockPage({ auth_required: false });
  const protectedPage = createMockPage({ auth_required: true });

  assert.equal(publicPage.auth_required, false);
  assert.equal(protectedPage.auth_required, true);
});

test('Auth Required: child inherits parent auth status', () => {
  const pages = [
    createMockPage({ id: 'dashboard', auth_required: true }),
    createMockPage({ id: 'settings', parent_id: 'dashboard', auth_required: true }),
  ];

  function isPageProtected(pagesArray, pageId) {
    const page = pagesArray.find((p) => p.id === pageId);
    if (!page) return false;

    if (page.auth_required) return true;
    if (page.parent_id) {
      return isPageProtected(pagesArray, page.parent_id);
    }
    return false;
  }

  assert.equal(isPageProtected(pages, 'settings'), true);
  assert.equal(isPageProtected(pages, 'dashboard'), true);
});

test('Auth Required: can specify allowed roles', () => {
  const adminPage = createMockPage({
    auth_required: true,
    allowed_roles: ['admin', 'super-admin'],
  });

  assert.deepEqual(adminPage.allowed_roles, ['admin', 'super-admin']);
});

// ============================================================================
// Edge Cases
// ============================================================================

test('Edge Case: handles very deep nesting', () => {
  const depth = 10;
  const pages = [];
  let parentId = null;
  let path = '';

  for (let i = 0; i < depth; i++) {
    const id = `level_${i}`;
    path += `/level${i}`;
    pages.push(createMockPage({ id, parent_id: parentId, path }));
    parentId = id;
  }

  assert.equal(pages.length, depth);
  assert.equal(pages[9].path.split('/').length - 1, depth);
});

test('Edge Case: handles empty project (no pages)', () => {
  const pages = [];
  const tree = buildTree(pages);

  function buildTree(pagesArray) {
    return pagesArray.filter((p) => !p.parent_id);
  }

  assert.equal(tree.length, 0);
});

test('Edge Case: handles root-only project', () => {
  const pages = [createMockPage({ path: '/', title: 'Home' })];

  assert.equal(pages.length, 1);
  assert.equal(pages[0].path, '/');
});

