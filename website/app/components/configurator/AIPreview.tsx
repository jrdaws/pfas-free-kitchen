"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Monitor, Tablet, Smartphone, RotateCcw, ExternalLink } from "lucide-react";

interface AIPreviewProps {
  template: string;
  inspirations: any[];
  description: string;
  isGenerating: boolean;
  previewHtml: string | null;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function AIPreview({
  template,
  inspirations,
  description,
  isGenerating,
  previewHtml,
  onGenerate,
  onRegenerate,
}: AIPreviewProps) {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const viewportWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const hasInputs = inspirations.length > 0 || description.trim().length > 0;

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
          </div>
          <div className="terminal-content space-y-4">
            {!previewHtml && !isGenerating && (
              <div className="text-center py-8">
                <Sparkles className="h-16 w-16 text-terminal-accent mx-auto mb-4 opacity-50" />
                <p className="text-terminal-text mb-4">
                  {hasInputs
                    ? "Ready to generate your prototype with AI"
                    : "Add inspiration or description to get AI-powered customization"}
                </p>
                <Button
                  onClick={onGenerate}
                  disabled={!hasInputs}
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
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-terminal-accent mx-auto mb-4 animate-spin" />
                <p className="text-terminal-text mb-2">Generating your prototype...</p>
                <p className="text-xs text-terminal-dim">
                  AI is analyzing your inputs and creating a custom design
                </p>
                <div className="mt-6 space-y-2">
                  <div className="h-2 bg-terminal-bg/50 rounded-full overflow-hidden max-w-md mx-auto">
                    <div className="h-full bg-terminal-accent animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            )}

            {previewHtml && !isGenerating && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewport("desktop")}
                    className={`p-2 rounded transition-colors ${
                      viewport === "desktop"
                        ? "bg-terminal-accent text-terminal-bg"
                        : "text-terminal-text hover:bg-terminal-text/10"
                    }`}
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
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={onRegenerate}
                    variant="outline"
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
        {previewHtml && !isGenerating && (
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-dim ml-2 flex items-center gap-2">
                Preview - {viewport.charAt(0).toUpperCase() + viewport.slice(1)} View
                <a
                  href="#"
                  className="ml-auto text-terminal-accent hover:underline text-xs flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open in New Tab
                </a>
              </span>
            </div>
            <div className="terminal-content bg-white">
              <div className="flex justify-center p-4">
                <div
                  style={{ width: viewportWidths[viewport], maxWidth: "100%" }}
                  className="transition-all duration-300"
                >
                  <iframe
                    srcDoc={previewHtml}
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

        {/* Placeholder for Phase 3 */}
        {!previewHtml && !isGenerating && (
          <div className="terminal-window border-terminal-warning/50">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-warning ml-2">
                Coming Soon: AI Preview
              </span>
            </div>
            <div className="terminal-content text-center py-8">
              <p className="text-terminal-dim mb-4">
                AI-powered preview generation will be available in Phase 3.
              </p>
              <p className="text-xs text-terminal-dim">
                For now, you can skip this step and export your configured template.
                <br />
                The template will include all your selected integrations and be ready to customize manually.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
