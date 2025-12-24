# Shared Design Tokens

> **Purpose**: Centralized design system values for consistent UI across all projects

---

## What Goes Here

### 1. Color Tokens

```json
// colors.tokens.json
{
  "brand": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#f59e0b"
  },
  "semantic": {
    "success": "#22c55e",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6"
  },
  "neutral": {
    "50": "#fafafa",
    "100": "#f5f5f5",
    "900": "#171717"
  }
}
```

### 2. Typography Tokens

```json
// typography.tokens.json
{
  "fontFamily": {
    "sans": "Inter, system-ui, sans-serif",
    "mono": "JetBrains Mono, monospace",
    "display": "Cal Sans, sans-serif"
  },
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem"
  },
  "fontWeight": {
    "normal": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  }
}
```

### 3. Spacing Tokens

```json
// spacing.tokens.json
{
  "space": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem",
    "12": "3rem",
    "16": "4rem"
  }
}
```

### 4. Component Tokens

```json
// components.tokens.json
{
  "button": {
    "borderRadius": "0.5rem",
    "paddingX": "1rem",
    "paddingY": "0.5rem",
    "fontSize": "0.875rem"
  },
  "card": {
    "borderRadius": "0.75rem",
    "padding": "1.5rem",
    "shadow": "0 1px 3px rgba(0,0,0,0.1)"
  },
  "input": {
    "borderRadius": "0.375rem",
    "borderColor": "#e5e7eb",
    "focusRing": "#6366f1"
  }
}
```

---

## Usage

### In Tailwind Config

```javascript
// tailwind.config.ts
import colors from './output/shared/design/colors.tokens.json';
import typography from './output/shared/design/typography.tokens.json';

export default {
  theme: {
    extend: {
      colors: colors.brand,
      fontFamily: typography.fontFamily,
    }
  }
}
```

### In CSS Variables

```css
/* Generated from tokens */
:root {
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --font-sans: Inter, system-ui, sans-serif;
  --space-4: 1rem;
}
```

### In Components

```tsx
import tokens from '@/output/shared/design/colors.tokens.json';

const Button = () => (
  <button style={{ backgroundColor: tokens.brand.primary }}>
    Click me
  </button>
);
```

---

## Relationship to COLOR_PHILOSOPHY.md

This folder contains **machine-readable tokens**.
`output/shared/media/COLOR_PHILOSOPHY.md` contains **human-readable guidelines**.

| File | Purpose |
|------|---------|
| `COLOR_PHILOSOPHY.md` | Why we chose these colors, mood, psychology |
| `colors.tokens.json` | Actual hex values for code |

---

## Naming Convention

```
[category].tokens.json
```

Examples:
- `colors.tokens.json`
- `typography.tokens.json`
- `spacing.tokens.json`
- `components.tokens.json`
- `animation.tokens.json`

