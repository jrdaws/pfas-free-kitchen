/**
 * Preview Session Types
 * 
 * Types for multi-page preview sessions with shared state.
 */

export type AuthState = "logged-out" | "logged-in" | "admin";
export type SubscriptionTier = "free" | "pro" | "enterprise";

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface MockCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface MockCart {
  items: MockCartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface PreviewStateSimulation {
  auth: {
    state: AuthState;
    user: MockUser | null;
  };
  cart: MockCart | null;
  subscription: {
    tier: SubscriptionTier;
    features: string[];
  };
  data: {
    products?: unknown[];
    posts?: unknown[];
    stats?: unknown[];
  };
}

export interface PagePreviewContext {
  path: string;
  title: string;
  description?: string;
  isCurrentPage: boolean;
}

export interface NavigationContext {
  pages: PagePreviewContext[];
  currentPath: string;
  breadcrumbs: { label: string; path: string }[];
}

export interface BrandingContext {
  projectName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  logo?: string;
}

export interface ResearchContext {
  domainInsights?: {
    overview: string;
    targetAudience: string;
    keyDifferentiators: string[];
  };
  competitorAnalysis?: {
    competitors: string[];
    ourOpportunities: string[];
  };
  designDirection?: {
    style: string;
    colorPreferences: string[];
  };
}

export interface PreviewSession {
  id: string;
  projectId: string;
  createdAt: string;
  expiresAt: string;
  
  // User configuration
  template: string;
  branding: BrandingContext;
  integrations: Record<string, string>;
  
  // Research context for intelligent props
  research?: ResearchContext;
  
  // Vision document for personalization
  vision?: {
    problem: string;
    audience: string;
    businessModel: string;
    designStyle: string;
  };
  
  // Navigation context
  navigation: NavigationContext;
  
  // State simulation
  stateSimulation: PreviewStateSimulation;
  
  // Generated pages cache
  pageCache: Record<string, {
    html: string;
    props: Record<string, unknown>;
    generatedAt: string;
  }>;
  
  // Fidelity tracking
  fidelityScore: number;
  fidelityDetails: {
    category: string;
    score: number;
    notes: string;
  }[];
}

export interface CreateSessionRequest {
  projectId: string;
  template: string;
  projectName: string;
  branding?: Partial<BrandingContext>;
  integrations?: Record<string, string>;
  research?: ResearchContext;
  vision?: PreviewSession["vision"];
  pages?: { path: string; title: string; description?: string }[];
  initialAuthState?: AuthState;
}

export interface CreateSessionResponse {
  success: boolean;
  session?: PreviewSession;
  error?: string;
}

export interface PagePreviewRequest {
  sessionId: string;
  pagePath: string;
  regenerate?: boolean;
}

export interface PagePreviewResponse {
  success: boolean;
  html?: string;
  props?: Record<string, unknown>;
  navigation?: NavigationContext;
  stateSimulation?: PreviewStateSimulation;
  fidelityScore?: number;
  error?: string;
}

// Default mock data generators

export const DEFAULT_MOCK_USER: MockUser = {
  id: "user_demo_1",
  email: "demo@example.com",
  name: "Demo User",
  avatar: undefined,
  subscriptionTier: "pro",
  createdAt: new Date().toISOString(),
};

export const DEFAULT_MOCK_CART: MockCart = {
  items: [
    { id: "item_1", name: "Premium Plan", price: 29.99, quantity: 1 },
    { id: "item_2", name: "Add-on Feature", price: 9.99, quantity: 2 },
  ],
  subtotal: 49.97,
  tax: 4.00,
  total: 53.97,
};

export function createDefaultStateSimulation(
  authState: AuthState = "logged-out",
  subscriptionTier: SubscriptionTier = "free"
): PreviewStateSimulation {
  return {
    auth: {
      state: authState,
      user: authState !== "logged-out" ? { ...DEFAULT_MOCK_USER, subscriptionTier } : null,
    },
    cart: null,
    subscription: {
      tier: subscriptionTier,
      features: getSubscriptionFeatures(subscriptionTier),
    },
    data: {},
  };
}

function getSubscriptionFeatures(tier: SubscriptionTier): string[] {
  switch (tier) {
    case "free":
      return ["Basic features", "Community support", "1 project"];
    case "pro":
      return ["All Free features", "Priority support", "Unlimited projects", "API access", "Analytics"];
    case "enterprise":
      return ["All Pro features", "Dedicated support", "Custom integrations", "SLA", "SSO", "Audit logs"];
    default:
      return [];
  }
}

