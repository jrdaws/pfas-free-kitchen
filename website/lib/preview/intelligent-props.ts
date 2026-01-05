/**
 * Intelligent Component Props Generator
 * 
 * Generates personalized component props based on:
 * - User's vision statement
 * - Research domain insights
 * - Selected integrations
 * - Page hierarchy
 */

import { getTemplateComposition } from "./template-compositions";
import type { PreviewSession, ResearchContext, BrandingContext } from "./session-types";

export interface PropsGenerationContext {
  template: string;
  projectName: string;
  pagePath: string;
  pageTitle: string;
  branding: BrandingContext;
  vision?: PreviewSession["vision"];
  research?: ResearchContext;
  integrations: Record<string, string>;
  pages: { path: string; title: string }[];
}

/**
 * Generate personalized props for a component based on context
 */
export function generateIntelligentProps(
  componentName: string,
  context: PropsGenerationContext
): Record<string, unknown> {
  const composition = getTemplateComposition(context.template);
  const defaultProps = composition.defaultProps[componentName] || {};

  // Start with defaults
  const props: Record<string, unknown> = { ...defaultProps };

  // Apply personalization based on component type
  switch (componentName) {
    case "Nav":
      return generateNavProps(context, props);
    case "Hero":
      return generateHeroProps(context, props);
    case "FeatureCards":
      return generateFeatureCardsProps(context, props);
    case "PricingTable":
      return generatePricingProps(context, props);
    case "Testimonials":
      return generateTestimonialsProps(context, props);
    case "CTA":
      return generateCTAProps(context, props);
    case "Footer":
      return generateFooterProps(context, props);
    case "ProductGrid":
      return generateProductGridProps(context, props);
    case "FAQ":
      return generateFAQProps(context, props);
    default:
      return props;
  }
}

function generateNavProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { projectName, pages, integrations, branding } = context;

  // Generate nav links from page structure
  const navLinks = pages
    .filter(p => p.path !== "/" && !p.path.includes("["))
    .slice(0, 5)
    .map(p => p.title);

  // Add auth link if auth integration exists
  const hasAuth = integrations.auth && integrations.auth !== "none";

  return {
    ...defaults,
    projectName,
    links: navLinks.length > 0 ? navLinks : ["Features", "Pricing", "About"],
    showAuth: hasAuth,
    showCart: context.template === "ecommerce",
    logo: branding.logo,
    primaryColor: branding.colors.primary,
  };
}

function generateHeroProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, research, projectName, template, integrations } = context;

  // Personalize title from vision
  let title = defaults.title as string;
  let subtitle = defaults.subtitle as string;

  if (vision?.problem) {
    // Create title from problem statement
    title = transformProblemToHeadline(vision.problem, template);
    subtitle = vision.problem.length > 100 
      ? vision.problem.slice(0, 100) + "..."
      : vision.problem;
  } else if (research?.domainInsights?.overview) {
    subtitle = research.domainInsights.overview;
  }

  // Personalize CTA based on integrations and business model
  let ctaText = defaults.ctaText as string;
  let ctaSecondaryText = defaults.ctaSecondaryText as string;

  if (vision?.businessModel === "subscription" || integrations.payments === "stripe") {
    ctaText = "Start Free Trial";
    ctaSecondaryText = "View Pricing";
  } else if (vision?.businessModel === "one-time") {
    ctaText = "Buy Now";
    ctaSecondaryText = "Learn More";
  } else if (vision?.businessModel === "freemium") {
    ctaText = "Get Started Free";
    ctaSecondaryText = "See Plans";
  } else if (template === "ecommerce") {
    ctaText = "Shop Now";
    ctaSecondaryText = "Browse Categories";
  }

  // Apply design style
  const backgroundStyle = vision?.designStyle === "dark" ? "dark" : 
                         vision?.designStyle === "minimal" ? "solid" :
                         defaults.backgroundStyle;

  return {
    ...defaults,
    title,
    subtitle,
    ctaText,
    ctaSecondaryText,
    ctaLink: integrations.auth ? "/signup" : "/get-started",
    backgroundStyle,
    projectName,
  };
}

function generateFeatureCardsProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, research, template } = context;

  // Generate features based on research or template
  let features: { title: string; description: string; iconName: string }[] = [];

  if (research?.domainInsights?.keyDifferentiators) {
    features = research.domainInsights.keyDifferentiators.slice(0, 3).map((diff, i) => ({
      title: extractFeatureTitle(diff),
      description: diff,
      iconName: getFeatureIcon(i),
    }));
  } else if (vision?.audience) {
    // Generate audience-appropriate features
    features = generateAudienceFeatures(vision.audience, template);
  } else {
    // Fall back to template-specific defaults
    features = getTemplateFeatures(template);
  }

  return {
    ...defaults,
    features,
    title: research?.domainInsights?.targetAudience 
      ? `Built for ${research.domainInsights.targetAudience}`
      : "Why Choose Us",
  };
}

function generatePricingProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, integrations } = context;

  // Adjust pricing based on business model
  const hasStripe = integrations.payments === "stripe";
  
  let plans = [
    {
      name: "Free",
      price: 0,
      period: "month",
      features: ["Basic features", "Community support", "1 project"],
    },
    {
      name: "Pro",
      price: vision?.businessModel === "one-time" ? 99 : 29,
      period: vision?.businessModel === "one-time" ? "one-time" : "month",
      features: ["All Free features", "Priority support", "Unlimited projects", "API access"],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: vision?.businessModel === "one-time" ? 299 : 99,
      period: vision?.businessModel === "one-time" ? "one-time" : "month",
      features: ["All Pro features", "Dedicated support", "Custom integrations", "SLA"],
    },
  ];

  if (vision?.businessModel === "free") {
    // Remove paid tiers for free/open source
    plans = [plans[0]];
  }

  return {
    ...defaults,
    plans,
    showToggle: vision?.businessModel === "subscription",
    highlightPlan: "Pro",
    stripeEnabled: hasStripe,
  };
}

function generateTestimonialsProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, research, template } = context;

  // Generate audience-appropriate testimonials
  const audienceType = vision?.audience || "b2c";
  
  const testimonials = audienceType === "b2b" ? [
    {
      quote: "This solution transformed our workflow. ROI in just 3 months.",
      author: "Sarah Johnson",
      role: "VP of Operations",
      company: "TechCorp Inc.",
      avatarIndex: 1,
    },
    {
      quote: "Finally, a tool that our entire team actually uses daily.",
      author: "Michael Chen",
      role: "CTO",
      company: "StartupXYZ",
      avatarIndex: 2,
    },
    {
      quote: "Best investment we've made this year. Support is outstanding.",
      author: "Emily Rodriguez",
      role: "Director",
      company: "Enterprise Co.",
      avatarIndex: 3,
    },
  ] : [
    {
      quote: "Love how easy this is to use. Exactly what I was looking for!",
      author: "Alex Thompson",
      role: "Customer",
      avatarIndex: 1,
    },
    {
      quote: "Game changer. I recommend this to everyone I know.",
      author: "Jordan Lee",
      role: "Happy User",
      avatarIndex: 2,
    },
    {
      quote: "Simple, effective, and worth every penny.",
      author: "Sam Rivera",
      role: "Customer",
      avatarIndex: 3,
    },
  ];

  return {
    ...defaults,
    testimonials,
  };
}

function generateCTAProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, research, projectName } = context;

  const title = research?.domainInsights?.targetAudience
    ? `Ready to join ${research.domainInsights.targetAudience}?`
    : "Ready to Get Started?";

  const buttonText = vision?.businessModel === "subscription"
    ? "Start Free Trial"
    : vision?.businessModel === "free"
    ? "Get Started"
    : "Try It Free";

  return {
    ...defaults,
    title,
    subtitle: `Join thousands of happy ${projectName} users today.`,
    buttonText,
  };
}

function generateFooterProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { projectName, pages, vision } = context;

  const links = pages
    .filter(p => !p.path.includes("["))
    .slice(0, 6)
    .map(p => p.title);

  return {
    ...defaults,
    projectName,
    links: links.length > 0 ? links : ["Home", "About", "Contact", "Privacy"],
    description: vision?.problem 
      ? `${projectName} - ${vision.problem.slice(0, 60)}...`
      : `${projectName} - Your trusted partner.`,
  };
}

function generateProductGridProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, research } = context;

  // Generate products based on domain insights
  const category = research?.domainInsights?.overview?.split(" ")[0] || "Product";
  
  const products = [
    { name: `Premium ${category}`, price: 49.99, category: "New", image: undefined },
    { name: `Classic ${category}`, price: 39.99, category: "Popular", image: undefined },
    { name: `${category} Bundle`, price: 79.99, category: "Best Value", image: undefined },
    { name: `${category} Starter`, price: 19.99, category: "Sale", image: undefined },
  ];

  return {
    ...defaults,
    products,
    title: research?.domainInsights?.targetAudience
      ? `${category}s for ${research.domainInsights.targetAudience}`
      : "Featured Products",
  };
}

