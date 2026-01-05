"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Flag, Loader2 } from "lucide-react";
import { ListingGallery } from "@/components/marketplace/ListingGallery";
import { BidForm } from "@/components/marketplace/BidForm";
import { BidHistory } from "@/components/marketplace/BidHistory";
import { AuctionTimer } from "@/components/marketplace/AuctionTimer";
import { CurrentBidDisplay } from "@/components/marketplace/CurrentBidDisplay";
import { BuyItNowButton } from "@/components/marketplace/BuyItNowButton";
import { SellerCard } from "@/components/marketplace/SellerCard";
import { getListing, isWatched, addToWatchlist, removeFromWatchlist } from "@/lib/marketplace/listings";
import type { Listing } from "@/lib/marketplace/listing-types";
import { CONDITION_LABELS } from "@/lib/marketplace/listing-types";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getListing(listingId);
        setListing(data);
        
        if (data) {
          const isWatchedResult = await isWatched(listingId);
          setWatched(isWatchedResult);
        }
      } catch (error) {
        console.error("Failed to load listing:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId]);

  const handleWatch = async () => {
    try {
      if (watched) {
        await removeFromWatchlist(listingId);
      } else {
        await addToWatchlist(listingId);
      }
      setWatched(!watched);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleBidPlaced = (newPrice: number) => {
    if (listing) {
      setListing({
        ...listing,
        currentPrice: newPrice,
        bidCount: listing.bidCount + 1,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">Listing Not Found</h1>
        <Link href="/listings" className="text-orange-500 hover:text-orange-400">
          ← Back to Listings
        </Link>
      </div>
    );
  }

  const isAuction = listing.listingType === "auction" || listing.listingType === "both";
  const hasEnded = listing.status === "ended" || listing.status === "sold";

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div>
            <ListingGallery images={listing.images} title={listing.title} />
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            {/* Title & Actions */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleWatch}
                    className={`p-2 rounded-lg transition-colors ${
                      watched
                        ? "bg-red-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                    aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    <Heart className={`w-5 h-5 ${watched ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                    aria-label="Share listing"
                  >
                    {copied ? "✓" : <Share2 className="w-5 h-5" />}
                  </button>
                  <button
                    className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                    aria-label="Report listing"
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                <span>{CONDITION_LABELS[listing.condition]}</span>
                <span>•</span>
                <span>{listing.viewCount} views</span>
                <span>•</span>
                <span>{listing.watchCount} watching</span>
              </div>
            </div>

            {/* Auction Timer */}
            {isAuction && listing.endsAt && !hasEnded && (
              <AuctionTimer endsAt={listing.endsAt} />
            )}

            {/* Price Display */}
            <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <CurrentBidDisplay
                currentPrice={listing.currentPrice || listing.startingPrice}
                bidCount={listing.bidCount}
                reserveMet={listing.reserveMet}
                hasReserve={!!listing.reservePrice}
                isAuction={isAuction}
              />

              {/* Bid Form or Buy It Now */}
              {!hasEnded && (
                <div className="mt-4 space-y-4">
                  {isAuction && (
                    <BidForm
                      listingId={listing.id}
                      currentPrice={listing.currentPrice || listing.startingPrice}
                      onBidPlaced={handleBidPlaced}
                    />
                  )}

                  {listing.buyItNowPrice && (
                    <BuyItNowButton
                      listingId={listing.id}
                      price={listing.buyItNowPrice}
                    />
                  )}
                </div>
              )}

              {hasEnded && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg text-center">
                  <p className="text-slate-400">
                    {listing.status === "sold" ? "This item has been sold" : "This auction has ended"}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <h3 className="text-sm font-medium text-white mb-2">Shipping</h3>
              <div className="text-sm text-slate-400">
                {listing.shippingCost === 0 ? (
                  <span className="text-emerald-400">✓ Free Shipping</span>
                ) : (
                  <span>${listing.shippingCost.toFixed(2)} shipping</span>
                )}
                {listing.shipsFrom && (
                  <span className="block mt-1">Ships from {listing.shipsFrom}</span>
                )}
                <span className="block mt-1">
                  Ships to: {listing.shipsTo.join(", ")}
                </span>
              </div>
            </div>

            {/* Seller */}
            {listing.seller && (
              <SellerCard seller={listing.seller} />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
          <div className="text-slate-300 whitespace-pre-wrap">
            {listing.description || "No description provided."}
          </div>
        </div>

        {/* Bid History */}
        {isAuction && listing.bidCount > 0 && (
          <div className="mt-8">
            <BidHistory listingId={listing.id} />
          </div>
        )}
      </div>
    </div>
  );
}

