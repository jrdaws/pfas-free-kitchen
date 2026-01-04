import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

export function initPostHog() {
  if (typeof window === "undefined" || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    loaded: (ph) => {
      if (process.env.NODE_ENV === "development") ph.debug();
    },
  });
}

export function isFeatureEnabled(flagKey: string): boolean {
  if (typeof window === "undefined") return false;
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

export function getFeatureFlagValue<T = unknown>(flagKey: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  return posthog.getFeatureFlag(flagKey) as T | undefined;
}

export function getAllFeatureFlags(): Record<string, boolean | string> {
  if (typeof window === "undefined") return {};
  return posthog.featureFlags.getFlagVariants() || {};
}

export async function reloadFeatureFlags(): Promise<void> {
  if (typeof window === "undefined") return;
  return new Promise((resolve) => {
    posthog.reloadFeatureFlags();
    posthog.onFeatureFlags(() => resolve());
  });
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

export function resetUser() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

