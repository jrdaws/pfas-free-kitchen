/**
 * Style Generator
 * 
 * Generates Tailwind configuration and CSS from website analysis.
 * Applies extracted colors, fonts, and design tokens to exports.
 */

import { GeneratedFile } from "./types";

export interface VisualAnalysis {
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
    background: string;
    foreground: string;
    muted?: string;
    border?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize?: string;
    lineHeight?: string;
  };
  components: {
    buttons: {
      shape: 'rounded' | 'pill' | 'square';
      style: 'filled' | 'outline' | 'ghost';
    };
    cards: {
      shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
      rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    };
    inputs: {
      style: 'filled' | 'outline' | 'underline';
      rounded: 'none' | 'sm' | 'md' | 'lg' | 'full';
    };
  };
  spacing?: {
    base: number;
    scale: 'tight' | 'normal' | 'relaxed';
  };
  darkMode?: boolean;
}

/**
 * Generate tailwind.config.ts from visual analysis
 */
export function generateTailwindConfig(visual: VisualAnalysis): string {
  const buttonRadius = getButtonRadius(visual.components.buttons.shape);
  const cardRadius = getRadius(visual.components.cards.rounded);
  const inputRadius = getRadius(visual.components.inputs.rounded);

  return `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ${visual.darkMode ? '"class"' : '"media"'},
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "${visual.colors.primary}",
          foreground: "${getForegroundColor(visual.colors.primary)}",
        },
        secondary: {
          DEFAULT: "${visual.colors.secondary || adjustColor(visual.colors.primary, 20)}",
          foreground: "${getForegroundColor(visual.colors.secondary || visual.colors.primary)}",
        },
        accent: {
          DEFAULT: "${visual.colors.accent || visual.colors.primary}",
          foreground: "${getForegroundColor(visual.colors.accent || visual.colors.primary)}",
        },
        background: "${visual.colors.background}",
        foreground: "${visual.colors.foreground}",
        muted: {
          DEFAULT: "${visual.colors.muted || adjustColor(visual.colors.background, 10)}",
          foreground: "${adjustColor(visual.colors.foreground, 30)}",
        },
        border: "${visual.colors.border || adjustColor(visual.colors.background, 15)}",
        input: "${visual.colors.border || adjustColor(visual.colors.background, 15)}",
        ring: "${visual.colors.primary}",
        success: "${visual.colors.success || '#22c55e'}",
        warning: "${visual.colors.warning || '#f59e0b'}",
        destructive: {
          DEFAULT: "${visual.colors.error || '#ef4444'}",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "${visual.colors.background}",
          foreground: "${visual.colors.foreground}",
        },
        popover: {
          DEFAULT: "${visual.colors.background}",
          foreground: "${visual.colors.foreground}",
        },
      },
      fontFamily: {
        heading: ["${visual.typography.headingFont}", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["${visual.typography.bodyFont}", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["${visual.typography.bodyFont}", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        base: ["${visual.typography.baseFontSize || '1rem'}", { lineHeight: "${visual.typography.lineHeight || '1.5'}" }],
      },
      borderRadius: {
        DEFAULT: "${cardRadius}",
        button: "${buttonRadius}",
        card: "${cardRadius}",
        input: "${inputRadius}",
        lg: "calc(${cardRadius} + 4px)",
        md: "${cardRadius}",
        sm: "calc(${cardRadius} - 4px)",
      },
      boxShadow: {
        card: "${getCardShadow(visual.components.cards.shadow)}",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

/**
 * Generate globals.css from visual analysis
 */
export function generateGlobalsCss(visual: VisualAnalysis): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

/* Generated from website analysis */
@layer base {
  :root {
    --background: ${hexToHsl(visual.colors.background)};
    --foreground: ${hexToHsl(visual.colors.foreground)};
    --primary: ${hexToHsl(visual.colors.primary)};
    --primary-foreground: ${hexToHsl(getForegroundColor(visual.colors.primary))};
    --secondary: ${hexToHsl(visual.colors.secondary || adjustColor(visual.colors.primary, 20))};
    --secondary-foreground: ${hexToHsl(getForegroundColor(visual.colors.secondary || visual.colors.primary))};
    --accent: ${hexToHsl(visual.colors.accent || visual.colors.primary)};
    --accent-foreground: ${hexToHsl(getForegroundColor(visual.colors.accent || visual.colors.primary))};
    --muted: ${hexToHsl(visual.colors.muted || adjustColor(visual.colors.background, 10))};
    --muted-foreground: ${hexToHsl(adjustColor(visual.colors.foreground, 30))};
    --border: ${hexToHsl(visual.colors.border || adjustColor(visual.colors.background, 15))};
    --input: ${hexToHsl(visual.colors.border || adjustColor(visual.colors.background, 15))};
    --ring: ${hexToHsl(visual.colors.primary)};
    --radius: ${getRadius(visual.components.cards.rounded)};
  }

  ${visual.darkMode ? `
  .dark {
    --background: ${hexToHsl(invertColor(visual.colors.background))};
    --foreground: ${hexToHsl(invertColor(visual.colors.foreground))};
    --muted: ${hexToHsl(adjustColor(invertColor(visual.colors.background), 10))};
    --muted-foreground: ${hexToHsl(adjustColor(invertColor(visual.colors.foreground), 30))};
    --border: ${hexToHsl(adjustColor(invertColor(visual.colors.background), 15))};
  }
  ` : ''}

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-body;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}

@layer components {
  /* Button base styles from analysis */
  .btn {
    @apply inline-flex items-center justify-center rounded-button font-medium transition-colors;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }

  .btn-primary {
    @apply btn bg-primary text-primary-foreground hover:bg-primary/90;
  }

  .btn-secondary {
    @apply btn bg-secondary text-secondary-foreground hover:bg-secondary/80;
  }

  .btn-outline {
    @apply btn border border-input bg-background hover:bg-accent hover:text-accent-foreground;
  }

  .btn-ghost {
    @apply btn hover:bg-accent hover:text-accent-foreground;
  }

  /* Card styles from analysis */
  .card {
    @apply rounded-card bg-card text-card-foreground shadow-card;
  }

  /* Input styles from analysis */
  .input {
    @apply flex h-10 w-full rounded-input border border-input bg-background px-3 py-2;
    @apply text-sm ring-offset-background;
    @apply file:border-0 file:bg-transparent file:text-sm file:font-medium;
    @apply placeholder:text-muted-foreground;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
  }
}
`;
}

