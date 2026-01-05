"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Gavel, ShoppingCart } from "lucide-react";
import type { Listing } from "../lib/listing-types";

interface ListingCardProps {
  listing: Listing;
  onWatch?: (id: string) => void;
  isWatched?: boolean;
}

function formatTimeLeft(endsAt: string): string {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function ListingCard({ listing, onWatch, isWatched = false }: ListingCardProps) {
  const isAuction = listing.listingType === "auction" || listing.listingType === "both";
  const hasEnded = listing.status === "ended" || listing.status === "sold";
  const timeLeft = listing.endsAt ? formatTimeLeft(listing.endsAt) : null;
  const isUrgent = timeLeft && !hasEnded && !timeLeft.includes("d");

  return (
    <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-orange-500/30 transition-all">
      {/* Image */}
      <Link href={`/listings/${listing.id}`}>
        <div className="relative aspect-square bg-slate-900">
          {listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600">
              <ShoppingCart className="w-12 h-12" />
            </div>
          )}
          
          {/* Badge */}
          {isAuction && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              Auction
            </div>
          )}

          {/* Time Left */}
          {timeLeft && !hasEnded && (
            <div
              className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                isUrgent
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-900/80 text-white"
              }`}
            >
              <Clock className="w-3 h-3" />
              {timeLeft}
            </div>
          )}
        </div>
      </Link>

      {/* Watch Button */}
      {onWatch && (
        <button
          onClick={() => onWatch(listing.id)}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isWatched
              ? "bg-red-500 text-white"
              : "bg-slate-900/80 text-white hover:bg-red-500"
          }`}
          aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Heart className={`w-4 h-4 ${isWatched ? "fill-current" : ""}`} />
        </button>
      )}

      {/* Content */}
      <div className="p-4">
        <Link href={`/listings/${listing.id}`}>
          <h3 className="text-white font-medium line-clamp-2 hover:text-orange-400 transition-colors">
            {listing.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">
            {formatPrice(listing.currentPrice || listing.startingPrice)}
          </span>
          {isAuction && listing.bidCount > 0 && (
            <span className="text-sm text-slate-400">
              {listing.bidCount} bid{listing.bidCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Buy It Now Price */}
        {listing.buyItNowPrice && listing.listingType === "both" && (
          <div className="mt-1 text-sm text-emerald-400">
            Buy It Now: {formatPrice(listing.buyItNowPrice)}
          </div>
        )}

        {/* Shipping */}
        <div className="mt-2 text-xs text-slate-400">
          {listing.shippingCost === 0 ? (
            <span className="text-emerald-400">Free Shipping</span>
          ) : (
            <span>+{formatPrice(listing.shippingCost)} shipping</span>
          )}
        </div>

        {/* Seller */}
        {listing.seller && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <Link
              href={`/seller/${listing.seller.userId}`}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {listing.seller.displayName}
            </Link>
            {listing.seller.ratingCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-yellow-500">★</span>
                <span className="text-slate-400">
                  {listing.seller.ratingAvg.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingCard;

