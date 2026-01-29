# PFAS-Free Kitchen - Public Frontend

Next.js public-facing frontend for the PFAS-Free Kitchen platform.

## Quick Start

```bash
cd src/pfas-web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, tier explanation, and category links |
| `/[category]` | Category browse page with product grid |
| `/product/[slug]` | Product detail page with verification info |
| `/search` | Search results page |
| `/compare` | Product comparison page |
| `/education` | Education hub |
| `/education/how-we-verify` | Verification process explanation |
| `/disclosure` | Affiliate disclosure page |

## Components

### Layout
- `Header` - Site header with logo, navigation, and search
- `Footer` - Site footer with links and disclosure
- `Navigation` - Main navigation links
- `AffiliateDisclosure` - FTC disclosure component (banner, inline, footer variants)

### Product
- `ProductCard` - Product card for grids
- `ProductGrid` - Responsive product grid
- `TierBadge` - Verification tier badge with tooltip
- `ComponentList` - Food-contact materials list
- `UnknownsPanel` - "What could still be unknown" section
- `RetailerButtons` - Where to buy with click-out modal

### Search
- `SearchBar` - Search input with clear button
- `EducationBanner` - Educational callout for search terms

### UI Primitives
- `Button` - Primary, secondary, ghost, danger variants
- `Badge` - Status badges
- `Tooltip` - Radix UI tooltip
- `Modal` - Radix UI dialog
- `Pagination` - Page navigation

## Verification Tiers

| Tier | Label | Description |
|------|-------|-------------|
| 4 | Monitored | Ongoing testing + supply chain monitoring |
| 3 | Lab Tested | Third-party lab testing confirms PFAS-free |
| 2 | Policy Reviewed | Brand documentation reviewed |
| 1 | Brand Statement | Unverified brand claim |
| 0 | Unknown | PFAS status not verified |

## Accessibility (WCAG 2.2 AA)

- ✅ Skip to main content link
- ✅ Keyboard navigation on all interactive elements
- ✅ Focus indicators
- ✅ ARIA labels on badges and icons
- ✅ Semantic HTML structure
- ✅ 4.5:1 color contrast

## FTC Disclosure Placement

Per FTC guidelines, affiliate disclosures appear:
1. Footer link to `/disclosure`
2. Banner above category grids
3. Text adjacent to buy buttons
4. Click-out confirmation modal

## Performance Targets

- LCP < 2.5s on 4G
- CLS < 0.1
- FID < 100ms
- Next.js Image optimization
- ISR for category pages

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- CSS Modules
- Radix UI (Dialog, Tooltip)
- clsx (class utilities)
- Playwright (E2E testing)
- axe-core (accessibility testing)

## Testing

### Run Tests

```bash
# All E2E tests
npm test

# Specific browser
npm run test:e2e              # Chromium only
npm run test:mobile           # Mobile browsers

# Specific test types
npm run test:journeys         # User journey tests
npm run test:a11y             # Accessibility tests
npm run test:perf             # Performance tests

# Interactive mode
npm run test:ui               # Playwright UI mode

# View report
npm run test:report           # Open HTML report
```

### User Journeys Tested

1. **Browse and Filter** - Category navigation, tier/material filters
2. **Search** - Autocomplete, results, education banners
3. **Product Detail** - PDP sections, materials, evidence
4. **Affiliate Click-Out** - Modal, disclosure, retailer redirect
5. **Compare Products** - Selection, compare page, differences
6. **Report Issue** - Form, validation, submission
7. **Education Pages** - How We Verify, Disclosure

### Performance Validation

```bash
# Run Lighthouse audits
npm run lighthouse

# Generate validation report
npm run validate
```

See `VALIDATION_CHECKLIST.md` for full pre-launch checklist.

## Environment Variables

```env
# Optional: API base URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Project Structure

```
src/pfas-web/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles
│   ├── (browse)/
│   │   └── [category]/
│   │       └── page.tsx        # Category page
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx        # Product detail
│   ├── search/
│   │   └── page.tsx            # Search results
│   ├── compare/
│   │   └── page.tsx            # Comparison
│   ├── education/
│   │   ├── page.tsx            # Education hub
│   │   └── how-we-verify/
│   │       └── page.tsx        # Verification explainer
│   └── disclosure/
│       └── page.tsx            # Affiliate disclosure
├── components/
│   ├── layout/
│   ├── product/
│   ├── search/
│   └── ui/
├── lib/
│   └── types.ts                # Shared types
├── tests/
│   ├── journeys/               # User journey tests
│   │   ├── browse-filter.spec.ts
│   │   ├── search.spec.ts
│   │   ├── product-detail.spec.ts
│   │   ├── affiliate-clickout.spec.ts
│   │   ├── compare.spec.ts
│   │   ├── report-issue.spec.ts
│   │   └── education.spec.ts
│   ├── accessibility.spec.ts   # WCAG 2.2 AA tests
│   ├── error-handling.spec.ts  # Error state tests
│   ├── performance.spec.ts     # Core Web Vitals
│   └── disclosure-audit.spec.ts# FTC compliance
├── scripts/
│   ├── run-lighthouse.ts       # Lighthouse automation
│   └── validation-report.ts    # Launch readiness report
├── playwright.config.ts        # Playwright configuration
├── VALIDATION_CHECKLIST.md     # Pre-launch checklist
└── public/
    └── placeholder-product.svg
```
