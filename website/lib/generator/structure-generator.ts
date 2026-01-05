/**
 * Structure Generator
 * 
 * Generates page structure and routing from website analysis.
 * Creates pages that match the detected sections and navigation.
 */

import { GeneratedFile } from "./types";

export interface PageSection {
  type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'faq' | 
        'about' | 'team' | 'contact' | 'gallery' | 'blog' | 'stats' |
        'logos' | 'comparison' | 'timeline' | 'process' | 'newsletter' | 
        'footer' | 'unknown';
  variant?: string;
  order: number;
  content?: Record<string, unknown>;
}

export interface PageStructure {
  url: string;
  title: string;
  sections: PageSection[];
  metadata?: {
    description?: string;
    ogImage?: string;
  };
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface StructureAnalysis {
  pages: PageStructure[];
  navigation: NavigationItem[];
  footer?: {
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    bottomLinks?: Array<{ label: string; href: string }>;
  };
}

// Map section types to pattern component names
const SECTION_COMPONENTS: Record<PageSection['type'], { componentName: string; importPath: string }> = {
  hero: { componentName: 'Hero', importPath: '@/components/sections/Hero' },
  features: { componentName: 'Features', importPath: '@/components/sections/Features' },
  pricing: { componentName: 'Pricing', importPath: '@/components/sections/Pricing' },
  testimonials: { componentName: 'Testimonials', importPath: '@/components/sections/Testimonials' },
  cta: { componentName: 'CTA', importPath: '@/components/sections/CTA' },
  faq: { componentName: 'FAQ', importPath: '@/components/sections/FAQ' },
  about: { componentName: 'About', importPath: '@/components/sections/About' },
  team: { componentName: 'Team', importPath: '@/components/sections/Team' },
  contact: { componentName: 'Contact', importPath: '@/components/sections/Contact' },
  gallery: { componentName: 'Gallery', importPath: '@/components/sections/Gallery' },
  blog: { componentName: 'BlogPreview', importPath: '@/components/sections/BlogPreview' },
  stats: { componentName: 'Stats', importPath: '@/components/sections/Stats' },
  logos: { componentName: 'Logos', importPath: '@/components/sections/Logos' },
  comparison: { componentName: 'Comparison', importPath: '@/components/sections/Comparison' },
  timeline: { componentName: 'Timeline', importPath: '@/components/sections/Timeline' },
  process: { componentName: 'Process', importPath: '@/components/sections/Process' },
  newsletter: { componentName: 'Newsletter', importPath: '@/components/sections/Newsletter' },
  footer: { componentName: 'Footer', importPath: '@/components/Footer' },
  unknown: { componentName: 'Section', importPath: '@/components/sections/Section' },
};

/**
 * Generate a page component from its structure
 */
export function generatePageFromStructure(
  structure: PageStructure,
  projectName: string
): string {
  const imports: string[] = [];
  const components: string[] = [];
  const importedComponents = new Set<string>();

  // Sort sections by order
  const sortedSections = [...structure.sections].sort((a, b) => a.order - b.order);

  for (const section of sortedSections) {
    const { componentName, importPath } = SECTION_COMPONENTS[section.type] || SECTION_COMPONENTS.unknown;
    
    // Avoid duplicate imports
    if (!importedComponents.has(componentName)) {
      imports.push(`import { ${componentName} } from "${importPath}";`);
      importedComponents.add(componentName);
    }

    // Generate component with variant prop if specified
    const variantProp = section.variant ? ` variant="${section.variant}"` : '';
    components.push(`<${componentName}${variantProp} />`);
  }

  // Generate page title from URL
  const pageTitle = structure.title || urlToTitle(structure.url);
  const functionName = urlToFunctionName(structure.url);

  return `/**
 * ${pageTitle}
 * Generated for ${projectName}
 */

${imports.join('\n')}

export const metadata = {
  title: "${pageTitle}",
  ${structure.metadata?.description ? `description: "${structure.metadata.description}",` : ''}
};

export default function ${functionName}() {
  return (
    <main className="min-h-screen">
      ${components.join('\n      ')}
    </main>
  );
}
`;
}

/**
 * Generate navigation component from analysis
 */
export function generateNavigation(
  navigation: NavigationItem[],
  projectName: string
): string {
  const navItems = JSON.stringify(navigation, null, 2);

  return `/**
 * Navigation Component
 * Generated for ${projectName}
 */

"use client";

import Link from "next/link";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navigation: NavItem[] = ${navItems};

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-heading font-bold">${projectName}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="bg-background border rounded-lg shadow-lg p-2 min-w-[180px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-primary px-4 py-2 text-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-foreground font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block py-2 pl-4 text-foreground/60"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/login"
                className="block py-2 text-foreground font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-primary block text-center py-2"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navigation;
`;
}

/**
 * Generate footer component from analysis
 */
export function generateFooter(
  footer: StructureAnalysis['footer'],
  projectName: string
): string {
  if (!footer) {
    return generateSimpleFooter(projectName);
  }

  const columns = JSON.stringify(footer.columns, null, 2);
  const bottomLinks = JSON.stringify(footer.bottomLinks || [], null, 2);

  return `/**
 * Footer Component
 * Generated for ${projectName}
 */

import Link from "next/link";

interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

interface FooterLink {
  label: string;
  href: string;
}

const columns: FooterColumn[] = ${columns};
const bottomLinks: FooterLink[] = ${bottomLinks};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        {/* Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-${Math.min(footer.columns.length + 1, 5)} gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-heading font-bold">
              ${projectName}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Built with care. Powered by modern technology.
            </p>
          </div>

          {/* Link Columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ${projectName}. All rights reserved.
          </p>
          {bottomLinks.length > 0 && (
            <div className="flex gap-6">
              {bottomLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
`;
}

/**
 * Generate simple footer when no structure is provided
 */
function generateSimpleFooter(projectName: string): string {
  return `/**
 * Footer Component
 * Generated for ${projectName}
 */

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-lg font-heading font-bold">
            ${projectName}
          </Link>
          <p className="text-sm text-muted-foreground">
            © {currentYear} ${projectName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
`;
}

/**
 * Generate all structure-related files from analysis
 */
export function generateStructureFiles(
  analysis: StructureAnalysis,
  projectName: string
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Generate navigation
  files.push({
    path: 'components/Navigation.tsx',
    content: generateNavigation(analysis.navigation, projectName),
    overwrite: true,
  });

  // Generate footer
  files.push({
    path: 'components/Footer.tsx',
    content: generateFooter(analysis.footer, projectName),
    overwrite: true,
  });

  // Generate pages from structure
  for (const page of analysis.pages) {
    const pagePath = getPagePath(page.url);
    files.push({
      path: pagePath,
      content: generatePageFromStructure(page, projectName),
      overwrite: true,
    });
  }

  // Generate layout with navigation and footer
  files.push({
    path: 'app/layout.tsx',
    content: generateRootLayout(projectName),
    overwrite: true,
  });

  return files;
}

/**
 * Generate root layout
 */
function generateRootLayout(projectName: string): string {
  return `import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Generated with Dawson-Does Framework",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
`;
}

/**
 * Generate section components based on detected sections
 */
export function generateSectionComponents(
  sections: PageSection[],
  projectName: string
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const generatedTypes = new Set<PageSection['type']>();

  for (const section of sections) {
    if (generatedTypes.has(section.type) || section.type === 'unknown' || section.type === 'footer') {
      continue;
    }
    generatedTypes.add(section.type);

    const template = getSectionTemplate(section.type, projectName);
    if (template) {
      files.push({
        path: `components/sections/${capitalize(section.type)}.tsx`,
        content: template,
        overwrite: false,
      });
    }
  }

  return files;
}

/**
 * Get template for a section type
 */
function getSectionTemplate(type: PageSection['type'], projectName: string): string | null {
  const templates: Record<string, string> = {
    hero: `/**
 * Hero Section
 * Generated for ${projectName}
 */

interface HeroProps {
  variant?: string;
}

export function Hero({ variant }: HeroProps) {
  return (
    <section className="relative py-20 lg:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
          Welcome to ${projectName}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Your tagline goes here. Make it compelling and memorable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/signup" className="btn-primary px-8 py-3">
            Get Started
          </a>
          <a href="#features" className="btn-outline px-8 py-3">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
`,

    features: `/**
 * Features Section
 * Generated for ${projectName}
 */

interface FeaturesProps {
  variant?: string;
}

const features = [
  {
    title: "Feature One",
    description: "Description of your first amazing feature.",
    icon: "⚡",
  },
  {
    title: "Feature Two",
    description: "Description of your second amazing feature.",
    icon: "🎯",
  },
  {
    title: "Feature Three",
    description: "Description of your third amazing feature.",
    icon: "🚀",
  },
];

export function Features({ variant }: FeaturesProps) {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to succeed.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    pricing: `/**
 * Pricing Section
 * Generated for ${projectName}
 */

interface PricingProps {
  variant?: string;
}

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    features: ["Everything in Starter", "Feature 4", "Feature 5", "Feature 6"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    features: ["Everything in Pro", "Feature 7", "Feature 8", "Priority Support"],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing({ variant }: PricingProps) {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Simple Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works for you.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={\`card p-6 \${plan.popular ? "border-primary ring-2 ring-primary" : ""}\`}
            >
              {plan.popular && (
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mt-4">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={\`w-full py-3 rounded-button font-medium \${plan.popular ? "btn-primary" : "btn-outline"}\`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    testimonials: `/**
 * Testimonials Section
 * Generated for ${projectName}
 */

interface TestimonialsProps {
  variant?: string;
}

const testimonials = [
  {
    quote: "This product has transformed how we work. Highly recommended!",
    author: "Jane Doe",
    role: "CEO, Example Co",
    avatar: "JD",
  },
  {
    quote: "The best solution we've found. Simple, powerful, and reliable.",
    author: "John Smith",
    role: "CTO, Tech Corp",
    avatar: "JS",
  },
  {
    quote: "Outstanding support and features. Worth every penny.",
    author: "Sarah Johnson",
    role: "Founder, Startup Inc",
    avatar: "SJ",
  },
];

export function Testimonials({ variant }: TestimonialsProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="card p-6">
              <p className="text-lg mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    cta: `/**
 * CTA Section
 * Generated for ${projectName}
 */

interface CTAProps {
  variant?: string;
}

export function CTA({ variant }: CTAProps) {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
          Join thousands of satisfied customers today.
        </p>
        <a
          href="/signup"
          className="inline-block bg-background text-foreground px-8 py-3 rounded-button font-medium hover:opacity-90 transition-opacity"
        >
          Start Free Trial
        </a>
      </div>
    </section>
  );
}
`,

    faq: `/**
 * FAQ Section
 * Generated for ${projectName}
 */

"use client";

import { useState } from "react";

interface FAQProps {
  variant?: string;
}

const faqs = [
  {
    question: "What is ${projectName}?",
    answer: "A brief explanation of what your product does and why it's valuable.",
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up for a free account and follow our quick start guide.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time with no questions asked.",
  },
];

export function FAQ({ variant }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-card overflow-hidden">
              <button
                className="w-full p-4 text-left font-semibold flex justify-between items-center hover:bg-muted/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.question}
                <svg
                  className={\`w-5 h-5 transition-transform \${openIndex === index ? "rotate-180" : ""}\`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="p-4 pt-0 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    stats: `/**
 * Stats Section
 * Generated for ${projectName}
 */

interface StatsProps {
  variant?: string;
}

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
  { value: "150+", label: "Countries" },
];

export function Stats({ variant }: StatsProps) {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    logos: `/**
 * Logos Section
 * Generated for ${projectName}
 */

interface LogosProps {
  variant?: string;
}

export function Logos({ variant }: LogosProps) {
  return (
    <section className="py-12 border-y bg-muted/20">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by leading companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-24 h-12 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground font-medium">Logo {i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

    newsletter: `/**
 * Newsletter Section
 * Generated for ${projectName}
 */

interface NewsletterProps {
  variant?: string;
}

export function Newsletter({ variant }: NewsletterProps) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-xl text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
          Stay Updated
        </h2>
        <p className="text-muted-foreground mb-6">
          Subscribe to our newsletter for the latest updates and news.
        </p>
        <form className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-6 py-2">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
`,
  };

  return templates[type] || null;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function urlToTitle(url: string): string {
  if (url === '/' || url === '') return 'Home';
  const segment = url.split('/').filter(Boolean).pop() || 'Page';
  return segment.split('-').map(capitalize).join(' ');
}

function urlToFunctionName(url: string): string {
  if (url === '/' || url === '') return 'HomePage';
  const segment = url.split('/').filter(Boolean).pop() || 'Page';
  return segment.split('-').map(capitalize).join('') + 'Page';
}

function getPagePath(url: string): string {
  if (url === '/' || url === '') return 'app/page.tsx';
  const segments = url.split('/').filter(Boolean);
  return `app/${segments.join('/')}/page.tsx`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

