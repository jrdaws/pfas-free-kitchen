"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  CreditCard,
  Zap,
  Check,
  ArrowUpRight,
  Download,
  TrendingUp,
  Clock,
  Package,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface UsageData {
  exports: { used: number; limit: number };
  projects: { used: number; limit: number };
  storage: { used: number; limit: number }; // in MB
  apiCalls: { used: number; limit: number };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

const PLANS = [
  {
    name: "Free",
    price: 0,
    features: [
      "5 projects",
      "10 exports/month",
      "Community support",
      "Basic templates",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: 19,
    features: [
      "Unlimited projects",
      "Unlimited exports",
      "Priority support",
      "All templates",
      "Custom branding",
      "Team collaboration",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 99,
    features: [
      "Everything in Pro",
      "SSO/SAML",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
    ],
  },
];

const MOCK_INVOICES: Invoice[] = [
  { id: "inv-001", date: "2026-01-01", amount: 0, status: "paid" },
  { id: "inv-002", date: "2025-12-01", amount: 0, status: "paid" },
  { id: "inv-003", date: "2025-11-01", amount: 0, status: "paid" },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [currentPlan] = useState("Free");
  
  const usage: UsageData = {
    exports: { used: 7, limit: 10 },
    projects: { used: 3, limit: 5 },
    storage: { used: 45, limit: 100 },
    apiCalls: { used: 234, limit: 1000 },
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view billing</h2>
          <p className="text-muted-foreground">Manage your subscription and usage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Usage</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription, view usage, and download invoices.
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{currentPlan} Plan</h2>
                  <Badge variant="secondary">Current</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === "Free" 
                    ? "Upgrade to unlock unlimited features" 
                    : "Your subscription renews on Jan 15, 2026"}
                </p>
              </div>
            </div>
            <Button className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4 text-muted-foreground" />
              Exports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.exports.used}/{usage.exports.limit}
            </div>
            <Progress 
              value={(usage.exports.used / usage.exports.limit) * 100} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {usage.exports.limit - usage.exports.used} remaining this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.projects.used}/{usage.projects.limit}
            </div>
            <Progress 
              value={(usage.projects.used / usage.projects.limit) * 100} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {usage.projects.limit - usage.projects.used} slots available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.apiCalls.used.toLocaleString()}
            </div>
            <Progress 
              value={(usage.apiCalls.used / usage.apiCalls.limit) * 100} 
              className="mt-2 h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              of {usage.apiCalls.limit.toLocaleString()} monthly limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Billing Cycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <Progress value={60} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Until next reset
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card 
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.current && (
                    <Badge variant="secondary">Current</Badge>
                  )}
                  {plan.highlighted && !plan.current && (
                    <Badge>Popular</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full mt-6" 
                  variant={plan.current ? "outline" : plan.highlighted ? "default" : "outline"}
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            Download past invoices and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {MOCK_INVOICES.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No invoices yet.
            </p>
          ) : (
            <div className="space-y-3">
              {MOCK_INVOICES.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {formatDate(invoice.date)}
                    </div>
                    <Badge 
                      variant={invoice.status === "paid" ? "secondary" : "destructive"}
                      className="capitalize"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      ${invoice.amount.toFixed(2)}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

