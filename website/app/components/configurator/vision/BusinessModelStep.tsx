"use client";

import { cn } from "@/lib/utils";
import { BUSINESS_MODEL_OPTIONS, BusinessModel } from "./types";

interface BusinessModelStepProps {
  value: BusinessModel;
  onChange: (value: BusinessModel) => void;
  className?: string;
}

export function BusinessModelStep({ value, onChange, className }: BusinessModelStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          What's your business model?
        </h3>
        <p className="text-sm text-muted-foreground">
          This helps us configure the right payment and pricing features.
        </p>
      </div>

      {/* Business Model Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BUSINESS_MODEL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all",
              value === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <span className="text-3xl">{option.icon}</span>
            <div>
              <p className="font-medium text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Smart suggestion based on selection */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          {value === "subscription" && (
            <>💡 We'll set up Stripe for recurring billing and a pricing page.</>
          )}
          {value === "one-time" && (
            <>💡 We'll configure simple checkout without recurring billing.</>
          )}
          {value === "freemium" && (
            <>💡 We'll create free and paid tiers with upgrade prompts.</>
          )}
          {value === "marketplace" && (
            <>💡 We'll set up Stripe Connect for multi-party payments.</>
          )}
          {value === "free" && (
            <>💡 No payment setup needed. Focus on the core experience.</>
          )}
        </p>
      </div>
    </div>
  );
}

export default BusinessModelStep;

