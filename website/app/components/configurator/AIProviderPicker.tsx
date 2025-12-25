"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Zap,
  DollarSign,
  Cpu,
  Sparkles,
  AlertCircle,
  Info,
  Star,
  Crown,
} from "lucide-react";

// Provider types
export type AIProviderId = "openai" | "anthropic" | "google";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  contextWindow: string;
  bestFor: string[];
  tier: "free" | "standard" | "premium";
}

export interface AIProvider {
  id: AIProviderId;
  name: string;
  logo: string; // emoji for now, can be replaced with actual logos
  description: string;
  apiKeyName: string;
  apiKeyPrefix: string;
  signupUrl: string;
  docsUrl: string;
  pricing: {
    free: boolean;
    freeCredits?: string;
    inputPer1M: string;
    outputPer1M: string;
  };
  models: AIModel[];
  features: string[];
  recommended?: boolean;
}

// Provider data
const AI_PROVIDERS: AIProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "🧠",
    description: "Creator of Claude - advanced reasoning & code generation",
    apiKeyName: "ANTHROPIC_API_KEY",
    apiKeyPrefix: "sk-ant-",
    signupUrl: "https://console.anthropic.com/",
    docsUrl: "https://docs.anthropic.com/",
    pricing: {
      free: false,
      freeCredits: "$5 credit for new accounts",
      inputPer1M: "$3.00",
      outputPer1M: "$15.00",
    },
    models: [
      {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        description: "Best balance of speed and intelligence",
        contextWindow: "200K",
        bestFor: ["Code generation", "Analysis", "Writing"],
        tier: "standard",
      },
      {
        id: "claude-opus-4-20250514",
        name: "Claude Opus 4",
        description: "Most capable model for complex tasks",
        contextWindow: "200K",
        bestFor: ["Complex reasoning", "Research", "Long documents"],
        tier: "premium",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "Fast and cost-effective",
        contextWindow: "200K",
        bestFor: ["Quick tasks", "Simple queries", "High volume"],
        tier: "standard",
      },
    ],
    features: [
      "Best-in-class code generation",
      "Extended thinking for complex problems",
      "200K context window",
      "Strong safety guardrails",
    ],
    recommended: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: "⚡",
    description: "GPT-4o and GPT-4 Turbo - versatile AI models",
    apiKeyName: "OPENAI_API_KEY",
    apiKeyPrefix: "sk-",
    signupUrl: "https://platform.openai.com/signup",
    docsUrl: "https://platform.openai.com/docs",
    pricing: {
      free: false,
      freeCredits: "$5 credit for new accounts",
      inputPer1M: "$2.50",
      outputPer1M: "$10.00",
    },
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Latest flagship model with vision",
        contextWindow: "128K",
        bestFor: ["General purpose", "Vision", "Code"],
        tier: "standard",
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        description: "High capability with large context",
        contextWindow: "128K",
        bestFor: ["Complex tasks", "Long context", "Analysis"],
        tier: "premium",
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        description: "Fast and affordable",
        contextWindow: "16K",
        bestFor: ["Quick tasks", "Simple chat", "Prototyping"],
        tier: "free",
      },
    ],
    features: [
      "Multimodal (text + vision)",
      "Function calling",
      "JSON mode",
      "Large ecosystem",
    ],
  },
  {
    id: "google",
    name: "Google AI",
    logo: "🔮",
    description: "Gemini models - multimodal AI from Google",
    apiKeyName: "GOOGLE_AI_API_KEY",
    apiKeyPrefix: "AIza",
    signupUrl: "https://aistudio.google.com/",
    docsUrl: "https://ai.google.dev/docs",
    pricing: {
      free: true,
      freeCredits: "Free tier available",
      inputPer1M: "$0.075",
      outputPer1M: "$0.30",
    },
    models: [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Most capable Gemini model",
        contextWindow: "1M",
        bestFor: ["Long context", "Multimodal", "Research"],
        tier: "standard",
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Fast and efficient",
        contextWindow: "1M",
        bestFor: ["Quick tasks", "High volume", "Cost-effective"],
        tier: "free",
      },
      {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        description: "Latest experimental model",
        contextWindow: "1M",
        bestFor: ["Cutting edge", "Experimental", "Agents"],
        tier: "standard",
      },
    ],
    features: [
      "1M token context window",
      "Strong multimodal support",
      "Generous free tier",
      "Grounding with Google Search",
    ],
  },
];

