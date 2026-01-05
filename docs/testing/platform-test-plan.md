# Platform Features Test Plan

> **Testing Agent** | January 4, 2026  
> **Reference**: [PLATFORM_ARCHITECTURE_RESEARCH.md](../../output/shared/design/PLATFORM_ARCHITECTURE_RESEARCH.md)

---

## Overview

This document defines the comprehensive test plan for the new platform features:
- **Project Management Dashboard** - Multi-project CRUD operations
- **Page Tree Editor** - Visual page hierarchy management
- **Environment Sync** - CLI-based env variable management
- **Multi-Page Preview** - Interactive linked preview system

---

## Test Coverage Targets

| Area | Target | Current | Status |
|------|--------|---------|--------|
| API Routes | 90% | 0% | 🔴 Not Started |
| CLI Commands | 85% | 0% | 🔴 Not Started |
| UI Components | 75% | 0% | 🔴 Not Started |
| Integration | Key flows | 0% | 🔴 Not Started |
| E2E | Happy paths | 0% | 🔴 Not Started |
| Security (RLS) | 100% | 0% | 🔴 Not Started |

---

## 1. Project Management Tests

**Location**: `tests/api/projects.test.mjs`

### GET /api/projects

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Returns only user's projects | P0 | User A cannot see User B's projects |
| Returns empty array for new user | P0 | Fresh user gets `[]` |
| Excludes archived projects by default | P1 | `status: active` filter applied |
| Includes archived with `?status=archived` | P1 | Query param override works |
| Requires authentication | P0 | 401 without valid session |
| Pagination works correctly | P2 | `?page=2&limit=10` |
| Sorting by updated_at | P2 | Most recent first by default |

### POST /api/projects

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Creates project with valid data | P0 | Returns 201 with project |
| Generates unique slug | P0 | `my-project` → `my-project-1` on collision |
| Rejects duplicate names | P1 | Same user cannot have same project name |
| Requires authentication | P0 | 401 without valid session |
| Validates required fields | P0 | 400 for missing name |
| Applies rate limiting | P1 | 429 after threshold |

### PATCH /api/projects/[id]

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Updates project name | P0 | Name change persists |
| Updates project status | P1 | `active` → `archived` |
| Rejects invalid status | P1 | 400 for `status: invalid` |
| Prevents editing other user's project | P0 | 403 for non-owner |
| Returns 404 for non-existent project | P1 | Clear error message |

### DELETE /api/projects/[id]

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Soft deletes (archives) project | P0 | Status becomes `deleted`, not hard delete |
| Prevents deleting other user's project | P0 | 403 for non-owner |
| Returns 404 for non-existent project | P1 | Clear error message |

---

## 2. Page Hierarchy Tests

**Location**: `tests/api/pages.test.mjs`

### Page CRUD

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Creates page with valid path | P0 | `/about`, `/products` work |
| Validates path format | P0 | Rejects invalid characters |
| Prevents duplicate paths in project | P0 | 400 for path collision |
| Handles dynamic routes `[id]` | P0 | `/products/[id]` parsed correctly |
| Handles catch-all routes `[...slug]` | P1 | `/docs/[...slug]` parsed correctly |
| Handles API routes | P1 | Route type `api` works |
| Sets parent_id correctly | P1 | Child pages linked to parent |

### Page Reordering

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Reorders pages within parent | P0 | Order 1,2,3 → 2,1,3 |
| Moves page to different parent | P1 | Child → root or other parent |
| Updates child paths when parent changes | P1 | `/blog/post` → `/articles/post` |
| Prevents circular references | P0 | A → B → A rejected |

### Page Deletion

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Deletes page and children | P0 | Cascade delete works |
| Orphans children to root (configurable) | P2 | Alternative behavior option |
| Removes from navigation | P1 | Deleted pages not in nav |

---

## 3. Environment Sync Tests

**Location**: `tests/cli/env.test.mjs`

### env pull

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Writes .env.local with public keys | P0 | File created with correct content |
| Includes placeholder for secret keys | P0 | `# STRIPE_SECRET_KEY=` format |
| Warns if .env.local exists without --force | P0 | Confirmation prompt |
| Respects --dry-run flag | P1 | No file written, output shown |
| Fails gracefully without auth | P0 | Clear error message |
| Creates backup of existing file | P1 | `.env.local.backup` created |

### env push

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Pushes only public keys | P0 | Secret keys filtered out |
| Validates keys before push | P1 | Malformed rejected |
| Requires authentication | P0 | 401 without session |
| Respects --public-only flag | P1 | Explicit filter |

### env check

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Reports missing required variables | P0 | Clear list of missing vars |
| Reports present variables | P1 | Green checkmarks |
| Exits 0 if all required present | P0 | CI-friendly |
| Exits 1 if missing required | P0 | CI-friendly |
| Shows which integration needs which vars | P2 | Helpful guidance |

---

## 4. Integration Test Scenarios

**Location**: `tests/integration/project-workflow.test.mjs`

### Complete Project Creation Flow

