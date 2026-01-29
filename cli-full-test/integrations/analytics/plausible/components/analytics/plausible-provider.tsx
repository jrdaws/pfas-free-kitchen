"use client";

import PlausibleProvider from "next-plausible";

export function PlausibleAnalytics({ children }: { children: React.ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  if (!domain) {
    console.warn("Plausible: NEXT_PUBLIC_PLAUSIBLE_DOMAIN is not set");
    return <>{children}</>;
  }

  return (
    <PlausibleProvider domain={domain} trackOutboundLinks>
      {children}
    </PlausibleProvider>
  );
}
