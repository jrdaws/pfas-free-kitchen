/**
 * Multi-Page Preview Types
 */

export type PageType = 
  | "home" 
  | "landing" 
  | "dashboard" 
  | "auth" 
  | "pricing" 
  | "about" 
  | "contact" 
  | "blog" 
  | "docs" 
  | "settings" 
  | "profile"
  | "product"
  | "checkout"
  | "custom";

export type DeviceType = "desktop" | "tablet" | "mobile";

export interface PreviewPage {
  id: string;
  path: string;
  name: string;
  type: PageType;
  icon?: string;
  components: PreviewComponent[];
  metadata?: {
    title?: string;
    description?: string;
    protected?: boolean;
  };
}

export interface PreviewComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: PreviewComponent[];
}

export interface PreviewComposition {
  id: string;
  projectName: string;
  pages: PreviewPage[];
  theme: PreviewTheme;
  navigation: NavigationLink[];
}

export interface PreviewTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface NavigationLink {
  label: string;
  path: string;
  icon?: string;
  children?: NavigationLink[];
}

// Device dimensions for responsive preview
export const DEVICE_DIMENSIONS: Record<DeviceType, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
};

// Page type icons
export const PAGE_ICONS: Record<PageType, string> = {
  home: "🏠",
  landing: "🎯",
  dashboard: "📊",
  auth: "🔐",
  pricing: "💰",
  about: "ℹ️",
  contact: "📧",
  blog: "📝",
  docs: "📚",
  settings: "⚙️",
  profile: "👤",
  product: "🛍️",
  checkout: "🛒",
  custom: "📄",
};

