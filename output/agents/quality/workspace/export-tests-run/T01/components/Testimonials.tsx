"use client";

import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  layout?: "grid" | "carousel" | "stacked";
  title?: string;
}

export function Testimonials({
  testimonials,
  layout = "grid",
  title = "What Our Customers Say",
}: TestimonialsProps) {
  return (
    <section className="w-full px-6 py-16 bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
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
                "bg-[#111111] rounded-xl p-6 border border-white/5",
                layout === "carousel" && "min-w-[350px] snap-center"
              )}
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-indigo-500/50 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    {testimonial.author}
                  </p>
                  {(testimonial.role || testimonial.company) && (
                    <p className="text-gray-500 text-xs">
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
