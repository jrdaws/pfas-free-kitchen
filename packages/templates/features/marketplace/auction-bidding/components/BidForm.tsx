"use client";

import { useState } from "react";
import { Loader2, Gavel } from "lucide-react";
import { calculateMinBid, formatBidAmount } from "../lib/auction-types";
import { placeBid } from "../lib/auction-engine";

interface BidFormProps {
  listingId: string;
  currentPrice: number;
  onBidPlaced?: (newPrice: number) => void;
}

export function BidForm({ listingId, currentPrice, onBidPlaced }: BidFormProps) {
  const minBid = calculateMinBid(currentPrice);
  const [bidAmount, setBidAmount] = useState<number>(minBid);
  const [maxBid, setMaxBid] = useState<number | undefined>();
  const [showMaxBid, setShowMaxBid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bidAmount < minBid) {
      setError(`Minimum bid is ${formatBidAmount(minBid)}`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await placeBid({
        listingId,
        amount: bidAmount,
        maxBid: showMaxBid ? maxBid : undefined,
      });

      if (result.success) {
        setSuccess(result.message);
        onBidPlaced?.(result.newHighBid);
        
        // Update min bid for next bid
        const newMin = calculateMinBid(result.newHighBid);
        setBidAmount(newMin);
        setMaxBid(undefined);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bid Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Your Bid
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number(e.target.value))}
            min={minBid}
            step="0.01"
            className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-lg font-semibold focus:outline-none focus:border-orange-500"
            disabled={loading}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Minimum bid: {formatBidAmount(minBid)}
        </p>
      </div>

      {/* Max Bid Toggle */}
      <button
        type="button"
        onClick={() => setShowMaxBid(!showMaxBid)}
        className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
      >
        {showMaxBid ? "Hide max bid option" : "Set a max bid (auto-bid)"}
      </button>

      {/* Max Bid Input */}
      {showMaxBid && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Maximum Bid (Auto-bid)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              value={maxBid || ""}
              onChange={(e) => setMaxBid(e.target.value ? Number(e.target.value) : undefined)}
              min={bidAmount}
              step="0.01"
              placeholder="Enter max you're willing to pay"
              className="w-full pl-8 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
              disabled={loading}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            We&apos;ll bid incrementally on your behalf up to this amount
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || bidAmount < minBid}
        className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-colors"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Gavel className="w-5 h-5" />
            Place Bid
          </>
        )}
      </button>
    </form>
  );
}

export default BidForm;

