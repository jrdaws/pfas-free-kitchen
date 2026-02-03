# Project Cleanup Report: Dawson Does Framework → PFAS Free Kitchen

**Generated:** 2026-02-03
**Purpose:** Identify files from the old Dawson Does Framework project that should be removed or replaced for the PFAS Free Kitchen project.

---

## Executive Summary

This project folder contains **two distinct projects**:
1. **Dawson Does Framework** - A CLI/SaaS builder tool (the OLD project)
2. **PFAS Free Kitchen** - A consumer product safety website (the NEW project)

Currently, Vercel is deploying the `website/` folder which contains the **Dawson Does Framework** configurator, not the PFAS Free Kitchen site.

---

## Files to REMOVE (Dawson Does Framework)

### Root Directory Files
These are all Dawson Does Framework specific:

| File | Size | Purpose |
|------|------|---------|
| `README.md` | 13KB | Framework documentation |
| `AI_GENERATION_ENGINE.md` | 20KB | AI generation docs |
| `AGENT_CONTEXT.md` | 2KB | Agent governance |
| `AUDIT_REPORT.md` | 504B | Framework audit |
| `CHANGELOG.md` | 3KB | Framework changelog |
| `COMMIT_SUMMARY.md` | 3KB | Framework commits |
| `CONTRIBUTING.md` | 13KB | Framework contributing guide |
| `COVERAGE_REPORT.md` | 10KB | Test coverage |
| `COVERAGE_SUCCESS.md` | 8KB | Coverage report |
| `DESIGN.md` | 172B | Framework design |
| `FIXES_APPLIED.md` | 7KB | Bug fixes |
| `FRAMEWORK_MAP.md` | 14KB | Framework map |
| `GOVERNANCE_CARD.md` | 3KB | Governance rules |
| `PUSH_SUCCESS.md` | 5KB | Push log |
| `RELEASE_NOTES_v0.3.0.md` | 9KB | Release notes |
| `SHIPPING_STATUS.md` | 10KB | Shipping status |
| `SUPABASE_SETUP.md` | 4KB | Supabase setup |
| `TESTING.md` | 8KB | Testing docs |
| `TESTING_GUIDE.md` | 10KB | Testing guide |
| `TEST_RUN_RESULTS.md` | 7KB | Test results |
| `TEST_SUITE_SUMMARY.md` | - | Test summary |
| `orchestrator.config.json` | - | Orchestrator config |
| `jrdaws-framework-*.tgz` | - | NPM packages |

### Directories to REMOVE

| Directory | Size | Purpose | Action |
|-----------|------|---------|--------|
| `website/` | 376MB | **Dawson Does Framework website** (currently deployed) | REMOVE |
| `packages/` | 2.4MB | Framework NPM packages | REMOVE |
| `templates/` | 3.8MB | Framework templates | REMOVE |
| `bin/` | - | Framework CLI | REMOVE |
| `tools/` | - | Framework tools | REMOVE |
| `prompts/` | - | Agent prompts | REMOVE |
| `output/` | - | Agent output | REMOVE |
| `automation/` | - | Keyboard Maestro setup | REMOVE |
| `cli-cursor-test/` | - | Test project | REMOVE |
| `cli-full-test/` | - | Test project | REMOVE |
| `cli-test-project/` | - | Test project | REMOVE |
| `test-project/` | - | Test project | REMOVE |
| `test-saas-project/` | - | Test project | REMOVE |
| `test-output/` | - | Test output | REMOVE |
| `test-output-mock/` | - | Mock test output | REMOVE |
| `tests/` | - | Framework tests | REMOVE |
| `coverage/` | - | Test coverage | REMOVE |
| `next-seo-template/` | - | SEO template | REMOVE |
| `_demo-saas/` | - | Demo project | REMOVE |
| `_handoff/` | - | Handoff docs | REMOVE |
| `--help/` | - | Help folder (malformed name) | REMOVE |
| `--list-integrations/` | - | Integrations list (malformed name) | REMOVE |
| `$(dirname )/` | - | Malformed directory | REMOVE |
| `logs/` | - | Log files | REMOVE |
| `tasks/` | - | Task files | REMOVE |

