import {
  lemonSqueezySetup,
  getProduct,
  listProducts,
  getSubscription,
  cancelSubscription as lsCancelSubscription,
  createCheckout,
  getCustomer,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize LemonSqueezy
let initialized = false;

function initLemonSqueezy() {
  if (initialized) return;
  
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    console.warn("LEMONSQUEEZY_API_KEY not set");
    return;
  }

  lemonSqueezySetup({
    apiKey,
    onError: (error) => console.error("[LemonSqueezy Error]", error),
  });
  
  initialized = true;
}

/**
 * Get all products from your store
 */
export async function getProducts() {
  initLemonSqueezy();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  
  const { data, error } = await listProducts({
    filter: { storeId },
  });
  
  if (error) throw error;
  return data;
}

/**
 * Get a specific product
 */
export async function getProductById(productId: string) {
  initLemonSqueezy();
  const { data, error } = await getProduct(productId);
  if (error) throw error;
  return data;
}

/**
 * Create a checkout URL
 */
export async function createCheckoutUrl(
  variantId: string,
  options?: {
    email?: string;
    name?: string;
    customData?: Record<string, unknown>;
    redirectUrl?: string;
  }
) {
  initLemonSqueezy();
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: options?.email,
      name: options?.name,
      custom: options?.customData,
    },
    productOptions: {
      redirectUrl: options?.redirectUrl,
    },
  });

  if (error) throw error;
  return data?.data?.attributes?.url;
}

/**
 * Get subscription details
 */
export async function getSubscriptionById(subscriptionId: string) {
  initLemonSqueezy();
  const { data, error } = await getSubscription(subscriptionId);
  if (error) throw error;
  return data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  initLemonSqueezy();
  const { data, error } = await lsCancelSubscription(subscriptionId);
  if (error) throw error;
  return data;
}

/**
 * Get customer details
 */
export async function getCustomerById(customerId: string) {
  initLemonSqueezy();
  const { data, error } = await getCustomer(customerId);
  if (error) throw error;
  return data;
}

/**
 * Get customer portal URL
 */
export async function getCustomerPortalUrl(customerId: string) {
  const customer = await getCustomerById(customerId);
  return customer?.data?.attributes?.urls?.customer_portal;
}

