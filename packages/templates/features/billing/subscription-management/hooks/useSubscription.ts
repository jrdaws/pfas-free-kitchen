"use client";

import { useSubscriptionContext } from "@/lib/billing/subscription-context";
import { getPlanById, PLANS, canUpgrade, canDowngrade } from "@/lib/billing/plans";

export function useSubscription() {
  const context = useSubscriptionContext();
  
  const currentPlan = context.subscription 
    ? getPlanById(context.subscription.planId) 
    : PLANS[0]; // Free plan default

  const availablePlans = PLANS.map((plan) => ({
    ...plan,
    isCurrentPlan: context.subscription?.planId === plan.id,
    canUpgradeTo: canUpgrade(currentPlan?.tier || "free", plan.tier),
    canDowngradeTo: canDowngrade(currentPlan?.tier || "free", plan.tier),
  }));

  const isTrialing = context.subscription?.status === "trialing";
  const isCanceled = context.subscription?.cancelAtPeriodEnd === true;
  const isPastDue = context.subscription?.status === "past_due";
  const isActive = context.subscription?.status === "active";

  const daysUntilRenewal = context.subscription
    ? Math.ceil(
        (context.subscription.currentPeriodEnd.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const daysUntilTrialEnd = context.subscription?.trialEnd
    ? Math.ceil(
        (context.subscription.trialEnd.getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return {
    ...context,
    currentPlan,
    availablePlans,
    isTrialing,
    isCanceled,
    isPastDue,
    isActive,
    daysUntilRenewal,
    daysUntilTrialEnd,
  };
}