interface AIProviderPickerProps {
  /** Currently selected provider */
  selectedProvider?: AIProviderId;
  /** Callback when provider is selected */
  onProviderSelect?: (providerId: AIProviderId) => void;
  /** Callback when API key is saved */
  onApiKeySave?: (providerId: AIProviderId, apiKey: string) => void;
  /** Initial API keys (masked) */
  savedApiKeys?: Partial<Record<AIProviderId, boolean>>;
  /** Class name */
  className?: string;
}

export function AIProviderPicker({
  selectedProvider,
  onProviderSelect,
  onApiKeySave,
  savedApiKeys = {},
  className,
}: AIProviderPickerProps) {
  const [activeTab, setActiveTab] = useState<"providers" | "comparison">("providers");
  const [expandedProvider, setExpandedProvider] = useState<AIProviderId | null>(
    selectedProvider || null
  );
  const [apiKeys, setApiKeys] = useState<Partial<Record<AIProviderId, string>>>({});
  const [showApiKey, setShowApiKey] = useState<Partial<Record<AIProviderId, boolean>>>({});
  const [validating, setValidating] = useState<AIProviderId | null>(null);

  const handleProviderClick = (providerId: AIProviderId) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
    onProviderSelect?.(providerId);
  };

  const handleApiKeyChange = (providerId: AIProviderId, value: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const handleSaveApiKey = useCallback(
    async (providerId: AIProviderId) => {
      const key = apiKeys[providerId];
      if (!key) return;

      setValidating(providerId);
      
      // Simulate API key validation (in real app, call backend)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onApiKeySave?.(providerId, key);
      setApiKeys((prev) => ({ ...prev, [providerId]: "" }));
      setValidating(null);
    },
    [apiKeys, onApiKeySave]
  );

  const toggleShowApiKey = (providerId: AIProviderId) => {
    setShowApiKey((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getTierBadge = (tier: AIModel["tier"]) => {
    switch (tier) {
      case "free":
        return <Badge variant="success" className="gap-1"><Zap className="h-3 w-3" /> Free</Badge>;
      case "standard":
        return <Badge variant="default">Standard</Badge>;
      case "premium":
        return <Badge variant="warning" className="gap-1"><Crown className="h-3 w-3" /> Premium</Badge>;
    }
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Provider Selection
        </CardTitle>
        <CardDescription>
          Choose your AI provider and configure API access
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="providers">Select Provider</TabsTrigger>
            <TabsTrigger value="comparison">Compare All</TabsTrigger>
          </TabsList>

          {/* Provider Selection Tab */}
          <TabsContent value="providers" className="space-y-4">
            {AI_PROVIDERS.map((provider) => {
              const isExpanded = expandedProvider === provider.id;
              const isSelected = selectedProvider === provider.id;
              const hasSavedKey = savedApiKeys[provider.id];

              return (
                <Card
                  key={provider.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected && "border-primary shadow-md shadow-primary/10",
                    isExpanded && "ring-1 ring-primary/20"
                  )}
                >
                  {/* Provider Header */}
                  <div
                    className="p-4 flex items-center gap-4"
                    onClick={() => handleProviderClick(provider.id)}
                  >
                    <div className="text-4xl">{provider.logo}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{provider.name}</h3>
                        {provider.recommended && (
                          <Badge variant="info" className="gap-1">
                            <Star className="h-3 w-3" /> Recommended
                          </Badge>
                        )}
                        {hasSavedKey && (
                          <Badge variant="success" className="gap-1">
                            <Check className="h-3 w-3" /> Configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-stone-500">{provider.description}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-stone-500">
                        {provider.pricing.free ? (
                          <span className="text-emerald-600 font-medium">Free tier available</span>
                        ) : (
                          <span>From {provider.pricing.inputPer1M}/1M tokens</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="border-t pt-4 space-y-6">
                      {/* API Key Input */}
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          API Key Configuration
                        </Label>
                        
                        {hasSavedKey ? (
                          <Alert className="bg-emerald-50 border-emerald-200">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <AlertTitle className="text-emerald-700">API Key Saved</AlertTitle>
                            <AlertDescription className="text-emerald-600">
                              Your {provider.name} API key is securely stored.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  type={showApiKey[provider.id] ? "text" : "password"}
                                  placeholder={`${provider.apiKeyPrefix}...`}
                                  value={apiKeys[provider.id] || ""}
                                  onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                                  className="pr-10 font-mono text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1/2 -transtone-y-1/2 h-7 w-7 p-0"
                                  onClick={() => toggleShowApiKey(provider.id)}
                                >
                                  {showApiKey[provider.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <Button
                                onClick={() => handleSaveApiKey(provider.id)}
                                disabled={!apiKeys[provider.id] || validating === provider.id}
                              >
                                {validating === provider.id ? "Validating..." : "Save Key"}
                              </Button>
                            </div>
                            <p className="text-xs text-stone-500">
                              Get your API key from{" "}
                              <a
                                href={provider.signupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {provider.name} Console
                                <ExternalLink className="inline h-3 w-3 ml-1" />
                              </a>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Pricing Info */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Pricing
                        </Label>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-stone-50 rounded-lg p-3">
                            <p className="text-stone-500 text-xs">Input tokens</p>
                            <p className="font-semibold">{provider.pricing.inputPer1M}/1M</p>
                          </div>
                          <div className="bg-stone-50 rounded-lg p-3">
                            <p className="text-stone-500 text-xs">Output tokens</p>
                            <p className="font-semibold">{provider.pricing.outputPer1M}/1M</p>
                          </div>
                          <div className="bg-stone-50 rounded-lg p-3">
                            <p className="text-stone-500 text-xs">Free credits</p>
                            <p className="font-semibold text-emerald-600">
                              {provider.pricing.freeCredits || "None"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Available Models */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          Available Models
                        </Label>
                        <div className="space-y-2">
                          {provider.models.map((model) => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between p-3 bg-stone-50 rounded-lg"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{model.name}</span>
                                  {getTierBadge(model.tier)}
                                </div>
                                <p className="text-xs text-stone-500">{model.description}</p>
                              </div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-right">
                                      <p className="text-xs text-stone-400">Context</p>
                                      <p className="font-mono text-sm">{model.contextWindow}</p>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-semibold mb-1">Best for:</p>
                                    <ul className="text-xs">
                                      {model.bestFor.map((use) => (
                                        <li key={use}>• {use}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <Label>Key Features</Label>
                        <div className="flex flex-wrap gap-2">
                          {provider.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Feature</th>
                    {AI_PROVIDERS.map((p) => (
                      <th key={p.id} className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl">{p.logo}</span>
                          <span className="font-semibold">{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Free Tier */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Free Tier</td>
                    {AI_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.pricing.free ? (
                          <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Input Pricing */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Input (per 1M tokens)</td>
                    {AI_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3 font-mono">
                        {p.pricing.inputPer1M}
                      </td>
                    ))}
                  </tr>

                  {/* Output Pricing */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Output (per 1M tokens)</td>
                    {AI_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3 font-mono">
                        {p.pricing.outputPer1M}
                      </td>
                    ))}
                  </tr>

                  {/* Max Context */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Max Context Window</td>
                    {AI_PROVIDERS.map((p) => {
                      const maxContext = p.models.reduce((max, m) => {
                        const val = parseInt(m.contextWindow);
                        return val > max ? val : max;
                      }, 0);
                      return (
                        <td key={p.id} className="text-center p-3 font-mono">
                          {p.models[0].contextWindow}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Model Count */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Available Models</td>
                    {AI_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.models.length} models
                      </td>
                    ))}
                  </tr>

                  {/* Code Generation */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Code Generation</td>
                    {AI_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.id === "anthropic" ? (
                          <Badge variant="success">Excellent</Badge>
                        ) : p.id === "openai" ? (
                          <Badge variant="info">Very Good</Badge>
                        ) : (
                          <Badge variant="secondary">Good</Badge>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Multimodal */}
                  <tr className="border-b hover:bg-stone-50">
                    <td className="p-3 font-medium">Multimodal (Vision)</td>
                    {AI_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation */}
            <Alert className="mt-6 bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Our Recommendation</AlertTitle>
              <AlertDescription className="text-stone-600">
                For the Dawson Does Framework, we recommend <strong>Anthropic Claude</strong> for 
                its superior code generation capabilities and extended thinking features. 
                <strong>Google Gemini</strong> is a great budget-friendly option with a generous free tier.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { AI_PROVIDERS };

