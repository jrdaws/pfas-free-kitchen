/**
 * Affiliate Network Integration
 * 
 * Handles affiliate link generation and tracking for:
 * - Amazon Associates
 * - CJ Affiliate (Commission Junction)
 * - Awin
 */

import { trackClick, generateUTMParams } from './tracking';

// ============================================================
// CONFIGURATION - REPLACE WITH YOUR ACTUAL IDS
// ============================================================

export const AFFILIATE_IDS = {
  // Amazon Associates
  amazon: {
    tag: 'YOUR_AMAZON_TAG', // e.g., 'pfasfreekitchen-20'
    enabled: true,
  },

  // CJ Affiliate (Commission Junction)
  cj: {
    publisherId: 'YOUR_CJ_PID', // Your CJ Publisher ID
    enabled: true,
    // Merchant-specific IDs (CJ calls these "advertisers")
    merchants: {
      // Add your CJ advertiser IDs here as you get them
      // 'brand-name': { advertiserId: '1234567', linkId: '12345678' },
    } as Record<string, { advertiserId: string; linkId?: string }>,
  },

  // Awin
  awin: {
    publisherId: 'YOUR_AWIN_ID', // Your Awin Publisher ID
    enabled: true,
    // Merchant IDs (Awin calls these "merchants" or "advertisers")
    merchants: {
      // Add your Awin merchant IDs here as you join programs
      // 'brand-name': '12345',
    } as Record<string, string>,
  },
} as const;

// ============================================================
// AFFILIATE NETWORK TYPES
// ============================================================

export type AffiliateNetwork = 'amazon' | 'cj' | 'awin' | 'direct';

export interface AffiliateClickData {
  productId: string;
  productName: string;
  network: AffiliateNetwork;
  retailer: string;
  originalUrl: string;
  affiliateUrl: string;
  price?: number;
}

// ============================================================
// AMAZON ASSOCIATES
// ============================================================

/**
 * Generate Amazon affiliate link from ASIN
 */
export function generateAmazonLink(asin: string, customTag?: string): string {
  const tag = customTag || AFFILIATE_IDS.amazon.tag;
  
  // If tag not configured, return plain Amazon link
  if (tag === 'YOUR_AMAZON_TAG') {
    return `https://www.amazon.com/dp/${asin}`;
  }
  
  return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
}

/**
 * Add Amazon affiliate tag to existing Amazon URL
 */
export function addAmazonTag(url: string, customTag?: string): string {
  const tag = customTag || AFFILIATE_IDS.amazon.tag;
  
  if (tag === 'YOUR_AMAZON_TAG') {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only process Amazon URLs
    if (!urlObj.hostname.includes('amazon.')) {
      return url;
    }
    
    // Replace or add tag
    urlObj.searchParams.set('tag', tag);
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Check if URL is an Amazon link
 */
export function isAmazonUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('amazon.');
  } catch {
    return false;
  }
}

// ============================================================
// CJ AFFILIATE
// ============================================================

/**
 * Generate CJ affiliate link
 * CJ uses a redirect format through their tracking domain
 */
export function generateCJLink(
  destinationUrl: string,
  advertiserId: string,
  linkId?: string
): string {
  const publisherId = AFFILIATE_IDS.cj.publisherId;
  
  if (publisherId === 'YOUR_CJ_PID') {
    return destinationUrl;
  }
  
  const encodedUrl = encodeURIComponent(destinationUrl);
  
  // CJ affiliate link format
  // The exact format depends on the advertiser, but this is a common pattern
  let cjUrl = `https://www.anrdoezrs.net/links/${publisherId}/type/dlg/sid/pfas-${Date.now()}`;
  
  if (linkId) {
    cjUrl += `/https://www.jdoqocy.com/click-${publisherId}-${linkId}`;
  } else {
    cjUrl += `/${encodedUrl}`;
  }
  
  return cjUrl;
}

/**
 * Get CJ merchant config if available
 */
export function getCJMerchant(brandSlug: string): { advertiserId: string; linkId?: string } | undefined {
  return AFFILIATE_IDS.cj.merchants[brandSlug];
}

// ============================================================
// AWIN
// ============================================================

/**
 * Generate Awin affiliate link
 */
