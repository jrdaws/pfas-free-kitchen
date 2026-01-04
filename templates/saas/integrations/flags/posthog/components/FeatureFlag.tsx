"use client";

import { ReactNode } from "react";
import { useFeatureFlag, useFeatureFlagValue } from "../hooks/useFeatureFlag";

interface FeatureFlagProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? children : fallback}</>;
}

interface MultivariateFeatureFlagProps<T extends string> {
  flag: string;
  variants: Record<T, ReactNode>;
  fallback?: ReactNode;
}

export function MultivariateFeatureFlag<T extends string>({
  flag,
  variants,
  fallback = null,
}: MultivariateFeatureFlagProps<T>) {
  const value = useFeatureFlagValue<T>(flag);
  if (value === undefined || !(value in variants)) return <>{fallback}</>;
  return <>{variants[value]}</>;
}

interface ExperimentProps {
  experiment: string;
  control: ReactNode;
  test: ReactNode;
}

export function Experiment({ experiment, control, test }: ExperimentProps) {
  const isTest = useFeatureFlag(experiment);
  return <>{isTest ? test : control}</>;
}

interface FeatureGateProps {
  flag: string;
  children: ReactNode;
  message?: string;
}

export function FeatureGate({ flag, children, message = "This feature is not available yet." }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  if (!isEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8 text-center">
        <p className="text-gray-500">{message}</p>
      </div>
    );
  }
  return <>{children}</>;
}

