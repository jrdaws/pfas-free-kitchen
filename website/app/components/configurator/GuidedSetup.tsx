"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  MousePointer,
  Github,
  Terminal,
  Database,
  Rocket,
  Check,
  ExternalLink,
  Copy,
  Loader2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

// Tool configuration
export interface ToolConfig {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ReactNode;
  required: boolean;
  docsUrl: string;
  estimatedTime: string;
}

export type ToolId = "cursor" | "github" | "claude-code" | "supabase" | "vercel";

export type ToolStatus = "pending" | "in-progress" | "completed" | "skipped" | "error";

export interface ToolState {
  status: ToolStatus;
  error?: string;
  data?: Record<string, unknown>;
}

// Default tool configurations
const TOOLS: ToolConfig[] = [
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-powered code editor",
    icon: <MousePointer className="h-5 w-5" />,
    required: true,
    docsUrl: "https://cursor.sh/",
    estimatedTime: "2 min",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Version control & collaboration",
    icon: <Github className="h-5 w-5" />,
    required: true,
    docsUrl: "https://github.com/",
    estimatedTime: "3 min",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    description: "AI coding assistant CLI",
    icon: <Terminal className="h-5 w-5" />,
    required: false,
    docsUrl: "https://docs.anthropic.com/",
    estimatedTime: "2 min",
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Backend & database",
    icon: <Database className="h-5 w-5" />,
    required: true,
    docsUrl: "https://supabase.com/",
    estimatedTime: "5 min",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Deploy & hosting",
    icon: <Rocket className="h-5 w-5" />,
    required: false,
    docsUrl: "https://vercel.com/",
    estimatedTime: "3 min",
  },
];

interface GuidedSetupProps {
  /** Callback when tool status changes */
  onToolStatusChange?: (toolId: ToolId, status: ToolStatus, data?: Record<string, unknown>) => void;
  /** Callback when all required tools are completed */
  onComplete?: () => void;
  /** Initial tool states */
  initialStates?: Partial<Record<ToolId, ToolState>>;
  /** Custom tool content renderers */
  renderToolContent?: (toolId: ToolId, state: ToolState, actions: ToolActions) => React.ReactNode;
  /** Class name */
  className?: string;
}

export interface ToolActions {
  markComplete: (data?: Record<string, unknown>) => void;
  markSkipped: () => void;
  setError: (error: string) => void;
  reset: () => void;
}

