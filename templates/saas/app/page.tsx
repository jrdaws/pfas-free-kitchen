"use client";

import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { FeatureCards } from "@/components/FeatureCards";
import { PricingTable } from "@/components/PricingTable";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

// Default content - customize these for your project
const PROJECT_NAME = "SaaS App";

const FEATURES = [
  {
    title: "Lightning Fast",
    description: "Built on Next.js 15 with optimized performance out of the box.",
    iconName: "zap",
  },
  {
    title: "Secure by Default",
    description: "Enterprise-grade security with authentication ready to configure.",
    iconName: "shield",
  },
  {
    title: "Real-time Updates",
    description: "Live data synchronization powered by modern database technology.",
    iconName: "clock",
  },
  {
    title: "Analytics Built-in",
    description: "Track user behavior and make data-driven decisions.",
    iconName: "chart",
  },
  {
    title: "Team Collaboration",
    description: "Multi-user support with role-based access controls.",
    iconName: "users",
  },
  {
    title: "Premium Support",
    description: "Get help when you need it with our responsive support team.",
    iconName: "star",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: 0,
    features: [
      "Up to 3 team members",
      "Basic analytics",
      "Community support",
      "1GB storage",
    ],
  },
  {
    name: "Pro",
    price: 29,
    highlighted: true,
    features: [
      "Unlimited team members",
      "Advanced analytics",
      "Priority support",
      "100GB storage",
      "Custom integrations",
    ],
  },
  {
    name: "Enterprise",
    price: 99,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SLA guarantee",
      "Unlimited storage",
      "On-premise deployment",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote: "This platform transformed how we manage our business. The time savings alone have been worth it.",
    author: "Sarah Chen",
    role: "CEO",
    company: "TechStart Inc",
  },
  {
    quote: "The best developer experience I've had. Everything just works, and the documentation is excellent.",
    author: "Marcus Johnson",
    role: "Lead Developer",
    company: "BuildFast",
  },
  {
    quote: "We cut our development time in half. The integrations work seamlessly with our existing tools.",
    author: "Emily Rodriguez",
    role: "CTO",
    company: "ScaleUp",
  },
];

const FAQ_ITEMS = [
  {
    question: "How do I get started?",
    answer: "Simply sign up for a free account and you'll be guided through the setup process. No credit card required for the Starter plan.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Yes, you can change your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes! All paid plans come with a 14-day free trial. You can explore all features before committing.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer community support for Starter plans, priority email support for Pro, and dedicated account managers for Enterprise customers.",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Nav 
        projectName={PROJECT_NAME} 
        links={["Features", "Pricing", "About"]}
      />
      
      <Hero
        title="Build Your SaaS Faster Than Ever"
        subtitle="The complete platform for launching your next big idea. From authentication to payments, everything you need in one place."
        ctaText="Get Started Free"
        ctaSecondaryText="View Demo"
      />
      
      <FeatureCards
        title="Everything You Need to Scale"
        features={FEATURES}
        columns={3}
      />
      
      <Testimonials
        testimonials={TESTIMONIALS}
        title="Loved by Teams Worldwide"
      />
      
      <PricingTable
        title="Simple, Transparent Pricing"
        plans={PRICING_PLANS}
        showToggle={true}
      />
      
      <FAQ
        title="Got Questions?"
        items={FAQ_ITEMS}
        layout="accordion"
      />
      
      <CTA
        title="Ready to Get Started?"
        subtitle="Join thousands of teams already using our platform to build better products."
        buttonText="Start Your Free Trial"
        variant="gradient"
      />
      
      <Footer
        projectName={PROJECT_NAME}
        links={["Privacy", "Terms", "Contact"]}
        description="Building the future of SaaS, one feature at a time."
      />
    </div>
  );
}
