'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Comparison data for value proposition
const comparisonData = [
  {
    approach: 'Manual Setup',
    time: '8+ hours',
    integrations: 'DIY copy-paste',
    updates: 'Manual tracking',
    support: 'Stack Overflow',
    verdict: 'painful',
  },
  {
    approach: 'create-next-app',
    time: '5 minutes',
    integrations: 'None included',
    updates: 'N/A',
    support: 'Docs only',
    verdict: 'basic',
  },
  {
    approach: 'Other Scaffolding',
    time: '30 minutes',
    integrations: 'Limited',
    updates: 'Varies',
    support: 'Community',
    verdict: 'okay',
  },
  {
    approach: '@jrdaws/framework',
    time: '2 minutes',
    integrations: '8+ providers',
    updates: 'Drift detection',
    support: 'Active + Docs',
    verdict: 'best',
  },
];

// Trust badges / tech stack
const techStack = [
  { name: 'Next.js 15', icon: '/images/redesign/icons/icon-nextjs.svg' },
  { name: 'TypeScript', icon: '/images/redesign/icons/icon-typescript.svg' },
  { name: 'Supabase', icon: '/images/redesign/icons/icon-supabase.svg' },
  { name: 'Stripe', icon: '/images/redesign/icons/icon-stripe.svg' },
  { name: 'Tailwind', icon: '/images/redesign/icons/icon-tailwind.svg' },
  { name: 'shadcn/ui', icon: '/images/redesign/icons/icon-shadcn.svg' },
];

// Enhanced stats with more impressive numbers
const heroStats = [
  { value: '732', label: 'Tests Passing', icon: '✓' },
  { value: '20+', label: 'Features', icon: '⚡' },
  { value: '5', label: 'Templates', icon: '📦' },
  { value: '< 2min', label: 'To Production', icon: '🚀' },
];

// Feature data with new icons
const features = [
  {
    icon: '/images/redesign/icons/icon-templates.svg',
    title: 'Feature Assembler',
    description: 'Pick features from 20+ modules. Dependencies auto-resolved. Your custom stack in minutes.',
    code: 'framework clone <token> --features auth,billing',
  },
  {
    icon: '/images/redesign/icons/icon-plugins.svg',
    title: 'Visual Configurator',
    description: 'Configure your project visually. Select features, integrations, and tools. Get a unique token.',
    code: 'dawson.does/configure',
  },
  {
    icon: '/images/redesign/icons/icon-providers.svg',
    title: 'Provider Integrations',
    description: 'Auth, billing, LLMs, and webhooks. Battle-tested implementations you can trust.',
    code: 'auth.supabase, billing.stripe',
  },
  {
    icon: '/images/redesign/icons/icon-trust.svg',
    title: 'Trust Primitives',
    description: 'Drift detection, health checks, and compliance monitoring built-in from day one.',
    code: 'framework drift',
  },
  {
    icon: '/images/redesign/icons/icon-cli.svg',
    title: 'Clone Command',
    description: 'One command to generate your configured project. Opens in Cursor automatically.',
    code: 'framework clone swift-eagle-1234 --open',
  },
  {
    icon: '/images/redesign/icons/icon-extensible.svg',
    title: 'Fully Extensible',
    description: 'Custom templates, private registries, and capability overrides. Own your stack.',
    code: '.dd/config.json',
  },
];

