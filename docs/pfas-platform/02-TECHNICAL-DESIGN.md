# PFAS-Free Kitchen Platform - Technical Design Document

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Status:** Implementation-Ready

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Web Browser]  ──→  [CDN/Edge Cache (Vercel/Cloudflare)]                   │
│                              │                                               │
│                              ▼                                               │
│                    [Next.js SSR/ISR App]                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  [API Gateway / Load Balancer]                                              │
│  - Rate limiting                                                             │
│  - Request validation                                                        │
│  - Auth (admin routes only)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Catalog     │    │ Verification  │    │   Evidence    │
│   Service     │    │   Service     │    │   Service     │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ Products      │    │ Tier logic    │    │ Artifacts     │
│ Components    │    │ Rules engine  │    │ Hashing       │
│ Categories    │    │ History       │    │ Retention     │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  [PostgreSQL]          [S3/Object Store]         [OpenSearch]               │
│  - System of record    - Evidence PDFs           - Product search           │
│  - Audit log           - Immutable storage       - Facets                   │
│  - Transactions        - SHA-256 hashed          - Relevance                │
└─────────────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ASYNC PIPELINES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  [SQS/Queue]  ──→  [Enrichment Workers]  ──→  [Review Queue]                │
│                                                                              │
│  Topics:                                                                     │
│  - product.ingested                                                          │
│  - product.enriched                                                          │
│  - evidence.uploaded                                                         │
│  - verification.requested                                                    │
│  - verification.completed                                                    │
│  - report.submitted                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 14+ (App Router) | SSR/ISR for SEO, React ecosystem |
| CDN | Vercel Edge / Cloudflare | Global distribution, caching |
| API | Node.js + TypeScript | Type safety, ecosystem |
| Database | PostgreSQL 15+ | ACID, JSON support, mature |
| Search | OpenSearch 2.x | Open source, facets, relevance |
| Queue | AWS SQS + SNS | Managed, reliable |
| Object Store | AWS S3 (WORM) | Immutable evidence storage |
| Orchestration | Temporal | Workflow state machines |
| Observability | OpenTelemetry + Datadog | Tracing, metrics, logs |

---

## 2. API Contracts

### 2.1 Catalog Service

#### GET /api/v1/products
List products with filtering and pagination.

**Request:**
```yaml
Query Parameters:
  category_id: string (optional) - Filter by category
  brand_id: string (optional) - Filter by brand
  tier: integer[] (optional) - Filter by verification tiers [0,1,2,3,4]
  material: string[] (optional) - Filter by material slugs
  coating_type: string[] (optional) - none | ceramic | unknown
  food_contact_surface: string[] (optional) - bare_metal | enamel | glass | silicone | unknown
  induction_compatible: boolean (optional)
  oven_safe_min_temp: integer (optional) - Minimum oven-safe temp in °F
  retailer_id: string (optional) - Filter by retailer availability
  sort: string (optional) - Default: "tier_desc,relevance"
    Options: tier_desc, tier_asc, name_asc, name_desc, newest
  page: integer (optional) - Default: 1
  limit: integer (optional) - Default: 24, Max: 100

Headers:
  Accept: application/json
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "prd_abc123",
      "name": "12-inch Stainless Steel Skillet",
      "slug": "brand-12-inch-stainless-steel-skillet",
      "brand": {
        "id": "brd_xyz",
        "name": "Example Brand",
        "slug": "example-brand"
      },
      "category": {
        "id": "cat_cookware_skillets",
        "name": "Skillets & Frying Pans",
        "path": ["Cookware", "Skillets & Frying Pans"]
      },
      "primary_image_url": "https://cdn.pfasfreekitchen.com/products/prd_abc123/main.jpg",
      "material_summary": "Stainless steel",
      "coating_summary": "None (uncoated)",
      "verification": {
        "tier": 3,
        "tier_label": "Lab Tested",
        "claim_type": "B",
        "claim_label": "Below detection limit",
        "has_evidence": true,
        "evidence_count": 2
      },
      "retailers": [
        {"id": "ret_amazon", "name": "Amazon", "icon": "amazon"},
        {"id": "ret_williams", "name": "Williams Sonoma", "icon": "williams-sonoma"}
      ],
      "features": {
        "induction_compatible": true,
        "oven_safe_temp_f": 500,
        "dishwasher_safe": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total_count": 156,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false
  },
  "facets": {
    "tier": [
      {"value": 0, "label": "Unknown", "count": 12},
      {"value": 1, "label": "Brand Statement", "count": 34},
      {"value": 2, "label": "Policy Reviewed", "count": 45},
      {"value": 3, "label": "Lab Tested", "count": 52},
      {"value": 4, "label": "Monitored", "count": 13}
    ],
    "material": [
      {"value": "stainless_steel", "label": "Stainless Steel", "count": 78},
      {"value": "cast_iron", "label": "Cast Iron", "count": 32}
    ]
  }
}
```

**Response 400:**
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid tier value. Must be 0-4.",
    "field": "tier"
  }
}
```

**Response 500:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Unable to fetch products. Please try again.",
    "request_id": "req_abc123"
  }
}
```

---

#### GET /api/v1/products/{product_id}
Get single product with full details.

**Request:**
```yaml
Path Parameters:
  product_id: string (required) - Product ID or slug

Headers:
  Accept: application/json
```