function generateFAQProps(
  context: PropsGenerationContext,
  defaults: Record<string, unknown>
): Record<string, unknown> {
  const { vision, integrations } = context;

  const items = [
    {
      question: "How do I get started?",
      answer: integrations.auth
        ? "Simply sign up for a free account and you'll be guided through the setup process."
        : "Click 'Get Started' and follow our quick setup guide.",
    },
    {
      question: "What payment methods do you accept?",
      answer: integrations.payments === "stripe"
        ? "We accept all major credit cards, Apple Pay, and Google Pay through our secure Stripe integration."
        : "We accept all major credit cards and PayPal.",
    },
    {
      question: "Can I cancel anytime?",
      answer: vision?.businessModel === "subscription"
        ? "Yes, you can cancel your subscription at any time with no penalties. You'll retain access until the end of your billing period."
        : "Since this is a one-time purchase, there's no recurring billing to cancel.",
    },
    {
      question: "Do you offer support?",
      answer: "Yes! We offer comprehensive support through our help center, email, and for Pro users, priority chat support.",
    },
  ];

  return {
    ...defaults,
    items,
  };
}

// Helper functions

function transformProblemToHeadline(problem: string, template: string): string {
  // Extract the core value proposition
  const words = problem.split(" ").slice(0, 8);
  
  if (template === "saas") {
    return `${words.join(" ")}${words.length >= 8 ? "..." : ""}`;
  } else if (template === "ecommerce") {
    return `Discover ${words.slice(0, 4).join(" ")}`;
  }
  
  return words.join(" ");
}

function extractFeatureTitle(description: string): string {
  // Extract first 3-4 words as title
  return description.split(" ").slice(0, 4).join(" ");
}

function getFeatureIcon(index: number): string {
  const icons = ["zap", "shield", "clock", "star", "check", "settings"];
  return icons[index % icons.length];
}

function generateAudienceFeatures(
  audience: string,
  template: string
): { title: string; description: string; iconName: string }[] {
  if (audience === "b2b") {
    return [
      { title: "Enterprise Ready", description: "Built for teams of any size with role-based access.", iconName: "building" },
      { title: "Analytics Dashboard", description: "Get insights into your team's productivity.", iconName: "chart" },
      { title: "Priority Support", description: "Dedicated support team for business customers.", iconName: "headset" },
    ];
  }
  
  return [
    { title: "Easy to Use", description: "Get started in minutes with no learning curve.", iconName: "zap" },
    { title: "Affordable Plans", description: "Pricing that works for everyone.", iconName: "dollar" },
    { title: "24/7 Access", description: "Use it anytime, anywhere, on any device.", iconName: "globe" },
  ];
}

function getTemplateFeatures(
  template: string
): { title: string; description: string; iconName: string }[] {
  switch (template) {
    case "ecommerce":
      return [
        { title: "Free Shipping", description: "On orders over $50", iconName: "truck" },
        { title: "Easy Returns", description: "30-day hassle-free returns", iconName: "refresh" },
        { title: "Secure Checkout", description: "SSL encrypted transactions", iconName: "shield" },
      ];
    case "saas":
      return [
        { title: "Fast & Reliable", description: "99.9% uptime guarantee", iconName: "zap" },
        { title: "Secure by Default", description: "Enterprise-grade security", iconName: "shield" },
        { title: "24/7 Support", description: "We're here when you need us", iconName: "headset" },
      ];
    default:
      return [
        { title: "Quality First", description: "We never compromise on quality.", iconName: "star" },
        { title: "Fast Delivery", description: "Quick turnaround times.", iconName: "clock" },
        { title: "Expert Team", description: "Years of industry experience.", iconName: "users" },
      ];
  }
}

/**
 * Generate all props for a page based on context
 */
export function generatePageProps(
  context: PropsGenerationContext
): Record<string, Record<string, unknown>> {
  const composition = getTemplateComposition(context.template);
  const props: Record<string, Record<string, unknown>> = {};

  for (const section of composition.sections) {
    props[section.component] = generateIntelligentProps(section.component, context);
  }

  return props;
}

