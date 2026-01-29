# E2E Validation Checklist

> **Date**: ____________  
> **Tester**: ____________  
> **Version**: ____________

---

## Pre-Validation Setup

```bash
# Terminal 1: Start services
cd src/pfas-api && docker-compose up -d postgres opensearch

# Terminal 2: Start API
cd src/pfas-api && npm run dev

# Terminal 3: Start Frontend
cd src/pfas-web && npm run dev

# Seed database
cd src/pfas-api && npx tsx scripts/seed-database.ts

# Index search
cd src/pfas-api && npx tsx scripts/setup-search-index.ts reindex
```

---

## User Journey Validation

### Journey 1: Browse and Filter
- [ ] Open homepage
- [ ] Click "Cookware" in navigation
- [ ] Verify products load
- [ ] Verify tier badges display on all cards
- [ ] Click "Tier 3" filter
- [ ] Verify URL updates with ?tier=3
- [ ] Verify only Tier 3 products shown
- [ ] Click "Stainless Steel" material filter
- [ ] Verify results narrow further
- [ ] Click "Clear all filters"
- [ ] Verify all products return

### Journey 2: Search
- [ ] Enter "skillet" in search bar
- [ ] Verify autocomplete shows suggestions
- [ ] Press Enter to search
- [ ] Verify search results page loads
- [ ] Verify results relevant to "skillet"
- [ ] Enter "PFOA-free" in search
- [ ] Verify education banner appears
- [ ] Verify banner explains PFOA ≠ PFAS

### Journey 3: Product Detail
- [ ] Click on a product card
- [ ] Verify PDP loads
- [ ] Verify breadcrumb navigation
- [ ] Verify "Food-Contact Materials" section visible
- [ ] Verify components listed with materials
- [ ] Verify "PFAS-Free Status" section
- [ ] Verify tier badge matches
- [ ] Verify claim type shown
- [ ] Verify "What Could Still Be Unknown" section
- [ ] Verify unknowns listed (or "All verified")
- [ ] Verify "Buy at [Retailer]" buttons
- [ ] Verify affiliate disclosure near buttons

### Journey 4: Affiliate Click-Out
- [ ] On PDP, click "Buy at Amazon"
- [ ] Verify modal appears
- [ ] Verify modal shows disclosure
- [ ] Verify "Continue to Amazon" button
- [ ] Click cancel
- [ ] Verify modal closes
- [ ] Click "Buy at Amazon" again
- [ ] Click "Continue"
- [ ] Verify new tab opens to Amazon
- [ ] Verify affiliate tag in URL

### Journey 5: Compare Products
- [ ] On category page, check compare box on Product A
- [ ] Verify compare bar appears
- [ ] Check compare box on Product B
- [ ] Verify compare bar shows "2 products"
- [ ] Click "Compare now"
- [ ] Verify compare page loads
- [ ] Verify both products in table
- [ ] Verify differences highlighted
- [ ] Verify tier and claim type columns

### Journey 6: Report Issue
- [ ] On PDP, click "Report an issue"
- [ ] Verify report form opens
- [ ] Select "Suspected PFAS" issue type
- [ ] Enter description (50+ chars)
- [ ] Click Submit
- [ ] Verify confirmation message

### Journey 7: Education Pages
- [ ] Click "How We Verify" in footer
- [ ] Verify page loads with tier explanations
- [ ] Verify all 5 tiers described
- [ ] Click "Affiliate Disclosure" in footer
- [ ] Verify disclosure page loads
- [ ] Verify FTC compliance text present

---

## Error Handling Validation

- [ ] Stop API server
- [ ] Refresh category page
- [ ] Verify error state displays
- [ ] Verify "Try Again" button present
- [ ] Start API server
- [ ] Click "Try Again"
- [ ] Verify products load
- [ ] Navigate to /product/nonexistent-product
- [ ] Verify 404 page displays
- [ ] Verify link back to browse
- [ ] On search page, enter very long query (200+ chars)
- [ ] Verify no crash
- [ ] Verify truncation handled

---

## Accessibility Validation

- [ ] Navigate entire site using only keyboard
- [ ] Tab through category page
- [ ] Verify focus visible on all elements
- [ ] Verify skip link works
- [ ] Verify filter checkboxes keyboard accessible
- [ ] Verify modals trap focus
- [ ] Verify Escape closes modals

### axe-core Audit
```bash
npx playwright test --project=accessibility
```

- [ ] No critical violations
- [ ] No serious violations

---

## Performance Validation

### Lighthouse Audits
```bash
npm run lighthouse
```

**Target Scores:**
- [ ] Performance: > 90
- [ ] Accessibility: > 95
- [ ] Best Practices: > 90
- [ ] SEO: > 90

**Core Web Vitals:**
- [ ] LCP < 2.5s on category page
- [ ] CLS < 0.1 on all pages
- [ ] FID < 100ms

---

## Data Quality Validation

```bash
cd src/pfas-api && npx tsx scripts/validate-data-quality.ts
```

- [ ] All published products have evidence: PASS
- [ ] All published products have tier: PASS
- [ ] Tier 3+ products have lab report: PASS
- [ ] Tier 1+ coverage >= 80%: PASS

---

## API Contract Validation

```bash
# Products list
curl http://localhost:3001/api/v1/products | jq '.data[0] | keys'

# Product detail
curl http://localhost:3001/api/v1/products/all-clad-d3-stainless-steel-12-skillet | jq '.data | keys'

# Search
curl "http://localhost:3001/api/v1/search?q=skillet" | jq '.data | keys'

# Categories
curl http://localhost:3001/api/v1/categories | jq '.data[0] | keys'
```

- [ ] Products list returns expected schema
- [ ] Product detail returns expected schema
- [ ] Search returns expected schema
- [ ] Categories returns expected schema

---

## Final Checklist

### Functional
- [ ] Browse categories: WORKS
- [ ] Filter products: WORKS
- [ ] Search products: WORKS
- [ ] View product detail: WORKS
- [ ] Click affiliate links: WORKS
- [ ] Compare products: WORKS
- [ ] Submit report: WORKS
- [ ] Education pages: WORKS

### Compliance
- [ ] Category disclosure: PRESENT
- [ ] PDP disclosure: PRESENT
- [ ] Modal disclosure: PRESENT
- [ ] Footer disclosure link: PRESENT
- [ ] Disclosure page: COMPLETE

### Technical
- [ ] API responds correctly: YES
- [ ] Search index populated: YES
- [ ] Database seeded: YES
- [ ] Error states work: YES
- [ ] Loading states work: YES

### Quality
- [ ] Lighthouse Performance > 90: YES
- [ ] Lighthouse Accessibility > 95: YES
- [ ] No critical axe violations: YES
- [ ] All journeys complete: YES

---

## Sign-Off

**Status**: [ ] READY FOR LAUNCH  /  [ ] NOT READY

**Blockers** (if any):
1. ________________________________________
2. ________________________________________
3. ________________________________________

**Notes**:
________________________________________
________________________________________
________________________________________

---

**Signed**: ________________________  
**Date**: ________________________