```
1. Create project → verify 201
2. Add pages (home, about, pricing) → verify hierarchy
3. Configure component slots → verify saved
4. Export project → verify ZIP structure
5. Verify exported files match config
```

### Version Snapshot and Restore

```
1. Create project with pages
2. Create version snapshot → get version_id
3. Make changes (add page, delete page)
4. Restore snapshot → verify original state
5. Verify version history shows all actions
```

### Page Tree Manipulation

```
1. Create nested structure: /blog, /blog/[slug], /blog/[slug]/comments
2. Reorder /blog children
3. Move /blog/[slug] to root
4. Verify all paths updated correctly
5. Delete /blog cascade → verify children handled
```

---

## 5. E2E Test Plan (Playwright)

**Location**: `website/tests/dashboard.spec.ts`

### Dashboard Empty State

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Displays empty state for new user | P0 | "Create your first project" CTA |
| Empty state has create button | P0 | Clickable, opens modal |
| Shows correct illustration | P2 | Visual check |

### Project Creation

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Creates project via modal | P0 | Full flow: name → template → create |
| Modal validates required fields | P0 | Error for empty name |
| New project appears in grid | P0 | Card visible after create |
| Keyboard shortcut opens modal | P1 | `⌘N` / `Ctrl+N` |

### Project Actions

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Opens project on card click | P0 | Navigate to /project/[id] |
| Archives project via menu | P0 | ⋯ → Archive → confirmation |
| Clones project via menu | P1 | ⋯ → Clone → new project created |
| Deletes project via menu | P1 | ⋯ → Delete → confirmation |
| Context menu has all actions | P0 | Open, Clone, Archive, Delete |

### Search & Filter

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Searches projects with ⌘K | P0 | Opens search modal |
| Search filters by project name | P0 | Matches partial text |
| Filter by status works | P1 | Active, Archived tabs |
| Empty search shows all | P0 | Clearing search resets view |

### Keyboard Navigation

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Arrow keys navigate grid | P1 | Focus moves between cards |
| Enter opens focused project | P1 | Same as click |
| Escape closes modals | P0 | Universal escape handler |

---

## 6. Security Tests (Row Level Security)

**Location**: `tests/security/rls.test.mjs`

### Project Access Control

| Test Case | Priority | Description |
|-----------|----------|-------------|
| User cannot read other user projects | P0 | SELECT returns empty |
| User cannot update other user projects | P0 | UPDATE fails with policy error |
| User cannot delete other user projects | P0 | DELETE fails with policy error |
| API validates ownership before mutation | P0 | 403 even if direct DB access |

### Page Access Control

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Pages inherit project access | P0 | No cross-project page access |
| Cannot modify pages in other's project | P0 | UPDATE fails |
| API validates project ownership for pages | P0 | 403 for non-owner |

### Service Connections

| Test Case | Priority | Description |
|-----------|----------|-------------|
| User cannot see other's connected services | P0 | SELECT filtered by user_id |
| Cannot modify other's service connections | P0 | UPDATE fails |
| OAuth tokens isolated per user | P0 | Token access scoped |

### Version History

| Test Case | Priority | Description |
|-----------|----------|-------------|
| Version history scoped to project owner | P0 | Cannot view other's history |
| Restore only works for own projects | P0 | 403 for non-owner |

---

## Test Execution

### Running Tests

```bash
# All platform tests
npm test -- --grep "platform"

# API tests only
npm test -- tests/api/projects.test.mjs tests/api/pages.test.mjs

# CLI env tests
npm test -- tests/cli/env.test.mjs

# Integration tests
npm test -- tests/integration/project-workflow.test.mjs

# E2E tests (Playwright)
cd website && npx playwright test dashboard.spec.ts

# Security tests
npm test -- tests/security/rls.test.mjs
```

### CI Pipeline Updates

Add to `.github/workflows/test.yml`:

```yaml
- name: Run Platform Tests
  run: npm test -- tests/api/projects.test.mjs tests/api/pages.test.mjs

- name: Run Security Tests
  run: npm test -- tests/security/rls.test.mjs

- name: Run Dashboard E2E
  run: |
    cd website
    npx playwright install --with-deps
    npx playwright test dashboard.spec.ts
```

---

## Performance Benchmarks

| Operation | Target | Measurement |
|-----------|--------|-------------|
| Project list (10 projects) | < 100ms | API response time |
| Project create | < 200ms | API response time |
| Page tree load (20 pages) | < 150ms | API response time |
| Page reorder | < 100ms | API response time |
| env pull | < 2s | CLI completion time |
| env check | < 500ms | CLI completion time |

---

## Success Criteria

- [ ] All P0 test cases passing
- [ ] 90% coverage on API routes
- [ ] 85% coverage on CLI commands
- [ ] E2E tests running in CI
- [ ] Security tests covering all RLS policies
- [ ] Performance benchmarks met

---

## Not in Scope

- Load testing (future phase)
- Visual regression testing
- Mobile-specific E2E tests
- Stress testing for concurrent users

---

*Test plan created by Testing Agent. Ready for implementation.*

