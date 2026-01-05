import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { listingId: string } }
) {
  const supabase = createClient();
  const { listingId } = params;

  // Get query params
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");

  try {
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
      console.error("Failed to fetch bids:", error);
      return NextResponse.json(
        { error: "Internal Error", message: "Failed to fetch bid history" },
        { status: 500 }
      );
    }

    // Transform data
    const bids = (data || []).map((bid) => ({
      id: bid.id,
      listingId: bid.listing_id,
      bidderId: bid.bidder_id,
      amount: bid.amount,
      maxBid: bid.max_bid,
      isWinning: bid.is_winning,
      isAutoBid: bid.is_auto_bid,
      createdAt: bid.created_at,
      bidder: bid.bidder
        ? {
            id: bid.bidder.user_id,
            displayName: bid.bidder.display_name,
            avatarUrl: bid.bidder.avatar_url,
          }
        : null,
    }));

    return NextResponse.json({
      bids,
      total: bids.length,
    });
  } catch (error) {
    console.error("Bids API error:", error);
    return NextResponse.json(
      { error: "Internal Error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

