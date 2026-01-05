"use client";

import { formatBidAmount } from "../lib/auction-types";
import { Gavel, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react";

interface CurrentBidDisplayProps {
  currentPrice: number;
  bidCount: number;
  reserveMet: boolean;
  hasReserve: boolean;
  isAuction: boolean;
}

export function CurrentBidDisplay({
  currentPrice,
  bidCount,
  reserveMet,
  hasReserve,
  isAuction,
}: CurrentBidDisplayProps) {
  return (
    <div className="space-y-3">
      {/* Price Label */}
      <div className="flex items-center gap-2 text-slate-400">
        {isAuction ? (
          <>
            <Gavel className="w-4 h-4" />
            <span className="text-sm font-medium">
              {bidCount > 0 ? "Current Bid" : "Starting Bid"}
            </span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">Price</span>
          </>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold text-white">
          {formatBidAmount(currentPrice)}
        </span>
        {isAuction && bidCount > 0 && (
          <span className="text-slate-400">
            {bidCount} bid{bidCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Reserve Status */}
      {isAuction && hasReserve && (
        <div
          className={`flex items-center gap-2 text-sm ${
            reserveMet ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          {reserveMet ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Reserve price met
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              Reserve not yet met
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CurrentBidDisplay;

