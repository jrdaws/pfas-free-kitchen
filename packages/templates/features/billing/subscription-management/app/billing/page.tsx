"use client";

import { SubscriptionProvider } from "@/lib/billing/subscription-context";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { SubscriptionCard } from "@/components/billing/SubscriptionCard";
import { UsageStats } from "@/components/billing/UsageStats";
import { BillingHistory } from "@/components/billing/BillingHistory";

export default function BillingPage() {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing details
            </p>
          </div>

          {/* Current Subscription */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            <SubscriptionCard />
            <UsageStats />
          </div>

          {/* Plan Selector */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Choose Your Plan</h2>
            <PlanSelector />
          </section>

          {/* Billing History */}
          <section>
            <BillingHistory />
          </section>
        </div>
      </div>
    </SubscriptionProvider>
  );
}

