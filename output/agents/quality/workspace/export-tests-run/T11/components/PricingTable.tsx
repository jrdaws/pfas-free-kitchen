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
  plans,
  showToggle = true,
  highlightPlan,
  title = "Simple, Transparent Pricing",
}: PricingTableProps) {
  return (
    <section id="pricing" className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">
          {title}
        </h2>
        
        {showToggle && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-[#111111] rounded-lg p-1">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-md">
                Monthly
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">
                Yearly <span className="text-emerald-400 text-xs">Save 20%</span>
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
                  "relative rounded-2xl p-6 transition-all",
                  isHighlighted
                    ? "bg-gradient-to-b from-indigo-500/20 to-violet-500/10 border-2 border-indigo-500"
                    : "bg-[#111111] border border-white/5"
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-400">/{plan.period || "month"}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300">
                      <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white"
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
