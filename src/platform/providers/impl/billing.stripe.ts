import Stripe from "stripe";
import type { BillingProvider } from "../billing";
import type { BillingCustomer, Subscription, UsageEvent, ProviderHealth } from "../types";

// Singleton Stripe client
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(apiKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// Error mapping utility
class StripeBillingError extends Error {
  readonly code: string;
  readonly type: string;
  readonly statusCode?: number;
  readonly originalError?: unknown;

  constructor(
    message: string,
    code: string,
    type: string,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = "StripeBillingError";
    this.code = code;
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

function mapStripeError(error: unknown, context: string): StripeBillingError {
  if (error instanceof Stripe.errors.StripeError) {
    return new StripeBillingError(
      `[${context}] Stripe API error: ${error.message}`,
      error.code || "unknown",
      error.type || "api_error",
      error.statusCode,
      error
    );
  }
  const message = error instanceof Error ? error.message : String(error);
  return new StripeBillingError(
    `[${context}] ${message}`,
    "internal_error",
    "unknown_error",
    undefined,
    error
  );
}

const provider: BillingProvider = {
  name: "billing.stripe",

  async ensureCustomer(input: { orgId: string; email?: string }): Promise<BillingCustomer> {
    const stripe = getStripeClient();
    try {
      // Search for existing customer by metadata
      const existingCustomers = await stripe.customers.search({
        query: `metadata['orgId']:'${input.orgId}'`,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        return {
          id: customer.id,
          email: customer.email || undefined,
        };
      }

      // Create new customer if not found
      const customer = await stripe.customers.create({
        email: input.email,
        metadata: {
          orgId: input.orgId,
        },
      });

      return {
        id: customer.id,
        email: customer.email || undefined,
      };
    } catch (error) {
      throw mapStripeError(error, "ensureCustomer");
    }
  },

  async createCheckoutSession(input: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    quantity?: number;
    metadata?: Record<string, string>;
  }): Promise<{ url: string }> {
    const stripe = getStripeClient();
    try {
      const session = await stripe.checkout.sessions.create({
        customer: input.customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: input.priceId,
            quantity: input.quantity || 1,
          },
        ],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: input.metadata,
      });

      if (!session.url) {
        throw new Error("Checkout session URL not generated");
      }

      return { url: session.url };
    } catch (error) {
      throw mapStripeError(error, "createCheckoutSession");
    }
  },

  async getActiveSubscription(customerId: string): Promise<Subscription | null> {
    const stripe = getStripeClient();
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
        expand: ["data.items.data.price"],
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const sub = subscriptions.data[0];
      const priceId = sub.items.data[0]?.price?.id || "";

      return {
        id: sub.id,
        status: sub.status as "active" | "trialing" | "past_due" | "canceled",
        planId: priceId,
        seats: sub.items.data[0]?.quantity || undefined,
        currentPeriodEnd: sub.current_period_end || undefined,
      };
    } catch (error) {
      throw mapStripeError(error, "getActiveSubscription");
    }
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const stripe = getStripeClient();
    try {
      await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      throw mapStripeError(error, "cancelSubscription");
    }
  },

  async recordUsage(event: UsageEvent): Promise<void> {
    const stripe = getStripeClient();
    try {
      // Get active subscription for customer
      const subscriptions = await stripe.subscriptions.list({
        customer: event.customerId,
        status: "active",
        limit: 1,
        expand: ["data.items.data"],
      });

      if (subscriptions.data.length === 0) {
        throw new Error(`No active subscription found for customer ${event.customerId}`);
      }

      // Find subscription item for metered billing
      const subscription = subscriptions.data[0];
      const meteredItem = subscription.items.data.find(
        (item) => item.price.recurring?.usage_type === "metered"
      );

      if (!meteredItem) {
        throw new Error("No metered subscription item found");
      }

      // Record usage
      await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
        quantity: event.quantity,
        timestamp: event.ts ? Math.floor(event.ts / 1000) : Math.floor(Date.now() / 1000),
        action: "increment",
      });
    } catch (error) {
      throw mapStripeError(error, "recordUsage");
    }
  },

  async verifyWebhook(input: { rawBody: string; headers: Headers }): Promise<boolean> {
    const stripe = getStripeClient();
    const signature = input.headers.get("stripe-signature");

    if (!signature) {
      return false;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    }

    try {
      // Stripe's built-in verification
      stripe.webhooks.constructEvent(input.rawBody, signature, webhookSecret);
      return true;
    } catch (error) {
      // Signature verification failed
      return false;
    }
  },

  async parseWebhookEvent(rawBody: string): Promise<{ type: string; data: any; id: string }> {
    try {
      const event = JSON.parse(rawBody) as Stripe.Event;

      return {
        id: event.id,
        type: event.type,
        data: event.data.object,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse webhook event: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },

  async health(): Promise<ProviderHealth> {
    try {
      const stripe = getStripeClient();

      // Lightweight API call to verify connectivity
      await stripe.customers.list({ limit: 1 });

      return {
        ok: true,
        provider: "billing.stripe",
        details: {
          apiVersion: stripe.apiVersion,
          configured: Boolean(process.env.STRIPE_SECRET_KEY),
        },
      };
    } catch (error) {
      return {
        ok: false,
        provider: "billing.stripe",
        details: {
          error: error instanceof Error ? error.message : String(error),
          code: error instanceof Stripe.errors.StripeError ? error.code : "unknown",
        },
      };
    }
  },
};

export default provider;
