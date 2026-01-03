/**
 * Feature Categories Data Model
 * 
 * Defines selectable features for the 5DaySprint-style configurator.
 * Each feature maps to code templates and has dependencies.
 */

export type FeatureComplexity = "simple" | "medium" | "complex";

export interface Feature {
  id: string;
  label: string;
  description: string;
  category: FeatureCategory;
  complexity: FeatureComplexity;
  dependencies: string[];  // Feature IDs this depends on
  codeTemplates: string[]; // File paths to generate
}

export type FeatureCategory = 
  | "user-management"
  | "product-database"
  | "search-filter"
  | "ecommerce"
  | "analytics"
  | "billing"
  | "enterprise";

export interface FeatureCategoryDef {
  id: FeatureCategory;
  label: string;
  description: string;
  icon: string;
}

// Category definitions
export const FEATURE_CATEGORIES: FeatureCategoryDef[] = [
  {
    id: "user-management",
    label: "User Management",
    description: "Authentication, profiles, and admin features",
    icon: "users",
  },
  {
    id: "product-database",
    label: "Product Database",
    description: "Data models and content management",
    icon: "database",
  },
  {
    id: "search-filter",
    label: "Search & Filter",
    description: "Finding and organizing content",
    icon: "search",
  },
  {
    id: "ecommerce",
    label: "E-commerce Integration",
    description: "Shopping cart, checkout, and payments",
    icon: "shopping-cart",
  },
  {
    id: "analytics",
    label: "Analytics Features",
    description: "Tracking, metrics, and reporting",
    icon: "bar-chart",
  },
  {
    id: "billing",
    label: "Billing & Subscriptions",
    description: "Payments, subscriptions, and invoicing",
    icon: "credit-card",
  },
  {
    id: "enterprise",
    label: "Enterprise Features",
    description: "Security, compliance, and administration",
    icon: "shield",
  },
];

