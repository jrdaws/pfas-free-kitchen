# PFAS-Free Kitchen Platform - Trust and Verification Playbook

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Status:** Implementation-Ready  
**Audience:** Verification reviewers, content team, platform administrators

---

## 1. Introduction

### 1.1 Purpose
This playbook provides step-by-step guidance for verifying kitchen products against PFAS-free criteria. It ensures consistent, defensible decisions that:
- Protect consumers from misleading claims
- Comply with FTC "free-of" claim requirements
- Maintain platform credibility and legal defensibility

### 1.2 Core Principles

| Principle | What It Means |
|-----------|---------------|
| **No Silent Failures** | If we don't know, we say we don't know. Tier 0 is always visible. |
| **Scope Specificity** | Every claim specifies which components it covers. |
| **Evidence-Based** | Every tier advancement requires documented evidence. |
| **Conservative Default** | When in doubt, choose the lower tier. |
| **Auditability** | Every decision is traceable with rationale and evidence links. |

---

## 2. Reviewer Training Checklist

### 2.1 Required Knowledge Assessment

Before processing reviews, every reviewer must demonstrate competency in:

#### Module 1: PFAS Fundamentals
- [ ] Can explain what PFAS stands for (per- and polyfluoroalkyl substances)
- [ ] Understands PFAS is a class of ~15,000 chemicals, not one substance
- [ ] Can explain why "PFOA-free" ≠ "PFAS-free"
- [ ] Understands common PFAS uses in kitchen products:
  - Nonstick coatings (PTFE/Teflon family)
  - Grease-resistant treatments on paper/textiles
  - Water/stain-resistant coatings

#### Module 2: Verification Tiers
- [ ] Can recite all 5 tiers (0-4) and their requirements from memory
- [ ] Understands the difference between claim types A, B, and C
- [ ] Can explain what "scope" means and why it matters
- [ ] Knows which tier requires lab testing

#### Module 3: Evidence Types
- [ ] Can identify valid lab report elements (lab name, method, LOD/LOQ)
- [ ] Understands difference between targeted PFAS testing and total fluorine screening
- [ ] Can evaluate brand attestations for completeness
- [ ] Knows evidence expiry rules (12 months attestations, 24 months lab reports)

#### Module 4: FTC Compliance
- [ ] Understands FTC Green Guides "free-of" requirements (16 CFR 260.9)
- [ ] Can explain why overbroad claims are risky
- [ ] Knows why scope and qualification are legally required

#### Module 5: Platform Procedures
- [ ] Can navigate the admin console
- [ ] Knows the escalation path for uncertain decisions
- [ ] Understands SLA requirements for different priority levels
- [ ] Can properly document rationale

### 2.2 Practical Assessment

Reviewer must correctly process 5 test products (provided in training environment):
1. Simple stainless steel product (should achieve Tier 2+)
2. "Ceramic nonstick" product (requires elevated path)
3. Product with "PFOA-free" claim only (max Tier 1)
4. Product with lab report (Tier 3 candidate)
5. Product with insufficient evidence (Tier 0)

Pass threshold: 4/5 correct decisions with proper rationale.

### 2.3 Ongoing Training

| Frequency | Activity |
|-----------|----------|
| Weekly | Team review of 2-3 edge cases |
| Monthly | New materials/coating education |
| Quarterly | FTC/regulatory updates review |
| Annually | Full recertification |

---

## 3. Verification Tier Requirements (Detailed)

### 3.1 Tier 0 - Unknown

**Status:** Not verified - evidence incomplete

**Criteria (any of these):**
- No evidence objects linked
- Food-contact materials not identified
- Risk terms present without resolution
- Evidence expired without renewal
- Under active investigation (report pending)

**Required Actions:**
- Display "PFAS status: Unknown - evidence incomplete"
- Show "What's missing" panel with specific gaps
- Do not display any "PFAS-free" language
- Product may still be listed but tier is prominently shown

**Example Rationale:**
> "Product ingested but no brand attestation or materials documentation available. Food-contact coating type unknown. Requires brand outreach."

---

### 3.2 Tier 1 - Brand Statement

**Status:** No intentionally added PFAS (brand attestation)

