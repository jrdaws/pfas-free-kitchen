# PFAS-Free Kitchen Platform - Product Requirements Document (MVP)

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Status:** Implementation-Ready  
**Scope:** US-only, English, USD, No price display

---

## 1. Executive Summary

### 1.1 Problem Statement
Consumers seeking PFAS-free kitchen products face:
- Misleading marketing claims ("PFOA-free" ≠ PFAS-free)
- No standardized verification system
- Difficulty understanding which product components contact food
- Scattered, unverified information across retailers

### 1.2 Solution
A trust-first affiliate browsing platform that:
- Applies a rigorous 5-tier verification system (0-4)
- Models products by components (food-contact surfaces identified)
- Shows evidence artifacts and what's missing (no silent failures)
- Provides compliant affiliate links with proper FTC disclosures

### 1.3 MVP Success Criteria
| Metric | Target |
|--------|--------|
| Products listed | 500 across 5 categories |
| Tier 1+ verification rate | ≥80% of listed products |
| Evidence coverage | 100% of products have ≥1 evidence object |
| FTC compliance | 100% disclosure placement |
| Page load (LCP) | <2.5s on 4G |

---

## 2. Epics and User Stories

### Epic 1: Product Discovery (E1)

#### E1-US1: Browse by Category
**As a** consumer  
**I want to** browse kitchen products by category  
**So that** I can find PFAS-free alternatives in the type of item I need

**Acceptance Criteria:**
1. Top navigation shows: Cookware, Bakeware, Storage, Utensils & Tools, Appliance Accessories
2. Each category page displays a product grid with:
   - Product name
   - Brand
   - Material/coating summary
   - Verification tier badge (0-4)
   - "Evidence available" indicator
   - Retailer chips (icons for where to buy)
3. Grid loads within 2.5s LCP on 4G connection
4. Affiliate disclosure appears above first row: "Affiliate links may appear in results."
5. Keyboard navigation works for all interactive elements (WCAG 2.2 AA)

**Error States:**
| Condition | Display |
|-----------|---------|
| Category has 0 products | "No verified products yet in this category. Check back soon or suggest a product." + suggestion CTA |
| API timeout (>5s) | "Unable to load products. Please refresh or try again later." + retry button |
| Invalid category slug | 404 page: "Category not found. Browse our categories:" + nav links |

**Empty States:**
| Condition | Display |
|-----------|---------|
| No products match filters | "No products match your filters. Try adjusting:" + list of active filters with remove buttons |

---

#### E1-US2: Filter Products by Facets
**As a** consumer  
**I want to** filter products by verification tier, material, and features  
**So that** I can narrow results to what matters most to me

**Acceptance Criteria:**
1. Filter panel includes facets (all categories):
   - Verification tier: 0, 1, 2, 3, 4 (checkboxes with counts)
   - Material: Stainless steel, Cast iron, Carbon steel, Glass, Silicone, Ceramic, Aluminum, Other
   - Food-contact surface: Bare metal, Enamel, Glass, Silicone, Coating unknown
   - Nonstick coating type: None, Ceramic sol-gel (claimed), Unknown (PTFE-family excluded from catalog)
2. Category-specific facets:
   - Cookware/Bakeware: Oven-safe temp, Induction compatible, Dishwasher safe, Metal utensil safe
   - Storage: Lid type, Microwave safe, Freezer safe
   - All: Size/volume range, Country of origin (if available), Retailer
3. Filter selections persist in URL query params (shareable)
4. "Clear all filters" button appears when any filter active
5. Product count updates live as filters change
6. Facet counts show (0) but remain clickable when no matches

**Error States:**
| Condition | Display |
|-----------|---------|
| Filter API fails | Filters disabled with tooltip: "Filters temporarily unavailable" + products still display |
| Invalid filter param in URL | Ignore invalid param, apply valid ones, no error shown |

---

#### E1-US3: Search Products
**As a** consumer  
**I want to** search by brand, product name, or material  
**So that** I can find specific products quickly

**Acceptance Criteria:**
1. Search bar appears in header on all pages
2. Search supports: brand name, product name, material keywords
3. If user searches "PFOA-free":
   - Show education banner: "PFOA-free refers to one chemical, not all PFAS. Learn what PFAS-free means →"
   - Still show results that mention PFOA-free (with context)
