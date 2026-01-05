/**
 * Auth + Payments Bridge
 * 
 * Connects your authentication system with Stripe to:
 * - Create Stripe customers for authenticated users
 * - Link user sessions to Stripe checkout
 * - Manage subscription status per user
 */

import { stripe } from "@/lib/stripe";

// Type for user object from your auth provider
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

/**
 * Get or create a Stripe customer for an authenticated user.
 * Stores the customer ID in user metadata for future use.
 */
export async function getOrCreateStripeCustomer(user: AuthUser): Promise<string> {
  // Check if user already has a Stripe customer ID
  if (user.metadata?.stripeCustomerId) {
    return user.metadata.stripeCustomerId;
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user.id,
    },
  });

  // TODO: Update user metadata with stripeCustomerId in your auth provider
  // await updateUserMetadata(user.id, { stripeCustomerId: customer.id });

  return customer.id;
}

/**
 * Create an authenticated checkout session.
 * Links the checkout to the user's Stripe customer.
 */
export async function createAuthenticatedCheckout(
  user: AuthUser,
  options: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    mode?: "subscription" | "payment";
  }
) {
  const customerId = await getOrCreateStripeCustomer(user);

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: options.mode || "subscription",
    line_items: [
      {
        price: options.priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: {
      userId: user.id,
    },
  });
}

/**
 * Create a customer portal session for subscription management.
 */
export async function createCustomerPortalSession(
  user: AuthUser,
  returnUrl: string
) {
  const customerId = await getOrCreateStripeCustomer(user);

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get user's active subscriptions.
 */
export async function getUserSubscriptions(user: AuthUser) {
  const customerId = await getOrCreateStripeCustomer(user);

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });

  return subscriptions.data;
}

/**
 * Check if user has an active subscription to a specific product.
 */
export async function hasActiveSubscription(
  user: AuthUser,
  productId?: string
): Promise<boolean> {
  const subscriptions = await getUserSubscriptions(user);
  
  if (!productId) {
    return subscriptions.length > 0;
  }

  return subscriptions.some(sub => 
    sub.items.data.some(item => item.price.product === productId)
  );
}

