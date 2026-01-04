"use client";

/**
 * useFeatureFlag Hook
 * 
 * React hook for checking feature flag status.
 */

import { useState, useEffect } from "react";
import posthog from "posthog-js";

interface UseFeatureFlagOptions {
  /**
   * Default value before flags are loaded
   */
  fallback?: boolean;
  /**
   * Track exposure to the experiment
   */
  trackExposure?: boolean;
}

/**
 * Check if a feature flag is enabled
 */
export function useFeatureFlag(
  flagKey: string,
  options: UseFeatureFlagOptions = {}
): boolean {
  const { fallback = false, trackExposure = true } = options;
  const [isEnabled, setIsEnabled] = useState(fallback);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if PostHog is initialized
    if (typeof window === "undefined" || !posthog.__loaded) {
      return;
    }

    const checkFlag = () => {
      const enabled = posthog.isFeatureEnabled(flagKey);
      if (enabled !== undefined) {
        setIsEnabled(enabled);
        setIsLoaded(true);

        // Track experiment exposure
        if (trackExposure && enabled) {
          posthog.capture("$experiment_started", {
            $experiment_key: flagKey,
            $variant: enabled ? "test" : "control",
          });
        }
      }
    };

    // Check immediately
    checkFlag();

    // Also check when flags are loaded
    posthog.onFeatureFlags(checkFlag);

    return () => {
      // Cleanup if needed
    };
  }, [flagKey, trackExposure]);

  return isLoaded ? isEnabled : fallback;
}

/**
 * Get multivariate feature flag value
 */
export function useFeatureFlagValue<T = string>(
  flagKey: string,
  fallback?: T
): T | undefined {
  const [value, setValue] = useState<T | undefined>(fallback);

  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) {
      return;
    }

    const checkFlag = () => {
      const flagValue = posthog.getFeatureFlag(flagKey);
      if (flagValue !== undefined) {
        setValue(flagValue as T);
      }
    };

    checkFlag();
    posthog.onFeatureFlags(checkFlag);
  }, [flagKey]);

  return value;
}

/**
 * Get all active feature flags
 */
export function useFeatureFlags(): Record<string, boolean | string> {
  const [flags, setFlags] = useState<Record<string, boolean | string>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) {
      return;
    }

    const updateFlags = () => {
      const allFlags = posthog.featureFlags.getFlagVariants();
      setFlags(allFlags || {});
    };

    updateFlags();
    posthog.onFeatureFlags(updateFlags);
  }, []);

  return flags;
}

/**
 * Check if feature flags have been loaded
 */
export function useFeatureFlagsLoaded(): boolean {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) {
      return;
    }

    if (posthog.featureFlags.getFlags().length > 0) {
      setIsLoaded(true);
      return;
    }

    posthog.onFeatureFlags(() => {
      setIsLoaded(true);
    });
  }, []);

  return isLoaded;
}

