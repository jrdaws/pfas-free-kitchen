# Inspiration → Layout Mapping System - Complete

**Task**: `20260105-P1-inspiration-mapping.txt`
**Status**: ✅ Complete
**Completed**: 2026-01-05

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Inspiration URL(s)                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Section Detector                                 │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Claude Vision   │ OR │ HTML Parsing    │                            │
│  │ (screenshot)    │    │ (class names)   │                            │
│  └─────────────────┘    └─────────────────┘                            │
│                                                                         │
│  Output: DetectedSection[] (type, order, height, images, columns)      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Pattern Matcher                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 45+ Patterns in Registry                                         │   │
│  │ hero, features, pricing, testimonials, cta, faq, footer, etc.   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Scoring: category match + image match + column match + tags           │
│  Output: PatternMapping[] (patternId, variant, confidence)             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Style Extractor                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │ CSS Parsing     │ +  │ HTML Inline     │ +  │ Vision Analysis │     │
│  │ (variables)     │    │ (styles)        │    │ (screenshot)    │     │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘     │
│                                                                         │
│  Output: ExtractedStyles (colors, typography, spacing, radius)         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Layout Composer                                  │
│                                                                         │
│  Input: DetectedSection[] + ExtractedStyles                            │
│  Output: InspirationComposition                                        │
│    - sections: PatternMapping[]                                        │
│    - styles: ExtractedStyles                                           │
│    - layout: { type, navigation, contentWidth }                        │
│    - metadata: { sourceUrl, analysisTime, overallConfidence }          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Composer Selector                                │
│                                                                         │
│  Priority:                                                              │
│  1. InspirationComposition (if provided)                               │
│  2. DesignAnalysis (if provided)                                       │
│  3. AI Selection (fallback)                                            │
│                                                                         │
│  Output: SelectorOutput (sections + layoutRecommendation)              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Example Output: stripe.com

```json
{
  "sections": [
    { "sectionIndex": 0, "patternId": "nav-transparent", "variant": "dark", "confidence": 0.92, "source": "exact" },
    { "sectionIndex": 1, "patternId": "hero-gradient", "variant": "gradient", "confidence": 0.88, "source": "similar" },
    { "sectionIndex": 2, "patternId": "logos-row", "variant": "light", "confidence": 0.95, "source": "exact" },
    { "sectionIndex": 3, "patternId": "features-bento", "variant": "light", "confidence": 0.85, "source": "similar" },
    { "sectionIndex": 4, "patternId": "testimonials-carousel", "variant": "dark", "confidence": 0.82, "source": "similar" },
    { "sectionIndex": 5, "patternId": "pricing-cards", "variant": "light", "confidence": 0.90, "source": "exact" },
    { "sectionIndex": 6, "patternId": "cta-gradient", "variant": "gradient", "confidence": 0.88, "source": "similar" },
    { "sectionIndex": 7, "patternId": "footer-mega", "variant": "dark", "confidence": 0.95, "source": "exact" }
  ],
  "styles": {
    "colors": {
      "primary": "#635BFF",
      "secondary": "#0A2540",
      "accent": "#00D4FF",
      "background": "#FFFFFF",
      "text": "#0A2540",
      "confidence": 0.92
    },
    "typography": {
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "fontWeight": "normal",
      "letterSpacing": "tight",
      "confidence": 0.85
    },
    "borderRadius": "lg",
    "shadows": "subtle",
    "animations": "rich"
  },
  "layout": {
    "type": "marketing",
    "navigation": "transparent",
    "contentWidth": "wide"
  },
  "metadata": {
    "sourceUrl": "https://stripe.com",
    "analysisTime": 2340,
    "overallConfidence": 0.87
  }
}
```

---

## Example Output: linear.app

