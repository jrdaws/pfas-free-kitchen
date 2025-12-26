"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  Download,
  Github,
  Layers,
  Lightbulb,
  MousePointer,
  Palette,
  Rocket,
  Sparkles,
  Terminal,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  Play,
  ExternalLink,
} from "lucide-react";

// Hero Section - Navy gradient with orange glow (60% dark)
function HeroSection() {
  return (
    <section className="hero-section relative overflow-hidden text-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Glowing orbs - Orange accent (10%) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="hero-badge mb-6 px-4 py-2 text-sm">
            <Sparkles className="h-3 w-3 mr-2" />
            AI-Powered Project Generator
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
            Build Your{" "}
            <span className="text-primary">
              Dream App
            </span>
            <br />
            in 5 Days
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-foreground-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Configure your project visually, export with one click, and get a 
            production-ready codebase optimized for AI-assisted development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="h-14 px-8 text-lg gap-2" asChild>
              <Link href="/configure">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2" asChild>
              <a href="https://github.com/jrdaws/dawson-does-framework" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-foreground-muted">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover border-2 border-background" />
                ))}
              </div>
              <span>500+ developers</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-warning text-warning" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Hero Visual - Terminal mockup */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl" />
          <div className="terminal relative">
            {/* Browser Chrome */}
            <div className="terminal-header">
              <div className="flex gap-2">
                <div className="terminal-dot red" />
                <div className="terminal-dot yellow" />
                <div className="terminal-dot green" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="terminal-title">
                  dawson.does/configure
                </div>
              </div>
            </div>
            {/* Screenshot placeholder */}
            <div className="aspect-video bg-background flex items-center justify-center">
              <div className="text-center">
                <Layers className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-secondary">Visual Project Configurator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Value Props Section - Dark cards with orange accents (30% slate)
