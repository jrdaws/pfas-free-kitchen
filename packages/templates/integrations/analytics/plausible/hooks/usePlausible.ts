"use client";

import { usePlausible as usePlausibleBase } from "next-plausible";

type EventProps = Record<string, string | number | boolean>;

interface RevenueProps {
  currency: string;
  amount: number;
}

/**
 * Hook for tracking Plausible events
 * 
 * Usage:
 * ```tsx
 * const plausible = usePlausible();
 * 
 * // Track a simple event
 * plausible("Button Clicked");
 * 
 * // Track with properties
 * plausible("Signup", { plan: "pro" });
 * 
 * // Track with revenue
 * plausible.revenue("Purchase", { orderId: "123" }, { currency: "USD", amount: 99 });
 * ```
 */
export function usePlausible() {
  const plausibleBase = usePlausibleBase();

  // Extended plausible function with revenue support
  const plausible = Object.assign(
    (eventName: string, props?: EventProps) => {
      plausibleBase(eventName, { props });
    },
    {
      // Track event with revenue
      revenue: (eventName: string, props: EventProps, revenue: RevenueProps) => {
        plausibleBase(eventName, { props, revenue });
      },

      // Common events
      signup: (plan?: string) => {
        plausibleBase("Signup", { props: plan ? { plan } : undefined });
      },

      login: () => {
        plausibleBase("Login");
      },

      cta: (location: string) => {
        plausibleBase("CTA Click", { props: { location } });
      },

      download: (fileName: string) => {
        plausibleBase("Download", { props: { fileName } });
      },

      share: (platform: string, content?: string) => {
        plausibleBase("Share", { props: { platform, content } });
      },

      search: (query: string) => {
        plausibleBase("Search", { props: { query } });
      },

      error: (errorType: string, message?: string) => {
        plausibleBase("Error", { props: { errorType, message } });
      },
    }
  );

  return plausible;
}

