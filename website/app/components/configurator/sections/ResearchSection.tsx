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
    <div className="space-y-4">
      {/* Domain Input */}
      <div className="space-y-2">
        <Label htmlFor="domain" className="text-sm font-medium text-stone-700">
          What domain is your project in?
        </Label>
        <Input
          id="domain"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          placeholder="e.g., E-commerce, SaaS, Education..."
          className="h-10"
        />
      </div>

      {/* Inspiration Toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-stone-500" />
          <Label htmlFor="inspiration-toggle" className="text-sm text-stone-600 cursor-pointer">
            Add inspiration websites
          </Label>
        </div>
        <Switch
          id="inspiration-toggle"
          checked={showInspiration}
          onCheckedChange={setShowInspiration}
        />
      </div>

      {/* Inspiration URLs */}
      {showInspiration && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Existing URLs */}
          {inspirationUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2 group">
              <Input
                value={url}
                readOnly
                className="h-9 text-sm bg-stone-50"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeUrl(url)}
              >
                <X className="h-4 w-4 text-stone-400" />
              </Button>
            </div>
          ))}

          {/* Add new URL */}
          <div className="flex items-center gap-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={addUrl}
              disabled={!newUrl.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-stone-500">
            Add websites that inspire your project&apos;s design or features
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-sm"
          onClick={onShowMe}
        >
          Show Me
          <ExternalLink className="h-3 w-3 ml-1.5" />
        </Button>
        <Button
          size="sm"
          className="text-sm bg-[#F97316] hover:bg-[#EA580C]"
          onClick={onStartResearch}
          disabled={isLoading || !domain.trim()}
        >
          {isLoading ? "Researching..." : "Start Research"}
          <Sparkles className="h-3 w-3 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