function ValuePropsSection() {
  const props = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "5-Day Sprint",
      description: "Go from idea to deployed app in just 5 days with our guided workflow.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Optimized",
      description: "Generated code is structured for Cursor AI and Claude Code workflows.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Full Ownership",
      description: "Export everything. No lock-in. Your code, your infrastructure, forever.",
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <section className="section-alt py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <Card key={i} className="card-elevated">
              <CardContent className="pt-8 pb-6">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", prop.bgColor, prop.color)}>
                  {prop.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{prop.title}</h3>
                <p className="text-foreground-secondary">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section - Dark background (60% dark)
function FeaturesSection() {
  const features = [
    {
      category: "Visual Configuration",
      items: [
        { icon: <Palette />, text: "Drag & drop feature selection" },
        { icon: <Layers />, text: "Real-time preview of your project" },
        { icon: <Lightbulb />, text: "AI-powered recommendations" },
      ],
    },
    {
      category: "Modern Stack",
      items: [
        { icon: <Code2 />, text: "Next.js 15 + TypeScript" },
        { icon: <Shield />, text: "Supabase auth & database" },
        { icon: <Zap />, text: "Tailwind + shadcn/ui" },
      ],
    },
    {
      category: "AI-Ready",
      items: [
        { icon: <MousePointer />, text: "Cursor AI integration" },
        { icon: <Terminal />, text: "Claude Code context files" },
        { icon: <Sparkles />, text: "OpenAI/Anthropic/Google support" },
      ],
    },
  ];

  return (
    <section className="section-default py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="hero-badge mb-4 px-3 py-1">Features</Badge>
          <h2 className="text-4xl font-bold mb-4 text-foreground">Everything You Need</h2>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
            A complete toolkit for building production-ready applications with AI assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((section, i) => (
            <div key={i} className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">{section.category}</h3>
              <div className="space-y-4">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <span className="text-foreground-secondary">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section - Slate background (30% slate)
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Configure",
      description: "Select your template, features, and integrations using our visual configurator.",
      icon: <Layers className="h-8 w-8" />,
    },
    {
      number: "02",
      title: "Connect",
      description: "Set up your tools: Cursor, GitHub, Supabase, and Vercel with guided steps.",
      icon: <Zap className="h-8 w-8" />,
    },
    {
      number: "03",
      title: "Export",
      description: "Download your project or run the NPX command to scaffold instantly.",
      icon: <Download className="h-8 w-8" />,
    },
    {
      number: "04",
      title: "Build",
      description: "Open in Cursor and let AI help you customize and extend your app.",
      icon: <Rocket className="h-8 w-8" />,
    },
  ];

  return (
    <section className="section-alt py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="hero-badge mb-4 px-3 py-1">How It Works</Badge>
          <h2 className="text-4xl font-bold mb-4 text-foreground">Four Steps to Launch</h2>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
            From idea to deployed application in record time.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
              )}
              
              <div className="relative text-center">
                <div className="w-28 h-28 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-primary mb-2">{step.number}</div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{step.title}</h3>
                <p className="text-foreground-secondary text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Tech Stack Section - Navy background (60% dark)
function TechStackSection() {
  const stacks = [
    { name: "Next.js", category: "Framework" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind", category: "Styling" },
    { name: "shadcn/ui", category: "Components" },
    { name: "Supabase", category: "Backend" },
    { name: "Vercel", category: "Hosting" },
    { name: "Cursor", category: "IDE" },
    { name: "Claude", category: "AI" },
  ];

  return (
    <section className="hero-section py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="hero-badge mb-4 px-3 py-1">Tech Stack</Badge>
          <h2 className="text-4xl font-bold mb-4 text-foreground">Best-in-Class Technologies</h2>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
            Built with the modern stack that top developers love.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stacks.map((tech, i) => (
            <div key={i} className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors text-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="text-2xl font-bold mb-1 text-foreground">{tech.name}</div>
              <div className="text-sm text-foreground-muted">{tech.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Preview Section - Dark with slate cards (60% dark, 30% slate)
function PricingPreviewSection() {
  return (
    <section className="section-default py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="hero-badge mb-4 px-3 py-1">Pricing</Badge>
          <h2 className="text-4xl font-bold mb-4 text-foreground">Start Free, Scale When Ready</h2>
          <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
            The configurator is free. You only pay for the services you choose to use.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-foreground-muted">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {["Visual configurator", "All templates", "NPX export", "Community support"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/configure">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier - Highlighted with orange border */}
          <Card className="relative border-primary shadow-[0_8px_32px_rgba(249,115,22,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For serious builders</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-foreground">$29</span>
                <span className="text-foreground-muted">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {["Everything in Free", "Cloud project sync", "Team collaboration", "Priority support", "Custom templates"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" asChild>
                <Link href="/configure">Start Free Trial</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>For organizations</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold text-foreground">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {["Everything in Pro", "SSO integration", "Custom integrations", "Dedicated support", "SLA guarantee"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-success" />
                    <span className="text-sm text-foreground-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <a href="mailto:enterprise@dawson.does">Contact Sales</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// CTA Section - Orange accent (10% orange)
function CTASection() {
  return (
    <section className="cta-section py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
          Join hundreds of developers who ship faster with Dawson Does Framework.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-14 px-8 text-lg gap-2 bg-background text-primary hover:bg-card" asChild>
            <Link href="/configure">
              Start Building Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <a href="https://dawson.does/docs" target="_blank" rel="noopener noreferrer">
              Read the Docs
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Footer - Navy background (60% dark)
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Templates", "Changelog"],
    Resources: ["Documentation", "Guides", "Blog", "Support"],
    Company: ["About", "Careers", "Contact", "Legal"],
    Connect: ["Twitter", "GitHub", "Discord", "YouTube"],
  };

  return (
    <footer className="hero-section py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-foreground mb-4">Dawson Does</div>
            <p className="text-sm text-foreground-muted">
              Build production-ready apps with AI-assisted development.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-foreground font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-foreground-muted">
            © {new Date().getFullYear()} Dawson Does. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValuePropsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <PricingPreviewSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;

