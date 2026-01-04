"use client";

import { useState, useEffect } from "react";

interface Subscription {
  id: string;
  status: "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired";
  planName: string;
  price: string;
  interval: "month" | "year";
  renewsAt: string | null;
  endsAt: string | null;
  trialEndsAt: string | null;
  customerPortalUrl: string | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  cancel: () => Promise<void>;
  openPortal: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/user/subscription");
      if (!res.ok) {
        if (res.status === 404) {
          setSubscription(null);
          return;
        }
        throw new Error("Failed to fetch subscription");
      }
      
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const cancel = async () => {
    if (!subscription) return;
    
    const res = await fetch("/api/user/subscription/cancel", {
      method: "POST",
    });
    
    if (!res.ok) {
      throw new Error("Failed to cancel subscription");
    }
    
    await fetchSubscription();
  };

  const openPortal = () => {
    if (subscription?.customerPortalUrl) {
      window.open(subscription.customerPortalUrl, "_blank");
    }
  };

  return {
    subscription,
    loading,
    error,
    refresh: fetchSubscription,
    cancel,
    openPortal,
  };
}

