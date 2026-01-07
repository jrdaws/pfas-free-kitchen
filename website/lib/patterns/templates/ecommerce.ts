/**
 * E-commerce Store Template
 * 
 * Modern online store with product showcase and clean layout.
 * Inspired by: Shopify, Gymshark, Allbirds
 */

import type { Template } from "./index";

export const ecommerceTemplate: Template = {
  id: "ecommerce-modern",
  name: "Modern Store",
  description: "Clean e-commerce layout with product showcase and trust signals",
  category: "ecommerce",
  thumbnail: "/templates/ecommerce-preview.png",
  tags: ["shop", "products", "retail", "dark"],
  featured: false,
  definition: {
    meta: {
      name: "Your Store",
      description: "Premium products, delivered worldwide",
      template: "ecommerce-modern",
      version: "1.0.0",
    },
    branding: {
      colors: {
        primary: "#F97316",
        secondary: "#EA580C",
        accent: "#FBBF24",
        background: "#0A0A0A",
        foreground: "#FFFFFF",
        muted: "#71717A",
        border: "#27272A",
        card: "#18181B",
        destructive: "#EF4444",
        success: "#22C55E",
      },
      fonts: {
        heading: "Montserrat",
        body: "Inter",
        mono: "JetBrains Mono",
      },
      spacing: {
        containerMax: "1280px",
        sectionPadding: "80px",
        componentGap: "24px",
      },
      borderRadius: "md",
      shadowStyle: "medium",
    },
    pages: [
      {
        path: "/",
        title: "Your Store - Premium Products",
        description: "Discover our collection of premium products, delivered worldwide.",
        sections: [
          {
            id: "hero-1",
            patternId: "hero-centered-gradient",
            props: {
              headline: "Premium quality, exceptional value",
              subheadline: "Discover our curated collection of products designed to elevate your everyday.",
              primaryCta: { text: "Shop Now", href: "/shop" },
              secondaryCta: { text: "View Collection", href: "#collection" },
              badge: "Free Shipping Over $50",
            },
          },
          {
            id: "logos-1",
            patternId: "logos-simple",
            props: {
              headline: "As featured in",
              grayscale: true,
              variant: "scrolling",
            },
          },
          {
            id: "features-1",
            patternId: "features-cards",
            props: {
              title: "Why choose us",
              subtitle: "Quality you can trust",
            },
          },
          {
            id: "testimonials-1",
            patternId: "testimonials-grid",
            props: {
              headline: "Customer reviews",
            },
          },
          {
            id: "faq-1",
            patternId: "faq-accordion",
            props: {
              headline: "Common questions",
              variant: "two-column",
            },
          },
          {
            id: "cta-1",
            patternId: "cta-simple",
            props: {
              headline: "Join our community",
              subheadline: "Subscribe for exclusive offers and new product drops",
              cta: { text: "Subscribe", href: "#newsletter" },
              variant: "gradient-bg",
            },
          },
        ],
      },
    ],
  },
};

