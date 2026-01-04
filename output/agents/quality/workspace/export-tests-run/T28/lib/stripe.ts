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

// Subscription management types
export interface SubscriptionStatus {
  id: string;
  status: Stripe.Subscription.Status;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  plan: string | null;
  priceId: string;
}

export interface SubscriptionDetails extends SubscriptionStatus {
  customerId: string;
  canceledAt: Date | null;
  trialEnd: Date | null;
  defaultPaymentMethod: string | null;
}

/**
 * Get subscription status for a customer
 * @param customerId - Stripe customer ID
 * @returns Subscription status or null if no active subscription
 */
export async function getSubscriptionStatus(
  customerId: string
): Promise<SubscriptionStatus | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return null;
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;

    // Find matching plan
    let planKey: string | null = null;
    for (const [key, plan] of Object.entries(PRICING_PLANS)) {
      if (plan.priceId === priceId) {
        planKey = key;
        break;
      }
    }

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      plan: planKey,
      priceId,
    };
  } catch (error: any) {
    throw new Error(`Failed to get subscription status: ${error.message}`);
  }
}

/**
 * Get detailed subscription information
 * @param subscriptionId - Stripe subscription ID
 * @returns Detailed subscription information
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<SubscriptionDetails> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["default_payment_method"],
    });

    const priceId = subscription.items.data[0]?.price.id;

    // Find matching plan
    let planKey: string | null = null;
    for (const [key, plan] of Object.entries(PRICING_PLANS)) {
      if (plan.priceId === priceId) {
        planKey = key;
        break;
      }
    }

    return {
      id: subscription.id,
      customerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      plan: planKey,
      priceId,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      defaultPaymentMethod:
        typeof subscription.default_payment_method === "string"
          ? subscription.default_payment_method
          : subscription.default_payment_method?.id || null,
    };
  } catch (error: any) {
    throw new Error(
      `Failed to get subscription details: ${error.message}`
    );
  }
}

/**
 * Cancel a subscription at the end of the billing period
 * @param subscriptionId - Stripe subscription ID
 * @returns Updated subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
}

/**
 * Reactivate a canceled subscription (before period end)
 * @param subscriptionId - Stripe subscription ID
 * @returns Updated subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }
}

/**
 * Update subscription to a new plan (upgrade/downgrade)
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New Stripe price ID
 * @param prorationBehavior - How to handle proration (default: 'create_prorations')
 * @returns Updated subscription
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
  prorationBehavior:
    | "create_prorations"
    | "none"
    | "always_invoice" = "create_prorations"
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItem = subscription.items.data[0];

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: prorationBehavior,
      }
    );

    return updatedSubscription;
  } catch (error: any) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

/**
 * Get customer's payment methods
 * @param customerId - Stripe customer ID
 * @returns List of payment methods
 */
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data;
  } catch (error: any) {
    throw new Error(`Failed to get payment methods: ${error.message}`);
  }
}
