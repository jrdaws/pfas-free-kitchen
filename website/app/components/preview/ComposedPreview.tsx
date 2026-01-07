"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { PreviewLink } from "./PreviewLink";
import { StyledButton, type ComponentStyleButton } from "./StyledButton";
import { StyledCard, type ComponentStyleCard } from "./StyledCard";
import { FeatureBadges, type DetectedFeatures } from "./FeatureBadges";
import { EditableText } from "@/components/preview/EditableText";
import { EditableWrapper } from "@/components/preview/EditableWrapper";
import type { PreviewComposition, PreviewPage, PreviewComponent } from "./types";
import type { WebsiteAnalysis, AppliedStyles } from "./analysis-types";
import { extractAppliedStyles } from "./analysis-types";

interface ComposedPreviewProps {
  composition: PreviewComposition;
  currentPath: string;
  onNavigate: (path: string) => void;
  websiteAnalysis?: WebsiteAnalysis;
  className?: string;
  editable?: boolean;
  onComponentEdit?: (componentId: string, updates: Record<string, unknown>) => void;
}

export function ComposedPreview({
  composition,
  currentPath,
  onNavigate,
  websiteAnalysis,
  className,
  editable = false,
  onComponentEdit,
}: ComposedPreviewProps) {
  const currentPage = composition.pages.find((p) => p.path === currentPath);
  
  // Extract applied styles from analysis
  const appliedStyles = useMemo(
    () => extractAppliedStyles(websiteAnalysis),
    [websiteAnalysis]
  );
  
  // Build CSS variable styles from analysis or theme
  const colorStyles = useMemo(() => {
    if (appliedStyles) {
      return {
        "--preview-primary": appliedStyles.colors.primary,
        "--preview-secondary": appliedStyles.colors.secondary,
        "--preview-accent": appliedStyles.colors.accent,
        "--preview-background": appliedStyles.colors.background,
        "--preview-foreground": appliedStyles.colors.foreground,
        "--preview-muted": appliedStyles.colors.muted,
      } as React.CSSProperties;
    }
    // Fall back to theme
    return {
      "--preview-primary": composition.theme.primaryColor,
      "--preview-secondary": composition.theme.secondaryColor,
      "--preview-background": composition.theme.backgroundColor,
      "--preview-foreground": composition.theme.textColor,
    } as React.CSSProperties;
  }, [appliedStyles, composition.theme]);

  if (!currentPage) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-slate-700">Page Not Found</h3>
        <p className="text-sm text-slate-500 mt-2">
          No page exists at <code className="px-1 py-0.5 bg-slate-100 rounded">{currentPath}</code>
        </p>
        <button
          onClick={() => onNavigate("/")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div 
      className={cn("min-h-full bg-white", className)}
      style={colorStyles}
    >
      {/* Feature badges from analysis */}
      {websiteAnalysis?.features && (
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
          <FeatureBadges
            features={websiteAnalysis.features as DetectedFeatures}
            variant="compact"
            primaryColor={appliedStyles?.colors.primary}
          />
        </div>
      )}
      
      {/* Render navigation */}
      <PreviewNavigation
        navigation={composition.navigation}
        currentPath={currentPath}
        onNavigate={onNavigate}
        siteName={composition.projectName}
        theme={composition.theme}
        appliedStyles={appliedStyles}
      />

      {/* Render page components */}
      <main>
        {currentPage.components.map((component) => (
          <PreviewComponentRenderer
            key={component.id}
            component={component}
            onNavigate={onNavigate}
            theme={composition.theme}
            appliedStyles={appliedStyles}
          />
        ))}
      </main>

      {/* Simple footer */}
      <footer className="px-6 py-8 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          © 2026 {composition.projectName}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

interface PreviewNavigationProps {
  navigation: PreviewComposition["navigation"];
  currentPath: string;
  onNavigate: (path: string) => void;
  siteName: string;
  theme: PreviewComposition["theme"];
  appliedStyles?: AppliedStyles | null;
}

function PreviewNavigation({
  navigation,
  currentPath,
  onNavigate,
  siteName,
  theme,
  appliedStyles,
}: PreviewNavigationProps) {
  const primaryColor = appliedStyles?.colors.primary || theme.primaryColor;
  return (
    <header
      className="sticky top-0 z-50 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-slate-200"
      style={{ fontFamily: theme.fontFamily }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div
          className="text-xl font-bold cursor-pointer"
          style={{ color: primaryColor }}
          onClick={() => onNavigate("/")}
        >
          {siteName}
        </div>
        <nav className="flex items-center gap-6">
          {navigation.map((link) => (
            <PreviewLink
              key={link.path}
              href={link.path}
              onNavigate={onNavigate}
              className={cn(
                "text-sm font-medium transition-colors",
                currentPath === link.path
                  ? "text-primary"
                  : "text-foreground-secondary hover:text-foreground"
              )}
            >
              {link.label}
            </PreviewLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

interface PreviewComponentRendererProps {
  component: PreviewComponent;
  onNavigate: (path: string) => void;
  theme: PreviewComposition["theme"];
  appliedStyles?: AppliedStyles | null;
}

// Extract base type from pattern ID (e.g., "hero-split-image" -> "hero")
function getBaseType(type: string): string {
  // Common pattern prefixes
  const prefixes = ["hero", "features", "pricing", "testimonials", "cta", "footer", "faq", "navigation", "stats", "team", "product", "blog"];
  
  for (const prefix of prefixes) {
    if (type.startsWith(prefix)) {
      return prefix;
    }
  }
  
  // Fallback: take the first part before any dash
  return type.split("-")[0];
}

function PreviewComponentRenderer({
  component,
  onNavigate,
  theme,
  appliedStyles,
}: PreviewComponentRendererProps) {
  // Use applied styles colors or fall back to theme
  const primaryColor = appliedStyles?.colors.primary || theme.primaryColor;
  const secondaryColor = appliedStyles?.colors.secondary || theme.secondaryColor;
  const buttonStyle = appliedStyles?.components.button;
  const cardStyle = appliedStyles?.components.card;
  const renderComponent = useCallback(() => {
    const { type, props } = component;
    
    // Get base type from pattern ID (e.g., "hero-split-image" -> "hero")
    const baseType = getBaseType(type);

    // Basic component rendering - in a real implementation, 
    // these would be actual component imports from a pattern library
    switch (baseType) {
      case "hero":
        // Check for hero image in props
        const heroImage = (props.heroImage as string) || (props.image as string) || (props.backgroundImage as string);
        const hasHeroImage = heroImage && heroImage.startsWith("http");
        
        return (
          <section
            className={cn(
              "px-6 py-16 md:py-24",
              hasHeroImage ? "grid md:grid-cols-2 gap-8 items-center" : "text-center"
            )}
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)` 
            }}
          >
            <div className={cn(hasHeroImage && "order-1")}>
              <h1 className={cn(
                "text-4xl md:text-5xl text-slate-900 mb-4",
                appliedStyles?.typography.headingClass || "font-bold",
                !hasHeroImage && "max-w-3xl mx-auto"
              )}>
                {(props.headline as string) || "Welcome to Our Platform"}
              </h1>
              <p className={cn(
                "text-xl text-slate-600 mb-8",
                !hasHeroImage && "max-w-2xl mx-auto"
              )}>
                {(props.subheadline as string) || "Build something amazing with our tools."}
              </p>
              <div className={cn("flex gap-4", !hasHeroImage && "justify-center")}>
                <PreviewLink
                  href={(props.ctaLink as string) || "/signup"}
                  onNavigate={onNavigate}
                >
                  <StyledButton
                    componentStyle={buttonStyle}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    variant="primary"
                  >
                    {(props.ctaText as string) || "Get Started"}
                  </StyledButton>
                </PreviewLink>
                <PreviewLink
                  href={(props.secondaryLink as string) || "/features"}
                  onNavigate={onNavigate}
                >
                  <StyledButton
                    componentStyle={{ ...buttonStyle, style: "outline" }}
                    primaryColor={primaryColor}
                    variant="secondary"
                  >
                    Learn More
                  </StyledButton>
                </PreviewLink>
              </div>
            </div>
            {hasHeroImage && (
              <div className="order-2">
                <img
                  src={heroImage}
                  alt={(props.headline as string) || "Hero image"}
                  className="w-full h-auto rounded-xl shadow-lg object-cover max-h-[400px]"
                />
              </div>
            )}
          </section>
        );

      case "features":
        const defaultFeatures: { title: string; description: string; icon: string; image?: string }[] = [
          { title: "Fast", description: "Lightning quick performance", icon: "⚡" },
          { title: "Secure", description: "Enterprise-grade security", icon: "🔒" },
          { title: "Scalable", description: "Grows with your business", icon: "📈" },
        ];
        const rawFeatures = (props.features as { title?: string; description?: string; icon?: string; image?: string }[]);
        const features = Array.isArray(rawFeatures) && rawFeatures.length > 0
          ? rawFeatures.map((f, idx) => ({
              title: f.title || defaultFeatures[idx]?.title || `Feature ${idx + 1}`,
              description: f.description || defaultFeatures[idx]?.description || "Description",
              icon: f.icon || defaultFeatures[idx]?.icon || "✨",
              image: f.image,
            }))
          : defaultFeatures;
        return (
          <section className="px-6 py-16">
            <h2 className={cn(
              "text-3xl text-center text-slate-900 mb-12",
              appliedStyles?.typography.headingClass || "font-bold"
            )}>
              {(props.title as string) || "Features"}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <StyledCard key={i} componentStyle={cardStyle} className="text-center">
                  {feature.image && feature.image.startsWith("http") ? (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-16 h-16 mx-auto mb-4 rounded-lg object-cover"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center text-2xl"
                      style={{ 
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                    >
                      {feature.icon}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </StyledCard>
              ))}
            </div>
          </section>
        );

      case "pricing":
        const defaultPlans = [
          { name: "Starter", price: "$9", features: ["5 projects", "Basic support"] },
          { name: "Pro", price: "$29", features: ["Unlimited projects", "Priority support", "API access"] },
          { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "Dedicated support", "SLA"] },
        ];
        // Normalize plans to ensure each has a features array
        const rawPlans = (props.plans as { name?: string; price?: string; features?: string[] }[]) || defaultPlans;
        const plans = rawPlans.map((p, idx) => ({
          name: p.name || defaultPlans[idx]?.name || `Plan ${idx + 1}`,
          price: p.price || defaultPlans[idx]?.price || "$0",
          features: Array.isArray(p.features) ? p.features : (defaultPlans[idx]?.features || ["Feature included"]),
        }));
        return (
          <section className="px-6 py-16 bg-slate-50">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              {(props.title as string) || "Pricing"}
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-6 rounded-xl bg-white border-2 transition-shadow hover:shadow-lg",
                    i === 1 ? "border-primary shadow-lg" : "border-slate-200"
                  )}
                >
                  <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                  <div className="text-3xl font-bold mt-2" style={{ color: theme.primaryColor }}>
                    {plan.price}
                    <span className="text-sm text-slate-500 font-normal">/mo</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-green-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <PreviewLink
                    href="/signup"
                    onNavigate={onNavigate}
                    className="block w-full mt-6 px-4 py-2 rounded-lg text-center text-white font-medium"
                  >
                    <span
                      className="block w-full px-4 py-2 rounded-lg text-center text-white font-medium"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Choose Plan
                    </span>
                  </PreviewLink>
                </div>
              ))}
            </div>
          </section>
        );

      case "cta":
        return (
          <section
            className="px-6 py-16 text-center"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {(props.headline as string) || "Ready to Get Started?"}
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              {(props.subheadline as string) || "Join thousands of satisfied customers today."}
            </p>
            <PreviewLink
              href={(props.ctaLink as string) || "/signup"}
              onNavigate={onNavigate}
              className="inline-block px-8 py-3 bg-white rounded-lg font-medium"
            >
              <span style={{ color: theme.primaryColor }}>
                {(props.ctaText as string) || "Start Free Trial"}
              </span>
            </PreviewLink>
          </section>
        );

      case "testimonials":
        const defaultTestimonials: { quote: string; author: string; role: string; avatar?: string }[] = [
          { quote: "This product changed how we work.", author: "Jane Doe", role: "CEO" },
          { quote: "Best decision we ever made.", author: "John Smith", role: "CTO" },
        ];
        const rawTestimonials = (props.testimonials as { quote?: string; author?: string; role?: string; avatar?: string; image?: string }[]);
        const testimonials = Array.isArray(rawTestimonials) && rawTestimonials.length > 0
          ? rawTestimonials.map((t, idx) => ({
              quote: t.quote || defaultTestimonials[idx]?.quote || "Great product!",
              author: t.author || defaultTestimonials[idx]?.author || "Customer",
              role: t.role || defaultTestimonials[idx]?.role || "User",
              avatar: t.avatar || t.image,
            }))
          : defaultTestimonials;
        return (
          <section className="px-6 py-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              What Our Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="p-6 bg-slate-50 rounded-xl">
                  <p className="text-slate-700 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="flex items-center gap-3 text-sm">
                    {t.avatar && t.avatar.startsWith("http") ? (
                      <img
                        src={t.avatar}
                        alt={t.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <strong className="text-slate-900">{t.author}</strong>
                      <span className="text-slate-500"> · {t.role}</span>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        );

      case "footer":
        // Footer is already rendered in the parent, skip rendering
        return null;

      case "navigation":
        // Navigation is already rendered in the parent, skip rendering
        return null;

      case "product":
        const defaultProducts: { name: string; price: string; image?: string }[] = [
          { name: "Product One", price: "$99" },
          { name: "Product Two", price: "$149" },
          { name: "Product Three", price: "$199" },
          { name: "Product Four", price: "$249" },
        ];
        const rawProducts = (props.products as { name?: string; price?: string; image?: string }[]);
        const products = Array.isArray(rawProducts) && rawProducts.length > 0
          ? rawProducts.map((p, idx) => ({
              name: p.name || defaultProducts[idx]?.name || `Product ${idx + 1}`,
              price: p.price || defaultProducts[idx]?.price || "$0",
              image: p.image,
            }))
          : defaultProducts;
        return (
          <section className="px-6 py-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              {(props.title as string) || "Featured Products"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {products.map((product, i) => (
                <StyledCard key={i} componentStyle={cardStyle} className="text-center p-4">
                  {product.image && product.image.startsWith("http") ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square mb-4 rounded-lg object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full aspect-square mb-4 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <span className="text-3xl">🛍️</span>
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-lg font-bold" style={{ color: primaryColor }}>{product.price}</p>
                </StyledCard>
              ))}
            </div>
          </section>
        );

      case "stats":
        const defaultStats = [
          { value: "10K+", label: "Customers" },
          { value: "99.9%", label: "Uptime" },
          { value: "24/7", label: "Support" },
        ];
        const rawStats = (props.stats as { value?: string; label?: string }[]);
        const stats = Array.isArray(rawStats) && rawStats.length > 0
          ? rawStats.map((s, idx) => ({
              value: s.value || defaultStats[idx]?.value || "0",
              label: s.label || defaultStats[idx]?.label || "Stat",
            }))
          : defaultStats;
        return (
          <section className="px-6 py-16 bg-slate-50">
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl font-bold" style={{ color: primaryColor }}>{stat.value}</div>
                  <div className="text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        );

      case "faq":
        const defaultFaqs = [
          { question: "How do I get started?", answer: "Simply sign up and follow our onboarding guide." },
          { question: "What payment methods do you accept?", answer: "We accept all major credit cards and PayPal." },
        ];
        const rawFaqs = (props.faqs as { question?: string; answer?: string }[]);
        const faqs = Array.isArray(rawFaqs) && rawFaqs.length > 0
          ? rawFaqs.map((f, idx) => ({
              question: f.question || defaultFaqs[idx]?.question || "Question?",
              answer: f.answer || defaultFaqs[idx]?.answer || "Answer here.",
            }))
          : defaultFaqs;
        return (
          <section className="px-6 py-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "team":
        const defaultMembers: { name: string; role: string; avatar?: string }[] = [
          { name: "Alex Johnson", role: "CEO" },
          { name: "Sarah Miller", role: "CTO" },
          { name: "Mike Chen", role: "Designer" },
        ];
        const rawMembers = (props.members as { name?: string; role?: string; avatar?: string; image?: string }[]);
        const members = Array.isArray(rawMembers) && rawMembers.length > 0
          ? rawMembers.map((m, idx) => ({
              name: m.name || defaultMembers[idx]?.name || "Team Member",
              role: m.role || defaultMembers[idx]?.role || "Role",
              avatar: m.avatar || m.image,
            }))
          : defaultMembers;
        return (
          <section className="px-6 py-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Our Team
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {members.map((member, i) => (
                <StyledCard key={i} componentStyle={cardStyle} className="text-center p-6">
                  {member.avatar && member.avatar.startsWith("http") ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-slate-600">{member.role}</p>
                </StyledCard>
              ))}
            </div>
          </section>
        );

      default:
        // For unknown components, render a subtle placeholder
        return (
          <section className="px-6 py-12 bg-slate-50 border-y border-slate-200">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-slate-400 text-sm">
                Section: {type}
              </p>
            </div>
          </section>
        );
    }
  }, [component, theme, onNavigate, primaryColor, secondaryColor, buttonStyle, cardStyle, appliedStyles]);

  return <>{renderComponent()}</>;
}

