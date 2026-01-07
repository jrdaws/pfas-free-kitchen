/**
 * Creative Agency Template
 * 
 * Bold agency portfolio with elegant typography and light theme.
 * Inspired by: Pentagram, Ueno, Fantasy
 */

import type { Template } from "./index";

export const agencyTemplate: Template = {
  id: "agency-creative",
  name: "Creative Agency",
  description: "Bold agency portfolio with case studies and team showcase",
  category: "agency",
  thumbnail: "/templates/agency-preview.png",
  tags: ["design", "creative", "portfolio", "light"],
  featured: true,
  definition: {
    meta: {
      name: "Studio X",
      description: "We create stunning digital experiences",
      template: "agency-creative",
      version: "1.0.0",
    },
    branding: {
      colors: {
        primary: "#18181B",
        secondary: "#3B82F6",
        accent: "#F97316",
        background: "#FAFAFA",
        foreground: "#18181B",
        muted: "#71717A",
        border: "#E4E4E7",
        card: "#FFFFFF",
        destructive: "#DC2626",
        success: "#16A34A",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Inter",
        mono: "JetBrains Mono",
      },
      spacing: {
        containerMax: "1440px",
        sectionPadding: "120px",
        componentGap: "32px",
      },
      borderRadius: "sm",
      shadowStyle: "subtle",
    },
    pages: [
      {
        path: "/",
        title: "Studio X - Creative Agency",
        description: "Award-winning design studio specializing in brand identity and digital products",
        sections: [
          {
            id: "hero-1",
            patternId: "hero-split-image",
            props: {
              headline: "We craft digital experiences that inspire",
              subheadline: "Award-winning design studio specializing in brand identity, web design, and digital products.",
              primaryCta: { text: "View Our Work", href: "/work" },
              secondaryCta: { text: "Get in Touch", href: "/contact" },
            },
          },
          {
            id: "logos-1",
            patternId: "logos-simple",
            props: {
              headline: "Brands we've worked with",
              grayscale: true,
            },
          },
          {
            id: "features-1",
            patternId: "features-bento",
            props: {
              title: "Our Services",
              subtitle: "What we do best",
            },
          },
          {
            id: "testimonials-1",
            patternId: "testimonials-carousel",
            props: {
              headline: "What our clients say",
            },
          },
          {
            id: "cta-1",
            patternId: "cta-simple",
            props: {
              headline: "Let's create something amazing",
              subheadline: "Get in touch to discuss your next project",
              cta: { text: "Start a Project", href: "/contact" },
              variant: "centered",
            },
          },
        ],
      },
    ],
  },
};

