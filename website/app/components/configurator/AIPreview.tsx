"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Info,
  Edit3,
  Code2,
  Save,
  Check
} from "lucide-react";
import { generatePreview } from "@/lib/preview-generator";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { CollaborativeVisualEditor } from "@/app/components/editor/CollaborativeVisualEditor";

interface AIPreviewProps {
  template: string;
  integrations: Record<string, string>;
  inspirations: Array<{ type: string; value: string; preview?: string }>;
  description: string;
}

// Helper functions for user identification
function getUserId(): string {
  if (typeof window === "undefined") return "server-user";

  // Try to get from localStorage
  let userId = localStorage.getItem("dawson-collab-user-id");

  if (!userId) {
    // Generate a new random user ID
    userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("dawson-collab-user-id", userId);
  }

  return userId;
}

function getUserName(): string {
  if (typeof window === "undefined") return "Server User";

  // Try to get from localStorage
  let userName = localStorage.getItem("dawson-collab-user-name");

  if (!userName) {
    // Generate a fun random name
    const adjectives = ["Creative", "Happy", "Clever", "Swift", "Bright", "Bold", "Cool", "Epic"];
    const nouns = ["Designer", "Developer", "Builder", "Maker", "Coder", "Artist", "Creator", "Hacker"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    userName = `${adjective} ${noun}`;
    localStorage.setItem("dawson-collab-user-name", userName);
  }

  return userName;
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
    projectName,
    vision,
    mission,
    setGenerating,
    setUserApiKey,
    setRemainingDemoGenerations,
    setPreviewHtml,
  } = useConfiguratorStore();

  const [localPreviewHtml, setLocalPreviewHtml] = useState<string | null>(previewHtml);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [components, setComponents] = useState<string[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const viewportWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const hasInputs = inspirations.length > 0 || description.trim().length > 0;

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    setIsCached(false);

    try {
      const result = await generatePreview({
        template,
        projectName: projectName || undefined,
        integrations,
        inspirations,
        description,
        vision: vision || undefined,
        mission: mission || undefined,
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
      setComponents(result.components || []);
      setGeneratedAt(result.generatedAt || null);
      setIsCached(result.cached || false);
      
      if (result.remainingDemoGenerations !== undefined) {
        setRemainingDemoGenerations(result.remainingDemoGenerations);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate preview";
      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setLocalPreviewHtml(null);
    setComponents([]);
    setGeneratedAt(null);
    setIsCached(false);
    handleGenerate();
  };

  const handleOpenNewTab = () => {
    if (!localPreviewHtml) return;
    const blob = new Blob([localPreviewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleSave = () => {
    if (!localPreviewHtml) return;
    setPreviewHtml(localPreviewHtml);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          AI-Generated Preview
        </h2>
        <p className="text-muted-foreground">
          Generate a visual prototype based on your template and inspiration
        </p>
        <Badge variant="info" className="mt-2">
          Optional: Skip to export your configured template without AI customization
        </Badge>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* API Key Management */}
        {(showApiKeyInput || userApiKey) && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Key className="h-4 w-4" />
                Anthropic API Key Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  Using your own API key removes generation limits. Your key is stored locally
                  and only sent to the Anthropic API. Get a key at{" "}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-foreground text-sm">
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
                      className="font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -transtone-y-1/2 text-muted-foreground hover:text-foreground"
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
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generation Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Generation Controls
            {!userApiKey && remainingDemoGenerations !== null && (
                <Badge variant="info" className="ml-auto">
                {remainingDemoGenerations} demo generations remaining
                </Badge>
            )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error State */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-destructive text-sm font-bold mb-1">Generation Failed</p>
                  <p className="text-muted-foreground text-xs">{error}</p>
                  {error.includes("limit") && !userApiKey && (
                    <Button
                      onClick={() => setShowApiKeyInput(true)}
                      size="sm"
                      className="mt-3"
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
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
                <p className="text-foreground mb-4">
                  {hasInputs
                    ? "Ready to generate your prototype with AI"
                    : "Add inspiration or description to get AI-powered customization"}
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!template}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Preview
                </Button>
                {!hasInputs && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Go back to add inspiration or skip this step to use the base template
                  </p>
                )}
                {!userApiKey && (
                  <button
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="text-xs text-primary hover:underline mt-4 block mx-auto"
                  >
                    {showApiKeyInput ? "Hide" : "Add"} API key for unlimited generations
                  </button>
                )}
              </div>
            )}

            {/* Generating State */}
            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-foreground mb-2">Generating your prototype...</p>
                <p className="text-xs text-muted-foreground">
                  AI is analyzing your inputs and creating a custom design
                </p>
                <div className="mt-6 space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden max-w-md mx-auto">
                    <div
                      className="h-full bg-primary animate-pulse transition-all duration-500"
                      style={{ width: "75%" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    title="Desktop View"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewport("tablet")}
                    className={`p-2 rounded transition-colors ${
                      viewport === "tablet"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    title="Tablet View"
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewport("mobile")}
                    className={`p-2 rounded transition-colors ${
                      viewport === "mobile"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                    title="Mobile View"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-muted-foreground ml-2">
                    {viewport.charAt(0).toUpperCase() + viewport.slice(1)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setEditMode(!editMode)}
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                  >
                    {editMode ? (
                      <>
                        <Code2 className="mr-2 h-4 w-4" />
                        View Only
                      </>
                    ) : (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Mode
                      </>
                    )}
                  </Button>
                  {editMode && (
                    <Button
                      onClick={handleSave}
                      variant={saved ? "default" : "outline"}
                      size="sm"
                      className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      {saved ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleOpenNewTab}
                    variant="outline"
                    size="sm"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Frame */}
        {localPreviewHtml && !isGenerating && (
          <>
            {editMode ? (
              // Edit Mode - Full Visual Editor
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-primary" />
                    Visual Editor - Click elements to edit
                    {localPreviewHtml !== previewHtml && !saved && (
                      <Badge variant="warning" className="ml-2">unsaved changes</Badge>
                    )}
                  {components.length > 0 && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                      Components: {components.join(" · ")}
                    </span>
                  )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0" style={{ height: "700px" }}>
                  <CollaborativeVisualEditor
                    html={localPreviewHtml}
                    onHtmlChange={setLocalPreviewHtml}
                    className="h-full"
                    projectId={projectName || "default-project"}
                    userId={getUserId()}
                    userName={getUserName()}
                    enableCollaboration={true}
                    viewport={viewport}
                  />
                </CardContent>
              </Card>
            ) : (
              // View Mode - Standard iframe with viewport controls
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-primary">●</span>
                    Preview - {viewport.charAt(0).toUpperCase() + viewport.slice(1)} View
                    {isCached && <Badge variant="info" className="ml-2">cached</Badge>}
                    {components.length > 0 && (
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        Components: {components.join(" · ")}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="bg-stone-50 p-4">
                  <div className="flex justify-center">
                    <div
                      style={{ width: viewportWidths[viewport], maxWidth: "100%" }}
                      className="transition-all duration-300"
                    >
                      <iframe
                        srcDoc={localPreviewHtml}
                        className="w-full border border-stone-200 rounded"
                        style={{ height: "600px" }}
                        sandbox="allow-scripts allow-same-origin"
                        title="AI Generated Preview"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Info Box */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Info className="h-4 w-4" />
              About AI Preview
            {generatedAt && (
                <span className="ml-auto text-[10px] text-muted-foreground font-normal">
                Generated: {new Date(generatedAt).toLocaleTimeString()}
              </span>
            )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This preview is AI-generated to demonstrate what your project could look like based
              on your selections. The actual exported project will include:
            </p>
            <ul className="space-y-1 text-xs list-disc list-inside ml-2">
              <li>Full Next.js 15 project with your selected template</li>
              <li>All {Object.keys(integrations).filter(k => integrations[k]).length} selected integrations pre-configured</li>
              {components.length > 0 && (
                <li>
                  Components shown: {components.join(", ")}
                </li>
              )}
              <li>Production-ready code with TypeScript and Tailwind CSS</li>
              <li>Complete documentation and setup instructions</li>
            </ul>
            <p className="text-xs text-primary mt-3">
              💡 This preview is for inspiration only. The exported project is fully customizable.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
