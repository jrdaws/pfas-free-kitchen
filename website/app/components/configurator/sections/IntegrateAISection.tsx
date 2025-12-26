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
    <div className="space-y-4">
      {/* Provider Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground-secondary">
          Select AI Provider
        </Label>
        <RadioGroup
          value={selectedProvider}
          onValueChange={onProviderChange}
          className="space-y-2"
        >
          {AI_PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                selectedProvider === provider.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-foreground-muted"
              )}
              onClick={() => onProviderChange(provider.id)}
            >
              <RadioGroupItem value={provider.id} id={provider.id} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={provider.id}
                    className={cn(
                      "text-sm cursor-pointer",
                      selectedProvider === provider.id
                        ? "text-primary font-medium"
                        : "text-foreground"
                    )}
                  >
                    {provider.name}
                  </Label>
                  {selectedProvider === provider.id && isKeyValid && (
                    <Badge variant="success" className="h-5 text-xs">
                      <Check className="h-3 w-3 mr-0.5" />
                      Ready
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-foreground-muted">{provider.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* API Key Input */}
      {selectedProvider && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Label htmlFor="api-key" className="text-sm font-medium text-foreground-secondary">
            API Key
          </Label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={`Enter your ${selectedProviderData?.name} API key`}
              className="h-10 pl-9 pr-10 font-mono text-sm bg-background-alt border-border text-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4 text-foreground-muted" />
              ) : (
                <Eye className="h-4 w-4 text-foreground-muted" />
              )}
            </Button>
          </div>
          <p className="text-xs text-foreground-muted">
            Get your API key from{" "}
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
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              {selectedProviderData?.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}

      {/* Available Models */}
      {selectedProvider && selectedProviderData && (
        <div className="space-y-2">
          <Label className="text-xs text-foreground-muted">Available Models</Label>
          <div className="flex flex-wrap gap-1.5">
            {selectedProviderData.models.map((model) => (
              <Badge key={model} variant="secondary" className="text-xs">
                {model}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