4. Search results page shows:
   - Total count: "X products found for 'query'"
   - Same grid format as category pages
   - Filters available
5. Autocomplete shows top 5 suggestions after 2 characters
6. Search history not stored (privacy)

**Error States:**
| Condition | Display |
|-----------|---------|
| Search service down | "Search temporarily unavailable. Browse by category instead." + category links |
| Query too short (<2 chars) | Inline hint: "Enter at least 2 characters" |
| Query too long (>200 chars) | Truncate and search first 200 chars |

**Empty States:**
| Condition | Display |
|-----------|---------|
| No results | "No products found for 'query'. Suggestions: Check spelling, Try broader terms, Browse categories" |

---

#### E1-US4: View Product Detail Page (PDP)
**As a** consumer  
**I want to** see complete product information and PFAS verification details  
**So that** I can make an informed purchase decision

**Acceptance Criteria:**
1. PDP header shows:
   - Product name, brand, category breadcrumb
   - Primary product image (from brand/retailer, compliant source only)
   - Verification tier badge (prominent)
2. "Food-Contact Materials" block (top of content):
   - List each component with: name, material, coating (if any), food-contact boolean
   - Visual indicator for food-contact components (icon + highlight)
3. "PFAS-Free Status" block:
   - Tier number and label
   - Claim type (A/B/C with plain-language explanation)
   - Scope statement: "Applies to: [component list]"
   - Confidence indicator (if applicable)
   - Evidence links with dates
4. "What Could Still Be Unknown" panel:
   - Lists any gaps: untested components, old evidence, limited sample scope
   - Never hidden even if empty (shows "All major components verified")
5. Affiliate CTA section:
   - "Buy at [Retailer]" buttons for each retailer
   - Disclosure directly above/adjacent: "Affiliate link: We may earn a commission if you purchase through this link."
6. "Report an Issue" link in footer of PDP

**Error States:**
| Condition | Display |
|-----------|---------|
| Product not found | 404: "Product not found. It may have been removed or the URL is incorrect." + search bar |
| Product under review | Banner: "This product is currently under review. Verification details may change." + show last known data |
| Evidence artifacts fail to load | "Evidence documents temporarily unavailable. Verification tier still valid as of [date]." |

---

### Epic 2: Verification and Trust (E2)

#### E2-US1: View Verification Tier Badge
**As a** consumer  
**I want to** see a clear verification tier on every product  
**So that** I can quickly assess trustworthiness

**Acceptance Criteria:**
1. Badge appears on: product cards (grid), PDP, compare tables
2. Badge design per tier:
   | Tier | Label | Color | Icon |
   |------|-------|-------|------|
   | 0 | Unknown | Gray | ? |
   | 1 | Brand Statement | Bronze | ✓ |
   | 2 | Policy Reviewed | Silver | ✓✓ |
   | 3 | Lab Tested | Gold | 🔬 |
   | 4 | Monitored | Platinum | 🔬+ |
3. Clicking badge opens tooltip/modal:
   - Tier explanation
   - What evidence exists
   - What's missing (if any)
   - "Learn more about our verification" link
4. Tier 0 badge shows: "PFAS status: Unknown - evidence incomplete"

**Error States:**
| Condition | Display |
|-----------|---------|
| Verification service down | Show last cached tier with: "(as of [date])" |
| Tier data missing | Default to Tier 0 with explicit "Verification pending" label |

---

#### E2-US2: View Evidence Artifacts
**As a** consumer  
**I want to** see the actual evidence supporting PFAS claims  
**So that** I can verify the information myself

**Acceptance Criteria:**
1. Evidence section on PDP shows for each evidence object:
   - Type: Lab report, Brand statement, Policy document, Screenshot
   - Source: Brand submission, Retailer, User report
   - Date received
   - "View document" link (opens in new tab or modal)
2. Lab reports additionally show:
   - Lab name
   - Method summary (plain language)
   - What was tested (components)
   - Detection limits (LOD/LOQ) with explanation tooltip
3. Evidence list sorted by: most recent first, then by type (lab reports > statements > screenshots)
4. All evidence PDFs served from our storage (no external hotlinks)

