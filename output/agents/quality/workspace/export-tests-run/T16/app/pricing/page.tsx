"use client";

import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const PROJECT_NAME = "SaaS App";

const PRICING_PLANS = [
  {
    name: "Starter",
    price: 0,
    description: "Perfect for trying out our platform",
    features: [
      "Up to 3 team members",
      "Basic analytics",
      "Community support",
      "1GB storage",
      "Basic integrations",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 29,
    description: "For growing teams and businesses",
    features: [
      "Unlimited team members",
      "Advanced analytics",
      "Priority email support",
      "100GB storage",
      "Custom integrations",
      "API access",
      "Advanced security",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For large organizations with custom needs",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SLA guarantee",
      "Unlimited storage",
      "On-premise deployment",
      "Custom contracts",
      "24/7 phone support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const FAQ_ITEMS = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "All paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Nav projectName={PROJECT_NAME} links={["Features", "Pricing", "About"]} />

      {/* Pricing Header */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500"
                  : "bg-[#111111] border border-white/10"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${plan.price}
                </span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-300">
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="bg-[#111111] rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of teams already using our platform.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      <Footer
        projectName={PROJECT_NAME}
        links={["Privacy", "Terms", "Contact"]}
        description="Building the future of SaaS, one feature at a time."
      />
    </div>
  );
}


