"use client";

import { posthog } from "../../lib/posthog";

export function usePostHog() {
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    posthog.capture(event, properties);
  };

  const identifyUser = (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties);
  };

  const resetUser = () => {
    posthog.reset();
  };

  return {
    trackEvent,
    identifyUser,
    resetUser,
    posthog,
  };
}
