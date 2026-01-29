# PFAS-Free Kitchen Platform API

Backend API scaffold for the PFAS-Free Kitchen products platform.

## Overview

This includes:
1. **API Layer** - 20 REST endpoints with routing, validation, and error handling
2. **Ingestion Pipeline** - Feed adapters, enrichment, risk detection, and deduplication
3. **Workflow State Machines** - Product and report lifecycle management with guards and SLA
4. **Search Service** - OpenSearch integration with faceted filtering and trust-weighted ranking
5. **Affiliate Service** - Link generation and click tracking with bot detection
6. **Database Seed** - 55 realistic products across 5 categories with evidence

## Quick Start

```bash
cd src/pfas-api
npm install
npm run db:seed     # Seed with 55 products
npm run dev
```

## Endpoints

### Public Endpoints (12)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products with filtering |
| GET | `/api/v1/products/:id` | Get product details |
| GET | `/api/v1/products/:id/compare` | Compare products |
| GET | `/api/v1/products/:id/verification` | Get verification status |
| GET | `/api/v1/products/:id/affiliate-links` | Get affiliate links |
| GET | `/api/v1/categories` | List categories |
| GET | `/api/v1/evidence/:id` | Get evidence metadata |
| GET | `/api/v1/evidence/:id/artifact` | Stream evidence file |
| GET | `/api/v1/search` | Search products |
| GET | `/api/v1/search/autocomplete` | Autocomplete suggestions |
| POST | `/api/v1/reports` | Submit issue report |
| POST | `/api/v1/affiliate-clicks` | Track click |

### Admin Endpoints (8)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/verification/decide` | Submit verification decision |
| POST | `/api/v1/admin/evidence/upload` | Upload evidence artifact |
| GET | `/api/v1/admin/reports` | List reports |
| PATCH | `/api/v1/admin/reports/:id` | Update report |
| GET | `/api/v1/admin/queue` | Get review queue |
| POST | `/api/v1/admin/queue/:id/assign` | Assign to reviewer |
| GET | `/api/v1/admin/audit-log` | Get audit log |
| GET | `/api/v1/admin/affiliate-analytics` | Click analytics |

## Architecture

```
src/
├── index.ts                 # Entry point
├── config/
│   ├── database.ts          # Postgres connection (stub)
│   ├── search.ts            # OpenSearch connection (stub)
│   ├── storage.ts           # S3 connection (stub)
│   └── logger.ts            # Pino logger
├── middleware/
│   ├── auth.ts              # JWT/session validation (stub)
│   ├── rateLimit.ts         # Rate limiting
│   ├── errorHandler.ts      # Global error handler
│   └── requestLogger.ts     # Request logging
├── routes/
│   ├── index.ts             # Route aggregator
│   ├── catalog.routes.ts
│   ├── verification.routes.ts
│   ├── evidence.routes.ts
│   ├── affiliate.routes.ts
│   ├── search.routes.ts
│   ├── reports.routes.ts
│   └── admin/
│       ├── index.ts
│       ├── verification.admin.routes.ts
│       ├── evidence.admin.routes.ts
│       ├── reports.admin.routes.ts
│       ├── queue.admin.routes.ts
│       └── audit.admin.routes.ts
├── services/
│   ├── catalog.service.ts   # (stub)
│   ├── verification.service.ts
│   ├── evidence.service.ts
│   ├── affiliate.service.ts
│   ├── search.service.ts    # Full-text search
│   ├── indexer.service.ts   # Search indexing
│   ├── reports.service.ts
│   ├── workflow.service.ts  # State transitions
│   ├── sla.service.ts       # SLA management
│   └── queue.service.ts     # Review queue
├── handlers/
│   └── search-events.handler.ts  # Index sync events
├── state-machines/
│   ├── types.ts             # State/event types
│   ├── product.machine.ts   # Product lifecycle
│   └── report.machine.ts    # Report lifecycle
├── repositories/
│   ├── product.repository.ts
│   ├── evidence.repository.ts
│   ├── verification.repository.ts
│   └── audit.repository.ts
├── types/
│   ├── api.types.ts         # Request/Response types
│   ├── domain.types.ts      # Domain models
│   └── database.types.ts    # DB row types
├── utils/
│   ├── hash.ts              # SHA-256 utilities
│   ├── pagination.ts        # Pagination helpers
│   └── validation.ts        # Zod schemas
└── errors/
    └── AppError.ts          # Custom error classes
```

