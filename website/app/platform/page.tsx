"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Shield,
  GitBranch,
  Terminal,
  Layers,
  Code2,
  Rocket,
  Clock,
  Users,
  Star,
  ChevronRight,
  Play,
  DollarSign,
  Timer,
  Puzzle,
  TrendingDown,
  X,
  Github,
  Package,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Visual Configurator",
    description: "Point-and-click project setup. Select features, integrations, and AI providers visually.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    icon: Zap,
    title: "Instant Export",
    description: "One NPX command generates your entire project. Full ownership, zero lock-in.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Battle-Tested Integrations",
    description: "Supabase, Stripe, OpenAI, Vercel, and more. Pre-configured and ready to deploy.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: GitBranch,
    title: "AI-Ready Context",
    description: "Generate .dd/ context files that help Claude and Cursor understand your project instantly.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Terminal,
    title: "Powerful CLI",
    description: "Health checks, drift detection, and export commands. Built for developer experience.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Layers,
    title: "Feature Modules",
    description: "Auth, payments, analytics, storage, AI - compose exactly what you need.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

const steps = [
  {
    number: "01",
    title: "Configure",
    description: "Choose your template, features, and integrations using our visual builder.",
    icon: Sparkles,
  },
  {
    number: "02", 
    title: "Connect",
    description: "Set up your tools - Cursor, GitHub, Supabase, Vercel - with guided setup.",
    icon: GitBranch,
  },
  {
    number: "03",
    title: "Export",
    description: "Run the NPX command and get your full project locally. You own everything.",
    icon: Terminal,
  },
  {
    number: "04",
    title: "Ship",
    description: "Deploy to Vercel in one click. Your app is live in minutes, not months.",
    icon: Rocket,
  },
];

const stats = [
  { value: "5min", label: "Setup Time" },
  { value: "192", label: "Tests Passing" },
  { value: "100%", label: "Code Ownership" },
  { value: "0", label: "Lock-in" },
];

// Company logos for social proof
const trustedCompanies = [
  { name: "Vercel", logo: "/images/logos/vercel.svg" },
  { name: "Supabase", logo: "/images/logos/supabase.svg" },
  { name: "Stripe", logo: "/images/logos/stripe.svg" },
  { name: "OpenAI", logo: "/images/logos/openai.svg" },
  { name: "GitHub", logo: "/images/logos/github.svg" },
  { name: "PostHog", logo: "/images/logos/posthog.svg" },
];

const testimonials = [
  {
    quote: "Saved us 3 weeks of boilerplate. The Supabase + Stripe integration just works.",
    name: "Alex Chen",
    role: "Founder, TechStartup",
    avatar: "/images/redesign/avatars/avatar-placeholder-1.webp",
  },
  {
    quote: "Finally a scaffolder that doesn't make me rip it out after day one.",
    name: "Sarah Miller",
    role: "Senior Developer",
    avatar: "/images/redesign/avatars/avatar-placeholder-2.webp",
  },
  {
    quote: "The AI context files are genius. Claude understands my project instantly.",
    name: "Marcus Johnson",
    role: "Indie Hacker",
    avatar: "/images/redesign/avatars/avatar-placeholder-3.webp",
  },
];

const comparisons = [
  { feature: "Full code ownership", us: true, them: false },
  { feature: "No vendor lock-in", us: true, them: false },
  { feature: "AI-ready context files", us: true, them: false },
  { feature: "Visual configurator", us: true, them: true },
  { feature: "Battle-tested integrations", us: true, them: true },
  { feature: "One-click deploy", us: true, them: true },
  { feature: "Export to local", us: true, them: false },
  { feature: "Customize everything", us: true, them: false },
];

