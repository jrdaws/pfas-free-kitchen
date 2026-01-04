# Export Remediation Plan

> **Quality Agent** | 2026-01-04
> **Based On**: export-analysis-testprojectnew03.md, export-scorecard-testprojectnew03.md
> **Overall Grade**: D (35/100) → Target: B+ (85/100)

---

## Executive Summary

### Previous Fix Status
✅ **Supabase Template Split** - COMPLETED
- `lib/supabase/client.ts` - Browser client (493 bytes)
- `lib/supabase/server.ts` - Server client with next/headers (1211 bytes)  
- `lib/supabase/index.ts` - Re-exports (278 bytes)

### Current Critical Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| Missing base UI components | P0 | Build fails - cannot compile |
| Missing 8 integration templates | P1 | 62% of user config not delivered |
| Features not translated to code | P1 | 38 features selected = 0 code |
| E-commerce template empty | P1 | No cart/checkout/products |
| Vision not applied | P2 | Generic content vs customized |

---

## 1. Failed Tests Analysis

### Build Errors (5 critical)

```
❌ Module not found: Can't resolve '@/components/Nav'
❌ Module not found: Can't resolve '@/components/Hero'
❌ Module not found: Can't resolve '@/components/FeatureCards'
❌ Module not found: Can't resolve '@/components/PricingTable'
❌ Module not found: Can't resolve '@/components/Testimonials'
```

**Root Cause**: `app/page.tsx` imports 8 components that aren't included in export:
- Nav, Hero, FeatureCards, PricingTable, Testimonials, FAQ, CTA, Footer

### Missing Files (23+ files)

| Category | Files Missing |
|----------|--------------|
| **UI Components** | Nav, Hero, FeatureCards, PricingTable, Testimonials, FAQ, CTA, Footer |
| **Supabase Auth** | login/page, signup/page, middleware, auth components |
| **Algolia Search** | lib/algolia.ts, SearchBox, SearchResults, SearchModal |
| **Sanity CMS** | lib/sanity.ts, sanity.config.ts |
| **Sentry** | sentry.client.config.ts, sentry.server.config.ts |
| **Cloudinary** | lib/cloudinary.ts |
| **Inngest** | lib/inngest.ts |
| **Novu** | lib/novu.ts |

### Integration Coverage

| Integration | Has Template? | Files Generated | Status |
|-------------|:-------------:|:---------------:|--------|
| Stripe | ✅ | ✅ | Working |
| UploadThing | ✅ | ✅ | Working |
| Resend | ✅ | ✅ | Working |
| Anthropic | ✅ | ✅ | Working |
| PostHog | ✅ | ✅ | Working |
| Supabase Auth | ✅ (fixed) | ❌ | **NOT BEING INCLUDED** |
| Algolia | ❌ | ❌ | No template |
| Sanity | ❌ | ❌ | No template |
| Sentry | ❌ | ❌ | No template |
| Cloudinary | ❌ | ❌ | No template |
| Inngest | ❌ | ❌ | No template |
| Novu | ❌ | ❌ | No template |
| PostHog Flags | ❌ | ❌ | No template |

---

## 2. Prioritized Fix List

### P0 - Critical (Build Blockers) - Must fix immediately

#### P0-1: Add Base UI Components to Template

**Files to create in `templates/saas/`:**

```
templates/saas/
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── FeatureCards.tsx
│   ├── PricingTable.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── CTA.tsx
│   ├── Footer.tsx
│   └── index.ts
```

**Action**: Website Agent - Copy existing components from `website/components/preview/` or create new ones.

#### P0-2: Fix Supabase Auth Export Path

**Issue**: Supabase templates exist at new path (`lib/supabase/client.ts`, `lib/supabase/server.ts`) but export route still uses old paths.

**File to update**: `website/app/api/export/zip/route.ts`

**Change required in INTEGRATION_PATHS**:
```typescript
"auth:supabase": [
  "integrations/auth/supabase/lib/supabase/client.ts",
  "integrations/auth/supabase/lib/supabase/server.ts", 
  "integrations/auth/supabase/lib/supabase/index.ts",
  "integrations/auth/supabase/app/api/auth/callback/route.ts",
  "integrations/auth/supabase/app/login/page.tsx",
  "integrations/auth/supabase/components/auth/auth-button.tsx",
  "integrations/auth/supabase/middleware.ts",
],
```

#### P0-3: Update TEMPLATE_COMPONENTS in Export Route

