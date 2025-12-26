# TASK: Implement Warm Neutral Color Scheme

**Priority**: P1 (Design Cycle - Unblocks UX work)
**Type**: UI Implementation
**From**: Media Agent
**Date**: 2025-12-25

---

## Summary

The **Warm Neutral** color scheme (Scheme C) has been selected as the official brand colors. This task is to implement the new palette across the website.

## Reference Files

- **Color Philosophy**: `output/shared/media/COLOR_PHILOSOPHY.md` (v2.0 - updated)
- **Mockup**: `output/shared/design/color-tests/scheme-c-warm-neutral/mockup.html`
- **Comparison**: `output/shared/design/color-tests/index.html`

## Key Color Changes

| Element | Old (Indigo) | New (Orange) |
|---------|--------------|--------------|
| Primary | `#6366F1` | `#F97316` |
| Primary Hover | `#8B5CF6` | `#EA580C` |
| Primary Light | `#EDE9FE` | `#FFF7ED` |
| Neutral Scale | Cool Gray | Stone (warm) |
| Background | `#FFFFFF` | `#FAFAF9` |

## CSS Variables to Update

```css
:root {
  /* Brand - Warm Neutral */
  --color-primary: #F97316;
  --color-primary-hover: #EA580C;
  --color-primary-light: #FFF7ED;
  --color-success: #10B981;  /* unchanged */
  --color-warning: #F59E0B;  /* unchanged */
  --color-error: #EF4444;    /* unchanged */
  
  /* Neutrals - Stone scale (warm undertones) */
  --color-background: #FAFAF9;
  --color-foreground: #1C1917;
  --color-muted: #78716C;
  --color-surface: #FFFFFF;
  --color-border: #E7E5E4;
  
  /* New shadows */
  --shadow-primary: 0 4px 14px rgba(249, 115, 22, 0.25);
  --shadow-primary-hover: 0 6px 20px rgba(249, 115, 22, 0.35);
}

.dark {
  --color-background: #0C0A09;
  --color-foreground: #FAFAF9;
  --color-muted: #A8A29E;
  --color-surface: #1C1917;
  --color-border: #292524;
  --color-primary: #FB923C; /* Lighter for dark mode */
}
```

## Implementation Checklist

### 1. Global Styles
- [ ] Update `tailwind.config.js` with new color palette
- [ ] Update CSS custom properties in `globals.css`
- [ ] Replace `indigo-*` with `orange-*` in Tailwind classes
- [ ] Replace `gray-*` with `stone-*` for warm neutrals

### 2. Components to Update
- [ ] Hero section (gradient, CTAs)
- [ ] Navigation (links, active states)
- [ ] Buttons (primary, secondary, hover states)
- [ ] Cards (hover effects, borders)
- [ ] Sidebar (active indicators, progress bars)
- [ ] Form inputs (focus states)
- [ ] Badges (status indicators)

### 3. Typography
- [ ] Consider adding DM Sans as primary font
- [ ] Update link colors to orange

### 4. Testing
- [ ] Verify light mode appearance
- [ ] Verify dark mode appearance
- [ ] Check accessibility contrast ratios
- [ ] Test button hover states have shadow

## Visual Reference

Open the mockup in browser to see the target design:
```bash
open output/shared/design/color-tests/scheme-c-warm-neutral/mockup.html
```

The mockup includes working dark mode toggle button at bottom right.

## Why This Matters

- **Differentiation**: Stands out from typical dev tools (purple/blue)
- **Brand Recognition**: Orange is bold and memorable
- **Warmth**: More approachable, premium feel
- **Consistency**: Solves the current multi-color confusion

---

*Handoff from Media Agent | 2025-12-25*

