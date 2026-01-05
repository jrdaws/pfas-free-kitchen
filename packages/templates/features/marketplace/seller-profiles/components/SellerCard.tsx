"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, Calendar } from "lucide-react";
import type { SellerProfile } from "../lib/seller-ratings";

interface SellerCardProps {
  seller: SellerProfile;
  variant?: "compact" | "full";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function SellerCard({ seller, variant = "compact" }: SellerCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={`/seller/${seller.userId}`}
        className="flex items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-orange-500/30 transition-colors"
      >
        {/* Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex-shrink-0">
          {seller.avatarUrl ? (
            <Image
              src={seller.avatarUrl}
              alt={seller.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-white font-semibold">
              {seller.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium truncate">
              {seller.displayName}
            </span>
            {seller.verifiedSeller && (
              <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {seller.ratingCount > 0 ? (
              <>
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span>{seller.ratingAvg.toFixed(1)}</span>
                <span>({seller.ratingCount})</span>
              </>
            ) : (
              <span>New seller</span>
            )}
            <span>•</span>
            <span>{seller.totalSales} sales</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 flex-shrink-0">
          {seller.avatarUrl ? (
            <Image
              src={seller.avatarUrl}
              alt={seller.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-white font-bold text-2xl">
              {seller.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{seller.displayName}</h3>
            {seller.verifiedSeller && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          {seller.bio && (
            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{seller.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="text-white font-medium">
                {seller.ratingAvg.toFixed(1)}
              </span>
              <span className="text-slate-400">({seller.ratingCount} reviews)</span>
            </div>

            {/* Sales */}
            <div className="text-slate-400">
              <span className="text-white font-medium">{seller.totalSales}</span> sales
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-4 h-4" />
              Member since {formatDate(seller.memberSince)}
            </div>
          </div>
        </div>
      </div>

      <Link
        href={`/seller/${seller.userId}`}
        className="mt-4 block w-full py-2 text-center text-sm text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:border-orange-500 rounded-lg transition-colors"
      >
        View Seller Profile
      </Link>
    </div>
  );
}

export default SellerCard;