**File**: `website/app/api/export/zip/route.ts`

**Add missing components**:
```typescript
saas: {
  components: [
    // Add these:
    "components/Nav.tsx",
    "components/Hero.tsx",
    "components/FeatureCards.tsx",
    "components/PricingTable.tsx",
    "components/Testimonials.tsx",
    "components/FAQ.tsx",
    "components/CTA.tsx",
    "components/Footer.tsx",
    "components/index.ts",
    // ... existing
  ],
}
```

---

### P1 - High Priority (Major Functionality Gaps)

#### P1-1: Create Missing Integration Templates

**Priority order based on user demand**:

| Integration | Priority | Files Needed |
|-------------|----------|--------------|
| **Algolia Search** | P1-High | lib/algolia.ts, components/search/*.tsx, hooks/useSearch.ts |
| **Sentry Monitoring** | P1-High | sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts |
| **Sanity CMS** | P1-Med | lib/sanity.ts, sanity.config.ts, schemas/*.ts |
| **Cloudinary Images** | P1-Med | lib/cloudinary.ts, components/CloudinaryImage.tsx |
| **Inngest Jobs** | P1-Low | lib/inngest.ts, inngest/functions/*.ts |
| **Novu Notifications** | P1-Low | lib/novu.ts, components/NotificationBell.tsx |
| **PostHog Flags** | P1-Low | Already have PostHog, just add flag hooks |

**Action**: Website Agent - Create template files in:
```
templates/saas/integrations/
├── search/algolia/
├── monitoring/sentry/
├── cms/sanity/
├── imageOpt/cloudinary/
├── backgroundJobs/inngest/
├── notifications/novu/
└── featureFlags/posthog-flags/
```

#### P1-2: Add E-commerce Specific Components

**Current state**: E-commerce template just uses SaaS template base.

**Files to add to `templates/ecommerce/`**:
```
templates/ecommerce/
├── components/
│   ├── cart/
│   │   ├── CartContext.tsx
│   │   ├── CartButton.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CartItem.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ProductDetail.tsx
│   └── checkout/
│       ├── CheckoutForm.tsx
│       └── OrderSummary.tsx
├── app/
│   ├── products/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── cart/page.tsx
│   └── checkout/page.tsx
└── hooks/
    └── useCart.ts
```

#### P1-3: Implement Feature-to-Code Mapping

**Issue**: UI shows 38 features selected, but none translate to code.

**Solution**: Create feature templates that get included based on selection.

```
templates/features/
├── auth/
│   ├── basic-login/
│   ├── social-login/
│   ├── password-reset/
│   └── two-factor/
├── ecommerce/
│   ├── shopping-cart/
│   ├── checkout-flow/
│   ├── product-catalog/
│   └── order-management/
└── content/
    ├── blog-posts/
    ├── comments/
    └── admin-dashboard/
```

---

### P2 - Medium Priority (Quality Improvements)

#### P2-1: Apply Vision to Generated Content

**Current**: Generic "SaaS App" text regardless of user input.

**Solution**: Template placeholders that get replaced:
- `{{PROJECT_NAME}}` → User's project name
- `{{PROJECT_DESCRIPTION}}` → User's vision
- `{{HERO_TITLE}}` → Generated from vision
- `{{FEATURE_LIST}}` → Based on selected features

#### P2-2: Fix Package.json Version Mismatch

**Current**: States Next 15 but installs 14.1.4

**Fix**: Ensure package.json versions match what gets installed.

#### P2-3: Update Tailwind/Shadcn Components

Add proper shadcn/ui integration for professional UI components.

---

## 3. Specific File Changes Required

### File 1: `website/app/api/export/zip/route.ts`

```typescript
// Line ~16-85: Update TEMPLATE_COMPONENTS

const TEMPLATE_COMPONENTS = {
  saas: {
    pages: [
      "app/page.tsx",
      "app/layout.tsx",
      "app/dashboard/page.tsx",
      "app/dashboard/settings/page.tsx",
      "app/pricing/page.tsx",
    ],
    components: [
      // ADD THESE 8 MISSING COMPONENTS:
      "components/Nav.tsx",
      "components/Hero.tsx", 
      "components/FeatureCards.tsx",
      "components/PricingTable.tsx",
      "components/Testimonials.tsx",
      "components/FAQ.tsx",
      "components/CTA.tsx",
      "components/Footer.tsx",
      // Existing:
      "components/DashboardPreview.tsx",
      "components/index.ts",
      "components/ui/empty-state.tsx",
    ],
    // ...
  },
};

// Line ~89-95: Update INTEGRATION_PATHS for supabase

const INTEGRATION_PATHS = {
  "auth:supabase": [
    // UPDATE TO NEW PATHS:
    "integrations/auth/supabase/lib/supabase/client.ts",
    "integrations/auth/supabase/lib/supabase/server.ts",
    "integrations/auth/supabase/lib/supabase/index.ts",
    "integrations/auth/supabase/app/api/auth/callback/route.ts",
    "integrations/auth/supabase/app/login/page.tsx",
    "integrations/auth/supabase/components/auth/auth-button.tsx",
    "integrations/auth/supabase/middleware.ts",
  ],
  // ADD NEW INTEGRATIONS:
  "search:algolia": [
    "integrations/search/algolia/lib/algolia.ts",
    "integrations/search/algolia/components/search/SearchBox.tsx",
    "integrations/search/algolia/components/search/SearchResults.tsx",
    "integrations/search/algolia/hooks/useSearch.ts",
  ],
  "monitoring:sentry": [
    "integrations/monitoring/sentry/sentry.client.config.ts",
    "integrations/monitoring/sentry/sentry.server.config.ts",
    "integrations/monitoring/sentry/sentry.edge.config.ts",
    "integrations/monitoring/sentry/next.config.sentry.js",
  ],
  // ... other new integrations
};
```

### File 2: Create base components

Create these 8 files in `templates/saas/components/`:

| File | Source |
|------|--------|
| Nav.tsx | Copy from `website/components/preview/Nav.tsx` |
| Hero.tsx | Copy from `website/components/preview/Hero.tsx` |
| FeatureCards.tsx | Copy from `website/components/preview/FeatureCards.tsx` |
| PricingTable.tsx | Copy from `website/components/preview/PricingTable.tsx` or create |
| Testimonials.tsx | Create new |
| FAQ.tsx | Create new |
| CTA.tsx | Create new |
| Footer.tsx | Create new |

---

## 4. Validation After Fixes

### Test 1: Minimal SaaS Export
```bash
# Should now build successfully
curl -X POST http://localhost:3000/api/export/zip \
  -H "Content-Type: application/json" \
  -d '{"template":"saas","projectName":"test-fix","integrations":{"auth":"supabase"}}' \
  --output test-fix.zip

unzip test-fix.zip -d test-fix
cd test-fix && npm install && npm run build
# Expected: Build succeeds with 0 errors
```

### Test 2: Full Integration Export
```bash
# All 13 integrations should generate files
curl -X POST http://localhost:3000/api/export/zip \
  -d '{"template":"ecommerce","projectName":"test-full","integrations":{...13 integrations...}}'
  
# Expected: All integration files present
```

---

## 5. Task Assignments

### Immediate (Next 24 hours)

| Task | Agent | Priority |
|------|-------|----------|
| Create 8 missing base components | Website Agent | P0 |
| Update INTEGRATION_PATHS for Supabase | Website Agent | P0 |
| Update TEMPLATE_COMPONENTS to include base components | Website Agent | P0 |

### Short-term (This week)

| Task | Agent | Priority |
|------|-------|----------|
| Create Algolia integration template | Website Agent | P1 |
| Create Sentry integration template | Website Agent | P1 |
| Create E-commerce specific components | Website Agent | P1 |

### Medium-term (Next 2 weeks)

| Task | Agent | Priority |
|------|-------|----------|
| Create remaining integration templates | Website Agent | P1 |
| Implement feature-to-code mapping | Website Agent | P1 |
| Add vision templating | Website Agent | P2 |

---

## Next Agent Prompt

```
Confirm you are the Website Agent.

CRITICAL P0 FIX: Export builds are failing due to missing components.

Fix #1: Create base UI components in templates/saas/components/:
- Nav.tsx, Hero.tsx, FeatureCards.tsx, PricingTable.tsx
- Testimonials.tsx, FAQ.tsx, CTA.tsx, Footer.tsx
(Copy from website/components/preview/ where available)

Fix #2: Update website/app/api/export/zip/route.ts:
- Add the 8 components to TEMPLATE_COMPONENTS.saas.components[]
- Update INTEGRATION_PATHS["auth:supabase"] to use new paths:
  lib/supabase/client.ts, lib/supabase/server.ts, lib/supabase/index.ts

Validate by exporting a test project and running npm run build.
```

---

*Report generated by Quality Agent | 2026-01-04*