**Response 200:**
```json
{
  "data": {
    "id": "prd_abc123",
    "name": "12-inch Stainless Steel Skillet",
    "slug": "brand-12-inch-stainless-steel-skillet",
    "description": "Professional-grade tri-ply stainless steel skillet...",
    "brand": {
      "id": "brd_xyz",
      "name": "Example Brand",
      "slug": "example-brand",
      "website": "https://examplebrand.com",
      "country": "US"
    },
    "category": {
      "id": "cat_cookware_skillets",
      "name": "Skillets & Frying Pans",
      "path": ["Cookware", "Skillets & Frying Pans"],
      "slug": "cookware/skillets-frying-pans"
    },
    "images": [
      {
        "url": "https://cdn.pfasfreekitchen.com/products/prd_abc123/main.jpg",
        "alt": "12-inch Stainless Steel Skillet - front view",
        "primary": true
      }
    ],
    "components": [
      {
        "id": "cmp_body",
        "name": "Pan body",
        "food_contact": true,
        "material": {
          "id": "mat_stainless",
          "name": "Stainless Steel",
          "family": "Metal"
        },
        "coating": null,
        "pfas_risk_flag": false
      },
      {
        "id": "cmp_handle",
        "name": "Handle",
        "food_contact": false,
        "material": {
          "id": "mat_stainless",
          "name": "Stainless Steel",
          "family": "Metal"
        },
        "coating": null,
        "pfas_risk_flag": false
      }
    ],
    "verification": {
      "id": "ver_777",
      "tier": 3,
      "tier_label": "Lab Tested",
      "claim_type": "B",
      "claim_type_label": "Below detection limit",
      "claim_type_description": "Lab tested for specific PFAS compounds; all below detection limits.",
      "scope_text": "Food-contact surfaces (pan body)",
      "scope_component_ids": ["cmp_body"],
      "confidence_score": 0.86,
      "decision_date": "2025-11-15",
      "evidence_ids": ["ev_9001", "ev_9002"],
      "unknowns": [
        "Handle material not independently tested (non-food-contact)"
      ]
    },
    "evidence": [
      {
        "id": "ev_9001",
        "type": "lab_report",
        "type_label": "Lab Report",
        "source": "Brand submission",
        "lab_name": "Example Lab Inc.",
        "method_summary": "Targeted PFAS by LC-MS/MS",
        "analyte_count": 40,
        "lod_loq": {
          "lod_ng_g": 1.0,
          "loq_ng_g": 3.0,
          "explanation": "Can detect PFAS at 1 part per billion; can measure at 3 ppb"
        },
        "sample_scope": {
          "units": 1,
          "lots": 1,
          "components": ["Pan body"]
        },
        "collection_date": "2025-11-01",
        "received_date": "2025-11-10",
        "artifact_url": "/api/v1/evidence/ev_9001/artifact",
        "expires_at": "2027-11-10"
      },
      {
        "id": "ev_9002",
        "type": "brand_statement",
        "type_label": "Brand Statement",
        "source": "Brand submission",
        "statement_text": "We confirm that no PFAS are intentionally added to any component of this product.",
        "statement_date": "2025-10-01",
        "artifact_url": "/api/v1/evidence/ev_9002/artifact"
      }
    ],
    "retailers": [
      {
        "id": "ret_amazon",
        "name": "Amazon",
        "icon": "amazon",
        "product_url_masked": true
      },
      {
        "id": "ret_williams",
        "name": "Williams Sonoma",
        "icon": "williams-sonoma",
        "product_url_masked": true
      }
    ],
    "features": {
      "induction_compatible": true,
      "oven_safe_temp_f": 500,
      "oven_safe_temp_c": 260,
      "dishwasher_safe": true,
      "metal_utensil_safe": true,
      "sizes_available": ["10-inch", "12-inch", "14-inch"],
      "weight_lbs": 3.2
    },
    "status": "published",
    "created_at": "2025-10-01T00:00:00Z",
    "updated_at": "2025-11-15T12:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found or has been removed."
  }
}
```

---

#### GET /api/v1/products/{product_id}/compare
Get comparison data for multiple products.

**Request:**
```yaml
Query Parameters:
  ids: string (required) - Comma-separated product IDs (2-4)

Headers:
  Accept: application/json
```

**Response 200:**
```json
{
  "data": {
    "products": [
      {
        "id": "prd_abc123",
        "name": "12-inch Stainless Steel Skillet",
        "brand_name": "Brand A",
        "verification_tier": 3,
        "claim_type": "B",
        "material_summary": "Stainless steel",
        "coating_summary": "None",
        "food_contact_surface": "Bare metal",
        "evidence_count": 2,
        "features": {
          "induction_compatible": true,
          "oven_safe_temp_f": 500,
          "dishwasher_safe": true
        }
      },
      {
        "id": "prd_def456",
        "name": "12-inch Cast Iron Skillet",
        "brand_name": "Brand B",
        "verification_tier": 2,
        "claim_type": "A",
        "material_summary": "Cast iron",
        "coating_summary": "None",
        "food_contact_surface": "Bare metal",
        "evidence_count": 1,
        "features": {
          "induction_compatible": true,
          "oven_safe_temp_f": 650,
          "dishwasher_safe": false
        }
      }
    ],
    "differences": [
      "verification_tier",
      "claim_type",
      "material_summary",
      "oven_safe_temp_f",
      "dishwasher_safe"
    ]
  }
}
```

---

#### GET /api/v1/categories
List all categories with hierarchy.

**Response 200:**
```json
{
  "data": [
    {
      "id": "cat_cookware",
      "name": "Cookware",
      "slug": "cookware",
      "parent_id": null,
      "product_count": 245,
      "children": [
        {
          "id": "cat_cookware_skillets",
          "name": "Skillets & Frying Pans",
          "slug": "skillets-frying-pans",
          "parent_id": "cat_cookware",
          "product_count": 67,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 2.2 Verification Service

#### GET /api/v1/products/{product_id}/verification
Get verification details for a product.

**Response 200:**
```json
{
  "data": {
    "current": {
      "id": "ver_777",
      "tier": 3,
      "tier_label": "Lab Tested",
      "claim_type": "B",
      "scope_text": "Food-contact surfaces",
      "confidence_score": 0.86,
      "decision_date": "2025-11-15",
      "reviewer_id": "rev_12",
      "rationale": "Food-contact component tested; method and LOD/LOQ documented; no fluoropolymer coating.",
      "evidence_ids": ["ev_9001"]
    },
    "history": [
      {
        "id": "ver_650",
        "tier": 2,
        "decision_date": "2025-09-01",
        "reason": "Initial policy review completed"
      },
      {
        "id": "ver_500",
        "tier": 1,
        "decision_date": "2025-08-15",
        "reason": "Brand attestation received"
      }
    ],
    "next_review_due": "2027-11-15",
    "unknowns": [
      "Handle material not independently tested (non-food-contact)"
    ]
  }
}
```

---

#### POST /api/v1/admin/verification/decide
(Admin only) Submit verification decision.

**Request:**
```json
{
  "product_id": "prd_abc123",
  "tier": 3,
  "claim_type": "B",
  "scope_text": "Food-contact surfaces (pan body)",
  "scope_component_ids": ["cmp_body"],
  "confidence_score": 0.86,
  "rationale": "Food-contact component tested; method and LOD/LOQ documented.",
  "evidence_ids": ["ev_9001"],
  "unknowns": ["Handle material not tested"]
}
```

**Response 201:**
```json
{
  "data": {
    "verification_id": "ver_778",
    "product_id": "prd_abc123",
    "tier": 3,
    "status": "active",
    "created_at": "2026-01-27T10:00:00Z"
  }
}
```

**Response 400:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tier 3 requires at least one lab report evidence object.",
    "field": "evidence_ids"
  }
}
```

---

### 2.3 Evidence Service

#### GET /api/v1/evidence/{evidence_id}
Get evidence object metadata.

**Response 200:**
```json
{
  "data": {
    "id": "ev_9001",
    "type": "lab_report",
    "source": "Brand submission",
    "lab_name": "Example Lab Inc.",
    "accreditation": "ISO 17025",
    "method": "LC-MS/MS after extraction",
    "method_reference": "EPA 533",
    "analyte_list_ref": "panel_v1_40pfas",
    "analyte_count": 40,
    "lod_loq": {
      "lod_ng_g": 1.0,
      "loq_ng_g": 3.0
    },
    "sample_scope": {
      "units_tested": 1,
      "lots_tested": 1,
      "component_ids": ["cmp_body"],
      "component_names": ["Pan body"]
    },
    "result_summary": "All 40 PFAS analytes below detection limit",
    "collection_date": "2025-11-01",
    "report_date": "2025-11-08",
    "received_date": "2025-11-10",
    "artifact_url": "/api/v1/evidence/ev_9001/artifact",
    "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb924...",
    "expires_at": "2027-11-10",
    "created_at": "2025-11-10T09:30:00Z"
  }
}
```

---

#### GET /api/v1/evidence/{evidence_id}/artifact
Stream evidence artifact (PDF/image).

