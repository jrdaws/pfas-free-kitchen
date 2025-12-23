# Guide: Adding New Integrations

> **Created**: 2025-12-23
> **Author**: Integration Agent
> **Governance Version**: 2.2

---

## Overview

This guide explains how to add a new integration to the Dawson-Does Framework. Integrations are optional, production-ready implementations of third-party services that can be included when exporting a template.

---

## Prerequisites

Before adding an integration:

1. **Check the schema** - Review `src/dd/integration-schema.mjs` for supported types
2. **Check existing integrations** - Use similar patterns from existing implementations
3. **Understand the provider** - Read provider documentation thoroughly
4. **Test the API** - Create a test account and verify API access

---

## Step 1: Create Directory Structure

```bash
# Navigate to the template's integrations directory
cd templates/saas/integrations

# Create integration directory (type/provider pattern)
mkdir -p {type}/{provider}

# Example for Paddle payments
mkdir -p payments/paddle
```

Standard structure:
```
{type}/{provider}/
├── integration.json          # REQUIRED - Metadata
├── package.json              # Optional - If different deps from main
├── lib/
│   └── {provider}.ts         # REQUIRED - Core utilities
├── app/
│   └── api/{provider}/       # API routes
├── components/
│   └── {category}/           # UI components
├── middleware.ts             # Optional - Route protection
└── emails/                   # Optional - Email templates
```

---

## Step 2: Create integration.json

This file is **required** and must pass schema validation.

### Minimal Example

```json
{
  "provider": "paddle",
  "type": "payments",
  "version": "1.0.0"
}
```

### Complete Example

```json
{
  "provider": "paddle",
  "type": "payments",
  "version": "1.0.0",
  "description": "Paddle payments with subscription management and VAT handling",
  "dependencies": {
    "@paddle/paddle-node-sdk": "^1.0.0"
  },
  "devDependencies": {},
  "envVars": [
    "PADDLE_API_KEY",
    "PADDLE_WEBHOOK_SECRET",
    "PADDLE_SELLER_ID"
  ],
  "files": {
    "lib": ["lib/paddle.ts"],
    "app": ["app/api/paddle/**"],
    "components": ["components/pricing/**"]
  },
  "postInstallInstructions": "Create a Paddle account at https://paddle.com, get your API key from https://vendors.paddle.com/authentication",
  "conflicts": [],
  "requires": []
}
```

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | ✅ | Provider name (lowercase, e.g., "paddle") |
| `type` | enum | ✅ | Integration type (see supported types below) |
| `version` | semver | ✅ | Version string (e.g., "1.0.0") |
| `description` | string | ❌ | Human-readable description |
| `dependencies` | object | ❌ | npm packages to add to package.json |
| `devDependencies` | object | ❌ | Dev npm packages |
| `envVars` | string[] | ❌ | Required environment variables |
| `files` | object | ❌ | File patterns to copy during export |
| `postInstallInstructions` | string | ❌ | Setup instructions for users |
| `conflicts` | string[] | ❌ | Provider names that conflict |
| `requires` | string[] | ❌ | Required integration types |

### Supported Types

```typescript
type IntegrationType = 
  | "auth"      // Authentication providers
  | "payments"  // Payment processors
  | "email"     // Email services
  | "db"        // Database providers
  | "ai"        // LLM/AI providers
  | "analytics" // Analytics services
  | "storage";  // File storage
```

---

## Step 3: Implement Core Library

Create `lib/{provider}.ts` with the core utilities.

### Pattern: Provider Client

```typescript
// lib/paddle.ts

import Paddle from "@paddle/paddle-node-sdk";

// Validate environment on import
if (!process.env.PADDLE_API_KEY) {
  throw new Error(`
Paddle configuration missing

Required environment variables:
  PADDLE_API_KEY

Get these from: https://vendors.paddle.com/authentication
Add to: .env.local
  `);
}

// Export configured client
export const paddle = new Paddle(process.env.PADDLE_API_KEY);

// Export type-safe helpers
export async function createCheckoutSession(options: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { priceId, customerId, successUrl, cancelUrl } = options;
  
  try {
    const session = await paddle.checkout.create({
      items: [{ priceId, quantity: 1 }],
      customer: customerId ? { id: customerId } : undefined,
      returnUrl: successUrl,
      // ...
    });
    
    return session;
  } catch (error: any) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
}

// Export subscription helpers
export async function getSubscriptionStatus(customerId: string) {
  // Implementation
}

export async function cancelSubscription(subscriptionId: string) {
  // Implementation
}
```

### Best Practices

1. **Validate env vars early** - Fail fast with actionable errors
2. **Export typed helpers** - Not just raw client
3. **Handle errors consistently** - Wrap with descriptive messages
4. **Use server-only patterns** - Mark with `'use server'` if needed

---

## Step 4: Implement API Routes

Create route handlers in `app/api/{provider}/`.

### Pattern: Webhook Handler

```typescript
// app/api/paddle/webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { paddle } from "@/lib/paddle";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  // Verify webhook signature
  const isValid = verifyWebhookSignature(
    body,
    signature,
    process.env.PADDLE_WEBHOOK_SECRET!
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const event = JSON.parse(body);

  try {
    switch (event.event_type) {
      case "subscription.created":
        await handleSubscriptionCreated(event.data);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event.data);
        break;
      case "subscription.canceled":
        await handleSubscriptionCanceled(event.data);
        break;
      default:
        console.log(`Unhandled event: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Paddle Webhook] Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  // Implementation
  return true;
}