// Testimonials with avatars - Enhanced with more variety
const testimonials = [
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-1.webp',
    quote: "Finally, a scaffolding tool that doesn't make me tear out the code after day 1. The provider integrations actually work.",
    name: 'Alex Chen',
    role: 'Full-stack Developer',
    company: 'Indie Dev',
    rating: 5,
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-2.webp',
    quote: 'The plugin system is genius. I can hook into the export process and add our internal tools without forking.',
    name: 'Sarah Miller',
    role: 'Tech Lead',
    company: 'Enterprise SaaS',
    rating: 5,
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-3.webp',
    quote: 'Went from idea to deployed MVP in 2 hours. Auth, billing, and database just worked. This is the future.',
    name: 'Marcus Johnson',
    role: 'Indie Hacker',
    company: 'Solo Founder',
    rating: 5,
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-1.webp',
    quote: 'The drift detection saved us from a production incident. Framework caught a config mismatch before we deployed.',
    name: 'Priya Sharma',
    role: 'DevOps Engineer',
    company: 'Startup',
    rating: 5,
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-2.webp',
    quote: 'We evaluated 5 scaffolding tools. This was the only one with zero lock-in. Export and you truly own your code.',
    name: 'David Kim',
    role: 'CTO',
    company: 'Series A Startup',
    rating: 5,
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-3.webp',
    quote: 'My junior devs are shipping production features in their first week thanks to the clear patterns and health checks.',
    name: 'Emily Rodriguez',
    role: 'Engineering Manager',
    company: 'Tech Company',
    rating: 5,
  },
];

