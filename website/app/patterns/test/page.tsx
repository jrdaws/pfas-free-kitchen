"use client";

import React, { useState } from "react";
import { DynamicPreviewRenderer, createTestDefinition } from "@/components/preview/DynamicPreviewRenderer";
import { ProjectDefinition } from "@/lib/patterns/types";

// Hero patterns
import { HeroCenteredGradient } from "@/lib/patterns/patterns/heroes/centered-gradient";
import { HeroSplitImage } from "@/lib/patterns/patterns/heroes/split-image";
import { HeroAnimatedText } from "@/lib/patterns/patterns/heroes/animated-text";
import { HeroSimpleCentered } from "@/lib/patterns/patterns/heroes/simple-centered";
import { HeroVideoBackground } from "@/lib/patterns/patterns/heroes/video-background";

// Feature patterns
import { FeaturesIconGrid } from "@/lib/patterns/patterns/features/icon-grid-3col";
import { FeaturesBentoGrid } from "@/lib/patterns/patterns/features/bento-grid";
import { FeaturesCards } from "@/lib/patterns/patterns/features/feature-cards";
import { FeaturesAlternatingRows } from "@/lib/patterns/patterns/features/alternating-rows";
import { FeaturesComparisonTable } from "@/lib/patterns/patterns/features/comparison-table";

// Social proof patterns
import { LogoWall } from "@/lib/patterns/patterns/social-proof/LogoWall";
import { TestimonialCards } from "@/lib/patterns/patterns/social-proof/TestimonialCards";

// Pricing patterns
import { PricingTable3Tier } from "@/lib/patterns/patterns/pricing/PricingTable3Tier";

// CTA patterns
import { CTASection } from "@/lib/patterns/patterns/cta/CTASection";

// FAQ patterns
import { FAQAccordion } from "@/lib/patterns/patterns/faq/FAQAccordion";

/**
 * Pattern Library Test Page
 * 
 * Complete showcase of ALL pattern components with variants.
 */