export function generateAwinLink(
  destinationUrl: string,
  merchantId: string,
  customPublisherId?: string
): string {
  const publisherId = customPublisherId || AFFILIATE_IDS.awin.publisherId;
  
  if (publisherId === 'YOUR_AWIN_ID') {
    return destinationUrl;
  }
  
  const encodedUrl = encodeURIComponent(destinationUrl);
  
  // Awin affiliate link format
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${publisherId}&ued=${encodedUrl}`;
}

/**
 * Get Awin merchant ID if available
 */
export function getAwinMerchant(brandSlug: string): string | undefined {
  return AFFILIATE_IDS.awin.merchants[brandSlug];
}

// ============================================================
// UNIFIED AFFILIATE LINK HANDLER
// ============================================================

export interface GenerateAffiliateLinkOptions {
  url: string;
  network?: AffiliateNetwork;
  brandSlug?: string;
  productId?: string;
  asin?: string; // For Amazon products
}

/**
 * Generate the appropriate affiliate link based on network and brand
 */
export function generateAffiliateLink(options: GenerateAffiliateLinkOptions): string {
  const { url, network, brandSlug, productId, asin } = options;
  
  // Amazon link with ASIN
  if (asin && AFFILIATE_IDS.amazon.enabled) {
    return generateAmazonLink(asin);
  }
  
  // Amazon URL - add tag
  if (isAmazonUrl(url) && AFFILIATE_IDS.amazon.enabled) {
    return addAmazonTag(url);
  }
  
  // Check if we have CJ config for this brand
  if (brandSlug && AFFILIATE_IDS.cj.enabled) {
    const cjMerchant = getCJMerchant(brandSlug);
    if (cjMerchant) {
      return generateCJLink(url, cjMerchant.advertiserId, cjMerchant.linkId);
    }
  }
  
  // Check if we have Awin config for this brand
  if (brandSlug && AFFILIATE_IDS.awin.enabled) {
    const awinMerchantId = getAwinMerchant(brandSlug);
    if (awinMerchantId) {
      return generateAwinLink(url, awinMerchantId);
    }
  }
  
  // Add UTM params to direct links for tracking
  if (productId) {
    const utmParams = generateUTMParams('direct', productId);
    try {
      const urlObj = new URL(url);
      utmParams.forEach((value, key) => {
        urlObj.searchParams.set(key, value);
      });
      return urlObj.toString();
    } catch {
      return url;
    }
  }
  
  return url;
}

// ============================================================
// CLICK TRACKING WITH AFFILIATE DATA
// ============================================================

/**
 * Track affiliate click with network-specific data
 */
export async function trackAffiliateClickWithNetwork(
  data: AffiliateClickData
): Promise<void> {
  // Track via our internal tracking
  await trackClick(data.productId, data.retailer, {
    productName: data.productName,
  });
  
  // Network-specific tracking
  switch (data.network) {
    case 'amazon':
      // Amazon tracks via their tag automatically
      // Additional tracking can be done via Amazon Attribution if configured
      break;
      
    case 'cj':
      // CJ tracks via their redirect URL
      // Additional reporting available in CJ dashboard
      break;
      
    case 'awin':
      // Awin tracks via their redirect URL
      // Additional reporting available in Awin dashboard
      break;
      
    case 'direct':
      // Direct links - we rely on our own tracking
      break;
  }
}

// ============================================================
// HELPER: Detect affiliate network from URL
// ============================================================

export function detectAffiliateNetwork(url: string): AffiliateNetwork {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Amazon
    if (hostname.includes('amazon.') || hostname.includes('amzn.')) {
      return 'amazon';
    }
    
    // CJ affiliate domains
    if (
      hostname.includes('anrdoezrs.net') ||
      hostname.includes('jdoqocy.com') ||
      hostname.includes('tkqlhce.com') ||
      hostname.includes('dpbolvw.net') ||
      hostname.includes('kqzyfj.com')
    ) {
      return 'cj';
    }
    
    // Awin domains
    if (
      hostname.includes('awin1.com') ||
      hostname.includes('awin.com')
    ) {
      return 'awin';
    }
    
    return 'direct';
  } catch {
    return 'direct';
  }
}

// ============================================================
// REVENUE ESTIMATION (for reporting)
// ============================================================

export interface CommissionRate {
  network: AffiliateNetwork;
  category: string;
  rate: number; // Percentage as decimal (e.g., 0.04 = 4%)
}

// Average commission rates for estimation
export const COMMISSION_RATES: CommissionRate[] = [
  { network: 'amazon', category: 'kitchen', rate: 0.04 }, // 4% for kitchen
  { network: 'amazon', category: 'home', rate: 0.03 },    // 3% for home
  { network: 'cj', category: 'cookware', rate: 0.08 },    // 8% typical for cookware brands
  { network: 'awin', category: 'cookware', rate: 0.08 },  // 8% typical
  { network: 'direct', category: 'default', rate: 0.10 }, // 10% typical for direct brand affiliates
];

/**
 * Estimate commission for a product sale
 */
export function estimateCommission(
  price: number,
  network: AffiliateNetwork,
  category = 'kitchen'
): number {
  const rate = COMMISSION_RATES.find(
    r => r.network === network && r.category === category
  )?.rate || 0.05; // Default 5%
  
  return price * rate;
}
