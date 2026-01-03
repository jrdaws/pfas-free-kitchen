"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, X, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchSectionProps {
  domain: string;
  onDomainChange: (domain: string) => void;
  inspirationUrls: string[];
  onInspirationUrlsChange: (urls: string[]) => void;
  onStartResearch?: () => void;
  onShowMe?: () => void;
  isLoading?: boolean;
}

export function ResearchSection({
  domain,
  onDomainChange,
  inspirationUrls,
  onInspirationUrlsChange,
  onStartResearch,
  onShowMe,
  isLoading = false,
}: ResearchSectionProps) {
  const [showInspiration, setShowInspiration] = useState(inspirationUrls.length > 0);
  const [newUrl, setNewUrl] = useState("");

  const addUrl = () => {
    if (newUrl.trim() && !inspirationUrls.includes(newUrl.trim())) {
      onInspirationUrlsChange([...inspirationUrls, newUrl.trim()]);
      setNewUrl("");
    }
  };

  const removeUrl = (url: string) => {
    onInspirationUrlsChange(inspirationUrls.filter((u) => u !== url));
  };

  return (
    <div className="space-y-2.5">
      {/* Domain Input - Compact */}
      <div className="space-y-1">
        <Label htmlFor="domain" className="text-xs font-medium text-white/70">
          What domain is your project in?
        </Label>
        <Input
          id="domain"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          placeholder="e.g., E-commerce, SaaS..."
          className="h-8 text-xs bg-black/30 border-white/15 text-white placeholder:text-white/40"
        />
      </div>

      {/* Inspiration Toggle - Compact */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-white/50" />
          <Label htmlFor="inspiration-toggle" className="text-xs text-white/70 cursor-pointer">
            Add inspiration websites
          </Label>
        </div>
        <Switch
          id="inspiration-toggle"
          checked={showInspiration}
          onCheckedChange={setShowInspiration}
          className="scale-75"
        />
      </div>

      {/* Inspiration URLs - Compact */}
      {showInspiration && (
        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          {/* Existing URLs */}
          {inspirationUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-1 group">
              <Input
                value={url}
                readOnly
                className="h-7 text-xs bg-black/30 border-white/15 text-white truncate"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => removeUrl(url)}
              >
                <X className="h-3 w-3 text-white/50" />
              </Button>
            </div>
          ))}

          {/* Add new URL */}
          <div className="flex items-center gap-1">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="h-7 text-xs bg-black/30 border-white/15 text-white placeholder:text-white/40"
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-white/15 hover:bg-white/10 shrink-0"
              onClick={addUrl}
              disabled={!newUrl.trim()}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-[10px] text-white/40 leading-tight">
            Add websites that inspire your project
          </p>
        </div>
      )}

      {/* Action Buttons - Compact */}
      <div className="flex gap-1.5 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2 border-white/20 text-white/80 hover:bg-white/10"
          onClick={onShowMe}
        >
          Show Me
          <ExternalLink className="h-2.5 w-2.5 ml-1" />
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs px-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white"
          onClick={onStartResearch}
          disabled={isLoading || !domain.trim()}
        >
          {isLoading ? "..." : "Start Research"}
          <Sparkles className="h-2.5 w-2.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