**Error States:**
| Condition | Display |
|-----------|---------|
| PDF fails to load | "Document temporarily unavailable. Try again later." + log error |
| Evidence expired (>24mo for Tier 3) | Banner on evidence: "This evidence is over 2 years old. Revalidation pending." |

---

#### E2-US3: Understand Claim Types
**As a** consumer  
**I want to** understand what type of PFAS claim is being made  
**So that** I know the limits of the verification

**Acceptance Criteria:**
1. Claim type displayed on PDP with standardized labels:
   | Type | Label | Subtext |
   |------|-------|---------|
   | A | No intentionally added PFAS | Based on brand statement |
   | B | Below detection limit | Lab tested for specific PFAS |
   | C | Total fluorine screen | Screening test (not compound-specific) |
2. Type C always shows limitation: "Screening indicates low fluorine but doesn't identify specific PFAS"
3. "What does this mean?" expandable section with plain-language explanation
4. Component scope always shown: "This claim applies to: [list]"

---

### Epic 3: Compare and Decide (E3)

#### E3-US1: Compare Products
**As a** consumer  
**I want to** compare multiple products side-by-side  
**So that** I can choose the best option

**Acceptance Criteria:**
1. "Add to compare" checkbox on product cards (max 4)
2. Sticky compare bar appears when ≥2 selected: "[N] products selected - Compare now"
3. Compare page shows table:
   - Columns: one per product
   - Rows: Name, Brand, Price (shows "See retailer" since no price display), Verification tier, Claim type, Materials, Food-contact coating, Key features (varies by category), Evidence count
4. Differences highlighted (different values get visual emphasis)
5. "View details" link per product
6. "Clear comparison" button

**Error States:**
| Condition | Display |
|-----------|---------|
| One product removed/unavailable | Show column with: "Product no longer available" + remove button |
| Compare service down | "Compare temporarily unavailable. View products individually." |

**Empty States:**
| Condition | Display |
|-----------|---------|
| User navigates to /compare with nothing selected | "Select products to compare. Browse categories to find products." |

---

### Epic 4: Click-Out and Conversion (E4)

#### E4-US1: Click Affiliate Link
**As a** consumer  
**I want to** click through to purchase at a retailer  
**So that** I can buy a verified product

**Acceptance Criteria:**
1. PDP shows "Buy at [Retailer]" button for each retailer carrying the product
2. If multiple retailers: show as list sorted alphabetically
3. Click flow:
   - User clicks button
   - Modal confirms: "You're leaving PFAS-Free Kitchen to visit [Retailer]. We may earn a commission."
   - "Continue to [Retailer]" and "Cancel" buttons
   - Continue opens retailer in new tab with affiliate link
4. Link includes: affiliate ID, tracking params, UTM tags
5. No price shown (MVP constraint)
6. Disclosure appears: adjacent to buttons, not hidden in footer

**Error States:**
| Condition | Display |
|-----------|---------|
| Affiliate link generation fails | "Unable to generate link. Try again or visit [Retailer] directly." + plain URL |
| Retailer no longer carries product | Hide that retailer button; if no retailers left: "Currently unavailable. Report outdated listing?" |

---

#### E4-US2: View Affiliate Disclosure
**As a** consumer  
**I want to** understand the site's affiliate relationships  
**So that** I can trust the recommendations aren't paid placement

**Acceptance Criteria:**
1. Sitewide disclosure:
   - Footer link: "Affiliate Disclosure" → /disclosure page
   - Disclosure page explains: what affiliate links are, that we earn commissions, that this doesn't affect verification
2. Per-page disclosure:
   - Product grid: "Affiliate links may appear in results." (above first row)
   - PDP: "Affiliate link: We may earn a commission if you purchase through this link." (near Buy button)
3. Disclosure text meets FTC "clear and conspicuous" standard:
   - Same font size as surrounding text (not smaller)
   - High contrast (readable)
   - Not hidden behind click/hover

---

### Epic 5: Reporting and Feedback (E5)

#### E5-US1: Report Product Issue
**As a** consumer  
**I want to** report problems with a product listing  
**So that** inaccurate information gets corrected

