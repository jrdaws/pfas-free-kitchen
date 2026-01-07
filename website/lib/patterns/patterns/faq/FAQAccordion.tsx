"use client";

import React, { useState } from "react";
import { BasePatternProps } from "../../types";

interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps extends BasePatternProps {
  headline?: string;
  subheadline?: string;
  items?: FAQItem[];
  variant?: "single-column" | "two-column";
}

const defaultItems: FAQItem[] = [
  {
    question: "How do I get started?",
    answer:
      "Getting started is easy! Simply sign up for a free account and you'll have access to all our core features. Our onboarding wizard will guide you through the setup process.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, MasterCard, American Express) as well as PayPal and bank transfers for annual plans.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access until the end of your current billing period.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! All new users get a 14-day free trial of our Pro plan. No credit card required to start your trial.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use industry-standard encryption and security practices to protect your data. We're SOC 2 Type II certified and GDPR compliant.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team via email at support@example.com, through the in-app chat, or by submitting a ticket in your dashboard. We typically respond within 24 hours.",
  },
];

/**
 * FAQAccordion
 * Frequently asked questions with expandable answers
 * Inspired by: stripe.com, notion.so
 */
export function FAQAccordion({
  headline = "Frequently Asked Questions",
  subheadline,
  items = defaultItems,
  variant = "single-column",
  className = "",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FAQItemComponent = ({ item, index }: { item: FAQItem; index: number }) => {
    const isOpen = openIndex === index;

    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "var(--preview-card, #18181B)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={() => toggleItem(index)}
          className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-white/5"
        >
          <span
            className="font-medium pr-4"
            style={{ color: "var(--preview-foreground, #FFFFFF)" }}
          >
            {item.question}
          </span>
          <svg
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: "var(--preview-muted, #78716C)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div
            className="px-6 pb-5"
            style={{ color: "var(--preview-muted, #9CA3AF)" }}
          >
            {item.answer}
          </div>
        </div>
      </div>
    );
  };

  // Split items into two columns if variant is two-column
  const leftItems = variant === "two-column" ? items.filter((_, i) => i % 2 === 0) : items;
  const rightItems = variant === "two-column" ? items.filter((_, i) => i % 2 === 1) : [];

  return (
    <section
      className={`py-24 px-6 ${className}`}
      style={{ backgroundColor: "var(--preview-background, #0A0A0A)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {headline && (
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{
                color: "var(--preview-foreground, #FFFFFF)",
                fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
              }}
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              className="text-lg"
              style={{ color: "var(--preview-muted, #78716C)" }}
            >
              {subheadline}
            </p>
          )}
        </div>

        {/* FAQ Items */}
        {variant === "single-column" ? (
          <div className="space-y-3">
            {items.map((item, i) => (
              <FAQItemComponent key={i} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {leftItems.map((item, i) => (
                <FAQItemComponent key={i * 2} item={item} index={i * 2} />
              ))}
            </div>
            <div className="space-y-3">
              {rightItems.map((item, i) => (
                <FAQItemComponent key={i * 2 + 1} item={item} index={i * 2 + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div
          className="text-center mt-12"
          style={{ color: "var(--preview-muted, #78716C)" }}
        >
          <p>
            Still have questions?{" "}
            <a
              href="/contact"
              className="underline hover:no-underline"
              style={{ color: "var(--preview-primary, #F97316)" }}
            >
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

FAQAccordion.patternId = "faq-accordion";
FAQAccordion.patternName = "FAQ Accordion";
FAQAccordion.patternCategory = "faq";

