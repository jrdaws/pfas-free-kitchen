# Dawson-Does Framework Templates

This directory contains the starter templates available through the `framework export` command.

## Available Templates

### SaaS (`saas/`)

A full-stack SaaS template with everything needed to launch a subscription-based web application.

**Included Pages:**
- `/` - Landing page with Hero, Features, Pricing, Testimonials, FAQ, and CTA sections
- `/dashboard` - Dashboard with stats, charts, activity feed, and data tables
- `/dashboard/settings` - Settings page with profile, billing, team, and notification tabs
- `/pricing` - Standalone pricing page with plan comparison

**Included Components:**
- `Nav` - Navigation bar with auth integration points
- `Hero` - Hero section with customizable content
- `FeatureCards` - Feature showcase grid
- `PricingTable` - Pricing tier comparison
- `Testimonials` - Customer testimonials
- `FAQ` - Frequently asked questions
- `CTA` - Call-to-action section
- `Footer` - Site footer
- `DashboardPreview` - Dashboard preview component

**Supported Integrations:**
| Category | Providers |
|----------|-----------|
| Auth | Supabase, Clerk |
| Payments | Stripe, Paddle |
| Email | Resend, SendGrid |
| Database | Supabase, PlanetScale |
| AI | OpenAI, Anthropic |
| Analytics | PostHog, Plausible |
| Storage | UploadThing |

**Default Integrations:** `auth:supabase`, `payments:stripe`, `db:supabase`

---

### Dashboard (`dashboard/`)

A standalone dashboard template for admin panels and internal tools.

**Included Pages:**
- `/` - Main dashboard with stats, charts, and tables
- `/settings` - Settings page

**Best for:** Admin panels, internal dashboards, data visualization tools

---

### Blog (`blog/`)

A simple blog template with dynamic routing.

**Included Pages:**
- `/` - Blog homepage
- `/blog/[slug]` - Individual blog post page

**Best for:** Personal blogs, content marketing sites, documentation

---

### Landing Page (`landing-page/`)

A minimal landing page template for marketing sites.

**Included Pages:**
- `/` - Single landing page

**Best for:** Product launches, marketing campaigns, waitlists

---

### SEO Directory (`seo-directory/`)

A directory-style template optimized for SEO.

**Included Pages:**
- `/` - Directory homepage with search and filtering

**Best for:** Business directories, resource lists, curated collections

---

### Flagship SaaS (`flagship-saas/`)

An advanced SaaS template with built-in monitoring and governance features.

**Included Pages:**
- `/` - Dashboard with provider health, usage tracking, entitlements, and audit logs

**Included Features:**
- Provider health monitoring
- Usage tracking
- Entitlement management
- Audit logging

**Best for:** Enterprise applications, multi-tenant SaaS

---

## Integration Structure

Each template can include integrations from the `integrations/` subdirectory. The structure is:

```
templates/saas/integrations/
├── auth/
│   ├── clerk/
│   │   ├── integration.json    # Metadata and dependencies
│   │   ├── app/                # Route handlers and pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utility functions
│   │   └── middleware.ts       # Middleware if needed
│   └── supabase/
│       └── ...
├── payments/
│   └── stripe/
├── email/
│   └── resend/
├── ai/
│   ├── openai/
│   └── anthropic/
├── analytics/
│   ├── posthog/
│   └── plausible/
├── db/
│   └── supabase/
└── storage/
    └── uploadthing/
```

### Integration Metadata (`integration.json`)

Each integration includes metadata:

```json
{
  "provider": "supabase",
  "type": "auth",
  "version": "1.0.0",
  "description": "Supabase authentication",
  "dependencies": {
    "@supabase/supabase-js": "^2.47.10"
  },
  "envVars": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "files": {
    "lib": ["lib/supabase.ts"],
    "app": ["app/login/**"],
    "components": ["components/auth/**"]
  },
  "postInstallInstructions": "Create a Supabase project at https://supabase.com"
}
```

---

## How Export Works

When running `framework export saas ./my-app --auth supabase --payments stripe`:

1. **Base template** files are copied from `templates/saas/`
2. **Integration files** are merged from `templates/saas/integrations/auth/supabase/` and `templates/saas/integrations/payments/stripe/`
3. **Dependencies** are merged into `package.json`
4. **Environment variables** are added to `.env.example`
5. **README** is generated with setup instructions

---

## Adding a New Template

1. Create a new directory in `templates/`
2. Add a `template.json` with metadata
3. Create the base `app/` directory with pages
4. Add components to `components/`
5. (Optional) Add integrations to `integrations/`

See `docs/templates/ADDING_TEMPLATES.md` for detailed instructions.

---

*Last updated: 2025-12-24*

