"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Track page views in Plausible
 * 
 * Note: This is typically handled automatically by PlausibleProvider,
 * but this component can be used for custom page view tracking.
 */
export function PlausiblePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const plausible = (window as any).plausible;
    if (!plausible) return;

    // Build the full URL for tracking
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    // Plausible automatically tracks page views, but we can trigger manually if needed
    plausible("pageview", { u: url });
  }, [pathname, searchParams]);

  return null;
}

