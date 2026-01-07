/**
 * Startup Launch Template
 * 
 * High-energy startup landing page with bold visuals.
 * Inspired by: Stripe, Notion, Loom
 */

import type { Template } from "./index";

export const startupTemplate: Template = {
  id: "startup-launch",
  name: "Startup Launch",
  description: "High-energy landing page for product launches and startups",
  category: "startup",
  thumbnail: "/templates/startup-preview.png",
  tags: ["launch", "product", "tech", "gradient"],
  featured: true,
  definition: {
    meta: {
      name: "LaunchPad",
      description: "Ship faster, grow smarter",
      template: "startup-launch",
      version: "1.0.0",
    },
    branding: {
      colors: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
        accent: "#FFE66D",
        background: "#1A1A2E",
        foreground: "#EAEAEA",
        muted: "#7F8C8D",
        border: "#2D2D44",
        card: "#16213E",
        destructive: "#E74C3C",
        success: "#2ECC71",
      },
      fonts: {
        heading: "Space Grotesk",
        body: "Inter",
        mono: "Fira Code",
      },
      spacing: {
        containerMax: "1280px",
        sectionPadding: "100px",
        componentGap: "28px",
      },
      borderRadius: "lg",
      shadowStyle: "dramatic",
    },
    pages: [
      {
        path: "/",
        title: "LaunchPad - Ship faster, grow smarter",
        description: "The all-in-one platform for startups to build, launch, and scale.",
        sections: [
          {
            id: "hero-1",
            patternId: "hero-animated-gradient",
            props: {
              headline: "Ship faster, grow smarter",
              subheadline: "The all-in-one platform for startups to build, launch, and scale their products.",
              primaryCta: { text: "Join Waitlist", href: "/waitlist" },
              secondaryCta: { text: "See How It Works", href: "#how-it-works" },
              badge: "🚀 Launching Q1 2026",
            },
          },
          {
            id: "logos-1",
            patternId: "logos-simple",
            props: {
              headline: "Backed by the best",
              grayscale: false,
            },
          },
          {
            id: "features-1",
            patternId: "features-bento",
            props: {
              title: "Everything you need",
              subtitle: "One platform, unlimited possibilities",
            },
          },
          {
            id: "features-2",
            patternId: "features-comparison",
            props: {
              title: "How we compare",
              subtitle: "See why startups choose us",
            },
          },
          {
            id: "testimonials-1",
            patternId: "testimonials-featured",
            props: {
              headline: "Early adopters love us",
            },
          },
          {
            id: "pricing-1",
            patternId: "pricing-three-tier",
            props: {
              headline: "Start free, scale when ready",
              subheadline: "No credit card required. Upgrade as you grow.",
              billingToggle: true,
            },
          },
          {
            id: "faq-1",
            patternId: "faq-accordion",
            props: {
              headline: "Questions? We've got answers",
              variant: "single-column",
            },
          },
          {
            id: "cta-1",
            patternId: "cta-simple",
            props: {
              headline: "Ready to launch?",
              subheadline: "Join the waitlist and be first to know when we go live.",
              cta: { text: "Get Early Access", href: "/waitlist" },
              secondaryCta: { text: "Schedule Demo", href: "/demo" },
              variant: "gradient-bg",
            },
          },
        ],
      },
    ],
  },
};