## Features

- ✅ All 20 endpoints stubbed with proper routing
- ✅ Request validation with Zod schemas
- ✅ Response types matching API spec
- ✅ Admin routes protected by auth middleware (stubbed)
- ✅ Global error handler with structured responses
- ✅ Request IDs for tracing
- ✅ Rate limiting per endpoint type
- ✅ Pino logging with request/response tracking

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | State conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Auth required |
| `FORBIDDEN` | 403 | Access denied |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Dependency down |
| `NOT_IMPLEMENTED` | 501 | Stub not yet implemented |

## Ingestion Pipeline

Products enter the system via feed adapters and flow through:

```
Feed Source → Adapter → Canonical Product → Enrichment → Risk Detection → Dedup → Database
```

### Risk Detection

The risk detector identifies PFAS-related terms:

| Level | Action | Examples |
|-------|--------|----------|
| `auto_reject` | Rejected, not created | PTFE, Teflon, Silverstone |
| `high_risk` | Elevated review queue | "nonstick", "stain resistant" |
| `moderate_risk` | Standard review | "PFOA-free", "coated" |
| `low` | Standard review | No concerning terms |

### Enrichment

Extracts structured data from product text:
- **Materials**: stainless steel, cast iron, glass, etc.
- **Coatings**: enamel, seasoning, ceramic sol-gel, etc.
- **Features**: oven safe temp, induction compatible, etc.
- **Components**: pan body, handle, lid

### Event Topics

| Topic | When Published |
|-------|----------------|
| `product.ingested` | Raw product received |
| `product.enriched` | Enrichment complete |
| `product.rejected` | Auto-reject triggered |
| `product.queued` | Added to review queue |
| `product.merged` | Merged with existing product |

## Workflow State Machines

Products and reports follow defined state machines with guards and side effects.

### Product States

```
draft → pending_review → under_review → published
                 ↓             ↓            ↓
            [ESCALATE]    needs_info    suspended
                              ↓             ↓
                          archived ←───────┘
```

| State | Valid Events |
|-------|-------------|
| `draft` | SUBMIT_FOR_REVIEW |
| `pending_review` | ASSIGN_REVIEWER, ESCALATE |
| `under_review` | APPROVE, REJECT, RETURN_TO_QUEUE, REQUEST_CHANGES |
| `needs_info` | PROVIDE_INFO, TIMEOUT |
| `published` | SUSPEND, UPDATE, FLAG_FOR_REVALIDATION |
| `suspended` | REINSTATE, ARCHIVE |
| `archived` | (final) |

### Report States

```
submitted → under_review → resolved
      ↓           ↓
 AUTO_DISMISS  awaiting_info → dismissed
```

### SLA Configuration

| Priority | Hours | Issue Types |
|----------|-------|------------|
| Critical | 24 | Manual escalation |
| High | 72 | suspected_pfas, materials_changed, counterfeit_risk |
| Normal | 168 | listing_mismatch, other |
| Low | 336 | Deprioritized |

### Guards

- `hasMinimumData` - Product has name, brand, category
- `hasVerificationDecision` - Decision has tier, rationale, evidence
- `suspensionResolved` - Suspension reason addressed
- `isDuplicateReport` - Report matches existing

## Search Service

Full-text product search with OpenSearch.

### Index Setup

```bash
npx ts-node scripts/setup-search-index.ts create
npx ts-node scripts/setup-search-index.ts recreate  # Drop and recreate
npx ts-node scripts/setup-search-index.ts info      # Show stats
```

### Search Features

| Feature | Description |
|---------|-------------|
| Full-text | Search name, brand, description with fuzzy matching |
| Facets | Filter by tier, materials, coatings, retailer, features |
| Trust Ranking | Higher tier products rank higher |
| Freshness Decay | Recently verified products boosted |
| Autocomplete | Product and brand name suggestions |
| Education Banners | Show clarifications for "PFOA-free", "Teflon" searches |

### Query Boosts

| Field | Boost |
|-------|-------|
| `name` | 3x |
| `brand_name` | 2x |
| `material_summary` | 1.5x |
| `description` | 1x |