// Value comparison data
const valueMetrics = [
  {
    icon: Timer,
    title: "Development Time",
    withFramework: "5 minutes",
    withoutFramework: "3-4 weeks",
    savings: "99%",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
  },
  {
    icon: DollarSign,
    title: "Development Cost",
    withFramework: "$0",
    withoutFramework: "$5,000-15,000",
    savings: "100%",
    color: "text-[#F97316]",
    bgColor: "bg-[#F97316]",
  },
  {
    icon: Puzzle,
    title: "Integration Complexity",
    withFramework: "Pre-configured",
    withoutFramework: "Manual setup",
    savings: "90%",
    color: "text-orange-400",
    bgColor: "bg-orange-400",
  },
];

const buildFromScratchTasks = [
  { task: "Set up Next.js project", time: "30 min", done: true },
  { task: "Configure TypeScript", time: "15 min", done: true },
  { task: "Set up Tailwind CSS", time: "20 min", done: true },
  { task: "Integrate Supabase auth", time: "4-8 hours", done: false },
  { task: "Implement Stripe billing", time: "8-16 hours", done: false },
  { task: "Add PostHog analytics", time: "2-4 hours", done: false },
  { task: "Configure file storage", time: "2-4 hours", done: false },
  { task: "Set up OpenAI/Anthropic", time: "2-4 hours", done: false },
  { task: "Create .env templates", time: "1 hour", done: false },
  { task: "Write documentation", time: "4-8 hours", done: false },
  { task: "Set up health checks", time: "2-4 hours", done: false },
  { task: "Create deployment config", time: "2-4 hours", done: false },
];

