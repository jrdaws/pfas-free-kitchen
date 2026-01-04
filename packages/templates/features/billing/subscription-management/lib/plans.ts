export interface Plan {
  id: string;
  name: string;
  tier: "free" | "starter" | "pro" | "enterprise";
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: {
    users?: number;
    storage?: number; // GB
    apiCalls?: number;
    projects?: number;
  };
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tier: "free",
    description: "For individuals getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "1 user",
      "1 GB storage",
      "1,000 API calls/month",
      "Community support",
    ],
    limits: {
      users: 1,
      storage: 1,
      apiCalls: 1000,
      projects: 1,
    },
  },
  {
    id: "starter",
    name: "Starter",
    tier: "starter",
    description: "For small teams",
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      "Up to 5 users",
      "10 GB storage",
      "10,000 API calls/month",
      "Email support",
      "Basic analytics",
    ],
    limits: {
      users: 5,
      storage: 10,
      apiCalls: 10000,
      projects: 5,
    },
  },
  {
    id: "pro",
    name: "Pro",
    tier: "pro",
    description: "For growing businesses",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      "Up to 20 users",
      "100 GB storage",
      "100,000 API calls/month",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
    limits: {
      users: 20,
      storage: 100,
      apiCalls: 100000,
      projects: 20,
    },
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    description: "For large organizations",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      "Unlimited users",
      "Unlimited storage",
      "Unlimited API calls",
      "24/7 dedicated support",
      "Custom analytics",
      "SSO & SAML",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    limits: {
      users: -1, // unlimited
      storage: -1,
      apiCalls: -1,
      projects: -1,
    },
  },
];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function canUpgrade(currentTier: string, targetTier: string): boolean {
  const tierOrder = ["free", "starter", "pro", "enterprise"];
  return tierOrder.indexOf(targetTier) > tierOrder.indexOf(currentTier);
}

export function canDowngrade(currentTier: string, targetTier: string): boolean {
  const tierOrder = ["free", "starter", "pro", "enterprise"];
  return tierOrder.indexOf(targetTier) < tierOrder.indexOf(currentTier);
}

export function formatPrice(price: number, interval: "monthly" | "yearly" = "monthly"): string {
  if (price === 0) return "Free";
  return `$${price}/${interval === "monthly" ? "mo" : "yr"}`;
}