### Tier Ranking

| Tier | Boost | Label |
|------|-------|-------|
| 4 | 2.0x | PFAS-Free Verified |
| 3 | 1.8x | PFAS-Free Claimed |
| 2 | 1.4x | Likely PFAS-Free |
| 1 | 1.2x | More Info Needed |
| 0 | 0.8x | Unknown |

### Synonyms

Built-in synonyms for common cookware terms:
- "skillet" = "frying pan" = "frypan"
- "dutch oven" = "cocotte" = "french oven"
- "stainless" = "stainless steel"
- "cast iron" = "castiron"

### Real-time Index Updates

Events that trigger index updates:
- `product.published` → Add to index
- `product.suspended` → Remove from index
- `product.archived` → Remove from index
- `product.updated` → Reindex
- `verification.completed` → Reindex

## Affiliate Service

Generates FTC-compliant affiliate links and tracks clicks with bot filtering.

### Link Generation

```typescript
// GET /api/v1/products/:id/affiliate-links
{
  "data": {
    "productId": "prod_1",
    "links": [
      {
        "retailerId": "ret_amazon",
        "retailerName": "Amazon",
        "retailerIcon": "amazon",
        "affiliateUrl": "https://www.amazon.com/dp/B08N5WRWNW?tag=pfasfreekitchen-20&...",
        "disclosureRequired": true,
        "disclosureText": "Affiliate link: We may earn a commission..."
      }
    ],
    "gridDisclosure": "Affiliate links may appear in results."
  }
}
```

### Supported Retailers

| Retailer | Template Key | Affiliate Network |
|----------|-------------|-------------------|
| Amazon | `amazon` | Amazon Associates |
| Williams Sonoma | `williams_sonoma` | CJ Affiliate |
| Sur La Table | `sur_la_table` | Impact |
| Target | `target` | Impact |
| Walmart | `walmart` | Impact |
| Crate & Barrel | `crate_barrel` | CJ Affiliate |
| Lodge | `lodge` | Direct |
| Le Creuset | `le_creuset` | Direct |

### Click Tracking

```typescript
// POST /api/v1/affiliate-clicks
{
  "product_id": "prod_1",
  "retailer_id": "ret_amazon",
  "session_id": "sess_abc123",
  "referrer_page": "/product/lodge-cast-iron-skillet"
}
```

### Bot Detection

| Check | Threshold | Action |
|-------|-----------|--------|
| Known Bot UA | Pattern match | Flag as bot |
| Click Velocity | >10/min | Flag as bot |
| Duplicate Click | Same session/product/retailer in 5min | Ignore |

### Privacy Compliance

- ✅ No IP addresses stored
- ✅ User agent hashed (not stored raw)
- ✅ No fingerprinting
- ✅ Session ID optional

### Amazon Associates Compliance

- ✅ Tag parameter in all links
- ✅ No price display
- ✅ No review display
- ✅ Required link format

### FTC Disclosures

| Context | Disclosure |
|---------|------------|
| Single link | "Affiliate link: We may earn a commission if you purchase through this link." |
| Product grid | "Affiliate links may appear in results." |
| Modal | "We may earn a commission if you make a purchase through this link." |
| Footer | "Some links on this site are affiliate links. We may earn a commission when you make a purchase." |

## Testing

Comprehensive test suites for all platform components.

### Test Commands

```bash
# Run all tests
npm run test:all

# Unit tests only
npm run test:unit

# Integration tests (requires test DB)
npm run test:integration

# E2E tests (requires running app)
npm run test:e2e

# With coverage report
npm run test:coverage

# Data quality validation
npm run validate:data
```

### Test Suites

| Suite | Location | Description |
|-------|----------|-------------|
| Unit Tests | `tests/unit/` | Rules engine, affiliate links, evidence hashing |
| Integration Tests | `tests/integration/` | Product flow, report flow |
| E2E Tests | `tests/e2e/` | Browser tests with Playwright |
| Data Validation | `scripts/validate-data-quality.ts` | Pre-launch data checks |

### Unit Tests

| Test File | Coverage |
|-----------|----------|
| `rules-engine.test.ts` | Tier evaluation logic, guards |
| `affiliate-links.test.ts` | Link generation, FTC compliance |
| `evidence-hash.test.ts` | SHA-256, integrity verification |

