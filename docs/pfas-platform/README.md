# PFAS-Free Kitchen Platform - Specification Pack

**Version:** 1.0.0  
**Created:** 2026-01-27  
**Status:** Implementation-Ready

---

## Overview

This specification pack contains everything needed to build a PFAS-free kitchen affiliate browsing platform. The platform enables consumers to find verified PFAS-free kitchen products with full transparency about evidence, limitations, and verification methodology.

## Documents

| # | Document | Purpose |
|---|----------|---------|
| 1 | [PRD-MVP](./01-PRD-MVP.md) | Product Requirements Document with epics, user stories, acceptance criteria |
| 2 | [Technical Design](./02-TECHNICAL-DESIGN.md) | API contracts, database schema, search mappings, workflows |
| 3 | [Admin Console Spec](./03-ADMIN-CONSOLE-SPEC.md) | Review queue, evidence management, decision forms |
| 4 | [Verification Playbook](./04-VERIFICATION-PLAYBOOK.md) | Reviewer training, decision trees, monitoring |

## Key Constraints

| Constraint | Value |
|------------|-------|
| Geography | US-only |
| Language | English |
| Currency | USD |
| Price Display | Disabled (MVP) |
| Verification Tiers | 0-4 (mandatory) |
| Component Model | Required for food-contact products |

## Platform Principles

1. **No Silent Failures** - If we don't know something, we display "Unknown" with what's missing
2. **Scope Specificity** - Every claim specifies which components it covers
3. **Evidence-Based** - Every tier requires documented evidence
4. **FTC Compliant** - "Free-of" claims follow 16 CFR 260.9 guidance
5. **Auditability** - Append-only audit log, immutable evidence storage with SHA-256 hashing

## Verification Tiers Summary

| Tier | Name | Evidence Required |
|------|------|-------------------|
| 0 | Unknown | None (default state) |
| 1 | Brand Statement | Brand attestation <12 months |
| 2 | Policy Reviewed | Tier 1 + complete component model + materials |
| 3 | Lab Tested | Tier 2 + lab report <24 months on food-contact |
| 4 | Monitored | Tier 3 + prior history + scheduled revalidation |

## Tech Stack (Recommended)

- **Frontend:** Next.js 14+ (SSR/ISR)
- **Backend:** Node.js + TypeScript
- **Database:** PostgreSQL 15+
- **Search:** OpenSearch 2.x
- **Queue:** AWS SQS
- **Storage:** AWS S3 (WORM for evidence)
- **Orchestration:** Temporal

## MVP Scope

- 500 products across 5 categories (Cookware, Bakeware, Storage, Utensils, Appliance Accessories)
- 100% products have verification tier displayed
- 100% products have ≥1 evidence object
- 80%+ products at Tier 1 or higher
- FTC disclosure on all affiliate surfaces
- No price display (compliance simplification)

## Build Sequence (10 Sprints)

1. Taxonomy + Schema + UI Wireframes + Legal Copy
2. Core Catalog Service + Admin Console Skeleton + Audit Log
3. Evidence Service + Immutable Storage + Hashing
4. Verification Rules Engine + Tier UI
5. Ingestion v1 (Feed + Manual) + Deduplication
6. Search v1 (Facets + Filters) + Category Pages
7. Product Detail + Compare v1
8. Affiliate Link Service + Click Tracking + Bot Filtering
9. Drift Monitoring v1 + Report Issue Workflow
10. QA Hardening + Launch Checklist + Incident Runbooks

## Quick Links

### For Engineers
- [Database Schema DDL](./02-TECHNICAL-DESIGN.md#3-postgresql-schema-ddl)
- [API Contracts](./02-TECHNICAL-DESIGN.md#2-api-contracts)
- [Search Index Mappings](./02-TECHNICAL-DESIGN.md#4-search-index-mappings-opensearch)
- [Workflow State Machines](./02-TECHNICAL-DESIGN.md#5-workflow-state-machines)

### For Product/Design
- [User Stories](./01-PRD-MVP.md#2-epics-and-user-stories)
- [Error/Empty States](./01-PRD-MVP.md#2-epics-and-user-stories)
- [Admin Console UX](./03-ADMIN-CONSOLE-SPEC.md#5-product-review-interface)

### For Operations
- [Reviewer Training](./04-VERIFICATION-PLAYBOOK.md#2-reviewer-training-checklist)
- [Decision Trees](./04-VERIFICATION-PLAYBOOK.md#4-decision-trees)
- [Escalation Procedures](./04-VERIFICATION-PLAYBOOK.md#7-escalation-procedures)

### For Legal/Compliance
- [FTC Requirements](./01-PRD-MVP.md#3-compliance-requirements)
- [Claim Type Definitions](./04-VERIFICATION-PLAYBOOK.md#3-verification-tier-requirements-detailed)
- [Disclosure Placement](./01-PRD-MVP.md#32-ftc-endorsement-guides-affiliate-disclosure)

---

## Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| PRD-MVP | 1.0.0 | 2026-01-27 |
| Technical Design | 1.0.0 | 2026-01-27 |
| Admin Console Spec | 1.0.0 | 2026-01-27 |
| Verification Playbook | 1.0.0 | 2026-01-27 |
