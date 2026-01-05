/**
 * Auction & Bidding Types
 */

export interface Bid {
  id: string;
  listingId: string;
  bidderId: string;
  amount: number;
  maxBid?: number;
  isWinning: boolean;
  isAutoBid: boolean;
  createdAt: string;
  
  // Populated via joins
  bidder?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface PlaceBidInput {
  listingId: string;
  amount: number;
  maxBid?: number; // For proxy/auto-bidding
}

export interface PlaceBidResult {
  success: boolean;
  bid?: Bid;
  newHighBid: number;
  outbidUserId?: string;
  message: string;
  error?: string;
}

export interface AuctionState {
  listingId: string;
  currentPrice: number;
  bidCount: number;
  highBidderId?: string;
  reserveMet: boolean;
  endsAt: string;
  isEnded: boolean;
  extended: boolean;
}

export interface BidIncrement {
  minPrice: number;
  maxPrice: number;
  increment: number;
}

/**
 * eBay-style bid increments
 */
export const BID_INCREMENTS: BidIncrement[] = [
  { minPrice: 0.01, maxPrice: 0.99, increment: 0.05 },
  { minPrice: 1.00, maxPrice: 4.99, increment: 0.25 },
  { minPrice: 5.00, maxPrice: 24.99, increment: 0.50 },
  { minPrice: 25.00, maxPrice: 99.99, increment: 1.00 },
  { minPrice: 100.00, maxPrice: 249.99, increment: 2.50 },
  { minPrice: 250.00, maxPrice: 499.99, increment: 5.00 },
  { minPrice: 500.00, maxPrice: 999.99, increment: 10.00 },
  { minPrice: 1000.00, maxPrice: Infinity, increment: 25.00 },
];

/**
 * Calculate minimum bid increment for a given price
 */
export function getMinIncrement(currentPrice: number): number {
  const tier = BID_INCREMENTS.find(
    (b) => currentPrice >= b.minPrice && currentPrice <= b.maxPrice
  );
  return tier?.increment || 0.05;
}

/**
 * Calculate minimum next bid
 */
export function calculateMinBid(currentPrice: number): number {
  const increment = getMinIncrement(currentPrice);
  return Math.round((currentPrice + increment) * 100) / 100;
}

/**
 * Format bid amount for display
 */
export function formatBidAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(endsAt: string): {
  text: string;
  isUrgent: boolean;
  isEnded: boolean;
} {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { text: "Ended", isUrgent: false, isEnded: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // Urgent if less than 1 hour
  const isUrgent = diff < 60 * 60 * 1000;

  if (days > 0) {
    return { text: `${days}d ${hours}h`, isUrgent: false, isEnded: false };
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m`, isUrgent, isEnded: false };
  }
  if (minutes > 0) {
    return { text: `${minutes}m ${seconds}s`, isUrgent: true, isEnded: false };
  }
  return { text: `${seconds}s`, isUrgent: true, isEnded: false };
}

