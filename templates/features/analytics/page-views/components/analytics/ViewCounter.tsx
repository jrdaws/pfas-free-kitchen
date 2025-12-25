"use client";

import { useEffect, useState } from "react";
import { getPageViewCount, trackPageView } from "@/lib/analytics/page-tracker";

interface ViewCounterProps {
  page: string;
  trackOnMount?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function ViewCounter({
  page,
  trackOnMount = true,
  showIcon = true,
  className = "",
}: ViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Track view on mount
    if (trackOnMount) {
      trackPageView(page);
    }

    // Fetch count
    getPageViewCount(page).then(setCount);
  }, [page, trackOnMount]);

  if (count === null) {
    return (
      <span className={`text-gray-400 ${className}`}>
        {showIcon && <EyeIcon />}
        <span className="animate-pulse">...</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 ${className}`}>
      {showIcon && <EyeIcon />}
      <span>{formatCount(count)} views</span>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Real-time view counter that updates
 */
interface LiveViewCounterProps extends ViewCounterProps {
  refreshInterval?: number;
}

export function LiveViewCounter({
  page,
  refreshInterval = 30000,
  ...props
}: LiveViewCounterProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Initial fetch
    getPageViewCount(page).then(setCount);

    // Set up polling
    const interval = setInterval(() => {
      getPageViewCount(page).then(setCount);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [page, refreshInterval]);

  return (
    <span className={`inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 ${props.className || ""}`}>
      {props.showIcon !== false && <EyeIcon />}
      <span>{count !== null ? formatCount(count) : "..."} views</span>
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live" />
    </span>
  );
}