**Response 200:**
```yaml
Headers:
  Content-Type: application/pdf
  Content-Disposition: inline; filename="ev_9001_lab_report.pdf"
  X-Evidence-Hash: e3b0c44298fc1c149afbf4c8996fb924...

Body: [Binary PDF content]
```

---

#### POST /api/v1/admin/evidence/upload
(Admin only) Upload new evidence artifact.

**Request:**
```yaml
Content-Type: multipart/form-data

Fields:
  file: (binary) - PDF or image file, max 10MB
  type: string - lab_report | brand_statement | policy_document | screenshot | correspondence
  product_id: string - Associated product
  source: string - brand_submission | retailer | user_report | internal
  metadata: JSON object - Type-specific metadata (see below)
```

**Metadata by type:**
```json
// lab_report
{
  "lab_name": "Example Lab Inc.",
  "accreditation": "ISO 17025",
  "method": "LC-MS/MS",
  "method_reference": "EPA 533",
  "analyte_list_ref": "panel_v1_40pfas",
  "lod_ng_g": 1.0,
  "loq_ng_g": 3.0,
  "sample_scope": {
    "units": 1,
    "lots": 1,
    "component_ids": ["cmp_body"]
  },
  "collection_date": "2025-11-01",
  "report_date": "2025-11-08"
}

// brand_statement
{
  "statement_text": "We confirm no PFAS are intentionally added...",
  "statement_date": "2025-10-01",
  "signatory": "VP of Quality"
}

// screenshot
{
  "source_url": "https://brand.com/materials-page",
  "captured_at": "2025-10-15T14:30:00Z",
  "description": "Materials page showing no PTFE"
}
```

**Response 201:**
```json
{
  "data": {
    "evidence_id": "ev_9003",
    "artifact_url": "/api/v1/evidence/ev_9003/artifact",
    "sha256_hash": "abc123...",
    "status": "pending_review",
    "created_at": "2026-01-27T10:30:00Z"
  }
}
```

---

### 2.4 Affiliate Links Service

#### GET /api/v1/products/{product_id}/affiliate-links
Get affiliate links for a product.

**Response 200:**
```json
{
  "data": {
    "product_id": "prd_abc123",
    "links": [
      {
        "retailer_id": "ret_amazon",
        "retailer_name": "Amazon",
        "retailer_icon": "amazon",
        "affiliate_url": "https://www.amazon.com/dp/B0XXXXX?tag=pfasfree-20&linkCode=...",
        "disclosure_required": true,
        "disclosure_text": "Affiliate link: We may earn a commission if you purchase through this link."
      },
      {
        "retailer_id": "ret_williams",
        "retailer_name": "Williams Sonoma",
        "retailer_icon": "williams-sonoma",
        "affiliate_url": "https://goto.target.com/...",
        "disclosure_required": true,
        "disclosure_text": "Affiliate link: We may earn a commission if you purchase through this link."
      }
    ],
    "grid_disclosure": "Affiliate links may appear in results."
  }
}
```

---

#### POST /api/v1/affiliate-clicks
Track affiliate link click.

**Request:**
```json
{
  "product_id": "prd_abc123",
  "retailer_id": "ret_amazon",
  "session_id": "sess_xyz",
  "referrer_page": "/cookware/skillets",
  "user_agent_hash": "abc123"
}
```

**Response 201:**
```json
{
  "data": {
    "click_id": "clk_789",
    "tracked": true
  }
}
```

---

### 2.5 Search Service

#### GET /api/v1/search
Search products.

**Request:**
```yaml
Query Parameters:
  q: string (required) - Search query
  category_id: string (optional) - Limit to category
  filters: string (optional) - JSON-encoded filter object
  sort: string (optional) - relevance (default) | tier_desc | name_asc
  page: integer (optional) - Default: 1
  limit: integer (optional) - Default: 24
```

**Response 200:**
```json
{
  "data": {
    "query": "stainless skillet",
    "total_count": 45,
    "results": [
      {
        "id": "prd_abc123",
        "name": "12-inch Stainless Steel Skillet",
        "brand_name": "Example Brand",
        "score": 12.5,
        "highlights": {
          "name": ["12-inch <em>Stainless</em> Steel <em>Skillet</em>"]
        },
        "verification_tier": 3
      }
    ],
    "facets": { },
    "suggestions": {
      "did_you_mean": null,
      "related_terms": ["stainless steel pan", "stainless frying pan"]
    },
    "education_banner": null
  }
}
```

**Education banner triggers:**
```json
// If query contains "PFOA-free"
{
  "education_banner": {
    "type": "pfoa_clarification",
    "title": "PFOA-free ≠ PFAS-free",
    "message": "PFOA is one of thousands of PFAS chemicals. A product labeled 'PFOA-free' may still contain other PFAS.",
    "link": "/education/pfoa-vs-pfas",
    "link_text": "Learn more about PFAS →"
  }
}
```

---

#### GET /api/v1/search/autocomplete
Autocomplete suggestions.

**Request:**
```yaml
Query Parameters:
  q: string (required) - Partial query (min 2 chars)
  limit: integer (optional) - Default: 5
```

**Response 200:**
```json
{
  "data": {
    "suggestions": [
      {"text": "stainless steel skillet", "type": "product"},
      {"text": "stainless steel pan", "type": "product"},
      {"text": "Staub", "type": "brand"}
    ]
  }
}
```

---

### 2.6 Reporting Service

#### POST /api/v1/reports
Submit product issue report.

**Request:**
```json
{
  "product_id": "prd_abc123",
  "issue_type": "suspected_pfas",
  "description": "I found lab results showing PTFE in the coating...",
  "evidence_urls": ["https://example.com/lab-result.pdf"],
  "contact_email": "user@example.com"
}
```

**Issue types:**
- `suspected_pfas` - Evidence of PFAS presence
- `materials_changed` - Manufacturer changed materials
- `listing_mismatch` - Info doesn't match retailer
- `counterfeit_risk` - Suspected counterfeit
- `other` - Other issue

**Response 201:**
```json
{
  "data": {
    "report_id": "rpt_456",
    "status": "submitted",
    "priority": "high",
    "sla_hours": 72,
    "message": "Thank you. We'll review within 72 hours for high-priority issues."
  }
}
```

---

#### GET /api/v1/admin/reports
(Admin only) List reports for review.

**Request:**
```yaml
Query Parameters:
  status: string - submitted | under_review | resolved | dismissed
  priority: string - high | normal | low
  page: integer
  limit: integer
```

**Response 200:**
```json
{
  "data": {
    "reports": [
      {
        "id": "rpt_456",
        "product_id": "prd_abc123",
        "product_name": "12-inch Skillet",
        "issue_type": "suspected_pfas",
        "status": "submitted",
        "priority": "high",
        "created_at": "2026-01-27T08:00:00Z",
        "sla_deadline": "2026-01-30T08:00:00Z"
      }
    ],
    "pagination": { }
  }
}
```

---

## 3. PostgreSQL Schema DDL