**Required Evidence:**
- [ ] Brand attestation stating no intentionally added PFAS
- [ ] Attestation dated within last 12 months
- [ ] Attestation specifies scope (all components OR specific components)
- [ ] Attestation source documented (email, website, letter)

**Claim Type:** A - No intentionally added PFAS

**Verification Steps:**
1. Locate brand attestation in evidence
2. Verify date is within 12 months
3. Identify scope of attestation
4. Document any components NOT covered

**Limitations to Display:**
- "Based on brand statement, not independent testing"
- "Scope: [specify which components]"

**Example Rationale:**
> "Brand policy document from October 2025 states: 'We do not intentionally add any PFAS compounds to our cookware products.' Scope covers all product components. No third-party verification. Tier 1 appropriate."

---

### 3.3 Tier 2 - Policy Reviewed

**Status:** No intentionally added PFAS (policy + materials review)

**Required Evidence (all of these):**
- [ ] All Tier 1 requirements met
- [ ] Complete component model (all parts identified)
- [ ] All food-contact materials documented
- [ ] All food-contact coatings documented (or "none" confirmed)
- [ ] Risk-term scan: no unresolved flags
- [ ] Policy document OR detailed technical specification

**Claim Type:** A - No intentionally added PFAS

**Additional Verification Steps:**
1. Review component model for completeness
2. Verify each food-contact surface has material/coating assigned
3. Check risk-term scan results
4. If risk terms present: verify resolution documented
5. Review policy document for manufacturing/sourcing detail

**Limitations to Display:**
- "Based on brand policy and materials review"
- "Not independently tested"
- Any unverified components listed in "unknowns"

**Example Rationale:**
> "Tier 1 criteria met. Component model complete: pan body (stainless steel, uncoated, food-contact), handle (stainless steel, non-food-contact). Brand materials specification confirms 18/10 stainless throughout. No coatings. No risk terms detected. Policy document provides supply chain detail. Tier 2 appropriate."

---

### 3.4 Tier 3 - Lab Tested

**Status:** Below detection limit OR Screening passed

**Required Evidence (all of these):**
- [ ] All Tier 2 requirements met
- [ ] Third-party lab report
- [ ] Lab report from accredited lab (ISO 17025 preferred)
- [ ] Lab report dated within 24 months
- [ ] Lab report covers food-contact surfaces
- [ ] Method documented (LC-MS/MS, TOF, etc.)
- [ ] Detection limits documented (LOD/LOQ)

**Claim Type:** B (targeted testing) or C (screening)

**Type B Requirements (Targeted PFAS Panel):**
- Lab used targeted analysis (LC-MS/MS or similar)
- Specific PFAS compounds tested (list available)
- Results: all compounds below LOD/LOQ
- Claim: "Below detection limit for [N] PFAS compounds"

**Type C Requirements (Total Fluorine Screening):**
- Lab used screening method (combustion IC, TOF, etc.)
- Total fluorine/organic fluorine below threshold
- Must label as screening with limitations
- Claim: "Total fluorine screen below threshold"
- Required limitation: "Screening method - does not identify specific PFAS"

**Verification Steps:**
1. Verify lab report is valid and within date
2. Confirm tested components match food-contact surfaces
3. Document method and limits
4. For Type B: verify analyte list reference
5. For Type C: ensure screening limitations are documented
6. Calculate sample scope (units, lots)

**Limitations to Display:**
- Sample scope: "Based on [N] unit(s) from [M] lot(s)"
- If Type C: "Screening test only - individual PFAS not identified"
- Components not tested: list in unknowns

**Example Rationale (Type B):**
> "Lab report from Example Lab Inc. (ISO 17025 accredited) dated November 2025. Targeted LC-MS/MS analysis for 40 PFAS compounds per EPA 533 method. Sample: 1 unit, 1 lot, pan body coating. All 40 analytes below LOD (1.0 ng/g). Food-contact surface tested. Tier 3 Type B appropriate."

**Example Rationale (Type C):**
> "Lab report from Screen Lab dated December 2025. Total organic fluorine by combustion IC. Result: <10 ppm TOF on food-contact surface. Single unit sample. Screening method only - does not identify specific compounds. Tier 3 Type C appropriate with screening limitations displayed."

