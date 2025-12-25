# Feature-to-Code Mapping System

This directory contains code templates for each selectable feature in the configurator.

## How It Works

1. **User selects features** in the web configurator
2. **Generator reads** `feature-mapping.json` to resolve dependencies
3. **Templates are copied** from `templates/features/{category}/{feature-id}/`
4. **Placeholders are replaced** (`{{PROJECT_NAME}}`, etc.)
5. **CLAUDE.md is generated** with feature context

## Directory Structure

```
templates/features/
├── feature-mapping.json       # Maps features to templates
├── README.md                  # This file
│
├── user-management/           # Authentication & admin features
│   ├── email-registration/
│   │   ├── lib/auth/email-auth.ts
│   │   └── app/(auth)/login/page.tsx
│   ├── social-login/
│   ├── guest-browsing/
│   └── admin-dashboard/
│
├── product-database/          # Data models & content
│   ├── nutritional-info/
│   ├── price-tracking/
│   ├── stock-availability/
│   ├── brand-profiles/
│   └── product-categories/
│
├── search-filter/             # Search & discovery
│   ├── full-text-search/
│   ├── advanced-filters/
│   └── saved-searches/
│
├── ecommerce/                 # Shopping & payments
│   ├── shopping-cart/
│   ├── checkout-flow/
│   ├── order-history/
│   └── wishlist/
│
└── analytics/                 # Tracking & reporting
    ├── page-views/
    ├── user-tracking/
    ├── conversion-funnels/
    └── reports/
```

## Feature Mapping Schema

Each feature in `feature-mapping.json` has:

```json
{
  "feature-id": {
    "category": "user-management",
    "complexity": "medium",
    "dependencies": ["email-registration"],
    "templates": [
      "user-management/feature-id/lib/file.ts",
      "user-management/feature-id/components/Component.tsx"
    ],
    "envVars": ["ENV_VAR_NAME"],
    "packages": ["package-name"]
  }
}
```

## Template Output Paths

Template paths follow this pattern:
- Source: `templates/features/{category}/{feature-id}/{path}`
- Output: `{project}/{path}` (first two path segments removed)

Example:
- Source: `user-management/admin-dashboard/app/admin/page.tsx`
- Output: `my-project/app/admin/page.tsx`

## Placeholder Variables

Templates can use these placeholders:
- `{{PROJECT_NAME}}` - Display name (e.g., "My Project")
- `{{project_name}}` - Slug name (e.g., "my-project")

## Dependencies

Features can depend on other features:
- `admin-dashboard` depends on `email-registration`
- `checkout-flow` depends on `shopping-cart` and `email-registration`
- `conversion-funnels` depends on `user-tracking`

When a feature is selected, its dependencies are automatically included.

## Using the Feature Assembler

```javascript
import { 
  assembleFeatures, 
  getFeatureSummary,
  validateFeatureSelection 
} from '@/src/dd/feature-assembler.mjs'

// Validate selection
const validation = await validateFeatureSelection([
  'email-registration',
  'shopping-cart',
  'checkout-flow'
])

// Get summary
const summary = await getFeatureSummary(['email-registration', 'shopping-cart'])
console.log(summary)
// { totalFeatures: 2, complexityScore: 3, estimatedHours: 6, ... }

// Assemble features into project
const result = await assembleFeatures(
  './my-project',
  ['email-registration', 'shopping-cart'],
  { projectName: 'My Store' }
)
```

## Adding New Features

1. Add feature definition to `website/lib/features.ts`
2. Add mapping to `feature-mapping.json`
3. Create template files in appropriate category folder
4. Use placeholders for customization
5. Test with `framework export` command

---

*Part of dawson-does-framework - Export-first development*

