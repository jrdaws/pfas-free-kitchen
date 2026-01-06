"use client"

import { useState } from "react"
import { Check, X, ChevronDown, ChevronUp, Edit2, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ConfigSuggestions,
  getConfidenceLevel,
  getConfidenceColor,
} from "@/lib/ai/config-suggester-types"

interface SuggestionCardsProps {
  suggestions: ConfigSuggestions
  onAccept: (category: keyof ConfigSuggestions, value: unknown) => void
  onReject: (category: keyof ConfigSuggestions) => void
}

interface CategoryCardProps {
  title: string
  icon: React.ReactNode
  confidence: number
  reasoning: string
  children: React.ReactNode
  onAccept: () => void
  onReject: () => void
  accepted?: boolean
  rejected?: boolean
}

function CategoryCard({
  title,
  icon,
  confidence,
  reasoning,
  children,
  onAccept,
  onReject,
  accepted,
  rejected,
}: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const level = getConfidenceLevel(confidence)

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        accepted && "border-green-500 bg-green-500/10",
        rejected && "border-red-500 bg-red-500/10 opacity-50",
        !accepted && !rejected && "border-border bg-card"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence badge */}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              level === "high" && "bg-green-500/20 text-green-400",
              level === "medium" && "bg-yellow-500/20 text-yellow-400",
              level === "low" && "bg-red-500/20 text-red-400"
            )}
          >
            {Math.round(confidence * 100)}%
          </span>

          {/* Reasoning tooltip */}
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="p-1 hover:bg-muted rounded"
            title="View reasoning"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-muted rounded"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Reasoning tooltip */}
      {showReasoning && (
        <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
          {reasoning}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {children}

          {/* Accept/Reject buttons */}
          {!accepted && !rejected && (
            <div className="flex gap-2 pt-2 border-t">
              <button
                onClick={onAccept}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
              >
                <Check className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </div>
          )}

          {accepted && (
            <div className="pt-2 border-t text-center text-sm text-green-400">
              ✓ Applied to configuration
            </div>
          )}

          {rejected && (
            <div className="pt-2 border-t text-center text-sm text-red-400">
              ✗ Skipped
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TagList({ items, variant = "default" }: { items: string[]; variant?: "default" | "success" | "warning" | "muted" }) {
  const colors = {
    default: "bg-primary/20 text-primary",
    success: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    muted: "bg-muted text-muted-foreground",
  }

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span key={i} className={cn("text-xs px-2 py-0.5 rounded", colors[variant])}>
          {item}
        </span>
      ))}
    </div>
  )
}

