'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';

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

// Testimonials with avatars
const testimonials = [
  {
    quote: "Finally, a scaffolding tool that doesn't make me tear out the code after day 1. The provider integrations actually work.",
    name: 'Alex Chen',
    role: 'Full-stack Developer',
    company: 'Indie Dev',
    initials: 'AC',
  },
  {
    quote: 'The plugin system is genius. I can hook into the export process and add our internal tools without forking.',
    name: 'Sarah Miller',
    role: 'Tech Lead',
    company: 'Enterprise SaaS',
    initials: 'SM',
  },
  {
    quote: 'Went from idea to deployed MVP in 2 hours. Auth, billing, and database just worked. This is the future.',
    name: 'Marcus Johnson',
    role: 'Indie Hacker',
    company: 'Solo Founder',
    initials: 'MJ',
  },
  {
    quote: 'The drift detection saved us from a production incident. Framework caught a config mismatch before we deployed.',
    name: 'Priya Sharma',
    role: 'DevOps Engineer',
    company: 'Startup',
    initials: 'PS',
  },
  {
    quote: 'We evaluated 5 scaffolding tools. This was the only one with zero lock-in. Export and you truly own your code.',
    name: 'David Kim',
    role: 'CTO',
    company: 'Series A Startup',
    initials: 'DK',
  },
  {
    quote: 'My junior devs are shipping production features in their first week thanks to the clear patterns and health checks.',
    name: 'Emily Rodriguez',
    role: 'Engineering Manager',
    company: 'Tech Company',
    initials: 'ER',
  },
];