// All available features
export const FEATURES: Feature[] = [
  // User Management
  {
    id: "social-login",
    label: "Social Login",
    description: "Sign in with Google, GitHub, or other OAuth providers",
    category: "user-management",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/auth/social-providers.ts",
      "app/(auth)/login/social-buttons.tsx",
    ],
  },
  {
    id: "email-registration",
    label: "Email Registration",
    description: "Traditional email/password authentication",
    category: "user-management",
    complexity: "simple",
    dependencies: [],
    codeTemplates: [
      "lib/auth/email-auth.ts",
      "app/(auth)/signup/page.tsx",
      "app/(auth)/login/page.tsx",
    ],
  },
  {
    id: "guest-browsing",
    label: "Guest Browsing",
    description: "Allow users to browse without authentication",
    category: "user-management",
    complexity: "simple",
    dependencies: [],
    codeTemplates: [
      "lib/auth/guest-session.ts",
    ],
  },
  {
    id: "admin-dashboard",
    label: "Admin Dashboard",
    description: "Administrative interface for managing users and content",
    category: "user-management",
    complexity: "complex",
    dependencies: ["email-registration"],
    codeTemplates: [
      "app/admin/page.tsx",
      "app/admin/users/page.tsx",
      "app/admin/layout.tsx",
      "lib/admin/permissions.ts",
    ],
  },

  // Product Database
  {
    id: "nutritional-info",
    label: "Nutritional Info",
    description: "Store and display nutritional data for products",
    category: "product-database",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/data/nutrition-schema.ts",
      "components/product/NutritionFacts.tsx",
    ],
  },
  {
    id: "price-tracking",
    label: "Price Tracking",
    description: "Historical price data and comparisons",
    category: "product-database",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/data/price-history.ts",
      "components/product/PriceChart.tsx",
    ],
  },
  {
    id: "stock-availability",
    label: "Stock Availability",
    description: "Real-time inventory status",
    category: "product-database",
    complexity: "simple",
    dependencies: [],
    codeTemplates: [
      "lib/data/inventory.ts",
      "components/product/StockBadge.tsx",
    ],
  },
  {
    id: "brand-profiles",
    label: "Brand Profiles",
    description: "Company/brand information pages",
    category: "product-database",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/data/brands.ts",
      "app/brands/[slug]/page.tsx",
      "components/brand/BrandCard.tsx",
    ],
  },
  {
    id: "product-categories",
    label: "Product Categories",
    description: "Hierarchical category organization",
    category: "product-database",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/data/categories.ts",
      "components/navigation/CategoryNav.tsx",
      "app/categories/[slug]/page.tsx",
    ],
  },

  // Search & Filter
  {
    id: "full-text-search",
    label: "Full-text Search",
    description: "Fast search across all content",
    category: "search-filter",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/search/full-text.ts",
      "components/search/SearchBar.tsx",
      "app/api/search/route.ts",
    ],
  },
  {
    id: "advanced-filters",
    label: "Advanced Filters",
    description: "Multi-faceted filtering options",
    category: "search-filter",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/search/filters.ts",
      "components/search/FilterPanel.tsx",
    ],
  },
  {
    id: "saved-searches",
    label: "Saved Searches",
    description: "Let users save and reuse search queries",
    category: "search-filter",
    complexity: "simple",
    dependencies: ["email-registration"],
    codeTemplates: [
      "lib/search/saved-searches.ts",
      "components/search/SaveSearchButton.tsx",
    ],
  },

  // E-commerce
  {
    id: "shopping-cart",
    label: "Shopping Cart",
    description: "Add items and manage cart",
    category: "ecommerce",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/cart/cart-store.ts",
      "components/cart/CartDrawer.tsx",
      "components/cart/CartItem.tsx",
    ],
  },
  {
    id: "checkout-flow",
    label: "Checkout Flow",
    description: "Complete purchase process",
    category: "ecommerce",
    complexity: "complex",
    dependencies: ["shopping-cart", "email-registration"],
    codeTemplates: [
      "app/checkout/page.tsx",
      "app/checkout/success/page.tsx",
      "lib/checkout/process-order.ts",
      "app/api/checkout/route.ts",
    ],
  },
  {
    id: "order-history",
    label: "Order History",
    description: "View past orders and status",
    category: "ecommerce",
    complexity: "medium",
    dependencies: ["checkout-flow"],
    codeTemplates: [
      "app/orders/page.tsx",
      "app/orders/[id]/page.tsx",
      "components/orders/OrderCard.tsx",
    ],
  },
  {
    id: "wishlist",
    label: "Wishlist",
    description: "Save items for later",
    category: "ecommerce",
    complexity: "simple",
    dependencies: ["email-registration"],
    codeTemplates: [
      "lib/wishlist/wishlist-store.ts",
      "components/wishlist/WishlistButton.tsx",
      "app/wishlist/page.tsx",
    ],
  },

  // Analytics
  {
    id: "page-views",
    label: "Page Views",
    description: "Track page visits and popular content",
    category: "analytics",
    complexity: "simple",
    dependencies: [],
    codeTemplates: [
      "lib/analytics/page-tracker.ts",
      "components/analytics/ViewCounter.tsx",
    ],
  },
  {
    id: "user-tracking",
    label: "User Tracking",
    description: "Understand user behavior and journeys",
    category: "analytics",
    complexity: "medium",
    dependencies: ["email-registration"],
    codeTemplates: [
      "lib/analytics/user-tracker.ts",
      "lib/analytics/session.ts",
    ],
  },
  {
    id: "conversion-funnels",
    label: "Conversion Funnels",
    description: "Track user progression through key flows",
    category: "analytics",
    complexity: "complex",
    dependencies: ["user-tracking"],
    codeTemplates: [
      "lib/analytics/funnels.ts",
      "app/admin/analytics/funnels/page.tsx",
    ],
  },
  {
    id: "reports",
    label: "Reports",
    description: "Generate and export analytics reports",
    category: "analytics",
    complexity: "complex",
    dependencies: ["page-views", "admin-dashboard"],
    codeTemplates: [
      "lib/analytics/reports.ts",
      "app/admin/analytics/reports/page.tsx",
      "components/analytics/ReportChart.tsx",
    ],
  },
  {
    id: "charts-visualization",
    label: "Charts & Visualization",
    description: "Interactive charts, graphs, and data visualizations",
    category: "analytics",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "components/charts/LineChart.tsx",
      "components/charts/BarChart.tsx",
      "components/charts/PieChart.tsx",
      "lib/charts/chart-utils.ts",
    ],
  },

  // Billing & Subscriptions
  {
    id: "subscription-billing",
    label: "Subscription Billing",
    description: "Recurring payments with Stripe subscriptions",
    category: "billing",
    complexity: "complex",
    dependencies: ["email-registration"],
    codeTemplates: [
      "lib/billing/stripe-subscriptions.ts",
      "app/billing/page.tsx",
      "app/billing/plans/page.tsx",
      "app/api/webhooks/stripe/route.ts",
      "components/billing/PricingTable.tsx",
      "components/billing/SubscriptionStatus.tsx",
    ],
  },
  {
    id: "one-time-payments",
    label: "One-Time Payments",
    description: "Single payment checkout with Stripe",
    category: "billing",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/billing/stripe-checkout.ts",
      "app/api/checkout/session/route.ts",
    ],
  },
  {
    id: "invoicing",
    label: "Invoicing",
    description: "Generate and send invoices to customers",
    category: "billing",
    complexity: "medium",
    dependencies: ["subscription-billing"],
    codeTemplates: [
      "lib/billing/invoices.ts",
      "app/billing/invoices/page.tsx",
      "components/billing/InvoiceCard.tsx",
    ],
  },

  // E-commerce additions
  {
    id: "inventory-management",
    label: "Inventory Management",
    description: "Track stock levels, low stock alerts, and restocking",
    category: "ecommerce",
    complexity: "medium",
    dependencies: ["stock-availability"],
    codeTemplates: [
      "lib/inventory/inventory-manager.ts",
      "app/admin/inventory/page.tsx",
      "components/inventory/StockLevelBar.tsx",
      "components/inventory/LowStockAlert.tsx",
    ],
  },
  {
    id: "product-variants",
    label: "Product Variants",
    description: "Support sizes, colors, and other product options",
    category: "ecommerce",
    complexity: "medium",
    dependencies: ["product-categories"],
    codeTemplates: [
      "lib/products/variants.ts",
      "components/product/VariantSelector.tsx",
      "components/product/SizeChart.tsx",
      "components/product/ColorSwatches.tsx",
    ],
  },
  {
    id: "shipping-integration",
    label: "Shipping Integration",
    description: "Calculate shipping rates and track deliveries",
    category: "ecommerce",
    complexity: "complex",
    dependencies: ["checkout-flow"],
    codeTemplates: [
      "lib/shipping/carriers.ts",
      "lib/shipping/rate-calculator.ts",
      "components/checkout/ShippingOptions.tsx",
      "components/orders/TrackingInfo.tsx",
      "app/api/shipping/rates/route.ts",
    ],
  },

  // Enterprise Features
  {
    id: "rbac",
    label: "Role-Based Access Control",
    description: "Manage user roles and permissions",
    category: "enterprise",
    complexity: "complex",
    dependencies: ["admin-dashboard"],
    codeTemplates: [
      "lib/auth/rbac.ts",
      "lib/auth/permissions.ts",
      "app/admin/roles/page.tsx",
      "components/admin/RoleEditor.tsx",
      "middleware.ts",
    ],
  },
  {
    id: "audit-logging",
    label: "Audit Logging",
    description: "Track all user actions for compliance",
    category: "enterprise",
    complexity: "medium",
    dependencies: ["email-registration"],
    codeTemplates: [
      "lib/audit/audit-logger.ts",
      "app/admin/audit-log/page.tsx",
      "components/admin/AuditLogTable.tsx",
    ],
  },
  {
    id: "rate-limiting",
    label: "Rate Limiting",
    description: "Protect APIs from abuse with rate limits",
    category: "enterprise",
    complexity: "medium",
    dependencies: [],
    codeTemplates: [
      "lib/security/rate-limiter.ts",
      "middleware.ts",
    ],
  },
  {
    id: "multi-tenancy",
    label: "Multi-Tenancy",
    description: "Support multiple organizations/workspaces",
    category: "enterprise",
    complexity: "complex",
    dependencies: ["rbac"],
    codeTemplates: [
      "lib/tenants/tenant-manager.ts",
      "app/[tenant]/layout.tsx",
      "components/tenant/TenantSwitcher.tsx",
    ],
  },
];