```json
{
  "sections": [
    { "sectionIndex": 0, "patternId": "nav-sticky", "variant": "dark", "confidence": 0.90, "source": "exact" },
    { "sectionIndex": 1, "patternId": "hero-centered", "variant": "dark", "confidence": 0.92, "source": "exact" },
    { "sectionIndex": 2, "patternId": "features-bento", "variant": "dark", "confidence": 0.88, "source": "similar" },
    { "sectionIndex": 3, "patternId": "stats-row", "variant": "dark", "confidence": 0.85, "source": "similar" },
    { "sectionIndex": 4, "patternId": "testimonials-wall", "variant": "dark", "confidence": 0.80, "source": "similar" },
    { "sectionIndex": 5, "patternId": "cta-centered", "variant": "gradient", "confidence": 0.90, "source": "exact" },
    { "sectionIndex": 6, "patternId": "footer-columns", "variant": "dark", "confidence": 0.95, "source": "exact" }
  ],
  "styles": {
    "colors": {
      "primary": "#5E6AD2",
      "secondary": "#3D4270",
      "accent": "#FFD700",
      "background": "#0D0E14",
      "text": "#FFFFFF",
      "confidence": 0.90
    },
    "typography": {
      "headingFont": "sans-serif",
      "bodyFont": "sans-serif",
      "fontWeight": "normal",
      "letterSpacing": "tight",
      "confidence": 0.75
    },
    "borderRadius": "md",
    "shadows": "subtle",
    "animations": "subtle"
  },
  "layout": {
    "type": "marketing",
    "navigation": "fixed",
    "contentWidth": "standard"
  },
  "metadata": {
    "sourceUrl": "https://linear.app",
    "analysisTime": 1890,
    "overallConfidence": 0.85
  }
}
```

---

## Integration Instructions

### For Website Agent

To use inspiration mapping in the composer:

```typescript
import { composeFromInspiration } from "@/lib/inspiration";

// 1. Analyze inspiration URL(s)
const composition = await composeFromInspiration([
  "https://stripe.com",
  "https://linear.app",
]);

// 2. Pass to selector
const selectorInput: SelectorInput = {
  vision: userVision,
  research: researchResult,
  inspirationComposition: composition,  // NEW
  availablePatterns: getAllPatterns(),
  pageType: "home",
};

// 3. Selector will prioritize inspiration data
const selection = await selectPatterns(selectorInput);
```

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/inspiration/types.ts` | Type definitions |
| `lib/inspiration/section-detector.ts` | Vision + HTML section detection |
| `lib/inspiration/pattern-matcher.ts` | Map sections to 45+ patterns |
| `lib/inspiration/style-extractor.ts` | CSS + Vision style extraction |
| `lib/inspiration/layout-composer.ts` | Main composition logic |
| `lib/inspiration/index.ts` | Public exports |

## Files Modified

| File | Change |
|------|--------|
| `lib/composer/types.ts` | Added `inspirationComposition` to `SelectorInput` |
| `lib/composer/selector.ts` | Added `selectFromInspiration()` function |

---

## Section Types Detected

| Type | Indicators |
|------|------------|
| hero | hero, banner, welcome, jumbotron, landing |
| features | features, benefits, capabilities, advantages |
| pricing | pricing, plans, price, tier, subscription |
| testimonials | testimonials, reviews, customers, quotes |
| faq | faq, questions, help, accordion |
| cta | cta, signup, get-started, trial |
| footer | footer, site-footer |
| stats | stats, numbers, metrics, achievements |
| logos | logos, clients, trusted, companies |
| team | team, about-us, people, leadership |
| blog | blog, posts, articles, news |
| how-it-works | how-it-works, process, steps, workflow |
| integrations | integrations, partners, connect |
| gallery | gallery, portfolio, showcase |
| contact | contact, get-in-touch |

---

## Acceptance Criteria

- [x] Section detector identifies 5+ section types
- [x] Pattern matcher maps to existing patterns
- [x] Style extractor pulls colors and fonts
- [x] Layout composer produces valid composition
- [x] Selector uses inspiration when available
- [x] Fallback works when inspiration analysis fails
- [x] Build passes with no errors

---

*Platform Agent | 2026-01-05*

