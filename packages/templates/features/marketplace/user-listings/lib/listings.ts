/**
 * Listings CRUD Operations
 */

import { createClient } from "@/lib/supabase/client";
import type {
  Listing,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  ListingsResult,
  ListingCategory,
} from "./listing-types";

const supabase = createClient();

/**
 * Get all listings with filters
 */
export async function getListings(
  filters: ListingFilters = {},
  page = 1,
  pageSize = 24
): Promise<ListingsResult> {
  let query = supabase
    .from("listings")
    .select(`
      *,
      category:listing_categories(*),
      seller:seller_profiles!seller_id(*)
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.textSearch("title", filters.search, { type: "websearch" });
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.condition && filters.condition.length > 0) {
    query = query.in("condition", filters.condition);
  }

  if (filters.listingType) {
    query = query.eq("listing_type", filters.listingType);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("current_price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("current_price", filters.maxPrice);
  }

  if (filters.endingSoon) {
    const soon = new Date();
    soon.setHours(soon.getHours() + 24);
    query = query.lte("ends_at", soon.toISOString());
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  } else {
    // Default to active listings
    query = query.eq("status", "active");
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    listings: (data || []) as unknown as Listing[],
    total: count || 0,
    page,
    pageSize,
    hasMore: (count || 0) > page * pageSize,
  };
}

/**
 * Get single listing by ID
 */
export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      category:listing_categories(*),
      seller:seller_profiles!seller_id(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  // Increment view count
  await supabase.rpc("increment_view_count", { listing_id: id });

  return data as unknown as Listing;
}

/**
 * Get listings by seller
 */
export async function getSellerListings(
  sellerId: string,
  status?: string[]
): Promise<Listing[]> {
  let query = supabase
    .from("listings")
    .select(`
      *,
      category:listing_categories(*)
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (status && status.length > 0) {
    query = query.in("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as unknown as Listing[];
}

/**
 * Create new listing
 */
export async function createListing(input: CreateListingInput): Promise<Listing> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Must be logged in to create listing");
  }

  // Calculate end date
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + (input.durationDays || 7));

  const { data, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.user.id,
      title: input.title,
      description: input.description,
      images: input.images || [],
      category_id: input.categoryId,
      condition: input.condition || "good",
      starting_price: input.startingPrice,
      current_price: input.startingPrice,
      buy_it_now_price: input.buyItNowPrice,
      reserve_price: input.reservePrice,
      listing_type: input.listingType,
      duration_days: input.durationDays || 7,
      ends_at: endsAt.toISOString(),
      auto_extend: input.autoExtend ?? true,
      shipping_cost: input.shippingCost || 0,
      ships_from: input.shipsFrom,
      ships_to: input.shipsTo || ["US"],
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as Listing;
}

/**
 * Update listing
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput
): Promise<Listing> {
  const updateData: Record<string, unknown> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.images !== undefined) updateData.images = input.images;
  if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
  if (input.condition !== undefined) updateData.condition = input.condition;
  if (input.buyItNowPrice !== undefined) updateData.buy_it_now_price = input.buyItNowPrice;
  if (input.reservePrice !== undefined) updateData.reserve_price = input.reservePrice;
  if (input.shippingCost !== undefined) updateData.shipping_cost = input.shippingCost;
  if (input.shipsFrom !== undefined) updateData.ships_from = input.shipsFrom;
  if (input.shipsTo !== undefined) updateData.ships_to = input.shipsTo;

  const { data, error } = await supabase
    .from("listings")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as Listing;
}

/**
 * Publish listing (draft -> active)
 */
export async function publishListing(id: string): Promise<Listing> {
  const endsAt = new Date();
  
  // Get listing to check duration
  const { data: listing } = await supabase
    .from("listings")
    .select("duration_days")
    .eq("id", id)
    .single();

  if (listing) {
    endsAt.setDate(endsAt.getDate() + (listing.duration_days || 7));
  }

  const { data, error } = await supabase
    .from("listings")
    .update({
      status: "active",
      starts_at: new Date().toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as Listing;
}

/**
 * Cancel listing
 */
export async function cancelListing(id: string): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Delete draft listing
 */
export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("status", "draft"); // Only drafts can be deleted

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<ListingCategory[]> {
  const { data, error } = await supabase
    .from("listing_categories")
    .select("*")
    .order("sort_order");

  if (error) {
    throw new Error(error.message);
  }

  return data as unknown as ListingCategory[];
}

/**
 * Add to watchlist
 */
export async function addToWatchlist(listingId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Must be logged in");
  }

  const { error } = await supabase
    .from("watchlist")
    .insert({
      user_id: user.user.id,
      listing_id: listingId,
    });

  if (error && error.code !== "23505") { // Ignore duplicate
    throw new Error(error.message);
  }
}

/**
 * Remove from watchlist
 */
export async function removeFromWatchlist(listingId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error("Must be logged in");
  }

  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", user.user.id)
    .eq("listing_id", listingId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Check if listing is watched
 */
export async function isWatched(listingId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return false;

  const { data } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", user.user.id)
    .eq("listing_id", listingId)
    .single();

  return !!data;
}

/**
 * Get user's watchlist
 */
export async function getWatchlist(): Promise<Listing[]> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return [];

  const { data, error } = await supabase
    .from("watchlist")
    .select(`
      listing:listings(
        *,
        category:listing_categories(*),
        seller:seller_profiles!seller_id(*)
      )
    `)
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((w) => w.listing) as unknown as Listing[];
}

