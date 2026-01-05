/**
 * PostHog Analytics with Lazy Initialization
 * 
 * Gracefully handles missing configuration.
 */

// Check if PostHog is configured
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

const isPostHogConfigured = 
  POSTHOG_KEY && 
  !POSTHOG_KEY.includes("placeholder");

let posthogInstance: typeof import("posthog-js").default | null = null;

/**
 * Check if PostHog is configured
 */
export function isAnalyticsEnabled(): boolean {
  return isPostHogConfigured && typeof window !== "undefined";
}

/**
 * Initialize PostHog (call once in your app)
 */
export function initPostHog() {
  if (typeof window === "undefined") return;
  
  if (!isPostHogConfigured) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set - analytics disabled");
    }
    return;
  }

  // Lazy load PostHog
  import("posthog-js").then(({ default: posthog }) => {
    posthogInstance = posthog;
    posthog.init(POSTHOG_KEY!, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
      persistence: "localStorage",
      loaded: () => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PostHog] Initialized successfully");
        }
      },
    });
  }).catch((error) => {
    console.error("[PostHog] Failed to initialize:", error);
  });
}

/**
 * Get the PostHog instance (returns null if not initialized)
 */
export function getPostHog() {
  return posthogInstance;
}

/**
 * Capture a custom event
 */
export function captureEvent(
  eventName: string, 
  properties?: Record<string, any>
) {
  if (!posthogInstance) {
    if (process.env.NODE_ENV === "development") {
      console.log("[PostHog] Event (not sent):", eventName, properties);
    }
    return;
  }
  posthogInstance.capture(eventName, properties);
}

/**
 * Capture a page view
 */
export function capturePageView(url?: string) {
  if (!posthogInstance) return;
  posthogInstance.capture("$pageview", { $current_url: url || window.location.href });
}

/**
 * Identify a user
 */
export function identify(
  userId: string, 
  properties?: Record<string, any>
) {
  if (!posthogInstance) return;
  posthogInstance.identify(userId, properties);
}

/**
 * Reset user identity (on logout)
 */
export function reset() {
  if (!posthogInstance) return;
  posthogInstance.reset();
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (!posthogInstance) return false;
  return posthogInstance.isFeatureEnabled(flagKey) || false;
}

/**
 * Get a feature flag value
 */
export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  if (!posthogInstance) return undefined;
  return posthogInstance.getFeatureFlag(flagKey);
}

// Legacy export for backward compatibility
export { posthogInstance as posthog };