### Integration Tests

| Test File | Coverage |
|-----------|----------|
| `product-flow.test.ts` | Ingest → verify → publish flow |
| `report-flow.test.ts` | Submit → review → resolve flow |

### E2E Tests (Playwright)

| Test File | Coverage |
|-----------|----------|
| `browse.spec.ts` | Category browsing, filtering |
| `product-detail.spec.ts` | PDP sections, compliance |

### CI/CD Pipeline

GitHub Actions workflow at `.github/workflows/test.yml`:

- **lint**: ESLint checks
- **unit**: Unit tests with coverage
- **integration**: Integration tests with PostgreSQL + OpenSearch
- **e2e**: Playwright browser tests
- **validate**: Data quality validation (main branch only)
- **security**: npm audit + Snyk scan
- **accessibility**: axe-core accessibility audit
- **lighthouse**: Performance audit

### Launch Checklist

See `docs/pfas-platform/LAUNCH_CHECKLIST.md` for complete pre-launch validation.

## Database Seed

Comprehensive seed data with 55 realistic products across all categories.

### Seed Commands

```bash
# Seed the database with test data
npm run db:seed

# Verify seed data meets requirements
npm run db:verify

# Reset and reseed (migrate + seed + verify)
npm run db:reset
```

### Seeded Data

| Entity | Count | Description |
|--------|-------|-------------|
| Brands | 10 | All-Clad, Lodge, Le Creuset, Staub, GreenPan, etc. |
| Retailers | 4 | Amazon, Williams Sonoma, Sur La Table, Target |
| Products | 55 | Across cookware, bakeware, storage, utensils |
| Components | 100+ | Pan body, lid, handle, etc. with materials |
| Evidence | 55 | Brand statements and lab reports |
| Verifications | 55 | All products assigned tier 0-4 |

### Product Categories

| Category | Products | Examples |
|----------|----------|----------|
| Skillets & Frying Pans | 15 | All-Clad D3, Lodge Cast Iron, GreenPan |
| Dutch Ovens & Stock Pots | 10 | Le Creuset, Staub Cocotte |
| Saucepans | 5 | All-Clad, Made In, Caraway |
| Bakeware | 10 | Pyrex Glass, Sheet Pans |
| Storage | 8 | Pyrex Containers, Stasher Bags |
| Utensils | 7 | OXO Spatulas, Wooden Spoons |

### Tier Distribution

| Tier | % | Description |
|------|---|-------------|
| Tier 4 | ~13% | Monitored (Pyrex glass products) |
| Tier 3 | ~45% | Lab Tested (All-Clad, Le Creuset, etc.) |
| Tier 2 | ~38% | Policy Reviewed (GreenPan, Caraway, etc.) |
| Tier 1 | ~4% | Brand Statement only |
| Tier 0 | 0% | None seeded |

### Brands Included

- **All-Clad** - Premium stainless steel cookware
- **Lodge** - American cast iron
- **Le Creuset** - French enameled cast iron
- **Staub** - French enameled cookware
- **GreenPan** - Ceramic nonstick
- **Pyrex** - Glass bakeware and storage
- **OXO** - Kitchen tools and utensils
- **Caraway** - Modern ceramic cookware
- **Made In** - Professional-grade cookware
- **Stasher** - Reusable silicone bags

## Next Steps

Remaining implementation tasks:

1. **Catalog Service** - `CatalogService`, `ProductRepository` queries
2. **Evidence Service** - `EvidenceService`, S3 integration
3. **Verification Service** - `VerificationService`, tier rules
4. **Feed Integrations** - Impact API, Amazon PA-API connections

## Tech Stack

- Node.js 20+
- TypeScript 5+
- Express.js
- Zod (validation)
- Pino (logging)
- Vitest (testing)
- Playwright (E2E)

## Environment Variables

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database (stub)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pfas_kitchen
DB_USER=postgres
DB_PASSWORD=

# Search (OpenSearch)
OPENSEARCH_NODE=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=
OPENSEARCH_INDEX_PREFIX=pfas

# Storage (stub)
S3_BUCKET=pfas-evidence
AWS_REGION=us-east-1

# CORS
CORS_ORIGIN=*
```