```sql
-- ============================================================
-- PFAS-Free Kitchen Platform Database Schema
-- Version: 1.0.0
-- PostgreSQL 15+
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE verification_tier AS ENUM ('0', '1', '2', '3', '4');
CREATE TYPE claim_type AS ENUM ('A', 'B', 'C');
CREATE TYPE evidence_type AS ENUM (
  'lab_report', 
  'brand_statement', 
  'policy_document', 
  'screenshot', 
  'correspondence'
);
CREATE TYPE evidence_source AS ENUM (
  'brand_submission', 
  'retailer', 
  'user_report', 
  'internal'
);
CREATE TYPE product_status AS ENUM (
  'draft', 
  'pending_review', 
  'under_review', 
  'published', 
  'suspended', 
  'archived'
);
CREATE TYPE report_status AS ENUM (
  'submitted', 
  'under_review', 
  'resolved', 
  'dismissed'
);
CREATE TYPE report_priority AS ENUM ('low', 'normal', 'high', 'critical');
CREATE TYPE report_issue_type AS ENUM (
  'suspected_pfas',
  'materials_changed',
  'listing_mismatch',
  'counterfeit_risk',
  'other'
);

-- ============================================================
-- BRANDS
-- ============================================================

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  website VARCHAR(500),
  country CHAR(2), -- ISO 3166-1 alpha-2
  logo_url VARCHAR(500),
  pfas_policy_url VARCHAR(500),
  pfas_policy_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_name ON brands(name);

-- ============================================================
-- RETAILERS & AFFILIATE PROGRAMS
-- ============================================================

CREATE TABLE affiliate_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  network VARCHAR(100), -- Amazon Associates, Impact, CJ, etc.
  terms_url VARCHAR(500),
  price_display_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  price_cache_max_hours INTEGER, -- NULL if price not allowed
  requires_api BOOLEAN NOT NULL DEFAULT FALSE,
  api_name VARCHAR(100), -- PA-API, etc.
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255) NOT NULL,
  affiliate_program_id UUID REFERENCES affiliate_programs(id),
  icon_name VARCHAR(50),
  priority INTEGER NOT NULL DEFAULT 100, -- lower = higher priority in lists
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_retailers_slug ON retailers(slug);
CREATE INDEX idx_retailers_affiliate_program ON retailers(affiliate_program_id);

CREATE TABLE affiliate_link_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  template VARCHAR(1000) NOT NULL, -- URL template with placeholders
  -- Placeholders: {product_id}, {asin}, {sku}, {affiliate_id}, {tracking_id}
  param_rules JSONB NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_link_templates_retailer ON affiliate_link_templates(retailer_id);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id),
  path_slugs VARCHAR(255)[] NOT NULL DEFAULT '{}', -- Full path for breadcrumbs
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(parent_id, slug)
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================================
-- MATERIALS & COATINGS
-- ============================================================

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  family VARCHAR(100), -- Metal, Glass, Ceramic, Silicone, Polymer, Composite
  pfas_risk_default BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_slug ON materials(slug);
CREATE INDEX idx_materials_family ON materials(family);

CREATE TABLE coatings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(100), -- none, ceramic_sol_gel, enamel, seasoning, unknown
  is_fluoropolymer BOOLEAN NOT NULL DEFAULT FALSE, -- PTFE, FEP, PFA
  pfas_risk_default BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_terms VARCHAR(255)[], -- Terms that indicate this coating
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coatings_slug ON coatings(slug);
CREATE INDEX idx_coatings_type ON coatings(type);
CREATE INDEX idx_coatings_fluoropolymer ON coatings(is_fluoropolymer);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  description TEXT,
  primary_image_url VARCHAR(500),
  status product_status NOT NULL DEFAULT 'draft',
  
  -- Denormalized summaries for fast reads
  material_summary VARCHAR(255),
  coating_summary VARCHAR(255),
  
  -- Category-specific features (JSONB for flexibility)
  features JSONB NOT NULL DEFAULT '{}',
  -- Example: {"induction_compatible": true, "oven_safe_temp_f": 500, "dishwasher_safe": true}
  
  -- Identifiers
  gtin VARCHAR(14), -- UPC/EAN
  mpn VARCHAR(100), -- Manufacturer part number
  
  -- Flags
  pfas_risk_flagged BOOLEAN NOT NULL DEFAULT FALSE, -- Triggered by risk terms
  requires_elevated_review BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_gtin ON products(gtin) WHERE gtin IS NOT NULL;
CREATE INDEX idx_products_mpn ON products(brand_id, mpn) WHERE mpn IS NOT NULL;
CREATE INDEX idx_products_risk_flagged ON products(pfas_risk_flagged) WHERE pfas_risk_flagged = TRUE;

-- Full-text search on product name and description
CREATE INDEX idx_products_search ON products 
  USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================
-- PRODUCT COMPONENTS (Food-contact critical)
-- ============================================================

CREATE TABLE product_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Pan body", "Handle", "Lid", "Gasket"
  food_contact BOOLEAN NOT NULL DEFAULT FALSE,
  material_id UUID REFERENCES materials(id),
  coating_id UUID REFERENCES coatings(id),
  pfas_risk_flag BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, name)
);

CREATE INDEX idx_components_product ON product_components(product_id);
CREATE INDEX idx_components_food_contact ON product_components(food_contact) WHERE food_contact = TRUE;
CREATE INDEX idx_components_material ON product_components(material_id);
CREATE INDEX idx_components_coating ON product_components(coating_id);

-- ============================================================
-- PRODUCT VARIANTS (Size, color, pack count)
-- ============================================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "12-inch", "Blue", "Set of 3"
  sku VARCHAR(100),
  gtin VARCHAR(14),
  asin VARCHAR(10), -- Amazon ASIN
  size_value DECIMAL(10,2),
  size_unit VARCHAR(20), -- inches, quarts, liters
  pack_count INTEGER DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, name)
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_asin ON product_variants(asin) WHERE asin IS NOT NULL;
CREATE INDEX idx_variants_gtin ON product_variants(gtin) WHERE gtin IS NOT NULL;

-- ============================================================
-- PRODUCT-RETAILER AVAILABILITY
-- ============================================================

CREATE TABLE product_retailer_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  external_id VARCHAR(255), -- Retailer's product ID / ASIN
  external_url VARCHAR(1000), -- Direct URL (for link generation)
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, variant_id, retailer_id)
);

CREATE INDEX idx_retailer_links_product ON product_retailer_links(product_id);
CREATE INDEX idx_retailer_links_retailer ON product_retailer_links(retailer_id);

-- ============================================================
-- EVIDENCE OBJECTS (Immutable)
-- ============================================================

CREATE TABLE evidence_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type evidence_type NOT NULL,
  source evidence_source NOT NULL,
  
  -- Storage
  storage_uri VARCHAR(500) NOT NULL, -- S3 URI
  sha256_hash CHAR(64) NOT NULL, -- Immutability verification
  file_size_bytes INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  original_filename VARCHAR(255),
  
  -- Common metadata
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- When evidence becomes stale
  
  -- Type-specific metadata (JSONB for flexibility)
  metadata JSONB NOT NULL DEFAULT '{}',
  /*
  Lab report metadata:
  {
    "lab_name": "...",
    "accreditation": "ISO 17025",
    "method": "LC-MS/MS",
    "method_reference": "EPA 533",
    "analyte_list_ref": "panel_v1_40pfas",
    "analyte_count": 40,
    "lod_ng_g": 1.0,
    "loq_ng_g": 3.0,
    "sample_scope": {"units": 1, "lots": 1, "component_ids": [...]},
    "collection_date": "2025-11-01",
    "report_date": "2025-11-08",
    "result_summary": "All below LOD"
  }
  
  Brand statement metadata:
  {
    "statement_text": "...",
    "statement_date": "...",
    "signatory": "..."
  }
  */
  
  -- Soft delete (never hard delete evidence)
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_type ON evidence_objects(type);
CREATE INDEX idx_evidence_source ON evidence_objects(source);
CREATE INDEX idx_evidence_expires ON evidence_objects(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_evidence_hash ON evidence_objects(sha256_hash);

-- ============================================================
-- PRODUCT-EVIDENCE JUNCTION
-- ============================================================

CREATE TABLE product_evidence (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_objects(id),
  component_id UUID REFERENCES product_components(id), -- NULL = applies to whole product
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID, -- Admin user ID
  notes TEXT,
  
  PRIMARY KEY (product_id, evidence_id)
);

CREATE INDEX idx_product_evidence_product ON product_evidence(product_id);
CREATE INDEX idx_product_evidence_evidence ON product_evidence(evidence_id);

-- ============================================================
-- CLAIMS (Brand/marketing claims to track)
-- ============================================================

CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  component_id UUID REFERENCES product_components(id),
  claim_type claim_type NOT NULL,
  claim_text TEXT NOT NULL, -- The actual claim statement
  source_url VARCHAR(500),
  source_type VARCHAR(50), -- website, packaging, email, press_release
  captured_at TIMESTAMPTZ NOT NULL,
  captured_by UUID, -- Admin user ID
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_id UUID REFERENCES evidence_objects(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_claims_product ON claims(product_id);
CREATE INDEX idx_claims_type ON claims(claim_type);

-- ============================================================
-- VERIFICATION STATUS (Current state)
-- ============================================================

CREATE TABLE verification_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE UNIQUE,
  tier verification_tier NOT NULL DEFAULT '0',
  claim_type claim_type,
  scope_text VARCHAR(500), -- Human-readable scope description
  scope_component_ids UUID[], -- Which components this verification covers
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  unknowns TEXT[], -- What's still unknown
  
  decision_date TIMESTAMPTZ,
  reviewer_id UUID, -- Admin user ID
  rationale TEXT,
  evidence_ids UUID[], -- Evidence objects supporting this decision
  
  next_review_due TIMESTAMPTZ,
  
  -- For products under review
  review_started_at TIMESTAMPTZ,
  review_lane VARCHAR(50), -- standard, high_risk
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_product ON verification_status(product_id);
CREATE INDEX idx_verification_tier ON verification_status(tier);
CREATE INDEX idx_verification_next_review ON verification_status(next_review_due) 
  WHERE next_review_due IS NOT NULL;

-- ============================================================
-- VERIFICATION HISTORY (Append-only changelog)
-- ============================================================

CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  
  from_tier verification_tier,
  to_tier verification_tier NOT NULL,
  from_claim_type claim_type,
  to_claim_type claim_type,
  
  reason TEXT NOT NULL,
  evidence_ids UUID[],
  reviewer_id UUID,
  
  -- Never delete, only append
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_history_product ON verification_history(product_id);
CREATE INDEX idx_verification_history_created ON verification_history(created_at);

-- ============================================================
-- USER REPORTS
-- ============================================================

CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  
  issue_type report_issue_type NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  contact_email VARCHAR(255),
  
  status report_status NOT NULL DEFAULT 'submitted',
  priority report_priority NOT NULL DEFAULT 'normal',
  
  -- Anonymous tracking
  session_id VARCHAR(64),
  ip_hash VARCHAR(64), -- Hashed for abuse detection, not identification
  user_agent_hash VARCHAR(64),
  
  sla_deadline TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_product ON user_reports(product_id);
CREATE INDEX idx_reports_status ON user_reports(status);
CREATE INDEX idx_reports_priority ON user_reports(priority);
CREATE INDEX idx_reports_sla ON user_reports(sla_deadline) WHERE status = 'submitted';

-- ============================================================
-- MODERATION ACTIONS
-- ============================================================

CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES user_reports(id),
  product_id UUID REFERENCES products(id),
  
  action VARCHAR(50) NOT NULL, -- review_started, resolved, dismissed, escalated, tier_changed
  actor_id UUID NOT NULL, -- Admin user ID
  notes TEXT,
  
  -- State changes
  old_status report_status,
  new_status report_status,
  old_tier verification_tier,
  new_tier verification_tier,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_report ON moderation_actions(report_id);
CREATE INDEX idx_moderation_product ON moderation_actions(product_id);
CREATE INDEX idx_moderation_actor ON moderation_actions(actor_id);
CREATE INDEX idx_moderation_created ON moderation_actions(created_at);

-- ============================================================
-- AFFILIATE CLICK TRACKING
-- ============================================================

CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  retailer_id UUID NOT NULL REFERENCES retailers(id),
  
  -- Anonymous tracking
  session_id VARCHAR(64),
  referrer_page VARCHAR(500),
  user_agent_hash VARCHAR(64),
  
  -- Bot detection
  is_bot BOOLEAN DEFAULT FALSE,
  bot_detection_reason VARCHAR(100),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioned by month for performance
CREATE INDEX idx_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX idx_clicks_retailer ON affiliate_clicks(retailer_id);
CREATE INDEX idx_clicks_created ON affiliate_clicks(created_at);
CREATE INDEX idx_clicks_session ON affiliate_clicks(session_id);

-- ============================================================
-- AUDIT LOG (Append-only, immutable)
-- ============================================================

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY, -- Sequential for ordering guarantee
  
  -- Actor
  actor_type VARCHAR(20) NOT NULL, -- system, admin, api, scheduler
  actor_id UUID, -- NULL for system actions
  actor_ip_hash VARCHAR(64),
  
  -- Action
  action VARCHAR(100) NOT NULL,
  -- Examples: product.created, product.published, verification.decided,
  --           evidence.uploaded, report.resolved, admin.login
  
  -- Target
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Change details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- Additional context
  
  -- Tamper evidence
  request_id VARCHAR(64),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Immutability: No UPDATE or DELETE triggers allowed
-- Periodic signing: Hash chain computed offline

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_actor ON audit_log(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- Partition by month for large-scale deployment
-- CREATE TABLE audit_log_2026_01 PARTITION OF audit_log
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- ============================================================
-- ANALYTE PANELS (Reference data for lab reports)
-- ============================================================

CREATE TABLE analyte_panels (
  id VARCHAR(50) PRIMARY KEY, -- panel_v1_40pfas
  name VARCHAR(255) NOT NULL,
  description TEXT,
  analyte_count INTEGER NOT NULL,
  analytes JSONB NOT NULL, -- Array of {cas_number, name, abbreviation}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADMIN USERS (Minimal - integrate with auth provider)
-- ============================================================

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- super_admin, reviewer, editor, viewer
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VIEWS
-- ============================================================

-- Published products with verification
CREATE VIEW v_published_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.description,
  p.primary_image_url,
  p.material_summary,
  p.coating_summary,
  p.features,
  p.published_at,
  b.id AS brand_id,
  b.name AS brand_name,
  b.slug AS brand_slug,
  c.id AS category_id,
  c.name AS category_name,
  c.path_slugs AS category_path,
  vs.tier,
  vs.claim_type,
  vs.scope_text,
  vs.confidence_score,
  vs.unknowns,
  vs.decision_date,
  COALESCE(array_length(vs.evidence_ids, 1), 0) AS evidence_count
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN verification_status vs ON p.id = vs.product_id
WHERE p.status = 'published';

-- Products needing review
CREATE VIEW v_review_queue AS
SELECT 
  p.id,
  p.name,
  p.slug,
  b.name AS brand_name,
  c.name AS category_name,
  p.status,
  p.pfas_risk_flagged,
  p.requires_elevated_review,
  vs.tier,
  vs.review_lane,
  vs.review_started_at,
  p.created_at,
  p.updated_at
FROM products p
JOIN brands b ON p.brand_id = b.id
JOIN categories c ON p.category_id = c.id
LEFT JOIN verification_status vs ON p.id = vs.product_id
WHERE p.status IN ('pending_review', 'under_review')
ORDER BY 
  p.requires_elevated_review DESC,
  p.pfas_risk_flagged DESC,
  p.created_at ASC;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_verification_updated BEFORE UPDATE ON verification_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON user_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Prevent evidence deletion (soft delete only)
CREATE OR REPLACE FUNCTION prevent_evidence_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Evidence objects cannot be deleted. Use soft delete (deleted_at) instead.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_evidence_no_delete BEFORE DELETE ON evidence_objects
  FOR EACH ROW EXECUTE FUNCTION prevent_evidence_hard_delete();

-- Prevent audit log modifications
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log is immutable. No updates or deletes allowed.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ============================================================
-- SEED DATA: Core materials and coatings
-- ============================================================

INSERT INTO materials (id, name, slug, family, pfas_risk_default, notes) VALUES
  (uuid_generate_v4(), 'Stainless Steel', 'stainless-steel', 'Metal', FALSE, '18/10 or 18/8 typically'),
  (uuid_generate_v4(), 'Cast Iron', 'cast-iron', 'Metal', FALSE, 'Bare or enameled'),
  (uuid_generate_v4(), 'Carbon Steel', 'carbon-steel', 'Metal', FALSE, 'Requires seasoning'),
  (uuid_generate_v4(), 'Aluminum', 'aluminum', 'Metal', FALSE, 'Often anodized or coated'),
  (uuid_generate_v4(), 'Copper', 'copper', 'Metal', FALSE, 'Usually lined'),
  (uuid_generate_v4(), 'Borosilicate Glass', 'borosilicate-glass', 'Glass', FALSE, 'Pyrex-type'),
  (uuid_generate_v4(), 'Tempered Glass', 'tempered-glass', 'Glass', FALSE, 'For lids'),
  (uuid_generate_v4(), 'Ceramic', 'ceramic', 'Ceramic', FALSE, 'Stoneware/porcelain'),
  (uuid_generate_v4(), 'Silicone', 'silicone', 'Polymer', FALSE, 'Food-grade silicone'),
  (uuid_generate_v4(), 'Wood', 'wood', 'Natural', FALSE, 'Handles, utensils'),
  (uuid_generate_v4(), 'Bamboo', 'bamboo', 'Natural', FALSE, 'Handles, utensils');

INSERT INTO coatings (id, name, slug, type, is_fluoropolymer, pfas_risk_default, marketing_terms, notes) VALUES
  (uuid_generate_v4(), 'None (Uncoated)', 'none', 'none', FALSE, FALSE, ARRAY['uncoated', 'bare'], 'No coating applied'),
  (uuid_generate_v4(), 'PTFE (Teflon)', 'ptfe', 'fluoropolymer', TRUE, TRUE, ARRAY['Teflon', 'PTFE', 'nonstick'], 'EXCLUDED from PFAS-free catalog'),
  (uuid_generate_v4(), 'FEP', 'fep', 'fluoropolymer', TRUE, TRUE, ARRAY['FEP'], 'EXCLUDED from PFAS-free catalog'),
  (uuid_generate_v4(), 'PFA', 'pfa', 'fluoropolymer', TRUE, TRUE, ARRAY['PFA'], 'EXCLUDED from PFAS-free catalog'),
  (uuid_generate_v4(), 'Ceramic Sol-Gel', 'ceramic-sol-gel', 'ceramic_sol_gel', FALSE, FALSE, ARRAY['ceramic nonstick', 'ceramic coating'], 'Requires verification - chemistry varies'),
  (uuid_generate_v4(), 'Enamel', 'enamel', 'enamel', FALSE, FALSE, ARRAY['enamel', 'porcelain enamel', 'vitreous enamel'], 'Glass-based coating'),
  (uuid_generate_v4(), 'Seasoning', 'seasoning', 'seasoning', FALSE, FALSE, ARRAY['pre-seasoned', 'seasoned'], 'Polymerized oil layer'),
  (uuid_generate_v4(), 'Anodized', 'anodized', 'anodized', FALSE, FALSE, ARRAY['hard-anodized', 'anodized'], 'Electrochemical oxidation'),
  (uuid_generate_v4(), 'Unknown', 'unknown', 'unknown', FALSE, TRUE, ARRAY[]::VARCHAR[], 'Coating type not determined');

-- ============================================================
-- SEED DATA: Categories
-- ============================================================

INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cookware', 'cookware', NULL, ARRAY['cookware'], 1),
  ('22222222-2222-2222-2222-222222222222', 'Bakeware', 'bakeware', NULL, ARRAY['bakeware'], 2),
  ('33333333-3333-3333-3333-333333333333', 'Storage', 'storage', NULL, ARRAY['storage'], 3),
  ('44444444-4444-4444-4444-444444444444', 'Utensils & Tools', 'utensils-tools', NULL, ARRAY['utensils-tools'], 4),
  ('55555555-5555-5555-5555-555555555555', 'Appliance Accessories', 'appliance-accessories', NULL, ARRAY['appliance-accessories'], 5);

-- Cookware subcategories
INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Skillets & Frying Pans', 'skillets-frying-pans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'skillets-frying-pans'], 1),
  (uuid_generate_v4(), 'Saucepans', 'saucepans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'saucepans'], 2),
  (uuid_generate_v4(), 'Stock Pots & Dutch Ovens', 'stock-pots-dutch-ovens', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'stock-pots-dutch-ovens'], 3),
  (uuid_generate_v4(), 'Sauté Pans', 'saute-pans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'saute-pans'], 4),
  (uuid_generate_v4(), 'Woks', 'woks', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'woks'], 5),
  (uuid_generate_v4(), 'Griddles & Grill Pans', 'griddles-grill-pans', '11111111-1111-1111-1111-111111111111', ARRAY['cookware', 'griddles-grill-pans'], 6);

-- Bakeware subcategories
INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Sheet Pans & Baking Sheets', 'sheet-pans-baking-sheets', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'sheet-pans-baking-sheets'], 1),
  (uuid_generate_v4(), 'Cake Pans', 'cake-pans', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'cake-pans'], 2),
  (uuid_generate_v4(), 'Muffin & Cupcake Pans', 'muffin-cupcake-pans', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'muffin-cupcake-pans'], 3),
  (uuid_generate_v4(), 'Loaf Pans', 'loaf-pans', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'loaf-pans'], 4),
  (uuid_generate_v4(), 'Baking Dishes', 'baking-dishes', '22222222-2222-2222-2222-222222222222', ARRAY['bakeware', 'baking-dishes'], 5);

-- Storage subcategories  
INSERT INTO categories (id, name, slug, parent_id, path_slugs, sort_order) VALUES
  (uuid_generate_v4(), 'Glass Containers', 'glass-containers', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'glass-containers'], 1),
  (uuid_generate_v4(), 'Stainless Containers', 'stainless-containers', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'stainless-containers'], 2),
  (uuid_generate_v4(), 'Silicone Bags & Wraps', 'silicone-bags-wraps', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'silicone-bags-wraps'], 3),
  (uuid_generate_v4(), 'Lunch Boxes', 'lunch-boxes', '33333333-3333-3333-3333-333333333333', ARRAY['storage', 'lunch-boxes'], 4);
```

