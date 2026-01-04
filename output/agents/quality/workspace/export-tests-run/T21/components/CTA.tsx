"use client";

import { cn } from "@/lib/utils";

interface CTAProps {
  title: string;
  subtitle?: string;
  buttonText: string;
  variant?: "gradient" | "solid" | "outlined";
}

export function CTA({
  title,
  subtitle,
  buttonText,
  variant = "gradient",
}: CTAProps) {
  return (
    <section
      className={cn(
        "w-full px-6 py-20",
        variant === "gradient" &&
          "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600",
        variant === "solid" && "bg-indigo-500",
        variant === "outlined" && "bg-[#0A0A0A]"
      )}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={cn(
            "text-3xl md:text-4xl font-bold mb-4",
            variant === "outlined" ? "text-white" : "text-white"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "text-lg mb-8 max-w-2xl mx-auto",
              variant === "outlined" ? "text-gray-400" : "text-white/80"
            )}
          >
            {subtitle}
          </p>
        )}
        <button
          className={cn(
            "px-8 py-4 rounded-xl font-semibold text-lg transition-all",
            variant === "gradient" &&
              "bg-white text-indigo-600 hover:bg-gray-100 shadow-lg",
            variant === "solid" &&
              "bg-white text-indigo-600 hover:bg-gray-100",
            variant === "outlined" &&
              "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600"
          )}
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}
