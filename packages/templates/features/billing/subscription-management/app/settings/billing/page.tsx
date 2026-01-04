"use client";

import { SubscriptionProvider } from "@/lib/billing/subscription-context";
import { SubscriptionCard } from "@/components/billing/SubscriptionCard";
import { UsageStats } from "@/components/billing/UsageStats";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { ArrowLeft, CreditCard, Shield } from "lucide-react";
import Link from "next/link";

export default function BillingSettingsPage() {
  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription, payment methods, and billing history
            </p>
          </div>

          <div className="space-y-6">
            {/* Current Plan */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
              <SubscriptionCard />
            </section>

            {/* Usage */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Usage</h2>
              <UsageStats />
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">
                    Update
                  </button>
                </div>
              </div>
            </section>

            {/* Billing History */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Billing History</h2>
              <BillingHistory />
            </section>

            {/* Security Note */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Payment Security</p>
                <p>
                  Your payment information is encrypted and securely processed. 
                  We never store your full card details on our servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionProvider>
  );
}