/**
 * Generate all style-related files from analysis
 */
export function generateStyleFiles(visual: VisualAnalysis): GeneratedFile[] {
  return [
    {
      path: 'tailwind.config.ts',
      content: generateTailwindConfig(visual),
      overwrite: true,
    },
    {
      path: 'app/globals.css',
      content: generateGlobalsCss(visual),
      overwrite: true,
    },
  ];
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function getButtonRadius(shape: 'rounded' | 'pill' | 'square'): string {
  switch (shape) {
    case 'pill': return '9999px';
    case 'rounded': return '0.5rem';
    case 'square': return '0';
  }
}

function getRadius(size: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'): string {
  switch (size) {
    case 'none': return '0';
    case 'sm': return '0.25rem';
    case 'md': return '0.5rem';
    case 'lg': return '0.75rem';
    case 'xl': return '1rem';
    case 'full': return '9999px';
    default: return '0.5rem';
  }
}

function getCardShadow(size: 'none' | 'sm' | 'md' | 'lg' | 'xl'): string {
  switch (size) {
    case 'none': return 'none';
    case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
    case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
    case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
    case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    default: return '0 4px 6px -1px rgb(0 0 0 / 0.1)';
  }
}

function getForegroundColor(bgColor: string): string {
  // Simple luminance check - returns white or black
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function adjustColor(hex: string, amount: number): string {
  // Lighten or darken a color
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function invertColor(hex: string): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const inverted = 0xffffff ^ num;
  return `#${inverted.toString(16).padStart(6, '0')}`;
}

function hexToHsl(hex: string): string {
  // Convert hex to HSL for CSS variables
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