---

## 4. Search Index Mappings (OpenSearch)

### 4.1 Products Index

```json
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "product_synonyms", "english_stemmer"]
        },
        "product_search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "product_synonyms"]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding", "autocomplete_filter"]
        }
      },
      "filter": {
        "product_synonyms": {
          "type": "synonym",
          "synonyms": [
            "skillet, frying pan, frypan",
            "dutch oven, cocotte, french oven",
            "sheet pan, baking sheet, cookie sheet",
            "saucepan, sauce pan, pot",
            "stainless, stainless steel",
            "cast iron, castiron",
            "nonstick, non-stick, non stick"
          ]
        },
        "english_stemmer": {
          "type": "stemmer",
          "language": "english"
        },
        "autocomplete_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 20
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "product_analyzer",
        "search_analyzer": "product_search_analyzer",
        "fields": {
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "standard"
          },
          "exact": {
            "type": "keyword",
            "normalizer": "lowercase"
          }
        }
      },
      "slug": { "type": "keyword" },
      "description": {
        "type": "text",
        "analyzer": "product_analyzer",
        "search_analyzer": "product_search_analyzer"
      },
      "brand": {
        "properties": {
          "id": { "type": "keyword" },
          "name": {
            "type": "text",
            "analyzer": "product_analyzer",
            "fields": {
              "keyword": { "type": "keyword" },
              "autocomplete": {
                "type": "text",
                "analyzer": "autocomplete_analyzer"
              }
            }
          },
          "slug": { "type": "keyword" }
        }
      },
      "category": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "path": { "type": "keyword" },
          "slug": { "type": "keyword" }
        }
      },
      "primary_image_url": { "type": "keyword", "index": false },
      
      "material_summary": {
        "type": "text",
        "analyzer": "product_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "coating_summary": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      
      "components": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "food_contact": { "type": "boolean" },
          "material_slug": { "type": "keyword" },
          "coating_slug": { "type": "keyword" },
          "pfas_risk_flag": { "type": "boolean" }
        }
      },
      
      "verification": {
        "properties": {
          "tier": { "type": "integer" },
          "tier_label": { "type": "keyword" },
          "claim_type": { "type": "keyword" },
          "has_evidence": { "type": "boolean" },
          "evidence_count": { "type": "integer" },
          "confidence_score": { "type": "float" },
          "decision_date": { "type": "date" }
        }
      },
      
      "retailers": {
        "type": "nested",
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" }
        }
      },
      
      "features": {
        "properties": {
          "induction_compatible": { "type": "boolean" },
          "oven_safe_temp_f": { "type": "integer" },
          "dishwasher_safe": { "type": "boolean" },
          "metal_utensil_safe": { "type": "boolean" },
          "microwave_safe": { "type": "boolean" },
          "freezer_safe": { "type": "boolean" }
        }
      },
      
      "facets": {
        "properties": {
          "material": { "type": "keyword" },
          "coating_type": { "type": "keyword" },
          "food_contact_surface": { "type": "keyword" }
        }
      },
      
      "status": { "type": "keyword" },
      "published_at": { "type": "date" },
      "updated_at": { "type": "date" },
      
      "sort_boosts": {
        "properties": {
          "tier_boost": { "type": "float" },
          "freshness_boost": { "type": "float" },
          "completeness_penalty": { "type": "float" }
        }
      }
    }
  }
}
```

