"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DESIGN_STYLE_OPTIONS, DesignStyle } from "./types";
import { Upload, X, Link2 } from "lucide-react";

interface DesignStyleStepProps {
  style: DesignStyle;
  inspirations: string[];
  onStyleChange: (style: DesignStyle) => void;
  onInspirationsChange: (urls: string[]) => void;
  className?: string;
}

export function DesignStyleStep({
  style,
  inspirations,
  onStyleChange,
  onInspirationsChange,
  className,
}: DesignStyleStepProps) {
  const [inspirationUrl, setInspirationUrl] = useState("");
  const [showInspirations, setShowInspirations] = useState(inspirations.length > 0);

  const addInspiration = () => {
    if (inspirationUrl && !inspirations.includes(inspirationUrl)) {
      onInspirationsChange([...inspirations, inspirationUrl]);
      setInspirationUrl("");
    }
  };

  const removeInspiration = (url: string) => {
    onInspirationsChange(inspirations.filter((i) => i !== url));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Question */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          What's your design vibe?
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose a style that matches your brand personality.
        </p>
      </div>

      {/* Design Style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DESIGN_STYLE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStyleChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all",
              style === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            {/* Color preview */}
            <div className="flex gap-1">
              {option.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-border/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{option.label}</p>
              <p className="text-[10px] text-muted-foreground">{option.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Inspiration URLs */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowInspirations(!showInspirations)}
          className="gap-2"
        >
          <Link2 className="w-4 h-4" />
          {showInspirations ? "Hide inspirations" : "Add inspiration websites"}
        </Button>

        {showInspirations && (
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <Label className="text-sm">
              Paste URLs of websites you like
            </Label>
            
            <div className="flex gap-2">
              <Input
                value={inspirationUrl}
                onChange={(e) => setInspirationUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInspiration())}
              />
              <Button type="button" onClick={addInspiration} variant="secondary">
                Add
              </Button>
            </div>

            {inspirations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {inspirations.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-1 px-2 py-1 bg-background rounded-md border border-border text-sm"
                  >
                    <span className="truncate max-w-[200px]">{url}</span>
                    <button
                      type="button"
                      onClick={() => removeInspiration(url)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              We'll analyze these sites to understand your visual preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DesignStyleStep;

