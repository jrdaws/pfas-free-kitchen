/**
 * Testimonials Grid Section
 * 
 * Grid of testimonial cards.
 */

import { Star } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsGridProps {
  headline?: string;
  subtext?: string;
  testimonials: Testimonial[];
  columns?: 2 | 3;
  variant?: "light" | "dark";
}

export function TestimonialsGrid({
  headline = "Loved by teams everywhere",
  subtext,
  testimonials,
  columns = 3,
  variant = "light",
}: TestimonialsGridProps) {
  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white dark:bg-gray-950";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";
  const subtextClass = variant === "dark" ? "text-gray-400" : "text-gray-600 dark:text-gray-400";

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
  };

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {headline && (
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textClass}`}>
              {headline}
            </h2>
          )}
          {subtext && (
            <p className={`text-xl ${subtextClass}`}>
              {subtext}
            </p>
          )}
        </div>

        <div className={`grid ${gridCols[columns]} gap-8 max-w-6xl mx-auto`}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border ${
                variant === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
              }`}
            >
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating!
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}

              <blockquote className={`mb-6 leading-relaxed ${
                variant === "dark" ? "text-gray-300" : "text-gray-700 dark:text-gray-300"
              }`}>
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                {testimonial.avatar ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className={`font-semibold ${textClass}`}>
                    {testimonial.author}
                  </div>
                  {(testimonial.role || testimonial.company) && (
                    <div className={`text-sm ${subtextClass}`}>
                      {testimonial.role}{testimonial.company && `, ${testimonial.company}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsGrid;

