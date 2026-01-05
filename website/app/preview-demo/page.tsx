"use client";

import { MultiPagePreview } from "@/app/components/preview";
import type { PreviewComposition } from "@/app/components/preview/types";

// Demo composition data
const DEMO_COMPOSITION: PreviewComposition = {
  id: "demo-1",
  projectName: "TaskFlow",
  theme: {
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    textColor: "#1e293b",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem",
  },
  navigation: [
    { label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
    { label: "Login", path: "/login" },
  ],
  pages: [
    {
      id: "home",
      path: "/",
      name: "Home",
      type: "home",
      components: [
        {
          id: "hero-1",
          type: "hero",
          props: {
            headline: "Streamline Your Workflow with TaskFlow",
            subheadline:
              "The all-in-one project management tool that helps teams collaborate, track progress, and deliver results faster.",
            ctaText: "Start Free Trial",
            ctaLink: "/signup",
          },
        },
        {
          id: "features-1",
          type: "features",
          props: {
            title: "Why Teams Love TaskFlow",
            features: [
              {
                title: "Real-time Collaboration",
                description: "Work together seamlessly with live updates and instant sync.",
                icon: "👥",
              },
              {
                title: "Smart Automation",
                description: "Automate repetitive tasks and focus on what matters.",
                icon: "🤖",
              },
              {
                title: "Powerful Analytics",
                description: "Get insights into team performance and project health.",
                icon: "📊",
              },
            ],
          },
        },
        {
          id: "cta-1",
          type: "cta",
          props: {
            headline: "Ready to Transform Your Workflow?",
            subheadline: "Join 10,000+ teams already using TaskFlow.",
            ctaText: "Get Started Free",
            ctaLink: "/signup",
          },
        },
      ],
    },
    {
      id: "features",
      path: "/features",
      name: "Features",
      type: "landing",
      components: [
        {
          id: "hero-2",
          type: "hero",
          props: {
            headline: "Powerful Features for Modern Teams",
            subheadline:
              "Everything you need to manage projects, collaborate with your team, and deliver on time.",
            ctaText: "See Pricing",
            ctaLink: "/pricing",
          },
        },
        {
          id: "features-2",
          type: "features",
          props: {
            title: "Core Features",
            features: [
              {
                title: "Task Management",
                description: "Create, assign, and track tasks with ease.",
                icon: "✅",
              },
              {
                title: "Team Chat",
                description: "Built-in messaging for quick communication.",
                icon: "💬",
              },
              {
                title: "File Sharing",
                description: "Share and collaborate on documents.",
                icon: "📁",
              },
              {
                title: "Time Tracking",
                description: "Track time spent on tasks and projects.",
                icon: "⏱️",
              },
              {
                title: "Integrations",
                description: "Connect with your favorite tools.",
                icon: "🔗",
              },
              {
                title: "Mobile Apps",
                description: "Work from anywhere with our mobile apps.",
                icon: "📱",
              },
            ],
          },
        },
      ],
    },
    {
      id: "pricing",
      path: "/pricing",
      name: "Pricing",
      type: "pricing",
      components: [
        {
          id: "hero-3",
          type: "hero",
          props: {
            headline: "Simple, Transparent Pricing",
            subheadline: "Choose the plan that works for your team. No hidden fees.",
            ctaText: "Contact Sales",
            ctaLink: "/contact",
          },
        },
        {
          id: "pricing-1",
          type: "pricing",
          props: {
            title: "Plans for Every Team",
            plans: [
              {
                name: "Starter",
                price: "$9",
                features: ["Up to 5 team members", "Basic task management", "Email support"],
              },
              {
                name: "Professional",
                price: "$29",
                features: [
                  "Up to 25 team members",
                  "Advanced features",
                  "Priority support",
                  "API access",
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: [
                  "Unlimited team members",
                  "Custom integrations",
                  "Dedicated support",
                  "SLA guarantee",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "about",
      path: "/about",
      name: "About",
      type: "about",
      components: [
        {
          id: "hero-4",
          type: "hero",
          props: {
            headline: "Built by People Who Get Work Done",
            subheadline:
              "We're a team of designers, developers, and productivity enthusiasts on a mission to make work better.",
            ctaText: "Join Our Team",
            ctaLink: "/careers",
          },
        },
        {
          id: "testimonials-1",
          type: "testimonials",
          props: {
            testimonials: [
              {
                quote:
                  "TaskFlow has completely transformed how our team works. We're more productive than ever.",
                author: "Sarah Chen",
                role: "VP of Engineering, TechCorp",
              },
              {
                quote:
                  "The best project management tool we've ever used. Simple, powerful, and beautiful.",
                author: "Michael Rivera",
                role: "Product Lead, StartupXYZ",
              },
            ],
          },
        },
      ],
    },
    {
      id: "login",
      path: "/login",
      name: "Login",
      type: "auth",
      metadata: { protected: false },
      components: [
        {
          id: "hero-5",
          type: "hero",
          props: {
            headline: "Welcome Back",
            subheadline: "Log in to your TaskFlow account to continue where you left off.",
            ctaText: "Sign In",
            ctaLink: "#",
          },
        },
      ],
    },
    {
      id: "dashboard",
      path: "/dashboard",
      name: "Dashboard",
      type: "dashboard",
      metadata: { protected: true },
      components: [
        {
          id: "hero-6",
          type: "hero",
          props: {
            headline: "Your Dashboard",
            subheadline: "Track your projects, tasks, and team activity all in one place.",
            ctaText: "Create Project",
            ctaLink: "#",
          },
        },
        {
          id: "features-3",
          type: "features",
          props: {
            title: "Quick Actions",
            features: [
              { title: "Active Projects", description: "12 projects in progress", icon: "📁" },
              { title: "Pending Tasks", description: "24 tasks due this week", icon: "✅" },
              { title: "Team Activity", description: "8 updates today", icon: "👥" },
            ],
          },
        },
      ],
    },
  ],
};

export default function PreviewDemoPage() {
  return (
    <div className="h-screen bg-slate-950 p-4">
      <MultiPagePreview
        composition={DEMO_COMPOSITION}
        initialPath="/"
        initialDevice="desktop"
        showMinimap={true}
        showFlowDiagram={true}
        className="h-full"
      />
    </div>
  );
}

