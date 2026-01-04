"use client";

import { PaddleCheckout } from "./PaddleCheckout";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  price: string;
  interval: "month" | "year";
  features: string[];
  highlighted?: boolean;
}

interface PricingTableProps {
  plans: PricingPlan[];
  email?: string;
  className?: string;
}

const defaultPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals",
    priceId: "pri_xxx", // Replace with your Paddle price ID
    price: "$9",
    interval: "month",
    features: [
      "Up to 1,000 users",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best for growing teams",
    priceId: "pri_xxx", // Replace with your Paddle price ID
    price: "$29",
    interval: "month",
    features: [
      "Up to 10,000 users",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    priceId: "pri_xxx", // Replace with your Paddle price ID
    price: "$99",
    interval: "month",
    features: [
      "Unlimited users",
      "Custom analytics",
      "24/7 support",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];

export function PricingTable({ plans = defaultPlans, email, className = "" }: PricingTableProps) {
  return (
    <div className={`grid md:grid-cols-3 gap-6 ${className}`}>
      {plans.map((plan) => (
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
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">/{plan.interval}</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          
          <PaddleCheckout
            priceId={plan.priceId}
            email={email}
            buttonText={`Get ${plan.name}`}
            variant={plan.highlighted ? "primary" : "secondary"}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}

