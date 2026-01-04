"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";

export function useFeatureFlag(flagKey: string, options: { fallback?: boolean } = {}): boolean {
  const { fallback = false } = options;
  const [isEnabled, setIsEnabled] = useState(fallback);

  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) return;

    const checkFlag = () => {
      const enabled = posthog.isFeatureEnabled(flagKey);
      if (enabled !== undefined) setIsEnabled(enabled);
    };

    checkFlag();
    posthog.onFeatureFlags(checkFlag);
  }, [flagKey]);

  return isEnabled;
}

export function useFeatureFlagValue<T = string>(flagKey: string, fallback?: T): T | undefined {
  const [value, setValue] = useState<T | undefined>(fallback);

  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) return;

    const checkFlag = () => {
      const flagValue = posthog.getFeatureFlag(flagKey);
      if (flagValue !== undefined) setValue(flagValue as T);
    };

    checkFlag();
    posthog.onFeatureFlags(checkFlag);
  }, [flagKey]);

  return value;
}

export function useFeatureFlags(): Record<string, boolean | string> {
  const [flags, setFlags] = useState<Record<string, boolean | string>>({});

  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) return;

    const updateFlags = () => {
      const allFlags = posthog.featureFlags.getFlagVariants();
      setFlags(allFlags || {});
    };

    updateFlags();
    posthog.onFeatureFlags(updateFlags);
  }, []);

  return flags;
}

