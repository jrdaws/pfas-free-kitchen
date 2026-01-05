import {
  Paddle,
  Environment,
  type Customer,
  type Subscription,
  type Transaction,
} from "@paddle/paddle-node-sdk";

// Environment check
if (!process.env.PADDLE_API_KEY) {
  throw new Error("PADDLE_API_KEY is not set in environment variables");
}

// Initialize Paddle client
export const paddle = new Paddle(process.env.PADDLE_API_KEY, {
  environment: process.env.NODE_ENV === "production"
    ? Environment.production
    : Environment.sandbox,
});

// Pricing plans configuration
// Replace these with your actual Paddle price IDs
export const PRICING_PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null, // No Paddle price ID for free plan
    features: [
      "Basic features",
      "Up to 10 projects",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.PADDLE_PRO_PRICE_ID,
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
    priceId: process.env.PADDLE_TEAM_PRICE_ID,
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

// Subscription status types
export interface SubscriptionStatus {
  id: string;
  status: string;
  currentPeriodEnd: Date | null;
  canceledAt: Date | null;
  plan: string | null;
  priceId: string;
}

export interface SubscriptionDetails extends SubscriptionStatus {
  customerId: string;
  startedAt: Date | null;
  nextBilledAt: Date | null;
  scheduledChange: {
    action: string;
    effectiveAt: Date;
    resumeAt: Date | null;
  } | null;
}

/**
 * Get or create a Paddle customer
 * @param email - Customer email
 * @param userId - Your application's user ID
 * @returns Paddle customer
 */
export async function ensureCustomer(
  email: string,
  userId: string
): Promise<Customer> {
  try {
    // Search for existing customer by email
    const customers = await paddle.customers.list({
      email: [email],
    });

    if (customers.length > 0) {
      return customers[0];
    }

    // Create new customer
    const customer = await paddle.customers.create({
      email,
      customData: {
        userId,
      },
    });

    return customer;
  } catch (error: any) {
    throw new Error(`Failed to ensure customer: ${error.message}`);
  }
}

/**
 * Create a checkout session for a customer
 * @param customerId - Paddle customer ID
 * @param priceId - Paddle price ID
 * @param successUrl - URL to redirect after successful checkout
 * @returns Transaction with checkout URL
 */
export async function createCheckout(
  customerId: string,
  priceId: string,
  successUrl: string
): Promise<Transaction> {
  try {
    const transaction = await paddle.transactions.create({
      customerId,
      items: [
        {
          priceId,
          quantity: 1,
        },
      ],
      customData: {
        successUrl,
      },
    });

    return transaction;
  } catch (error: any) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }
}

/**
 * Get subscription status for a customer
 * @param subscriptionId - Paddle subscription ID
 * @returns Subscription status or null if not found
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<SubscriptionStatus | null> {
  try {
    const subscription = await paddle.subscriptions.get(subscriptionId);

    if (!subscription) {
      return null;
    }

    const priceId = subscription.items[0]?.price?.id || "";

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
      currentPeriodEnd: subscription.currentBillingPeriod?.endsAt
        ? new Date(subscription.currentBillingPeriod.endsAt)
        : null,
      canceledAt: subscription.canceledAt
        ? new Date(subscription.canceledAt)
        : null,
      plan: planKey,
      priceId,
    };
  } catch (error: any) {
    throw new Error(`Failed to get subscription status: ${error.message}`);
  }
}

/**
 * Get detailed subscription information
 * @param subscriptionId - Paddle subscription ID
 * @returns Detailed subscription information
 */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<SubscriptionDetails | null> {
  try {
    const subscription = await paddle.subscriptions.get(subscriptionId);

    if (!subscription) {
      return null;
    }

    const priceId = subscription.items[0]?.price?.id || "";

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
      customerId: subscription.customerId,
      status: subscription.status,
      currentPeriodEnd: subscription.currentBillingPeriod?.endsAt
        ? new Date(subscription.currentBillingPeriod.endsAt)
        : null,
      canceledAt: subscription.canceledAt
        ? new Date(subscription.canceledAt)
        : null,
      plan: planKey,
      priceId,
      startedAt: subscription.startedAt
        ? new Date(subscription.startedAt)
        : null,
      nextBilledAt: subscription.nextBilledAt
        ? new Date(subscription.nextBilledAt)
        : null,
      scheduledChange: subscription.scheduledChange
        ? {
            action: subscription.scheduledChange.action,
            effectiveAt: new Date(subscription.scheduledChange.effectiveAt),
            resumeAt: subscription.scheduledChange.resumeAt
              ? new Date(subscription.scheduledChange.resumeAt)
              : null,
          }
        : null,
    };
  } catch (error: any) {
    throw new Error(`Failed to get subscription details: ${error.message}`);
  }
}

/**
 * Cancel a subscription at the end of the billing period
 * @param subscriptionId - Paddle subscription ID
 * @returns Updated subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Subscription> {
  try {
    const subscription = await paddle.subscriptions.cancel(subscriptionId, {
      effectiveFrom: "next_billing_period",
    });

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
}

/**
 * Resume a paused or canceled subscription
 * @param subscriptionId - Paddle subscription ID
 * @returns Updated subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Subscription> {
  try {
    const subscription = await paddle.subscriptions.resume(subscriptionId, {
      effectiveFrom: "immediately",
    });

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to resume subscription: ${error.message}`);
  }
}

/**
 * Update subscription to a new plan (upgrade/downgrade)
 * @param subscriptionId - Paddle subscription ID
 * @param newPriceId - New Paddle price ID
 * @param proration - Whether to prorate (default: true)
 * @returns Updated subscription
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string,
  proration: boolean = true
): Promise<Subscription> {
  try {
    const subscription = await paddle.subscriptions.update(subscriptionId, {
      items: [
        {
          priceId: newPriceId,
          quantity: 1,
        },
      ],
      prorationBillingMode: proration
        ? "prorated_immediately"
        : "full_immediately",
    });

    return subscription;
  } catch (error: any) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
}

/**
 * Get customer portal URL for self-service management
 * @param customerId - Paddle customer ID
 * @returns Portal session URL
 */
export async function getCustomerPortalUrl(
  customerId: string
): Promise<string> {
  try {
    // Paddle's customer portal is accessed via the update payment method URL
    // For a full portal, you'd typically build a custom page or use Paddle Retain
    const customer = await paddle.customers.get(customerId);

    // Return the customer management URL
    // Note: In production, you'd generate a proper customer portal session
    return `https://sandbox-checkout.paddle.com/customer/${customerId}`;
  } catch (error: any) {
    throw new Error(`Failed to get customer portal URL: ${error.message}`);
  }
}

/**
 * Verify Paddle webhook signature
 * @param rawBody - Raw request body
 * @param signature - Paddle-Signature header value
 * @returns Whether signature is valid
 */
export function verifyWebhook(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("PADDLE_WEBHOOK_SECRET is not set");
  }

  try {
    // Parse the signature header
    // Format: ts=TIMESTAMP;h1=HASH
    const parts = signature.split(";");
    const tsMatch = parts.find((p) => p.startsWith("ts="));
    const h1Match = parts.find((p) => p.startsWith("h1="));

    if (!tsMatch || !h1Match) {
      return false;
    }

    const timestamp = tsMatch.replace("ts=", "");
    const receivedHash = h1Match.replace("h1=", "");

    // Create expected signature
    const crypto = require("crypto");
    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedHash = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return false;
  }
}

