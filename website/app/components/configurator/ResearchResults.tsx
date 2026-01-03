"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb,
  Target,
  Users,
  Zap,
  Package,
  Sparkles,
} from "lucide-react";
import type { ResearchResult, FeatureRecommendation } from "@/lib/research-client";

interface ResearchResultsProps {
  result: ResearchResult;
  onApplyRecommendations: (recommendations: {
    template: string;
    features: Record<string, string[]>;
    integrations: string[];
  }) => void;
  appliedFeatures?: Record<string, string[]>;
}

export function ResearchResults({
  result,
  onApplyRecommendations,
  appliedFeatures = {},
}: ResearchResultsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["recommendations"]);
  const [applied, setApplied] = useState(false);

  const { analysis } = result;
  const { domainInsights, recommendations, urlAnalysis, competitorInsights } = analysis;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleApplyAll = () => {
    // Convert recommendations to feature selection format
    const featuresByCategory: Record<string, string[]> = {};
    recommendations.suggestedFeatures.forEach((rec) => {
      featuresByCategory[rec.category] = rec.features;
    });

    onApplyRecommendations({
      template: recommendations.suggestedTemplate,
      features: featuresByCategory,
      integrations: recommendations.suggestedIntegrations,
    });
    setApplied(true);
  };

  const isExpanded = (section: string) => expandedSections.includes(section);

  return (
    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
      {/* Success Header */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Research Complete</h3>
            <p className="text-sm text-foreground-muted">
              Analyzed your domain and {urlAnalysis.length} inspiration site(s)
            </p>
          </div>
          <Button
            onClick={handleApplyAll}
            disabled={applied}
            className={cn(
              "gap-2",
              applied
                ? "bg-emerald-500 text-white"
                : "bg-primary hover:bg-primary-hover text-primary-foreground"
            )}
          >
            {applied ? (
              <>
                <Check className="h-4 w-4" />
                Applied
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Apply All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Domain Overview */}
      <CollapsibleSection
        title="Domain Insights"
        icon={<Target className="h-4 w-4" />}
        isExpanded={isExpanded("domain")}
        onToggle={() => toggleSection("domain")}
      >
        <div className="space-y-3">
          <p className="text-sm text-foreground-secondary leading-relaxed">
            {domainInsights.overview}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-foreground-muted" />
            <span className="text-foreground-muted">Target:</span>
            <span className="text-foreground">{domainInsights.targetAudience}</span>
          </div>

          <div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Common Features
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {domainInsights.commonFeatures.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Competitor Patterns
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {domainInsights.competitorPatterns.map((pattern) => (
                <Badge key={pattern} variant="outline" className="text-xs">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Recommendations - Default Open */}
      <CollapsibleSection
        title="Recommendations"
        icon={<Lightbulb className="h-4 w-4" />}
        badge={`${recommendations.suggestedFeatures.length} categories`}
        isExpanded={isExpanded("recommendations")}
        onToggle={() => toggleSection("recommendations")}
        highlight
      >
        <div className="space-y-4">
          {/* Suggested Template */}
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <Package className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <span className="text-xs text-foreground-muted">Suggested Template</span>
              <div className="font-semibold text-foreground capitalize">
                {recommendations.suggestedTemplate}
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              Best Match
            </Badge>
          </div>
          <p className="text-xs text-foreground-muted">
            {recommendations.templateReason}
          </p>

          {/* Feature Recommendations */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Recommended Features
            </span>
            {recommendations.suggestedFeatures.map((rec) => (
              <FeatureRecommendationCard
                key={rec.category}
                recommendation={rec}
                isApplied={!!appliedFeatures[rec.category]?.length}
              />
            ))}
          </div>

          {/* Suggested Integrations */}
          <div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Suggested Integrations
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {recommendations.suggestedIntegrations.map((integration) => (
                <Badge
                  key={integration}
                  variant="secondary"
                  className="text-xs bg-[#0052FF]/10 text-[#0052FF] border-[#0052FF]/20"
                >
                  {integration}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* URL Analysis */}
      {urlAnalysis.length > 0 && (
        <CollapsibleSection
          title="Inspiration Analysis"
          icon={<ExternalLink className="h-4 w-4" />}
          badge={`${urlAnalysis.length} sites`}
          isExpanded={isExpanded("urls")}
          onToggle={() => toggleSection("urls")}
        >
          <div className="space-y-3">
            {urlAnalysis.map((site) => (
              <div
                key={site.url}
                className="p-3 bg-background-alt rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ExternalLink className="h-3 w-3 text-foreground-muted" />
                  <span className="font-medium text-sm text-foreground truncate">
                    {site.title}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {site.features.slice(0, 5).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <ul className="text-xs text-foreground-muted space-y-1">
                  {site.keyTakeaways.slice(0, 2).map((takeaway, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-primary">•</span>
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Competitor Insights */}
      {competitorInsights && (
        <CollapsibleSection
          title="Differentiation Opportunities"
          icon={<Zap className="h-4 w-4" />}
          isExpanded={isExpanded("insights")}
          onToggle={() => toggleSection("insights")}
        >
          <p className="text-sm text-foreground-secondary leading-relaxed">
            {competitorInsights}
          </p>
        </CollapsibleSection>
      )}
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  badge,
  isExpanded,
  onToggle,
  children,
  highlight = false,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-card"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-background-alt transition-colors"
      >
        <span className="text-foreground-muted">{icon}</span>
        <span className="font-medium text-foreground text-sm flex-1 text-left">
          {title}
        </span>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-foreground-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        )}
      </button>
      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// Feature Recommendation Card
function FeatureRecommendationCard({
  recommendation,
  isApplied,
}: {
  recommendation: FeatureRecommendation;
  isApplied: boolean;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        isApplied
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-background-alt border-border"
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-medium text-sm text-foreground capitalize">
          {recommendation.category}
        </span>
        {isApplied && (
          <Check className="h-3 w-3 text-emerald-500" />
        )}
      </div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {recommendation.features.map((feature) => (
          <Badge key={feature} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-foreground-muted">{recommendation.reason}</p>
    </div>
  );
}

export default ResearchResults;

