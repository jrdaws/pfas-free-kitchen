"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Info
} from "lucide-react";
import { generatePreview } from "@/lib/preview-generator";
import { useConfiguratorStore } from "@/lib/configurator-state";

interface AIPreviewProps {
  template: string;
  integrations: Record<string, string>;
  inspirations: Array<{ type: string; value: string; preview?: string }>;
  description: string;
}

export function AIPreview({
  template,
  integrations,
  inspirations,
  description,
}: AIPreviewProps) {
  const {
    previewHtml,
    isGenerating,
    userApiKey,
    remainingDemoGenerations,
    setGenerating,
    setUserApiKey,
    setRemainingDemoGenerations,
  } = useConfiguratorStore();

  const [localPreviewHtml, setLocalPreviewHtml] = useState<string | null>(previewHtml);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const viewportWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const hasInputs = inspirations.length > 0 || description.trim().length > 0;

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);

    try {
      const result = await generatePreview({
        template,
        integrations,
        inspirations,
        description,
        userApiKey: userApiKey || undefined,
      });

      if (!result.success) {
        if (result.rateLimited) {
          setError(result.message || "Rate limit exceeded");
          setShowApiKeyInput(true);
        } else {
          setError(result.message || "Failed to generate preview");
        }
        setGenerating(false);
        return;
      }

      setLocalPreviewHtml(result.html || null);
      if (result.remainingDemoGenerations !== undefined) {
        setRemainingDemoGenerations(result.remainingDemoGenerations);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate preview");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setLocalPreviewHtml(null);
    handleGenerate();
  };

  const handleOpenNewTab = () => {
    if (!localPreviewHtml) return;
    const blob = new Blob([localPreviewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          AI-Generated Preview
        </h2>
        <p className="text-terminal-dim">
          Generate a visual prototype based on your template and inspiration
        </p>
        <p className="text-xs text-terminal-accent mt-2">
          Optional: Skip to export your configured template without AI customization
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* API Key Management */}
        {(showApiKeyInput || userApiKey) && (
          <div className="terminal-window border-terminal-accent/30">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-accent ml-2">
                <Key className="inline h-3 w-3 mr-1" />
                Anthropic API Key Settings
              </span>
            </div>
            <div className="terminal-content space-y-3">
              <div className="flex items-start gap-2 text-xs text-terminal-dim">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Using your own API key removes generation limits. Your key is stored locally
                  and only sent to the Anthropic API. Get a key at{" "}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terminal-accent hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-terminal-text text-sm">
                  Anthropic API Key
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={userApiKey}
                      onChange={(e) => setUserApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="font-mono text-xs bg-terminal-bg border-terminal-text/30 text-terminal-text focus:border-terminal-accent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-terminal-dim hover:text-terminal-text"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {userApiKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUserApiKey("");
                        setShowApiKeyInput(false);
                      }}
                      className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generation Controls */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <Sparkles className="inline h-3 w-3 mr-1" />
              AI Generation Controls
            </span>
            {!userApiKey && remainingDemoGenerations !== null && (
              <span className="ml-auto text-xs text-terminal-accent">
                {remainingDemoGenerations} demo generations remaining
              </span>
            )}
          </div>
          <div className="terminal-content space-y-4">
            {/* Error State */}
            {error && (
              <div className="bg-terminal-error/10 border border-terminal-error/30 rounded p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-terminal-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-terminal-error text-sm font-bold mb-1">Generation Failed</p>
                  <p className="text-terminal-dim text-xs">{error}</p>
                  {error.includes("limit") && !userApiKey && (
                    <Button
                      onClick={() => setShowApiKeyInput(true)}
                      size="sm"
                      className="mt-3 bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg"
                    >
                      <Key className="mr-2 h-3 w-3" />
                      Add API Key for Unlimited Access
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Initial State - No Preview */}
            {!localPreviewHtml && !isGenerating && (
              <div className="text-center py-8">
                <Sparkles className="h-16 w-16 text-terminal-accent mx-auto mb-4 opacity-50" />
                <p className="text-terminal-text mb-4">
                  {hasInputs
                    ? "Ready to generate your prototype with AI"
                    : "Add inspiration or description to get AI-powered customization"}
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!template}
                  className="bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg disabled:opacity-50"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Preview
                </Button>
                {!hasInputs && (
                  <p className="text-xs text-terminal-dim mt-4">
                    Go back to add inspiration or skip this step to use the base template
                  </p>
                )}
                {!userApiKey && (
                  <button
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-xs text-terminal-accent hover:underline mt-4 block mx-auto"
                  >
                    {showApiKeyInput ? "Hide" : "Add"} API key for unlimited generations
                  </button>
                )}
              </div>
            )}

            {/* Generating State */}
            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-terminal-accent mx-auto mb-4 animate-spin" />
                <p className="text-terminal-text mb-2">Generating your prototype...</p>
                <p className="text-xs text-terminal-dim">
                  AI is analyzing your inputs and creating a custom design
                </p>
                <div className="mt-6 space-y-2">
                  <div className="h-2 bg-terminal-bg/50 rounded-full overflow-hidden max-w-md mx-auto">
                    <div
                      className="h-full bg-terminal-accent animate-pulse transition-all duration-500"
                      style={{ width: "75%" }}
                    />
                  </div>
                  <p className="text-xs text-terminal-dim">
                    This may take 10-30 seconds...
                  </p>
                </div>
              </div>
            )}

            {/* Preview Generated - Show Controls */}
            {localPreviewHtml && !isGenerating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewport("desktop")}
                    className={`p-2 rounded transition-colors ${
                      viewport === "desktop"
                        ? "bg-terminal-accent text-terminal-bg"
                        : "text-terminal-text hover:bg-terminal-text/10"
                    }`}
                    title="Desktop View"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewport("tablet")}
                    className={`p-2 rounded transition-colors ${
                      viewport === "tablet"
                        ? "bg-terminal-accent text-terminal-bg"
                        : "text-terminal-text hover:bg-terminal-text/10"
                    }`}
                    title="Tablet View"
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewport("mobile")}
                    className={`p-2 rounded transition-colors ${
                      viewport === "mobile"
                        ? "bg-terminal-accent text-terminal-bg"
                        : "text-terminal-text hover:bg-terminal-text/10"
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleOpenNewTab}
                    variant="outline"
                    size="sm"
                    className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    size="sm"
                    className="border-terminal-text/30 text-terminal-text hover:border-terminal-accent"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Frame */}
        {localPreviewHtml && !isGenerating && (
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-dim ml-2 flex items-center gap-2">
                <span className="text-terminal-accent">●</span>
                Preview - {viewport.charAt(0).toUpperCase() + viewport.slice(1)} View
              </span>
            </div>
            <div className="terminal-content bg-white p-4">
              <div className="flex justify-center">
                <div
                  style={{ width: viewportWidths[viewport], maxWidth: "100%" }}
                  className="transition-all duration-300"
                >
                  <iframe
                    srcDoc={localPreviewHtml}
                    className="w-full border border-gray-200 rounded"
                    style={{ height: "600px" }}
                    sandbox="allow-scripts allow-same-origin"
                    title="AI Generated Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="terminal-window border-terminal-accent/30">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-accent ml-2">
              <Info className="inline h-3 w-3 mr-1" />
              About AI Preview
            </span>
          </div>
          <div className="terminal-content space-y-3 text-sm text-terminal-dim">
            <p>
              This preview is AI-generated to demonstrate what your project could look like based
              on your selections. The actual exported project will include:
            </p>
            <ul className="space-y-1 text-xs list-disc list-inside ml-2">
              <li>Full Next.js 15 project with your selected template</li>
              <li>All {Object.keys(integrations).length} selected integrations pre-configured</li>
              <li>Production-ready code with TypeScript and Tailwind CSS</li>
              <li>Complete documentation and setup instructions</li>
            </ul>
            <p className="text-xs text-terminal-accent mt-3">
              💡 This preview is for inspiration only. The exported project is fully customizable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
