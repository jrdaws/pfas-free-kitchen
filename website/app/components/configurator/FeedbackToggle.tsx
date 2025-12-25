"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Loader2, Check, MessageSquare } from "lucide-react";

export type FeedbackType = "positive" | "negative" | null;

interface FeedbackToggleProps {
  /** Unique identifier for the item being rated */
  itemId: string;
  /** Type of item (for analytics/categorization) */
  itemType: "recommendation" | "preview" | "feature" | "integration" | "general";
  /** Optional context about the item */
  context?: string;
  /** Callback when feedback is submitted */
  onFeedback?: (feedback: FeedbackType, itemId: string, itemType: string) => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show text labels */
  showLabels?: boolean;
  /** Initial feedback state */
  initialFeedback?: FeedbackType;
  /** Additional class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function FeedbackToggle({
  itemId,
  itemType,
  context,
  onFeedback,
  size = "md",
  showLabels = false,
  initialFeedback = null,
  className,
  disabled = false,
}: FeedbackToggleProps) {
  const [feedback, setFeedback] = useState<FeedbackType>(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = useCallback(
    async (type: FeedbackType) => {
      if (disabled || isSubmitting) return;

      // Toggle off if clicking the same button
      const newFeedback = feedback === type ? null : type;
      setFeedback(newFeedback);
      setIsSubmitting(true);

      try {
        // Submit feedback to API
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            itemType,
            feedback: newFeedback,
            context,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 2000);
        }

        // Call callback if provided
        onFeedback?.(newFeedback, itemId, itemType);
      } catch {
        // Silently fail - feedback is non-critical
        console.error("Failed to submit feedback");
      } finally {
        setIsSubmitting(false);
      }
    },
    [feedback, disabled, isSubmitting, itemId, itemType, context, onFeedback]
  );

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "h-7 w-7",
      icon: "h-3.5 w-3.5",
      gap: "gap-1",
      text: "text-xs",
    },
    md: {
      button: "h-8 w-8",
      icon: "h-4 w-4",
      gap: "gap-1.5",
      text: "text-sm",
    },
    lg: {
      button: "h-10 w-10",
      icon: "h-5 w-5",
      gap: "gap-2",
      text: "text-base",
    },
  };

  const config = sizeConfig[size];

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("flex items-center", config.gap, className)}>
        {/* Thumbs Up */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFeedback("positive")}
              disabled={disabled || isSubmitting}
              className={cn(
                config.button,
                "rounded-full transition-all",
                feedback === "positive"
                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  : "text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
              )}
            >
              {isSubmitting && feedback === "positive" ? (
                <Loader2 className={cn(config.icon, "animate-spin")} />
              ) : submitted && feedback === "positive" ? (
                <Check className={config.icon} />
              ) : (
                <ThumbsUp
                  className={cn(
                    config.icon,
                    feedback === "positive" && "fill-current"
                  )}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{feedback === "positive" ? "Remove feedback" : "This was helpful"}</p>
          </TooltipContent>
        </Tooltip>

        {showLabels && (
          <span className={cn(config.text, "text-stone-500")}>
            {feedback === "positive" ? "Helpful" : feedback === "negative" ? "Not helpful" : "Helpful?"}
          </span>
        )}

        {/* Thumbs Down */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleFeedback("negative")}
              disabled={disabled || isSubmitting}
              className={cn(
                config.button,
                "rounded-full transition-all",
                feedback === "negative"
                  ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                  : "text-stone-400 hover:text-rose-600 hover:bg-rose-50"
              )}
            >
              {isSubmitting && feedback === "negative" ? (
                <Loader2 className={cn(config.icon, "animate-spin")} />
              ) : submitted && feedback === "negative" ? (
                <Check className={config.icon} />
              ) : (
                <ThumbsDown
                  className={cn(
                    config.icon,
                    feedback === "negative" && "fill-current"
                  )}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{feedback === "negative" ? "Remove feedback" : "Not helpful"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

/**
 * Inline feedback prompt with text
 */
interface InlineFeedbackProps extends Omit<FeedbackToggleProps, "showLabels"> {
  prompt?: string;
}

export function InlineFeedback({
  prompt = "Was this helpful?",
  ...props
}: InlineFeedbackProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-stone-500">
      <MessageSquare className="h-4 w-4" />
      <span>{prompt}</span>
      <FeedbackToggle {...props} size="sm" />
    </div>
  );
}

/**
 * Card-style feedback with more detailed options
 */
interface FeedbackCardProps extends Omit<FeedbackToggleProps, "showLabels" | "size"> {
  title?: string;
  description?: string;
}

export function FeedbackCard({
  title = "How was this?",
  description,
  ...props
}: FeedbackCardProps) {
  const [showThanks, setShowThanks] = useState(false);

  const handleFeedback = (feedback: FeedbackType, itemId: string, itemType: string) => {
    if (feedback) {
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 3000);
    }
    props.onFeedback?.(feedback, itemId, itemType);
  };

  if (showThanks) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
        <Check className="h-4 w-4" />
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg">
      <div>
        <p className="text-sm font-medium text-stone-700">{title}</p>
        {description && (
          <p className="text-xs text-stone-500">{description}</p>
        )}
      </div>
      <FeedbackToggle {...props} onFeedback={handleFeedback} size="md" />
    </div>
  );
}

export default FeedbackToggle;

