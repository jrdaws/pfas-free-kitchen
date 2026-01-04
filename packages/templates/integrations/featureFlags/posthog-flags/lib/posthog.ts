/**
 * PostHog Feature Flags
 * 
 * Server-side and client-side feature flag utilities.
 */

import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

/**
 * Initialize PostHog (call once in your app)
 */
export function initPostHog() {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) {
    console.warn("PostHog key not configured");
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We'll handle this manually
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") {
        ph.debug();
      }
    },
  });
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window === "undefined") return false;
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

/**
 * Get feature flag value (for multivariate flags)
 */
export function getFeatureFlagValue<T = unknown>(flagKey: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  return posthog.getFeatureFlag(flagKey) as T | undefined;
}

/**
 * Get all feature flags for the current user
 */
export function getAllFeatureFlags(): Record<string, boolean | string> {
  if (typeof window === "undefined") return {};
  return posthog.featureFlags.getFlagVariants() || {};
}

/**
 * Reload feature flags (useful after login/identify)
 */
export async function reloadFeatureFlags(): Promise<void> {
  if (typeof window === "undefined") return;
  return new Promise((resolve) => {
    posthog.reloadFeatureFlags();
    posthog.onFeatureFlags(() => resolve());
  });
}

/**
 * Capture when a user is exposed to an experiment
 */
export function captureExperimentExposure(
  experimentKey: string,
  variant: string
) {
  if (typeof window === "undefined") return;
  posthog.capture("$experiment_started", {
    $experiment_key: experimentKey,
    $variant: variant,
  });
}

/**
 * Override a feature flag (for testing)
 */
export function overrideFeatureFlag(flagKey: string, value: boolean | string) {
  if (typeof window === "undefined") return;
  posthog.featureFlags.override({ [flagKey]: value });
}

/**
 * Clear feature flag overrides
 */
export function clearFeatureFlagOverrides() {
  if (typeof window === "undefined") return;
  posthog.featureFlags.override(false);
}

/**
 * Identify user for personalized flags
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

/**
 * Reset user identity
 */
export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