---

### 3.5 Tier 4 - Monitored

**Status:** Verified + ongoing monitoring

**Required Evidence (all of these):**
- [ ] All Tier 3 requirements met
- [ ] Previous verification history exists
- [ ] Revalidation schedule configured
- [ ] Drift monitoring configured (if available)
- [ ] At least one prior verification cycle completed

**Additional Requirements:**
- Product has been Tier 3 verified at least once before
- Brand/product showing stability (no reformulations)
- Monitoring cadence established (typically 12-24 months)

**Verification Steps:**
1. Verify prior Tier 3 verification
2. Confirm no material changes since last verification
3. Set next revalidation date
4. Configure drift monitoring triggers (if system supports)

**Limitations to Display:**
- "Last verified: [date]"
- "Next scheduled review: [date]"
- "Monitoring: [active/pending]"

**Example Rationale:**
> "Product previously verified at Tier 3 (November 2025). No manufacturing changes reported. Brand maintains consistent PFAS-free policy. Lab testing cadence: biannual. Next revalidation due November 2027. Drift monitoring configured for brand policy page. Tier 4 appropriate."

---

## 4. Decision Trees

### 4.1 Master Decision Tree

```
START: Product enters review queue
│
├── Q1: Is this a food-contact product?
│   │
│   ├── NO → Standard review (simpler path)
│   │
│   └── YES → Continue
│       │
│       ├── Q2: Is component model complete?
│       │   │
│       │   ├── NO → Return to editor: "Complete component model"
│       │   │        Cannot proceed past Tier 1
│       │   │
│       │   └── YES → Continue
│       │       │
│       │       ├── Q3: Any PFAS risk terms detected?
│       │       │   │
│       │       │   ├── YES → Go to Risk Term Decision Tree (Section 4.2)
│       │       │   │
│       │       │   └── NO → Continue
│       │       │       │
│       │       │       ├── Q4: Brand attestation available?
│       │       │       │   │
│       │       │       │   ├── NO → TIER 0 (Unknown)
│       │       │       │   │
│       │       │       │   └── YES → Check attestation validity
│       │       │       │       │
│       │       │       │       ├── Attestation > 12 months old?
│       │       │       │       │   └── YES → TIER 0 (evidence expired)
│       │       │       │       │
│       │       │       │       └── NO → TIER 1 eligible
│       │       │       │           │
│       │       │       │           ├── Q5: Policy/materials fully documented?
│       │       │       │           │   │
│       │       │       │           │   ├── NO → TIER 1 (Brand Statement)
│       │       │       │           │   │
│       │       │       │           │   └── YES → TIER 2 eligible
│       │       │       │           │       │
│       │       │       │           │       ├── Q6: Lab report available?
│       │       │       │           │       │   │
│       │       │       │           │       │   ├── NO → TIER 2 (Policy Reviewed)
│       │       │       │           │       │   │
│       │       │       │           │       │   └── YES → Check lab report
│       │       │       │           │       │       │
│       │       │       │           │       │       ├── Lab report > 24 months?
│       │       │       │           │       │       │   └── YES → TIER 2 (lab expired)
│       │       │       │           │       │       │
│       │       │       │           │       │       ├── Covers food-contact?
│       │       │       │           │       │       │   └── NO → TIER 2 (scope mismatch)
│       │       │       │           │       │       │
│       │       │       │           │       │       └── Valid → TIER 3 eligible
│       │       │       │           │       │           │
│       │       │       │           │       │           ├── Q7: Previous verification + monitoring?
│       │       │       │           │       │           │   │
│       │       │       │           │       │           │   ├── NO → TIER 3 (Lab Tested)
│       │       │       │           │       │           │   │
│       │       │       │           │       │           │   └── YES → TIER 4 (Monitored)
```

### 4.2 Risk Term Decision Tree: "Ceramic Nonstick"

