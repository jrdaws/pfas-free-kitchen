"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { PreviewLink } from "./PreviewLink";
import { StyledButton, type ComponentStyleButton } from "./StyledButton";
import { StyledCard, type ComponentStyleCard } from "./StyledCard";
import { FeatureBadges, type DetectedFeatures } from "./FeatureBadges";
import type { PreviewComposition, PreviewPage, PreviewComponent } from "./types";
import type { WebsiteAnalysis, AppliedStyles } from "./analysis-types";
import { extractAppliedStyles } from "./analysis-types";

interface ComposedPreviewProps {
  composition: PreviewComposition;
  currentPath: string;
  onNavigate: (path: string) => void;
  websiteAnalysis?: WebsiteAnalysis;
  className?: string;
}

export function ComposedPreview({
  composition,
  currentPath,
  onNavigate,
  websiteAnalysis,
  className,
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
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
                  ? "text-indigo-600"
                  : "text-slate-600 hover:text-slate-900"
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

    // Basic component rendering - in a real implementation, 
    // these would be actual component imports from a pattern library
    switch (type) {
      case "hero":
        return (
          <section
            className="px-6 py-24 text-center"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)` 
            }}
          >
            <h1 className={cn(
              "text-4xl md:text-5xl text-slate-900 mb-4",
              appliedStyles?.typography.headingClass || "font-bold"
            )}>
              {(props.headline as string) || "Welcome to Our Platform"}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              {(props.subheadline as string) || "Build something amazing with our tools."}
            </p>
            <div className="flex gap-4 justify-center">
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
          </section>
        );

      case "features":
        const features = (props.features as { title: string; description: string; icon: string }[]) || [
          { title: "Fast", description: "Lightning quick performance", icon: "⚡" },
          { title: "Secure", description: "Enterprise-grade security", icon: "🔒" },
          { title: "Scalable", description: "Grows with your business", icon: "📈" },
        ];
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
                  <div 
                    className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center text-2xl"
                    style={{ 
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                  >
                    {feature.icon}
                  </div>
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
        const plans = (props.plans as { name: string; price: string; features: string[] }[]) || [
          { name: "Starter", price: "$9", features: ["5 projects", "Basic support"] },
          { name: "Pro", price: "$29", features: ["Unlimited projects", "Priority support", "API access"] },
          { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "Dedicated support", "SLA"] },
        ];
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
                    i === 1 ? "border-indigo-500 shadow-lg" : "border-slate-200"
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
        const testimonials = (props.testimonials as { quote: string; author: string; role: string }[]) || [
          { quote: "This product changed how we work.", author: "Jane Doe", role: "CEO" },
          { quote: "Best decision we ever made.", author: "John Smith", role: "CTO" },
        ];
        return (
          <section className="px-6 py-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              What Our Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((t, i) => (
                <blockquote key={i} className="p-6 bg-slate-50 rounded-xl">
                  <p className="text-slate-700 italic mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="text-sm">
                    <strong className="text-slate-900">{t.author}</strong>
                    <span className="text-slate-500"> · {t.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        );

      default:
        return (
          <div className="p-6 bg-slate-100 text-center text-slate-500">
            <p>Unknown component: {type}</p>
          </div>
        );
    }
  }, [component, theme, onNavigate]);

  return <>{renderComponent()}</>;
}

