/**
 * Affiliate Types for PFAS-Free Kitchen Platform
 */

// ============================================================
// AFFILIATE PROGRAM
// ============================================================

export interface AffiliateProgram {
  id: string;
  name: string;
  networkName?: string; // e.g., "Impact", "CJ Affiliate", "Amazon Associates"
  affiliateId: string;
  apiKey?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Retailer {
  id: string;
  name: string;
  slug: string;
  website: string;
  iconName?: string;
  affiliateProgramId?: string;
  active: boolean;
}

export interface RetailerLink {
  id: string;
  productId: string;
  retailerId: string;
  externalId: string; // ASIN, SKU, etc.
  productUrl?: string;
  inStock?: boolean;
  lastCheckedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// LINK GENERATION
// ============================================================

export interface LinkGenerationParams {
  productId: string;
  asin?: string;
  sku?: string;
  affiliateId: string;
  trackingId: string;
}

export interface GeneratedLink {
  retailerId: string;
  retailerName: string;
  retailerIcon?: string;
  affiliateUrl: string;
  disclosureRequired: boolean;
  disclosureText: string;
}

export interface LinkGenerationResult {
  productId: string;
  links: GeneratedLink[];
  gridDisclosure: string;
}

// ============================================================
// CLICK TRACKING
// ============================================================

export interface ClickParams {
  productId: string;
  variantId?: string;
  retailerId: string;
  sessionId?: string;
  referrerPage?: string;
  userAgentHash?: string;
}

export interface CreateClickParams extends ClickParams {
  isBot: boolean;
  botDetectionReason?: string;
}

export interface Click {
  id: string;
  productId: string;
  variantId?: string;
  retailerId: string;
  sessionId?: string;
  referrerPage?: string;
  userAgentHash?: string;
  isBot: boolean;
  botDetectionReason?: string;
  createdAt: Date;
}

export interface ClickTrackingResult {
  clickId: string;
  tracked: boolean;
}

// ============================================================
// BOT DETECTION
// ============================================================

export interface BotCheckResult {
  isBot: boolean;
  reason: string | null;
  confidence?: number;
}

/**
 * Known bot user agent patterns
 */
export const BOT_USER_AGENT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /facebot/i,
  /ia_archiver/i, // Alexa
  /mj12bot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /dotbot/i,
  /petalbot/i,
  /sogou/i,
  /exabot/i,
  /archive\.org_bot/i,
  /bot[\s_-]?/i,
  /crawler/i,
  /spider/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
];

// ============================================================
// ANALYTICS
// ============================================================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AggregateParams {
  dateRange: DateRange;
  groupBy: 'day' | 'retailer' | 'product' | 'category';
  excludeBots?: boolean;
}

export interface ClickAnalytics {
  totalClicks: number;
  uniqueSessions: number;
  botClicks: number;
  topProducts: Array<{ productId: string; productName: string; count: number }>;
  topRetailers: Array<{ retailerId: string; retailerName: string; count: number }>;
  timeSeries: Array<{ date: string; count: number }>;
}
