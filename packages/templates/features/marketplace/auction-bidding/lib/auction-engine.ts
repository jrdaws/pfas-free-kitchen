/**
 * Auction Engine
 * 
 * Core bidding logic with proxy bidding, auto-extend, and reserve prices.
 */

import { createClient } from "@/lib/supabase/client";
import type { Bid, PlaceBidInput, PlaceBidResult, AuctionState } from "./auction-types";
import { calculateMinBid, formatBidAmount } from "./auction-types";

const supabase = createClient();

/**
 * Place a bid on a listing
 */
export async function placeBid(input: PlaceBidInput): Promise<PlaceBidResult> {
  const { listingId, amount, maxBid } = input;

  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return {
      success: false,
      newHighBid: 0,
      message: "You must be logged in to bid",
      error: "UNAUTHORIZED",
    };
  }

  const bidderId = userData.user.id;

  // Get listing details
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return {
      success: false,
      newHighBid: 0,
      message: "Listing not found",
      error: "NOT_FOUND",
    };
  }

  // Validate auction is active
  if (listing.status !== "active") {
    return {
      success: false,
      newHighBid: listing.current_price || 0,
      message: "This auction is not active",
      error: "AUCTION_CLOSED",
    };
  }

  // Check auction hasn't ended
  const endsAt = new Date(listing.ends_at);
  if (endsAt < new Date()) {
    return {
      success: false,
      newHighBid: listing.current_price || 0,
      message: "This auction has ended",
      error: "AUCTION_ENDED",
    };
  }

  // Can't bid on own listing
  if (listing.seller_id === bidderId) {
    return {
      success: false,
      newHighBid: listing.current_price || 0,
      message: "You cannot bid on your own listing",
      error: "SELF_BID",
    };
  }

  // Calculate minimum bid
  const currentPrice = listing.current_price || listing.starting_price;
  const minBid = listing.bid_count === 0 ? listing.starting_price : calculateMinBid(currentPrice);

  // Validate bid amount
  if (amount < minBid) {
    return {
      success: false,
      newHighBid: currentPrice,
      message: `Minimum bid is ${formatBidAmount(minBid)}`,
      error: "BID_TOO_LOW",
    };
  }

  // Check for existing max bid (proxy bidding)
  const { data: existingBids } = await supabase
    .from("bids")
    .select("*")
    .eq("listing_id", listingId)
    .eq("is_winning", true)
    .single();

  let finalBidAmount = amount;
  let outbidUserId: string | undefined;

  // Handle proxy bidding
  if (existingBids && existingBids.max_bid) {
    const existingMaxBid = existingBids.max_bid;
    
    if (maxBid && maxBid > existingMaxBid) {
      // New bidder's max is higher - they win at increment above old max
      finalBidAmount = calculateMinBid(existingMaxBid);
      outbidUserId = existingBids.bidder_id;
    } else if (amount <= existingMaxBid) {
      // Existing max bid wins - auto-increment to beat new bid
      const autoBidAmount = calculateMinBid(amount);
      
      if (autoBidAmount <= existingMaxBid) {
        // Insert the new bid (losing)
        await supabase.from("bids").insert({
          listing_id: listingId,
          bidder_id: bidderId,
          amount,
          max_bid: maxBid,
          is_winning: false,
          is_auto_bid: false,
        });

        // Insert auto-bid from existing bidder
        await supabase.from("bids").insert({
          listing_id: listingId,
          bidder_id: existingBids.bidder_id,
          amount: autoBidAmount,
          max_bid: existingMaxBid,
          is_winning: true,
          is_auto_bid: true,
        });

        // Update listing price
        await supabase
          .from("listings")
          .update({ current_price: autoBidAmount, bid_count: listing.bid_count + 2 })
          .eq("id", listingId);

        return {
          success: true,
          newHighBid: autoBidAmount,
          message: `You've been outbid. Current high bid is ${formatBidAmount(autoBidAmount)}`,
        };
      }
    }
  }

  // Insert the winning bid
  const { data: newBid, error: bidError } = await supabase
    .from("bids")
    .insert({
      listing_id: listingId,
      bidder_id: bidderId,
      amount: finalBidAmount,
      max_bid: maxBid,
      is_winning: true,
      is_auto_bid: false,
    })
    .select()
    .single();

  if (bidError) {
    return {
      success: false,
      newHighBid: currentPrice,
      message: "Failed to place bid. Please try again.",
      error: bidError.message,
    };
  }

  return {
    success: true,
    bid: newBid as unknown as Bid,
    newHighBid: finalBidAmount,
    outbidUserId,
    message: `Bid placed successfully! You are the high bidder at ${formatBidAmount(finalBidAmount)}`,
  };
}

/**
 * Get bid history for a listing
 */
export async function getBidHistory(
  listingId: string,
  limit = 50
): Promise<Bid[]> {
  const { data, error } = await supabase
    .from("bids")
    .select(`
      *,
      bidder:seller_profiles!bidder_id(
        user_id,
        display_name,
        avatar_url
      )
    `)
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch bid history:", error);
    return [];
  }

  return (data || []).map((bid) => ({
    ...bid,
    bidder: bid.bidder
      ? {
          id: bid.bidder.user_id,
          displayName: bid.bidder.display_name,
          avatarUrl: bid.bidder.avatar_url,
        }
      : undefined,
  })) as unknown as Bid[];
}

/**
 * Get current auction state
 */
export async function getAuctionState(listingId: string): Promise<AuctionState | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, current_price, starting_price, bid_count, winning_bidder_id, reserve_met, ends_at, status, extended_count")
    .eq("id", listingId)
    .single();

  if (error || !data) {
    return null;
  }

  const endsAt = new Date(data.ends_at);
  const isEnded = data.status !== "active" || endsAt < new Date();

  return {
    listingId: data.id,
    currentPrice: data.current_price || data.starting_price,
    bidCount: data.bid_count,
    highBidderId: data.winning_bidder_id,
    reserveMet: data.reserve_met,
    endsAt: data.ends_at,
    isEnded,
    extended: data.extended_count > 0,
  };
}

/**
 * Subscribe to real-time bid updates
 */
export function subscribeToBids(
  listingId: string,
  onBid: (bid: Bid) => void
): () => void {
  const channel = supabase
    .channel(`bids:${listingId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bids",
        filter: `listing_id=eq.${listingId}`,
      },
      (payload) => {
        onBid(payload.new as unknown as Bid);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to auction state changes
 */
export function subscribeToAuction(
  listingId: string,
  onUpdate: (state: Partial<AuctionState>) => void
): () => void {
  const channel = supabase
    .channel(`listing:${listingId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "listings",
        filter: `id=eq.${listingId}`,
      },
      (payload) => {
        const data = payload.new;
        onUpdate({
          currentPrice: data.current_price,
          bidCount: data.bid_count,
          highBidderId: data.winning_bidder_id,
          reserveMet: data.reserve_met,
          endsAt: data.ends_at,
          extended: data.extended_count > 0,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Check if current user is the high bidder
 */
export async function isHighBidder(listingId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data } = await supabase
    .from("listings")
    .select("winning_bidder_id")
    .eq("id", listingId)
    .single();

  return data?.winning_bidder_id === userData.user.id;
}

/**
 * Get user's bids on a listing
 */
export async function getUserBidsOnListing(listingId: string): Promise<Bid[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("bids")
    .select("*")
    .eq("listing_id", listingId)
    .eq("bidder_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data as unknown as Bid[];
}

