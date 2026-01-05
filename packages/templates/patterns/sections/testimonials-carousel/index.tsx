/**
 * Testimonials Carousel Section
 * 
 * Sliding carousel of quotes.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
}

export interface TestimonialsCarouselProps {
  headline?: string;
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
  variant?: "light" | "dark";
}

export function TestimonialsCarousel({
  headline = "What our customers say",
  testimonials,
  autoPlay = true,
  interval = 5000,
  variant = "light",
}: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next]);

  const testimonial = testimonials[current];
  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-gray-50 dark:bg-gray-900";
  const textClass = variant === "dark" ? "text-white" : "text-gray-900 dark:text-white";

  return (
    <section className={`py-20 lg:py-32 ${bgClass}`}>
      <div className="container mx-auto px-4">
        {headline && (
          <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${textClass}`}>
            {headline}
          </h2>
        )}

        <div className="max-w-4xl mx-auto relative">
          <Quote className="w-12 h-12 text-primary/20 mb-6 mx-auto" />

          <div className="text-center">
            <blockquote className={`text-2xl md:text-3xl leading-relaxed mb-8 ${
              variant === "dark" ? "text-gray-200" : "text-gray-800 dark:text-gray-200"
            }`}>
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              {testimonial.avatar && (
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-left">
                <div className={`font-semibold ${textClass}`}>
                  {testimonial.author}
                </div>
                {(testimonial.role || testimonial.company) && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}{testimonial.company && `, ${testimonial.company}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === current
                      ? "bg-primary"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;