export default function Home() {
  const [terminalText, setTerminalText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [level, setLevel] = useState<'beginner' | 'advanced'>('beginner');

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
    <main className="min-h-screen bg-background">
      {/* Site Header with Auth */}
      <Header />
      
      {/* ============================================
          HERO SECTION
          Light: Cream background with amber glow
          Dark: Navy background with orange glow
          ============================================ */}
      <section className="hero-section relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Glow effect */}
        <div className="hero-glow absolute top-[-30%] right-[-10%] w-[70%] h-[120%]" />
        
        {/* Gradient fade to content */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, hsl(var(--background)))' }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <div className="hero-badge mb-6">
                <span>✦</span>
                <span>Export-First Framework · v0.3.1</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground">
                Build SaaS apps
                <br />
                <span className="text-primary">in days, not months</span>
              </h1>

              <p className="text-xl mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-foreground-secondary">
                Configure your app in a beautiful visual builder, then export to full local ownership. No vendor lock-in, ever.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
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

              <div className="flex flex-wrap gap-6 lg:gap-8 justify-center lg:justify-start">
                <div className="feature-check">Zero lock-in</div>
                <div className="feature-check">AI-powered</div>
                <div className="feature-check">Full ownership</div>
                <div className="feature-check">Deploy anywhere</div>
              </div>
            </div>

            {/* Right side - Terminal */}
            <div className="relative mt-8 lg:mt-0">
              <div className="terminal max-w-[600px] w-full">
                <div className="terminal-header">
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                  <span className="terminal-title">~/my-project</span>
                </div>
                <div className="terminal-body">
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> {terminalText}</span>
                    {showCursor && terminalText !== command && (
                      <span className="inline-block w-2 h-5 bg-primary animate-blink ml-1" />
                    )}
                  </div>
                  {terminalText === command && (
                    <div className="animate-fade-in space-y-2 mt-2">
                      <div className="terminal-line">
                        <span className="terminal-success">✓</span>
                        <span className="terminal-output"> Downloading your configuration...</span>
                      </div>
                      <div className="terminal-line">
                        <span className="terminal-success">✓</span>
                        <span className="terminal-output"> Setting up project structure...</span>
                      </div>
                      <div className="terminal-line">
                        <span className="terminal-success">✓</span>
                        <span className="terminal-output"> Ready! Open in Cursor to continue.</span>
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
          FEATURES GRID
          ============================================ */}
      <section className="section-default py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Built for <span className="text-primary">Speed, Trust & Scale</span>
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Everything you need to ship production-ready applications, from templates to providers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-elevated"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={28}
                    height={28}
                    className=""
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-foreground-secondary mb-4">{feature.description}</p>
                <code className="text-sm text-primary font-mono bg-accent/10 px-2 py-1 rounded">
                  {feature.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SEE IT IN ACTION
          ============================================ */}
      <section className="section-alt py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              See It <span className="text-primary">In Action</span>
            </h2>

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

          <div className="terminal max-w-3xl mx-auto">
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
              <span className="terminal-title">
                {level === 'beginner' ? 'Quick Start with Clone' : 'Advanced: Clone with Features'}
              </span>
            </div>
            <div className="terminal-body">
              {level === 'beginner' ? (
                <div className="space-y-3">
                  <div className="terminal-line">
                    <span className="terminal-prompt">1.</span>
                    <span className="terminal-output"> Configure your project at </span>
                    <span className="terminal-prompt">dawson.does/configure</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">2.</span>
                    <span className="terminal-output"> Get your project token: </span>
                    <span className="terminal-command">swift-eagle-1234</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> npx @jrdaws/framework clone swift-eagle-1234</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> cd swift-eagle-1234 && npm run dev</span>
                  </div>
                  <div className="mt-4 pl-3 border-l-2 border-success">
                    <span className="terminal-success">✓</span>
                    <span className="terminal-output"> Your custom app is running at </span>
                    <span className="terminal-prompt">http://localhost:3000</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> framework features</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> framework clone swift-eagle-1234 --features auth,billing,analytics</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> cd swift-eagle-1234 && framework doctor</span>
                  </div>
                  <div className="terminal-line">
                    <span className="terminal-prompt">$</span>
                    <span className="terminal-command"> framework drift</span>
                  </div>
                  <div className="mt-4 pl-3 border-l-2 border-primary">
                    <span className="terminal-prompt">✓</span>
                    <span className="terminal-output"> Feature-based project generation with dependency resolution</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY CHOOSE
          ============================================ */}
      <section className="section-default py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Why Choose <span className="text-primary">This Framework?</span>
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Compare your options. We think the choice is clear.
            </p>
          </div>

          <div className="comparison-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Approach</th>
                  <th className="text-center">Setup Time</th>
                  <th className="text-center">Integrations</th>
                  <th className="text-center">Updates</th>
                  <th className="text-center">Support</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.approach} className={row.verdict === 'best' ? 'highlight' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        {row.verdict === 'best' && (
                          <span className="badge-success">● RECOMMENDED</span>
                        )}
                        <span>{row.approach}</span>
                      </div>
                    </td>
                    <td className="text-center">{row.time}</td>
                    <td className="text-center">{row.integrations}</td>
                    <td className="text-center">{row.updates}</td>
                    <td className="text-center">{row.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Differentiators */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="card-elevated">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-2xl flex items-center justify-center mb-4">🔓</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Zero Lock-In</h3>
              <p className="text-foreground-secondary text-sm">
                Export once and you own everything. No subscriptions, no runtime dependencies, no vendor tie-in.
              </p>
            </div>
            <div className="card-elevated">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-2xl flex items-center justify-center mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Drift Detection</h3>
              <p className="text-foreground-secondary text-sm">
                Know when your config drifts from the template. Catch issues before they become incidents.
              </p>
            </div>
            <div className="card-elevated">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-2xl flex items-center justify-center mb-4">🧩</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Plugin System</h3>
              <p className="text-foreground-secondary text-sm">
                Extend without forking. Hook into export, health checks, and more with a simple plugin API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BEFORE & AFTER
          ============================================ */}
      <section className="section-alt py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              The <span className="text-primary">Before & After</span>
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Stop copy-pasting boilerplate. Start with battle-tested foundations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-destructive text-xl">✗</span>
                <span className="font-semibold text-foreground">Without Framework</span>
              </div>
              <div className="terminal h-72 overflow-auto">
                <div className="terminal-body">
                  <pre className="text-sm leading-relaxed" style={{ color: 'hsl(var(--terminal-text))' }}>
{`// Hours of setup...
mkdir my-app && cd my-app
npm init -y
npm install next react react-dom
npm install @supabase/supabase-js
npm install stripe
mkdir src app components lib
// Copy-paste auth logic...
// Copy-paste billing logic...
// Hope it all works together
// Debug integration issues
// ...still not production-ready`}
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-success text-xl">✓</span>
                <span className="font-semibold text-foreground">With Framework</span>
              </div>
              <div className="terminal h-72 overflow-auto">
                <div className="terminal-body">
                  <pre className="text-sm leading-relaxed" style={{ color: 'hsl(var(--terminal-bright))' }}>
{`// 1 command, minutes of work
framework export saas ./my-app

`}<span className="text-success">✓</span>{` Next.js 15 + App Router
`}<span className="text-success">✓</span>{` TypeScript configured
`}<span className="text-success">✓</span>{` Supabase auth integrated
`}<span className="text-success">✓</span>{` Stripe billing connected
`}<span className="text-success">✓</span>{` Health checks built-in
`}<span className="text-success">✓</span>{` Drift detection enabled
`}<span className="text-success">✓</span>{` Production-ready from day 1

cd my-app && npm run dev
`}<span className="text-primary">// Ship it 🚀</span>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS
          ============================================ */}
      <section className="section-default py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Trusted by <span className="text-primary">Developers Worldwide</span>
            </h2>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto mb-12">
              Join the community of developers shipping faster with battle-tested foundations
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-16">
              <div className="text-center">
                <div className="stat-value">732</div>
                <div className="stat-label">Tests Passing</div>
              </div>
              <div className="text-center">
                <div className="stat-value">20+</div>
                <div className="stat-label">Features</div>
              </div>
              <div className="text-center">
                <div className="stat-value">MIT</div>
                <div className="stat-label">License</div>
              </div>
              <div className="text-center">
                <div className="stat-value">0</div>
                <div className="stat-label">Lock-In</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="testimonial-avatar">{testimonial.initials}</div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{testimonial.name}</div>
                    <div className="text-xs text-foreground-muted">
                      {testimonial.role} · <span className="text-primary">{testimonial.company}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-16 pt-16 border-t border-border">
            <p className="text-center text-sm text-foreground-muted mb-8">Why developers trust this framework</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['No Telemetry', 'TypeScript First', 'Active Development', 'Production Ready', 'Secure by Default'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
                  <span className="text-success">✓</span>
                  <span className="text-sm text-foreground">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION
          ============================================ */}
      <section className="section-alt py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Ready to <span className="text-primary">Ship Faster?</span>
          </h2>
          <p className="text-xl text-foreground-secondary mb-12">
            Join developers who are building production apps in minutes, not days
          </p>

          <div className="terminal max-w-2xl mx-auto mb-10 text-left">
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="terminal-output"># Configure at /configure, then:</span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-command"> npx @jrdaws/framework clone your-project-token</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/configure" className="btn-primary text-lg px-8 py-4">
              Get Started Now →
            </a>
            <a
              href="https://www.npmjs.com/package/@jrdaws/framework"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4"
            >
              View on npm
            </a>
          </div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="footer px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
                <span className="font-bold text-white">Dawson Does</span>
              </div>
              <p className="text-sm text-white/70">
                A CLI scaffolding system for shipping production-ready applications faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://github.com/jrdaws/dawson-does-framework">Documentation</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/tree/main/templates">Templates</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/blob/main/docs/PLUGIN_API.md">Plugin API</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/blob/main/docs/TEMPLATE_REGISTRY.md">Registry</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://github.com/jrdaws/dawson-does-framework">GitHub</a></li>
                <li><a href="https://www.npmjs.com/package/@jrdaws/framework">npm</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/issues">Issues</a></li>
                <li><a href="https://github.com/jrdaws/dawson-does-framework/blob/main/CHANGELOG.md">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="https://github.com/jrdaws/dawson-does-framework/blob/main/LICENSE">License</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © 2024 @jrdaws/framework. Built with ❤️ by developers, for developers.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="font-mono text-primary">v0.3.1</span>
              <span className="text-success">732 tests passing</span>
              <span>MIT License</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