### 4.2 Ranking Formula

```
final_score = base_relevance * trust_boost * freshness_boost * completeness_factor

where:
  base_relevance = BM25(query, [name^3, brand.name^2, description^1, material_summary^1.5])
  
  trust_boost = {
    tier 4: 2.0
    tier 3: 1.8
    tier 2: 1.4
    tier 1: 1.2
    tier 0: 0.8
  }
  
  freshness_boost = max(0.5, 1.0 - (days_since_decision / 730))  // Decay over 2 years
  
  completeness_factor = {
    all_components_verified: 1.0
    some_unknowns: 0.9
    many_unknowns: 0.7
  }
```

### 4.3 Facet Aggregations

```json
{
  "aggs": {
    "tier_facet": {
      "terms": { "field": "verification.tier", "size": 5 }
    },
    "material_facet": {
      "terms": { "field": "facets.material", "size": 20 }
    },
    "coating_type_facet": {
      "terms": { "field": "facets.coating_type", "size": 10 }
    },
    "food_contact_surface_facet": {
      "terms": { "field": "facets.food_contact_surface", "size": 10 }
    },
    "induction_facet": {
      "terms": { "field": "features.induction_compatible" }
    },
    "oven_temp_ranges": {
      "range": {
        "field": "features.oven_safe_temp_f",
        "ranges": [
          { "key": "up_to_400", "to": 401 },
          { "key": "400_to_500", "from": 400, "to": 501 },
          { "key": "500_plus", "from": 500 }
        ]
      }
    },
    "retailer_facet": {
      "nested": { "path": "retailers" },
      "aggs": {
        "retailer_names": {
          "terms": { "field": "retailers.id", "size": 20 }
        }
      }
    },
    "category_facet": {
      "terms": { "field": "category.id", "size": 50 }
    }
  }
}
```

