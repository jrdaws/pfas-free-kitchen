import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateMinBid } from "@/lib/marketplace/auction-types";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be logged in to bid" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { listingId, amount, maxBid } = body;

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: "Bad Request", message: "listingId and amount are required" },
        { status: 400 }
      );
    }

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Not Found", message: "Listing not found" },
        { status: 404 }
      );
    }

    // Validate auction is active
    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "Forbidden", message: "This auction is not active" },
        { status: 403 }
      );
    }

    // Check auction hasn't ended
    if (new Date(listing.ends_at) < new Date()) {
      return NextResponse.json(
        { error: "Forbidden", message: "This auction has ended" },
        { status: 403 }
      );
    }

    // Can't bid on own listing
    if (listing.seller_id === user.id) {
      return NextResponse.json(
        { error: "Forbidden", message: "You cannot bid on your own listing" },
        { status: 403 }
      );
    }

    // Calculate minimum bid
    const currentPrice = listing.current_price || listing.starting_price;
    const minBid = listing.bid_count === 0 ? listing.starting_price : calculateMinBid(currentPrice);

    if (amount < minBid) {
      return NextResponse.json(
        { 
          error: "Bad Request", 
          message: `Minimum bid is $${minBid.toFixed(2)}`,
          minBid 
        },
        { status: 400 }
      );
    }

    // Insert the bid (trigger handles the rest)
    const { data: newBid, error: bidError } = await supabase
      .from("bids")
      .insert({
        listing_id: listingId,
        bidder_id: user.id,
        amount,
        max_bid: maxBid,
      })
      .select()
      .single();

    if (bidError) {
      console.error("Bid error:", bidError);
      return NextResponse.json(
        { error: "Internal Error", message: "Failed to place bid" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bid: newBid,
      message: `Bid placed successfully at $${amount.toFixed(2)}`,
    });
  } catch (error) {
    console.error("Bid API error:", error);
    return NextResponse.json(
      { error: "Internal Error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

