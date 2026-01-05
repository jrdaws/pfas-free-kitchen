"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  layout?: "accordion" | "grid";
}

export function FAQ({
  items,
  title = "Frequently Asked Questions",
  layout = "accordion",
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          {title}
        </h2>

        {layout === "accordion" ? (
          <div className="space-y-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="bg-[#111111] rounded-xl border border-white/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-white font-medium">{item.question}</span>
                  <svg
                    className={cn(
                      "w-5 h-5 text-gray-400 transition-transform",
                      openIndex === i && "rotate-180"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400 text-sm">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, i) => (
              <div key={i} className="bg-[#111111] rounded-xl p-6 border border-white/5">
                <h3 className="text-white font-medium mb-3">{item.question}</h3>
                <p className="text-gray-400 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
