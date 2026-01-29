# PFAS Platform - Agent Prompt Index

## Quick Start

Copy the activation string and paste it at the start of a new agent chat.
The agent will read the corresponding prompt file and execute the task.

---

## Activation Strings (Copy-Paste Ready)

### Wave 1 - Foundation (Do First)
```
w1-db-schema
```
```
w1-api-scaffold
```
```
w1-auth-rbac
```
```
w1-audit-log
```

### Wave 2 - Data Layer
```
w2-catalog-service
```
```
w2-evidence-service
```
```
w2-ingestion-pipeline
```

### Wave 3 - Verification
```
w3-rules-engine
```
```
w3-workflow-state
```

### Wave 4 - Search
```
w4-search-service
```

### Wave 5 - Public Frontend
```
w5-frontend-public
```

### Wave 6 - Admin Console
```
w6-admin-console
```

### Wave 7 - Affiliate & Analytics
```
w7-affiliate-service
```

### Wave 8 - QA & Launch
```
w8-testing-launch
```

---

## Wave Sequence

| Wave | Focus | Files | Run Order |
|------|-------|-------|-----------|
| 1 | Foundation | `w1-01` to `w1-04` | Sequential: schema → scaffold → auth → audit |
| 2 | Data Layer | `w2-05` to `w2-07` | Parallel: catalog & evidence, then ingestion |
| 3 | Verification | `w3-08`, `w3-09` | Sequential: rules → workflow |
| 4 | Search | `w4-10` | Single prompt |
| 5 | Frontend | `w5-11` | Single prompt |
| 6 | Admin | `w6-12` | Single prompt |
| 7 | Affiliate | `w7-13` | Single prompt |
| 8 | Launch | `w8-14` | Single prompt (after all else) |

---

## Dependency Graph

```
WAVE 1 (Foundation)
├── w1-db-schema ────────────┐
│                            ├──→ w1-api-scaffold
│                            │          │
│                            └──→ w1-auth-rbac
│                                       │
└──────────────────────────────────→ w1-audit-log

WAVE 2 (Data Layer) - Requires Wave 1
├── w2-catalog-service (parallel)
├── w2-evidence-service (parallel)
└── w2-ingestion-pipeline (after both above)

WAVE 3 (Verification) - Requires Wave 2
├── w3-rules-engine
└── w3-workflow-state (after rules-engine)

WAVE 4 (Search) - Requires Wave 2
└── w4-search-service

WAVE 5 (Frontend) - Requires Wave 2, 4
└── w5-frontend-public

WAVE 6 (Admin) - Requires Wave 1, 2, 3
└── w6-admin-console

WAVE 7 (Affiliate) - Requires Wave 2
└── w7-affiliate-service

WAVE 8 (Launch) - Requires ALL above
└── w8-testing-launch
```

---

## Prompt Files

| Activation | File | Description |
|------------|------|-------------|
| `w1-db-schema` | `w1-01-db-schema.txt` | PostgreSQL schema with all tables, indexes, triggers |
| `w1-api-scaffold` | `w1-02-api-scaffold.txt` | API routes stub with types and validation |
| `w1-auth-rbac` | `w1-03-auth-rbac.txt` | Authentication and role-based access control |
| `w1-audit-log` | `w1-04-audit-log.txt` | Append-only audit logging system |
| `w2-catalog-service` | `w2-05-catalog-service.txt` | Product/component CRUD with faceted filtering |
| `w2-evidence-service` | `w2-06-evidence-service.txt` | Evidence upload with hash verification |
| `w2-ingestion-pipeline` | `w2-07-ingestion-pipeline.txt` | Feed ingestion, enrichment, risk detection |
| `w3-rules-engine` | `w3-08-rules-engine.txt` | Verification tier rules and confidence |
| `w3-workflow-state` | `w3-09-workflow-state.txt` | Product/report state machines |
| `w4-search-service` | `w4-10-search-service.txt` | OpenSearch index, facets, ranking |
| `w5-frontend-public` | `w5-11-frontend-public.txt` | Next.js public site with all pages |
| `w6-admin-console` | `w6-12-admin-console.txt` | Admin review queue and evidence upload |
| `w7-affiliate-service` | `w7-13-affiliate-service.txt` | Link generation and click tracking |
| `w8-testing-launch` | `w8-14-testing-launch.txt` | Test suites and launch checklist |

---

## Usage Example

1. Start a new agent chat
2. Paste activation string: `w1-db-schema`
3. Agent reads `docs/pfas-platform/prompts/w1-01-db-schema.txt`
4. Agent implements PostgreSQL schema
5. Repeat for next wave

---

## Estimated Build Time

| Wave | Complexity | Est. Time |
|------|------------|-----------|
| 1 | High | 2-3 days |
| 2 | High | 2-3 days |
| 3 | Medium | 1-2 days |
| 4 | Medium | 1 day |
| 5 | High | 2-3 days |
| 6 | High | 2-3 days |
| 7 | Low | 1 day |
| 8 | Medium | 1-2 days |
| **Total** | | **12-18 days**

---

# REFINEMENT WAVES (Run After Initial Build)

These waves polish and validate the implementation.

## Wave 9 - Integration
```
w9-api-integration
```
```
w9-database-seed
```

## Wave 10 - Polish
```
w10-ui-polish
```
```
w10-disclosure-audit
```

## Wave 11 - Validation
```
w11-e2e-validation
```

---

## Refinement Prompt Files

| Activation | File | Description |
|------------|------|-------------|
| `w9-api-integration` | `w9-15-api-integration.txt` | Connect frontend to API, verify data flows |
| `w9-database-seed` | `w9-16-database-seed.txt` | Seed 50+ realistic products with evidence |
| `w10-ui-polish` | `w10-17-ui-polish.txt` | Fix styling, loading states, responsiveness |
| `w10-disclosure-audit` | `w10-18-disclosure-audit.txt` | Audit all FTC disclosures |
| `w11-e2e-validation` | `w11-19-e2e-validation.txt` | Complete user journey testing |

---

## Refinement Order

```
WAVE 9 (Integration) - Do first
├── w9-api-integration (connect frontend ↔ API)
└── w9-database-seed (populate test data)

WAVE 10 (Polish) - After Wave 9
├── w10-ui-polish (visual refinement)
└── w10-disclosure-audit (FTC compliance check)

WAVE 11 (Validation) - Final step
└── w11-e2e-validation (full system test)
```

## Refinement Checklist

After running all refinement prompts:

□ Frontend fetches real data from API
□ 50+ products in database with tiers
□ UI polished with loading/error states
□ FTC disclosures on all required pages
□ All user journeys work end-to-end
□ Performance meets targets (LCP < 2.5s)
□ Accessibility audit passed

**Ready for launch when all boxes checked.**