**Acceptance Criteria:**
1. "Report an issue" link on every PDP
2. Report form collects:
   - Issue type (required): Suspected PFAS, Materials changed, Listing mismatch, Counterfeit risk, Other
   - Description (required, 50-2000 chars)
   - Evidence upload (optional): images, PDFs, links
   - Email (optional): for follow-up
3. Confirmation: "Thank you. We'll review within 72 hours for high-priority issues."
4. Report stored with: timestamp, product ID, user session ID (anonymous)

**Error States:**
| Condition | Display |
|-----------|---------|
| Form submission fails | "Unable to submit. Please try again." + preserve form data |
| File upload fails | "File upload failed. Submit without file or try smaller file." |
| File too large (>10MB) | "File must be under 10MB." |

---

### Epic 6: Education and Context (E6)

#### E6-US1: Learn About PFAS Verification
**As a** consumer  
**I want to** understand how verification works  
**So that** I can trust the tier system

**Acceptance Criteria:**
1. "How We Verify" page (/how-we-verify) explains:
   - What PFAS are (plain language)
   - Why "PFOA-free" isn't the same as "PFAS-free"
   - The 5 tiers with requirements for each
   - What evidence we accept
   - Limitations of each verification approach
2. Inline education:
   - Tooltips on technical terms (LOD, LOQ, TOF, targeted panel)
   - "Learn more" links contextually placed
3. "Fluorine-free" vs "PFAS-free" explanation: prominently addressed

---

## 3. Compliance Requirements

### 3.1 FTC "Free-Of" Claims (16 CFR 260.9)

| Requirement | Implementation |
|-------------|----------------|
| Claim must be truthful | Only allow claim types A/B/C with evidence |
| Avoid implying broader claim | Always show scope: "Applies to: [components]" |
| Substance historically present | Only relevant for products that could contain PFAS (kitchen items qualify) |
| Not present at functional level | Tier 3 requires LOD/LOQ documentation |
| Disclose if in components | Component model shows all parts |

**Implementation Checklist:**
- [ ] No product can display "PFAS-free" badge without claim type + scope + evidence
- [ ] Tier 0 products show "Unknown" never "PFAS-free"
- [ ] Component model required for all food-contact items
- [ ] "What could still be unknown" panel never hidden

### 3.2 FTC Endorsement Guides (Affiliate Disclosure)

| Requirement | Implementation |
|-------------|----------------|
| Clear and conspicuous | Same font size, high contrast, not hidden |
| Near the endorsement | Adjacent to affiliate CTAs |
| Material connection disclosed | "We may earn a commission" language |

**Disclosure Placement Checklist:**
- [ ] Footer: Persistent "Affiliate Disclosure" link
- [ ] Category/Search grids: "Affiliate links may appear in results" above first row
- [ ] PDP: "Affiliate link: We may earn a commission..." near Buy buttons
- [ ] Disclosure page: Full explanation at /disclosure

### 3.3 Amazon Associates Compliance

| Requirement | Implementation |
|-------------|----------------|
| No price display without PA-API | MVP: No price display (compliant by default) |
| No scraping | Only PA-API or approved feeds |
| Product Advertising API terms | Caching ≤24 hours if price ever added |
| Operating Agreement | Review before launch; update terms quarterly |

**MVP Constraints (Amazon-specific):**
- [ ] No Amazon prices displayed
- [ ] No Amazon reviews displayed
- [ ] Product data from PA-API only (not scraped)
- [ ] "Buy at Amazon" links use Associates link format
- [ ] Amazon trademark used per brand guidelines

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Category page) | <2.5s | Lighthouse on 4G throttle |
| TTFB (PDP) | <200ms | Server-side, cached |
| CLS | <0.1 | No layout shift after load |
| FID | <100ms | User interaction response |

### 4.2 Accessibility

| Standard | Requirement |
|----------|-------------|
| WCAG 2.2 AA | Full compliance |
| Keyboard navigation | All interactive elements |
| Screen reader | ARIA labels on badges, buttons, forms |
| Color contrast | 4.5:1 minimum |
| Focus indicators | Visible on all focusable elements |

### 4.3 Security

| Area | Requirement |
|------|-------------|
| HTTPS | All pages |
| CSP | Strict content security policy |
| Input validation | All user inputs sanitized |
| Rate limiting | Search: 60/min, Reports: 5/min |

### 4.4 Privacy

