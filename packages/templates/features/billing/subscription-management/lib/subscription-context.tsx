"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type PlanTier = "free" | "starter" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "paused";

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface Usage {
  used: number;
  limit: number;
  feature: string;
}

interface SubscriptionContextValue {
  subscription: Subscription | null;
  usage: Usage[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  upgrade: (planId: string) => Promise<void>;
  downgrade: (planId: string) => Promise<void>;
  cancel: () => Promise<void>;
  resume: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [subRes, usageRes] = await Promise.all([
        fetch("/api/subscription"),
        fetch("/api/subscription/usage"),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription({
          ...subData,
          currentPeriodStart: new Date(subData.currentPeriodStart),
          currentPeriodEnd: new Date(subData.currentPeriodEnd),
          trialEnd: subData.trialEnd ? new Date(subData.trialEnd) : undefined,
        });
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load subscription"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgrade = async (planId: string) => {
    const res = await fetch("/api/subscription/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (!res.ok) throw new Error("Failed to upgrade");
    await fetchSubscription();
  };

  const downgrade = async (planId: string) => {
    const res = await fetch("/api/subscription/downgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (!res.ok) throw new Error("Failed to downgrade");
    await fetchSubscription();
  };

  const cancel = async () => {
    const res = await fetch("/api/subscription/cancel", { method: "POST" });
    if (!res.ok) throw new Error("Failed to cancel");
    await fetchSubscription();
  };

  const resume = async () => {
    const res = await fetch("/api/subscription/resume", { method: "POST" });
    if (!res.ok) throw new Error("Failed to resume");
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        loading,
        error,
        refresh: fetchSubscription,
        upgrade,
        downgrade,
        cancel,
        resume,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  }
  return context;
}

