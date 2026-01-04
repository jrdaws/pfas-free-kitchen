"use client";

import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionStatusProps {
  className?: string;
}

export function SubscriptionStatus({ className = "" }: SubscriptionStatusProps) {
  const { subscription, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-2" />
        <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-destructive/10 text-destructive rounded-lg p-4 ${className}`}>
        Failed to load subscription status
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={`bg-muted rounded-lg p-4 ${className}`}>
        <p className="font-medium">Free Plan</p>
        <p className="text-sm text-muted-foreground">
          Upgrade to unlock premium features
        </p>
      </div>
    );
  }

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-600",
    canceled: "bg-amber-500/10 text-amber-600",
    past_due: "bg-red-500/10 text-red-600",
    paused: "bg-gray-500/10 text-gray-600",
  };

  const status = subscription.status as keyof typeof statusColors;

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{subscription.planName}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[status] || statusColors.active}`}>
          {subscription.status}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          <span className="text-2xl font-bold text-foreground">{subscription.price}</span>
          /{subscription.interval}
        </p>
        
        {subscription.nextBillingDate && (
          <p>
            Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
          </p>
        )}
        
        {subscription.cancelAtPeriodEnd && (
          <p className="text-amber-600">
            Cancels at end of billing period
          </p>
        )}
      </div>
    </div>
  );
}

