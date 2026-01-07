"use client";

import React, { useState } from "react";
import { DynamicPreviewRenderer, createTestDefinition } from "@/components/preview/DynamicPreviewRenderer";
import { ProjectDefinition, DEFAULT_BRANDING } from "@/lib/patterns/types";

// Import individual patterns for direct testing
import { HeroCenteredGradient } from "@/lib/patterns/patterns/heroes/centered-gradient";
import { HeroSplitImage } from "@/lib/patterns/patterns/heroes/split-image";
import { HeroAnimatedText } from "@/lib/patterns/patterns/heroes/animated-text";
import { HeroSimpleCentered } from "@/lib/patterns/patterns/heroes/simple-centered";
import { FeaturesIconGrid } from "@/lib/patterns/patterns/features/icon-grid-3col";
import { FeaturesBentoGrid } from "@/lib/patterns/patterns/features/bento-grid";
import { FeaturesCards } from "@/lib/patterns/patterns/features/feature-cards";

/**
 * Pattern Library Test Page
 * 
 * Tests all pattern components and the SectionRenderer/DynamicPreviewRenderer system.
 */
export default function PatternTestPage() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [definition, setDefinition] = useState<ProjectDefinition>(createTestDefinition());
  const [activeTab, setActiveTab] = useState<"individual" | "composed">("individual");

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Pattern Library Test</h1>
          
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

            {/* Viewport switcher */}
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
      </header>

      {/* Content */}
      {activeTab === "individual" ? (
        <div className="space-y-1">
          {/* Hero Patterns */}
          <section>
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-2">Hero Patterns</h2>
              <p className="text-white/60 mb-8">5 hero pattern implementations</p>
            </div>

            {/* Centered Gradient Hero */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">hero-centered-gradient</span>
              </div>
              <HeroCenteredGradient
                headline="Build the Future Today"
                subheadline="A modern platform that helps you ship faster with less complexity."
                primaryCta={{ text: "Get Started", href: "#" }}
                secondaryCta={{ text: "Learn More", href: "#" }}
                badge="Now in beta"
              />
            </div>

            {/* Split Image Hero */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">hero-split-image</span>
              </div>
              <HeroSplitImage
                headline="Ship to production, instantly"
                subheadline="Deploy your code with zero configuration."
                primaryCta={{ text: "Start Deploying", href: "#" }}
                secondaryCta={{ text: "View Demo", href: "#" }}
              />
            </div>

            {/* Animated Text Hero */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">hero-animated-gradient</span>
              </div>
              <HeroAnimatedText
                headline="Build apps that"
                subheadline="The most flexible platform for developers."
                primaryCta={{ text: "Get Started", href: "#" }}
                secondaryCta={{ text: "Documentation", href: "#" }}
              />
            </div>

            {/* Simple Centered Hero */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">hero-centered (simple)</span>
              </div>
              <HeroSimpleCentered
                headline="Simple, powerful, effective"
                subheadline="Everything you need, nothing you don't."
                primaryCta={{ text: "Try Free", href: "#" }}
                secondaryCta={{ text: "See Pricing", href: "#" }}
                badge="New"
              />
            </div>
          </section>

          {/* Feature Patterns */}
          <section>
            <div className="max-w-7xl mx-auto px-6 py-8 border-t border-white/5">
              <h2 className="text-2xl font-bold text-white mb-2">Feature Patterns</h2>
              <p className="text-white/60 mb-8">5 feature pattern implementations</p>
            </div>

            {/* Icon Grid */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">features-icon-grid</span>
              </div>
              <FeaturesIconGrid
                title="Everything you need"
                subtitle="Built for modern teams and workflows"
              />
            </div>

            {/* Bento Grid */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">features-bento</span>
              </div>
              <FeaturesBentoGrid
                title="Powerful features"
                subtitle="Everything you need to succeed"
              />
            </div>

            {/* Feature Cards */}
            <div className="border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6 py-4 bg-white/[0.02]">
                <span className="text-xs text-white/40 font-mono">features-cards</span>
              </div>
              <FeaturesCards
                title="Why choose us"
                subtitle="Here's what sets us apart"
              />
            </div>
          </section>
        </div>
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
        <div className="max-w-7xl mx-auto px-6 text-center text-white/40 text-sm">
          Pattern Library Test Page — {new Date().toLocaleDateString()}
        </div>
      </footer>
    </div>
  );
}