```
TRIGGER: "ceramic nonstick", "ceramic coating", "ceramic coated" detected
│
├── Q1: Is coating on food-contact surface?
│   │
│   ├── NO → Not a PFAS concern for this component
│   │        Continue with normal flow
│   │
│   └── YES → Elevated review required
│       │
│       ├── Q2: Is coating chemistry documented?
│       │   │
│       │   ├── NO → Cannot exceed TIER 1
│       │   │        Require: "Brand must clarify coating chemistry"
│       │   │
│       │   └── YES → Continue
│       │       │
│       │       ├── Q3: Is it a sol-gel ceramic coating?
│       │       │   │
│       │       │   ├── YES → Lower risk, continue verification
│       │       │   │        Examples: Thermolon, GreenTek, Eterna
│       │       │   │
│       │       │   ├── NO, it's PTFE with ceramic particles → REJECT
│       │       │   │   Marketing as "ceramic" but contains fluoropolymer
│       │       │   │   Product excluded from PFAS-free catalog
│       │       │   │
│       │       │   └── UNCLEAR → Cannot exceed TIER 1
│       │       │       Request: Technical specification from brand
│       │       │
│       │       └── Q4: For sol-gel ceramic, is PFAS-free status attested?
│       │           │
│       │           ├── Brand attestation only → Max TIER 2
│       │           │
│       │           └── Lab tested → TIER 3 eligible
│       │               Note: Recommend targeted testing for ceramic coatings
│       │               due to supply chain complexity

KNOWN SOL-GEL CERAMIC COATING BRANDS (research verified):
- Thermolon (GreenPan) - Publicly documented sol-gel
- GreenTek (various) - Sol-gel based
- Eterna (Zwilling) - Ceramic reinforced
- Cerastone (various) - Verify case-by-case
- Orgreenic - Verify case-by-case (older products may differ)

DOCUMENTATION REQUIREMENT:
If brand not in known list, require one of:
- Technical data sheet confirming sol-gel/silica-based
- Direct brand confirmation of coating technology
- Third-party lab analysis of coating composition
```

### 4.3 Risk Term Decision Tree: "PFOA-Free"

```
TRIGGER: "PFOA-free", "PFOA free", "no PFOA" detected
│
├── IMPORTANT CONTEXT:
│   PFOA (perfluorooctanoic acid) is ONE compound in the PFAS class.
│   "PFOA-free" does NOT mean "PFAS-free"
│   Many PTFE/Teflon products are now PFOA-free but still contain PFAS.
│
├── Q1: Does product also claim "PFAS-free"?
│   │
│   ├── YES → Verify the PFAS-free claim separately
│   │        PFOA-free is not sufficient; need broader claim
│   │
│   └── NO → Product only claims PFOA-free
│       │
│       ├── Q2: What is the coating type?
│       │   │
│       │   ├── PTFE/Teflon family → REJECT from catalog
│       │   │   "PFOA-free PTFE" is still a fluoropolymer
│       │   │   Contains PFAS by definition
│       │   │
│       │   ├── No coating / uncoated → Ignore PFOA-free claim
│       │   │   Product may list for other reasons
│       │   │   PFOA-free claim is marketing (irrelevant for uncoated)
│       │   │
│       │   ├── Ceramic sol-gel → Proceed with ceramic checklist
│       │   │   Ask brand to clarify full PFAS status
│       │   │
│       │   └── Unknown coating → TIER 0 or TIER 1 max
│       │       Cannot verify without coating clarity

REQUIRED RATIONALE LANGUAGE:
"Product marketing mentions 'PFOA-free' which refers to one specific 
PFAS compound. This claim alone does not establish PFAS-free status. 
[Describe what additional evidence was obtained or why tier is limited]"
```

### 4.4 Risk Term Decision Tree: "Fluorine-Free"

```
TRIGGER: "fluorine-free", "fluorine free", "no fluorine" detected
│
├── IMPORTANT CONTEXT:
│   "Fluorine-free" is NOT identical to "PFAS-free"
│   - A product can be fluorine-free and PFAS-free (likely)
│   - A product could theoretically have non-PFAS fluorine compounds
│   - The relationship requires evidence to map
│
├── Q1: Does brand also claim "PFAS-free"?
│   │
│   ├── YES → Use PFAS-free claim as primary
│   │        Fluorine-free is supporting evidence
│   │
│   └── NO → Only fluorine-free claimed
│       │
│       ├── Q2: Is there a total fluorine test?
│       │   │
│       │   ├── YES, below LOD → Strong indicator of PFAS-free
│       │   │   Can support TIER 3 Type C
│       │   │   Add note: "Fluorine-free test supports PFAS-free status"
│       │   │
│       │   └── NO → Fluorine-free claim is marketing
│       │       │
│       │       └── Q3: Is there other PFAS evidence?
│       │           │
│       │           ├── YES → Use that evidence
│       │           │
│       │           └── NO → Max TIER 1
│       │               "Brand claims fluorine-free but no test data"

UI REQUIREMENT:
Display explanation: "This product claims 'fluorine-free' which 
indicates no fluorine compounds including PFAS. [Evidence basis]"
```

