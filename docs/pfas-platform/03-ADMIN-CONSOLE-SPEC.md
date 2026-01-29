# PFAS-Free Kitchen Platform - Admin Console Specification

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Status:** Implementation-Ready

---

## 1. Overview

### 1.1 Purpose
The Admin Console enables internal teams to:
- Review and verify products against PFAS-free criteria
- Upload and manage evidence artifacts
- Process user reports
- Manage catalog content (brands, retailers, categories)
- Monitor platform health and data quality

### 1.2 User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| `viewer` | Read-only access to all data | QA, stakeholders |
| `editor` | Create/edit products, brands, categories | Content team |
| `reviewer` | All editor + verification decisions | Verification team |
| `super_admin` | All permissions + user management | Platform admins |

### 1.3 Access Control
- Authentication: SSO via Google Workspace / Okta
- Session timeout: 8 hours
- MFA: Required for `reviewer` and `super_admin`
- Audit: All actions logged with user ID

---

## 2. Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] PFAS-Free Kitchen Admin                    [User ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐                                            │
│  │ Dashboard   │                                            │
│  ├─────────────┤                                            │
│  │ Review      │ ← Badge: pending count                     │
│  │  └ Queue    │                                            │
│  │  └ Reports  │ ← Badge: unresolved count                  │
│  ├─────────────┤                                            │
│  │ Catalog     │                                            │
│  │  └ Products │                                            │
│  │  └ Brands   │                                            │
│  │  └ Categories│                                           │
│  │  └ Retailers│                                            │
│  ├─────────────┤                                            │
│  │ Evidence    │                                            │
│  │  └ Library  │                                            │
│  │  └ Upload   │                                            │
│  ├─────────────┤                                            │
│  │ Analytics   │                                            │
│  ├─────────────┤                                            │
│  │ Settings    │ (super_admin only)                         │
│  └─────────────┘                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Dashboard                                              Last updated: now │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ REVIEW QUEUE │  │ OPEN REPORTS │  │ PUBLISHED    │  │ COVERAGE     ││
│  │     23       │  │      7       │  │    487       │  │    82%       ││
│  │  ↑5 today    │  │  3 high-pri  │  │  +12 week    │  │  Tier 1+     ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                         │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  │ VERIFICATION TIER DISTRIBUTION  │  │ SLA STATUS                      │
│  │                                 │  │                                 │
│  │ Tier 4 ████░░░░░░░░░░ 13 (3%)   │  │ On track:     18 ✓             │
│  │ Tier 3 ██████████░░░░ 52 (11%)  │  │ At risk:       3 ⚠             │
│  │ Tier 2 ████████████░░ 98 (20%)  │  │ Breached:      2 ✗             │
│  │ Tier 1 ██████████████ 212 (44%) │  │                                 │
│  │ Tier 0 ████████░░░░░░ 112 (23%) │  │ Avg resolution: 2.3 days        │
│  │                                 │  │                                 │
│  └─────────────────────────────────┘  └─────────────────────────────────┘
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ RECENT ACTIVITY                                                     ││
│  │                                                                     ││
│  │ • Jane D. verified "All-Clad 12-inch Skillet" as Tier 3    2m ago  ││
│  │ • System flagged "Brand X Pan" for risk terms              15m ago ││
│  │ • User reported "Listing mismatch" on "GreenPan..."        1h ago  ││
│  │ • Mike S. uploaded lab report for "Lodge Cast Iron"        2h ago  ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Metric Definitions

| Metric | Calculation | Target |
|--------|-------------|--------|
| Review Queue | Products with status `pending_review` or `under_review` | <50 |
| Open Reports | Reports with status `submitted` or `under_review` | <20 |
| Published | Products with status `published` | Growing |
| Coverage | % of published products at Tier 1+ | ≥80% |
| SLA On Track | Reports where `now < sla_deadline` | 100% |
| SLA Breached | Reports where `resolved_at > sla_deadline` or `now > sla_deadline` and unresolved | 0 |

---

## 4. Review Queue

