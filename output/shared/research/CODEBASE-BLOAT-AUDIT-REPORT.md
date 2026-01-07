# Codebase Bloat & MVP Scope Audit Report

**Date:** January 6, 2026  
**Auditor:** Documentation Agent  
**Purpose:** Identify bloat, dead code, and non-MVP features blocking development

---

## 🚨 CRITICAL FINDINGS

### 1. Massive Disk Bloat: 17GB in Agent Workspaces

| Directory | Size | Issue |
|-----------|------|-------|
| `output/agents/quality/workspace/export-tests-run` | **14GB** | Test exports with node_modules |
| `output/agents/quality/workspace/e2e-test-20260105` | **2GB** | Old E2E test with dependencies |
| `output/agents/quality/workspace/export-tests` | **407MB** | More test artifacts |
| `output/agents/testing` | **501MB** | Testing artifacts |

**Root Cause:** Test exports include full `node_modules` directories that are not gitignored.

**Immediate Fix:**
```bash
# Delete test artifacts (recoverable via re-running tests)
rm -rf output/agents/quality/workspace/export-tests-run
rm -rf output/agents/quality/workspace/e2e-test-*
rm -rf output/agents/quality/workspace/export-tests

# Add to .gitignore
echo "output/agents/*/workspace/export-tests*" >> .gitignore
echo "output/agents/*/workspace/e2e-test*" >> .gitignore
echo "output/agents/*/workspace/**/node_modules" >> .gitignore
```

**Disk Space Recovery: ~16.5GB**

---

## 📊 Codebase Size Analysis

| Component | Size | Lines of Code | Assessment |
|-----------|------|---------------|------------|
| website/ | 13MB | ~15,000 LOC | ⚠️ Growing |
| templates/ | 3.8MB | - | ✅ Appropriate |
| packages/ | 2.4MB | - | ✅ Lean |
| docs/ | 2MB | - | ✅ Appropriate |
| output/ (excl. bloat) | ~100MB | - | ⚠️ Should be lighter |

### Largest Files (Potential Complexity)

| File | Lines | Issue |
|------|-------|-------|
| `website/lib/generator/structure-generator.ts` | 1,012 | Large, could split |
| `website/lib/generator/template-base.ts` | 863 | Reasonable |
| `website/lib/features.ts` | 712 | ⚠️ Contains 19 features - many unused |
| `website/lib/configurator-state.ts` | 677 | Complex, but necessary |
| `website/lib/patterns/definition-builder.ts` | 640 | New pattern system |
| `website/app/configure/page.tsx` | 1,092 | ⚠️ Should be broken into components |

---

## 🎯 MVP vs Non-MVP Feature Analysis

### Current Integration Templates (16 categories, 28 providers)

| Category | Providers | MVP Essential? |
|----------|-----------|----------------|
| **auth** | supabase, clerk, nextauth | ✅ YES - Pick 1 |
| **payments** | stripe, paddle, lemonsqueezy | ✅ YES - Pick 1 |
| **email** | resend, sendgrid, postmark | ✅ YES - Pick 1 |
| **analytics** | posthog, plausible | ⚠️ Nice-to-have |
| **ai** | openai, anthropic | ⚠️ Nice-to-have |
| **storage** | uploadthing, r2 | ⚠️ Nice-to-have |
| **search** | algolia, meilisearch | ❌ Post-MVP |
| **cms** | sanity, contentful | ❌ Post-MVP |
| **monitoring** | sentry | ⚠️ Nice-to-have |
| **backgroundJobs** | inngest, trigger | ❌ Post-MVP |
| **notifications** | novu | ❌ Post-MVP |
| **featureFlags** | posthog-flags | ❌ Post-MVP |
| **imageOpt** | cloudinary | ❌ Post-MVP |
| **database** | (empty) | ❌ Incomplete |

**Recommendation:** Focus on 6 core integrations for MVP:
1. Auth: Supabase
2. Payments: Stripe
3. Email: Resend
4. Analytics: PostHog (or defer)
5. AI: Anthropic (or defer)
6. Storage: Uploadthing (or defer)

**Non-MVP to defer:** search, cms, backgroundJobs, notifications, featureFlags, imageOpt

---

### Current Features (19 defined in `features.ts`)

| Category | Features | MVP Essential? |
|----------|----------|----------------|
| **User Management** | social-login, email-registration, guest-browsing, admin-dashboard | ✅ Core 2-3 |
| **Product Database** | nutritional-info, price-tracking, stock-availability, brand-profiles, product-categories | ❌ Very niche |
| **Search & Filter** | full-text-search, advanced-filters, saved-searches | ⚠️ Maybe 1 |
| **E-commerce** | shopping-cart, checkout-flow, order-history, wishlist | ⚠️ Only if e-comm template |
| **Analytics** | page-views, user-tracking, conversion-funnels, reports | ❌ Defer |

**Problem:** Many features are domain-specific (nutritional-info, price-tracking) and shouldn't be in core.

**Recommendation:**
- MVP Features: social-login, email-registration, admin-dashboard
- Template-specific features should live in templates, not core

---

## 🔧 Code Quality Issues

### TODO/FIXME Comments (16 found)

