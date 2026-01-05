/**
 * Testimonials Pattern - Logo Wall
 * 
 * Customer logo showcase.
 * Best for: B2B, enterprise, trust building
 */

import Image from "next/image";

interface Logo {
  name: string;
  src: string;
  href?: string;
}

interface TestimonialsLogosProps {
  headline?: string;
  subtext?: string;
  logos: Logo[];
  style?: "grid" | "marquee" | "stacked";
  grayscale?: boolean;
}

export function TestimonialsLogos({
  headline = "Trusted by industry leaders",
  subtext,
  logos,
  style = "grid",
  grayscale = true,
}: TestimonialsLogosProps) {
  const LogoComponent = ({ logo }: { logo: Logo }) => {
    const img = (
      <Image
        src={logo.src}
        alt={logo.name}
        width={120}
        height={40}
        className={`h-8 w-auto object-contain transition-all ${
          grayscale ? "grayscale opacity-50 hover:grayscale-0 hover:opacity-100" : ""
        }`}
      />
    );

    if (logo.href) {
      return (
        <a href={logo.href} target="_blank" rel="noopener noreferrer" className="block">
          {img}
        </a>
      );
    }

    return img;
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          {headline && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {headline}
            </p>
          )}
          {subtext && (
            <p className="text-gray-600 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>

        {/* Logo display */}
        {style === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center max-w-5xl mx-auto">
            {logos.map((logo, index) => (
              <LogoComponent key={index} logo={logo} />
            ))}
          </div>
        )}

        {style === "marquee" && (
          <div className="relative overflow-hidden">
            <div className="flex gap-16 animate-marquee">
              {[...logos, ...logos].map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <LogoComponent logo={logo} />
                </div>
              ))}
            </div>
            <style jsx>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 30s linear infinite;
              }
            `}</style>
          </div>
        )}

        {style === "stacked" && (
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 max-w-4xl mx-auto">
            {logos.map((logo, index) => (
              <LogoComponent key={index} logo={logo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsLogos;

