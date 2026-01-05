"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { formatBidAmount } from "../lib/auction-types";
import Link from "next/link";

interface OutbidAlertProps {
  listingId: string;
  listingTitle: string;
  newPrice: number;
  onDismiss?: () => void;
  autoHide?: boolean;
}

export function OutbidAlert({
  listingId,
  listingTitle,
  newPrice,
  onDismiss,
  autoHide = false,
}: OutbidAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onDismiss]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom-4 z-50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-amber-400 font-semibold text-sm mb-1">
            You&apos;ve been outbid!
          </p>
          <p className="text-white text-sm line-clamp-1 mb-2">
            {listingTitle}
          </p>
          <p className="text-slate-400 text-xs mb-3">
            Current high bid: {formatBidAmount(newPrice)}
          </p>
          <Link
            href={`/listings/${listingId}`}
            className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Bid Again
          </Link>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default OutbidAlert;