### Source Files to REMOVE

| Directory | Purpose | Action |
|-----------|---------|--------|
| `src/commands/` | CLI commands | REMOVE |
| `src/dd/` | Framework core | REMOVE |
| `src/adapters/` | Framework adapters | REMOVE |
| `src/auth/` | Framework auth | REMOVE |
| `src/config/` | Framework config | REMOVE |
| `src/middleware/` | Framework middleware | REMOVE |
| `src/platform/` | Framework platform | REMOVE |
| `src/repositories/` | Framework repos | REMOVE |
| `src/routes/` | Framework routes | REMOVE |
| `src/rules/` | Framework rules | REMOVE |
| `src/schemas/` | Framework schemas | REMOVE |
| `src/services/` | Framework services | REMOVE |
| `src/utils/` | Framework utils | REMOVE |

---

## Files to KEEP (PFAS Free Kitchen)

### PFAS Application Code

| Directory | Size | Purpose | Action |
|-----------|------|---------|--------|
| `src/pfas-web/` | 521MB | **PFAS Free Kitchen frontend** | ✅ KEEP & DEPLOY |
| `src/pfas-api/` | 102MB | **PFAS Free Kitchen API** | ✅ KEEP |
| `src/pfas-admin/` | - | **PFAS admin dashboard** | ✅ KEEP |
| `supabase/` | - | Database migrations | ✅ KEEP |
| `docs/pfas-platform/` | - | PFAS documentation | ✅ KEEP |

---

## Files to UPDATE

### Configuration Files

| File | Current State | Action |
|------|--------------|--------|
| `package.json` | Framework config | Update name, scripts |
| `.cursorrules` | Framework rules | Update for PFAS |
| `.env.example` | Framework vars | Update for PFAS |
| `.gitignore` | Shared | Keep as-is |
| `tsconfig.json` | Shared | May need update |

---

## Deployment Change Required

### Current (Wrong)
```
Vercel deploys: website/  →  Dawson Does Framework configurator
```

### Required (Correct)
```
Vercel deploys: src/pfas-web/  →  PFAS Free Kitchen website
```

### To Fix:
1. Go to Vercel → Settings → General
2. Change **Root Directory** from `website` to `src/pfas-web`
3. Redeploy

---

## Recommended Cleanup Order

### Phase 1: Fix Deployment (Immediate)
1. Change Vercel root directory to `src/pfas-web`
2. Verify PFAS site loads at pfasfreekitchen.com

### Phase 2: Remove Framework Files (After Verification)
1. Delete `website/` directory
2. Delete test directories (`cli-*`, `test-*`)
3. Delete framework docs (root `*.md` files)
4. Delete `packages/`, `templates/`, `bin/`, `tools/`

### Phase 3: Clean Source (Careful Review)
1. Review `src/` subdirectories
2. Keep only `pfas-*` directories
3. Update `package.json` for PFAS project

### Phase 4: Final Cleanup
1. Update `README.md` for PFAS project
2. Update `.cursorrules` for PFAS project
3. Verify all functionality works

---

## File Count Summary

| Category | Count | Size |
|----------|-------|------|
| Files to REMOVE | ~2,000+ | ~400MB |
| Files to KEEP | ~300 | ~625MB |
| Files to UPDATE | ~10 | <1MB |

---

## Important Notes

1. **Do NOT delete without backup** - Create a branch or backup first
2. **Test after each phase** - Verify site still works
3. **The PFAS site already exists** - It's in `src/pfas-web/`
4. **API needs separate deployment** - `src/pfas-api/` may need its own hosting

---

*Report generated by Cursor AI*
