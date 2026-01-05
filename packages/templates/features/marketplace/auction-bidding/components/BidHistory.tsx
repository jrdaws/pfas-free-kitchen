"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { getBidHistory, subscribeToBids } from "../lib/auction-engine";
import { formatBidAmount } from "../lib/auction-types";
import type { Bid } from "../lib/auction-types";

interface BidHistoryProps {
  listingId: string;
  maxDisplay?: number;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function maskBidderName(name: string): string {
  if (name.length <= 3) return name + "***";
  return name.slice(0, 3) + "***";
}

export function BidHistory({ listingId, maxDisplay = 10 }: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBidHistory(listingId);
        setBids(data);
      } catch (error) {
        console.error("Failed to load bid history:", error);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToBids(listingId, (newBid) => {
      setBids((prev) => [newBid, ...prev]);
    });

    return unsubscribe;
  }, [listingId]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getBidHistory(listingId);
      setBids(data);
    } finally {
      setLoading(false);
    }
  };

  const displayBids = showAll ? bids : bids.slice(0, maxDisplay);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">
          Bid History ({bids.length})
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
          aria-label="Refresh bid history"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Content */}
      {loading && bids.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : bids.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          No bids yet. Be the first to bid!
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-700/50">
            {displayBids.map((bid, index) => (
              <div
                key={bid.id}
                className={`px-4 py-3 flex items-center justify-between ${
                  index === 0 ? "bg-orange-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {bid.bidder?.displayName?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">
                        {bid.bidder ? maskBidderName(bid.bidder.displayName) : "Anonymous"}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                          Winning
                        </span>
                      )}
                      {bid.isAutoBid && (
                        <span className="text-xs text-slate-400">(auto)</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatRelativeTime(bid.createdAt)}
                    </span>
                  </div>
                </div>

                <span className={`font-semibold ${index === 0 ? "text-orange-400" : "text-white"}`}>
                  {formatBidAmount(bid.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Show More */}
          {bids.length > maxDisplay && (
            <div className="px-4 py-3 border-t border-slate-700">
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                {showAll ? "Show less" : `Show all ${bids.length} bids`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BidHistory;

