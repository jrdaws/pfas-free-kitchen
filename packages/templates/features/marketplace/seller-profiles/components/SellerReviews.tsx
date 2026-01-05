"use client";

import { useState, useEffect } from "react";
import { Loader2, Star } from "lucide-react";
import { getSellerRatings, getRatingBreakdown } from "../lib/seller-ratings";
import type { SellerRating } from "../lib/seller-ratings";

interface SellerReviewsProps {
  sellerId: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SellerReviews({ sellerId }: SellerReviewsProps) {
  const [ratings, setRatings] = useState<SellerRating[]>([]);
  const [breakdown, setBreakdown] = useState<{
    average: number;
    total: number;
    breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
    aspects: { itemAsDescribed: number; communication: number; shippingSpeed: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ratingsData, breakdownData] = await Promise.all([
          getSellerRatings(sellerId),
          getRatingBreakdown(sellerId),
        ]);
        setRatings(ratingsData.ratings);
        setBreakdown(breakdownData);
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!breakdown || breakdown.total === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Rating Breakdown */}
        <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl font-bold text-white">
              {breakdown.average.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= breakdown.average
                        ? "fill-yellow-500 text-yellow-500"
                        : "fill-slate-600 text-slate-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-400">{breakdown.total} reviews</p>
            </div>
          </div>

          {/* Star bars */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown.breakdown[star as 1 | 2 | 3 | 4 | 5];
              const percent = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-slate-400">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aspects */}
        <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
          <h4 className="text-sm font-medium text-slate-300 mb-4">Detailed Ratings</h4>
          <div className="space-y-4">
            <AspectBar label="Item as Described" value={breakdown.aspects.itemAsDescribed} />
            <AspectBar label="Communication" value={breakdown.aspects.communication} />
            <AspectBar label="Shipping Speed" value={breakdown.aspects.shippingSpeed} />
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Reviews</h4>
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {rating.buyer?.displayName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {rating.buyer?.displayName || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rating.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "fill-slate-600 text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400">{formatDate(rating.createdAt)}</span>
            </div>

            {rating.review && (
              <p className="text-slate-300 text-sm mt-2">{rating.review}</p>
            )}

            {rating.listing && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                {rating.listing.images?.[0] && (
                  <img
                    src={rating.listing.images[0]}
                    alt=""
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <span className="text-xs text-slate-400 truncate">
                  {rating.listing.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AspectBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
        <span className="text-sm text-white font-medium w-8">{value.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default SellerReviews;

