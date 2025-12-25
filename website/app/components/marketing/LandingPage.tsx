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

// Hero Section
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="mb-6 px-4 py-2 text-sm bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30">
            <Sparkles className="h-3 w-3 mr-2" />
            AI-Powered Project Generator
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Build Your{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300 bg-clip-text text-transparent">
              Dream App
            </span>
            <br />
            in 5 Days
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Configure your project visually, export with one click, and get a 
            production-ready codebase optimized for AI-assisted development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="h-14 px-8 text-lg gap-2 bg-orange-600 hover:bg-orange-500" asChild>
              <Link href="/configure">
                Start Building
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 border-stone-700 text-stone-300 hover:bg-stone-800" asChild>
              <a href="https://github.com/jrdaws/dawson-does-framework" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-600 to-stone-700 border-2 border-stone-900" />
                ))}
              </div>
              <span>500+ developers</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-400/20 rounded-2xl blur-xl" />
          <div className="relative bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-stone-800/50 border-b border-stone-700">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-stone-900 rounded-md text-xs text-stone-500">
                  dawson.does/configure
                </div>
              </div>
            </div>
            {/* Screenshot placeholder */}
            <div className="aspect-video bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 flex items-center justify-center">
              <div className="text-center">
                <Layers className="h-16 w-16 text-stone-700 mx-auto mb-4" />
                <p className="text-stone-600">Visual Project Configurator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Value Props Section
function ValuePropsSection() {
  const props = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "5-Day Sprint",
      description: "Go from idea to deployed app in just 5 days with our guided workflow.",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Optimized",
      description: "Generated code is structured for Cursor AI and Claude Code workflows.",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Full Ownership",
      description: "Export everything. No lock-in. Your code, your infrastructure, forever.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {props.map((prop, i) => (
            <Card key={i} className="border-0 shadow-lg shadow-stone-200/50 hover:shadow-xl transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6", prop.bgColor, prop.color)}>
                  {prop.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{prop.title}</h3>
                <p className="text-stone-600">{prop.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section
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
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1">Features</Badge>
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            A complete toolkit for building production-ready applications with AI assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((section, i) => (
            <div key={i} className="space-y-6">
              <h3 className="text-lg font-semibold text-stone-900">{section.category}</h3>
              <div className="space-y-4">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-50 shadow-sm flex items-center justify-center text-orange-600">
                      {item.icon}
                    </div>
                    <span className="text-stone-700">{item.text}</span>
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

// How It Works Section
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
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1">How It Works</Badge>
          <h2 className="text-4xl font-bold mb-4">Four Steps to Launch</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            From idea to deployed application in record time.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-200 to-orange-100" />
              )}
              
              <div className="relative text-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-center mx-auto mb-6 text-orange-600">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-orange-600 mb-2">{step.number}</div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-stone-600 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Tech Stack Section
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
    <section className="py-24 bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1 bg-stone-800 text-stone-300 border-stone-700">Tech Stack</Badge>
          <h2 className="text-4xl font-bold mb-4">Best-in-Class Technologies</h2>
          <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Built with the modern stack that top developers love.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stacks.map((tech, i) => (
            <div key={i} className="p-6 bg-stone-800/50 rounded-xl border border-stone-700 hover:border-stone-600 transition-colors text-center">
              <div className="text-2xl font-bold mb-1">{tech.name}</div>
              <div className="text-sm text-stone-500">{tech.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Preview Section
function PricingPreviewSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1">Pricing</Badge>
          <h2 className="text-4xl font-bold mb-4">Start Free, Scale When Ready</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
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
                <span className="text-4xl font-bold">$0</span>
                <span className="text-stone-500">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {["Visual configurator", "All templates", "NPX export", "Community support"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant="outline" asChild>
                <Link href="/configure">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className="relative border-orange-200 shadow-lg shadow-orange-100/50">
            <div className="absolute -top-3 left-1/2 -transtone-x-1/2">
              <Badge className="bg-orange-600">Most Popular</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For serious builders</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-stone-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {["Everything in Free", "Cloud project sync", "Team collaboration", "Priority support", "Custom templates"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6 bg-orange-600 hover:bg-orange-500" asChild>
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
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {["Everything in Pro", "SSO integration", "Custom integrations", "Dedicated support", "SLA guarantee"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">{item}</span>
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

// CTA Section
function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Build Something Amazing?
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          Join hundreds of developers who ship faster with Dawson Does Framework.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-14 px-8 text-lg gap-2 bg-stone-50 text-orange-600 hover:bg-stone-100" asChild>
            <Link href="/configure">
              Start Building Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2 border-white/30 text-white hover:bg-stone-50/10" asChild>
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

// Footer
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Templates", "Changelog"],
    Resources: ["Documentation", "Guides", "Blog", "Support"],
    Company: ["About", "Careers", "Contact", "Legal"],
    Connect: ["Twitter", "GitHub", "Discord", "YouTube"],
  };

  return (
    <footer className="bg-stone-950 text-stone-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-bold text-white mb-4">Dawson Does</div>
            <p className="text-sm">
              Build production-ready apps with AI-assisted development.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            © {new Date().getFullYear()} Dawson Does. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm hover:text-white">Privacy</a>
            <a href="#" className="text-sm hover:text-white">Terms</a>
            <a href="#" className="text-sm hover:text-white">Cookies</a>
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

