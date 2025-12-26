# Design Demo Comparison

Three complete standalone demo websites showcasing different hero/theme approaches for the Dawson Does Framework marketing site.

## Quick Open Commands

```bash
open output/shared/design/demos/demo-1-light-hero.html
open output/shared/design/demos/demo-2-navy-hero.html
open output/shared/design/demos/demo-3-warm-sand.html
```

## Comparison

| Aspect | Demo 1 (Light) | Demo 2 (Navy) | Demo 3 (Warm Sand) |
|--------|---------------|---------------|-------------------|
| **Hero BG** | White `#FFFFFF` | Navy `#1E3A5F` | Cream `#FDF8F3` |
| **Hero Text** | Dark stone `#1C1917` | White | Warm brown `#44403C` |
| **Vibe** | Clean/Professional | Premium/Corporate | Warm/Artisanal |
| **Similar To** | HubSpot, Notion, Airtable | Stripe, Linear | Luxury/Lifestyle brands |
| **Best For** | Maximum clarity | Visual impact | Unique identity |
| **Footer** | Navy | Navy (matches hero) | Deep brown |
| **Orange Usage** | Primary accent | High contrast on navy | Deep/earthy orange |

## Design Tokens

### Demo 1: Light Hero
```css
--hero-bg: #FFFFFF;
--hero-text: #1C1917;
--accent: #F97316;
--footer-bg: #1E3A5F;
```

### Demo 2: Navy Hero
```css
--hero-bg: #1E3A5F;
--hero-text: #FFFFFF;
--accent: #F97316 (brighter: #FB923C on dark);
--footer-bg: #1E3A5F;
```

### Demo 3: Warm Sand
```css
--hero-bg: #FDF8F3;
--hero-text: #44403C;
--accent: #EA580C;
--footer-bg: #292524;
```

## Key Differences

### Hero Transition
- **Demo 1**: No transition needed (hero is white, content is white)
- **Demo 2**: Navy fades to white with `linear-gradient(to bottom, transparent, #FFFFFF)`
- **Demo 3**: Subtle (cream to warmer white)

### Card Styling
All demos use elevated white cards with:
- `border-radius: 16px`
- `box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08)`
- `border: 1px solid` (light border)
- Hover: lift + orange border accent

### Terminal Styling
Consistent across all demos:
- Background: Dark slate `#1E293B` or stone `#292524`
- Header: Darker with traffic light dots
- Text: Light slate/stone
- Prompt: Orange accent

## Pick & Mix

Review all 3 demos and note which elements work best for the final design:

- [ ] Hero style from: Demo ___
- [ ] Card styling from: Demo ___
- [ ] Color warmth from: Demo ___
- [ ] Footer from: Demo ___
- [ ] Terminal styling from: Demo ___
- [ ] Button styling from: Demo ___

## Sections Included

Each demo includes all 10 required sections:
1. ✅ Navigation (fixed, with CTAs)
2. ✅ Hero (badge, headline, CTAs, features strip, terminal)
3. ✅ Features Grid (6 cards, 3x2)
4. ✅ See It in Action (toggle + terminal demo)
5. ✅ Comparison Table (4 rows)
6. ✅ Feature Showcase (3 cards)
7. ✅ Before & After (code comparison)
8. ✅ Testimonials (stats + 6 cards)
9. ✅ Final CTA (terminal + buttons)
10. ✅ Footer (4 columns)

---

*Created by Website Agent | 2025-12-25*

