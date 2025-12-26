"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Zap,
  DollarSign,
  Image as ImageIcon,
  Palette,
  Star,
  Crown,
  Sparkles,
  Clock,
  Maximize,
  Info,
  AlertCircle,
} from "lucide-react";

// Provider types
export type ImageGenProviderId = "dalle" | "midjourney" | "stable-diffusion" | "flux";

export interface ImageModel {
  id: string;
  name: string;
  description: string;
  maxResolution: string;
  pricePerImage: string;
  speed: "fast" | "medium" | "slow";
  quality: "standard" | "high" | "ultra";
}

export interface StyleExample {
  style: string;
  description: string;
  emoji: string;
}

export interface ImageGenProvider {
  id: ImageGenProviderId;
  name: string;
  logo: string;
  description: string;
  apiKeyName: string;
  apiKeyPrefix?: string;
  signupUrl: string;
  docsUrl: string;
  pricing: {
    free: boolean;
    freeCredits?: string;
    startingPrice: string;
    bulkDiscount?: string;
  };
  models: ImageModel[];
  styles: StyleExample[];
  strengths: string[];
  limitations: string[];
  recommended?: boolean;
  selfHosted?: boolean;
}

// Provider data
const IMAGE_GEN_PROVIDERS: ImageGenProvider[] = [
  {
    id: "dalle",
    name: "DALL-E 3",
    logo: "🎨",
    description: "OpenAI's flagship image generation with exceptional prompt understanding",
    apiKeyName: "OPENAI_API_KEY",
    apiKeyPrefix: "sk-",
    signupUrl: "https://platform.openai.com/",
    docsUrl: "https://platform.openai.com/docs/guides/images",
    pricing: {
      free: false,
      freeCredits: "$5 credit (shared with GPT)",
      startingPrice: "$0.040/image (1024x1024)",
      bulkDiscount: "Volume discounts available",
    },
    models: [
      {
        id: "dall-e-3",
        name: "DALL-E 3",
        description: "Latest model with best prompt understanding",
        maxResolution: "1792x1024",
        pricePerImage: "$0.080",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "dall-e-3-hd",
        name: "DALL-E 3 HD",
        description: "Enhanced detail and sharpness",
        maxResolution: "1792x1024",
        pricePerImage: "$0.120",
        speed: "slow",
        quality: "ultra",
      },
      {
        id: "dall-e-2",
        name: "DALL-E 2",
        description: "Fast and cost-effective",
        maxResolution: "1024x1024",
        pricePerImage: "$0.020",
        speed: "fast",
        quality: "standard",
      },
    ],
    styles: [
      { style: "Photorealistic", description: "Natural, photo-like images", emoji: "📷" },
      { style: "Digital Art", description: "Modern digital illustration", emoji: "🖼️" },
      { style: "Oil Painting", description: "Classic artistic style", emoji: "🎨" },
      { style: "3D Render", description: "Polished 3D graphics", emoji: "🎮" },
    ],
    strengths: [
      "Best prompt understanding",
      "Consistent quality",
      "Safe content by default",
      "Easy API integration",
    ],
    limitations: [
      "No image editing/inpainting",
      "Higher cost than alternatives",
      "Less artistic control",
    ],
    recommended: true,
  },
  {
    id: "midjourney",
    name: "Midjourney",
    logo: "⛵",
    description: "Industry-leading aesthetic quality via Discord or API",
    apiKeyName: "MIDJOURNEY_API_KEY",
    signupUrl: "https://www.midjourney.com/",
    docsUrl: "https://docs.midjourney.com/",
    pricing: {
      free: false,
      startingPrice: "$10/month (200 images)",
      bulkDiscount: "Pro plan: $30/month unlimited relaxed",
    },
    models: [
      {
        id: "mj-v6",
        name: "Midjourney v6",
        description: "Latest version with improved realism",
        maxResolution: "2048x2048",
        pricePerImage: "~$0.05",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "mj-niji",
        name: "Niji Mode",
        description: "Optimized for anime/illustration",
        maxResolution: "2048x2048",
        pricePerImage: "~$0.05",
        speed: "medium",
        quality: "high",
      },
    ],
    styles: [
      { style: "Cinematic", description: "Movie-quality lighting", emoji: "🎬" },
      { style: "Anime", description: "Japanese animation style", emoji: "🎌" },
      { style: "Fantasy", description: "Magical, ethereal worlds", emoji: "✨" },
      { style: "Minimalist", description: "Clean, simple designs", emoji: "◻️" },
    ],
    strengths: [
      "Best aesthetic quality",
      "Excellent for marketing",
      "Strong community & styles",
      "Fast generation",
    ],
    limitations: [
      "Discord-based (API in beta)",
      "Subscription required",
      "Less API flexibility",
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    logo: "🔥",
    description: "Open-source powerhouse with full customization control",
    apiKeyName: "STABILITY_API_KEY",
    signupUrl: "https://stability.ai/",
    docsUrl: "https://platform.stability.ai/docs/",
    pricing: {
      free: true,
      freeCredits: "25 free credits/day",
      startingPrice: "$0.002-0.02/image",
      bulkDiscount: "Self-host for unlimited",
    },
    models: [
      {
        id: "sdxl-1.0",
        name: "SDXL 1.0",
        description: "High-quality base model",
        maxResolution: "1024x1024",
        pricePerImage: "$0.002",
        speed: "fast",
        quality: "high",
      },
      {
        id: "sd3-medium",
        name: "SD3 Medium",
        description: "Latest architecture, best text rendering",
        maxResolution: "1536x1536",
        pricePerImage: "$0.035",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "sdxl-turbo",
        name: "SDXL Turbo",
        description: "Real-time generation",
        maxResolution: "512x512",
        pricePerImage: "$0.001",
        speed: "fast",
        quality: "standard",
      },
    ],
    styles: [
      { style: "Photorealistic", description: "With the right model/LoRA", emoji: "📸" },
      { style: "Concept Art", description: "Game & film design", emoji: "🎮" },
      { style: "Logo Design", description: "With text control", emoji: "💼" },
      { style: "Custom Style", description: "Train your own LoRA", emoji: "🔧" },
    ],
    strengths: [
      "Most cost-effective",
      "Full customization (LoRAs)",
      "Self-hosting option",
      "Active open-source community",
    ],
    limitations: [
      "Learning curve for best results",
      "Inconsistent without tuning",
      "Need NSFW filters manually",
    ],
    selfHosted: true,
  },
  {
    id: "flux",
    name: "Flux",
    logo: "⚡",
    description: "Next-gen model from Black Forest Labs with superior text rendering",
    apiKeyName: "REPLICATE_API_KEY",
    signupUrl: "https://replicate.com/",
    docsUrl: "https://replicate.com/black-forest-labs/flux-schnell",
    pricing: {
      free: true,
      freeCredits: "Free tier on Replicate",
      startingPrice: "$0.003/image (Schnell)",
      bulkDiscount: "Self-host on own GPU",
    },
    models: [
      {
        id: "flux-schnell",
        name: "Flux Schnell",
        description: "Fast, 4-step generation",
        maxResolution: "1024x1024",
        pricePerImage: "$0.003",
        speed: "fast",
        quality: "high",
      },
      {
        id: "flux-dev",
        name: "Flux Dev",
        description: "Development model, higher quality",
        maxResolution: "1440x1440",
        pricePerImage: "$0.025",
        speed: "medium",
        quality: "ultra",
      },
      {
        id: "flux-pro",
        name: "Flux Pro",
        description: "Commercial-grade output",
        maxResolution: "2048x2048",
        pricePerImage: "$0.055",
        speed: "slow",
        quality: "ultra",
      },
    ],
    styles: [
      { style: "Photorealistic", description: "Industry-leading realism", emoji: "📷" },
      { style: "Text in Images", description: "Best text rendering", emoji: "🔤" },
      { style: "Product Photos", description: "E-commerce ready", emoji: "🛍️" },
      { style: "Architecture", description: "Clean renders", emoji: "🏛️" },
    ],
    strengths: [
      "Best text-in-image generation",
      "Excellent anatomy/hands",
      "Very fast (Schnell)",
      "Affordable via Replicate",
    ],
    limitations: [
      "Newer, less community content",
      "Fewer fine-tuned variants",
      "Pro model API access limited",
    ],
    recommended: true,
    selfHosted: true,
  },
];

interface ImageGenProviderPickerProps {
  /** Currently selected provider */
  selectedProvider?: ImageGenProviderId;
  /** Callback when provider is selected */
  onProviderSelect?: (providerId: ImageGenProviderId) => void;
  /** Callback when API key is saved */
  onApiKeySave?: (providerId: ImageGenProviderId, apiKey: string) => void;
  /** Initial API keys (masked) */
  savedApiKeys?: Partial<Record<ImageGenProviderId, boolean>>;
  /** Class name */
  className?: string;
}

export function ImageGenProviderPicker({
  selectedProvider,
  onProviderSelect,
  onApiKeySave,
  savedApiKeys = {},
  className,
}: ImageGenProviderPickerProps) {
  const [activeTab, setActiveTab] = useState<"providers" | "comparison" | "styles">("providers");
  const [expandedProvider, setExpandedProvider] = useState<ImageGenProviderId | null>(
    selectedProvider || null
  );
  const [apiKeys, setApiKeys] = useState<Partial<Record<ImageGenProviderId, string>>>({});
  const [showApiKey, setShowApiKey] = useState<Partial<Record<ImageGenProviderId, boolean>>>({});
  const [validating, setValidating] = useState<ImageGenProviderId | null>(null);

  const handleProviderClick = (providerId: ImageGenProviderId) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
    onProviderSelect?.(providerId);
  };

  const handleApiKeyChange = (providerId: ImageGenProviderId, value: string) => {
    setApiKeys((prev) => ({ ...prev, [providerId]: value }));
  };

  const handleSaveApiKey = useCallback(
    async (providerId: ImageGenProviderId) => {
      const key = apiKeys[providerId];
      if (!key) return;

      setValidating(providerId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onApiKeySave?.(providerId, key);
      setApiKeys((prev) => ({ ...prev, [providerId]: "" }));
      setValidating(null);
    },
    [apiKeys, onApiKeySave]
  );

  const toggleShowApiKey = (providerId: ImageGenProviderId) => {
    setShowApiKey((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getSpeedBadge = (speed: ImageModel["speed"]) => {
    switch (speed) {
      case "fast":
        return <Badge variant="success" className="gap-1"><Zap className="h-3 w-3" /> Fast</Badge>;
      case "medium":
        return <Badge variant="default"><Clock className="h-3 w-3" /> Medium</Badge>;
      case "slow":
        return <Badge variant="secondary"><Clock className="h-3 w-3" /> Slow</Badge>;
    }
  };

  const getQualityBadge = (quality: ImageModel["quality"]) => {
    switch (quality) {
      case "standard":
        return <Badge variant="secondary">Standard</Badge>;
      case "high":
        return <Badge variant="info">High</Badge>;
      case "ultra":
        return <Badge variant="warning" className="gap-1"><Crown className="h-3 w-3" /> Ultra</Badge>;
    }
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Image Generation Providers
        </CardTitle>
        <CardDescription>
          Choose your image generation provider for AI-powered visuals
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="providers">Select Provider</TabsTrigger>
            <TabsTrigger value="comparison">Compare Pricing</TabsTrigger>
            <TabsTrigger value="styles">Style Gallery</TabsTrigger>
          </TabsList>

          {/* Provider Selection Tab */}
          <TabsContent value="providers" className="space-y-4">
            {IMAGE_GEN_PROVIDERS.map((provider) => {
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{provider.name}</h3>
                        {provider.recommended && (
                          <Badge variant="info" className="gap-1">
                            <Star className="h-3 w-3" /> Recommended
                          </Badge>
                        )}
                        {provider.selfHosted && (
                          <Badge variant="secondary" className="gap-1">
                            🖥️ Self-host option
                          </Badge>
                        )}
                        {hasSavedKey && (
                          <Badge variant="success" className="gap-1">
                            <Check className="h-3 w-3" /> Configured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground-muted">{provider.description}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm">
                        {provider.pricing.free ? (
                          <span className="text-emerald-600 font-medium">Free tier available</span>
                        ) : (
                          <span className="text-foreground-muted">{provider.pricing.startingPrice}</span>
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
                                  placeholder={provider.apiKeyPrefix ? `${provider.apiKeyPrefix}...` : "Enter API key..."}
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
                            <p className="text-xs text-foreground-muted">
                              Get your API key from{" "}
                              <a
                                href={provider.signupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {provider.name}
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
                          <div className="bg-card rounded-lg p-3">
                            <p className="text-foreground-muted text-xs">Starting at</p>
                            <p className="font-semibold">{provider.pricing.startingPrice}</p>
                          </div>
                          <div className="bg-card rounded-lg p-3">
                            <p className="text-foreground-muted text-xs">Free credits</p>
                            <p className="font-semibold text-emerald-600">
                              {provider.pricing.freeCredits || "None"}
                            </p>
                          </div>
                          <div className="bg-card rounded-lg p-3">
                            <p className="text-foreground-muted text-xs">Bulk pricing</p>
                            <p className="font-semibold text-xs">
                              {provider.pricing.bulkDiscount || "Contact sales"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Available Models */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Available Models
                        </Label>
                        <div className="space-y-2">
                          {provider.models.map((model) => (
                            <div
                              key={model.id}
                              className="flex items-center justify-between p-3 bg-card rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{model.name}</span>
                                  {getSpeedBadge(model.speed)}
                                  {getQualityBadge(model.quality)}
                                </div>
                                <p className="text-xs text-foreground-muted">{model.description}</p>
                              </div>
                              <div className="text-right pl-4">
                                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                                  <Maximize className="h-3 w-3" />
                                  {model.maxResolution}
                                </div>
                                <p className="font-mono text-sm font-semibold">{model.pricePerImage}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Styles Preview */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          Supported Styles
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {provider.styles.map((style) => (
                            <div
                              key={style.style}
                              className="flex items-center gap-2 p-2 bg-card rounded-lg text-sm"
                            >
                              <span className="text-xl">{style.emoji}</span>
                              <div>
                                <p className="font-medium text-xs">{style.style}</p>
                                <p className="text-xs text-foreground-muted">{style.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths & Limitations */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-emerald-600">✓ Strengths</Label>
                          <ul className="space-y-1 text-sm text-foreground-secondary">
                            {provider.strengths.map((s) => (
                              <li key={s} className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-amber-600">⚠ Limitations</Label>
                          <ul className="space-y-1 text-sm text-foreground-secondary">
                            {provider.limitations.map((l) => (
                              <li key={l} className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                {l}
                              </li>
                            ))}
                          </ul>
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
                    {IMAGE_GEN_PROVIDERS.map((p) => (
                      <th key={p.id} className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl">{p.logo}</span>
                          <span className="font-semibold text-xs">{p.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Free Tier */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">Free Tier</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.pricing.free ? (
                          <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-foreground-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Cheapest Option */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">Cheapest Model</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => {
                      const cheapest = p.models.reduce((min, m) => {
                        const price = parseFloat(m.pricePerImage.replace(/[^0-9.]/g, ""));
                        const minPrice = parseFloat(min.pricePerImage.replace(/[^0-9.]/g, ""));
                        return price < minPrice ? m : min;
                      });
                      return (
                        <td key={p.id} className="text-center p-3 font-mono text-xs">
                          {cheapest.pricePerImage}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Best Quality */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">Best Quality Model</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => {
                      const best = p.models.find((m) => m.quality === "ultra") || p.models[0];
                      return (
                        <td key={p.id} className="text-center p-3 font-mono text-xs">
                          {best.pricePerImage}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Max Resolution */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">Max Resolution</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => {
                      const maxRes = p.models.reduce((max, m) => {
                        const [w] = m.maxResolution.split("x").map(Number);
                        const [maxW] = max.maxResolution.split("x").map(Number);
                        return w > maxW ? m : max;
                      });
                      return (
                        <td key={p.id} className="text-center p-3 font-mono text-xs">
                          {maxRes.maxResolution}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Self-Host */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">Self-Host Option</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.selfHosted ? (
                          <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-foreground-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Text Rendering */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">Text in Images</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.id === "flux" ? (
                          <Badge variant="success">Best</Badge>
                        ) : p.id === "dalle" ? (
                          <Badge variant="info">Good</Badge>
                        ) : p.id === "stable-diffusion" ? (
                          <Badge variant="default">OK (SD3)</Badge>
                        ) : (
                          <Badge variant="secondary">Limited</Badge>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* API Ease */}
                  <tr className="border-b hover:bg-card">
                    <td className="p-3 font-medium">API Ease</td>
                    {IMAGE_GEN_PROVIDERS.map((p) => (
                      <td key={p.id} className="text-center p-3">
                        {p.id === "dalle" ? (
                          <Badge variant="success">Easy</Badge>
                        ) : p.id === "flux" ? (
                          <Badge variant="success">Easy</Badge>
                        ) : p.id === "stable-diffusion" ? (
                          <Badge variant="info">Moderate</Badge>
                        ) : (
                          <Badge variant="warning">Complex</Badge>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation */}
            <Alert className="mt-6 bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Our Recommendations</AlertTitle>
              <AlertDescription className="text-foreground-secondary">
                <ul className="mt-2 space-y-1">
                  <li><strong>Best Quality:</strong> DALL-E 3 or Midjourney for marketing assets</li>
                  <li><strong>Best Value:</strong> Flux Schnell ($0.003/image) for prototyping</li>
                  <li><strong>Most Flexible:</strong> Stable Diffusion for custom styles/self-hosting</li>
                  <li><strong>Best Text:</strong> Flux for images with text/logos</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Styles Tab */}
          <TabsContent value="styles">
            <div className="space-y-6">
              <p className="text-sm text-foreground-muted">
                Each provider excels at different visual styles. Here&apos;s what they&apos;re best at:
              </p>

              {IMAGE_GEN_PROVIDERS.map((provider) => (
                <div key={provider.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{provider.logo}</span>
                    <h3 className="font-semibold">{provider.name}</h3>
                    {provider.recommended && (
                      <Badge variant="info" className="gap-1">
                        <Star className="h-3 w-3" /> Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {provider.styles.map((style) => (
                      <div
                        key={style.style}
                        className="relative group overflow-hidden rounded-lg border bg-gradient-to-br from-stone-50 to-stone-100 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="text-4xl mb-2">{style.emoji}</div>
                        <h4 className="font-semibold text-sm">{style.style}</h4>
                        <p className="text-xs text-foreground-muted">{style.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <Alert className="bg-amber-50 border-amber-200">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700">Pro Tip</AlertTitle>
                <AlertDescription className="text-amber-600">
                  For best results, combine providers: Use Flux for logos/text, DALL-E for 
                  photorealistic scenes, and Stable Diffusion for stylized artwork with custom LoRAs.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { IMAGE_GEN_PROVIDERS };