### 4.1 Queue List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Review Queue                                     [Filter ▼] [Sort ▼]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Filters ──────────────────────────────────────────────────────────┐ │
│ │ Lane: [All] [Standard] [High-Risk]                                 │ │
│ │ Category: [All ▼]  Status: [Pending] [Under Review]               │ │
│ │ Assigned: [Unassigned] [Assigned to me] [All]                      │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ □ │ Product                    │ Brand    │ Category │ Lane   │ Age ││
│ ├───┼────────────────────────────┼──────────┼──────────┼────────┼─────┤│
│ │   │ ⚠ GreenPan Reserve 10"    │ GreenPan │ Cookware │ HIGH   │ 2d  ││
│ │   │   "ceramic nonstick" detected                                   ││
│ ├───┼────────────────────────────┼──────────┼──────────┼────────┼─────┤│
│ │   │ ⚠ AirFry Liner Pro        │ BrandX   │ Appl.Acc │ HIGH   │ 1d  ││
│ │   │   "nonstick", "PTFE-free" detected                              ││
│ ├───┼────────────────────────────┼──────────┼──────────┼────────┼─────┤│
│ │   │ Lodge 12" Cast Iron        │ Lodge    │ Cookware │ STANDARD│ 3d ││
│ │   │   No risk terms                                                 ││
│ ├───┼────────────────────────────┼──────────┼──────────┼────────┼─────┤│
│ │   │ Pyrex 8-piece Set          │ Pyrex    │ Storage  │ STANDARD│ 4d ││
│ │   │   No risk terms                                                 ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Showing 23 items │ [◀ Prev] Page 1 of 3 [Next ▶]                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Risk Term Indicators

| Indicator | Meaning | Action Required |
|-----------|---------|-----------------|
| ⚠ HIGH | Contains high-risk terms (nonstick, ceramic nonstick, PTFE-free) | Elevated review path |
| ○ STANDARD | No risk terms detected | Standard review |
| 🔄 RE-REVIEW | Previously verified, evidence expired or report received | Re-verification |

### 4.3 Queue Item Actions

| Action | Description | Available When |
|--------|-------------|----------------|
| Assign to me | Take ownership of review | Unassigned |
| Unassign | Release back to queue | Assigned to current user |
| Start review | Open review interface | Assigned to current user |
| Escalate | Move to high-risk lane | Standard lane |
| Archive | Remove from queue (rejected) | Under review |

---

## 5. Product Review Interface

