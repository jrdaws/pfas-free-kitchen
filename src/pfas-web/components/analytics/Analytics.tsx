'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/**
 * Analytics component - loads analytics scripts in production
 * 
 * Supports:
 * - Google Analytics 4 (via NEXT_PUBLIC_GA_MEASUREMENT_ID)
 * - Plausible Analytics (via NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
 * 
 * Configure in .env.local:
 * NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN=pfasfreekitchen.com
 */
export function Analytics() {
  // Skip analytics in development
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
              });
            `}
          </Script>
        </>
      )}

      {/* Plausible Analytics (privacy-friendly alternative) */}
      {PLAUSIBLE_DOMAIN && (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}

/**
 * Track custom events
 * Use this function to track specific user actions
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
) {
  // Google Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as typeof window & { gtag: Function }).gtag('event', eventName, eventParams);
  }

  // Plausible Analytics
  if (typeof window !== 'undefined' && 'plausible' in window) {
    (window as typeof window & { plausible: Function }).plausible(eventName, {
      props: eventParams,
    });
  }
}

/**
 * Track product view
 */
export function trackProductView(productId: string, productName: string, tier: number) {
  trackEvent('view_item', {
    item_id: productId,
    item_name: productName,
    verification_tier: tier,
  });
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
  });
}

/**
 * Track compare action
 */
export function trackCompare(action: 'add' | 'remove' | 'view', productId?: string) {
  trackEvent('compare_action', {
    action,
    product_id: productId || '',
  });
}

/**
 * Track affiliate link click
 */
export function trackAffiliateClick(
  productId: string,
  retailer: string,
  position: string
) {
  trackEvent('affiliate_click', {
    product_id: productId,
    retailer,
    position,
  });
}

/**
 * Track filter usage
 */
export function trackFilterUsage(filterType: string, filterValue: string) {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
}
