"use client";

import { useSubscriptionContext } from "@/lib/billing/subscription-context";
import { getPlanById, formatPrice } from "@/lib/billing/plans";
import { CreditCard, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export function SubscriptionCard() {
  const { subscription, loading, error, cancel, resume } = useSubscriptionContext();

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-8 bg-muted rounded w-1/2 mb-4" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-lg p-6">
        <AlertCircle className="w-5 h-5 mb-2" />
        <p>Failed to load subscription details</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-2">No Active Subscription</h3>
        <p className="text-muted-foreground text-sm mb-4">
          You&apos;re currently on the free plan.
        </p>
        <a
          href="/billing"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          View Plans
        </a>
      </div>
    );
  }

  const plan = getPlanById(subscription.planId);
  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-600",
    trialing: "bg-blue-500/10 text-blue-600",
    past_due: "bg-red-500/10 text-red-600",
    canceled: "bg-gray-500/10 text-gray-600",
    paused: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{subscription.planName}</h3>
          <p className="text-muted-foreground text-sm">{plan?.description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[subscription.status]}`}>
          {subscription.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span>{formatPrice(plan?.monthlyPrice || 0)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            Renews {subscription.currentPeriodEnd.toLocaleDateString()}
          </span>
        </div>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="bg-amber-500/10 text-amber-600 rounded-lg p-3 mb-4 text-sm">
          <p>Your subscription will be cancelled at the end of the billing period.</p>
          <button
            onClick={resume}
            className="text-primary hover:underline mt-1"
          >
            Resume subscription
          </button>
        </div>
      )}

      {subscription.trialEnd && new Date() < subscription.trialEnd && (
        <div className="bg-blue-500/10 text-blue-600 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            Trial ends {subscription.trialEnd.toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href="/billing"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Change Plan
        </a>
        {!subscription.cancelAtPeriodEnd && (
          <button
            onClick={cancel}
            className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

