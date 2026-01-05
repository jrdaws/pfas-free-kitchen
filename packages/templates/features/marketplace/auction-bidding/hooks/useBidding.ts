"use client";

import { useState, useEffect, useCallback } from "react";
import type { Bid, AuctionState, PlaceBidResult } from "../lib/auction-types";
import {
  placeBid as placeBidApi,
  getBidHistory,
  getAuctionState,
  subscribeToBids,
  subscribeToAuction,
  isHighBidder,
} from "../lib/auction-engine";

interface UseBiddingOptions {
  listingId: string;
  onOutbid?: () => void;
  onBidPlaced?: (result: PlaceBidResult) => void;
}

interface UseBiddingReturn {
  // State
  auctionState: AuctionState | null;
  bidHistory: Bid[];
  isHighBidder: boolean;
  isLoading: boolean;
  isPlacingBid: boolean;
  error: string | null;
  
  // Actions
  placeBid: (amount: number, maxBid?: number) => Promise<PlaceBidResult>;
  refreshBidHistory: () => Promise<void>;
}

export function useBidding({
  listingId,
  onOutbid,
  onBidPlaced,
}: UseBiddingOptions): UseBiddingReturn {
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [isHighBidderState, setIsHighBidder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [state, history, highBidder] = await Promise.all([
          getAuctionState(listingId),
          getBidHistory(listingId),
          isHighBidder(listingId),
        ]);

        setAuctionState(state);
        setBidHistory(history);
        setIsHighBidder(highBidder);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load auction data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [listingId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeBids = subscribeToBids(listingId, (newBid) => {
      // Add new bid to history
      setBidHistory((prev) => [newBid, ...prev]);
      
      // Check if user was outbid
      isHighBidder(listingId).then((isHigh) => {
        if (isHighBidderState && !isHigh) {
          setIsHighBidder(false);
          onOutbid?.();
        } else {
          setIsHighBidder(isHigh);
        }
      });
    });

    const unsubscribeAuction = subscribeToAuction(listingId, (updates) => {
      setAuctionState((prev) => (prev ? { ...prev, ...updates } : null));
    });

    return () => {
      unsubscribeBids();
      unsubscribeAuction();
    };
  }, [listingId, isHighBidderState, onOutbid]);

  // Place bid
  const placeBid = useCallback(
    async (amount: number, maxBid?: number): Promise<PlaceBidResult> => {
      setIsPlacingBid(true);
      setError(null);

      try {
        const result = await placeBidApi({
          listingId,
          amount,
          maxBid,
        });

        if (result.success) {
          // Update local state
          if (result.bid) {
            setBidHistory((prev) => [result.bid!, ...prev]);
          }
          setAuctionState((prev) =>
            prev ? { ...prev, currentPrice: result.newHighBid, bidCount: prev.bidCount + 1 } : null
          );
          setIsHighBidder(true);
        } else {
          setError(result.message);
        }

        onBidPlaced?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to place bid";
        setError(message);
        return {
          success: false,
          newHighBid: auctionState?.currentPrice || 0,
          message,
        };
      } finally {
        setIsPlacingBid(false);
      }
    },
    [listingId, auctionState, onBidPlaced]
  );

  // Refresh bid history
  const refreshBidHistory = useCallback(async () => {
    try {
      const history = await getBidHistory(listingId);
      setBidHistory(history);
    } catch (err) {
      console.error("Failed to refresh bid history:", err);
    }
  }, [listingId]);

  return {
    auctionState,
    bidHistory,
    isHighBidder: isHighBidderState,
    isLoading,
    isPlacingBid,
    error,
    placeBid,
    refreshBidHistory,
  };
}

export default useBidding;

