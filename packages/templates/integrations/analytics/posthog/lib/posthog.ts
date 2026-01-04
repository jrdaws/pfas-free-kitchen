import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

let initialized = false;

/**
 * Initialize PostHog (call once on app load)
 */
export function initPostHog() {
  if (typeof window === "undefined" || initialized || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We capture manually for better control
    capture_pageleave: true,
    persistence: "localStorage",
    autocapture: true,
  });

  initialized = true;
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

/**
 * Track an event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}

/**
 * Track a page view
 */
export function trackPageView(url?: string) {
  if (!initialized) return;
  posthog.capture("$pageview", { $current_url: url || window.location.href });
}

/**
 * Reset user (on logout)
 */
export function resetUser() {
  if (!initialized) return;
  posthog.reset();
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (!initialized) return false;
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

/**
 * Get feature flag value
 */
export function getFeatureFlag(flagKey: string): boolean | string | undefined {
  if (!initialized) return undefined;
  return posthog.getFeatureFlag(flagKey);
}

/**
 * Reload feature flags
 */
export function reloadFeatureFlags() {
  if (!initialized) return;
  posthog.reloadFeatureFlags();
}

export { posthog };

