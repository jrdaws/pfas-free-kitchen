# Integration Expansion Roadmap

> **Created**: 2025-12-23
> **Author**: Integration Agent
> **Governance Version**: 2.2

---

## Overview

This roadmap prioritizes the next integrations to add to the Dawson-Does Framework based on:
- User demand (common SaaS requirements)
- Ecosystem compatibility (Next.js / React ecosystem)
- Implementation complexity
- Strategic value (fills gaps, enables use cases)

---

## Priority Matrix

| Priority | Integration | Type | Effort | Value | Rationale |
|----------|-------------|------|--------|-------|-----------|
| **P1** | Paddle | payments | Medium | High | MoR model, handles taxes globally |
| **P1** | Cloudinary/UploadThing | storage | Low | High | No storage integrations exist |
| **P2** | NextAuth | auth | Medium | High | Adapter flexibility, custom providers |
| **P2** | LemonSqueezy | payments | Low | Medium | Simple pricing, indie-friendly |
| **P2** | SendGrid | email | Low | Medium | Widely used, robust API |
| **P3** | PlanetScale | db | Medium | Medium | Serverless MySQL, popular |
| **P3** | Neon | db | Medium | Medium | Serverless Postgres, growing fast |
| **P3** | Turso | db | Medium | Low | Edge SQLite, niche but interesting |

---

## P1: High Priority (Next 2 Weeks)

### 1. Storage Integration - Cloudinary or UploadThing

**Why**: No storage integrations exist. Every SaaS needs file uploads.

**Comparison**:
| Provider | Pros | Cons |
|----------|------|------|
| **Cloudinary** | Image transformations, CDN, video | Complex pricing, heavier SDK |
| **UploadThing** | Simple, Next.js native, generous free tier | Newer, less features |

**Recommendation**: Start with **UploadThing** for simplicity, add Cloudinary later.

**UploadThing Implementation**:
```
templates/saas/integrations/storage/uploadthing/
├── integration.json
├── lib/uploadthing.ts
├── app/api/uploadthing/route.ts
├── components/storage/file-upload.tsx
└── package.json
```

**Effort**: 1-2 days

### 2. Paddle Payments

**Why**: Declared in template.json but not implemented. Merchant of Record = handles VAT/sales tax.

**Key Features**:
- Subscription management
- Webhooks for checkout events
- Customer portal
- Tax handling built-in

**Implementation**:
```
templates/saas/integrations/payments/paddle/
├── integration.json
├── lib/paddle.ts
├── app/api/paddle/
│   ├── checkout/route.ts
│   ├── webhook/route.ts
│   └── portal/route.ts
├── components/pricing/paddle-pricing.tsx
└── package.json
```

**Effort**: 3-4 days (similar complexity to Stripe)

---

## P2: Medium Priority (Next Month)

### 3. NextAuth.js

**Why**: Most flexible auth solution for Next.js. Supports dozens of providers.

**Key Features**:
- Database adapter support (Prisma, Drizzle, etc.)
- OAuth for any provider
- Credentials (email/password)
- JWT or database sessions

**Implementation**:
```
templates/saas/integrations/auth/nextauth/
├── integration.json
├── lib/auth.ts           # NextAuth config
├── app/api/auth/[...nextauth]/route.ts
├── components/auth/
│   ├── auth-provider.tsx
│   └── sign-in-button.tsx
├── middleware.ts
└── package.json
```

**Effort**: 2-3 days

### 4. LemonSqueezy

**Why**: Simpler than Stripe/Paddle. Popular with indie developers.

**Key Features**:
- One-time and subscription payments
- Built-in VAT handling
- Affiliate system
- Simple API

**Implementation**:
```
templates/saas/integrations/payments/lemonsqueezy/
├── integration.json
├── lib/lemonsqueezy.ts
├── app/api/lemonsqueezy/
│   ├── checkout/route.ts
│   └── webhook/route.ts
├── components/pricing/lemon-pricing.tsx
└── package.json
```

**Effort**: 2 days

### 5. SendGrid

**Why**: Declared but not implemented. Widely used alternative to Resend.

**Key Features**:
- Transactional email
- Marketing campaigns
- Email templates
- Analytics

