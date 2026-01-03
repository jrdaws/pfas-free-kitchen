"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Key, ExternalLink, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude models - best for code",
    models: ["Claude 3.5 Sonnet", "Claude 3 Opus"],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4 models - versatile",
    models: ["GPT-4o", "GPT-4 Turbo"],
  },
  {
    id: "google",
    name: "Google AI",
    description: "Gemini models - multimodal",
    models: ["Gemini Pro", "Gemini Flash"],
  },
];

interface IntegrateAISectionProps {
  selectedProvider?: string;
  onProviderChange: (provider: string) => void;
  apiKey?: string;
  onApiKeyChange: (key: string) => void;
  isKeyValid?: boolean;
}

export function IntegrateAISection({
  selectedProvider,
  onProviderChange,
  apiKey = "",
  onApiKeyChange,
  isKeyValid = false,
}: IntegrateAISectionProps) {
  const [showKey, setShowKey] = useState(false);

  const selectedProviderData = AI_PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="space-y-2.5">
      {/* Provider Selection - Compact */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-white/70">
          Select AI Provider
        </Label>
        <RadioGroup
          value={selectedProvider}
          onValueChange={onProviderChange}
          className="space-y-1"
        >
          {AI_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors",
                selectedProvider === provider.id
                  ? "border-[var(--primary)]/50 bg-[var(--primary)]/10"
                  : "border-white/10 hover:border-white/20 bg-black/20"
              )}
              onClick={() => onProviderChange(provider.id)}
            >
              <RadioGroupItem value={provider.id} id={provider.id} className="h-3 w-3" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Label
                    htmlFor={provider.id}
                    className={cn(
                      "text-xs cursor-pointer",
                      selectedProvider === provider.id
                        ? "text-[var(--primary)] font-medium"
                        : "text-white/90"
                    )}
                  >
                    {provider.name}
                  </Label>
                  {selectedProvider === provider.id && isKeyValid && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1 py-0.5 rounded flex items-center">
                      <Check className="h-2 w-2 mr-0.5" />
                      Ready
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/40 truncate">{provider.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* API Key Input - Compact */}
      {selectedProvider && (
        <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
          <Label htmlFor="api-key" className="text-xs font-medium text-white/70">
            API Key
          </Label>
          <div className="relative">
            <Key className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Enter API key..."
              className="h-7 pl-7 pr-7 font-mono text-xs bg-black/30 border-white/15 text-white placeholder:text-white/30"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="h-3 w-3 text-white/40" />
              ) : (
                <Eye className="h-3 w-3 text-white/40" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-white/40">
            Get key from{" "}
            <a
              href={
                selectedProvider === "anthropic"
                  ? "https://console.anthropic.com/"
                  : selectedProvider === "openai"
                  ? "https://platform.openai.com/"
                  : "https://aistudio.google.com/"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              {selectedProviderData?.name}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

