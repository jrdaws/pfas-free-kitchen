/**
 * Affiliate Click Tracking
 * 
 * Client-side tracking for affiliate link clicks.
 * Privacy-first: no IP logging, hashed user agents.
 */

interface ClickTrackingParams {
  productId: string;
  retailerId: string;
  sessionId?: string;
  referrerPage?: string;
}

interface TrackingResponse {
  clickId: string;
  tracked: boolean;
}

/**
 * Track an affiliate link click.
 * Non-blocking - will not prevent navigation on failure.
 */
export async function trackAffiliateClick(
  params: ClickTrackingParams
): Promise<TrackingResponse | null> {
  try {
    const response = await fetch('/api/v1/affiliate-clicks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: params.productId,
        retailer_id: params.retailerId,
        session_id: params.sessionId || getSessionId(),
        referrer_page: params.referrerPage || getCurrentPath(),
        user_agent_hash: hashUserAgent(),
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn('Click tracking failed:', response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    // Non-critical - don't block navigation
    console.warn('Click tracking error:', error);
    return null;
  }
}

/**
 * Track click via Google Analytics (if available).
 */
export function trackAffiliateClickGA(params: {
  retailerId: string;
  productId: string;
  productName?: string;
}) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag('event', 'affiliate_click', {
      event_category: 'Affiliate',
      event_label: params.retailerId,
      product_id: params.productId,
      product_name: params.productName,
    });
  }
}

/**
 * Get or create a session ID for click tracking.
 * Stored in sessionStorage (cleared on tab close).
 */
export function getSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const key = 'pfas_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

/**
 * Hash the user agent for privacy-compliant tracking.
 * Uses btoa for simple hashing - not cryptographically secure
 * but sufficient for bot detection.
 */
export function hashUserAgent(): string | undefined {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return undefined;
  }

  try {
    // Simple hash - first 32 chars of base64 encoded UA
    return btoa(navigator.userAgent).slice(0, 32);
  } catch {
    return undefined;
  }
}

/**
 * Get the current page path.
 */
function getCurrentPath(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.location.pathname;
}

/**
 * Generate a UUID for session tracking.
 * Uses crypto.randomUUID if available, falls back to simple generation.
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Store recently clicked products (for deduplication).
 */
const RECENT_CLICKS_KEY = 'pfas_recent_clicks';
const CLICK_COOLDOWN_MS = 5000; // 5 seconds

interface RecentClick {
  productId: string;
  retailerId: string;
  timestamp: number;
}

/**
 * Check if this click should be tracked (not a duplicate).
 */
export function shouldTrackClick(productId: string, retailerId: string): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const stored = sessionStorage.getItem(RECENT_CLICKS_KEY);
    const recentClicks: RecentClick[] = stored ? JSON.parse(stored) : [];
    const now = Date.now();

    // Check for recent duplicate
    const isDuplicate = recentClicks.some(
      (click) =>
        click.productId === productId &&
        click.retailerId === retailerId &&
        now - click.timestamp < CLICK_COOLDOWN_MS
    );

    if (isDuplicate) {
      return false;
    }

    // Add this click
    recentClicks.push({ productId, retailerId, timestamp: now });

    // Keep only recent clicks (last minute)
    const filtered = recentClicks.filter((c) => now - c.timestamp < 60000);
    sessionStorage.setItem(RECENT_CLICKS_KEY, JSON.stringify(filtered));

    return true;
  } catch {
    return true;
  }
}

/**
 * Combined tracking function with deduplication.
 */
export async function trackClick(
  productId: string,
  retailerId: string,
  options?: {
    productName?: string;
    skipDedup?: boolean;
  }
): Promise<void> {
  // Check for duplicates (unless skipped)
  if (!options?.skipDedup && !shouldTrackClick(productId, retailerId)) {
    return;
  }

  // Track via API
  trackAffiliateClick({
    productId,
    retailerId,
  });

  // Track via GA
  trackAffiliateClickGA({
    productId,
    retailerId,
    productName: options?.productName,
  });
}

/**
 * Generate UTM parameters for affiliate links.
 */
export function generateUTMParams(
  retailerId: string,
  productId: string,
  campaign?: string
): URLSearchParams {
  const params = new URLSearchParams();

  params.set('utm_source', 'pfas-free-kitchen');
  params.set('utm_medium', 'affiliate');
  params.set('utm_campaign', campaign || 'product-link');
  params.set('utm_content', productId);
  params.set('utm_term', retailerId);

  return params;
}

/**
 * Append UTM parameters to a URL.
 */
export function appendUTMParams(
  url: string,
  retailerId: string,
  productId: string
): string {
  try {
    const urlObj = new URL(url);
    const utm = generateUTMParams(retailerId, productId);

    utm.forEach((value, key) => {
      urlObj.searchParams.set(key, value);
    });

    return urlObj.toString();
  } catch {
    // Invalid URL - return original
    return url;
  }
}
