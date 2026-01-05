/**
 * CTA Split Section
 * 
 * Text left, image right.
 */

import Link from "next/link";
import Image from "next/image";

export interface CtaSplitProps {
  headline: string;
  subtext?: string;
  cta: {
    text: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
  };
  reversed?: boolean;
  variant?: "light" | "dark";
}

export function CtaSplit({
  headline,
  subtext,
  cta,
  image,
  reversed = false,
  variant = "light",
}: CtaSplitProps) {
  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-gray-50 dark:bg-gray-900";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-300" : "text-gray-600 dark:text-gray-300";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-20 ${reversed ? "lg:flex-row-reverse" : ""}`}>
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
              {headline}
            </h2>
            
            {subtext && (
              <p className={`text-xl mb-8 ${subtextClass}`}>
                {subtext}
              </p>
            )}

            <Link
              href={cta.href}
              className="inline-flex px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              {cta.text}
            </Link>
          </div>

          {/* Image */}
          <div className="flex-1 w-full">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSplit;

