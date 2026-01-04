"use client";

import { useCallback } from "react";
import { trackEvent, identifyUser, resetUser } from "@/lib/analytics/posthog";

/**
 * Hook for analytics tracking
 */
export function useAnalytics() {
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    trackEvent(event, properties);
  }, []);

  const identify = useCallback((userId: string, properties?: Record<string, unknown>) => {
    identifyUser(userId, properties);
  }, []);

  const reset = useCallback(() => {
    resetUser();
  }, []);

  return {
    track,
    identify,
    reset,
  };
}

// Common event tracking helpers
export function useTrackClick() {
  const { track } = useAnalytics();

  return useCallback(
    (elementName: string, properties?: Record<string, unknown>) => {
      track("button_clicked", { element: elementName, ...properties });
    },
    [track]
  );
}

export function useTrackConversion() {
  const { track } = useAnalytics();

  return useCallback(
    (conversionType: string, value?: number, properties?: Record<string, unknown>) => {
      track("conversion", { type: conversionType, value, ...properties });
    },
    [track]
  );
}

export function useTrackError() {
  const { track } = useAnalytics();

  return useCallback(
    (error: Error | string, context?: Record<string, unknown>) => {
      track("error_occurred", {
        message: typeof error === "string" ? error : error.message,
        ...context,
      });
    },
    [track]
  );
}

