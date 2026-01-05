"use client";

import { Star } from "lucide-react";

interface SellerRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function SellerRating({
  rating,
  count = 0,
  size = "md",
  showCount = true,
}: SellerRatingProps) {
  const sizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const starSize = sizes[size];
  const textSize = textSizes[size];

  // Round to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;

  return (
    <div className="flex items-center gap-1.5">
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill =
            star <= roundedRating
              ? "fill-yellow-500 text-yellow-500"
              : star - 0.5 === roundedRating
              ? "fill-yellow-500/50 text-yellow-500"
              : "fill-slate-600 text-slate-600";

          return <Star key={star} className={`${starSize} ${fill}`} />;
        })}
      </div>

      {/* Rating Number */}
      <span className={`${textSize} font-medium text-white`}>
        {rating.toFixed(1)}
      </span>

      {/* Count */}
      {showCount && count > 0 && (
        <span className={`${textSize} text-slate-400`}>({count})</span>
      )}
    </div>
  );
}

export default SellerRating;