export default function PlatformPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-stone-900">Framework</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-stone-600 hover:text-stone-900 transition">Features</a>
            <a href="#how-it-works" className="text-sm text-stone-600 hover:text-stone-900 transition">How it Works</a>
            <a href="#testimonials" className="text-sm text-stone-600 hover:text-stone-900 transition">Testimonials</a>
            <Link href="/projects" className="text-sm text-stone-600 hover:text-stone-900 transition">My Projects</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/configure">
              <Button size="sm" className="bg-[#F97316] hover:bg-[#F97316]/90">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F97316]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-400/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 border-0">
              <Sparkles className="mr-1 h-3 w-3" />
              Now with AI Context Generation
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold text-stone-900 mb-6 leading-tight tracking-tight">
              Build Production Apps
              <br />
              <span className="text-[#F97316]">In Minutes, Not Months</span>
            </h1>

            <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto">
              Visual project configurator with battle-tested integrations. 
              Export complete ownership via NPX. Zero vendor lock-in.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/configure">
                <Button size="lg" className="bg-[#F97316] hover:bg-[#F97316]/90 h-14 px-8 text-lg">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg group">
                <Play className="mr-2 h-5 w-5 group-hover:text-[#F97316] transition" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-stone-900">{stat.value}</div>
                  <div className="text-sm text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* GitHub & npm Badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <a
                href="https://github.com/jrdaws/dawson-does-framework"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
                <span className="px-2 py-0.5 bg-stone-50/20 rounded-full text-xs">⭐ 128+</span>
              </a>
              <a
                href="https://www.npmjs.com/package/@jrdaws/framework"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#CB3837] text-white rounded-full text-sm font-medium hover:bg-[#CB3837]/90 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>npm</span>
                <span className="px-2 py-0.5 bg-stone-50/20 rounded-full text-xs">
                  <Download className="inline h-3 w-3 mr-1" />
                  1.2k/week
                </span>
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="bg-stone-900 rounded-2xl shadow-2xl overflow-hidden border border-stone-800">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-stone-800 border-b border-stone-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-stone-700 rounded-md px-3 py-1.5 text-xs text-stone-400 text-center">
                    framework.dawson.dev/configure
                  </div>
                </div>
              </div>
              
              {/* Screenshot placeholder */}
              <div className="aspect-[16/9] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#F97316]/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-[#F97316]" />
                  </div>
                  <p className="text-stone-400 text-sm">Visual Configurator Preview</p>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -left-4 top-1/4 bg-stone-50 rounded-xl shadow-xl p-4 border border-stone-200 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Auth Ready</div>
                  <div className="text-xs text-stone-500">Supabase configured</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 top-1/3 bg-stone-50 rounded-xl shadow-xl p-4 border border-stone-200 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-400/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Payments Ready</div>
                  <div className="text-xs text-stone-500">Stripe integrated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 border-b border-stone-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">
              Built with technologies trusted by millions of developers
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {trustedCompanies.map((company) => (
              <div
                key={company.name}
                className="flex items-center justify-center h-10 grayscale hover:grayscale-0 transition-all duration-300"
              >
                {/* Logo placeholder - will use actual SVGs when available */}
                <div className="flex items-center gap-2 text-stone-600 font-semibold">
                  <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center">
                    {company.name === "GitHub" && <Github className="h-5 w-5" />}
                    {company.name === "Vercel" && <span className="text-xs font-bold">▲</span>}
                    {company.name === "Supabase" && <span className="text-xs font-bold">⚡</span>}
                    {company.name === "Stripe" && <span className="text-xs font-bold">S</span>}
                    {company.name === "OpenAI" && <span className="text-xs font-bold">◎</span>}
                    {company.name === "PostHog" && <span className="text-xs font-bold">🦔</span>}
                  </div>
                  <span className="hidden md:inline">{company.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Developer Count Badge */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-stone-50 rounded-full border border-stone-200">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-medium text-stone-600">
                  +42
                </div>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-stone-900">500+</span>
                <span className="text-stone-600"> developers building with Framework</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#F97316]/10 text-[#F97316] border-0">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Everything You Need to Ship Fast
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              From visual configuration to production deployment, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{feature.title}</h3>
                  <p className="text-stone-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#F97316]/10 text-[#F97316] border-0">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              From Idea to Production in 4 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative text-center"
                onMouseEnter={() => setActiveStep(index)}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-stone-200" />
                )}
                
                <div className={`relative z-10 w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all ${
                  activeStep === index 
                    ? 'bg-[#F97316] shadow-lg shadow-[#F97316]/25' 
                    : 'bg-stone-100'
                }`}>
                  <step.icon className={`h-7 w-7 ${activeStep === index ? 'text-white' : 'text-stone-500'}`} />
                </div>
                
                <div className="text-sm font-bold text-[#F97316] mb-2">{step.number}</div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Comparison Section */}
      <section id="value" className="py-24 px-4 bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-0">
              <TrendingDown className="mr-1 h-3 w-3" />
              Value Comparison
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Save Weeks of Development Time
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              See exactly how much time, money, and effort you save compared to building from scratch.
            </p>
          </div>

          {/* Savings Metrics */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {valueMetrics.map((metric) => (
              <Card key={metric.title} className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className={`${metric.bgColor} p-6 text-white`}>
                    <metric.icon className="h-8 w-8 mb-3" />
                    <div className="text-4xl font-bold mb-1">{metric.savings}</div>
                    <div className="text-white/80">Time/Cost Savings</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-stone-900 mb-4">{metric.title}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">With Framework</span>
                        <span className="font-semibold text-emerald-600">{metric.withFramework}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">From Scratch</span>
                        <span className="font-semibold text-red-500 line-through">{metric.withoutFramework}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Side by Side Comparison */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* With Framework */}
            <Card className="border-2 border-[#F97316] shadow-lg shadow-[#F97316]/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316] flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">With Framework</h3>
                    <p className="text-sm text-emerald-600 font-medium">~ 5 minutes total</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-stone-700">Run one NPX command</span>
                    <span className="ml-auto text-xs text-emerald-600 font-medium">1 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-stone-700">All integrations pre-configured</span>
                    <span className="ml-auto text-xs text-emerald-600 font-medium">0 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-stone-700">Add your API keys</span>
                    <span className="ml-auto text-xs text-emerald-600 font-medium">2 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-stone-700">Deploy to Vercel</span>
                    <span className="ml-auto text-xs text-emerald-600 font-medium">2 min</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#F97316]/5 rounded-lg border border-[#F97316]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-900">Total Time</span>
                    <span className="text-2xl font-bold text-[#F97316]">~5 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Without Framework */}
            <Card className="border border-stone-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-stone-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">Building From Scratch</h3>
                    <p className="text-sm text-red-500 font-medium">~ 40-80 hours total</p>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                  {buildFromScratchTasks.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-2.5 rounded-lg ${
                        item.done ? 'bg-stone-50' : 'bg-red-50'
                      }`}
                    >
                      {item.done ? (
                        <Check className="h-4 w-4 text-stone-400 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${item.done ? 'text-stone-500' : 'text-stone-700'}`}>
                        {item.task}
                      </span>
                      <span className={`ml-auto text-xs font-medium ${
                        item.done ? 'text-stone-400' : 'text-red-500'
                      }`}>
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-900">Total Time</span>
                    <span className="text-2xl font-bold text-red-500">40-80 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-stone-600 mb-4">
              That's <span className="font-bold text-[#F97316]">480x faster</span> than building from scratch.
            </p>
            <Link href="/configure">
              <Button size="lg" className="bg-[#F97316] hover:bg-[#F97316]/90">
                Start Saving Time Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-stone-50/10 text-white border-0">Why Framework?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Own Your Code, Not Just Rent It
            </h2>
            <p className="text-xl text-stone-400">
              Unlike other platforms, we give you complete ownership from day one.
            </p>
          </div>

          <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-stone-700">
            <div className="grid grid-cols-3 p-4 border-b border-stone-700 bg-stone-800">
              <div className="text-stone-400 font-medium">Feature</div>
              <div className="text-center font-bold text-[#F97316]">Framework</div>
              <div className="text-center text-stone-400">Others</div>
            </div>
            
            {comparisons.map((item, index) => (
              <div 
                key={item.feature}
                className={`grid grid-cols-3 p-4 ${index !== comparisons.length - 1 ? 'border-b border-stone-700/50' : ''}`}
              >
                <div className="text-stone-300">{item.feature}</div>
                <div className="text-center">
                  {item.us ? (
                    <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                  ) : (
                    <span className="text-stone-500">—</span>
                  )}
                </div>
                <div className="text-center">
                  {item.them ? (
                    <Check className="h-5 w-5 text-stone-500 mx-auto" />
                  ) : (
                    <span className="text-stone-600">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#F97316]/10 text-[#F97316] border-0">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Loved by Developers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-stone-600 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-stone-900">{testimonial.name}</div>
                      <div className="text-sm text-stone-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#F97316]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Ship Your Next Project?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join developers who are building production apps in minutes, not months.
            Start free, no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/configure">
              <Button size="lg" className="bg-stone-50 text-[#F97316] hover:bg-stone-50/90 h-14 px-8 text-lg">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com/jrdaws/dawson-does-framework">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-stone-50/10 h-14 px-8 text-lg">
                View on GitHub
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Framework</span>
              </Link>
              <p className="text-stone-400 text-sm">
                Build production apps in minutes with complete code ownership.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><Link href="/configure" className="hover:text-white transition">Configurator</Link></li>
                <li><Link href="/projects" className="hover:text-white transition">My Projects</Link></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><a href="https://github.com/jrdaws/dawson-does-framework" className="hover:text-white transition">Documentation</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework" className="hover:text-white transition">GitHub</a></li>
                <li><a href="https://www.npmjs.com/package/@jrdaws/framework" className="hover:text-white transition">npm</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-stone-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/blob/main/LICENSE" className="hover:text-white transition">License (MIT)</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-stone-500">
              © 2024 Framework. Built with ❤️ for developers.
            </p>
            <div className="flex items-center gap-6 text-sm text-stone-500">
              <span>v0.3.1</span>
              <span className="text-emerald-400">192 tests passing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

