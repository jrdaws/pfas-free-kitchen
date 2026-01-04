"use client";

import { useSubscriptionContext } from "@/lib/billing/subscription-context";
import { getPlanById } from "@/lib/billing/plans";

export function UsageStats() {
  const { subscription, usage, loading } = useSubscriptionContext();

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Usage</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-2 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const plan = subscription ? getPlanById(subscription.planId) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Usage This Period</h3>
        {plan && (
          <span className="text-xs text-muted-foreground">
            {plan.name} Plan
          </span>
        )}
      </div>

      <div className="space-y-4">
        {usage.map((item) => {
          const percentage = item.limit === -1 
            ? 0 
            : Math.min(100, (item.used / item.limit) * 100);
          const isNearLimit = percentage > 80;
          const isUnlimited = item.limit === -1;

          return (
            <div key={item.feature}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground capitalize">
                  {item.feature.replace("_", " ")}
                </span>
                <span className={isNearLimit && !isUnlimited ? "text-amber-600" : "text-muted-foreground"}>
                  {item.used.toLocaleString()} / {isUnlimited ? "∞" : item.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isUnlimited
                      ? "bg-primary/30"
                      : isNearLimit
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: isUnlimited ? "10%" : `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}

        {usage.length === 0 && (
          <p className="text-sm text-muted-foreground">No usage data available.</p>
        )}
      </div>

      {usage.some((u) => u.limit !== -1 && (u.used / u.limit) > 0.8) && (
        <div className="mt-4 p-3 bg-amber-500/10 text-amber-600 rounded-lg text-sm">
          You&apos;re approaching your plan limits.{" "}
          <a href="/billing" className="text-primary hover:underline">
            Upgrade for more
          </a>
        </div>
      )}
    </div>
  );
}

