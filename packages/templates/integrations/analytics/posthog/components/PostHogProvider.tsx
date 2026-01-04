"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, trackPageView, identifyUser, resetUser } from "@/lib/analytics/posthog";

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      let url = pathname;
      if (searchParams?.toString()) {
        url = `${pathname}?${searchParams.toString()}`;
      }
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// Re-export analytics functions for convenience
export { identifyUser, resetUser };