**Implementation**:
```
templates/saas/integrations/email/sendgrid/
├── integration.json
├── lib/sendgrid.ts
├── app/api/email/sendgrid/route.ts
├── emails/          # Same template structure as Resend
└── package.json
```

**Effort**: 1 day (similar to Resend)

---

## P3: Lower Priority (Future)

### 6. Database Integrations

**PlanetScale** (Serverless MySQL):
- Already declared in template.json
- Good for horizontal scaling
- Branching workflow for schema changes

**Neon** (Serverless Postgres):
- Growing rapidly in Next.js community
- Branching like PlanetScale
- Postgres compatibility

**Turso** (Edge SQLite):
- Interesting for edge deployments
- Very fast reads
- Good for read-heavy apps

**Note**: Database integrations are more complex due to schema management and migrations.

### 7. Additional Analytics

**Mixpanel**: More powerful product analytics
**Google Analytics**: Universal tracking (might need privacy considerations)

### 8. Additional AI

**Cohere**: Embeddings and semantic search
**Together AI**: Open-source models at scale

---

## Implementation Schedule

### Phase 2A (January 2025)
- [ ] UploadThing storage integration
- [ ] Paddle payments integration
- [ ] Integration test suite expansion

### Phase 2B (February 2025)
- [ ] NextAuth integration
- [ ] LemonSqueezy integration
- [ ] SendGrid integration

### Phase 2C (March 2025)
- [ ] PlanetScale database integration
- [ ] Neon database integration
- [ ] Integration versioning system

---

## RFC: Top Priority Integrations

### RFC-001: UploadThing Storage Integration

**Summary**: Add file upload capability via UploadThing.

**Motivation**: 
- Zero storage integrations currently exist
- File uploads are a common SaaS requirement
- UploadThing is Next.js native with simple DX

**Proposed API**:
```typescript
// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
    }),
} satisfies FileRouter;
```

**Dependencies**:
```json
{
  "uploadthing": "^7.0.0",
  "@uploadthing/react": "^7.0.0"
}
```

**Environment Variables**:
```bash
UPLOADTHING_SECRET=sk_xxx
UPLOADTHING_APP_ID=xxx
```

**Status**: Proposed

---

### RFC-002: Paddle Payments Integration

**Summary**: Add Paddle as an alternative payment processor.

**Motivation**:
- Declared in template.json but not implemented
- Merchant of Record model handles VAT/sales tax
- Popular for global SaaS

**Proposed API**:
```typescript
// lib/paddle.ts
import Paddle from '@paddle/paddle-node-sdk';

export const paddle = new Paddle(process.env.PADDLE_API_KEY!);

export async function createCheckoutSession(priceId: string, customerId?: string) {
  // Implementation
}

export async function getSubscriptionStatus(customerId: string) {
  // Implementation
}
```

**Dependencies**:
```json
{
  "@paddle/paddle-node-sdk": "^1.0.0"
}
```

**Environment Variables**:
```bash
PADDLE_API_KEY=xxx
PADDLE_WEBHOOK_SECRET=xxx
PADDLE_SELLER_ID=xxx
```

**Status**: Proposed

---

## Success Metrics

For each new integration:

1. **Complete implementation** - All files, working code
2. **Integration.json valid** - Passes schema validation
3. **Tests pass** - Export with integration works
4. **Documentation** - Added to docs/integrations/
5. **Example usage** - Working example in exported project

---

## Resources

### Provider Documentation
- [UploadThing Docs](https://docs.uploadthing.com)
- [Paddle Docs](https://developer.paddle.com)
- [NextAuth.js Docs](https://authjs.dev)
- [LemonSqueezy Docs](https://docs.lemonsqueezy.com)
- [SendGrid Docs](https://docs.sendgrid.com)

### Related Framework Docs
- [INTEGRATION_AUDIT.md](./INTEGRATION_AUDIT.md)
- [INTEGRATION_CAPABILITIES.md](./INTEGRATION_CAPABILITIES.md)
- [Adding Integrations Guide](./ADDING_INTEGRATIONS.md)

---

*This roadmap is maintained by the Integration Agent and updated as priorities shift.*