### 4.5 Risk Term Decision Tree: "Nonstick" (General)

```
TRIGGER: "nonstick", "non-stick", "non stick" detected
│
├── Q1: Is nonstick property on food-contact surface?
│   │
│   ├── NO → Not a concern (e.g., easy-clean exterior)
│   │
│   └── YES → Elevated review required
│       │
│       ├── Q2: What provides the nonstick property?
│       │   │
│       │   ├── PTFE/Teflon → REJECT
│       │   │   Product excluded from PFAS-free catalog
│       │   │
│       │   ├── Ceramic sol-gel → Go to Ceramic Nonstick tree
│       │   │
│       │   ├── Seasoning (cast iron/carbon steel) → 
│       │   │   Verify seasoning is oil-based, not chemical coating
│       │   │   If confirmed: Not a PFAS concern
│       │   │
│       │   ├── Enamel → Generally not a PFAS concern
│       │   │   Verify it's true vitreous enamel
│       │   │
│       │   ├── Silicone → Generally not a PFAS concern
│       │   │   Verify food-grade silicone
│       │   │
│       │   └── UNKNOWN → TIER 0
│       │       Cannot proceed without coating identification
│       │       "Nonstick coating type must be documented"

AUTOMATIC REJECT TERMS (if on food-contact surface):
- "Teflon"
- "PTFE"
- "FEP"
- "PFA"
- "Silverstone"
- "T-fal nonstick" (classic line)
```

### 4.6 Risk Term Decision Tree: "Stain-Resistant" / "Water-Repellent"

```
TRIGGER: "stain-resistant", "stain resistant", "water-repellent",
         "water repellent", "repels water", "grease-proof", "oil-resistant"
│
├── Q1: Is this a textile product (apron, mitt, towel)?
│   │
│   ├── YES → High PFAS risk
│   │   │
│   │   └── Q2: Is treatment on food-contact area?
│   │       │
│   │       ├── YES (e.g., apron front) → Require:
│   │       │   - Brand attestation of PFAS-free treatment
│   │       │   - OR lab test of treatment
│   │       │   - Without: Max TIER 1, note limitation
│   │       │
│   │       └── NO → Lower concern but note in review
│   │
│   └── NO → Likely non-textile
│       │
│       ├── Q3: Is this a paper product (liner, parchment)?
│       │   │
│       │   ├── YES → Moderate PFAS risk
│       │   │   PFAS commonly used for grease resistance
│       │   │   Require: Brand confirmation of PFAS-free
│       │   │   Prefer: Lab tested products
│       │   │
│       │   └── NO → Assess case by case
│       │       Typically less concerning for hard goods
│       │       (stainless, glass, etc. inherently resist stains)

KEY CONCERN:
PFAS treatments are invisible and often applied at manufacturing.
Textile and paper products with repellency claims are HIGH RISK
unless specifically tested or confirmed PFAS-free by brand.
```

---

## 5. Ambiguous Materials Guide

### 5.1 Materials Requiring Extra Scrutiny

| Material | Concern | Resolution Required |
|----------|---------|---------------------|
| "Ceramic" | Could mean: clay ceramic, ceramic coating, ceramic-reinforced | Clarify: base material vs coating |
| "Aluminum" | May have coatings (anodized, nonstick, etc.) | Document any coatings present |
| "Coated steel" | What is the coating? | Identify coating type explicitly |
| "Natural nonstick" | Marketing term - what's the mechanism? | Identify actual coating/treatment |
| "Diamond-infused" | Marketing for reinforced coatings - base? | Identify base coating (often PTFE) |
| "Titanium nonstick" | Usually PTFE with titanium reinforcement | Verify base coating - likely REJECT |
| "Stone-coated" | Marketing term - actual coating varies | Verify actual coating technology |
| "Granite-coated" | Marketing term - often PTFE based | Verify - high likelihood of REJECT |

