"use client";

import { useAuctionTimer } from "../hooks/useAuctionTimer";
import { Clock, AlertTriangle } from "lucide-react";

interface AuctionTimerProps {
  endsAt: string;
  onEnd?: () => void;
  variant?: "default" | "compact" | "large";
}

export function AuctionTimer({
  endsAt,
  onEnd,
  variant = "default",
}: AuctionTimerProps) {
  const { timeLeft, isUrgent, isEnded, days, hours, minutes, seconds } =
    useAuctionTimer({ endsAt, onEnd });

  if (isEnded) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Clock className="w-4 h-4" />
        <span>Auction ended</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
          isUrgent
            ? "bg-red-500 text-white animate-pulse"
            : "bg-slate-800 text-white"
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        {timeLeft}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div
        className={`p-6 rounded-xl ${
          isUrgent ? "bg-red-500/10 border border-red-500/30" : "bg-slate-800/50 border border-slate-700/50"
        }`}
      >
        <div className="flex items-center gap-2 mb-4">
          {isUrgent ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Clock className="w-5 h-5 text-slate-400" />
          )}
          <span className={`text-sm font-medium ${isUrgent ? "text-red-400" : "text-slate-400"}`}>
            {isUrgent ? "Ending Soon!" : "Time Left"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <TimeUnit value={days} label="Days" isUrgent={isUrgent} />
          <TimeUnit value={hours} label="Hours" isUrgent={isUrgent} />
          <TimeUnit value={minutes} label="Mins" isUrgent={isUrgent} />
          <TimeUnit value={seconds} label="Secs" isUrgent={isUrgent} />
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl ${
        isUrgent ? "bg-red-500/10 border border-red-500/30" : "bg-slate-800/50 border border-slate-700/50"
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-5 h-5 text-red-400" />
      ) : (
        <Clock className="w-5 h-5 text-slate-400" />
      )}
      <div>
        <p className={`text-sm ${isUrgent ? "text-red-400" : "text-slate-400"}`}>
          {isUrgent ? "Ending Soon!" : "Time Left"}
        </p>
        <p className={`text-xl font-bold ${isUrgent ? "text-red-400" : "text-white"}`}>
          {timeLeft}
        </p>
      </div>
    </div>
  );
}

function TimeUnit({
  value,
  label,
  isUrgent,
}: {
  value: number;
  label: string;
  isUrgent: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-3xl font-bold tabular-nums ${
          isUrgent ? "text-red-400" : "text-white"
        }`}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-xs text-slate-400 uppercase">{label}</div>
    </div>
  );
}

export default AuctionTimer;

