/**
 * Marketplace Listing Types
 */

export type ListingType = "auction" | "fixed" | "both";
export type ListingStatus = "draft" | "active" | "ended" | "sold" | "cancelled";
export type ItemCondition = "new" | "like_new" | "good" | "fair" | "poor";

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  
  // Basic Info
  title: string;
  description?: string;
  images: string[];
  
  // Categorization
  categoryId?: string;
  category?: ListingCategory;
  condition: ItemCondition;
  
  // Pricing
  startingPrice: number;
  currentPrice?: number;
  buyItNowPrice?: number;
  reservePrice?: number;
  reserveMet: boolean;
  
  // Type & Status
  listingType: ListingType;
  status: ListingStatus;
  
  // Timing
  startsAt: string;
  endsAt?: string;
  durationDays: number;
  autoExtend: boolean;
  
  // Stats
  viewCount: number;
  watchCount: number;
  bidCount: number;
  
  // Winner
  winningBidId?: string;
  winningBidderId?: string;
  
  // Shipping
  shippingCost: number;
  shipsFrom?: string;
  shipsTo: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  
  // Relations (optional, populated by joins)
  seller?: SellerProfile;
}

export interface SellerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  ratingAvg: number;
  ratingCount: number;
  totalSales: number;
  memberSince: string;
  verifiedSeller: boolean;
}

export interface CreateListingInput {
  title: string;
  description?: string;
  images?: string[];
  categoryId?: string;
  condition?: ItemCondition;
  startingPrice: number;
  buyItNowPrice?: number;
  reservePrice?: number;
  listingType: ListingType;
  durationDays?: number;
  autoExtend?: boolean;
  shippingCost?: number;
  shipsFrom?: string;
  shipsTo?: string[];
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  images?: string[];
  categoryId?: string;
  condition?: ItemCondition;
  buyItNowPrice?: number;
  reservePrice?: number;
  shippingCost?: number;
  shipsFrom?: string;
  shipsTo?: string[];
}

export interface ListingFilters {
  search?: string;
  categoryId?: string;
  condition?: ItemCondition[];
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  endingSoon?: boolean;
  status?: ListingStatus[];
}

export interface ListingsResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "For Parts/Not Working",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  auction: "Auction",
  fixed: "Buy It Now",
  both: "Auction with Buy It Now",
};

export const STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  active: "Active",
  ended: "Ended",
  sold: "Sold",
  cancelled: "Cancelled",
};

