/**
 * CTA Centered Section
 * 
 * Centered text with button.
 */

import Link from "next/link";

export interface CtaCenteredProps {
  headline: string;
  subtext?: string;
  cta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  variant?: "primary" | "dark" | "gradient";
}

export function CtaCentered({
  headline,
  subtext,
  cta,
  secondaryCta,
  variant = "primary",
}: CtaCenteredProps) {
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={cta.href}
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {cta.text}
            </Link>
            
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                {secondaryCta.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaCentered;

