/**
 * FAQ Pattern - Accordion
 * 
 * Expandable FAQ list.
 * Best for: Support, questions, compact display
 */

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  headline?: string;
  subtext?: string;
  faqs: FAQ[];
  allowMultiple?: boolean;
}

export function FaqAccordion({
  headline = "Frequently Asked Questions",
  subtext,
  faqs,
  allowMultiple = false,
}: FaqAccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (index: number) => {
    if (allowMultiple) {
      setOpenIndices((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    } else {
      setOpenIndices((prev) =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {headline}
            </h2>
            {subtext && (
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {subtext}
              </p>
            )}
          </div>

          {/* FAQ items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndices.includes(index);
              
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqAccordion;

