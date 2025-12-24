'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Feature data with new icons
const features = [
  {
    icon: '/images/redesign/icons/icon-templates.svg',
    title: 'Template Registry',
    description: 'Production-ready templates for SaaS, directories, and more. Searchable, versioned, and extensible.',
    code: 'framework templates list',
  },
  {
    icon: '/images/redesign/icons/icon-plugins.svg',
    title: 'Plugin System',
    description: 'Hook into export, health checks, and more. Extend functionality without forking.',
    code: 'framework plugin add',
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
    title: 'Powerful CLI',
    description: 'Intuitive commands for export, health checks, doctor, and more. Built for developer experience.',
    code: 'framework export saas ./app',
  },
  {
    icon: '/images/redesign/icons/icon-extensible.svg',
    title: 'Fully Extensible',
    description: 'Custom templates, private registries, and capability overrides. Own your stack.',
    code: '.dd/config.json',
  },
];

// Testimonials with avatars
const testimonials = [
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-1.webp',
    quote: "Finally, a scaffolding tool that doesn't make me tear out the code after day 1. The provider integrations actually work.",
    name: 'Alex Chen',
    role: 'Full-stack Developer',
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-2.webp',
    quote: 'The plugin system is genius. I can hook into the export process and add our internal tools without forking.',
    name: 'Sarah Miller',
    role: 'Tech Lead, Enterprise SaaS',
  },
  {
    avatar: '/images/redesign/avatars/avatar-placeholder-3.webp',
    quote: 'Went from idea to deployed MVP in 2 hours. Auth, billing, and database just worked. This is the future.',
    name: 'Marcus Johnson',
    role: 'Indie Hacker',
  },
];