async function handleSubscriptionCreated(data: any) {
  // Update user's subscription status in database
  console.log("Subscription created:", data.id);
}

async function handleSubscriptionUpdated(data: any) {
  console.log("Subscription updated:", data.id);
}

async function handleSubscriptionCanceled(data: any) {
  console.log("Subscription canceled:", data.id);
}
```

### Pattern: Checkout Route

```typescript
// app/api/paddle/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/paddle";

export async function POST(req: NextRequest) {
  try {
    const { priceId, customerId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await createCheckoutSession({
      priceId,
      customerId,
      successUrl: `${origin}/dashboard?success=true`,
      cancelUrl: `${origin}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[Paddle Checkout] Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Step 5: Add UI Components (Optional)

Create components in `components/{category}/`.

### Pattern: Pricing Component

```typescript
// components/pricing/paddle-pricing.tsx

"use client";

import { useState } from "react";

interface PricingPlan {
  name: string;
  price: number;
  priceId: string;
  features: string[];
}

const PLANS: PricingPlan[] = [
  {
    name: "Pro",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID!,
    features: ["Feature 1", "Feature 2", "Feature 3"],
  },
  {
    name: "Team",
    price: 99,
    priceId: process.env.NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID!,
    features: ["Everything in Pro", "Feature 4", "Feature 5"],
  },
];

export function PaddlePricing() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(priceId: string) {
    setLoading(priceId);

    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await res.json();

      if (error) {
        alert(error);
        return;
      }

      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {PLANS.map((plan) => (
        <div key={plan.priceId} className="border rounded-lg p-6">
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <p className="text-3xl font-bold mt-2">
            ${plan.price}<span className="text-sm">/mo</span>
          </p>
          <ul className="mt-4 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={loading === plan.priceId}
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading === plan.priceId ? "Loading..." : "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Step 6: Update Template Configuration

Add the new provider to `templates/saas/template.json`:

```json
{
  "supportedIntegrations": {
    "payments": ["stripe", "paddle"]
  }
}
```

---

## Step 7: Add Documentation

Create provider documentation in `docs/integrations/{type}/{provider}.md`:

```markdown
# Paddle Integration

> Paddle payments with subscription management and VAT handling.

## Setup

1. Create a Paddle account at https://paddle.com
2. Get your API credentials from https://vendors.paddle.com/authentication
3. Add to `.env.local`:

\`\`\`bash
PADDLE_API_KEY=xxx
PADDLE_WEBHOOK_SECRET=xxx
PADDLE_SELLER_ID=xxx
\`\`\`

## Usage

### Create Checkout

\`\`\`typescript
import { createCheckoutSession } from './lib/paddle';

const session = await createCheckoutSession({
  priceId: 'pri_xxx',
  successUrl: '/dashboard',
  cancelUrl: '/pricing',
});
\`\`\`

### Check Subscription

\`\`\`typescript
import { getSubscriptionStatus } from './lib/paddle';

const status = await getSubscriptionStatus(customerId);
\`\`\`

## Webhooks

Configure your webhook endpoint: `https://yourdomain.com/api/paddle/webhook`

Handled events:
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
```

---

## Step 8: Validate and Test

### Validate Schema

```bash
# Run integration schema tests
npm test -- tests/dd/integration-schema-validation.test.mjs
```

### Test Export

```bash
# Export with new integration
framework export saas ./test-paddle --payments paddle

# Verify files were copied
ls -la ./test-paddle/lib/
ls -la ./test-paddle/app/api/paddle/
```

### Manual Testing

1. Set up test environment variables
2. Run exported project: `npm run dev`
3. Test checkout flow
4. Test webhook handling (use Paddle CLI or ngrok)

---

## Integration Checklist

Before submitting:

- [ ] `integration.json` passes schema validation
- [ ] All declared files exist
- [ ] Environment variables are documented
- [ ] Webhook signature verification implemented
- [ ] Error handling follows patterns
- [ ] TypeScript types are complete
- [ ] Documentation created
- [ ] Tests pass: `npm test`
- [ ] Export works: `framework export saas ./test --{type} {provider}`

---

## Common Patterns Reference

### Environment Variable Validation

```typescript
const requiredEnvVars = ["VAR1", "VAR2"];
const missing = requiredEnvVars.filter((v) => !process.env[v]);

if (missing.length > 0) {
  throw new Error(`
Missing environment variables: ${missing.join(", ")}

Get these from: [provider URL]
Add to: .env.local
  `);
}
```

### Webhook Signature Verification

```typescript
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Error Response Format

```typescript
// Follow API_CONTRACTS.md
return NextResponse.json(
  { 
    error: "Human readable message",
    code: "CHECKOUT_FAILED",
    details: { /* debug info */ }
  },
  { status: 400 }
);
```

---

## Getting Help

- Review existing integrations in `templates/saas/integrations/`
- Check `src/dd/integrations.mjs` for the application logic
- See `src/dd/integration-schema.mjs` for schema definitions
- Consult `docs/integrations/INTEGRATION_CAPABILITIES.md` for examples

---

*This guide is maintained by the Integration Agent.*