### 5.2 Resolution Strategies

**When coating type is unclear:**
1. Check brand website product page
2. Check product packaging/box copy
3. Search brand FAQ/materials pages
4. Direct outreach to brand (email template below)
5. If no clarification possible: Max Tier 1 with explicit unknown

**Brand Outreach Email Template:**
```
Subject: Materials Verification Request - [Product Name]

Dear [Brand] Team,

We are reviewing [Product Name] for inclusion in our PFAS-free kitchen 
products directory. To complete our verification, we need clarification 
on the following:

1. What type of coating is used on the food-contact surface?
   (e.g., ceramic sol-gel, PTFE, enamel, none)

2. Can you confirm whether any PFAS compounds are intentionally added 
   to any component of this product?

3. Do you have a PFAS policy statement or technical documentation 
   we can reference?

Your response will help ensure accurate representation of your product.

Thank you,
[Name]
PFAS-Free Kitchen Verification Team
```

### 5.3 Common Marketing Terms Translation

| Marketing Term | Likely Reality | Verification Need |
|----------------|----------------|-------------------|
| "Ceramic titanium" | PTFE with ceramic/titanium particles | HIGH - likely contains PFAS |
| "Diamond ceramic" | Could be sol-gel or PTFE based | MEDIUM - clarify base |
| "Eco-friendly nonstick" | Variable - could be anything | HIGH - clarify coating |
| "Green coating" | Marketing - no standard meaning | HIGH - clarify coating |
| "PFOA-free nonstick" | Likely PTFE without PFOA | REJECT if PTFE confirmed |
| "Forever coating" | Ironic - likely PTFE | REJECT if PTFE confirmed |
| "Healthy ceramic" | Likely sol-gel ceramic | MEDIUM - verify technology |
| "100% ceramic" | Unusual for cookware - verify | MEDIUM - likely ceramic coating |

---

## 6. Tier 4 Monitoring Plan

### 6.1 Monitoring Components

| Component | Frequency | Method | Trigger Action |
|-----------|-----------|--------|----------------|
| Brand policy page | Weekly | Automated crawl | Alert if changed |
| Product specification | Monthly | Manual check | Flag for re-review |
| Lab report validity | Ongoing | Date tracking | Alert 30 days before expiry |
| User reports | Ongoing | Queue monitoring | Immediate review if received |
| Retailer listings | Monthly | Spot check | Flag if specs differ |

### 6.2 Drift Detection Triggers

**Automatic downgrade to Tier 0 (Under Review):**
- User report with credible evidence
- Brand policy page change detected
- Product page indicates reformulation
- Lab report expiry without renewal
- Regulatory action against brand

**Alert but maintain tier (pending review):**
- Minor website copy changes
- New product variants added
- Brand ownership change
- Supply chain news

### 6.3 Revalidation Cadence

| Tier | Revalidation Frequency | Trigger for Earlier Review |
|------|------------------------|----------------------------|
| Tier 1 | 12 months | New evidence available, user report |
| Tier 2 | 12 months | Policy change, user report |
| Tier 3 | 24 months | New test data, user report |
| Tier 4 | 12-24 months (scheduled) | Any drift detection trigger |

### 6.4 Revalidation Checklist

```
REVALIDATION REVIEW CHECKLIST

Product: ___________________ Current Tier: ___
Last verified: _____________ Reviewer: ________

□ 1. Review all linked evidence for expiry
     - Brand attestations (12mo limit): Current? ___
     - Lab reports (24mo limit): Current? ___

□ 2. Check brand website for changes
     - Product still listed? ___
     - Specifications unchanged? ___
     - PFAS policy unchanged? ___

□ 3. Review any user reports since last verification
     - Reports received: ___
     - Reports requiring action: ___

□ 4. Check for industry/regulatory updates
     - Any new PFAS testing standards? ___
     - Brand involved in any PFAS news? ___

□ 5. Verify retailer consistency
     - Product info consistent across retailers? ___
     - Any retailer showing different specs? ___

DECISION:
○ Maintain current tier
○ Upgrade tier (new evidence available)
○ Downgrade tier (evidence expired/concerns)
○ Suspend (active investigation needed)

Rationale: ________________________________
_________________________________________

Reviewer signature: __________ Date: _______
```

