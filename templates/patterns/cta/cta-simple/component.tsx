/**
 * CTA Pattern - Simple
 * 
 * Headline with single button.
 * Best for: Conversion, focused action
 */

import Link from "next/link";

interface CtaSimpleProps {
  headline: string;
  subtext?: string;
  buttonText: string;
  buttonHref: string;
  variant?: "primary" | "dark" | "gradient";
}

export function CtaSimple({
  headline,
  subtext,
  buttonText,
  buttonHref,
  variant = "primary",
}: CtaSimpleProps) {
  const bgClasses = {
    primary: "bg-primary",
    dark: "bg-gray-900",
    gradient: "bg-gradient-to-r from-primary to-purple-600",
  };

  return (
    <section className={`py-20 ${bgClasses[variant]}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {headline}
          </h2>
          
          {subtext && (
            <p className="text-xl text-white/80 mb-8">
              {subtext}
            </p>
          )}

          <Link
            href={buttonHref}
            className="inline-flex px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CtaSimple;

