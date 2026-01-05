"use client";

import { useState, useEffect, useCallback } from "react";
import { formatTimeRemaining } from "../lib/auction-types";

interface UseAuctionTimerOptions {
  endsAt: string;
  onEnd?: () => void;
}

interface UseAuctionTimerReturn {
  timeLeft: string;
  isUrgent: boolean;
  isEnded: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function useAuctionTimer({
  endsAt,
  onEnd,
}: UseAuctionTimerOptions): UseAuctionTimerReturn {
  const [timeState, setTimeState] = useState(() => {
    const formatted = formatTimeRemaining(endsAt);
    return {
      ...formatted,
      ...calculateParts(endsAt),
    };
  });

  const updateTime = useCallback(() => {
    const formatted = formatTimeRemaining(endsAt);
    const parts = calculateParts(endsAt);
    
    setTimeState((prev) => {
      // Trigger onEnd callback when auction ends
      if (formatted.isEnded && !prev.isEnded) {
        onEnd?.();
      }
      
      return {
        ...formatted,
        ...parts,
      };
    });
  }, [endsAt, onEnd]);

  useEffect(() => {
    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [updateTime]);

  return {
    timeLeft: timeState.text,
    isUrgent: timeState.isUrgent,
    isEnded: timeState.isEnded,
    days: timeState.days,
    hours: timeState.hours,
    minutes: timeState.minutes,
    seconds: timeState.seconds,
  };
}

function calculateParts(endsAt: string) {
  const end = new Date(endsAt);
  const now = new Date();
  const diff = Math.max(0, end.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default useAuctionTimer;