---

## 7. Escalation Procedures

### 7.1 When to Escalate

| Situation | Escalation Path |
|-----------|-----------------|
| Uncertain coating chemistry | Senior reviewer → Brand outreach |
| Conflicting evidence | Senior reviewer → Team discussion |
| Brand disputes decision | Senior reviewer → Legal review |
| Potential legal claim | Immediate → Legal team |
| High-profile product | Senior reviewer → Leadership notification |
| New coating technology | Team discussion → Research task |

### 7.2 Escalation Contacts

| Role | Responsibility | Response SLA |
|------|----------------|--------------|
| Senior Reviewer | Complex decisions, brand outreach | Same day |
| Verification Lead | Policy interpretation, team disputes | 24 hours |
| Legal | Claim language, disputes, regulatory | 48 hours |
| Platform Lead | High-profile, strategic decisions | 24 hours |

### 7.3 Documentation Requirements for Escalation

When escalating, document:
1. Product ID and name
2. Current evidence summary
3. Specific question or concern
4. Options considered
5. Recommended action (if any)
6. Urgency level (blocking review or not)

---

## 8. Common Mistakes to Avoid

### 8.1 Verification Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Accepting "PFOA-free" as PFAS-free | PFOA is one compound; PTFE is PFOA-free but still PFAS | Require broader PFAS claim or testing |
| Ignoring non-food-contact components | Users may care about all components | Document all, but scope claims to food-contact |
| Not documenting unknowns | Silent failures violate platform principle | Always list what we couldn't verify |
| Using expired evidence for Tier 3 | Evidence expiry exists for a reason | Downgrade or request updated evidence |
| Assuming "ceramic" means safe | Ceramic is a marketing term with many meanings | Always clarify coating technology |

### 8.2 Process Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Skipping the checklist | Checklists ensure consistency | Always complete category-specific checklist |
| Vague rationale | Decisions must be auditable and defensible | Write rationale as if for legal review |
| Not linking evidence | Traceability is required | Every claim needs evidence object linked |
| Rushing high-risk reviews | Complex products need careful analysis | Respect the elevated review path |
| Personal opinion in rationale | Decisions must be evidence-based | Cite evidence, not feelings |

---

## 9. Quick Reference Cards

### 9.1 Tier Quick Reference

```
┌────────────────────────────────────────────────────────────────────┐
│                    TIER QUICK REFERENCE                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TIER 0 - UNKNOWN                                                  │
│  • No evidence OR evidence expired OR under investigation          │
│  • Display: "PFAS status: Unknown - evidence incomplete"           │
│                                                                    │
│  TIER 1 - BRAND STATEMENT                                          │
│  • Brand attestation within 12 months                              │
│  • Specifies scope (which components)                              │
│  • Claim Type: A                                                   │
│                                                                    │
│  TIER 2 - POLICY REVIEWED                                          │
│  • Tier 1 + complete component model                               │
│  • All food-contact materials documented                           │
│  • Risk terms resolved                                             │
│  • Claim Type: A                                                   │
│                                                                    │
│  TIER 3 - LAB TESTED                                               │
│  • Tier 2 + lab report within 24 months                            │
│  • Food-contact surfaces tested                                    │
│  • Method + LOD/LOQ documented                                     │
│  • Claim Type: B (targeted) or C (screening)                       │
│                                                                    │
│  TIER 4 - MONITORED                                                │
│  • Tier 3 + prior verification history                             │
│  • Revalidation schedule set                                       │
│  • Drift monitoring active                                         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 9.2 Red Flag Quick Reference

```
┌────────────────────────────────────────────────────────────────────┐
│                    RED FLAG QUICK REFERENCE                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  AUTOMATIC REJECT (food-contact surface):                          │
│  • PTFE • Teflon • FEP • PFA • Silverstone                         │
│  • "Titanium nonstick" • "Granite nonstick" (verify - likely PTFE) │
│                                                                    │
│  ELEVATED REVIEW REQUIRED:                                         │
│  • "Ceramic nonstick" → Verify sol-gel, not PTFE                   │
│  • "PFOA-free" only → Does NOT mean PFAS-free                      │
│  • "Nonstick" without coating type → Clarify before proceeding     │
│  • "Stain-resistant" textiles → Require PFAS-free confirmation     │
│                                                                    │
│  MAX TIER 1 UNTIL RESOLVED:                                        │
│  • Unknown coating type                                            │
│  • "PFOA-free" claim without broader PFAS claim                    │
│  • Brand refuses to clarify materials                              │
│                                                                    │
│  WHEN IN DOUBT:                                                    │
│  → Choose the lower tier                                           │
│  → Document what's unknown                                         │
│  → Escalate to senior reviewer                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 9.3 Evidence Expiry Quick Reference

