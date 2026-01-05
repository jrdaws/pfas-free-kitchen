/**
 * Hero With Form Section
 * 
 * Includes signup form inline for lead generation.
 */

"use client";

import { useState } from "react";

interface FormField {
  name: string;
  type: "text" | "email" | "tel";
  placeholder: string;
  required?: boolean;
}

export interface HeroWithFormProps {
  headline: string;
  subtext: string;
  formFields: FormField[];
  submitText?: string;
  successMessage?: string;
  features?: string[];
  variant?: "light" | "dark";
}

export function HeroWithForm({
  headline,
  subtext,
  formFields,
  submitText = "Get Started",
  successMessage = "Thanks! We'll be in touch soon.",
  features,
  variant = "light",
}: HeroWithFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-gray-50 dark:bg-gray-900";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-300" : "text-gray-600 dark:text-gray-300";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight ${textClass}`}>
              {headline}
            </h1>
            
            <p className={`text-xl mb-8 ${subtextClass}`}>
              {subtext}
            </p>

            {features && features.length > 0 && (
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className={`flex items-center gap-3 ${subtextClass}`}>
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {successMessage}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formFields.map((field) => (
                  <div key={field.name}>
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Submitting..." : submitText}
                </button>

                {status === "error" && (
                  <p className="text-red-500 text-sm text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroWithForm;