// Get features by category
export function getFeaturesByCategory(category: FeatureCategory): Feature[] {
  return FEATURES.filter((f) => f.category === category);
}

// Get feature by ID
export function getFeatureById(id: string): Feature | undefined {
  return FEATURES.find((f) => f.id === id);
}

// Check if feature can be selected (all dependencies met)
export function canSelectFeature(featureId: string, selectedFeatures: string[]): boolean {
  const feature = getFeatureById(featureId);
  if (!feature) return false;
  
  return feature.dependencies.every((dep) => selectedFeatures.includes(dep));
}

// Get unmet dependencies for a feature
export function getUnmetDependencies(featureId: string, selectedFeatures: string[]): string[] {
  const feature = getFeatureById(featureId);
  if (!feature) return [];
  
  return feature.dependencies.filter((dep) => !selectedFeatures.includes(dep));
}

// Get all code templates for selected features
export function getCodeTemplatesForFeatures(selectedFeatures: string[]): string[] {
  const templates = new Set<string>();
  
  for (const featureId of selectedFeatures) {
    const feature = getFeatureById(featureId);
    if (feature) {
      feature.codeTemplates.forEach((t) => templates.add(t));
    }
  }
  
  return Array.from(templates);
}

// Feature recommendation based on project description
export function recommendFeatures(description: string): string[] {
  const desc = description.toLowerCase();
  const recommended: string[] = [];

  // Simple keyword matching for recommendations
  if (desc.includes("login") || desc.includes("auth") || desc.includes("user")) {
    recommended.push("email-registration", "social-login");
  }
  
  if (desc.includes("admin") || desc.includes("manage")) {
    recommended.push("admin-dashboard");
  }
  
  if (desc.includes("search") || desc.includes("find")) {
    recommended.push("full-text-search", "advanced-filters");
  }
  
  if (desc.includes("shop") || desc.includes("buy") || desc.includes("cart") || desc.includes("ecommerce")) {
    recommended.push("shopping-cart", "checkout-flow", "product-variants", "inventory-management");
  }
  
  if (desc.includes("analytics") || desc.includes("track") || desc.includes("metric")) {
    recommended.push("page-views", "user-tracking");
  }
  
  if (desc.includes("product") || desc.includes("catalog") || desc.includes("inventory")) {
    recommended.push("product-categories", "stock-availability", "inventory-management");
  }
  
  // SaaS / Subscription keywords
  if (desc.includes("saas") || desc.includes("subscription") || desc.includes("recurring") || desc.includes("billing") || desc.includes("plan")) {
    recommended.push("subscription-billing", "email-registration");
  }
  
  // Enterprise keywords
  if (desc.includes("enterprise") || desc.includes("role") || desc.includes("permission") || desc.includes("security")) {
    recommended.push("rbac", "audit-logging", "rate-limiting");
  }
  
  // Dashboard / Charts keywords
  if (desc.includes("dashboard") || desc.includes("chart") || desc.includes("report") || desc.includes("graph") || desc.includes("visualization")) {
    recommended.push("charts-visualization", "reports", "admin-dashboard");
  }
  
  // Shipping / Delivery keywords
  if (desc.includes("ship") || desc.includes("delivery") || desc.includes("fulfillment")) {
    recommended.push("shipping-integration", "order-history");
  }

  // Remove duplicates
  return [...new Set(recommended)];
}

// Calculate complexity score for selected features
export function calculateComplexityScore(selectedFeatures: string[]): {
  score: number;
  level: "low" | "medium" | "high";
  estimatedHours: number;
} {
  const complexityWeights: Record<FeatureComplexity, number> = {
    simple: 1,
    medium: 2,
    complex: 4,
  };

  let score = 0;
  for (const featureId of selectedFeatures) {
    const feature = getFeatureById(featureId);
    if (feature) {
      score += complexityWeights[feature.complexity];
    }
  }

  const level = score <= 5 ? "low" : score <= 12 ? "medium" : "high";
  const estimatedHours = score * 2; // Rough estimate: 2 hours per complexity point

  return { score, level, estimatedHours };
}

