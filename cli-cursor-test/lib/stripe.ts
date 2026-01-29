import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
});

// Helper to format amount for Stripe (converts dollars to cents)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper to format amount from Stripe (converts cents to dollars)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}

// Pricing plans configuration
export const PRICING_PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null, // No Stripe price ID for free plan
    features: [
      "Basic features",
      "Up to 10 projects",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "All Free features",
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Custom domain",
    ],
  },
  team: {
    name: "Team",
    price: 99,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    features: [
      "All Pro features",
      "Team collaboration",
      "SSO authentication",
      "Advanced security",
      "Dedicated support",
    ],
  },
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;
