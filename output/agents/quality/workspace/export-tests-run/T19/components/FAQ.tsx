"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items?: FAQItem[];
}

const DEFAULT_FAQ: FAQItem[] = [
  { question: "How do I get started?", answer: "Simply sign up for a free account, choose a template, and start building. Our intuitive interface guides you through every step." },
  { question: "Can I cancel my subscription anytime?", answer: "Yes, you can cancel your subscription at any time. There are no long-term commitments or cancellation fees." },
  { question: "Do you offer a free trial?", answer: "Yes! All paid plans come with a 14-day free trial. No credit card required." },
  { question: "What kind of support do you offer?", answer: "We offer email support for all plans, priority support for Pro users, and dedicated account managers for Enterprise." },
];

export function FAQ({ title = "Frequently Asked Questions", subtitle = "Everything you need to know", items = DEFAULT_FAQ }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-slate-400">{subtitle}</p>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left" aria-expanded={openIndex === index}>
                <span className="text-white font-medium pr-4">{item.question}</span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === index ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && <div className="px-6 pb-6"><p className="text-slate-400 leading-relaxed">{item.answer}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
