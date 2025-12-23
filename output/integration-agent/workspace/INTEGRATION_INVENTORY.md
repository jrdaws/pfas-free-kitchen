# Integration Inventory

> **Created:** 2025-12-22 | **Agent:** Integration Agent | **Version:** 1.0.0

This document provides a comprehensive inventory of all integrations across templates and platform providers in the Dawson-Does Framework.

---

## Summary

| Category | Provider Count | Template Implementations | Platform Implementations |
|----------|----------------|--------------------------|--------------------------|
| Auth | 2 | Supabase, Clerk | Supabase |
| Payments | 3 | Stripe | Stripe, Paddle, Lemon Squeezy |
| Email | 1 | Resend | — |
| Analytics | 2 | PostHog, Plausible | Console (stub) |
| AI/LLM | 2 | OpenAI, Anthropic | Anthropic |
| Database | 1 | Supabase | — |
| Deploy | 3 | — | Vercel, Netlify, Railway |
| Webhooks | 1 | — | Standard |

**Total Unique Providers:** 15

---

## Auth Providers

### Supabase Auth
- **Type:** `auth`
- **Version:** 1.0.0
- **Templates:** saas (implemented), flagship-saas (supported), dashboard (supported), seo-directory (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |

#### Dependencies
```json
{
  "@supabase/supabase-js": "^2.47.10",
  "@supabase/ssr": "^0.1.0"
}
```

#### Files
- `lib/supabase.ts` - Client initialization
- `app/login/page.tsx` - Login page
- `app/api/auth/callback/route.ts` - Auth callback handler
- `components/auth/auth-button.tsx` - Auth UI component
- `middleware.ts` - Session middleware

#### Platform Provider
- Location: `src/platform/providers/impl/auth.supabase.ts`
- Features: Session management, OAuth support, magic link login
- Error class: `SupabaseAuthError`

---

### Clerk Auth
- **Type:** `auth`
- **Version:** 1.0.0
- **Templates:** saas (optional), flagship-saas (supported), dashboard (supported), seo-directory (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |

#### Dependencies
```json
{
  "@clerk/nextjs": "^5.0.0"
}
```

#### Files
- `lib/clerk.ts` - Clerk utilities
- `app/sign-in/[[...sign-in]]/page.tsx` - Sign in page
- `app/sign-up/[[...sign-up]]/page.tsx` - Sign up page
- `app/dashboard/page.tsx` - Protected dashboard
- `app/api/protected/route.ts` - Protected API example
- `components/auth/clerk-provider-wrapper.tsx` - Provider wrapper
- `components/auth/protected-content.tsx` - Protected content
- `components/auth/user-button.tsx` - User button component
- `middleware.ts` - Auth middleware

#### Platform Provider
- Location: Not implemented
- **Gap:** Missing platform provider implementation

---

## Payment Providers

### Stripe
- **Type:** `payments`
- **Version:** 1.0.0
- **Templates:** saas (implemented), flagship-saas (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe secret API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret |

#### Dependencies
```json
{
  "stripe": "^14.21.0"
}
```

#### Files
- `lib/stripe.ts` - Stripe client
- `app/api/stripe/checkout/route.ts` - Checkout session
- `app/api/stripe/webhooks/route.ts` - Webhook handler
- `app/api/stripe/portal/route.ts` - Customer portal
- `components/pricing/pricing-cards.tsx` - Pricing UI

#### Platform Provider
- Location: `src/platform/providers/impl/billing.stripe.ts`
- Features: Checkout, subscriptions, usage-based billing, webhooks
- API Version: `2024-12-18.acacia`
- Error class: `StripeBillingError`

---

### Paddle
- **Type:** `payments` (billing)
- **Version:** 1.0.0
- **Templates:** saas (supported, not implemented)
- **Status:** 🟡 Beta (platform provider only)

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PADDLE_API_KEY` | Yes | Paddle API key |
| `PADDLE_WEBHOOK_SECRET` | No | Webhook signing secret |

#### Platform Provider
- Location: `src/platform/providers/impl/billing.paddle.ts`
- Features: Customer management, checkout, subscriptions
- Limitations: 
  - ⚠️ `getActiveSubscription` not fully implemented
  - ⚠️ `recordUsage` not implemented
- Error class: `PaddleBillingError`

#### Template Implementation
- **Gap:** No template integration files exist

---

### Lemon Squeezy
- **Type:** `payments` (billing)
- **Version:** 1.0.0
- **Templates:** None (platform only)
- **Status:** 🟡 Beta (platform provider only)

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `LEMON_SQUEEZY_API_KEY` | Yes | API key |
| `LEMON_SQUEEZY_STORE_ID` | Yes | Store ID |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | No | Webhook secret |

#### Platform Provider
- Location: `src/platform/providers/impl/billing.lemon-squeezy.ts`
- Features: Customer management, checkout
- Limitations:
  - ⚠️ `getActiveSubscription` returns null (not implemented)
  - ⚠️ `recordUsage` not supported
  - ⚠️ Webhook verification is stub only
- Error class: `LemonSqueezyBillingError`

#### Template Implementation
- **Gap:** No template integration files exist

---

## Email Providers

### Resend
- **Type:** `email`
- **Version:** 1.0.0
- **Templates:** saas (implemented), blog (supported), landing-page (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key |

#### Dependencies
```json
{
  "resend": "^3.2.0",
  "react-email": "^2.1.0",
  "@react-email/components": "^0.0.15"
}
```

#### Files
- `lib/resend.ts` - Resend client
- `app/api/email/send/route.ts` - Send email endpoint
- `emails/welcome-email.tsx` - React Email template

#### Platform Provider
- **Gap:** No platform provider exists

---

### SendGrid
- **Type:** `email`
- **Templates:** saas (supported), blog (supported), landing-page (supported)
- **Status:** ❌ Not Implemented

#### Template Implementation
- **Gap:** Listed in `supportedIntegrations` but no implementation exists

---

## Analytics Providers

### PostHog
- **Type:** `analytics`
- **Version:** 1.0.0
- **Templates:** saas (implemented), dashboard (supported), blog (supported), landing-page (supported), seo-directory (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog host URL |

#### Dependencies
```json
{
  "posthog-js": "^1.100.0"
}
```

#### Files
- `lib/posthog.ts` - PostHog client
- `components/analytics/posthog-provider.tsx` - Provider component
- `components/analytics/use-posthog.tsx` - React hook

#### Platform Provider
- Location: `src/platform/providers/impl/analytics.console.ts` (stub only)
- **Gap:** Full PostHog platform provider not implemented

---

### Plausible
- **Type:** `analytics`
- **Version:** 1.0.0
- **Templates:** saas (implemented), dashboard (supported), blog (supported), landing-page (supported), seo-directory (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Yes | Site domain |

#### Dependencies
```json
{
  "next-plausible": "^3.12.0"
}
```

#### Files
- `components/analytics/plausible-provider.tsx` - Provider component
- `components/analytics/use-plausible.tsx` - React hook

#### Platform Provider
- **Gap:** No platform provider exists

---

## AI/LLM Providers

### OpenAI
- **Type:** `ai`
- **Version:** 1.0.0
- **Templates:** saas (implemented), flagship-saas (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |

#### Dependencies
```json
{
  "openai": "^4.28.0",
  "ai": "^3.0.0"
}
```

#### Files
- `lib/openai.ts` - OpenAI client
- `app/api/ai/chat/route.ts` - Chat endpoint
- `app/api/ai/completion/route.ts` - Completion endpoint
- `components/ai/chat-interface.tsx` - Chat UI

#### Platform Provider
- **Gap:** No platform provider (only Anthropic implemented)

---

### Anthropic (Claude)
- **Type:** `ai`
- **Version:** 1.0.0
- **Templates:** saas (implemented), flagship-saas (supported)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |

#### Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.32.1"
}
```

#### Files
- `lib/anthropic.ts` - Anthropic client
- `app/api/ai/claude/route.ts` - Claude endpoint
- `components/ai/claude-chat.tsx` - Chat UI

#### Platform Provider
- Location: `src/platform/providers/impl/llm.anthropic.ts`
- Features: Chat completions with streaming
- Default model: `claude-3-5-sonnet-20241022`
- Error class: `AnthropicLLMError`

---

## Database Providers

### Supabase (Database)
- **Type:** `db`
- **Version:** 1.0.0
- **Templates:** saas (implemented)
- **Status:** ✅ Production Ready

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Service role key (admin) |

#### Dependencies
```json
{
  "@supabase/supabase-js": "^2.47.10"
}
```

#### Files
- `lib/database.ts` - Database utilities

#### Platform Provider
- **Gap:** No dedicated database platform provider

---

### PlanetScale
- **Type:** `db`
- **Templates:** saas (supported), dashboard (supported)
- **Status:** ❌ Not Implemented

#### Template Implementation
- **Gap:** Listed in `supportedIntegrations` but no implementation exists

---

## Deployment Providers

### Vercel
- **Type:** `deploy`
- **Templates:** All (via platform)
- **Status:** 🟡 Beta (credentials + detection only)

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `VERCEL_TOKEN` | Yes | Vercel API token |

#### Platform Provider
- Location: `src/platform/providers/impl/deploy.vercel.ts`
- Features: Project detection, credential validation, health check
- Limitations:
  - ⚠️ `deploy()` not fully implemented - suggests using CLI
  - ⚠️ `streamLogs()` not implemented

---

### Netlify
- **Type:** `deploy`
- **Templates:** All (via platform)
- **Status:** 🟡 Beta (credentials + detection only)

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `NETLIFY_TOKEN` | Yes | Netlify API token |

#### Platform Provider
- Location: `src/platform/providers/impl/deploy.netlify.ts`
- Features: Project detection, credential validation, status polling
- Limitations:
  - ⚠️ `deploy()` not fully implemented - suggests using CLI

---

### Railway
- **Type:** `deploy`
- **Templates:** All (via platform)
- **Status:** 🟡 Beta (credentials + detection only)

#### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `RAILWAY_TOKEN` | Yes | Railway API token |

#### Platform Provider
- Location: `src/platform/providers/impl/deploy.railway.ts`
- Features: GraphQL API integration, project detection
- Limitations:
  - ⚠️ `deploy()` not fully implemented - suggests using CLI

---

## CMS Providers (Declared but Not Implemented)

### Contentful
- **Type:** `cms`
- **Templates:** blog (supported), seo-directory (supported)
- **Status:** ❌ Not Implemented

### Sanity
- **Type:** `cms`
- **Templates:** blog (supported), seo-directory (supported)
- **Status:** ❌ Not Implemented

---

## Integration Matrix by Template

| Template | Auth | Payments | Email | Analytics | AI | Database | Deploy |
|----------|------|----------|-------|-----------|-----|----------|--------|
| **saas** | Supabase✓, Clerk✓ | Stripe✓ | Resend✓ | PostHog✓, Plausible✓ | OpenAI✓, Anthropic✓ | Supabase✓ | Platform |
| **flagship-saas** | Supabase◐, Clerk◐ | Stripe◐ | — | — | Anthropic◐, OpenAI◐ | Supabase◐ | Platform |
| **dashboard** | Supabase◐, Clerk◐ | — | — | PostHog◐, Plausible◐ | — | Supabase◐ | Platform |
| **blog** | — | — | Resend◐ | PostHog◐, Plausible◐ | — | — | Platform |
| **landing-page** | — | Stripe◐, Paddle◐ | Resend◐ | PostHog◐, Plausible◐ | — | — | Platform |
| **seo-directory** | Supabase◐, Clerk◐ | — | — | PostHog◐, Plausible◐ | — | Supabase◐ | Platform |

**Legend:** ✓ = Implemented | ◐ = Supported (not implemented) | — = Not applicable

---

## Gaps & Inconsistencies

### Critical Gaps

1. **Missing Template Implementations**
   - Paddle: Listed as supported in `saas` but no integration files
   - Lemon Squeezy: Platform provider exists but no template integration
   - SendGrid: Supported in multiple templates but not implemented

2. **Missing Platform Providers**
   - Clerk auth
   - Resend email
   - PostHog/Plausible analytics
   - OpenAI LLM
   - Database providers

3. **Incomplete Deploy Providers**
   - All three (Vercel, Netlify, Railway) have `deploy()` as not-implemented
   - Should either complete implementation or document CLI workflow

### Inconsistencies

1. **Environment Variable Naming**
   - Template: `NEXT_PUBLIC_SUPABASE_URL` 
   - Platform: `SUPABASE_URL`
   - **Recommendation:** Standardize on `NEXT_PUBLIC_*` for client-side vars

2. **Integration Directory Structure**
   - Only `templates/saas/integrations/` has implementations
   - Other templates reference support but have no integration folders

3. **CMS Integrations**
   - Contentful and Sanity listed but completely unimplemented
   - Consider removing from `supportedIntegrations` or implementing

### Documentation Gaps

1. No migration guides between providers (e.g., Stripe → Paddle)
2. No integration testing guide
3. Missing TypeScript types for some platform providers

---

## Recommendations

### Short-term (P1)
1. Standardize environment variable naming across template/platform
2. Remove unimplemented integrations from `supportedIntegrations` OR implement them
3. Document the CLI workflow for deploy providers

### Medium-term (P2)
1. Add platform providers for: Clerk, Resend, OpenAI
2. Create integration templates for Paddle, Lemon Squeezy in `saas`
3. Add integration health checks to exported apps

### Long-term (P3)
1. Implement full deploy provider API integration
2. Add CMS integrations (Contentful, Sanity)
3. Create integration testing framework

---

## Appendix: Provider File Locations

```
templates/saas/integrations/
├── ai/
│   ├── anthropic/       # ✅ Implemented
│   └── openai/          # ✅ Implemented
├── analytics/
│   ├── plausible/       # ✅ Implemented
│   └── posthog/         # ✅ Implemented
├── auth/
│   ├── clerk/           # ✅ Implemented
│   └── supabase/        # ✅ Implemented
├── db/
│   └── supabase/        # ✅ Implemented
├── email/
│   └── resend/          # ✅ Implemented
└── payments/
    └── stripe/          # ✅ Implemented

src/platform/providers/impl/
├── analytics.console.ts     # 🟡 Stub only
├── auth.supabase.ts         # ✅ Implemented
├── billing.lemon-squeezy.ts # 🟡 Partial
├── billing.paddle.ts        # 🟡 Partial
├── billing.stripe.ts        # ✅ Implemented
├── deploy.netlify.ts        # 🟡 Detection only
├── deploy.railway.ts        # 🟡 Detection only
├── deploy.vercel.ts         # 🟡 Detection only
├── llm.anthropic.ts         # ✅ Implemented
└── webhooks.standard.ts     # ✅ Implemented
```

---

*Generated by Integration Agent | Dawson-Does Framework v0.3.x*

