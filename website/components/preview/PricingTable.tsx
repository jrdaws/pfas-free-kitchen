"use client";

import { cn } from "@/lib/utils";

interface Plan {
  name: string;
  price: number;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

interface PricingTableProps {
  plans: Plan[];
  showToggle?: boolean;
  highlightPlan?: string;
  title?: string;
}

export function PricingTable({
  plans = [],
  showToggle = true,
  highlightPlan,
  title = "Simple, Transparent Pricing",
}: PricingTableProps) {
  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-6 py-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
          {title}
        </h2>
        
        {showToggle && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-card rounded-lg p-1 border border-border">
              <button className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md">
                Monthly
              </button>
              <button className="px-4 py-2 text-sm font-medium text-foreground-muted hover:text-foreground transition-colors">
                Yearly <span className="text-success text-xs">Save 20%</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const isHighlighted = plan.highlighted || plan.name.toLowerCase() === highlightPlan?.toLowerCase();
            
            return (
              <div
                key={i}
                className={cn(
                  "relative rounded-2xl p-6 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1",
                  isHighlighted
                    ? "bg-gradient-to-b from-primary/20 to-primary/5 border-2 border-primary"
                    : "bg-card border border-border"
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-foreground-muted">/{plan.period || "month"}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-foreground-secondary">
                      <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={cn(
                    "w-full py-3 rounded-xl font-medium transition-all",
                    isHighlighted
                      ? "bg-primary hover:bg-primary-hover text-primary-foreground"
                      : "bg-border hover:bg-border/80 text-foreground"
                  )}
                >
                  {plan.price === 0 ? "Get Started Free" : "Start Free Trial"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

