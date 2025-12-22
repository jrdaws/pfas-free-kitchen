# Integration Patterns

> **Guide for creating and managing integrations in @jrdaws/framework templates**

## Overview

Integrations allow templates to include optional functionality (authentication, payments, email, AI, etc.) that can be selectively applied during project export. This document describes how to create, structure, and test integrations.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Directory Structure](#directory-structure)
3. [Integration Metadata](#integration-metadata)
4. [Creating a New Integration](#creating-a-new-integration)
5. [Integration Types](#integration-types)
6. [File Organization](#file-organization)
7. [Environment Variables](#environment-variables)
8. [Dependencies](#dependencies)
9. [Conflict Resolution](#conflict-resolution)
10. [Testing Integrations](#testing-integrations)
11. [Best Practices](#best-practices)

---

## Core Concepts

### What is an Integration?

An integration is a self-contained package of code that adds specific functionality to a template. Each integration:

- Lives in its own directory under `templates/{template}/integrations/{type}/{provider}/`
- Has a metadata file (`integration.json`) describing what it provides
- Contains all files needed for the integration (components, API routes, utilities, etc.)
- Can declare dependencies, environment variables, and conflicts with other integrations
- Is **optional** - templates work without any integrations applied

### Key Principles

1. **Export-First**: Integrations are designed for local ownership after export
2. **Self-Contained**: All code, dependencies, and configuration are bundled
3. **Declarative**: Metadata describes behavior; framework handles application
4. **Optional**: Missing env vars warn but don't break the app
5. **Composable**: Multiple integrations can work together

---

## Directory Structure

### Standard Layout

```
templates/{template}/integrations/{type}/{provider}/
├── integration.json      # REQUIRED: Metadata and configuration
├── package.json          # OPTIONAL: Additional npm dependencies
├── .env.example          # OPTIONAL: Environment variable template
├── app/                  # OPTIONAL: Next.js App Router pages
│   ├── api/              # API routes
│   └── (routes)/         # Page routes
├── components/           # OPTIONAL: React components
├── lib/                  # OPTIONAL: Utility functions
├── middleware.ts         # OPTIONAL: Next.js middleware
└── types/                # OPTIONAL: TypeScript type definitions
```

### Real Example: Supabase Auth

```
templates/saas/integrations/auth/supabase/
├── integration.json
├── package.json
├── .env.example
├── middleware.ts
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   └── login/
│       └── page.tsx
├── components/
│   └── auth/
│       └── auth-button.tsx
└── lib/
    └── supabase.ts
```

---

## Integration Metadata

### integration.json Schema

The `integration.json` file is the single source of truth for an integration.

```json
{
  "provider": "supabase",
  "type": "auth",
  "version": "1.0.0",
  "description": "Supabase authentication with email/password and OAuth",
  "dependencies": {
    "@supabase/supabase-js": "^2.47.10",
    "@supabase/ssr": "^0.1.0"
  },
  "devDependencies": {},
  "envVars": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ],
  "files": {
    "lib": ["lib/supabase.ts"],
    "app": ["app/login/**", "app/api/auth/callback/**"],
    "components": ["components/auth/**"],
    "middleware": ["middleware.ts"]
  },
  "conflicts": [],
  "requires": [],
  "postInstallInstructions": "Create a Supabase project at https://supabase.com and add your credentials to .env.local"
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `provider` | string | Unique provider name (lowercase, no spaces) |
| `type` | enum | Integration type (see [Integration Types](#integration-types)) |
| `version` | string | Semantic version (e.g., "1.0.0") |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Human-readable description |
| `dependencies` | object | npm packages to add to package.json |
| `devDependencies` | object | npm dev packages to add |
| `envVars` | array | Environment variables required |
| `files` | object | File patterns to copy (see below) |
| `conflicts` | array | Provider names that conflict with this one |
| `requires` | array | Integration types this one depends on |
| `postInstallInstructions` | string | Setup instructions shown after export |

### Files Object

The `files` object maps categories to file patterns:

```json
{
  "files": {
    "lib": ["lib/stripe.ts"],
    "app": ["app/api/stripe/**"],
    "components": ["components/pricing/**"],
    "middleware": ["middleware.ts"],
    "types": ["types/stripe.d.ts"],
    "config": ["stripe.config.js"]
  }
}
```

- **Glob patterns supported**: Use `**` for recursive directories
- **Paths are relative to integration directory**: `lib/stripe.ts` means `integrations/payments/stripe/lib/stripe.ts`
- **Files are copied to project root**: `lib/stripe.ts` → `{project}/lib/stripe.ts`

---

## Creating a New Integration

### Step 1: Create Directory Structure

```bash
# Choose your type and provider
TYPE="payments"
PROVIDER="lemonsqueezy"
TEMPLATE="saas"

# Create directory
mkdir -p templates/$TEMPLATE/integrations/$TYPE/$PROVIDER
cd templates/$TEMPLATE/integrations/$TYPE/$PROVIDER
```

### Step 2: Create integration.json

```bash
cat > integration.json << 'EOF'
{
  "provider": "lemonsqueezy",
  "type": "payments",
  "version": "1.0.0",
  "description": "Lemon Squeezy payments with subscription management",
  "dependencies": {
    "@lemonsqueezy/lemonsqueezy.js": "^2.0.0"
  },
  "envVars": [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET"
  ],
  "files": {
    "lib": ["lib/lemonsqueezy.ts"],
    "app": ["app/api/lemonsqueezy/**"],
    "components": ["components/pricing/**"]
  },
  "postInstallInstructions": "Create a Lemon Squeezy account at https://lemonsqueezy.com and get your API key from Settings > API"
}
EOF
```

### Step 3: Add Integration Files

Create the actual integration code with the **same directory structure** it should have in the final project:

```bash
# Create lib utility
mkdir -p lib
cat > lib/lemonsqueezy.ts << 'EOF'
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export const configureLemonSqueezy = () => {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => console.error(error),
  });
};
EOF

# Create API routes
mkdir -p app/api/lemonsqueezy/webhook
cat > app/api/lemonsqueezy/webhook/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Handle webhook
  return NextResponse.json({ received: true });
}
EOF

# Create components
mkdir -p components/pricing
cat > components/pricing/pricing-card.tsx << 'EOF'
export function PricingCard({ plan }: { plan: any }) {
  return <div>{plan.name}</div>;
}
EOF
```

### Step 4: Add Environment Variables

```bash
cat > .env.example << 'EOF'
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
EOF
```

### Step 5: Specify Dependencies

```bash
cat > package.json << 'EOF'
{
  "dependencies": {
    "@lemonsqueezy/lemonsqueezy.js": "^2.0.0"
  }
}
EOF
```

### Step 6: Update Template Configuration

Add the new integration to your template's `template.json`:

```json
{
  "supportedIntegrations": {
    "auth": ["supabase", "clerk"],
    "payments": ["stripe", "lemonsqueezy"]
  }
}
```

---

## Integration Types

The framework supports these integration types:

| Type | Purpose | Common Providers |
|------|---------|------------------|
| `auth` | User authentication | supabase, clerk, nextauth, auth0 |
| `payments` | Payment processing | stripe, paddle, lemonsqueezy |
| `db` | Database | supabase, planetscale, mongodb, neon |
| `email` | Email sending | resend, sendgrid, mailchimp |
| `ai` | AI/LLM APIs | openai, anthropic, cohere |
| `analytics` | Usage tracking | posthog, plausible, mixpanel |
| `storage` | File storage | supabase, s3, cloudinary, r2, uploadthing |

### Defining New Types

If you need a new integration type:

1. Add it to `src/dd/integration-schema.mjs` in the enum
2. Update `IntegrationTypes` constant
3. Add to `KnownProviders` if applicable
4. Document it here

---

## File Organization

### File Categories

The `files` object organizes files by category:

```json
{
  "files": {
    "lib": ["lib/**"],           // Utility functions, SDK setup
    "app": ["app/**"],           // Next.js app router pages
    "components": ["components/**"], // React components
    "middleware": ["middleware.ts"], // Next.js middleware
    "types": ["types/**"],       // TypeScript definitions
    "config": ["*.config.js"]    // Configuration files
  }
}
```

### Glob Pattern Support

- `lib/stripe.ts` - Single file
- `lib/**` - All files in lib/ recursively
- `app/api/stripe/**` - All files under app/api/stripe/
- `components/auth/**` - All files under components/auth/

### File Merging Rules

When integrations are applied:

1. **Regular files**: Copied to project root with same path
2. **package.json**: Dependencies merged into project's package.json
3. **.env.example**: Variables appended to project's .env.example
4. **middleware.ts**: Special handling (merged if exists, copied otherwise)

---

## Environment Variables

### Declaring Variables

List all required environment variables in the `envVars` array:

```json
{
  "envVars": [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET"
  ]
}
```

### Naming Conventions

- **Public vars**: Prefix with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
- **Secret vars**: No prefix (e.g., `STRIPE_SECRET_KEY`)
- **Webhook secrets**: Suffix with `_WEBHOOK_SECRET`

### .env.example Template

Provide a complete `.env.example` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Get your keys from: https://dashboard.stripe.com/apikeys
```

### Graceful Degradation

Code should handle missing environment variables gracefully:

```typescript
// ✅ Good: Warn but don't crash
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not set. Payments will not work.");
}

// ❌ Bad: Throw error on import
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}
```

---

## Dependencies

### Declaring Dependencies

Add npm packages to `dependencies` or `devDependencies`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.47.10",
    "@supabase/ssr": "^0.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Dependency Guidelines

1. **Pin major versions**: Use `^` for flexibility (e.g., `^2.47.10`)
2. **Minimize dependencies**: Only add what's truly needed
3. **Peer dependencies**: Document in postInstallInstructions if required
4. **Version conflicts**: Test with template's existing dependencies

### How Dependencies Are Merged

During export, the framework:

1. Reads integration's `package.json`
2. Merges `dependencies` into project's `package.json`
3. Merges `devDependencies` into project's `package.json`
4. Runs `npm install` after export completes

---

## Conflict Resolution

### Declaring Conflicts

Some integrations can't coexist. Use the `conflicts` array:

```json
{
  "provider": "supabase",
  "type": "auth",
  "conflicts": ["clerk", "auth0"]
}
```

If a user tries to use conflicting integrations, they'll get an error:

```bash
framework export saas ./app --auth supabase --auth clerk
# Error: Integration conflict: supabase conflicts with clerk for auth
```

### Declaring Requirements

If your integration needs another integration type, use `requires`:

```json
{
  "provider": "stripe",
  "type": "payments",
  "requires": ["db"]
}
```

This produces a **warning** (not an error) if the requirement isn't met:

```bash
framework export saas ./app --payments stripe
# Warning: payments/stripe recommends also adding a db integration
```

---

## Testing Integrations

### Manual Testing Workflow

1. **Export with integration**:
   ```bash
   framework export saas ./test-app --auth supabase
   ```

2. **Verify files were copied**:
   ```bash
   ls ./test-app/lib/supabase.ts
   ls ./test-app/middleware.ts
   cat ./test-app/package.json | grep supabase
   ```

3. **Check environment variables**:
   ```bash
   cat ./test-app/.env.example | grep SUPABASE
   ```

4. **Install and run**:
   ```bash
   cd ./test-app
   npm install
   npm run dev
   ```

5. **Test functionality**:
   - Visit integration pages (e.g., `/login`)
   - Verify API routes work
   - Check for console errors

### Automated Testing

Add integration tests to `tests/integration/`:

```javascript
import test from 'node:test';
import assert from 'node:assert';
import { exportTemplate } from '../../src/dd/export.mjs';

test('supabase auth integration applies correctly', async () => {
  const result = await exportTemplate({
    template: 'saas',
    destination: './tmp/test-supabase',
    integrations: { auth: 'supabase' }
  });

  assert.ok(result.success);
  assert.ok(fs.existsSync('./tmp/test-supabase/lib/supabase.ts'));
});
```

### Integration Validation

Run the framework's built-in validation:

```bash
# Validate specific integration
framework validate-integration templates/saas/integrations/auth/supabase

# Validate all integrations in a template
framework validate-integrations templates/saas
```

---

## Best Practices

### 1. Keep Integrations Self-Contained

Each integration should be fully functional on its own:

✅ **Good**:
```
integrations/auth/supabase/
├── integration.json
├── lib/supabase.ts           # SDK setup
├── components/auth-button.tsx # UI component
└── app/login/page.tsx         # Login page
```

❌ **Bad**:
```
integrations/auth/supabase/
├── integration.json
└── lib/supabase.ts
# Missing: UI components, login page
```

### 2. Follow Template Conventions

Match the template's coding style:

- **TypeScript**: Use template's tsconfig.json settings
- **Styling**: Use template's styling approach (Tailwind, CSS modules, etc.)
- **File naming**: Match template's conventions (camelCase vs kebab-case)

### 3. Provide Clear Setup Instructions

The `postInstallInstructions` should be actionable:

✅ **Good**:
```json
{
  "postInstallInstructions": "1. Create a Stripe account at https://stripe.com\n2. Get your API keys from https://dashboard.stripe.com/apikeys\n3. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local\n4. Set up webhook endpoint at https://dashboard.stripe.com/webhooks"
}
```

❌ **Bad**:
```json
{
  "postInstallInstructions": "Configure Stripe"
}
```

### 4. Handle Missing Configuration Gracefully

Don't crash the app if env vars are missing:

```typescript
// ✅ Good
export function createStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Stripe not configured. Set STRIPE_SECRET_KEY in .env.local");
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// ❌ Bad
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

### 5. Document Integration Usage

Include code comments for complex integrations:

```typescript
/**
 * Supabase Client
 *
 * Creates a Supabase client for server-side operations.
 * For client-side usage, use the client created in components.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export function createServerClient() {
  // ...
}
```

### 6. Version Compatibility

Test with the template's dependency versions:

```json
{
  "dependencies": {
    "stripe": "^14.21.0"  // Match template's Node.js version requirements
  }
}
```

### 7. Minimize Boilerplate

Provide working defaults where possible:

```typescript
// ✅ Good: Sensible defaults
export const stripeConfig = {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2,
  timeout: 30000,
};

// ❌ Bad: Requires user configuration
export const stripeConfig = {
  apiVersion: process.env.STRIPE_API_VERSION!,
  maxNetworkRetries: parseInt(process.env.STRIPE_RETRIES!),
};
```

### 8. Security Best Practices

- **Never commit secrets**: Use .env.example with placeholders
- **Validate inputs**: Always validate webhook signatures
- **Use HTTPS**: Document HTTPS requirements for webhooks
- **Principle of least privilege**: Request minimal permissions

---

## Checklist for New Integration

Before submitting an integration, verify:

- [ ] `integration.json` has all required fields (provider, type, version)
- [ ] All files referenced in `files` object exist
- [ ] Dependencies are pinned with `^` versioning
- [ ] Environment variables are documented in `envVars` array
- [ ] `.env.example` provides complete template with comments
- [ ] `postInstallInstructions` are clear and actionable
- [ ] Code handles missing env vars gracefully (warns, doesn't crash)
- [ ] Integration added to template's `supportedIntegrations`
- [ ] Conflicts and requirements declared if applicable
- [ ] Tested with `framework export` command
- [ ] Code follows template's TypeScript and style conventions
- [ ] Components match template's design system
- [ ] API routes follow template's patterns
- [ ] No secrets or credentials committed

---

## Examples

### Complete Integration: Anthropic AI

```
templates/saas/integrations/ai/anthropic/
├── integration.json
├── package.json
├── .env.example
├── lib/
│   └── anthropic.ts
├── app/
│   └── api/
│       └── ai/
│           └── claude/
│               └── route.ts
└── components/
    └── ai/
        └── chat.tsx
```

**integration.json**:
```json
{
  "provider": "anthropic",
  "type": "ai",
  "version": "1.0.0",
  "description": "Anthropic Claude API integration with streaming support",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.1"
  },
  "envVars": [
    "ANTHROPIC_API_KEY"
  ],
  "files": {
    "lib": ["lib/anthropic.ts"],
    "app": ["app/api/ai/claude/**"],
    "components": ["components/ai/**"]
  },
  "postInstallInstructions": "Get your API key from https://console.anthropic.com/settings/keys"
}
```

### Minimal Integration: Plausible Analytics

```
templates/saas/integrations/analytics/plausible/
├── integration.json
├── package.json
├── .env.example
├── lib/
│   └── plausible.ts
└── components/
    └── analytics/
        └── plausible-script.tsx
```

**integration.json**:
```json
{
  "provider": "plausible",
  "type": "analytics",
  "version": "1.0.0",
  "description": "Privacy-friendly analytics with Plausible",
  "dependencies": {
    "plausible-tracker": "^0.3.9"
  },
  "envVars": [
    "NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
  ],
  "files": {
    "lib": ["lib/plausible.ts"],
    "components": ["components/analytics/**"]
  },
  "postInstallInstructions": "Create account at https://plausible.io and add your domain"
}
```

---

## Additional Resources

- **Schema Reference**: See `src/dd/integration-schema.mjs` for full JSON schema
- **Validation Logic**: See `src/dd/integrations.mjs` for validation implementation
- **CLI Integration**: See `bin/framework.js` for how integrations are applied
- **Coding Standards**: See `docs/standards/CODING_STANDARDS.md`

---

## Questions?

If anything is unclear or you need help creating an integration:

1. Review existing integrations in `templates/*/integrations/`
2. Check the integration schema in `src/dd/integration-schema.mjs`
3. Run `framework doctor` to validate your setup
4. Ask for help in project discussions

---

*This document is part of the dawson-does-framework documentation.*
*Last updated: 2025-12-21*
