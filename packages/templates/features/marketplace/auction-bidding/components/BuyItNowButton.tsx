"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { formatBidAmount } from "../lib/auction-types";

interface BuyItNowButtonProps {
  listingId: string;
  price: number;
  disabled?: boolean;
}

export function BuyItNowButton({
  listingId,
  price,
  disabled = false,
}: BuyItNowButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBuyNow = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      // In production, this would create a checkout session
      // For now, redirect to a checkout page
      router.push(`/checkout?listing=${listingId}&type=buy_now`);
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-sm text-emerald-400 mb-2">
            Confirm your purchase
          </p>
          <p className="text-white font-semibold">
            Total: {formatBidAmount(price)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBuyNow}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleBuyNow}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors"
    >
      <ShoppingCart className="w-5 h-5" />
      Buy It Now · {formatBidAmount(price)}
    </button>
  );
}

export default BuyItNowButton;

