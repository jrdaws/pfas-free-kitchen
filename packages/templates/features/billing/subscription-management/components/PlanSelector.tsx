"use client";

import { useState } from "react";
import { useSubscriptionContext } from "@/lib/billing/subscription-context";
import { PLANS, formatPrice, canUpgrade, canDowngrade } from "@/lib/billing/plans";
import { Check } from "lucide-react";

interface PlanSelectorProps {
  onSelect?: (planId: string) => void;
}

export function PlanSelector({ onSelect }: PlanSelectorProps) {
  const { subscription, upgrade, downgrade, loading } = useSubscriptionContext();
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [processing, setProcessing] = useState<string | null>(null);

  const currentTier = subscription?.tier || "free";

  const handlePlanSelect = async (planId: string, tier: string) => {
    if (processing) return;
    
    setProcessing(planId);
    try {
      if (canUpgrade(currentTier, tier)) {
        await upgrade(planId);
      } else if (canDowngrade(currentTier, tier)) {
        await downgrade(planId);
      }
      onSelect?.(planId);
    } catch (error) {
      console.error("Failed to change plan:", error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={billingInterval === "monthly" ? "text-foreground" : "text-muted-foreground"}>
          Monthly
        </span>
        <button
          onClick={() => setBillingInterval(billingInterval === "monthly" ? "yearly" : "monthly")}
          className="relative w-14 h-7 bg-muted rounded-full transition-colors"
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-primary rounded-full transition-transform ${
              billingInterval === "yearly" ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        <span className={billingInterval === "yearly" ? "text-foreground" : "text-muted-foreground"}>
          Yearly
          <span className="text-xs text-emerald-500 ml-1">Save 20%</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = subscription?.planId === plan.id;
          const price = billingInterval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const canSelectUpgrade = canUpgrade(currentTier, plan.tier);
          const canSelectDowngrade = canDowngrade(currentTier, plan.tier);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 ${
                plan.highlighted
                  ? "bg-primary/5 border-2 border-primary"
                  : "bg-card border border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-muted-foreground">
                      /{billingInterval === "monthly" ? "mo" : "yr"}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan.id, plan.tier)}
                disabled={isCurrentPlan || processing === plan.id || loading}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCurrentPlan
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {processing === plan.id
                  ? "Processing..."
                  : isCurrentPlan
                  ? "Current Plan"
                  : canSelectUpgrade
                  ? "Upgrade"
                  : canSelectDowngrade
                  ? "Downgrade"
                  : "Select"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