export function SuggestionCards({ suggestions, onAccept, onReject }: SuggestionCardsProps) {
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "rejected">>({})

  const handleAccept = (category: keyof ConfigSuggestions) => {
    setDecisions((prev) => ({ ...prev, [category]: "accepted" }))
    onAccept(category, suggestions[category])
  }

  const handleReject = (category: keyof ConfigSuggestions) => {
    setDecisions((prev) => ({ ...prev, [category]: "rejected" }))
    onReject(category)
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Analysis</span>
          <span className={cn("font-bold", getConfidenceColor(suggestions.overallConfidence))}>
            {Math.round(suggestions.overallConfidence * 100)}% confident
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{suggestions.summary}</p>
      </div>

      {/* Audience */}
      <CategoryCard
        title="Target Audience"
        icon={<span className="text-lg">👥</span>}
        confidence={suggestions.audience.confidence}
        reasoning={suggestions.audience.reasoning}
        onAccept={() => handleAccept("audience")}
        onReject={() => handleReject("audience")}
        accepted={decisions.audience === "accepted"}
        rejected={decisions.audience === "rejected"}
      >
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Primary:</span>
            <p className="font-medium">{suggestions.audience.primary}</p>
          </div>
          {suggestions.audience.secondary && (
            <div>
              <span className="text-xs text-muted-foreground">Secondary:</span>
              <p>{suggestions.audience.secondary}</p>
            </div>
          )}
          <div>
            <span className="text-xs text-muted-foreground">Pain Points:</span>
            <TagList items={suggestions.audience.painPoints} variant="warning" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Goals:</span>
            <TagList items={suggestions.audience.goals} variant="success" />
          </div>
        </div>
      </CategoryCard>

      {/* Design */}
      <CategoryCard
        title="Design & Style"
        icon={<span className="text-lg">🎨</span>}
        confidence={suggestions.design.confidence}
        reasoning={suggestions.design.reasoning}
        onAccept={() => handleAccept("design")}
        onReject={() => handleReject("design")}
        accepted={decisions.design === "accepted"}
        rejected={decisions.design === "rejected"}
      >
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Aesthetic:</span>
            <p className="capitalize">{suggestions.design.aesthetic}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Typography:</span>
            <p className="capitalize">{suggestions.design.typography}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Color Mode:</span>
            <p className="capitalize">{suggestions.design.colorMode}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Imagery:</span>
            <p className="capitalize">{suggestions.design.imagery}</p>
          </div>
          <div className="col-span-2">
            <span className="text-xs text-muted-foreground">Suggested Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: suggestions.design.suggestedPrimaryColor }}
              />
              <span className="font-mono text-xs">{suggestions.design.suggestedPrimaryColor}</span>
            </div>
          </div>
        </div>
      </CategoryCard>

      {/* Features */}
      <CategoryCard
        title="Features"
        icon={<span className="text-lg">⚡</span>}
        confidence={suggestions.features.confidence}
        reasoning={suggestions.features.reasoning}
        onAccept={() => handleAccept("features")}
        onReject={() => handleReject("features")}
        accepted={decisions.features === "accepted"}
        rejected={decisions.features === "rejected"}
      >
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Required:</span>
            <TagList items={suggestions.features.required} variant="success" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Nice to Have:</span>
            <TagList items={suggestions.features.niceToHave} />
          </div>
          {suggestions.features.excluded.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Excluded:</span>
              <TagList items={suggestions.features.excluded} variant="muted" />
            </div>
          )}
        </div>
      </CategoryCard>

      {/* Template */}
      <CategoryCard
        title="Template"
        icon={<span className="text-lg">📋</span>}
        confidence={suggestions.template.confidence}
        reasoning={suggestions.template.reasoning}
        onAccept={() => handleAccept("template")}
        onReject={() => handleReject("template")}
        accepted={decisions.template === "accepted"}
        rejected={decisions.template === "rejected"}
      >
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Recommended:</span>
            <p className="font-medium capitalize">{suggestions.template.recommended}</p>
          </div>
          {suggestions.template.alternatives.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Alternatives:</span>
              <TagList items={suggestions.template.alternatives} variant="muted" />
            </div>
          )}
        </div>
      </CategoryCard>

      {/* Monetization */}
      <CategoryCard
        title="Monetization"
        icon={<span className="text-lg">💰</span>}
        confidence={suggestions.monetization.confidence}
        reasoning={suggestions.monetization.reasoning}
        onAccept={() => handleAccept("monetization")}
        onReject={() => handleReject("monetization")}
        accepted={decisions.monetization === "accepted"}
        rejected={decisions.monetization === "rejected"}
      >
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Model:</span>
            <p className="capitalize">{suggestions.monetization.model}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Tiers:</span>
            <p>{suggestions.monetization.suggestedTiers}</p>
          </div>
          {suggestions.monetization.priceRange && (
            <div className="col-span-2">
              <span className="text-xs text-muted-foreground">Price Range:</span>
              <p>
                ${suggestions.monetization.priceRange.low} - ${suggestions.monetization.priceRange.high}/mo
              </p>
            </div>
          )}
        </div>
      </CategoryCard>

      {/* Integrations */}
      <CategoryCard
        title="Integrations"
        icon={<span className="text-lg">🔌</span>}
        confidence={suggestions.integrations.confidence}
        reasoning={suggestions.integrations.reasoning}
        onAccept={() => handleAccept("integrations")}
        onReject={() => handleReject("integrations")}
        accepted={decisions.integrations === "accepted"}
        rejected={decisions.integrations === "rejected"}
      >
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Recommended:</span>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {Object.entries(suggestions.integrations.recommended).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground capitalize">{key}:</span>{" "}
                  <span className="text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {suggestions.integrations.optional.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Optional:</span>
              <TagList items={suggestions.integrations.optional} variant="muted" />
            </div>
          )}
        </div>
      </CategoryCard>

      {/* Pages */}
      <CategoryCard
        title="Pages"
        icon={<span className="text-lg">📄</span>}
        confidence={suggestions.pages.confidence}
        reasoning={suggestions.pages.reasoning}
        onAccept={() => handleAccept("pages")}
        onReject={() => handleReject("pages")}
        accepted={decisions.pages === "accepted"}
        rejected={decisions.pages === "rejected"}
      >
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Required:</span>
            <TagList items={suggestions.pages.required} variant="success" />
          </div>
          {suggestions.pages.optional.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Optional:</span>
              <TagList items={suggestions.pages.optional} variant="muted" />
            </div>
          )}
        </div>
      </CategoryCard>

      {/* Inspiration */}
      <CategoryCard
        title="Inspiration"
        icon={<span className="text-lg">💡</span>}
        confidence={suggestions.inspiration.confidence}
        reasoning={suggestions.inspiration.reasoning}
        onAccept={() => handleAccept("inspiration")}
        onReject={() => handleReject("inspiration")}
        accepted={decisions.inspiration === "accepted"}
        rejected={decisions.inspiration === "rejected"}
      >
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Industry:</span>
            <p className="capitalize">{suggestions.inspiration.industry}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Competitors:</span>
            <TagList items={suggestions.inspiration.competitors} />
          </div>
          {suggestions.inspiration.suggestedUrls.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Inspiration Sites:</span>
              <div className="space-y-1 mt-1">
                {suggestions.inspiration.suggestedUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary hover:underline truncate"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </CategoryCard>
    </div>
  )
}

