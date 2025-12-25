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
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Visual Configurator",
    description: "Point-and-click project setup. Select features, integrations, and AI providers visually.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
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
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
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

export default function PlatformPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">Framework</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition">How it Works</a>
            <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 transition">Testimonials</a>
            <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900 transition">My Projects</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/configure">
              <Button size="sm" className="bg-[#0052FF] hover:bg-[#0052FF]/90">
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0052FF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF]/20 border-0">
              <Sparkles className="mr-1 h-3 w-3" />
              Now with AI Context Generation
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              Build Production Apps
              <br />
              <span className="text-[#0052FF]">In Minutes, Not Months</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Visual project configurator with battle-tested integrations. 
              Export complete ownership via NPX. Zero vendor lock-in.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/configure">
                <Button size="lg" className="bg-[#0052FF] hover:bg-[#0052FF]/90 h-14 px-8 text-lg">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg group">
                <Play className="mr-2 h-5 w-5 group-hover:text-[#0052FF] transition" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-400 text-center">
                    framework.dawson.dev/configure
                  </div>
                </div>
              </div>
              
              {/* Screenshot placeholder */}
              <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0052FF]/20 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-[#0052FF]" />
                  </div>
                  <p className="text-slate-400 text-sm">Visual Configurator Preview</p>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-xl p-4 border border-slate-200 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Auth Ready</div>
                  <div className="text-xs text-slate-500">Supabase configured</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 top-1/3 bg-white rounded-xl shadow-xl p-4 border border-slate-200 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Payments Ready</div>
                  <div className="text-xs text-slate-500">Stripe integrated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-[#0052FF]/10 text-[#0052FF] border-0">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Ship Fast
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
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
            <Badge className="mb-4 bg-[#0052FF]/10 text-[#0052FF] border-0">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
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
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200" />
                )}
                
                <div className={`relative z-10 w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all ${
                  activeStep === index 
                    ? 'bg-[#0052FF] shadow-lg shadow-[#0052FF]/25' 
                    : 'bg-slate-100'
                }`}>
                  <step.icon className={`h-7 w-7 ${activeStep === index ? 'text-white' : 'text-slate-500'}`} />
                </div>
                
                <div className="text-sm font-bold text-[#0052FF] mb-2">{step.number}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/10 text-white border-0">Why Framework?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Own Your Code, Not Just Rent It
            </h2>
            <p className="text-xl text-slate-400">
              Unlike other platforms, we give you complete ownership from day one.
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700">
            <div className="grid grid-cols-3 p-4 border-b border-slate-700 bg-slate-800">
              <div className="text-slate-400 font-medium">Feature</div>
              <div className="text-center font-bold text-[#0052FF]">Framework</div>
              <div className="text-center text-slate-400">Others</div>
            </div>
            
            {comparisons.map((item, index) => (
              <div 
                key={item.feature}
                className={`grid grid-cols-3 p-4 ${index !== comparisons.length - 1 ? 'border-b border-slate-700/50' : ''}`}
              >
                <div className="text-slate-300">{item.feature}</div>
                <div className="text-center">
                  {item.us ? (
                    <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </div>
                <div className="text-center">
                  {item.them ? (
                    <Check className="h-5 w-5 text-slate-500 mx-auto" />
                  ) : (
                    <span className="text-slate-600">—</span>
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
            <Badge className="mb-4 bg-[#0052FF]/10 text-[#0052FF] border-0">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
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
                  <p className="text-slate-600 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#0052FF]">
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
              <Button size="lg" className="bg-white text-[#0052FF] hover:bg-white/90 h-14 px-8 text-lg">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com/jrdaws/dawson-does-framework">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg">
                View on GitHub
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">Framework</span>
              </Link>
              <p className="text-slate-400 text-sm">
                Build production apps in minutes with complete code ownership.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/configure" className="hover:text-white transition">Configurator</Link></li>
                <li><Link href="/projects" className="hover:text-white transition">My Projects</Link></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://github.com/jrdaws/dawson-does-framework" className="hover:text-white transition">Documentation</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework" className="hover:text-white transition">GitHub</a></li>
                <li><a href="https://www.npmjs.com/package/@jrdaws/framework" className="hover:text-white transition">npm</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/blob/main/LICENSE" className="hover:text-white transition">License (MIT)</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2024 Framework. Built with ❤️ for developers.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>v0.3.1</span>
              <span className="text-emerald-400">192 tests passing</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