export default function PatternTestPage() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [definition, setDefinition] = useState<ProjectDefinition>(createTestDefinition());
  const [activeTab, setActiveTab] = useState<"individual" | "composed">("individual");

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Pattern Library</h1>
            
            <div className="flex items-center gap-4">
              {/* Tab switcher */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("individual")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "individual"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Individual Patterns
                </button>
                <button
                  onClick={() => setActiveTab("composed")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "composed"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Composed Page
                </button>
              </div>

              {/* Viewport switcher for composed */}
              {activeTab === "composed" && (
                <div className="flex bg-white/5 rounded-lg p-1">
                  {(["desktop", "tablet", "mobile"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setViewport(v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        viewport === v
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Category Navigation */}
          {activeTab === "individual" && (
            <nav className="flex gap-6 mt-4 text-sm overflow-x-auto pb-2">
              <a href="#heroes" className="text-white/60 hover:text-orange-400 transition-colors whitespace-nowrap">Heroes</a>
              <a href="#features" className="text-white/60 hover:text-orange-400 transition-colors whitespace-nowrap">Features</a>
              <a href="#social-proof" className="text-white/60 hover:text-orange-400 transition-colors whitespace-nowrap">Social Proof</a>
              <a href="#pricing" className="text-white/60 hover:text-orange-400 transition-colors whitespace-nowrap">Pricing</a>
              <a href="#cta" className="text-white/60 hover:text-orange-400 transition-colors whitespace-nowrap">CTA</a>
              <a href="#faq" className="text-white/60 hover:text-orange-400 transition-colors whitespace-nowrap">FAQ</a>
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      {activeTab === "individual" ? (
        <main className="space-y-1">
          {/* ============================================ */}
          {/* HERO PATTERNS */}
          {/* ============================================ */}
          <PatternSection
            id="heroes"
            title="Hero Patterns"
            description="5 hero pattern implementations with multiple variants"
            count={5}
          >
            {/* Centered Gradient Hero */}
            <PatternCard
              patternId="hero-centered-gradient"
              name="Centered Gradient"
              variants={["gradient-text", "glow"]}
            >
              <HeroCenteredGradient
                headline="Build the Future Today"
                subheadline="A modern platform that helps you ship faster with less complexity."
                primaryCta={{ text: "Get Started", href: "#" }}
                secondaryCta={{ text: "Learn More", href: "#" }}
                badge="Now in beta"
              />
            </PatternCard>

            {/* Split Image Hero */}
            <PatternCard
              patternId="hero-split-image"
              name="Split Image"
              variants={["image-left", "image-right"]}
            >
              <HeroSplitImage
                headline="Ship to production, instantly"
                subheadline="Deploy your code with zero configuration. Built for modern teams."
                primaryCta={{ text: "Start Deploying", href: "#" }}
                secondaryCta={{ text: "View Demo", href: "#" }}
              />
            </PatternCard>

            {/* Animated Text Hero */}
            <PatternCard
              patternId="hero-animated-text"
              name="Animated Text"
              variants={["typewriter", "fade-rotate"]}
            >
              <HeroAnimatedText
                headline="Build apps that"
                subheadline="The most flexible platform for developers."
                primaryCta={{ text: "Get Started", href: "#" }}
                secondaryCta={{ text: "Documentation", href: "#" }}
              />
            </PatternCard>

            {/* Simple Centered Hero */}
            <PatternCard
              patternId="hero-simple-centered"
              name="Simple Centered"
              variants={["minimal", "with-badge"]}
            >
              <HeroSimpleCentered
                headline="Simple, powerful, effective"
                subheadline="Everything you need, nothing you don't. Start building in minutes."
                primaryCta={{ text: "Try Free", href: "#" }}
                secondaryCta={{ text: "See Pricing", href: "#" }}
                badge="New"
              />
            </PatternCard>

            {/* Video Background Hero */}
            <PatternCard
              patternId="hero-video-background"
              name="Video Background"
              variants={["dark-overlay", "light-overlay", "gradient-overlay"]}
            >
              <HeroVideoBackground
                headline="Experience the Future"
                subheadline="Transforming the way you interact with technology."
                primaryCta={{ text: "Watch Demo", href: "#" }}
                secondaryCta={{ text: "Learn More", href: "#" }}
                variant="dark-overlay"
              />
            </PatternCard>
          </PatternSection>

          {/* ============================================ */}
          {/* FEATURE PATTERNS */}
          {/* ============================================ */}
          <PatternSection
            id="features"
            title="Feature Patterns"
            description="5 feature pattern implementations for showcasing capabilities"
            count={5}
          >
            {/* Icon Grid */}
            <PatternCard
              patternId="features-icon-grid"
              name="Icon Grid (3-Column)"
              variants={["dark", "light"]}
            >
              <FeaturesIconGrid
                title="Everything you need"
                subtitle="Built for modern teams and workflows"
              />
            </PatternCard>

            {/* Bento Grid */}
            <PatternCard
              patternId="features-bento"
              name="Bento Grid"
              variants={["asymmetric", "uniform"]}
            >
              <FeaturesBentoGrid
                title="Powerful features"
                subtitle="Everything you need to succeed"
              />
            </PatternCard>

            {/* Feature Cards */}
            <PatternCard
              patternId="features-cards"
              name="Feature Cards"
              variants={["dark", "light"]}
            >
              <FeaturesCards
                title="Why choose us"
                subtitle="Here's what sets us apart from the competition"
              />
            </PatternCard>

            {/* Alternating Rows */}
            <PatternCard
              patternId="features-alternating"
              name="Alternating Rows"
              variants={["image-left-first", "image-right-first"]}
            >
              <FeaturesAlternatingRows
                title="How it works"
                subtitle="Three simple steps to get started"
              />
            </PatternCard>

            {/* Comparison Table */}
            <PatternCard
              patternId="features-comparison"
              name="Comparison Table"
              variants={["horizontal", "vertical"]}
            >
              <FeaturesComparisonTable
                title="Compare plans"
                subtitle="Find the perfect plan for your needs"
              />
            </PatternCard>
          </PatternSection>

          {/* ============================================ */}
          {/* SOCIAL PROOF PATTERNS */}
          {/* ============================================ */}
          <PatternSection
            id="social-proof"
            title="Social Proof Patterns"
            description="Logo walls, testimonials, and trust signals"
            count={2}
          >
            {/* Logo Wall - Static */}
            <PatternCard
              patternId="logos-simple"
              name="Logo Wall (Static)"
              variants={["static", "scrolling"]}
            >
              <LogoWall
                headline="Trusted by leading companies"
                variant="static"
                grayscale={true}
              />
            </PatternCard>

            {/* Logo Wall - Scrolling */}
            <PatternCard
              patternId="logos-scrolling"
              name="Logo Wall (Scrolling)"
            >
              <LogoWall
                headline="Trusted by innovative teams worldwide"
                variant="scrolling"
                grayscale={false}
              />
            </PatternCard>

            {/* Testimonials Grid */}
            <PatternCard
              patternId="testimonials-grid"
              name="Testimonials (Grid)"
              variants={["grid", "carousel", "featured"]}
            >
              <TestimonialCards
                headline="What our customers say"
                variant="grid"
              />
            </PatternCard>

            {/* Testimonials Carousel */}
            <PatternCard
              patternId="testimonials-carousel"
              name="Testimonials (Carousel)"
            >
              <TestimonialCards
                headline="Loved by thousands"
                variant="carousel"
              />
            </PatternCard>

            {/* Testimonials Featured */}
            <PatternCard
              patternId="testimonials-featured"
              name="Testimonials (Featured)"
            >
              <TestimonialCards
                headline="Featured review"
                variant="featured"
              />
            </PatternCard>
          </PatternSection>

          {/* ============================================ */}
          {/* PRICING PATTERNS */}
          {/* ============================================ */}
          <PatternSection
            id="pricing"
            title="Pricing Patterns"
            description="Pricing tables and plan comparisons"
            count={1}
          >
            {/* 3-Tier Pricing */}
            <PatternCard
              patternId="pricing-three-tier"
              name="3-Tier Pricing Table"
              variants={["with-toggle", "annual-only"]}
            >
              <PricingTable3Tier
                headline="Simple, transparent pricing"
                subheadline="Choose the plan that's right for you"
                billingToggle={true}
              />
            </PatternCard>
          </PatternSection>

          {/* ============================================ */}
          {/* CTA PATTERNS */}
          {/* ============================================ */}
          <PatternSection
            id="cta"
            title="Call to Action Patterns"
            description="Conversion-focused sections"
            count={1}
          >
            {/* CTA Centered */}
            <PatternCard
              patternId="cta-centered"
              name="CTA (Centered)"
              variants={["centered", "split", "gradient-bg"]}
            >
              <CTASection
                headline="Ready to get started?"
                subheadline="Start building for free. No credit card required."
                cta={{ text: "Get Started Free", href: "#" }}
                secondaryCta={{ text: "Contact Sales", href: "#" }}
                variant="centered"
              />
            </PatternCard>

            {/* CTA Split */}
            <PatternCard patternId="cta-split" name="CTA (Split)">
              <CTASection
                headline="Join thousands of happy users"
                subheadline="See why teams love our platform"
                cta={{ text: "Start Free Trial", href: "#" }}
                variant="split"
              />
            </PatternCard>

            {/* CTA Gradient */}
            <PatternCard patternId="cta-gradient" name="CTA (Gradient Background)">
              <CTASection
                headline="Build something amazing"
                subheadline="The tools you need to bring your ideas to life"
                cta={{ text: "Get Started", href: "#" }}
                secondaryCta={{ text: "Book a Demo", href: "#" }}
                variant="gradient-bg"
              />
            </PatternCard>
          </PatternSection>

          {/* ============================================ */}
          {/* FAQ PATTERNS */}
          {/* ============================================ */}
          <PatternSection
            id="faq"
            title="FAQ Patterns"
            description="Frequently asked questions layouts"
            count={1}
          >
            {/* FAQ Single Column */}
            <PatternCard
              patternId="faq-accordion"
              name="FAQ Accordion (Single Column)"
              variants={["single-column", "two-column"]}
            >
              <FAQAccordion
                headline="Frequently Asked Questions"
                subheadline="Everything you need to know"
                variant="single-column"
              />
            </PatternCard>

            {/* FAQ Two Column */}
            <PatternCard patternId="faq-two-column" name="FAQ Accordion (Two Column)">
              <FAQAccordion
                headline="Got questions? We've got answers"
                variant="two-column"
              />
            </PatternCard>
          </PatternSection>
        </main>
      ) : (
        /* Composed Page View */
        <div className="py-8">
          <DynamicPreviewRenderer
            definition={definition}
            currentPage="/"
            viewport={viewport}
            editable={false}
            onDefinitionChange={setDefinition}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/40 text-sm">
            Pattern Library — {countTotalPatterns()} patterns • {countTotalVariants()}+ variants
          </p>
          <p className="text-white/20 text-xs mt-2">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function PatternSection({
  id,
  title,
  description,
  count,
  children,
}: {
  id: string;
  title: string;
  description: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6 py-12 border-b border-white/5">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full font-medium">
            {count} patterns
          </span>
        </div>
        <p className="text-white/60 mt-2">{description}</p>
      </div>
      {children}
    </section>
  );
}

function PatternCard({
  patternId,
  name,
  variants,
  children,
}: {
  patternId: string;
  name: string;
  variants?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-white/5">
      {/* Pattern info header */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <code className="text-xs text-orange-400 font-mono bg-orange-400/10 px-2 py-1 rounded">
            {patternId}
          </code>
          <span className="text-white/60 text-sm">{name}</span>
        </div>
        {variants && variants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <span
                key={v}
                className="text-xs px-2 py-1 bg-white/5 rounded text-white/40"
              >
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pattern render */}
      {children}
    </div>
  );
}

// ============================================================================
// Stats Helpers
// ============================================================================

function countTotalPatterns(): number {
  // Heroes: 5, Features: 5, Social Proof: 2, Pricing: 1, CTA: 1, FAQ: 1
  return 15;
}

function countTotalVariants(): number {
  // Approximate count of all variants shown
  return 30;
}
