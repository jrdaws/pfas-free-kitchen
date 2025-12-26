"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatarIndex?: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  layout?: "grid" | "carousel" | "stacked";
  title?: string;
}

export function Testimonials({
  testimonials = [],
  layout = "grid",
  title = "What Our Customers Say",
}: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-6 py-16 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
          {title}
        </h2>

        <div
          className={cn(
            layout === "grid" && "grid grid-cols-1 md:grid-cols-3 gap-6",
            layout === "stacked" && "flex flex-col gap-6 max-w-2xl mx-auto",
            layout === "carousel" && "flex gap-6 overflow-x-auto pb-4 snap-x"
          )}
        >
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className={cn(
                "bg-card rounded-xl p-6 border border-border shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all",
                layout === "carousel" && "min-w-[350px] snap-center"
              )}
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-primary/50 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-foreground-secondary italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                  {testimonial.avatarIndex ? (
                    <Image
                      src={`/images/redesign/avatars/avatar-placeholder-${testimonial.avatarIndex}.webp`}
                      alt={testimonial.author}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-primary-foreground font-medium text-sm">
                      {testimonial.author.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">
                    {testimonial.author}
                  </p>
                  {(testimonial.role || testimonial.company) && (
                    <p className="text-foreground-muted text-xs">
                      {testimonial.role}
                      {testimonial.role && testimonial.company && " at "}
                      {testimonial.company}
                    </p>
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

