/**
 * CTA Pattern - Newsletter
 * 
 * Email signup form.
 * Best for: Content, blog, updates
 */

"use client";

import { useState } from "react";

interface CtaNewsletterProps {
  headline: string;
  subtext?: string;
  buttonText?: string;
  placeholder?: string;
  successMessage?: string;
}

export function CtaNewsletter({
  headline,
  subtext,
  buttonText = "Subscribe",
  placeholder = "Enter your email",
  successMessage = "Thanks for subscribing!",
}: CtaNewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {headline}
          </h2>
          
          {subtext && (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {subtext}
            </p>
          )}

          {status === "success" ? (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-medium">
                {successMessage}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "..." : buttonText}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-4 text-red-600 dark:text-red-400 text-sm">
              Something went wrong. Please try again.
            </p>
          )}

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

export default CtaNewsletter;

