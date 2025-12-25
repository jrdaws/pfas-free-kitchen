"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/lib/configurator-state";
import { buildCommandSingleLine, getRequiredEnvVars } from "@/lib/command-builder";
import { generateProjectZip } from "@/lib/zip-generator";
import { TEMPLATES } from "@/lib/templates";
import {
  CompletionChecklist,
  generateChecklistItems,
  type ChecklistItem,
} from "./CompletionChecklist";
import {
  Copy,
  Check,
  Terminal,
  Download,
  Github,
  Rocket,
  Loader2,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";

type ExportMethod = "clone" | "zip" | "github" | null;

interface GenerateFrameworkProps {
  className?: string;
}

export function GenerateFramework({ className }: GenerateFrameworkProps) {
  const {
    template,
    projectName,
    outputDir,
    integrations,
    vision,
    mission,
    successCriteria,
    envKeys,
    selectedFeatures,
    completedSteps,
  } = useConfiguratorStore();

  // State
  const [selectedMethod, setSelectedMethod] = useState<ExportMethod>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [projectToken, setProjectToken] = useState<string | null>(null);
  const [repoName, setRepoName] = useState(projectName || "my-project");
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate checklist items
  const checklistItems: ChecklistItem[] = useMemo(() => {
    return generateChecklistItems({
      projectName,
      template,
      selectedFeatures,
      integrations,
      apiKeys: Object.fromEntries(
        Object.keys(envKeys).map((k) => [k, Boolean(envKeys[k])])
      ),
      toolStatus: {
        cursor: true, // Assume available
        github: Boolean(repoUrl),
      },
    });
  }, [projectName, template, selectedFeatures, integrations, envKeys, repoUrl]);

  // Calculate readiness
  const requiredComplete = checklistItems.filter(
    (i) => i.severity === "required" && i.status === "complete"
  ).length;
  const requiredTotal = checklistItems.filter(
    (i) => i.severity === "required"
  ).length;
  const isReady = requiredComplete === requiredTotal;
  const readinessPercent =
    requiredTotal > 0 ? Math.round((requiredComplete / requiredTotal) * 100) : 0;

  // Clone command
  const cloneCommand = useMemo(() => {
    if (projectToken) {
      return `npx @jrdaws/framework clone ${projectToken}`;
    }
    return `npx @jrdaws/framework export ${template} ./${projectName || "my-app"}`;
  }, [projectToken, template, projectName]);

  // Full export command
  const exportCommand = useMemo(() => {
    return buildCommandSingleLine({
      template,
      projectName: projectName || "my-app",
      outputDir: outputDir || "./my-app",
      integrations,
    });
  }, [template, projectName, outputDir, integrations]);

  // Required env vars
  const requiredEnvVars = useMemo(
    () => getRequiredEnvVars(integrations),
    [integrations]
  );

  // Copy command handler
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Save to platform and get token
  const handleSaveToPlatform = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          project_name: projectName,
          output_dir: outputDir,
          integrations,
          env_keys: envKeys,
          vision,
          mission,
          success_criteria: successCriteria,
          selected_features: selectedFeatures,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save project");
      }

      const data = await response.json();
      setProjectToken(data.data?.token || data.token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Download ZIP handler
  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setError(null);
    try {
      await generateProjectZip({
        template,
        projectName: projectName || "my-project",
        integrations,
        vision,
        mission,
        successCriteria,
        envKeys,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      setError(message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Create GitHub repo handler
  const handleCreateGitHubRepo = async () => {
    setIsCreatingRepo(true);
    setError(null);
    try {
      // First save to platform to get token
      if (!projectToken) {
        await handleSaveToPlatform();
      }

      // Then create GitHub repo
      const response = await fetch("/api/github/create-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repoName,
          description: `${template} project generated by dawson-does-framework`,
          template,
          projectToken,
          integrations,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create repository");
      }

      const data = await response.json();
      setRepoUrl(data.data?.html_url || data.html_url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "GitHub creation failed";
      setError(message);
    } finally {
      setIsCreatingRepo(false);
    }
  };

  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];
  const integrationCount = Object.values(integrations).filter(Boolean).length;
  const featureCount = Object.values(selectedFeatures).flat().length;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Rocket className="h-4 w-4" />
          Ready to Generate
        </div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Generate Your Project
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Review your configuration, then choose how you want to export your project.
        </p>
      </div>

      {/* Readiness Progress */}
      <Card className="border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isReady ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">
                  {isReady ? "Ready to Export!" : "Almost There..."}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {requiredComplete}/{requiredTotal} required steps complete
                </p>
              </div>
            </div>
            <Badge variant={isReady ? "success" : "secondary"}>
              {readinessPercent}% Complete
            </Badge>
          </div>
          <Progress value={readinessPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Project Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Template</p>
              <p className="font-semibold text-foreground">
                {selectedTemplate?.name || template}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Project Name</p>
              <p className="font-mono text-foreground">
                {projectName || "my-project"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Integrations</p>
              <p className="text-primary font-semibold">
                {integrationCount} selected
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Features</p>
              <p className="text-primary font-semibold">
                {featureCount} selected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Methods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Choose Export Method
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Clone Command */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedMethod === "clone"
                ? "border-primary shadow-lg shadow-primary/20"
                : "hover:border-primary/50"
            )}
            onClick={() => {
              setSelectedMethod("clone");
              if (!projectToken) handleSaveToPlatform();
            }}
          >
            <CardHeader className="pb-2">
              <Badge variant="success" className="w-fit">Recommended</Badge>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Terminal className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-display font-bold text-foreground mb-2">
                NPX Clone Command
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                One command to generate your full project
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">Cursor Ready</Badge>
                <Badge variant="outline" className="text-xs">AI Context</Badge>
              </div>
            </CardContent>
          </Card>

          {/* ZIP Download */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedMethod === "zip"
                ? "border-primary shadow-lg shadow-primary/20"
                : "hover:border-primary/50"
            )}
            onClick={() => setSelectedMethod("zip")}
          >
            <CardHeader className="pb-2">
              <Badge className="w-fit">Quick Start</Badge>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Download className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-display font-bold text-foreground mb-2">
                Download ZIP
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download and extract manually
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">No CLI</Badge>
                <Badge variant="outline" className="text-xs">Offline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Repo */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              selectedMethod === "github"
                ? "border-primary shadow-lg shadow-primary/20"
                : "hover:border-primary/50"
            )}
            onClick={() => setSelectedMethod("github")}
          >
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit">Team Ready</Badge>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Github className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-display font-bold text-foreground mb-2">
                Create GitHub Repo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Push directly to a new repository
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">Version Control</Badge>
                <Badge variant="outline" className="text-xs">Collaborate</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Method Details */}
      {selectedMethod === "clone" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Clone Command
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSaving ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-foreground">
                  Saving project configuration...
                </span>
              </div>
            ) : projectToken ? (
              <>
                <div className="bg-stone-900 rounded-lg p-4 font-mono text-sm">
                  <pre className="text-emerald-400 whitespace-pre-wrap break-all">
                    {cloneCommand}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(cloneCommand)}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Command
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-3">
                    What happens when you run this:
                  </h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Downloads your configured {template} template</span>
                    </li>
                    <li className="flex gap-3">
                      <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>
                        Sets up {integrationCount} integration
                        {integrationCount !== 1 ? "s" : ""}
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Generates CLAUDE.md for AI-assisted development</span>
                    </li>
                    <li className="flex gap-3">
                      <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Creates .cursorrules and START_PROMPT.md</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>Token:</strong>{" "}
                    <code className="text-primary">{projectToken}</code>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Valid for 30 days • Share with your team
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Button onClick={handleSaveToPlatform} disabled={isSaving}>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Token...
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedMethod === "zip" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download ZIP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <h4 className="font-medium text-foreground mb-3">
                What&apos;s Included:
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {selectedTemplate?.name} template files
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Pre-configured integrations
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    .env.local.example with variables
                  </li>
                </ul>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    .dd/ context files
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    README with setup instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    package.json ready to install
                  </li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="w-full"
              size="lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating ZIP...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download {projectName || "project"}.zip
                </>
              )}
            </Button>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-foreground mb-3">After Download:</h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-mono font-bold">1.</span>
                  <span>Extract the ZIP to your projects folder</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-mono font-bold">2.</span>
                  <span>
                    Run <code className="text-primary">npm install</code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-mono font-bold">3.</span>
                  <span>
                    Copy <code className="text-primary">.env.local.example</code> to{" "}
                    <code className="text-primary">.env.local</code>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-mono font-bold">4.</span>
                  <span>
                    Run <code className="text-primary">npm run dev</code>
                  </span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "github" && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Create GitHub Repository
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {repoUrl ? (
              <>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500" />
                  <h4 className="font-semibold text-foreground mb-2">
                    Repository Created!
                  </h4>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {repoUrl}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-3">Clone your repo:</h4>
                  <div className="bg-stone-900 rounded-lg p-4 font-mono text-sm">
                    <pre className="text-emerald-400">
                      git clone {repoUrl}.git
                    </pre>
                  </div>
                  <Button
                    onClick={() => handleCopy(`git clone ${repoUrl}.git`)}
                    variant="outline"
                    className="mt-2 w-full"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Clone Command
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Repository Name
                  </label>
                  <Input
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-awesome-project"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Will be created as a private repository in your GitHub account
                  </p>
                </div>

                <Button
                  onClick={handleCreateGitHubRepo}
                  disabled={isCreatingRepo || !repoName}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingRepo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Repository...
                    </>
                  ) : (
                    <>
                      <Github className="h-4 w-4 mr-2" />
                      Create GitHub Repository
                    </>
                  )}
                </Button>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <AlertCircle className="h-4 w-4 inline mr-2 text-amber-500" />
                    <strong>Note:</strong> You&apos;ll need to connect your GitHub
                    account first. OAuth flow will open in a new window.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Environment Variables */}
      {requiredEnvVars.length > 0 && selectedMethod && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-4 w-4" />
              Required Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add these to your <code className="text-primary">.env.local</code> file:
            </p>
            <div className="bg-muted rounded-lg p-4 border border-border">
              <pre className="text-xs font-mono text-foreground">
                {requiredEnvVars.map((varName) => (
                  <div key={varName} className="mb-1">
                    {varName}=
                  </div>
                ))}
              </pre>
            </div>
            <Button
              onClick={() => handleCopy(requiredEnvVars.join("=\n") + "=")}
              variant="outline"
              size="sm"
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy Variables
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completion Checklist */}
      <CompletionChecklist
        items={checklistItems}
        onExport={() => {
          if (!selectedMethod) setSelectedMethod("clone");
        }}
        canExport={isReady}
      />
    </div>
  );
}

export default GenerateFramework;

