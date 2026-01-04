"use client";

import { useState } from "react";
import Link from "next/link";

interface Plan {
  name: string;
  price: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

interface PricingTableProps {
  title?: string;
  subtitle?: string;
  plans?: Plan[];
  showToggle?: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  { name: "Starter", price: 0, description: "Perfect for getting started", features: ["Up to 3 projects", "Basic analytics", "Community support"], ctaText: "Get Started Free", ctaHref: "/signup" },
  { name: "Pro", price: 29, yearlyPrice: 24, description: "For growing teams", features: ["Unlimited projects", "Advanced analytics", "Priority support", "Custom domains"], highlighted: true, ctaText: "Start Free Trial", ctaHref: "/signup?plan=pro" },
  { name: "Enterprise", price: 99, yearlyPrice: 79, description: "For large organizations", features: ["Everything in Pro", "SSO integration", "Dedicated support", "SLA guarantee"], ctaText: "Contact Sales", ctaHref: "/contact" },
];

export function PricingTable({ title = "Simple Pricing", subtitle = "Choose the plan that works for you", plans = DEFAULT_PLANS, showToggle = true }: PricingTableProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">{subtitle}</p>

          {showToggle && (
            <div className="inline-flex items-center gap-4 p-1.5 bg-slate-800 rounded-xl">
              <button onClick={() => setIsYearly(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!isYearly ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>Monthly</button>
              <button onClick={() => setIsYearly(true)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isYearly ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"}`}>Yearly <span className="ml-2 text-emerald-400 text-xs">Save 20%</span></button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative rounded-2xl p-8 transition-all ${plan.highlighted ? "bg-gradient-to-b from-orange-500/20 to-slate-900 border-2 border-orange-500 scale-105" : "bg-slate-800/50 border border-slate-700/50"}`}>
              {plan.highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2"><span className="px-4 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">Most Popular</span></div>}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">${isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price}</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.ctaHref || "/signup"} className={`block w-full py-3 rounded-xl text-center font-medium transition-colors ${plan.highlighted ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-slate-700 hover:bg-slate-600 text-white"}`}>{plan.ctaText || "Get Started"}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingTable;
