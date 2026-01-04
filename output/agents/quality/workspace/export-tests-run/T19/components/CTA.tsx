"use client";

import Link from "next/link";

interface CTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  variant?: "gradient" | "solid";
}

export function CTA({ title = "Ready to Get Started?", subtitle = "Join thousands of developers building amazing products", buttonText = "Start Building Free", buttonHref = "/signup", variant = "gradient" }: CTAProps) {
  return (
    <section className={`py-24 ${variant === "gradient" ? "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500" : "bg-orange-500"}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        <Link href={buttonHref} className="inline-block px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-lg font-semibold transition-all">
          {buttonText}
        </Link>
        <div className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Free forever plan
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            No credit card required
          </span>
        </div>
      </div>
    </section>
  );
}

export default CTA;
