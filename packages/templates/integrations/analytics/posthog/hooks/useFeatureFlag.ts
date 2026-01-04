"use client";

import { useState, useEffect } from "react";
import { isFeatureEnabled, getFeatureFlag, reloadFeatureFlags, posthog } from "@/lib/analytics/posthog";

/**
 * Hook to check if a feature flag is enabled
 */
export function useFeatureFlag(flagKey: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Initial check
    setEnabled(isFeatureEnabled(flagKey));

    // Listen for flag updates
    const handleFlagsLoaded = () => {
      setEnabled(isFeatureEnabled(flagKey));
    };

    posthog.onFeatureFlags?.(handleFlagsLoaded);

    return () => {
      // PostHog doesn't provide an unsubscribe method,
      // but the listener will be cleaned up when the component unmounts
    };
  }, [flagKey]);

  return enabled;
}

/**
 * Hook to get a feature flag value (for multivariate flags)
 */
export function useFeatureFlagValue(flagKey: string): boolean | string | undefined {
  const [value, setValue] = useState<boolean | string | undefined>(undefined);

  useEffect(() => {
    // Initial check
    setValue(getFeatureFlag(flagKey));

    // Listen for flag updates
    const handleFlagsLoaded = () => {
      setValue(getFeatureFlag(flagKey));
    };

    posthog.onFeatureFlags?.(handleFlagsLoaded);
  }, [flagKey]);

  return value;
}

/**
 * Hook to manually reload feature flags
 */
export function useReloadFeatureFlags() {
  return reloadFeatureFlags;
}

/**
 * A/B test variant hook
 */
export function useABTest(experimentKey: string): string | undefined {
  const variant = useFeatureFlagValue(experimentKey);
  return typeof variant === "string" ? variant : undefined;
}

