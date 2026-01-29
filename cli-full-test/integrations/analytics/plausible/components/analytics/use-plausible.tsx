"use client";

import { usePlausible } from "next-plausible";

export function usePlausibleTracking() {
  const plausible = usePlausible();

  const trackEvent = (
    eventName: string,
    options?: { props?: Record<string, string | number | boolean> }
  ) => {
    plausible(eventName, options);
  };

  return {
    trackEvent,
  };
}