---

## 5. Workflow State Machines

### 5.1 Product Ingestion Workflow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │ Product data received (feed/API/manual)
       ▼
┌─────────────┐
│  INGESTED   │ State: draft
└──────┬──────┘
       │ Trigger: enrichment_requested
       ▼
┌─────────────────────────────────────────────────┐
│              ENRICHMENT                          │
│  - NLP extraction (materials, features)          │
│  - PFAS risk term detection                      │
│  - Component model creation                      │
│  - Image validation                              │
└──────┬──────────────────────────────────────────┘
       │
       ├─── Risk terms detected? ───┐
       │         NO                  │ YES
       ▼                             ▼
┌─────────────┐             ┌─────────────────┐
│  ENRICHED   │             │ HIGH_RISK_FLAG  │
│ (standard)  │             │ requires_elevated│
└──────┬──────┘             └────────┬────────┘
       │                             │
       └──────────┬──────────────────┘
                  │ Trigger: review_requested
                  ▼
         ┌───────────────┐
         │PENDING_REVIEW │ State: pending_review
         └───────┬───────┘
                 │ Reviewer picks up
                 ▼
         ┌───────────────┐
         │ UNDER_REVIEW  │ State: under_review
         │               │ review_lane: standard | high_risk
         └───────┬───────┘
                 │
       ┌─────────┴─────────┐
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  APPROVED   │     │  REJECTED   │
│  (Tier 1+)  │     │  (Tier 0)   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  PUBLISHED  │     │  ARCHIVED   │
│  (indexed)  │     │  (hidden)   │
└─────────────┘     └─────────────┘
```

### 5.2 Verification Decision Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│                    VERIFICATION DECISION                            │
└────────────────────────────────────────────────────────────────────┘

Input: Product ID, Evidence IDs, Reviewer ID

Step 1: LOAD CONTEXT
  ├── Fetch product with components
  ├── Fetch all linked evidence objects
  ├── Fetch any existing verification status
  └── Fetch any pending user reports

Step 2: VALIDATE TIER REQUIREMENTS
  │
  ├── Tier 1 Requirements:
  │   └── [x] Brand attestation evidence exists
  │   └── [x] Attestation < 12 months old
  │   └── [x] Attestation specifies components or "all"
  │
  ├── Tier 2 Requirements (includes Tier 1):
  │   └── [x] Component model complete
  │   └── [x] All food-contact materials documented
  │   └── [x] Risk term scan: no unresolved flags
  │   └── [x] Policy document or detailed attestation
  │
  ├── Tier 3 Requirements (includes Tier 2):
  │   └── [x] Lab report evidence exists
  │   └── [x] Lab report covers food-contact components
  │   └── [x] Method + LOD/LOQ documented
  │   └── [x] Lab report < 24 months old
  │
  └── Tier 4 Requirements (includes Tier 3):
      └── [x] Revalidation schedule set
      └── [x] Drift monitoring configured
      └── [x] Previous verification history exists

Step 3: CALCULATE CONFIDENCE
  confidence = base_confidence * evidence_quality * sample_coverage
  
  base_confidence = {
    tier_1: 0.5,
    tier_2: 0.7,
    tier_3: 0.85,
    tier_4: 0.95
  }
  
  evidence_quality = {
    lab_report_present: +0.1,
    multiple_evidence: +0.05,
    recent_evidence: +0.05
  }
  
  sample_coverage = {
    all_food_contact_covered: 1.0,
    some_components_missing: 0.9,
    single_unit_single_lot: 0.85
  }

Step 4: GENERATE UNKNOWNS
  For each component:
    if not covered by evidence:
      add to unknowns: "{component_name} not independently verified"
  
  If sample scope limited:
    add to unknowns: "Testing based on {n} unit(s) from {m} lot(s)"
  
  If screening only (TOF/TF):
    add to unknowns: "Screening method used; individual PFAS not identified"

Step 5: PERSIST DECISION
  ├── Create verification_status record
  ├── Create verification_history record
  ├── Update product status if needed
  ├── Write audit_log entry
  └── Trigger search index update

Step 6: SCHEDULE FOLLOW-UPS
  if tier >= 3:
    schedule revalidation check at (decision_date + 24 months)
  if tier == 4:
    schedule drift monitoring task
```

