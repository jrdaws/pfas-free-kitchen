/**
 * Plausible Analytics utilities
 * 
 * Plausible is a privacy-friendly, lightweight analytics tool that doesn't
 * use cookies and is fully GDPR, CCPA and PECR compliant.
 */

export interface PlausibleEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
  revenue?: {
    currency: string;
    amount: number;
  };
}

/**
 * Track a custom event in Plausible
 * This works without the React hook for server-side or non-React contexts
 */
export function trackEvent(event: PlausibleEvent): void {
  if (typeof window === "undefined") return;
  
  const plausible = (window as any).plausible;
  if (!plausible) {
    console.warn("Plausible not loaded yet");
    return;
  }

  if (event.revenue) {
    plausible(event.name, {
      props: event.props,
      revenue: event.revenue,
    });
  } else {
    plausible(event.name, { props: event.props });
  }
}

/**
 * Common e-commerce events
 */
export const ecommerceEvents = {
  addToCart: (productId: string, productName: string, value: number) => {
    trackEvent({
      name: "Add to Cart",
      props: { productId, productName },
      revenue: { currency: "USD", amount: value },
    });
  },

  purchase: (orderId: string, value: number) => {
    trackEvent({
      name: "Purchase",
      props: { orderId },
      revenue: { currency: "USD", amount: value },
    });
  },

  viewProduct: (productId: string, productName: string) => {
    trackEvent({
      name: "View Product",
      props: { productId, productName },
    });
  },
};

/**
 * Common SaaS events
 */
export const saasEvents = {
  signup: (plan?: string) => {
    trackEvent({
      name: "Signup",
      props: plan ? { plan } : undefined,
    });
  },

  login: () => {
    trackEvent({ name: "Login" });
  },

  subscribe: (plan: string, value: number) => {
    trackEvent({
      name: "Subscribe",
      props: { plan },
      revenue: { currency: "USD", amount: value },
    });
  },

  upgrade: (fromPlan: string, toPlan: string, value: number) => {
    trackEvent({
      name: "Upgrade",
      props: { fromPlan, toPlan },
      revenue: { currency: "USD", amount: value },
    });
  },

  featureUsed: (feature: string) => {
    trackEvent({
      name: "Feature Used",
      props: { feature },
    });
  },
};

/**
 * Get the Plausible domain from environment
 */
export function getPlausibleDomain(): string | undefined {
  return process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
}

