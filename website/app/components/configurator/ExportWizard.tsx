"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Download,
  Github,
  Terminal,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  FileCode,
  Layers,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Package,
  Zap,
} from "lucide-react";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { 
  CompletionChecklist, 
  generateChecklistItems, 
  generateSuggestions,
  ChecklistItem,
  Suggestion,
} from "./CompletionChecklist";
import { FileTreeView, generateProjectTree, TreeNode } from "./FileTreeView";

// Export method types
export type ExportMethod = "npx" | "zip" | "github";

interface ExportOption {
  id: ExportMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  recommended?: boolean;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "npx",
    name: "NPX Command",
    description: "Copy and run in your terminal for instant setup",
    icon: <Terminal className="h-6 w-6" />,
    badge: "Fastest",
    recommended: true,
  },
  {
    id: "zip",
    name: "Download ZIP",
    description: "Download complete project as a ZIP file",
    icon: <Download className="h-6 w-6" />,
    badge: "Offline",
  },
  {
    id: "github",
    name: "Create GitHub Repo",
    description: "Create a new repository with your project",
    icon: <Github className="h-6 w-6" />,
    badge: "Collaborate",
  },
];

interface ExportWizardProps {
  /** Class name */
  className?: string;
}

export function ExportWizard({ className }: ExportWizardProps) {
  const [activeTab, setActiveTab] = useState<"review" | "preview" | "export">("review");
  const [selectedMethod, setSelectedMethod] = useState<ExportMethod | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Get config from store
  const {
    projectName,
    outputDir,
    template,
    selectedFeatures,
    integrations,
    description,
  } = useConfiguratorStore();

  // Generate checklist items from current config
  const checklistItems = useMemo<ChecklistItem[]>(() => {
    return generateChecklistItems({
      projectName,
      template,
      selectedFeatures,
      integrations,
      apiKeys: {
        supabase: integrations.database === "supabase" ? true : false,
        ai: integrations.ai ? true : false,
      },
      toolStatus: {
        cursor: true, // Assume installed for now
        github: false,
      },
    });
  }, [projectName, template, selectedFeatures, integrations]);

  // Generate suggestions
  const suggestions = useMemo<Suggestion[]>(() => {
    return generateSuggestions({
      selectedFeatures,
      integrations,
    });
  }, [selectedFeatures, integrations]);

  // Generate file tree
  const fileTree = useMemo<TreeNode[]>(() => {
    return generateProjectTree({
      projectName: projectName || "my-project",
      template: template || "saas",
      selectedFeatures: Object.values(selectedFeatures).flat(),
      integrations,
    });
  }, [projectName, template, selectedFeatures, integrations]);

  // Check if ready to export
  const isReady = useMemo(() => {
    const requiredItems = checklistItems.filter((i) => i.severity === "required");
    const requiredComplete = requiredItems.filter((i) => i.status === "complete");
    return requiredComplete.length === requiredItems.length;
  }, [checklistItems]);

  // Generate NPX command
  const npxCommand = useMemo(() => {
    const allFeatures = Object.values(selectedFeatures).flat();
    const featureFlags = allFeatures.length > 0 ? ` --features ${allFeatures.join(",")}` : "";
    const dbFlag = integrations.database ? ` --db ${integrations.database}` : "";
    const authFlag = integrations.auth ? ` --auth ${integrations.auth}` : "";
    const aiFlag = integrations.ai ? ` --ai ${integrations.ai}` : "";
    
    return `npx create-dawson-app@latest ${projectName || "my-project"}${featureFlags}${dbFlag}${authFlag}${aiFlag}`;
  }, [projectName, selectedFeatures, integrations]);

  // Copy NPX command
  const handleCopyCommand = useCallback(() => {
    navigator.clipboard.writeText(npxCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [npxCommand]);

  // Handle ZIP download
  const handleDownloadZip = useCallback(async () => {
    setIsExporting(true);
    setDownloadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Call API to generate ZIP
      const response = await fetch("/api/export/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          template,
          selectedFeatures: Object.values(selectedFeatures).flat(),
          integrations,
          description,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to generate ZIP");
      }

      setDownloadProgress(100);

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName || "my-project"}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportComplete(true);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [projectName, template, selectedFeatures, integrations, description]);

  // Handle GitHub repo creation
  const handleCreateGitHubRepo = useCallback(() => {
    // Open GitHub new repo page with pre-filled info
    const repoName = projectName || "my-project";
    const repoDesc = encodeURIComponent(description || "Created with Dawson Does Framework");
    window.open(
      `https://github.com/new?name=${repoName}&description=${repoDesc}&visibility=private`,
      "_blank"
    );
  }, [projectName, description]);

  // Handle export based on method
  const handleExport = useCallback(() => {
    switch (selectedMethod) {
      case "npx":
        handleCopyCommand();
        setExportComplete(true);
        break;
      case "zip":
        handleDownloadZip();
        break;
      case "github":
        handleCreateGitHubRepo();
        setExportComplete(true);
        break;
    }
  }, [selectedMethod, handleCopyCommand, handleDownloadZip, handleCreateGitHubRepo]);

  return (
    <Card className={cn("max-w-5xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Export Your Project
            </CardTitle>
            <CardDescription className="mt-1">
              Review, preview, and export your configured project
            </CardDescription>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm font-medium">{projectName || "Unnamed"}</p>
              <p className="text-xs text-foreground-muted">Project</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="capitalize">
                {template || "None"}
              </Badge>
              <p className="text-xs text-foreground-muted mt-1">Template</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {Object.values(selectedFeatures).flat().length}
              </p>
              <p className="text-xs text-foreground-muted">Features</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="review" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Review
              {!isReady && (
                <Badge variant="destructive" className="ml-1 h-5 px-1.5">!</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Layers className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2" disabled={!isReady}>
              <Package className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Review Tab */}
          <TabsContent value="review">
            <CompletionChecklist
              items={checklistItems}
              suggestions={suggestions}
              onExport={() => {
                if (isReady) setActiveTab("export");
              }}
              canExport={isReady}
              className="border-0 shadow-none p-0"
            />
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <FileTreeView
              tree={fileTree}
              title="Generated Project Structure"
              description={`Files that will be created for ${projectName || "your project"}`}
              defaultExpanded={[
                `${projectName || "my-project"}`,
                `${projectName || "my-project"}/app`,
                `${projectName || "my-project"}/components`,
              ]}
              maxHeight="400px"
              className="border-0 shadow-none p-0"
            />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            {exportComplete ? (
              /* Success State */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold">Export Complete!</h3>
                <p className="text-foreground-muted max-w-md mx-auto">
                  {selectedMethod === "npx" && "Command copied! Paste it in your terminal to get started."}
                  {selectedMethod === "zip" && "Your project has been downloaded. Extract and open in Cursor to begin."}
                  {selectedMethod === "github" && "Repository page opened. Complete the setup on GitHub."}
                </p>

                {/* Next Steps */}
                <Alert className="max-w-lg mx-auto bg-primary/5 border-primary/20 text-left">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary">Next Steps</AlertTitle>
                  <AlertDescription className="text-foreground-secondary">
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      {selectedMethod === "npx" && (
                        <>
                          <li>Open your terminal</li>
                          <li>Navigate to your preferred directory</li>
                          <li>Paste and run the command</li>
                          <li>Open the project in Cursor</li>
                        </>
                      )}
                      {selectedMethod === "zip" && (
                        <>
                          <li>Extract the ZIP file</li>
                          <li>Open the folder in Cursor</li>
                          <li>Run <code className="bg-stone-100 px-1 rounded">npm install</code></li>
                          <li>Copy <code className="bg-stone-100 px-1 rounded">.env.local.example</code> to <code className="bg-stone-100 px-1 rounded">.env.local</code></li>
                          <li>Run <code className="bg-stone-100 px-1 rounded">npm run dev</code></li>
                        </>
                      )}
                      {selectedMethod === "github" && (
                        <>
                          <li>Complete repository creation on GitHub</li>
                          <li>Clone the repository locally</li>
                          <li>Run the NPX command to populate it</li>
                          <li>Push changes to GitHub</li>
                        </>
                      )}
                    </ol>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExportComplete(false);
                      setSelectedMethod(null);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Export Again
                  </Button>
                  <Button asChild>
                    <a href="https://dawson.does/docs/getting-started" target="_blank" rel="noopener noreferrer">
                      View Documentation
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              /* Export Options */
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  {EXPORT_OPTIONS.map((option) => (
                    <Card
                      key={option.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedMethod === option.id && "border-primary shadow-lg ring-2 ring-primary/20"
                      )}
                      onClick={() => setSelectedMethod(option.id)}
                    >
                      <CardContent className="pt-6 text-center">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4",
                          selectedMethod === option.id 
                            ? "bg-primary text-white" 
                            : "bg-stone-100 text-foreground-secondary"
                        )}>
                          {option.icon}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className="font-semibold">{option.name}</h3>
                          {option.recommended && (
                            <Badge variant="success" className="text-[10px]">
                              <Zap className="h-2 w-2 mr-0.5" />
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground-muted">{option.description}</p>
                        {option.badge && !option.recommended && (
                          <Badge variant="secondary" className="mt-2">
                            {option.badge}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Method-specific content */}
                {selectedMethod && (
                  <div className="mt-6 space-y-4">
                    {selectedMethod === "npx" && (
                      <Card className="bg-stone-900 border-stone-800">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Terminal className="h-4 w-4 text-foreground-muted" />
                              <span className="text-sm text-foreground-muted">Terminal Command</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-foreground-muted hover:text-white"
                              onClick={handleCopyCommand}
                            >
                              {copied ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <pre className="text-emerald-400 font-mono text-sm overflow-x-auto p-4 bg-stone-950 rounded-lg">
                            {npxCommand}
                          </pre>
                        </CardContent>
                      </Card>
                    )}

                    {selectedMethod === "zip" && isExporting && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Generating your project...</span>
                            </div>
                            <Progress value={downloadProgress} className="h-2" />
                            <p className="text-sm text-foreground-muted">
                              This may take a few seconds...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {selectedMethod === "github" && (
                      <Alert className="bg-card">
                        <Github className="h-4 w-4" />
                        <AlertTitle>GitHub Repository</AlertTitle>
                        <AlertDescription>
                          Clicking &quot;Create Repository&quot; will open GitHub in a new tab with your 
                          project name and description pre-filled. After creating the repo, you can 
                          use the NPX command to populate it with your project.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Export Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        size="lg"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="gap-2"
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            {selectedMethod === "npx" && <Copy className="h-4 w-4" />}
                            {selectedMethod === "zip" && <Download className="h-4 w-4" />}
                            {selectedMethod === "github" && <Github className="h-4 w-4" />}
                            {selectedMethod === "npx" && "Copy Command"}
                            {selectedMethod === "zip" && "Download ZIP"}
                            {selectedMethod === "github" && "Create Repository"}
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {!selectedMethod && (
                  <div className="text-center py-8 text-foreground-muted">
                    <FileCode className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Select an export method above to continue</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export { EXPORT_OPTIONS };