| Requirement | Implementation |
|-------------|----------------|
| No tracking cookies (MVP) | First-party analytics only |
| No PII collection | Email optional on reports only |
| CCPA-ready | Privacy policy + opt-out mechanism |
| Data retention | Reports: 2 years, Analytics: 1 year |

---

## 5. Out of Scope (MVP)

| Feature | Reason | Future Version |
|---------|--------|----------------|
| User accounts | Complexity; not needed for browse/click | v1 |
| Price display | Affiliate compliance complexity | v1 (if PA-API stable) |
| Saved lists | Requires accounts | v1 |
| Alerts | Requires accounts + notification system | v2 |
| Non-US markets | Legal complexity, currency, translation | v2 |
| Brand portal | Separate admin tool | v1 |
| Mobile apps | Web-first, responsive | v2 |

---

## 6. Launch Criteria

### 6.1 Content Readiness
- [ ] 500 products loaded across all 5 categories
- [ ] 100% of products have verification tier assigned
- [ ] 100% of products have ≥1 evidence object
- [ ] 80% of products at Tier 1+
- [ ] All category pages have ≥20 products

### 6.2 Compliance Readiness
- [ ] Legal review of: Terms, Privacy Policy, Disclosure page, Claim language
- [ ] FTC disclosure placement verified on all surfaces
- [ ] Amazon Associates account approved and links tested
- [ ] "How We Verify" page reviewed for accuracy

### 6.3 Technical Readiness
- [ ] All error states implemented and tested
- [ ] All empty states implemented and tested
- [ ] Performance targets met (Lighthouse audit)
- [ ] Accessibility audit passed (axe-core)
- [ ] Security scan passed (no critical/high vulnerabilities)
- [ ] Monitoring and alerting configured

### 6.4 Operational Readiness
- [ ] Admin console functional for review team
- [ ] Report queue workflow tested
- [ ] Incident response runbook documented
- [ ] Rollback procedure tested

---

## 7. Appendix

### 7.1 Glossary

| Term | Definition |
|------|------------|
| PFAS | Per- and polyfluoroalkyl substances; a class of ~15,000 chemicals |
| PFOA | Perfluorooctanoic acid; one specific PFAS compound |
| PTFE | Polytetrafluoroethylene (Teflon); a fluoropolymer |
| LOD | Limit of Detection; lowest amount detectable |
| LOQ | Limit of Quantification; lowest amount measurable with precision |
| TOF | Total Organic Fluorine; screening method |
| Food-contact | Surface that touches food during normal use |

### 7.2 Category Taxonomy

```
Cookware
├── Skillets & Frying Pans
├── Saucepans
├── Stock Pots & Dutch Ovens
├── Sauté Pans
├── Woks
├── Griddles & Grill Pans
└── Specialty (Roasters, Braisers)

Bakeware
├── Sheet Pans & Baking Sheets
├── Cake Pans
├── Muffin & Cupcake Pans
├── Loaf Pans
├── Pie & Tart Pans
├── Baking Dishes
└── Cooling Racks

Storage
├── Food Containers (Glass)
├── Food Containers (Stainless)
├── Food Containers (Silicone)
├── Bags & Wraps (Reusable)
├── Jars & Canisters
└── Lunch Boxes

Utensils & Tools
├── Spatulas & Turners
├── Spoons & Ladles
├── Tongs
├── Whisks
├── Cutting Boards
└── Mixing Bowls

Appliance Accessories
├── Air Fryer Liners & Baskets
├── Instant Pot Accessories
├── Blender Containers
├── Toaster Oven Trays
└── Food Processor Bowls
```

### 7.3 Verification Tier Decision Matrix

| Criterion | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|-----------|--------|--------|--------|--------|--------|
| Brand attestation | ❌ | ✅ | ✅ | ✅ | ✅ |
| Component model | ❌ | ❌ | ✅ | ✅ | ✅ |
| Materials documented | ❌ | ❌ | ✅ | ✅ | ✅ |
| Risk-term scan passed | ❌ | ❌ | ✅ | ✅ | ✅ |
| Third-party lab test | ❌ | ❌ | ❌ | ✅ | ✅ |
| Scheduled revalidation | ❌ | ❌ | ❌ | ❌ | ✅ |
