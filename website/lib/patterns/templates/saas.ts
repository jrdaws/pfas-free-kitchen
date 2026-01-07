/**
 * SaaS Pro Template
 * 
 * Modern dark-themed SaaS landing page with pricing, features, and testimonials.
 * Inspired by: Linear, Vercel, Stripe
 */

import type { Template } from "./index";

export const saasTemplate: Template = {
  id: "saas-pro",
  name: "SaaS Pro",
  description: "Modern SaaS landing page with pricing, features, and testimonials",
  category: "saas",
  thumbnail: "/templates/saas-preview.png",
  tags: ["software", "subscription", "b2b", "dark"],
  featured: true,
  definition: {
    meta: {
      name: "YourSaaS",
      description: "A modern SaaS platform",
      template: "saas-pro",
      version: "1.0.0",
    },
    branding: {
      colors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        accent: "#F59E0B",
        background: "#0F172A",
        foreground: "#F8FAFC",
        muted: "#64748B",
        border: "#1E293B",
        card: "#1E293B",
        destructive: "#EF4444",
        success: "#22C55E",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
        mono: "JetBrains Mono",
      },
      spacing: {
        containerMax: "1280px",
        sectionPadding: "96px",
        componentGap: "24px",
      },
      borderRadius: "md",
      shadowStyle: "subtle",
    },
    pages: [
      {
        path: "/",
        title: "YourSaaS - Build faster with AI-powered tools",
        description: "Streamline your workflow and ship products 10x faster with our intelligent platform.",
        sections: [
          {
            id: "hero-1",
            patternId: "hero-centered-gradient",
            props: {
              headline: "Build faster with AI-powered tools",
              subheadline: "Streamline your workflow and ship products 10x faster with our intelligent platform.",
              primaryCta: { text: "Start Free Trial", href: "/signup" },
              secondaryCta: { text: "Watch Demo", href: "#demo" },
              badge: "Now with GPT-4 Integration",
            },
          },
          {
            id: "logos-1",
            patternId: "logos-simple",
            props: {
              headline: "Trusted by industry leaders",
              grayscale: true,
            },
          },
          {
            id: "features-1",
            patternId: "features-icon-grid",
            props: {
              title: "Everything you need to succeed",
              subtitle: "Powerful features designed for modern teams",
            },
          },
          {
            id: "features-2",
            patternId: "features-bento",
            props: {
              title: "Built for scale",
              subtitle: "From startup to enterprise",
            },
          },
          {
            id: "testimonials-1",
            patternId: "testimonials-grid",
            props: {
              headline: "Loved by thousands of customers",
            },
          },
          {
            id: "pricing-1",
            patternId: "pricing-three-tier",
            props: {
              headline: "Simple, transparent pricing",
              subheadline: "No hidden fees. Cancel anytime.",
              billingToggle: true,
            },
          },
          {
            id: "faq-1",
            patternId: "faq-accordion",
            props: {
              headline: "Frequently asked questions",
              subheadline: "Everything you need to know",
            },
          },
          {
            id: "cta-1",
            patternId: "cta-simple",
            props: {
              headline: "Ready to get started?",
              subheadline: "Join thousands of teams already using YourSaaS",
              cta: { text: "Start Free Trial", href: "/signup" },
              variant: "gradient-bg",
            },
          },
        ],
      },
    ],
  },
};

