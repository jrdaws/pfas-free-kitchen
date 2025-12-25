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
    <main className="min-h-screen relative overflow-hidden bg-brand-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background gradient image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/redesign/hero/hero-gradient-bg.webp')" }}
        />

        {/* Mesh overlay */}
        <div className="mesh-overlay" />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/30 via-transparent to-brand-dark" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                <span className="text-sm font-medium text-brand-primary">v0.3.1 · 732 tests passing · Feature Assembler</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                From idea to production
                <br />
                <span className="gradient-text">in minutes, not days</span>
          </h1>

              <p className="text-xl text-stone-400 mb-10 max-w-xl mx-auto lg:mx-0">
            A CLI scaffolding system with plugins, templates, and provider integrations.
                Ship faster. Stay secure. Scale confidently.
          </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <a href="/configure" className="btn-primary text-center">
                  Configure Project →
                </a>
                <a
                  href="https://github.com/jrdaws/dawson-does-framework"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-center"
                >
                  View on GitHub
                </a>
              </div>

              {/* Enhanced Stats row */}
              <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto lg:mx-0">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="stat-value text-2xl md:text-3xl">{stat.value}</div>
                    <div className="text-xs text-stone-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Tech Stack Logos */}
              <div className="mt-10 pt-8 border-t border-stone-800/50">
                <p className="text-xs text-stone-500 mb-4 uppercase tracking-wider">Built With</p>
                <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                  {techStack.map((tech) => (
                    <div
                      key={tech.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-800/50 border border-stone-700/50 text-xs text-stone-400 hover:text-stone-200 hover:border-stone-600 transition-colors"
                    >
                      <span>{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Terminal/Visual */}
            <div className="relative">
              {/* Abstract graphic behind terminal */}
              <div className="absolute -right-20 -top-20 w-96 h-96 opacity-50 animate-float">
                <Image
                  src="/images/redesign/hero/hero-abstract-graphic.webp"
                  alt=""
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>

              {/* Animated Terminal - Clean Modern Style */}
              <div className="terminal-window relative z-10">
                <div className="terminal-header-modern">
                  <span className="terminal-title">~/my-app</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                  </div>
                </div>
                <div className="terminal-content text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-brand-primary">$</span>
                    <span className="text-stone-200">{terminalText}</span>
                    {showCursor && (
                      <span className="inline-block w-2 h-5 bg-brand-primary animate-blink" />
              )}
            </div>
                  {terminalText === command && (
                    <div className="animate-fade-in space-y-2">
                      <div className="text-stone-500">Fetching project configuration...</div>
                      <div className="text-stone-400">
                        <span className="text-brand-success">✓</span> Loaded: <span className="text-brand-primary">swift-eagle-1234</span>
                      </div>
                      <div className="text-stone-400">
                        <span className="text-brand-success">✓</span> Features: auth, billing, analytics
                      </div>
                      <div className="text-stone-400">
                        <span className="text-brand-success">✓</span> Template: flagship-saas
                      </div>
                      <div className="text-stone-400">
                        <span className="text-brand-success">✓</span> Assembling 12 feature modules...
                      </div>
                      <div className="text-stone-300 mt-4">
                        <span className="text-brand-success">✓</span> Project ready at{' '}
                        <span className="text-brand-primary">./swift-eagle-1234</span>
                      </div>
                      <div className="text-stone-500 mt-2">Run: cd swift-eagle-1234 && npm install && npm run dev</div>
                    </div>
                  )}
            </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Features Grid */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="gradient-text">Speed, Trust & Scale</span>
          </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Everything you need to ship production-ready applications, from templates to providers
          </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="feature-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={48}
                  height={48}
                  className="feature-icon"
                />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-stone-400 mb-4">{feature.description}</p>
                <code className="text-sm text-brand-primary font-mono">{feature.code}</code>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section with Toggle */}
      <section className="relative py-24 px-4 bg-stone-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See It <span className="gradient-text">In Action</span>
            </h2>

            {/* Beginner/Advanced Toggle */}
            <div className="toggle-group">
              <button
                onClick={() => setLevel('beginner')}
                className={`toggle-btn ${level === 'beginner' ? 'active' : ''}`}
              >
                Beginner
              </button>
              <button
                onClick={() => setLevel('advanced')}
                className={`toggle-btn ${level === 'advanced' ? 'active' : ''}`}
              >
                Advanced
              </button>
            </div>
          </div>

          {level === 'beginner' ? (
              <div className="terminal-window">
                <div className="terminal-header-modern">
                  <span className="terminal-title">Quick Start with Clone</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                  </div>
                </div>
                <div className="terminal-content">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">1.</span>
                      <div>
                      <div className="text-stone-200">Configure your project at <span className="text-brand-primary">dawson.does/configure</span></div>
                      <div className="text-stone-500 text-xs mt-1">Select features, integrations, and tools</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">2.</span>
                      <div>
                      <div className="text-stone-200">Get your project token: <span className="text-brand-secondary">swift-eagle-1234</span></div>
                      <div className="text-stone-500 text-xs mt-1">Unique token for your configuration</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                      <div>
                      <div className="text-stone-200">npx @jrdaws/framework clone swift-eagle-1234</div>
                      <div className="text-stone-500 text-xs mt-1">Clone with all your selected features</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                      <div>
                      <div className="text-stone-200">cd swift-eagle-1234 && npm run dev</div>
                      <div className="text-stone-500 text-xs mt-1">Start development server</div>
                    </div>
                  </div>
                  <div className="border-l-2 border-brand-success pl-4 mt-6">
                    <div className="text-stone-200">
                      <span className="text-brand-success">✓</span> Your custom app is running at{' '}
                      <span className="text-brand-primary">http://localhost:3000</span>
                    </div>
                    <div className="text-stone-500 text-xs mt-1">All selected features assembled and ready</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
              <div className="terminal-window">
                <div className="terminal-header-modern">
                  <span className="terminal-title">Advanced: Clone with Features</span>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                    <div className="w-2 h-2 rounded-full bg-stone-600" />
                  </div>
                </div>
                <div className="terminal-content">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                      <div>
                      <div className="text-stone-200">framework features</div>
                      <div className="text-stone-500 text-xs mt-1">List available features (20+ options)</div>
                    </div>
                      </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-stone-200">framework clone swift-eagle-1234 --features auth,billing,analytics</div>
                      <div className="text-stone-500 text-xs mt-1">Clone with additional features</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                      <div>
                      <div className="text-stone-200">cd swift-eagle-1234 && framework doctor</div>
                      <div className="text-stone-500 text-xs mt-1">Run project health checks</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                      <div>
                      <div className="text-stone-200">framework drift</div>
                      <div className="text-stone-500 text-xs mt-1">Check for configuration drift</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                      <div>
                      <div className="text-stone-200">framework clone swift-eagle-1234 --open</div>
                      <div className="text-stone-500 text-xs mt-1">Clone and open in Cursor automatically</div>
                    </div>
                      </div>
                  <div className="border-l-2 border-brand-secondary pl-4 mt-6">
                    <div className="text-stone-200">
                      <span className="text-brand-secondary">✓</span> Feature-based project generation
                    </div>
                    <div className="text-stone-500 text-xs mt-1">
                      Modular features assembled with dependency resolution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Value Comparison Section - Task 6.2 */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">This Framework?</span>
            </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto">
              Compare your options. We think the choice is clear.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left py-4 px-4 text-stone-400 font-medium">Approach</th>
                  <th className="text-center py-4 px-4 text-stone-400 font-medium">Setup Time</th>
                  <th className="text-center py-4 px-4 text-stone-400 font-medium">Integrations</th>
                  <th className="text-center py-4 px-4 text-stone-400 font-medium">Updates</th>
                  <th className="text-center py-4 px-4 text-stone-400 font-medium">Support</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr
                    key={row.approach}
                    className={`border-b border-stone-800/50 transition-colors ${
                      row.verdict === 'best'
                        ? 'bg-brand-primary/5 border-brand-primary/20'
                        : 'hover:bg-stone-800/30'
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {row.verdict === 'best' && (
                          <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                        )}
                        <span className={row.verdict === 'best' ? 'font-semibold text-white' : 'text-stone-300'}>
                          {row.approach}
                        </span>
                        {row.verdict === 'best' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-success/20 text-brand-success font-medium">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-brand-success font-semibold' : 'text-stone-400'}>
                        {row.time}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-brand-success font-semibold' : 'text-stone-400'}>
                        {row.integrations}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-brand-success font-semibold' : 'text-stone-400'}>
                        {row.updates}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={row.verdict === 'best' ? 'text-brand-success font-semibold' : 'text-stone-400'}>
                        {row.support}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Differentiators */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-3xl mb-3">🔓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Zero Lock-In</h3>
              <p className="text-stone-400 text-sm">
                Export once and you own everything. No subscriptions, no runtime dependencies, no vendor tie-in.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Drift Detection</h3>
              <p className="text-stone-400 text-sm">
                Know when your config drifts from the template. Catch issues before they become incidents.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="text-3xl mb-3">🧩</div>
              <h3 className="text-lg font-semibold text-white mb-2">Plugin System</h3>
              <p className="text-stone-400 text-sm">
                Extend without forking. Hook into export, health checks, and more with a simple plugin API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Code Comparison */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The <span className="gradient-text">Before & After</span>
          </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto">
            Stop copy-pasting boilerplate. Start with battle-tested foundations.
          </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 text-xl">✗</span>
                <span className="font-semibold text-stone-300">Without Framework</span>
              </div>
              <div className="code-block h-80 overflow-auto">
                <pre className="text-sm leading-relaxed text-stone-500">
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

            {/* After */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-brand-success text-xl">✓</span>
                <span className="font-semibold text-stone-300">With Framework</span>
              </div>
              <div className="code-block h-80 overflow-auto">
                <pre className="text-sm leading-relaxed text-stone-200">
{`// 1 command, minutes of work
framework export saas ./my-app

`}
                  <span className="text-brand-success">✓</span>
                  {` Next.js 15 + App Router
`}
                  <span className="text-brand-success">✓</span>
                  {` TypeScript configured
`}
                  <span className="text-brand-success">✓</span>
                  {` Supabase auth integrated
`}
                  <span className="text-brand-success">✓</span>
                  {` Stripe billing connected
`}
                  <span className="text-brand-success">✓</span>
                  {` shadcn/ui components
`}
                  <span className="text-brand-success">✓</span>
                  {` Environment variables templated
`}
                  <span className="text-brand-success">✓</span>
                  {` Health checks built-in
`}
                  <span className="text-brand-success">✓</span>
                  {` Drift detection enabled
`}
                  <span className="text-brand-success">✓</span>
                  {` Error handling included
`}
                  <span className="text-brand-success">✓</span>
                  {` Types generated
`}
                  <span className="text-brand-success">✓</span>
                  {` Tests ready
`}
                  <span className="text-brand-success">✓</span>
                  {` Production-ready from day 1

cd my-app && npm run dev
`}
                  <span className="text-brand-primary">// Ship it 🚀</span>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Task 6.3 */}
      <section className="relative py-24 px-4 bg-stone-900/50">
        <div className="max-w-6xl mx-auto">
          {/* Trust Stats Banner */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by <span className="gradient-text">Developers Worldwide</span>
            </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-12">
              Join the community of developers shipping faster with battle-tested foundations
            </p>

            {/* Trust Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">732</div>
                <div className="text-sm text-stone-500">Tests Passing</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">20+</div>
                <div className="text-sm text-stone-500">Features</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">MIT</div>
                <div className="text-sm text-stone-500">License</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">0</div>
                <div className="text-sm text-stone-500">Lock-In</div>
              </div>
            </div>
          </div>

          {/* Testimonials Grid - Enhanced */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="testimonial-card group hover:border-brand-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>

                <p className="text-stone-300 mb-6 leading-relaxed text-sm">"{testimonial.quote}"</p>

                <div className="flex items-center gap-3 mt-auto">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="avatar w-10 h-10"
                  />
                  <div>
                    <div className="font-semibold text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-stone-500">
                      {testimonial.role} · <span className="text-brand-primary">{testimonial.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-16 border-t border-stone-800">
            <p className="text-center text-sm text-stone-500 mb-8">Why developers trust this framework</p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
                <span className="text-brand-success">✓</span>
                <span className="text-sm text-stone-300">No Telemetry</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
                <span className="text-brand-success">✓</span>
                <span className="text-sm text-stone-300">TypeScript First</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
                <span className="text-brand-success">✓</span>
                <span className="text-sm text-stone-300">Active Development</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
                <span className="text-brand-success">✓</span>
                <span className="text-sm text-stone-300">Production Ready</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
                <span className="text-brand-success">✓</span>
                <span className="text-sm text-stone-300">Secure by Default</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="gradient-text">Ship Faster?</span>
          </h2>
          <p className="text-xl text-stone-400 mb-12">
            Join developers who are building production apps in minutes, not days
          </p>

          <div className="terminal-window max-w-2xl mx-auto mb-10">
            <div className="terminal-content text-left py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-stone-500"># Configure at /configure, then:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-primary">$</span>
                <span className="text-stone-200">npx @jrdaws/framework clone your-project-token</span>
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

      {/* Footer */}
      <footer className="relative border-t border-stone-800 py-16 px-4">
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
              <p className="text-sm text-stone-400">
                A CLI scaffolding system for shipping production-ready applications faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework"
                    className="hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/tree/main/templates"
                    className="hover:text-white transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/docs/PLUGIN_API.md"
                    className="hover:text-white transition-colors"
                  >
                    Plugin API
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/docs/TEMPLATE_REGISTRY.md"
                    className="hover:text-white transition-colors"
                  >
                    Registry
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.npmjs.com/package/@jrdaws/framework"
                    className="hover:text-white transition-colors"
                  >
                    npm
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/issues"
                    className="hover:text-white transition-colors"
                  >
                    Issues
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/CHANGELOG.md"
                    className="hover:text-white transition-colors"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-stone-400">
                <li>
                  <a
                    href="https://github.com/jrdaws/dawson-does-framework/blob/main/LICENSE"
                    className="hover:text-white transition-colors"
                  >
                    License
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-stone-500">
              © 2024 @jrdaws/framework. Built with ❤️ by developers, for developers.
            </p>
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <span className="font-mono text-brand-primary">v0.3.1</span>
              <span className="text-brand-success">732 tests passing</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
