/**
 * Features Pattern - Bento Grid
 * 
 * Asymmetric bento box layout (Apple-style).
 * Best for: Modern SaaS, creative products, innovative apps
 */

import Image from "next/image";

interface BentoItem {
  title: string;
  description: string;
  image?: string;
  size: "small" | "medium" | "large";
  bgColor?: string;
  textColor?: "light" | "dark";
}

interface FeaturesBentoProps {
  headline: string;
  subtext?: string;
  items: BentoItem[];
}

export function FeaturesBento({
  headline,
  subtext,
  items,
}: FeaturesBentoProps) {
  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 md:col-span-2 row-span-1",
    large: "col-span-1 md:col-span-2 row-span-2",
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {headline}
          </h2>
          {subtext && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {subtext}
            </p>
          )}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto auto-rows-[200px]">
          {items.map((item, index) => (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden ${sizeClasses[item.size]} group`}
              style={{
                backgroundColor: item.bgColor || "#f3f4f6",
              }}
            >
              {/* Background image */}
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              )}

              {/* Content overlay */}
              <div className={`absolute inset-0 p-6 flex flex-col justify-end ${
                item.image ? "bg-gradient-to-t from-black/60 to-transparent" : ""
              }`}>
                <h3 className={`text-xl font-bold mb-2 ${
                  item.textColor === "light" || item.image
                    ? "text-white"
                    : "text-gray-900"
                }`}>
                  {item.title}
                </h3>
                <p className={`text-sm ${
                  item.textColor === "light" || item.image
                    ? "text-white/80"
                    : "text-gray-600"
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesBento;

