import { Paddle, Environment } from "@paddle/paddle-node-sdk";

/**
 * Server-side Paddle SDK client
 * Use this in API routes and server actions
 */
function createPaddleClient() {
  const apiKey = process.env.PADDLE_API_KEY;
  
  if (!apiKey) {
    console.warn("PADDLE_API_KEY not set - Paddle features will not work");
    return null;
  }

  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox" 
    ? Environment.sandbox 
    : Environment.production;

  return new Paddle(apiKey, { environment });
}

let paddleClient: Paddle | null = null;

export function getPaddle(): Paddle {
  if (!paddleClient) {
    paddleClient = createPaddleClient();
  }
  if (!paddleClient) {
    throw new Error("Paddle client not initialized - check PADDLE_API_KEY");
  }
  return paddleClient;
}

/**
 * Get a customer by email
 */
export async function getCustomerByEmail(email: string) {
  const paddle = getPaddle();
  const customers = await paddle.customers.list({ email: [email] });
  return customers.data?.[0] ?? null;
}

/**
 * Create a new customer
 */
export async function createCustomer(email: string, name?: string) {
  const paddle = getPaddle();
  return paddle.customers.create({
    email,
    name: name || undefined,
  });
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  const paddle = getPaddle();
  return paddle.subscriptions.get(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, effectiveFrom: "immediately" | "next_billing_period" = "next_billing_period") {
  const paddle = getPaddle();
  return paddle.subscriptions.cancel(subscriptionId, { effectiveFrom });
}

/**
 * Get customer portal session URL
 */
export async function getPortalUrl(customerId: string) {
  const paddle = getPaddle();
  const portal = await paddle.customers.generateAuthToken(customerId);
  return portal;
}