### 5.1 Review Screen Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Review: GreenPan Reserve 10" Skillet                    [Save Draft] [X]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Product Info ─────────────────────┐ ┌─ Risk Assessment ────────────┐│
│ │ Brand: GreenPan                    │ │ Lane: HIGH-RISK              ││
│ │ Category: Cookware > Skillets      │ │                              ││
│ │ Status: Under Review               │ │ Detected terms:              ││
│ │ Reviewer: Jane D. (you)            │ │ • "ceramic nonstick" ⚠       ││
│ │ Started: Jan 27, 2026 10:15 AM     │ │ • "PFOA-free" ⚠              ││
│ │                                    │ │ • "Thermolon coating"        ││
│ └────────────────────────────────────┘ └────────────────────────────────┘
│                                                                         │
│ ┌─ Component Model ────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ ┌────────────────────────────────────────────────────────────────┐  ││
│ │ │ Component      │ Food Contact │ Material       │ Coating       │  ││
│ │ ├────────────────┼──────────────┼────────────────┼───────────────┤  ││
│ │ │ Pan body       │ ✓ Yes        │ [Aluminum ▼]   │ [Ceramic ▼]   │  ││
│ │ │ Handle         │ ○ No         │ [Stainless ▼]  │ [None ▼]      │  ││
│ │ │ + Add component                                                │  ││
│ │ └────────────────────────────────────────────────────────────────┘  ││
│ │                                                                      ││
│ │ ⚠ Ceramic coating selected - requires clarification (see checklist) ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Evidence ───────────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ Linked Evidence:                                                     ││
│ │ ┌─────────────────────────────────────────────────────────────────┐ ││
│ │ │ 📄 Brand Statement - GreenPan PFAS Policy     Jan 2026  [View]  │ ││
│ │ │    "Our Thermolon coating contains no PFAS..."                  │ ││
│ │ │    Covers: Pan body coating                                     │ ││
│ │ └─────────────────────────────────────────────────────────────────┘ ││
│ │                                                                      ││
│ │ [+ Link existing evidence] [+ Upload new evidence]                   ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Verification Checklist ─────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ COOKWARE - CERAMIC NONSTICK CHECKLIST                               ││
│ │                                                                      ││
│ │ □ Coating chemistry clarified (sol-gel vs other)                    ││
│ │ □ Brand confirms no PFAS in coating formulation                     ││
│ │ □ Manufacturing location documented (if available)                   ││
│ │ □ Third-party test OR detailed technical specification              ││
│ │                                                                      ││
│ │ If any unchecked: Max tier = 1 (Brand Statement)                    ││
│ │ If all checked without lab test: Max tier = 2 (Policy Reviewed)     ││
│ │ If lab test available: Eligible for Tier 3                          ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Decision ───────────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ Verification Tier: [Select tier ▼]                                   ││
│ │                                                                      ││
│ │   ○ Tier 0 - Unknown (reject/incomplete)                            ││
│ │   ○ Tier 1 - Brand Statement                                        ││
│ │   ● Tier 2 - Policy Reviewed     ← Selected                         ││
│ │   ○ Tier 3 - Lab Tested                                             ││
│ │   ○ Tier 4 - Monitored                                              ││
│ │                                                                      ││
│ │ Claim Type: [A - No intentionally added PFAS ▼]                     ││
│ │                                                                      ││
│ │ Scope: [Pan body food-contact surface                    ]          ││
│ │                                                                      ││
│ │ Unknowns (what we couldn't verify):                                 ││
│ │ [Handle material not tested (non-food-contact)          ]           ││
│ │ [+ Add unknown]                                                      ││
│ │                                                                      ││
│ │ Rationale (required):                                                ││
│ │ ┌─────────────────────────────────────────────────────────────────┐ ││
│ │ │ Brand policy document confirms Thermolon ceramic coating        │ ││
│ │ │ contains no PFAS. Coating chemistry is documented sol-gel.      │ ││
│ │ │ No third-party lab test available. Elevated to Tier 2 based     │ ││
│ │ │ on detailed policy review and component documentation.          │ ││
│ │ └─────────────────────────────────────────────────────────────────┘ ││
│ │                                                                      ││
│ │ [Cancel] [Save as Draft]            [Reject & Archive] [Approve ✓]  ││
│ └──────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tier Selection Validation

When reviewer selects a tier, system validates:

| Tier | Validation Rules | Error if Missing |
|------|------------------|------------------|
| Tier 1 | Brand attestation evidence linked | "Link brand statement or attestation evidence" |
| Tier 2 | Tier 1 + All food-contact components have material/coating | "Complete component model for food-contact surfaces" |
| Tier 2 | Tier 1 + Risk terms resolved or explained | "Address flagged risk terms in rationale" |
| Tier 3 | Tier 2 + Lab report evidence linked | "Link third-party lab report" |
| Tier 3 | Lab report covers food-contact components | "Lab report must cover: [list]" |
| Tier 3 | Lab report < 24 months old | "Lab report expired. Request updated test." |
| Tier 4 | Tier 3 + Previous verification exists | "Tier 4 requires verification history" |
| Tier 4 | Revalidation schedule set | "Set next review date" |

### 5.3 Category-Specific Checklists

#### Cookware Checklist

```
COOKWARE VERIFICATION CHECKLIST

General (all cookware):
□ Food-contact surface material identified
□ Food-contact coating identified (or confirmed "none")
□ Handle material documented
□ If lid included: lid material documented

Risk-term specific:

If "nonstick" detected:
□ Coating type clarified (PTFE = REJECT, ceramic = proceed)
□ Brand confirms coating is PFAS-free
□ Coating brand name documented (e.g., Thermolon, GreenTek)

If "ceramic nonstick" detected:
□ Coating is sol-gel based (not PTFE with ceramic particles)
□ Brand provides technical specification or attestation
□ No PFAS in binder or primer layers confirmed

If "PFOA-free" detected:
□ Noted in rationale that PFOA-free ≠ PFAS-free
□ Asked brand to clarify full PFAS status
□ If only PFOA-free claim available: max Tier 1

If "seasoned" or "pre-seasoned" (cast iron/carbon steel):
□ Seasoning is oil-based (not chemical coating)
□ Brand confirms no additional coatings
```

#### Bakeware Checklist

```
BAKEWARE VERIFICATION CHECKLIST

General:
□ Base material identified (aluminum, steel, glass, ceramic)
□ Interior coating identified (or confirmed "none")
□ If nonstick: coating type clarified

Risk-term specific:

If "nonstick" detected:
□ Same as cookware nonstick checklist

If "silicone" bakeware:
□ Food-grade silicone confirmed
□ No fillers or unknown additives claimed
□ If brand is unfamiliar: request material certification
```

#### Storage Checklist

```
STORAGE VERIFICATION CHECKLIST

General:
□ Container body material identified
□ Lid material identified
□ Gasket/seal material identified (if applicable)

Risk-term specific:

If plastic components present:
□ Plastic type documented (PP, PE, etc.)
□ No PFAS-treated plastics

If "leak-proof" or "water-resistant":
□ Gasket material is silicone or rubber (not PFAS-treated)
□ No water-resistant coatings on food-contact surfaces
```

#### Utensils & Tools Checklist

```
UTENSILS & TOOLS VERIFICATION CHECKLIST

General:
□ Primary material identified (wood, silicone, stainless, nylon)
□ Handle material identified (if different)
□ Any coating identified

Risk-term specific:

If "nonstick" or coated:
□ Coating type clarified
□ If food-contact coating: same as cookware coating checklist

If "silicone":
□ Food-grade silicone confirmed
□ No internal reinforcement concerns (metal core OK)
```

#### Appliance Accessories Checklist

```
APPLIANCE ACCESSORIES VERIFICATION CHECKLIST

General:
□ Accessory type identified (liner, basket, mat, container)
□ Material identified
□ Intended use documented (air fryer, instant pot, etc.)

Risk-term specific:

If "air fryer liner" or "basket":
□ Material is silicone, stainless steel, or parchment
□ If "nonstick": coating type clarified (REJECT if PTFE)
□ If paper/parchment: confirm no grease-resistant treatment

If "baking mat":
□ Confirm silicone-based (not PTFE-coated fiberglass)
□ If fiberglass core: coating must be PTFE-free silicone

If "reusable liner":
□ Material specified
□ No "stain-resistant" or "water-repellent" treatments
```

---

## 6. Evidence Management

### 6.1 Evidence Library

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Evidence Library                                    [+ Upload New]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Filters ──────────────────────────────────────────────────────────┐ │
│ │ Type: [All] [Lab Reports] [Brand Statements] [Policy Docs] [Other] │ │
│ │ Source: [All ▼]  Linked: [All] [Linked] [Unlinked]                │ │
│ │ Status: [Active] [Expiring Soon] [Expired]                         │ │
│ │ Search: [________________________________] [🔍]                     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ Type        │ Source    │ Products  │ Received  │ Expires  │ Status ││
│ ├─────────────┼───────────┼───────────┼───────────┼──────────┼────────┤│
│ │ 🔬 Lab Rpt  │ Brand sub │ 3 linked  │ Nov 2025  │ Nov 2027 │ Active ││
│ │ Example Lab - 40 PFAS panel - All-Clad products                     ││
│ ├─────────────┼───────────┼───────────┼───────────┼──────────┼────────┤│
│ │ 📄 Brand St │ Brand sub │ 12 linked │ Jan 2026  │ Jan 2027 │ Active ││
│ │ GreenPan PFAS Policy Statement 2026                                 ││
│ ├─────────────┼───────────┼───────────┼───────────┼──────────┼────────┤│
│ │ 📋 Policy   │ Internal  │ 5 linked  │ Oct 2025  │ -        │ Active ││
│ │ Lodge Cast Iron Materials Specification                              ││
│ ├─────────────┼───────────┼───────────┼───────────┼──────────┼────────┤│
│ │ 🔬 Lab Rpt  │ Brand sub │ 1 linked  │ Dec 2023  │ Dec 2025 │ ⚠ EXP  ││
│ │ Old Brand Lab Report - EXPIRED                                       ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Showing 45 items │ [◀ Prev] Page 1 of 5 [Next ▶]                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Evidence Upload Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Upload New Evidence                                               [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Step 1: File Upload ────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │  ┌─────────────────────────────────────────────────────────────┐    ││
│ │  │                                                             │    ││
│ │  │     📄 Drag and drop file here or click to browse          │    ││
│ │  │                                                             │    ││
│ │  │     Accepted: PDF, PNG, JPG (max 10MB)                      │    ││
│ │  │                                                             │    ││
│ │  └─────────────────────────────────────────────────────────────┘    ││
│ │                                                                      ││
│ │  ✓ File uploaded: all-clad-lab-report-2026.pdf (2.3 MB)             ││
│ │  ✓ SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca...    ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Step 2: Evidence Type ──────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ Type: [Lab Report ▼]                                                 ││
│ │                                                                      ││
│ │ Source: [Brand Submission ▼]                                         ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Step 3: Metadata (Lab Report) ──────────────────────────────────────┐│
│ │                                                                      ││
│ │ Lab Name*:        [Example Testing Lab, Inc.              ]          ││
│ │ Accreditation:    [ISO 17025                              ]          ││
│ │                                                                      ││
│ │ Test Method*:     [LC-MS/MS after extraction              ]          ││
│ │ Method Reference: [EPA 533                                ]          ││
│ │                                                                      ││
│ │ Analyte Panel*:   [Standard 40-PFAS Panel ▼]                        ││
│ │                   □ Custom panel (specify below)                     ││
│ │                                                                      ││
│ │ Detection Limits*:                                                   ││
│ │   LOD (ng/g):     [1.0    ]                                         ││
│ │   LOQ (ng/g):     [3.0    ]                                         ││
│ │                                                                      ││
│ │ Sample Information*:                                                 ││
│ │   Units tested:   [1      ]                                         ││
│ │   Lots tested:    [1      ]                                         ││
│ │   Collection date:[2026-01-15    ] 📅                               ││
│ │   Report date:    [2026-01-20    ] 📅                               ││
│ │                                                                      ││
│ │ Result Summary*:  [All 40 analytes below LOD              ]          ││
│ │                                                                      ││
│ │ * Required fields                                                    ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Step 4: Link to Products ───────────────────────────────────────────┐│
│ │                                                                      ││
│ │ Link evidence to products (optional now, required before use):       ││
│ │                                                                      ││
│ │ Search products: [all-clad                    ] [🔍]                 ││
│ │                                                                      ││
│ │ Selected (2):                                                        ││
│ │ ☑ All-Clad D3 Stainless 12" Skillet          [Select components ▼] ││
│ │     Applies to: [Pan body ▼]                                        ││
│ │ ☑ All-Clad D3 Stainless 10" Skillet          [Select components ▼] ││
│ │     Applies to: [Pan body ▼]                                        ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│                              [Cancel]  [Upload Evidence]                │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Evidence Hashing Workflow

1. **On Upload:**
   - Calculate SHA-256 of uploaded file
   - Display hash to reviewer for verification
   - Store file in S3 with WORM configuration
   - Store hash in database

2. **On Retrieval:**
   - Recalculate SHA-256 of stored file
   - Compare with stored hash
   - If mismatch: display "INTEGRITY ERROR" and block access
   - Log integrity check in audit log

3. **Periodic Verification:**
   - Nightly job recalculates hashes for random 10% of evidence
   - Any mismatches trigger alert to super_admin
   - Full integrity scan monthly

### 6.4 Evidence Status Lifecycle

```
┌─────────────┐
│  UPLOADED   │ File stored, hash recorded
└──────┬──────┘
       │ Metadata completed
       ▼
┌─────────────┐
│   PENDING   │ Awaiting review/linking
└──────┬──────┘
       │ Linked to product + used in verification
       ▼
┌─────────────┐
│   ACTIVE    │ In use for verification decisions
└──────┬──────┘
       │ expires_at approaching (30 days)
       ▼
┌─────────────────┐
│ EXPIRING_SOON   │ Alert shown, revalidation needed
└───────┬─────────┘
        │ expires_at passed
        ▼
┌─────────────┐
│   EXPIRED   │ Cannot be used for new verifications
└──────┬──────┘
       │ Super admin action (legal hold, etc.)
       ▼
┌─────────────┐
│  ARCHIVED   │ Retained but hidden from normal use
└─────────────┘

Note: Evidence is NEVER deleted. Soft delete via deleted_at field only.
```

---

## 7. Reports Queue

### 7.1 Reports List View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ User Reports                                        [Filter ▼] [Sort ▼] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Filters ──────────────────────────────────────────────────────────┐ │
│ │ Priority: [All] [Critical] [High] [Normal] [Low]                   │ │
│ │ Status: [Open] [Resolved] [Dismissed] [All]                        │ │
│ │ Type: [All ▼]  SLA: [All] [At Risk] [Breached]                    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ Pri │ Type           │ Product              │ Status │ SLA    │ Age ││
│ ├─────┼────────────────┼──────────────────────┼────────┼────────┼─────┤│
│ │ 🔴  │ Suspected PFAS │ BrandX Pan           │ NEW    │ 68h ⚠  │ 4h  ││
│ │     │ "Found lab results showing..."                                ││
│ ├─────┼────────────────┼──────────────────────┼────────┼────────┼─────┤│
│ │ 🔴  │ Materials Chg  │ GreenPan Reserve     │ REVIEW │ 24h    │ 2d  ││
│ │     │ "Manufacturer website now shows..."                           ││
│ ├─────┼────────────────┼──────────────────────┼────────┼────────┼─────┤│
│ │ 🟡  │ Listing Error  │ Pyrex Container      │ NEW    │ 6d     │ 1d  ││
│ │     │ "Image doesn't match product..."                              ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Open: 7 │ At risk: 2 │ Breached: 0                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Report Detail View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Report #RPT-456: Suspected PFAS                          [Actions ▼]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Report Info ─────────────────────┐ ┌─ Product Info ────────────────┐│
│ │ Status: 🔴 Under Review           │ │ Product: BrandX Ceramic Pan   ││
│ │ Priority: HIGH                    │ │ Current Tier: 2               ││
│ │ Type: Suspected PFAS              │ │ Claim: Type A                 ││
│ │ Submitted: Jan 27, 2026 6:15 AM   │ │ Last verified: Dec 2025       ││
│ │ SLA Deadline: Jan 30, 2026 6:15 AM│ │                               ││
│ │ Assigned to: Jane D.              │ │ [View Product →]              ││
│ └───────────────────────────────────┘ └───────────────────────────────┘│
│                                                                         │
│ ┌─ Reporter Description ───────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ "I found independent lab results from Consumer Reports showing      ││
│ │ that this pan's coating tested positive for total fluorine.         ││
│ │ The results are from November 2025. I think this needs to be        ││
│ │ re-verified. Link to report: [url]"                                 ││
│ │                                                                      ││
│ │ Contact email: reporter@email.com                                    ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Submitted Evidence ─────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ 📎 URL: https://consumerreports.org/...  [Open in new tab]          ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Investigation Notes (internal) ─────────────────────────────────────┐│
│ │                                                                      ││
│ │ Jan 27, 10:30 AM - Jane D.                                          ││
│ │ Reviewed Consumer Reports article. They tested total fluorine,      ││
│ │ not targeted PFAS. Result was 47 ppm TOF on food-contact surface.   ││
│ │ This warrants re-verification. Contacting brand for clarification.  ││
│ │                                                                      ││
│ │ [Add note...]                                                        ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Resolution ─────────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ Action: [Select action ▼]                                           ││
│ │                                                                      ││
│ │   ○ Dismiss - No action needed (explain below)                      ││
│ │   ● Downgrade tier - Evidence warrants lower tier                   ││
│ │   ○ Suspend product - Remove from catalog pending investigation     ││
│ │   ○ Request more info - Need additional evidence                    ││
│ │                                                                      ││
│ │ If downgrading:                                                      ││
│ │   New tier: [Tier 0 - Unknown ▼]                                    ││
│ │   Public note: [Under review due to new testing data     ]          ││
│ │                                                                      ││
│ │ Resolution notes (public if applicable):                            ││
│ │ ┌─────────────────────────────────────────────────────────────────┐ ││
│ │ │ Third-party testing indicates elevated total fluorine. Product  │ ││
│ │ │ downgraded pending brand clarification and retesting.           │ ││
│ │ └─────────────────────────────────────────────────────────────────┘ ││
│ │                                                                      ││
│ │ □ Notify reporter via email                                          ││
│ │                                                                      ││
│ │                                    [Save Draft]  [Resolve Report]    ││
│ └──────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Report Resolution Actions

| Action | Effect | Notifications |
|--------|--------|---------------|
| Dismiss | Close report, no product change | Reporter (if opted in) |
| Downgrade tier | Change verification to lower tier, update product | Reporter, Public changelog |
| Suspend | Remove product from public catalog | Reporter, Public changelog |
| Request more info | Keep report open, awaiting response | Reporter (required email) |

---

## 8. Analytics Dashboard

### 8.1 Operational Metrics

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Analytics                                    Period: [Last 30 days ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Review Throughput ──────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │  Reviews completed:  156                                             ││
│ │  Avg time to review: 2.3 days                                        ││
│ │  High-risk reviews:  34 (22%)                                        ││
│ │                                                                      ││
│ │  [Chart: Reviews over time]                                          ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Data Quality ───────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │  Products with evidence:     487/500 (97.4%)                         ││
│ │  Products at Tier 1+:        410/500 (82.0%)                         ││
│ │  Evidence expiring <30 days: 12                                      ││
│ │  Products flagged for drift: 3                                       ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Report Metrics ─────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │  Reports received:    23                                             ││
│ │  Reports resolved:    19                                             ││
│ │  Avg resolution time: 1.8 days                                       ││
│ │  SLA compliance:      95.7%                                          ││
│ │  Tier downgrades:     2                                              ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Business Metrics (Affiliate)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Affiliate Performance                        Period: [Last 30 days ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Click Summary ──────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │  Total clicks:        12,456                                         ││
│ │  Unique sessions:     8,234                                          ││
│ │  Bot-filtered:        342 (2.7%)                                     ││
│ │                                                                      ││
│ │  By retailer:                                                        ││
│ │  Amazon          ████████████████░░░░ 8,234 (66%)                    ││
│ │  Williams Sonoma ████░░░░░░░░░░░░░░░░ 2,100 (17%)                    ││
│ │  Sur La Table    ███░░░░░░░░░░░░░░░░░ 1,456 (12%)                    ││
│ │  Other           █░░░░░░░░░░░░░░░░░░░   666 (5%)                     ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Top Products by Clicks ─────────────────────────────────────────────┐│
│ │                                                                      ││
│ │  1. All-Clad D3 12" Skillet         1,234 clicks                    ││
│ │  2. Lodge Cast Iron 10"               987 clicks                    ││
│ │  3. Pyrex Simply Store 18pc           876 clicks                    ││
│ │  4. Le Creuset Dutch Oven             654 clicks                    ││
│ │  5. GreenPan Reserve 12"              543 clicks                    ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Note: Revenue data requires affiliate network integration.              │
│ Implement network API connections to display EPC, conversion, revenue.  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Settings (Super Admin)

### 9.1 User Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│ User Management                                         [+ Add User]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ User              │ Email                │ Role        │ Status     ││
│ ├───────────────────┼──────────────────────┼─────────────┼────────────┤│
│ │ Jane Doe          │ jane@company.com     │ reviewer    │ Active     ││
│ │ Mike Smith        │ mike@company.com     │ reviewer    │ Active     ││
│ │ Sarah Johnson     │ sarah@company.com    │ editor      │ Active     ││
│ │ Admin User        │ admin@company.com    │ super_admin │ Active     ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Roles:                                                                  │
│ • viewer: Read-only access                                              │
│ • editor: Create/edit products, brands, categories                      │
│ • reviewer: All editor + verification decisions + report handling       │
│ • super_admin: All permissions + user management + settings             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.2 System Configuration

```
┌─────────────────────────────────────────────────────────────────────────┐
│ System Configuration                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Evidence Settings ──────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ Lab report expiry (months):       [24    ]                           ││
│ │ Brand statement expiry (months):  [12    ]                           ││
│ │ Expiry warning threshold (days):  [30    ]                           ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ SLA Settings ───────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ High-priority report SLA (hours):    [72    ]                        ││
│ │ Normal-priority report SLA (days):   [7     ]                        ││
│ │ Low-priority report SLA (days):      [14    ]                        ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ ┌─ Feature Flags ──────────────────────────────────────────────────────┐│
│ │                                                                      ││
│ │ □ Enable price display (requires PA-API integration)                 ││
│ │ ☑ Enable user reports                                                ││
│ │ ☑ Enable compare feature                                             ││
│ │ □ Enable drift monitoring (requires crawl infrastructure)            ││
│ │                                                                      ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│                                                 [Save Configuration]    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Audit Log Viewer

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Audit Log                                               [Export CSV]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Filters ──────────────────────────────────────────────────────────┐ │
│ │ Date range: [2026-01-20] to [2026-01-27]                           │ │
│ │ Actor: [All ▼]  Action: [All ▼]  Entity: [All ▼]                  │ │
│ │ Search: [________________________________] [🔍]                     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐│
│ │ Timestamp           │ Actor     │ Action              │ Entity      ││
│ ├─────────────────────┼───────────┼─────────────────────┼─────────────┤│
│ │ Jan 27, 10:32:15 AM │ Jane D.   │ verification.decided│ prd_abc123  ││
│ │ Changed tier from 1 to 2, claim type A                              ││
│ ├─────────────────────┼───────────┼─────────────────────┼─────────────┤│
│ │ Jan 27, 10:30:00 AM │ Jane D.   │ evidence.linked     │ ev_9003     ││
│ │ Linked to product prd_abc123, component cmp_body                    ││
│ ├─────────────────────┼───────────┼─────────────────────┼─────────────┤│
│ │ Jan 27, 09:15:22 AM │ Mike S.   │ evidence.uploaded   │ ev_9003     ││
│ │ Lab report uploaded, SHA: e3b0c44...                                ││
│ ├─────────────────────┼───────────┼─────────────────────┼─────────────┤│
│ │ Jan 27, 08:00:00 AM │ System    │ report.submitted    │ rpt_456     ││
│ │ User report: suspected_pfas on prd_def456                           ││
│ └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│ Showing 234 entries │ [◀ Prev] Page 1 of 24 [Next ▶]                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `g` `d` | Go to Dashboard | Global |
| `g` `q` | Go to Review Queue | Global |
| `g` `r` | Go to Reports | Global |
| `g` `e` | Go to Evidence Library | Global |
| `/` | Focus search | Global |
| `j` / `k` | Next / Previous item | List views |
| `Enter` | Open selected item | List views |
| `a` | Assign to me | Queue item |
| `s` | Start review | Queue item |
| `Esc` | Close modal / Cancel | Modal open |
| `Ctrl+S` | Save draft | Edit forms |
| `Ctrl+Enter` | Submit / Approve | Decision forms |
