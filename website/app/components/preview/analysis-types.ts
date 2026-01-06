/**
 * Types for Website Analysis Results
 * 
 * Used to apply inspiration site analysis to preview generation.
 */

// Visual analysis from vision analyzer
export interface VisualAnalysis {
  layout: {
    overallStyle: string;
    sections: {
      type: string;
      pattern: string;
      position: number;
      hasImage?: boolean;
      hasVideo?: boolean;
      estimatedHeight?: string;
    }[];
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted?: string;
  };
  typography: {
    headingStyle: string;
    bodyStyle: string;
    accentFont?: string;
  };
  components: {
    buttons: {
      shape: "pill" | "rounded" | "square";
      style: "solid" | "gradient" | "outline" | "ghost";
      hasShadow?: boolean;
    };
    cards: {
      corners: "rounded" | "sharp" | "pill";
      style: "elevated" | "flat" | "bordered" | "glass";
      hasShadow?: boolean;
    };
    navigation: {
      style: string;
      position: string;
      hasSearch?: boolean;
    };
  };
}

// Full website analysis including features
export interface WebsiteAnalysis {
  url: string;
  title: string;
  
  // Visual analysis
  visual?: VisualAnalysis;
  
  // Detected features
  features?: {
    auth?: {
      hasLogin?: boolean;
      hasSignup?: boolean;
      hasSocialAuth?: boolean;
      hasMFA?: boolean;
    };
    ecommerce?: {
      hasCart?: boolean;
      hasCheckout?: boolean;
      hasProductCatalog?: boolean;
      hasWishlist?: boolean;
    };
    content?: {
      hasBlog?: boolean;
      hasCMS?: boolean;
      hasSearch?: boolean;
      hasCategories?: boolean;
    };
    social?: {
      hasComments?: boolean;
      hasSharing?: boolean;
      hasReviews?: boolean;
      hasProfiles?: boolean;
    };
    payments?: {
      hasSubscription?: boolean;
      hasOneTime?: boolean;
      hasInvoicing?: boolean;
    };
    communication?: {
      hasEmail?: boolean;
      hasNotifications?: boolean;
      hasChat?: boolean;
    };
  };
  
  // Page structure
  structure?: {
    sections: {
      type: string;
      layout: string;
      position: number;
      content?: string;
    }[];
    navigation?: {
      items: string[];
      style: string;
    };
  };
  
  // Screenshot
  screenshot?: string;
}

// Analysis applied styles for preview rendering
export interface AppliedStyles {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  components: {
    button: {
      shape: "pill" | "rounded" | "square";
      style: "solid" | "gradient" | "outline" | "ghost";
    };
    card: {
      corners: "rounded" | "sharp" | "pill";
      style: "elevated" | "flat" | "bordered" | "glass";
    };
  };
  typography: {
    headingClass: string;
    bodyClass: string;
  };
  layout: {
    sections: string[];
    containerWidth: string;
    spacing: string;
  };
}

// Helper to extract applied styles from analysis
export function extractAppliedStyles(analysis?: WebsiteAnalysis): AppliedStyles | null {
  if (!analysis?.visual) return null;

  const { colorPalette, components, typography, layout } = analysis.visual;

  return {
    colors: {
      // Default colors match globals.css --primary (orange) for consistency
      primary: colorPalette.primary || "#F97316",
      secondary: colorPalette.secondary || "#EA580C",
      accent: colorPalette.accent || "#FB923C",
      background: colorPalette.background || "#ffffff",
      foreground: colorPalette.foreground || "#1e293b",
      muted: colorPalette.muted || "#64748b",
    },
    components: {
      button: {
        shape: components?.buttons?.shape || "rounded",
        style: components?.buttons?.style || "solid",
      },
      card: {
        corners: components?.cards?.corners || "rounded",
        style: components?.cards?.style || "elevated",
      },
    },
    typography: {
      headingClass: mapHeadingStyle(typography?.headingStyle),
      bodyClass: mapBodyStyle(typography?.bodyStyle),
    },
    layout: {
      sections: layout?.sections?.map(s => s.type) || [],
      containerWidth: "max-w-7xl",
      spacing: "py-16",
    },
  };
}

function mapHeadingStyle(style?: string): string {
  const mapping: Record<string, string> = {
    bold: "font-bold",
    light: "font-light",
    serif: "font-serif",
    display: "font-bold tracking-tight",
    default: "font-semibold",
  };
  return mapping[style || "default"] || mapping.default;
}

function mapBodyStyle(style?: string): string {
  const mapping: Record<string, string> = {
    serif: "font-serif",
    mono: "font-mono",
    default: "font-normal",
  };
  return mapping[style || "default"] || mapping.default;
}

