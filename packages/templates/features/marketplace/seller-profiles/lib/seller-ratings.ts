/**
 * Seller Ratings & Reviews
 */

import { createClient } from "@/lib/supabase/client";

export interface SellerProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  ratingAvg: number;
  ratingCount: number;
  totalSales: number;
  totalRevenue: number;
  memberSince: string;
  verifiedSeller: boolean;
}

export interface SellerRating {
  id: string;
  sellerId: string;
  buyerId: string;
  listingId?: string;
  rating: number;
  review?: string;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  createdAt: string;
  
  // Populated via joins
  buyer?: {
    displayName: string;
    avatarUrl?: string;
  };
  listing?: {
    title: string;
    images: string[];
  };
}

export interface CreateRatingInput {
  sellerId: string;
  listingId: string;
  transactionId?: string;
  rating: number;
  review?: string;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
}

const supabase = createClient();

/**
 * Get seller profile by user ID
 */
export async function getSellerProfile(userId: string): Promise<SellerProfile | null> {
  const { data, error } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return transformProfile(data);
}

/**
 * Get or create seller profile for current user
 */
export async function getOrCreateSellerProfile(): Promise<SellerProfile> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Must be logged in");
  }

  // Try to get existing profile
  const existing = await getSellerProfile(userData.user.id);
  if (existing) return existing;

  // Create new profile
  const { data, error } = await supabase
    .from("seller_profiles")
    .insert({
      user_id: userData.user.id,
      display_name: userData.user.user_metadata?.full_name || "Seller",
      avatar_url: userData.user.user_metadata?.avatar_url,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformProfile(data);
}

/**
 * Update seller profile
 */
export async function updateSellerProfile(
  updates: Partial<Pick<SellerProfile, "displayName" | "bio" | "avatarUrl">>
): Promise<SellerProfile> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Must be logged in");
  }

  const { data, error } = await supabase
    .from("seller_profiles")
    .update({
      display_name: updates.displayName,
      bio: updates.bio,
      avatar_url: updates.avatarUrl,
    })
    .eq("user_id", userData.user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformProfile(data);
}

/**
 * Get seller ratings
 */
export async function getSellerRatings(
  sellerId: string,
  limit = 20,
  offset = 0
): Promise<{ ratings: SellerRating[]; total: number }> {
  const { data, error, count } = await supabase
    .from("seller_ratings")
    .select(
      `
      *,
      buyer:seller_profiles!buyer_id(display_name, avatar_url),
      listing:listings(title, images)
    `,
      { count: "exact" }
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  const ratings = (data || []).map(transformRating);

  return {
    ratings,
    total: count || 0,
  };
}

/**
 * Create a rating for a seller
 */
export async function createRating(input: CreateRatingInput): Promise<SellerRating> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error("Must be logged in");
  }

  // Verify the buyer completed a transaction with this seller
  const { data: transaction } = await supabase
    .from("transactions")
    .select("id")
    .eq("listing_id", input.listingId)
    .eq("buyer_id", userData.user.id)
    .eq("payment_status", "paid")
    .single();

  if (!transaction) {
    throw new Error("You can only rate sellers for completed purchases");
  }

  const { data, error } = await supabase
    .from("seller_ratings")
    .insert({
      seller_id: input.sellerId,
      buyer_id: userData.user.id,
      listing_id: input.listingId,
      transaction_id: input.transactionId,
      rating: input.rating,
      review: input.review,
      item_as_described: input.itemAsDescribed,
      communication: input.communication,
      shipping_speed: input.shippingSpeed,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return transformRating(data);
}

/**
 * Check if user can rate a seller for a listing
 */
export async function canRateSeller(listingId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  // Check if completed transaction exists
  const { data: transaction } = await supabase
    .from("transactions")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", userData.user.id)
    .eq("payment_status", "paid")
    .single();

  if (!transaction) return false;

  // Check if rating already exists
  const { data: existingRating } = await supabase
    .from("seller_ratings")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", userData.user.id)
    .single();

  return !existingRating;
}

/**
 * Get rating breakdown for a seller
 */
export async function getRatingBreakdown(sellerId: string): Promise<{
  average: number;
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  aspects: {
    itemAsDescribed: number;
    communication: number;
    shippingSpeed: number;
  };
}> {
  const { data, error } = await supabase
    .from("seller_ratings")
    .select("rating, item_as_described, communication, shipping_speed")
    .eq("seller_id", sellerId);

  if (error) {
    throw new Error(error.message);
  }

  const ratings = data || [];
  const total = ratings.length;

  if (total === 0) {
    return {
      average: 0,
      total: 0,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      aspects: { itemAsDescribed: 0, communication: 0, shippingSpeed: 0 },
    };
  }

  // Calculate breakdown
  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  let itemSum = 0, itemCount = 0;
  let commSum = 0, commCount = 0;
  let shipSum = 0, shipCount = 0;

  for (const r of ratings) {
    sum += r.rating;
    breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
    
    if (r.item_as_described) { itemSum += r.item_as_described; itemCount++; }
    if (r.communication) { commSum += r.communication; commCount++; }
    if (r.shipping_speed) { shipSum += r.shipping_speed; shipCount++; }
  }

  return {
    average: Math.round((sum / total) * 10) / 10,
    total,
    breakdown,
    aspects: {
      itemAsDescribed: itemCount > 0 ? Math.round((itemSum / itemCount) * 10) / 10 : 0,
      communication: commCount > 0 ? Math.round((commSum / commCount) * 10) / 10 : 0,
      shippingSpeed: shipCount > 0 ? Math.round((shipSum / shipCount) * 10) / 10 : 0,
    },
  };
}

// Helpers
function transformProfile(data: Record<string, unknown>): SellerProfile {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    displayName: data.display_name as string,
    bio: data.bio as string | undefined,
    avatarUrl: data.avatar_url as string | undefined,
    ratingAvg: Number(data.rating_avg) || 0,
    ratingCount: Number(data.rating_count) || 0,
    totalSales: Number(data.total_sales) || 0,
    totalRevenue: Number(data.total_revenue) || 0,
    memberSince: data.member_since as string,
    verifiedSeller: data.verified_seller as boolean,
  };
}

function transformRating(data: Record<string, unknown>): SellerRating {
  return {
    id: data.id as string,
    sellerId: data.seller_id as string,
    buyerId: data.buyer_id as string,
    listingId: data.listing_id as string | undefined,
    rating: data.rating as number,
    review: data.review as string | undefined,
    itemAsDescribed: data.item_as_described as number | undefined,
    communication: data.communication as number | undefined,
    shippingSpeed: data.shipping_speed as number | undefined,
    createdAt: data.created_at as string,
    buyer: data.buyer as { displayName: string; avatarUrl?: string } | undefined,
    listing: data.listing as { title: string; images: string[] } | undefined,
  };
}