```
┌────────────────────────────────────────────────────────────────────┐
│                 EVIDENCE EXPIRY QUICK REFERENCE                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  EVIDENCE TYPE          │ EXPIRY PERIOD │ WARNING AT               │
│  ───────────────────────┼───────────────┼─────────────             │
│  Brand attestation      │ 12 months     │ 30 days before           │
│  Policy document        │ 12 months     │ 30 days before           │
│  Lab report (targeted)  │ 24 months     │ 60 days before           │
│  Lab report (screening) │ 24 months     │ 60 days before           │
│  Screenshot             │ 6 months      │ 30 days before           │
│                                                                    │
│  ON EXPIRY:                                                        │
│  1. Cannot use for new Tier 3 verifications                        │
│  2. Existing verifications flagged for revalidation                │
│  3. If no renewal: downgrade to Tier 2 or lower                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 10. Appendix: PFAS Testing Methods Reference

### 10.1 Targeted PFAS Analysis (Type B)

**Method:** LC-MS/MS (Liquid Chromatography - Tandem Mass Spectrometry)

**What it does:**
- Identifies and quantifies specific PFAS compounds
- Tests against a defined list (panel) of analytes
- Reports concentration for each compound

**Common Standards:**
- EPA 533 (drinking water, 25 PFAS)
- EPA 537.1 (drinking water, 18 PFAS)
- ISO 21675 (soil/sludge, adaptable)

**Typical LOD/LOQ:**
- LOD: 0.5 - 5 ng/g (parts per billion)
- LOQ: 1 - 10 ng/g

**Pros:**
- Compound-specific identification
- Regulatory-aligned methods
- Well-established, reproducible

**Cons:**
- Only tests for listed compounds
- More expensive than screening
- May miss novel/unlisted PFAS

### 10.2 Total Fluorine Screening (Type C)

**Methods:**
- CIC (Combustion Ion Chromatography)
- PIGE (Particle-Induced Gamma-ray Emission)
- TOF/EOF (Total Organic Fluorine / Extractable Organic Fluorine)

**What it does:**
- Measures total fluorine content
- Does not identify specific compounds
- Indicates presence/absence of fluorinated materials

**Typical Detection:**
- LOD: 10 - 100 ppm (parts per million)
- Note: Higher than targeted testing

**Pros:**
- Catches all fluorine (including unknown PFAS)
- Faster and cheaper than targeted
- Good for initial screening

**Cons:**
- Not compound-specific
- Cannot identify which PFAS present
- May detect non-PFAS fluorine sources
- Higher detection limits

### 10.3 When to Require Which Test

| Situation | Recommended Test | Rationale |
|-----------|------------------|-----------|
| High-confidence Tier 3 needed | Targeted (Type B) | Compound-specific results |
| Initial screening | TOF/TF (Type C) | Cost-effective indicator |
| Ceramic nonstick coating | Targeted (Type B) | Supply chain complexity |
| Simple materials (stainless) | Either acceptable | Lower inherent risk |
| Contested product | Targeted (Type B) | Defensible results |
| Brand-provided test | Verify method used | Accept if meets standards |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-27 | Platform Team | Initial release |

**Review Schedule:** Quarterly or upon regulatory/policy change

**Training Certification Record:** Maintained separately in HR system