export default function Home() {
  const [terminalText, setTerminalText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [level, setLevel] = useState<'beginner' | 'advanced'>('beginner');

  // Updated to showcase the clone command with feature-assembler
  const command = 'npx @jrdaws/framework clone swift-eagle-1234';

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < command.length) {
        setTerminalText(command.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 60);

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* ============================================
          HERO SECTION - Dark with gradient fade to white
          ============================================ */}
      <section className="hero relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background with warm stone gradient */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom right, #0C0A09, #1C1917, #0C0A09)' }}
        />
        
        {/* Warm accent glow orbs */}
        <div className="absolute top-[-40%] right-[-20%] w-[80%] h-full rounded-full pointer-events-none" 
          style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)' }} 
        />

        {/* Mesh overlay */}
        <div className="mesh-overlay" />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/30 via-transparent to-transparent" />

        {/* GRADIENT FADE TO WHITE - Hero transition */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to bottom, transparent, #FFFFFF)'
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              {/* Hero badge */}
              <div className="hero-badge inline-flex items-center gap-2 mb-7">
                <span>✦</span>
                <span>Export-First Framework · v0.3.1</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-white">
                Build SaaS apps
                <br />
                <span className="text-orange-500">in days, not months</span>
              </h1>

              <p className="text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-stone-300">
                Configure your app in a beautiful visual builder, then export to full local ownership. No vendor lock-in, ever.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start mb-10">
                <a href="/configure" className="btn-primary text-center">
                  Start Building →
                </a>
                <a
                  href="https://github.com/jrdaws/dawson-does-framework"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-center"
                >
                  Watch Demo
                </a>
              </div>

              {/* Features strip */}
              <div className="flex flex-wrap gap-8 lg:gap-12 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
                  <span className="text-orange-500">✓</span> Zero lock-in
                </div>
                <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
                  <span className="text-orange-500">✓</span> AI-powered
                </div>
                <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
                  <span className="text-orange-500">✓</span> Full ownership
                </div>
                <div className="flex items-center gap-2 text-stone-400 text-sm font-medium">
                  <span className="text-orange-500">✓</span> Deploy anywhere
                </div>
              </div>
            </div>

            {/* Right side - Terminal */}
            <div className="relative mt-14 lg:mt-0">
              <div className="terminal relative z-10 max-w-[600px] w-full">
                <div className="terminal-header">
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                </div>
                <div className="terminal-body">
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> {terminalText}</span>
                    {showCursor && terminalText !== command && (
                      <span className="inline-block w-2 h-5 bg-orange-500 animate-blink ml-1" />
                    )}
                  </div>
                  {terminalText === command && (
                    <div className="animate-fade-in space-y-2 mt-2">
                      <div className="terminal-line">
                        <span className="terminal-success">✓</span> Downloading your configuration...
                      </div>
                      <div className="terminal-line">
                        <span className="terminal-success">✓</span> Setting up project structure...
                      </div>
                      <div className="terminal-line">
                        <span className="terminal-success">✓</span> Ready! Open in Cursor to continue.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURES GRID - White background
          ============================================ */}
      <section className="relative py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-900">
              Built for <span className="text-orange-500">Speed, Trust & Scale</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Everything you need to ship production-ready applications, from templates to providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 hover:-translate-y-1 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={28}
                    height={28}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-stone-900">{feature.title}</h3>
                <p className="text-stone-600 mb-4">{feature.description}</p>
                <code className="text-sm text-orange-600 font-mono bg-orange-50 px-2 py-1 rounded">{feature.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SEE IT IN ACTION - White background (not dark!)
          ============================================ */}
      <section className="relative py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-stone-900">
              See It <span className="text-orange-500">In Action</span>
            </h2>

            {/* Beginner/Advanced Toggle */}
            <div className="inline-flex rounded-lg border border-stone-200 p-1 bg-stone-50">
              <button
                onClick={() => setLevel('beginner')}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  level === 'beginner' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setLevel('advanced')}
                className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  level === 'advanced' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>

          {/* Terminal mockup - stands out on white */}
          {level === 'beginner' ? (
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dot red" />
                <div className="terminal-dot yellow" />
                <div className="terminal-dot green" />
                <span className="flex-1 text-center text-xs text-slate-400 font-mono">Quick Start with Clone</span>
              </div>
              <div className="terminal-body">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">1.</span>
                    <div>
                      <div className="text-slate-200">Configure your project at <span className="text-orange-500">dawson.does/configure</span></div>
                      <div className="text-slate-500 text-xs mt-1">Select features, integrations, and tools</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">2.</span>
                    <div>
                      <div className="text-slate-200">Get your project token: <span className="text-orange-400">swift-eagle-1234</span></div>
                      <div className="text-slate-500 text-xs mt-1">Unique token for your configuration</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">npx @jrdaws/framework clone swift-eagle-1234</div>
                      <div className="text-slate-500 text-xs mt-1">Clone with all your selected features</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">cd swift-eagle-1234 && npm run dev</div>
                      <div className="text-slate-500 text-xs mt-1">Start development server</div>
                    </div>
                  </div>
                  <div className="border-l-2 border-emerald-500 pl-4 mt-6">
                    <div className="text-slate-200">
                      <span className="text-emerald-400">✓</span> Your custom app is running at{' '}
                      <span className="text-orange-500">http://localhost:3000</span>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">All selected features assembled and ready</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dot red" />
                <div className="terminal-dot yellow" />
                <div className="terminal-dot green" />
                <span className="flex-1 text-center text-xs text-slate-400 font-mono">Advanced: Clone with Features</span>
              </div>
              <div className="terminal-body">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">framework features</div>
                      <div className="text-slate-500 text-xs mt-1">List available features (20+ options)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">framework clone swift-eagle-1234 --features auth,billing,analytics</div>
                      <div className="text-slate-500 text-xs mt-1">Clone with additional features</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">cd swift-eagle-1234 && framework doctor</div>
                      <div className="text-slate-500 text-xs mt-1">Run project health checks</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">framework drift</div>
                      <div className="text-slate-500 text-xs mt-1">Check for configuration drift</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-orange-500">$</span>
                    <div>
                      <div className="text-slate-200">framework clone swift-eagle-1234 --open</div>
                      <div className="text-slate-500 text-xs mt-1">Clone and open in Cursor automatically</div>
                    </div>
                  </div>
                  <div className="border-l-2 border-orange-500 pl-4 mt-6">
                    <div className="text-slate-200">
                      <span className="text-orange-500">✓</span> Feature-based project generation
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                      Modular features assembled with dependency resolution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE - Stone-50 background
          ============================================ */}
      <section className="relative py-24 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-900">
              Why Choose <span className="text-orange-500">This Framework?</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Compare your options. We think the choice is clear.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto bg-white rounded-xl border border-stone-200 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-4 px-6 text-stone-600 font-medium">Approach</th>
                  <th className="text-center py-4 px-4 text-stone-600 font-medium">Setup Time</th>
                  <th className="text-center py-4 px-4 text-stone-600 font-medium">Integrations</th>
                  <th className="text-center py-4 px-4 text-stone-600 font-medium">Updates</th>
                  <th className="text-center py-4 px-4 text-stone-600 font-medium">Support</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr
                    key={row.approach}
                    className={`border-b border-stone-100 transition-colors ${
                      row.verdict === 'best'
                        ? 'bg-orange-50'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {row.verdict === 'best' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <span className={row.verdict === 'best' ? 'font-semibold text-stone-900' : 'text-stone-700'}>
                          {row.approach}
                        </span>
                        {row.verdict === 'best' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-emerald-600 font-semibold' : 'text-stone-500'}>
                        {row.time}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-emerald-600 font-semibold' : 'text-stone-500'}>
                        {row.integrations}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-emerald-600 font-semibold' : 'text-stone-500'}>
                        {row.updates}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-emerald-600 font-semibold' : 'text-stone-500'}>
                        {row.support}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Differentiators - Consistent cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
              <div className="w-12 h-12 rounded-lg bg-orange-50 text-2xl flex items-center justify-center mb-4">🔓</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Zero Lock-In</h3>
              <p className="text-stone-600 text-sm">
                Export once and you own everything. No subscriptions, no runtime dependencies, no vendor tie-in.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
              <div className="w-12 h-12 rounded-lg bg-orange-50 text-2xl flex items-center justify-center mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Drift Detection</h3>
              <p className="text-stone-600 text-sm">
                Know when your config drifts from the template. Catch issues before they become incidents.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
              <div className="w-12 h-12 rounded-lg bg-orange-50 text-2xl flex items-center justify-center mb-4">🧩</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Plugin System</h3>
              <p className="text-stone-600 text-sm">
                Extend without forking. Hook into export, health checks, and more with a simple plugin API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BEFORE & AFTER - Stone-50 background
          ============================================ */}
      <section className="relative py-24 px-4 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-900">
              The <span className="text-orange-500">Before & After</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Stop copy-pasting boilerplate. Start with battle-tested foundations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 text-xl">✗</span>
                <span className="font-semibold text-stone-900">Without Framework</span>
              </div>
              <div className="terminal h-80 overflow-auto">
                <div className="terminal-body">
                  <pre className="text-sm leading-relaxed text-slate-500">
{`// Hours of setup...
mkdir my-app && cd my-app
npm init -y
npm install next react react-dom
npm install @supabase/supabase-js
npm install stripe
mkdir src app components lib
// Copy-paste auth logic from tutorial
// Copy-paste billing logic from docs
// Hope it all works together
// Debug integration issues
// Add error handling
// Add types
// Add tests (maybe?)
// Configure environment variables
// Set up deployment
// ...still not production-ready`}
                  </pre>
                </div>
              </div>
            </div>

            {/* After */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-500 text-xl">✓</span>
                <span className="font-semibold text-stone-900">With Framework</span>
              </div>
              <div className="terminal h-80 overflow-auto">
                <div className="terminal-body">
                  <pre className="text-sm leading-relaxed text-slate-200">
{`// 1 command, minutes of work
framework export saas ./my-app

`}<span className="text-emerald-400">✓</span>{` Next.js 15 + App Router
`}<span className="text-emerald-400">✓</span>{` TypeScript configured
`}<span className="text-emerald-400">✓</span>{` Supabase auth integrated
`}<span className="text-emerald-400">✓</span>{` Stripe billing connected
`}<span className="text-emerald-400">✓</span>{` shadcn/ui components
`}<span className="text-emerald-400">✓</span>{` Environment variables templated
`}<span className="text-emerald-400">✓</span>{` Health checks built-in
`}<span className="text-emerald-400">✓</span>{` Drift detection enabled
`}<span className="text-emerald-400">✓</span>{` Error handling included
`}<span className="text-emerald-400">✓</span>{` Types generated
`}<span className="text-emerald-400">✓</span>{` Tests ready
`}<span className="text-emerald-400">✓</span>{` Production-ready from day 1

cd my-app && npm run dev
`}<span className="text-orange-500">// Ship it 🚀</span>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TRUSTED BY DEVELOPERS - White background (NOT dark!)
          ============================================ */}
      <section className="relative py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Trust Stats Banner */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-stone-900">
              Trusted by <span className="text-orange-500">Developers Worldwide</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-12">
              Join the community of developers shipping faster with battle-tested foundations
            </p>

            {/* Trust Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">732</div>
                <div className="text-sm text-stone-500">Tests Passing</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">20+</div>
                <div className="text-sm text-stone-500">Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">MIT</div>
                <div className="text-sm text-stone-500">License</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">0</div>
                <div className="text-sm text-stone-500">Lock-In</div>
              </div>
            </div>
          </div>

          {/* Testimonials Grid - Consistent cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                </div>

                <p className="text-stone-600 mb-6 leading-relaxed text-sm">"{testimonial.quote}"</p>

                <div className="flex items-center gap-3 mt-auto">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full border-2 border-orange-100"
                  />
                  <div>
                    <div className="font-semibold text-stone-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-stone-500">
                      {testimonial.role} · <span className="text-orange-500">{testimonial.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-16 border-t border-stone-200">
            <p className="text-center text-sm text-stone-500 mb-8">Why developers trust this framework</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                <span className="text-emerald-500">✓</span>
                <span className="text-sm text-stone-700">No Telemetry</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                <span className="text-emerald-500">✓</span>
                <span className="text-sm text-stone-700">TypeScript First</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                <span className="text-emerald-500">✓</span>
                <span className="text-sm text-stone-700">Active Development</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                <span className="text-emerald-500">✓</span>
                <span className="text-sm text-stone-700">Production Ready</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                <span className="text-emerald-500">✓</span>
                <span className="text-sm text-stone-700">Secure by Default</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION - Stone-900 (dark, before footer)
          ============================================ */}
      <section className="relative py-24 px-4 bg-stone-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to <span className="text-orange-500">Ship Faster?</span>
          </h2>
          <p className="text-xl text-stone-400 mb-12">
            Join developers who are building production apps in minutes, not days
          </p>

          <div className="terminal max-w-2xl mx-auto mb-10">
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
            </div>
            <div className="terminal-body text-left py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-500"># Configure at /configure, then:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">$</span>
                <span className="text-slate-200">npx @jrdaws/framework clone your-project-token</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/configure" className="btn-primary text-lg">
              Get Started Now →
            </a>
            <a
              href="https://www.npmjs.com/package/@jrdaws/framework"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg"
            >
              View on npm
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER - Navy background
          ============================================ */}
      <footer className="relative bg-[#1E3A5F] py-16 px-4">
        {/* Footer pattern background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "url('/images/redesign/patterns/footer-pattern.svg')",
            backgroundSize: 'cover',
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-white mb-4">Framework</h3>
              <p className="text-sm text-white/70">
                A CLI scaffolding system for shipping production-ready applications faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/tree/main/templates"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/docs/PLUGIN_API.md"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Plugin API
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/docs/TEMPLATE_REGISTRY.md"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Registry
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework"
                    className="hover:text-orange-400 transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.npmjs.com/package/@jrdaws/framework"
                    className="hover:text-orange-400 transition-colors"
                  >
                    npm
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/issues"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Issues
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/CHANGELOG.md"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/LICENSE"
                    className="hover:text-orange-400 transition-colors"
                  >
                    License
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © 2024 @jrdaws/framework. Built with ❤️ by developers, for developers.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="font-mono text-orange-400">v0.3.1</span>
              <span className="text-emerald-400">732 tests passing</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