### 5.3 User Report Workflow

```
┌─────────────┐
│  SUBMITTED  │ Priority assigned by issue_type
└──────┬──────┘
       │
       ├─── suspected_pfas ──→ priority: HIGH, SLA: 72h
       ├─── materials_changed ──→ priority: HIGH, SLA: 72h
       ├─── listing_mismatch ──→ priority: NORMAL, SLA: 7d
       ├─── counterfeit_risk ──→ priority: HIGH, SLA: 72h
       └─── other ──→ priority: NORMAL, SLA: 7d
       │
       ▼
┌───────────────┐
│ UNDER_REVIEW  │ Assigned to reviewer
└───────┬───────┘
        │
        ├─── Evidence confirms issue?
        │
   YES ─┤                      ├─ NO
        │                      │
        ▼                      ▼
┌───────────────┐      ┌───────────────┐
│ TAKE_ACTION   │      │   DISMISSED   │
│               │      │  (with reason)│
└───────┬───────┘      └───────────────┘
        │
        ├─── Downgrade tier to 0/"Under review"
        ├─── Update product status
        ├─── Create public changelog entry
        ├─── Notify user if email provided
        │
        ▼
┌───────────────┐
│   RESOLVED    │
└───────────────┘
```

### 5.4 Queue Topics

| Topic | Purpose | Publishers | Consumers |
|-------|---------|------------|-----------|
| `product.ingested` | New product data received | Feed workers, API | Enrichment service |
| `product.enriched` | Enrichment complete | Enrichment service | Review queue |
| `product.published` | Product approved and live | Verification service | Search indexer, Analytics |
| `product.suspended` | Product removed from catalog | Verification service | Search indexer |
| `evidence.uploaded` | New evidence artifact | Evidence service | Verification service |
| `evidence.expired` | Evidence past expiry | Scheduler | Verification service |
| `verification.requested` | Review needed | Product service | Review queue |
| `verification.completed` | Decision made | Verification service | Product service, Search indexer |
| `report.submitted` | User submitted report | API | Report queue |
| `report.resolved` | Report handled | Report service | Analytics, Notifications |
| `drift.detected` | Product page changed | Drift monitor | Verification service |
| `click.tracked` | Affiliate click recorded | API | Analytics |

---

## 6. Error Handling Strategy

### 6.1 API Error Codes

| Code | HTTP Status | Meaning | Client Action |
|------|-------------|---------|---------------|
| `VALIDATION_ERROR` | 400 | Invalid input | Fix input and retry |
| `NOT_FOUND` | 404 | Resource doesn't exist | Check ID/slug |
| `CONFLICT` | 409 | State conflict | Refresh and retry |
| `RATE_LIMITED` | 429 | Too many requests | Back off and retry |
| `INTERNAL_ERROR` | 500 | Server error | Retry with backoff |
| `SERVICE_UNAVAILABLE` | 503 | Dependency down | Retry later |

### 6.2 Circuit Breaker Configuration

```yaml
services:
  search:
    failure_threshold: 5
    success_threshold: 3
    timeout_ms: 2000
    half_open_requests: 3
    fallback: "Return cached results or empty with error message"
  
  affiliate_links:
    failure_threshold: 10
    success_threshold: 5
    timeout_ms: 3000
    fallback: "Return plain retailer URLs without affiliate params"
  
  evidence_storage:
    failure_threshold: 3
    success_threshold: 2
    timeout_ms: 5000
    fallback: "Show 'Document temporarily unavailable' message"
```

### 6.3 Graceful Degradation

| Component Failure | User Impact | Fallback |
|-------------------|-------------|----------|
| Search service down | Cannot search | Show category browse, display banner |
| Evidence storage down | Cannot view PDFs | Show metadata, "temporarily unavailable" |
| Affiliate service down | Links don't work | Show plain retailer links |
| Database read replica down | Slow responses | Route to primary (monitor load) |
| CDN edge down | Slow static assets | Serve from origin |