export function GuidedSetup({
  onToolStatusChange,
  onComplete,
  initialStates = {},
  renderToolContent,
  className,
}: GuidedSetupProps) {
  // Initialize tool states
  const [toolStates, setToolStates] = useState<Record<ToolId, ToolState>>(() => {
    const initial: Record<ToolId, ToolState> = {} as Record<ToolId, ToolState>;
    for (const tool of TOOLS) {
      initial[tool.id] = initialStates[tool.id] || { status: "pending" };
    }
    return initial;
  });

  const [expandedTools, setExpandedTools] = useState<string[]>([]);
  const [copiedCommands, setCopiedCommands] = useState<Record<string, boolean>>({});

  // Calculate progress
  const completedCount = TOOLS.filter(
    (t) => toolStates[t.id].status === "completed" || toolStates[t.id].status === "skipped"
  ).length;
  const requiredCompletedCount = TOOLS.filter(
    (t) => t.required && toolStates[t.id].status === "completed"
  ).length;
  const requiredCount = TOOLS.filter((t) => t.required).length;
  const progress = Math.round((completedCount / TOOLS.length) * 100);
  const allRequiredComplete = requiredCompletedCount === requiredCount;

  // Create actions for a specific tool
  const createToolActions = useCallback(
    (toolId: ToolId): ToolActions => ({
      markComplete: (data) => {
        setToolStates((prev) => ({
          ...prev,
          [toolId]: { status: "completed", data },
        }));
        onToolStatusChange?.(toolId, "completed", data);

        // Check if all required are now complete
        const newStates = { ...toolStates, [toolId]: { status: "completed" as const, data } };
        const allDone = TOOLS.filter((t) => t.required).every(
          (t) => newStates[t.id].status === "completed"
        );
        if (allDone) onComplete?.();
      },
      markSkipped: () => {
        setToolStates((prev) => ({
          ...prev,
          [toolId]: { status: "skipped" },
        }));
        onToolStatusChange?.(toolId, "skipped");
      },
      setError: (error) => {
        setToolStates((prev) => ({
          ...prev,
          [toolId]: { status: "error", error },
        }));
        onToolStatusChange?.(toolId, "error");
      },
      reset: () => {
        setToolStates((prev) => ({
          ...prev,
          [toolId]: { status: "pending" },
        }));
        onToolStatusChange?.(toolId, "pending");
      },
    }),
    [onToolStatusChange, onComplete, toolStates]
  );

  // Copy command to clipboard
  const copyCommand = useCallback((command: string, id: string) => {
    navigator.clipboard.writeText(command);
    setCopiedCommands((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedCommands((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  }, []);

  // Get status badge variant
  const getStatusBadge = (status: ToolStatus, required: boolean) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" className="gap-1"><Check className="h-3 w-3" /> Complete</Badge>;
      case "skipped":
        return <Badge variant="secondary">Skipped</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "in-progress":
        return <Badge variant="info" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> In Progress</Badge>;
      default:
        return required ? (
          <Badge variant="warning">Required</Badge>
        ) : (
          <Badge variant="secondary">Optional</Badge>
        );
    }
  };

  // Get status icon
  const getStatusIcon = (tool: ToolConfig, state: ToolState) => {
    switch (state.status) {
      case "completed":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600">
            <Check className="h-5 w-5" />
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        );
      case "in-progress":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        );
      case "skipped":
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 text-foreground-muted">
            {tool.icon}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-100 text-foreground-secondary">
            {tool.icon}
          </div>
        );
    }
  };

  // Default content renderer for each tool
  const defaultRenderToolContent = (toolId: ToolId, state: ToolState, actions: ToolActions) => {
    const tool = TOOLS.find((t) => t.id === toolId)!;

    switch (toolId) {
      case "cursor":
        return (
          <CursorSetupContent
            state={state}
            actions={actions}
            copyCommand={copyCommand}
            copiedCommands={copiedCommands}
          />
        );
      case "github":
        return (
          <GitHubSetupContent
            state={state}
            actions={actions}
            copyCommand={copyCommand}
            copiedCommands={copiedCommands}
          />
        );
      case "claude-code":
        return (
          <ClaudeCodeSetupContent
            state={state}
            actions={actions}
            copyCommand={copyCommand}
            copiedCommands={copiedCommands}
          />
        );
      case "supabase":
        return (
          <SupabaseSetupContent
            state={state}
            actions={actions}
            copyCommand={copyCommand}
            copiedCommands={copiedCommands}
          />
        );
      case "vercel":
        return (
          <VercelSetupContent
            state={state}
            actions={actions}
            copyCommand={copyCommand}
            copiedCommands={copiedCommands}
          />
        );
      default:
        return (
          <div className="text-sm text-foreground-muted">
            <p>Setup instructions for {tool.name} coming soon.</p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => actions.markComplete()}>
                Mark Complete
              </Button>
              {!tool.required && (
                <Button size="sm" variant="outline" onClick={actions.markSkipped}>
                  Skip
                </Button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Tool Setup Wizard
            </CardTitle>
            <CardDescription className="mt-1">
              Configure your development environment step by step
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground-muted">
              {completedCount} of {TOOLS.length} complete
            </p>
            <Progress value={progress} className="w-32 h-2 mt-1" />
          </div>
        </div>

        {/* All required complete message */}
        {allRequiredComplete && (
          <Alert className="mt-4 bg-emerald-50 border-emerald-200">
            <Check className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-700">Ready to go!</AlertTitle>
            <AlertDescription className="text-emerald-600">
              All required tools are configured. Optional tools can be set up later.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        <Accordion
          type="multiple"
          value={expandedTools}
          onValueChange={setExpandedTools}
          className="w-full space-y-2"
        >
          {TOOLS.map((tool) => {
            const state = toolStates[tool.id];
            const actions = createToolActions(tool.id);
            const isExpanded = expandedTools.includes(tool.id);

            return (
              <AccordionItem
                key={tool.id}
                value={tool.id}
                className={cn(
                  "border rounded-lg overflow-hidden transition-colors",
                  state.status === "completed" && "border-emerald-200 bg-emerald-50/30",
                  state.status === "error" && "border-red-200 bg-red-50/30",
                  state.status === "in-progress" && "border-blue-200 bg-blue-50/30"
                )}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card/50">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(tool, state)}

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{tool.name}</span>
                        {getStatusBadge(state.status, tool.required)}
                      </div>
                      <p className="text-sm text-foreground-muted">{tool.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-foreground-muted">
                      <span>~{tool.estimatedTime}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 pt-2">
                  <div className="pl-14">
                    {renderToolContent
                      ? renderToolContent(tool.id, state, actions)
                      : defaultRenderToolContent(tool.id, state, actions)}

                    {/* Error display */}
                    {state.status === "error" && state.error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Setup Error</AlertTitle>
                        <AlertDescription className="flex items-center justify-between">
                          <span>{state.error}</span>
                          <Button size="sm" variant="outline" onClick={actions.reset}>
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Docs link */}
                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <a
                        href={tool.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View {tool.name} documentation
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// ===============================
// Tool-specific setup content
// ===============================

interface SetupContentProps {
  state: ToolState;
  actions: ToolActions;
  copyCommand: (command: string, id: string) => void;
  copiedCommands: Record<string, boolean>;
}

function CursorSetupContent({ state, actions, copyCommand, copiedCommands }: SetupContentProps) {
  if (state.status === "completed") {
    return (
      <div className="text-sm text-emerald-600 flex items-center gap-2">
        <Check className="h-4 w-4" />
        Cursor is installed and ready
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <ol className="space-y-3 list-decimal list-inside text-foreground-secondary">
        <li>
          Download Cursor from{" "}
          <a
            href="https://cursor.sh/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            cursor.sh
          </a>
        </li>
        <li>Install and open Cursor</li>
        <li>Sign in with your GitHub account (recommended)</li>
        <li>Open your project folder in Cursor</li>
      </ol>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => actions.markComplete()}>
          <Check className="h-4 w-4 mr-1" />
          I&apos;ve installed Cursor
        </Button>
      </div>
    </div>
  );
}

function GitHubSetupContent({ state, actions, copyCommand, copiedCommands }: SetupContentProps) {
  if (state.status === "completed") {
    return (
      <div className="text-sm text-emerald-600 flex items-center gap-2">
        <Check className="h-4 w-4" />
        GitHub repository connected
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <ol className="space-y-3 list-decimal list-inside text-foreground-secondary">
        <li>
          Go to{" "}
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            github.com/new
          </a>{" "}
          to create a repository
        </li>
        <li>Name your repository and set visibility</li>
        <li>Initialize your local project:</li>
      </ol>

      <div className="bg-stone-900 rounded-lg p-3 font-mono text-xs text-stone-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground-muted"># Terminal commands</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-foreground-muted hover:text-white"
            onClick={() => copyCommand("git init\ngit add .\ngit commit -m \"Initial commit\"", "github-init")}
          >
            {copiedCommands["github-init"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <pre className="whitespace-pre-wrap">
{`git init
git add .
git commit -m "Initial commit"`}
        </pre>
      </div>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => actions.markComplete()}>
          <Check className="h-4 w-4 mr-1" />
          Repository created
        </Button>
      </div>
    </div>
  );
}

function ClaudeCodeSetupContent({ state, actions, copyCommand, copiedCommands }: SetupContentProps) {
  if (state.status === "completed") {
    return (
      <div className="text-sm text-emerald-600 flex items-center gap-2">
        <Check className="h-4 w-4" />
        Claude Code CLI installed
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <p className="text-foreground-secondary">
        Claude Code provides AI assistance directly in your terminal.
      </p>

      <div className="bg-stone-900 rounded-lg p-3 font-mono text-xs text-stone-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground-muted"># Install via npm</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-foreground-muted hover:text-white"
            onClick={() => copyCommand("npm install -g @anthropic-ai/claude-code", "claude-install")}
          >
            {copiedCommands["claude-install"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <pre>npm install -g @anthropic-ai/claude-code</pre>
      </div>

      <ol className="space-y-2 list-decimal list-inside text-foreground-secondary">
        <li>Run the install command above</li>
        <li>Run <code className="bg-stone-100 px-1 rounded">claude-code auth</code> to authenticate</li>
        <li>Use <code className="bg-stone-100 px-1 rounded">claude-code</code> in your project</li>
      </ol>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => actions.markComplete()}>
          <Check className="h-4 w-4 mr-1" />
          Installed
        </Button>
        <Button size="sm" variant="outline" onClick={actions.markSkipped}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}

function SupabaseSetupContent({ state, actions, copyCommand, copiedCommands }: SetupContentProps) {
  if (state.status === "completed") {
    return (
      <div className="text-sm text-emerald-600 flex items-center gap-2">
        <Check className="h-4 w-4" />
        Supabase project configured
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <ol className="space-y-3 list-decimal list-inside text-foreground-secondary">
        <li>
          Go to{" "}
          <a
            href="https://supabase.com/dashboard/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            supabase.com/dashboard/new
          </a>{" "}
          to create a project
        </li>
        <li>Choose a name and strong database password</li>
        <li>Wait for the project to be provisioned (~2 min)</li>
        <li>Go to Project Settings → API to get your keys</li>
      </ol>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">Environment Variables</AlertTitle>
        <AlertDescription className="text-amber-600 text-xs">
          You&apos;ll need to add these to your <code>.env.local</code>:
          <ul className="mt-1 list-disc list-inside">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>SUPABASE_SERVICE_ROLE_KEY (server only)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => actions.markComplete()}>
          <Check className="h-4 w-4 mr-1" />
          Project created
        </Button>
      </div>
    </div>
  );
}

function VercelSetupContent({ state, actions, copyCommand, copiedCommands }: SetupContentProps) {
  if (state.status === "completed") {
    return (
      <div className="text-sm text-emerald-600 flex items-center gap-2">
        <Check className="h-4 w-4" />
        Vercel deployment configured
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <ol className="space-y-3 list-decimal list-inside text-foreground-secondary">
        <li>
          Install Vercel CLI (optional but recommended):
        </li>
      </ol>

      <div className="bg-stone-900 rounded-lg p-3 font-mono text-xs text-stone-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-foreground-muted"># Install Vercel CLI</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-foreground-muted hover:text-white"
            onClick={() => copyCommand("npm install -g vercel", "vercel-install")}
          >
            {copiedCommands["vercel-install"] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <pre>npm install -g vercel</pre>
      </div>

      <ol start={2} className="space-y-2 list-decimal list-inside text-foreground-secondary">
        <li>
          Go to{" "}
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            vercel.com/new
          </a>{" "}
          and import your GitHub repo
        </li>
        <li>Configure environment variables from Supabase</li>
        <li>Deploy!</li>
      </ol>

      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={() => actions.markComplete()}>
          <Check className="h-4 w-4 mr-1" />
          Deployed
        </Button>
        <Button size="sm" variant="outline" onClick={actions.markSkipped}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}

export { TOOLS };

