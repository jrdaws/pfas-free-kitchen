/**
 * Portfolio Minimal Template
 * 
 * Clean, minimal portfolio for creatives and developers.
 * Inspired by: Brittany Chiang, Josh Comeau, Lee Robinson
 */

import type { Template } from "./index";

export const portfolioTemplate: Template = {
  id: "portfolio-minimal",
  name: "Portfolio Minimal",
  description: "Clean personal portfolio for developers and designers",
  category: "portfolio",
  thumbnail: "/templates/portfolio-preview.png",
  tags: ["personal", "developer", "minimal", "dark"],
  featured: false,
  definition: {
    meta: {
      name: "Your Name",
      description: "Developer & Designer",
      template: "portfolio-minimal",
      version: "1.0.0",
    },
    branding: {
      colors: {
        primary: "#64FFDA",
        secondary: "#7C3AED",
        accent: "#F472B6",
        background: "#0A192F",
        foreground: "#CCD6F6",
        muted: "#8892B0",
        border: "#233554",
        card: "#112240",
        destructive: "#FF6B6B",
        success: "#64FFDA",
      },
      fonts: {
        heading: "Calibre",
        body: "Inter",
        mono: "SF Mono",
      },
      spacing: {
        containerMax: "1000px",
        sectionPadding: "100px",
        componentGap: "20px",
      },
      borderRadius: "sm",
      shadowStyle: "none",
    },
    pages: [
      {
        path: "/",
        title: "Your Name - Developer & Designer",
        description: "I build things for the web.",
        layout: "narrow",
        sections: [
          {
            id: "hero-1",
            patternId: "hero-simple-centered",
            props: {
              headline: "Hi, I'm Your Name.",
              subheadline: "I'm a software engineer specializing in building exceptional digital experiences. Currently focused on building accessible, human-centered products.",
              primaryCta: { text: "Get In Touch", href: "#contact" },
              badge: "Open to Work",
            },
          },
          {
            id: "features-1",
            patternId: "features-alternating",
            props: {
              title: "Featured Projects",
              subtitle: "Some things I've built",
            },
          },
          {
            id: "features-2",
            patternId: "features-icon-grid",
            props: {
              title: "Skills & Technologies",
              subtitle: "Tools I use daily",
            },
          },
          {
            id: "cta-1",
            patternId: "cta-simple",
            props: {
              headline: "Get In Touch",
              subheadline: "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll do my best to get back to you!",
              cta: { text: "Say Hello", href: "mailto:hello@example.com" },
              variant: "centered",
            },
          },
        ],
      },
    ],
  },
};