export default function Home() {
  const [terminalText, setTerminalText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [level, setLevel] = useState<'beginner' | 'advanced'>('beginner');

  const command = 'npx @jrdaws/framework export saas ./my-app';

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
                <span className="text-sm font-medium text-brand-primary">v0.3.0 · 192 tests passing</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                From idea to production
                <br />
                <span className="gradient-text">in minutes, not days</span>
              </h1>

              <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto lg:mx-0">
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

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="stat-value">192</div>
                  <div className="text-sm text-zinc-500">Tests Passing</div>
                </div>
                <div>
                  <div className="stat-value">0.3.0</div>
                  <div className="text-sm text-zinc-500">Latest Version</div>
                </div>
                <div>
                  <div className="stat-value">8+</div>
                  <div className="text-sm text-zinc-500">Providers</div>
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

              {/* Animated Terminal */}
              <div className="terminal-window relative z-10">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="ml-3 text-xs text-zinc-500 font-mono">terminal</span>
                </div>
                <div className="terminal-content text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-brand-primary">$</span>
                    <span className="text-zinc-200">{terminalText}</span>
                    {showCursor && (
                      <span className="inline-block w-2 h-5 bg-brand-primary animate-blink" />
                    )}
                  </div>
                  {terminalText === command && (
                    <div className="animate-fade-in space-y-2">
                      <div className="text-zinc-500">Creating project from saas template...</div>
                      <div className="text-zinc-400">
                        <span className="text-brand-success">✓</span> Next.js 15 + App Router
                      </div>
                      <div className="text-zinc-400">
                        <span className="text-brand-success">✓</span> TypeScript configured
                      </div>
                      <div className="text-zinc-400">
                        <span className="text-brand-success">✓</span> Supabase auth integrated
                      </div>
                      <div className="text-zinc-400">
                        <span className="text-brand-success">✓</span> Stripe billing connected
                      </div>
                      <div className="text-zinc-300 mt-4">
                        <span className="text-brand-success">✓</span> Project ready at{' '}
                        <span className="text-brand-primary">./my-app</span>
                      </div>
                      <div className="text-zinc-500 mt-2">Run: cd my-app && npm install && npm run dev</div>
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
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
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
                <p className="text-zinc-400 mb-4">{feature.description}</p>
                <code className="text-sm text-brand-primary font-mono">{feature.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section with Toggle */}
      <section className="relative py-24 px-4 bg-zinc-900/50">
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
              <div className="terminal-header">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-500" />
                <div className="terminal-dot bg-green-500" />
                <span className="ml-3 text-xs text-zinc-500 font-mono">Quick Start</span>
              </div>
              <div className="terminal-content">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">npm install -g @jrdaws/framework</div>
                      <div className="text-zinc-500 text-xs mt-1">Install globally</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">framework export saas ./my-app</div>
                      <div className="text-zinc-500 text-xs mt-1">Export SaaS template with auth & billing</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">cd my-app && npm install</div>
                      <div className="text-zinc-500 text-xs mt-1">Install dependencies</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">npm run dev</div>
                      <div className="text-zinc-500 text-xs mt-1">Start development server</div>
                    </div>
                  </div>
                  <div className="border-l-2 border-brand-success pl-4 mt-6">
                    <div className="text-zinc-200">
                      <span className="text-brand-success">✓</span> Your SaaS app is running at{' '}
                      <span className="text-brand-primary">http://localhost:3000</span>
                    </div>
                    <div className="text-zinc-500 text-xs mt-1">Auth, billing, and database configured</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot bg-red-500" />
                <div className="terminal-dot bg-yellow-500" />
                <div className="terminal-dot bg-green-500" />
                <span className="ml-3 text-xs text-zinc-500 font-mono">Advanced Workflow</span>
              </div>
              <div className="terminal-content">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">framework templates search saas</div>
                      <div className="text-zinc-500 text-xs mt-1">Search available templates</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">framework export saas ./my-app --name "MyApp"</div>
                      <div className="text-zinc-500 text-xs mt-1">Export with custom name</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">cd my-app && framework health</div>
                      <div className="text-zinc-500 text-xs mt-1">Run health checks</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">framework drift</div>
                      <div className="text-zinc-500 text-xs mt-1">Check for configuration drift</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-brand-primary">$</span>
                    <div>
                      <div className="text-zinc-200">framework plugin add ./my-plugin.mjs</div>
                      <div className="text-zinc-500 text-xs mt-1">Add custom plugin</div>
                    </div>
                  </div>
                  <div className="border-l-2 border-brand-secondary pl-4 mt-6">
                    <div className="text-zinc-200">
                      <span className="text-brand-secondary">✓</span> Advanced features configured
                    </div>
                    <div className="text-zinc-500 text-xs mt-1">
                      Plugins, health monitoring, and drift detection active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Code Comparison */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The <span className="gradient-text">Before & After</span>
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Stop copy-pasting boilerplate. Start with battle-tested foundations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 text-xl">✗</span>
                <span className="font-semibold text-zinc-300">Without Framework</span>
              </div>
              <div className="code-block h-80 overflow-auto">
                <pre className="text-sm leading-relaxed text-zinc-500">
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
                <span className="font-semibold text-zinc-300">With Framework</span>
              </div>
              <div className="code-block h-80 overflow-auto">
                <pre className="text-sm leading-relaxed text-zinc-200">
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

      {/* Testimonials */}
      <section className="relative py-24 px-4 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built by Developers, <span className="gradient-text">for Developers</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="testimonial-card">
                <p className="text-zinc-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="avatar"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-zinc-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="gradient-text">Ship Faster?</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12">
            Join developers who are building production apps in minutes, not days
          </p>

          <div className="terminal-window max-w-2xl mx-auto mb-10">
            <div className="terminal-content text-left py-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-brand-primary">$</span>
                <span className="text-zinc-200">npm install -g @jrdaws/framework</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-primary">$</span>
                <span className="text-zinc-200">framework export saas ./my-app</span>
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
      <footer className="relative border-t border-zinc-800 py-16 px-4">
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
              <p className="text-sm text-zinc-400">
                A CLI scaffolding system for shipping production-ready applications faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
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
              <ul className="space-y-3 text-sm text-zinc-400">
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
              <ul className="space-y-3 text-sm text-zinc-400">
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

          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © 2024 @jrdaws/framework. Built with ❤️ by developers, for developers.
            </p>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="font-mono text-brand-primary">v0.3.0</span>
              <span className="text-brand-success">192 tests passing</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
