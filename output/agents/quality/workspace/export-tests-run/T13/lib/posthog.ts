import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (!key) {
      console.warn("PostHog: NEXT_PUBLIC_POSTHOG_KEY is not set");
      return;
    }

    posthog.init(key, {
      api_host: host,
      capture_pageview: false, // Disable automatic pageview capture, we'll do it manually
      capture_pageleave: true,
    });
  }
}

export { posthog };
