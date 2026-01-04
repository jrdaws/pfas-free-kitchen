"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/posthog";

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = pathname;
      if (searchParams?.toString()) {
        url = `${pathname}?${searchParams.toString()}`;
      }
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Component to track page views
 * Add this to your layout if not using PostHogProvider
 */
export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}