| File | Count | Priority |
|------|-------|----------|
| `website/lib/generator/feature-loader.ts` | 6 | 🔴 High |
| `website/tests/supabase-oauth.spec.ts` | 4 | 🟡 Medium |
| `website/app/dashboard/projects/[id]/pages/page.tsx` | 3 | 🟡 Medium |
| Other files | 3 | 🟢 Low |

### Exports vs Usage

- **271 exports** found across 85 files in `website/lib/`
- Many may be unused (dead code)
- Recommendation: Run `npx knip` to find unused exports

---

## 📁 Output Directory Bloat

| Directory | Size | Contains | Action |
|-----------|------|----------|--------|
| `output/agents/` | 17GB | Test artifacts, node_modules | 🔴 DELETE tests |
| `output/media-pipeline/` | 50MB | Generated images | ⚠️ Review |
| `output/shared/` | 24MB | Research, design | ✅ Keep |
| `output/*/inbox/` | ~100KB | Task files | ✅ Keep |
| `output/*/done/` | ~200KB | Completed tasks | ⚠️ Archive old |

### Task File Status

- **49 pending tasks** in inbox folders
- **135 completed tasks** in done folders

**Too many pending tasks!** This creates cognitive overhead.

---

## 🏗️ Architectural Concerns

### 1. Preview/Export Disconnect (Addressed in Pattern System)

The new pattern system is being built to solve this. Good direction.

### 2. Configurator Complexity

`website/app/configure/page.tsx` is **1,092 lines** - should be:
- Split into smaller components
- Move logic to hooks
- Use composition over monolith

### 3. Generator Complexity

Generator files are large but necessary. However:
- `structure-generator.ts` (1,012 lines) could be split by section type
- Many edge cases may be over-engineered

### 4. Duplicate Systems

| System A | System B | Issue |
|----------|----------|-------|
| `lib/preview/` | `lib/ai/preview-generator.ts` | Two preview systems |
| `lib/generator/` | `lib/composer/` | Overlapping concerns |
| `lib/features.ts` | `lib/composer/patterns/` | Feature definitions scattered |

---

## 📋 MVP Scope Recommendation

### Minimum Viable Framework

To ship MVP quickly, focus on:

#### Templates (Keep 3)
1. **SaaS Starter** ✅
2. **Blog** ✅
3. **Landing Page** ✅

#### Integrations (Keep 4)
1. **Auth:** Supabase only
2. **Payments:** Stripe only
3. **Email:** Resend only
4. **Analytics:** PostHog only

#### Features (Keep 3)
1. Email registration
2. Social login
3. Admin dashboard

#### Configurator Steps (Keep 5)
1. Template selection
2. Integrations
3. Project name
4. Export method
5. Download

**Cut for MVP:**
- Research/inspiration step (complex, AI-heavy)
- AI preview generation (expensive, slow)
- Vision/mission fields
- Cursor/GitHub/Supabase/Vercel setup steps
- All non-core features

---

## ✅ Action Plan

### Immediate (Today)

1. **Delete test artifacts** (~16.5GB recovery):
```bash
rm -rf output/agents/quality/workspace/export-tests-run
rm -rf output/agents/quality/workspace/e2e-test-*
rm -rf output/agents/quality/workspace/export-tests
rm -rf output/agents/testing/workspace/**/node_modules
```

2. **Update .gitignore**:
```bash
echo "output/agents/*/workspace/export-*" >> .gitignore
echo "output/agents/*/workspace/e2e-*" >> .gitignore
echo "output/agents/*/workspace/**/node_modules" >> .gitignore
```

3. **Archive old done tasks**:
```bash
mkdir -p output/archive/done-2025
mv output/agents/*/done/2025* output/archive/done-2025/
```

### This Week

4. **Run dead code detection**:
```bash
npx knip --reporter compact
```

5. **Consolidate features.ts** - remove domain-specific features

6. **Split configure/page.tsx** into smaller components

### Next Week

7. **Defer non-MVP integrations** - move to `packages/templates/integrations-future/`

8. **Simplify configurator flow** - reduce from 10 steps to 5

9. **Consolidate preview systems** - one preview approach

---

## 📊 Summary Metrics

| Metric | Current | Target | Action |
|--------|---------|--------|--------|
| Disk usage (output/) | 17GB | <500MB | Delete test artifacts |
| Integration providers | 28 | 4-6 | Defer non-MVP |
| Features defined | 19 | 3-5 | Remove domain-specific |
| Pending tasks | 49 | <10 | Close or cancel stale |
| Configurator steps | 10 | 5 | Simplify flow |
| TODO comments | 16 | 0 | Resolve or remove |
| Largest file (LOC) | 1,092 | <300 | Split page.tsx |

---

## 🎯 MVP Definition

**What IS the MVP:**
- User can select a template (SaaS, Blog, Landing)
- User can add auth (Supabase) and payments (Stripe)
- User gets a working, exportable project
- Project builds and runs locally
- Project deploys to Vercel

**What is NOT MVP:**
- AI-powered preview generation
- Inspiration/research analysis
- 28 integration providers
- 19 feature toggles
- Pattern library WYSIWYG
- Multi-page editing
- Collaboration features

---

*Report generated by Documentation Agent*
*(DOCUMENTATION AGENT)*

