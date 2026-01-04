"use client";

import PlausibleProvider from "next-plausible";

interface PlausibleAnalyticsProviderProps {
  children: React.ReactNode;
  domain?: string;
  customDomain?: string;
  trackOutboundLinks?: boolean;
  trackFileDownloads?: boolean;
  taggedEvents?: boolean;
  hash?: boolean;
  exclude?: string;
  selfHosted?: boolean;
  enabled?: boolean;
  integrity?: string;
  scriptProps?: Record<string, string>;
}

/**
 * Plausible Analytics Provider
 * 
 * Wrap your app with this component to enable Plausible Analytics.
 * 
 * Add to your root layout.tsx:
 * ```tsx
 * import { PlausibleAnalyticsProvider } from "@/components/analytics/PlausibleProvider";
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <PlausibleAnalyticsProvider domain="yourdomain.com">
 *           <body>{children}</body>
 *         </PlausibleAnalyticsProvider>
 *       </head>
 *     </html>
 *   );
 * }
 * ```
 */
export function PlausibleAnalyticsProvider({
  children,
  domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  trackOutboundLinks = true,
  trackFileDownloads = true,
  taggedEvents = true,
  enabled = true,
  ...props
}: PlausibleAnalyticsProviderProps) {
  if (!domain) {
    console.warn("Plausible: No domain configured. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN.");
    return <>{children}</>;
  }

  return (
    <PlausibleProvider
      domain={domain}
      trackOutboundLinks={trackOutboundLinks}
      trackFileDownloads={trackFileDownloads}
      taggedEvents={taggedEvents}
      enabled={enabled}
      {...props}
    >
      {children}
    </PlausibleProvider>
  );
}

export { PlausibleAnalyticsProvider as default };

