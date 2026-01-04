"use client";

/**
 * FeatureFlag Component
 * 
 * Declarative component for conditional rendering based on feature flags.
 */

import { ReactNode } from "react";
import { useFeatureFlag, useFeatureFlagValue } from "../hooks/useFeatureFlag";

interface FeatureFlagProps {
  /**
   * The feature flag key
   */
  flag: string;
  /**
   * Content to show when the flag is enabled
   */
  children: ReactNode;
  /**
   * Content to show when the flag is disabled
   */
  fallback?: ReactNode;
  /**
   * Loading state while flags are being fetched
   */
  loading?: ReactNode;
}

/**
 * Boolean Feature Flag Component
 * 
 * Shows children when flag is enabled, fallback when disabled.
 */
export function FeatureFlag({
  flag,
  children,
  fallback = null,
  loading = null,
}: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag);

  // Could add loading state if needed
  if (isEnabled === undefined && loading) {
    return <>{loading}</>;
  }

  return <>{isEnabled ? children : fallback}</>;
}

interface MultivariateFeatureFlagProps<T extends string> {
  /**
   * The feature flag key
   */
  flag: string;
  /**
   * Map of variant values to components
   */
  variants: Record<T, ReactNode>;
  /**
   * Default content if flag is not set or unknown variant
   */
  fallback?: ReactNode;
}

/**
 * Multivariate Feature Flag Component
 * 
 * Renders different content based on flag variant.
 */
export function MultivariateFeatureFlag<T extends string>({
  flag,
  variants,
  fallback = null,
}: MultivariateFeatureFlagProps<T>) {
  const value = useFeatureFlagValue<T>(flag);

  if (value === undefined || !(value in variants)) {
    return <>{fallback}</>;
  }

  return <>{variants[value]}</>;
}

interface ExperimentProps {
  /**
   * The experiment/feature flag key
   */
  experiment: string;
  /**
   * Control variant content
   */
  control: ReactNode;
  /**
   * Test variant content
   */
  test: ReactNode;
}

/**
 * A/B Test Experiment Component
 * 
 * Simple wrapper for A/B tests.
 */
export function Experiment({ experiment, control, test }: ExperimentProps) {
  const isTest = useFeatureFlag(experiment, { trackExposure: true });
  return <>{isTest ? test : control}</>;
}

/**
 * Feature Flag Gate for routes
 * 
 * Wrapper that redirects if flag is disabled.
 */
interface FeatureGateProps {
  flag: string;
  children: ReactNode;
  redirectTo?: string;
  message?: string;
}

export function FeatureGate({
  flag,
  children,
  redirectTo,
  message = "This feature is not available yet.",
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    if (redirectTo && typeof window !== "undefined") {
      window.location.href = redirectTo;
      return null;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-8 text-center">
        <div>
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

