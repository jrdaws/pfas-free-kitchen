"use client";

import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";
import { 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Smartphone, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface LivePreviewPanelProps {
  template: string;
  integrations: Record<string, string>;
  projectName: string;
  description?: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function LivePreviewPanel({
  template,
  integrations,
  projectName,
  description,
  isVisible,
  onToggle,
}: LivePreviewPanelProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];
  
  // Count configured integrations
  const configuredIntegrations = Object.values(integrations).filter(Boolean).length;

  // Generate preview content based on configuration
  const previewContent = useMemo(() => {
    const templateName = selectedTemplate?.name || "SaaS Starter";
    const integrationsText = Object.entries(integrations)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName || "My Project"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; }
  </style>
</head>
<body class="bg-stone-950 text-white min-h-screen">
  <!-- Nav -->
  <nav class="border-b border-stone-800 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400"></div>
        <span class="font-bold text-lg">${projectName || "My Project"}</span>
      </div>
      <div class="flex items-center gap-4">
        <a href="#" class="text-stone-400 hover:text-white text-sm">Features</a>
        <a href="#" class="text-stone-400 hover:text-white text-sm">Pricing</a>
        ${integrations.auth ? `<button class="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-500 rounded-lg">Sign In</button>` : ""}
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="px-6 py-24 text-center">
    <div class="max-w-4xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
        <span>✨</span>
        <span>${templateName}</span>
      </div>
      <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-stone-400 bg-clip-text text-transparent">
        ${description || "Build Something Amazing"}
      </h1>
      <p class="text-xl text-stone-400 mb-8 max-w-2xl mx-auto">
        ${configuredIntegrations > 0 
          ? `Powered by ${configuredIntegrations} integration${configuredIntegrations > 1 ? 's' : ''}: ${integrationsText || 'None configured'}`
          : 'Configure your integrations to see them reflected here.'}
      </p>
      <div class="flex gap-4 justify-center">
        <button class="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Get Started
        </button>
        <button class="px-6 py-3 border border-stone-700 rounded-lg font-medium hover:border-stone-500 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  </section>

  <!-- Features Grid -->
  <section class="px-6 py-16 border-t border-stone-800">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
      <div class="grid md:grid-cols-3 gap-6">
        ${integrations.auth ? `
        <div class="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">🔐</div>
          <h3 class="font-semibold mb-2">Authentication</h3>
          <p class="text-stone-400 text-sm">Secure ${integrations.auth} authentication built-in</p>
        </div>
        ` : ""}
        ${integrations.payments ? `
        <div class="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">💳</div>
          <h3 class="font-semibold mb-2">Payments</h3>
          <p class="text-stone-400 text-sm">${integrations.payments} integration for billing</p>
        </div>
        ` : ""}
        ${integrations.db ? `
        <div class="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">🗄️</div>
          <h3 class="font-semibold mb-2">Database</h3>
          <p class="text-stone-400 text-sm">${integrations.db} for data storage</p>
        </div>
        ` : ""}
        ${integrations.ai ? `
        <div class="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-orange-400/20 flex items-center justify-center mb-4">🤖</div>
          <h3 class="font-semibold mb-2">AI Powered</h3>
          <p class="text-stone-400 text-sm">${integrations.ai} integration for AI features</p>
        </div>
        ` : ""}
        ${integrations.email ? `
        <div class="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">📧</div>
          <h3 class="font-semibold mb-2">Email</h3>
          <p class="text-stone-400 text-sm">${integrations.email} for transactional emails</p>
        </div>
        ` : ""}
        ${integrations.analytics ? `
        <div class="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <div class="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">📊</div>
          <h3 class="font-semibold mb-2">Analytics</h3>
          <p class="text-stone-400 text-sm">${integrations.analytics} for insights</p>
        </div>
        ` : ""}
        ${configuredIntegrations === 0 ? `
        <div class="p-6 rounded-xl bg-stone-900/50 border border-dashed border-stone-700 col-span-full text-center">
          <p class="text-stone-500">Configure integrations to see feature cards here</p>
        </div>
        ` : ""}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="px-6 py-8 border-t border-stone-800 text-center text-stone-500 text-sm">
    <p>Built with Dawson-Does Framework • ${templateName}</p>
  </footer>
</body>
</html>
    `.trim();
  }, [template, integrations, projectName, description, selectedTemplate, configuredIntegrations]);

  // Refresh preview when config changes
  useEffect(() => {
    setPreviewKey(k => k + 1);
  }, [template, integrations, projectName]);

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 bottom-20 z-50 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Eye className="h-4 w-4" />
        <span className="text-sm font-medium">Preview</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-screen bg-card border-l border-border flex flex-col z-40 transition-all duration-300",
        isExpanded ? "w-[60vw]" : "w-[400px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Live Preview</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {configuredIntegrations} integration{configuredIntegrations !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <button
              onClick={() => setViewport("desktop")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewport === "desktop" ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewport === "mobile" ? "bg-background shadow-sm" : "hover:bg-muted"
              )}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={() => setPreviewKey(k => k + 1)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-stone-900 p-4 overflow-hidden">
        <div
          className={cn(
            "h-full mx-auto bg-stone-50 rounded-lg overflow-hidden shadow-2xl transition-all duration-300",
            viewport === "mobile" ? "w-[375px]" : "w-full"
          )}
        >
          <iframe
            key={previewKey}
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/80 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Template: {selectedTemplate?.name || "None"}</span>
          <span>•</span>
          <span>Project: {projectName || "Untitled"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
        </div>
      </div>
    </div>
  );
}

// Toggle button component for the main layout
export function PreviewToggleButton({
  isVisible,
  onToggle,
}: {
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="gap-2"
    >
      {isVisible ? (
        <>
          <EyeOff className="h-4 w-4" />
          <span className="hidden sm:inline">Hide Preview</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Show Preview</span>
        </>
      )}
    </Button>
  );
}

