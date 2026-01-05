export type AudienceType = "b2b" | "b2c" | "internal" | "mixed";
export type BusinessModel = "subscription" | "one-time" | "freemium" | "marketplace" | "free";
export type DesignStyle = "minimal" | "bold" | "playful" | "corporate" | "dark";

export interface VisionDocument {
  problem: string;
  audience: {
    type: AudienceType;
    description?: string;
  };
  businessModel: BusinessModel;
  designStyle: DesignStyle;
  inspirations: string[];
  requiredFeatures: string[];
  niceToHaveFeatures: string[];
}

export const DEFAULT_VISION: VisionDocument = {
  problem: "",
  audience: {
    type: "b2c",
    description: "",
  },
  businessModel: "subscription",
  designStyle: "minimal",
  inspirations: [],
  requiredFeatures: [],
  niceToHaveFeatures: [],
};

// Template-specific prompts and examples
export const TEMPLATE_PROMPTS: Record<string, {
  problemPrompt: string;
  problemPlaceholder: string;
  problemExamples: string[];
}> = {
  saas: {
    problemPrompt: "What problem does your SaaS solve?",
    problemPlaceholder: "Help small businesses manage inventory without spreadsheets",
    problemExamples: [
      "Automate social media scheduling for agencies",
      "Track developer productivity metrics",
      "Simplify contract signing for legal teams",
    ],
  },
  ecommerce: {
    problemPrompt: "What are you selling and who's buying?",
    problemPlaceholder: "Handcrafted jewelry for eco-conscious millennials",
    problemExamples: [
      "Vintage vinyl records for collectors",
      "Sustainable fashion for young professionals",
      "Custom pet accessories for dog owners",
    ],
  },
  blog: {
    problemPrompt: "What topics will you cover and for whom?",
    problemPlaceholder: "Practical coding tutorials for junior developers",
    problemExamples: [
      "Personal finance advice for freelancers",
      "Travel guides for digital nomads",
      "Recipe blog for busy parents",
    ],
  },
  dashboard: {
    problemPrompt: "What data or workflows will you manage?",
    problemPlaceholder: "Internal tool to track sales team performance",
    problemExamples: [
      "Customer support ticket dashboard",
      "Marketing campaign analytics",
      "Project management for remote teams",
    ],
  },
  default: {
    problemPrompt: "What problem are you solving?",
    problemPlaceholder: "Describe the core problem your app will solve...",
    problemExamples: [
      "A better way to organize daily tasks",
      "Connect local service providers with customers",
      "Simplify complex data for decision makers",
    ],
  },
};

export const AUDIENCE_OPTIONS: { value: AudienceType; label: string; description: string; icon: string }[] = [
  { value: "b2b", label: "Business (B2B)", description: "Selling to other businesses", icon: "🏢" },
  { value: "b2c", label: "Consumer (B2C)", description: "Selling to individuals", icon: "👤" },
  { value: "internal", label: "Internal Tool", description: "For your own team", icon: "🔧" },
  { value: "mixed", label: "Mixed", description: "Multiple audience types", icon: "🔀" },
];

export const BUSINESS_MODEL_OPTIONS: { value: BusinessModel; label: string; description: string; icon: string }[] = [
  { value: "subscription", label: "Subscription", description: "Monthly or yearly recurring", icon: "🔄" },
  { value: "one-time", label: "One-time Purchase", description: "Pay once, own forever", icon: "💳" },
  { value: "freemium", label: "Freemium", description: "Free tier + paid upgrades", icon: "🎁" },
  { value: "marketplace", label: "Marketplace", description: "Transaction fees", icon: "🏪" },
  { value: "free", label: "Free / Open Source", description: "No monetization", icon: "💚" },
];

export const DESIGN_STYLE_OPTIONS: { value: DesignStyle; label: string; description: string; colors: string[] }[] = [
  { value: "minimal", label: "Minimal", description: "Clean, whitespace, subtle", colors: ["#ffffff", "#f8fafc", "#0f172a"] },
  { value: "bold", label: "Bold", description: "Strong colors, impactful", colors: ["#7c3aed", "#f97316", "#0f172a"] },
  { value: "playful", label: "Playful", description: "Fun, rounded, colorful", colors: ["#ec4899", "#06b6d4", "#fbbf24"] },
  { value: "corporate", label: "Corporate", description: "Professional, trustworthy", colors: ["#1e40af", "#0f172a", "#f8fafc"] },
  { value: "dark", label: "Dark Mode", description: "Dark backgrounds, glow", colors: ["#0f172a", "#1e293b", "#3b82f6"] },
];

export const FEATURE_SUGGESTIONS: Record<string, { required: string[]; optional: string[] }> = {
  saas: {
    required: ["User authentication", "Dashboard", "Billing/Subscription"],
    optional: ["Team collaboration", "API access", "Analytics", "Email notifications", "Mobile app"],
  },
  ecommerce: {
    required: ["Product catalog", "Shopping cart", "Checkout", "Payment processing"],
    optional: ["Inventory management", "Reviews", "Wishlist", "Discount codes", "Order tracking"],
  },
  blog: {
    required: ["Blog posts", "Categories/Tags", "Search"],
    optional: ["Newsletter signup", "Comments", "Author profiles", "RSS feed", "Social sharing"],
  },
  dashboard: {
    required: ["Data visualization", "User management", "Reports"],
    optional: ["Real-time updates", "Export to CSV/PDF", "Custom filters", "Notifications", "API integration"],
  },
  default: {
    required: ["User authentication", "Core functionality"],
    optional: ["Analytics", "Notifications", "Settings", "API access"],
  },
};

