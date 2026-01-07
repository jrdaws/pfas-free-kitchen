"use client";

import React, { useState } from "react";
import { BasePatternProps } from "../../types";

interface Testimonial {
  quote: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar?: string;
  };
  rating?: number;
}

export interface TestimonialCardsProps extends BasePatternProps {
  headline?: string;
  testimonials?: Testimonial[];
  variant?: "grid" | "carousel" | "featured";
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: "This product has completely transformed how our team works. We've seen a 3x improvement in productivity.",
    author: { name: "Sarah Chen", title: "VP of Engineering", company: "TechCorp", avatar: "" },
    rating: 5,
  },
  {
    quote: "The best tool we've ever used. Simple, powerful, and a joy to work with every day.",
    author: { name: "Michael Torres", title: "Product Manager", company: "StartupXYZ", avatar: "" },
    rating: 5,
  },
  {
    quote: "Incredible customer support and a product that just works. Highly recommended.",
    author: { name: "Emily Johnson", title: "CEO", company: "GrowthCo", avatar: "" },
    rating: 5,
  },
];

/**
 * TestimonialCards
 * Customer testimonials in grid, carousel, or featured layout
 * Inspired by: stripe.com, notion.so
 */
export function TestimonialCards({
  headline = "What our customers say",
  testimonials = defaultTestimonials,
  variant = "grid",
  className = "",
}: TestimonialCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4"
          fill={star <= rating ? "#F97316" : "currentColor"}
          viewBox="0 0 20 20"
          style={{ color: "var(--preview-muted, #4B5563)" }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  // Single testimonial card
  const TestimonialCard = ({ testimonial, isFeatured = false }: { testimonial: Testimonial; isFeatured?: boolean }) => (
    <div
      className={`rounded-2xl p-6 ${isFeatured ? "md:p-10" : ""}`}
      style={{
        backgroundColor: "var(--preview-card, #18181B)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Rating */}
      {testimonial.rating && (
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>
      )}

      {/* Quote */}
      <blockquote
        className={`${isFeatured ? "text-xl md:text-2xl" : "text-base"} mb-6`}
        style={{ color: "var(--preview-foreground, #FFFFFF)" }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden"
          style={{
            backgroundColor: "rgba(249, 115, 22, 0.2)",
            color: "var(--preview-primary, #F97316)",
          }}
        >
          {testimonial.author.avatar ? (
            <img
              src={testimonial.author.avatar}
              alt={testimonial.author.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            testimonial.author.name.charAt(0)
          )}
        </div>

        <div>
          <p
            className="font-medium text-sm"
            style={{ color: "var(--preview-foreground, #FFFFFF)" }}
          >
            {testimonial.author.name}
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--preview-muted, #78716C)" }}
          >
            {testimonial.author.title} at {testimonial.author.company}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section
      className={`py-24 px-6 ${className}`}
      style={{ backgroundColor: "var(--preview-background, #0A0A0A)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Headline */}
        {headline && (
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{
              color: "var(--preview-foreground, #FFFFFF)",
              fontFamily: "var(--font-heading, 'Cal Sans', sans-serif)",
            }}
          >
            {headline}
          </h2>
        )}

        {/* Grid Layout */}
        {variant === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* Carousel Layout */}
        {variant === "carousel" && (
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-4">
                    <div className="max-w-2xl mx-auto">
                      <TestimonialCard testimonial={testimonial} isFeatured />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIndex ? "w-8" : ""
                  }`}
                  style={{
                    backgroundColor:
                      i === activeIndex
                        ? "var(--preview-primary, #F97316)"
                        : "var(--preview-muted, #4B5563)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Layout (first one larger) */}
        {variant === "featured" && testimonials.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured testimonial */}
            <div className="lg:row-span-2">
              <TestimonialCard testimonial={testimonials[0]} isFeatured />
            </div>

            {/* Other testimonials */}
            {testimonials.slice(1, 3).map((testimonial, i) => (
              <TestimonialCard key={i} testimonial={testimonial} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

TestimonialCards.patternId = "testimonials-grid";
TestimonialCards.patternName = "Testimonial Cards";
TestimonialCards.patternCategory = "testimonials";

