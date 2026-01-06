"use client"

import { useState } from "react"
import { Wand2, Loader2, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  ConfigSuggestions,
  SuggestConfigResponse,
} from "@/lib/ai/config-suggester-types"
import { SuggestionCards } from "./SuggestionCards"

interface AIConfigHelperProps {
  onApplySuggestions: (category: keyof ConfigSuggestions, value: unknown) => void
  onApplyAll?: (suggestions: ConfigSuggestions) => void
  className?: string
}

type ContextOption = {
  budget?: "low" | "medium" | "high"
  timeline?: "fast" | "normal" | "flexible"
  technicalSkill?: "beginner" | "intermediate" | "advanced"
}

export function AIConfigHelper({
  onApplySuggestions,
  onApplyAll,
  className,
}: AIConfigHelperProps) {
  const [description, setDescription] = useState("")
  const [suggestions, setSuggestions] = useState<ConfigSuggestions | null>(null)
  const [questionsToAsk, setQuestionsToAsk] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingTime, setProcessingTime] = useState<number | null>(null)
  const [showContext, setShowContext] = useState(false)
  const [context, setContext] = useState<ContextOption>({})

  const handleSuggest = async () => {
    if (description.length < 10) {
      setError("Please describe your project in at least 10 characters")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuggestions(null)

    try {
      const response = await fetch("/api/suggest-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          context: Object.keys(context).length > 0 ? context : undefined,
        }),
      })

      const data: SuggestConfigResponse = await response.json()

      if (!data.success) {
        throw new Error((data as { error?: string }).error || "Failed to get suggestions")
      }

      setSuggestions(data.suggestions)
      setQuestionsToAsk(data.questionsToAsk)
      setProcessingTime(data.processingTime)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = () => {
    // Just tracks the rejection, no action needed
  }

  const handleApplyAll = () => {
    if (suggestions && onApplyAll) {
      onApplyAll(suggestions)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wand2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Configuration Assistant</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Describe your project in 1-2 sentences and let AI suggest the optimal configuration.
      </p>

      {/* Description input */}
      <Textarea
        placeholder="Example: A marketplace where pet owners can share and sell custom costumes for their pets..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="resize-none"
      />

      {/* Character count */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{description.length}/2000 characters</span>
        {description.length < 10 && description.length > 0 && (
          <span className="text-yellow-500">Minimum 10 characters</span>
        )}
      </div>

      {/* Context options */}
      <div className="border rounded-lg">
        <button
          onClick={() => setShowContext(!showContext)}
          className="flex items-center justify-between w-full p-3 text-sm"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            Add context (optional)
          </span>
          {showContext ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showContext && (
          <div className="p-3 border-t space-y-3">
            {/* Budget */}
            <div>
              <label className="text-xs text-muted-foreground">Budget</label>
              <div className="flex gap-2 mt-1">
                {(["low", "medium", "high"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setContext((prev) => ({
                        ...prev,
                        budget: prev.budget === option ? undefined : option,
                      }))
                    }
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      context.budget === option
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="text-xs text-muted-foreground">Timeline</label>
              <div className="flex gap-2 mt-1">
                {(["fast", "normal", "flexible"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setContext((prev) => ({
                        ...prev,
                        timeline: prev.timeline === option ? undefined : option,
                      }))
                    }
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      context.timeline === option
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Skill */}
            <div>
              <label className="text-xs text-muted-foreground">Technical Skill</label>
              <div className="flex gap-2 mt-1">
                {(["beginner", "intermediate", "advanced"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setContext((prev) => ({
                        ...prev,
                        technicalSkill:
                          prev.technicalSkill === option ? undefined : option,
                      }))
                    }
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      context.technicalSkill === option
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSuggest}
        disabled={isLoading || description.length < 10}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4 mr-2" />
            Get AI Suggestions
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Follow-up questions */}
      {questionsToAsk.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-xs text-yellow-400 font-medium mb-2">
            Questions to refine suggestions:
          </p>
          <ul className="space-y-1">
            {questionsToAsk.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-yellow-400">•</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions && (
        <div className="space-y-4">
          {/* Processing time */}
          {processingTime && (
            <p className="text-xs text-muted-foreground text-center">
              Analyzed in {(processingTime / 1000).toFixed(1)}s
            </p>
          )}

          {/* Apply all button */}
          {onApplyAll && (
            <Button onClick={handleApplyAll} variant="outline" className="w-full">
              Apply All Suggestions
            </Button>
          )}

          {/* Suggestion cards */}
          <SuggestionCards
            suggestions={suggestions}
            onAccept={onApplySuggestions}
            onReject={handleReject}
          />
        </div>
      )}
    </div>
  )
}

