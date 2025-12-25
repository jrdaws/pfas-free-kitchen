"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Rocket,
  Shield,
  Key,
  Database,
  Github,
  Palette,
  FileCode,
  Settings,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

// Checklist item types
export type CheckStatus = "complete" | "incomplete" | "warning" | "error";
export type CheckSeverity = "required" | "recommended" | "optional";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
  severity: CheckSeverity;
  category: CheckCategory;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  details?: string;
}

export type CheckCategory = 
  | "project-setup"
  | "integrations"
  | "api-keys"
  | "features"
  | "security"
  | "optimization";

interface CategoryConfig {
  id: CheckCategory;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "project-setup",
    label: "Project Setup",
    icon: <Settings className="h-4 w-4" />,
    description: "Basic project configuration",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: <Database className="h-4 w-4" />,
    description: "External service connections",
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: <Key className="h-4 w-4" />,
    description: "Authentication credentials",
  },
  {
    id: "features",
    label: "Features",
    icon: <Palette className="h-4 w-4" />,
    description: "Selected functionality",
  },
  {
    id: "security",
    label: "Security",
    icon: <Shield className="h-4 w-4" />,
    description: "Security best practices",
  },
  {
    id: "optimization",
    label: "Optimization",
    icon: <Lightbulb className="h-4 w-4" />,
    description: "Performance suggestions",
  },
];

// Suggested improvements
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: CheckCategory;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

interface CompletionChecklistProps {
  /** List of checklist items to validate */
  items: ChecklistItem[];
  /** Suggested improvements */
  suggestions?: Suggestion[];
  /** Callback when export is clicked */
  onExport?: () => void;
  /** Callback when a specific step needs to be fixed */
  onNavigateToStep?: (stepId: string) => void;
  /** Whether export is allowed */
  canExport?: boolean;
  /** Class name */
  className?: string;
}

export function CompletionChecklist({
  items,
  suggestions = [],
  onExport,
  onNavigateToStep,
  canExport = true,
  className,
}: CompletionChecklistProps) {
  // Calculate stats
  const stats = useMemo(() => {
    const requiredItems = items.filter((i) => i.severity === "required");
    const requiredComplete = requiredItems.filter((i) => i.status === "complete");
    const warnings = items.filter((i) => i.status === "warning");
    const errors = items.filter((i) => i.status === "error" || (i.status === "incomplete" && i.severity === "required"));
    const allComplete = items.filter((i) => i.status === "complete");

    return {
      total: items.length,
      complete: allComplete.length,
      requiredTotal: requiredItems.length,
      requiredComplete: requiredComplete.length,
      warnings: warnings.length,
      errors: errors.length,
      progress: items.length > 0 ? Math.round((allComplete.length / items.length) * 100) : 0,
      requiredProgress: requiredItems.length > 0 
        ? Math.round((requiredComplete.length / requiredItems.length) * 100) 
        : 100,
      isReady: requiredComplete.length === requiredItems.length && errors.length === 0,
    };
  }, [items]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<CheckCategory, ChecklistItem[]> = {
      "project-setup": [],
      "integrations": [],
      "api-keys": [],
      "features": [],
      "security": [],
      "optimization": [],
    };

    items.forEach((item) => {
      groups[item.category].push(item);
    });

    return groups;
  }, [items]);

  // Get status icon
  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "incomplete":
        return <XCircle className="h-5 w-5 text-stone-300" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: CheckSeverity) => {
    switch (severity) {
      case "required":
        return <Badge variant="destructive" className="text-xs">Required</Badge>;
      case "recommended":
        return <Badge variant="warning" className="text-xs">Recommended</Badge>;
      case "optional":
        return <Badge variant="secondary" className="text-xs">Optional</Badge>;
    }
  };

  // Get impact badge for suggestions
  const getImpactBadge = (impact: Suggestion["impact"]) => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive" className="text-xs">High Impact</Badge>;
      case "medium":
        return <Badge variant="warning" className="text-xs">Medium Impact</Badge>;
      case "low":
        return <Badge variant="secondary" className="text-xs">Low Impact</Badge>;
    }
  };

  // Get category status
  const getCategoryStatus = (categoryId: CheckCategory) => {
    const categoryItems = groupedItems[categoryId];
    if (categoryItems.length === 0) return "empty";
    
    const hasErrors = categoryItems.some(
      (i) => i.status === "error" || (i.status === "incomplete" && i.severity === "required")
    );
    const hasWarnings = categoryItems.some((i) => i.status === "warning");
    const allComplete = categoryItems.every((i) => i.status === "complete");

    if (hasErrors) return "error";
    if (hasWarnings) return "warning";
    if (allComplete) return "complete";
    return "incomplete";
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileCode className="h-6 w-6 text-primary" />
              Pre-Export Checklist
            </CardTitle>
            <CardDescription className="mt-1">
              Review and complete all requirements before exporting your project
            </CardDescription>
          </div>

          {/* Overall Status */}
          <div className="text-right">
            {stats.isReady ? (
              <Badge variant="success" className="gap-1 text-sm px-3 py-1">
                <Check className="h-4 w-4" />
                Ready to Export
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-sm px-3 py-1">
                <X className="h-4 w-4" />
                {stats.errors} issues to fix
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Overall Progress</span>
            <span className="font-medium">{stats.progress}%</span>
          </div>
          <Progress value={stats.progress} className="h-2" />
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              {stats.complete} complete
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
              {stats.warnings} warnings
            </span>
            <span className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              {stats.errors} errors
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Critical Errors Alert */}
        {stats.errors > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              You have {stats.errors} required item{stats.errors > 1 ? "s" : ""} that must be 
              completed before you can export your project.
            </AlertDescription>
          </Alert>
        )}

        {/* Warnings Alert */}
        {stats.warnings > 0 && stats.errors === 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Recommendations</AlertTitle>
            <AlertDescription className="text-amber-600">
              You have {stats.warnings} recommended improvement{stats.warnings > 1 ? "s" : ""}. 
              You can export now, but addressing these will improve your project.
            </AlertDescription>
          </Alert>
        )}

        {/* Category Accordions */}
        <Accordion type="multiple" defaultValue={["project-setup", "api-keys"]} className="space-y-2">
          {CATEGORIES.map((category) => {
            const categoryItems = groupedItems[category.id];
            if (categoryItems.length === 0) return null;

            const categoryStatus = getCategoryStatus(category.id);
            const completeCount = categoryItems.filter((i) => i.status === "complete").length;

            return (
              <AccordionItem
                key={category.id}
                value={category.id}
                className={cn(
                  "border rounded-lg overflow-hidden",
                  categoryStatus === "complete" && "border-emerald-200 bg-emerald-50/30",
                  categoryStatus === "error" && "border-red-200 bg-red-50/30",
                  categoryStatus === "warning" && "border-amber-200 bg-amber-50/30"
                )}
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg",
                        categoryStatus === "complete" && "bg-emerald-100 text-emerald-600",
                        categoryStatus === "error" && "bg-red-100 text-red-600",
                        categoryStatus === "warning" && "bg-amber-100 text-amber-600",
                        categoryStatus === "incomplete" && "bg-stone-100 text-stone-600"
                      )}
                    >
                      {categoryStatus === "complete" ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        category.icon
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-stone-500">
                        {completeCount}/{categoryItems.length} complete
                      </div>
                    </div>

                    {categoryStatus === "error" && (
                      <Badge variant="destructive" className="mr-2">Needs attention</Badge>
                    )}
                    {categoryStatus === "warning" && (
                      <Badge variant="warning" className="mr-2">Review suggested</Badge>
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-2 pl-11">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg transition-colors",
                          item.status === "complete" && "bg-emerald-50/50",
                          item.status === "error" && "bg-red-50",
                          item.status === "warning" && "bg-amber-50",
                          item.status === "incomplete" && "bg-stone-50"
                        )}
                      >
                        {getStatusIcon(item.status)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{item.label}</span>
                            {getSeverityBadge(item.severity)}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                          {item.details && (
                            <p className="text-xs text-stone-400 mt-1 italic">{item.details}</p>
                          )}
                        </div>

                        {item.action && item.status !== "complete" && (
                          <Button
                            size="sm"
                            variant={item.status === "error" ? "destructive" : "outline"}
                            className="shrink-0"
                            onClick={() => {
                              if (item.action?.onClick) {
                                item.action.onClick();
                              } else if (onNavigateToStep) {
                                onNavigateToStep(item.id);
                              }
                            }}
                          >
                            {item.action.label}
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Suggested Improvements</h3>
              <Badge variant="secondary">{suggestions.length}</Badge>
            </div>

            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg"
                >
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{suggestion.title}</span>
                      {getImpactBadge(suggestion.impact)}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">{suggestion.description}</p>
                  </div>

                  {suggestion.action && (
                    <Button size="sm" variant="outline" className="shrink-0" asChild>
                      {suggestion.action.href ? (
                        <a href={suggestion.action.href} target="_blank" rel="noopener noreferrer">
                          {suggestion.action.label}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      ) : (
                        <button onClick={suggestion.action.onClick}>
                          {suggestion.action.label}
                        </button>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-stone-500">
              {stats.isReady ? (
                <span className="text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  All required items complete
                </span>
              ) : (
                <span className="text-stone-500">
                  Complete {stats.requiredTotal - stats.requiredComplete} more required item
                  {stats.requiredTotal - stats.requiredComplete > 1 ? "s" : ""} to export
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              
              <Button
                onClick={onExport}
                disabled={!stats.isReady || !canExport}
                className="gap-2"
              >
                <Rocket className="h-4 w-4" />
                Export Project
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to generate checklist items from configurator state
export function generateChecklistItems(config: {
  projectName?: string;
  template?: string;
  selectedFeatures?: Record<string, string[]>;
  integrations?: Record<string, string>;
  apiKeys?: Record<string, boolean>;
  toolStatus?: Record<string, boolean>;
}): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Project Setup
  items.push({
    id: "project-name",
    label: "Project Name",
    description: "A valid project name is set",
    status: config.projectName && config.projectName.length >= 3 ? "complete" : "incomplete",
    severity: "required",
    category: "project-setup",
    action: { label: "Set Name" },
  });

  items.push({
    id: "template",
    label: "Template Selected",
    description: "A starter template is chosen",
    status: config.template ? "complete" : "incomplete",
    severity: "required",
    category: "project-setup",
    action: { label: "Choose Template" },
  });

  // Features
  const allFeatures = Object.values(config.selectedFeatures || {}).flat();
  items.push({
    id: "features",
    label: "Features Selected",
    description: `${allFeatures.length} feature${allFeatures.length !== 1 ? "s" : ""} selected`,
    status: allFeatures.length > 0 ? "complete" : "warning",
    severity: "recommended",
    category: "features",
    action: { label: "Add Features" },
    details: allFeatures.length === 0 ? "Consider adding features to enhance your project" : undefined,
  });

  // Integrations
  const hasSupabase = config.integrations?.database === "supabase";
  const hasAuth = config.integrations?.auth;
  
  items.push({
    id: "database",
    label: "Database Integration",
    description: "Backend database is configured",
    status: hasSupabase ? "complete" : "warning",
    severity: "recommended",
    category: "integrations",
    action: { label: "Configure" },
  });

  items.push({
    id: "auth",
    label: "Authentication",
    description: "User authentication is set up",
    status: hasAuth ? "complete" : "warning",
    severity: "recommended",
    category: "integrations",
    action: { label: "Set Up" },
  });

  // API Keys
  if (hasSupabase) {
    items.push({
      id: "supabase-key",
      label: "Supabase API Key",
      description: "Supabase connection credentials",
      status: config.apiKeys?.supabase ? "complete" : "error",
      severity: "required",
      category: "api-keys",
      action: { label: "Add Key" },
      details: "Required for database functionality",
    });
  }

  const hasAI = config.integrations?.ai;
  if (hasAI) {
    items.push({
      id: "ai-key",
      label: "AI Provider API Key",
      description: `${hasAI} API credentials`,
      status: config.apiKeys?.ai ? "complete" : "error",
      severity: "required",
      category: "api-keys",
      action: { label: "Add Key" },
    });
  }

  // Tool Status
  items.push({
    id: "cursor",
    label: "Cursor Installed",
    description: "AI-powered code editor",
    status: config.toolStatus?.cursor ? "complete" : "incomplete",
    severity: "recommended",
    category: "project-setup",
    action: { label: "Install", href: "https://cursor.sh/" },
  });

  items.push({
    id: "github",
    label: "GitHub Repository",
    description: "Version control set up",
    status: config.toolStatus?.github ? "complete" : "warning",
    severity: "recommended",
    category: "integrations",
    action: { label: "Create Repo" },
  });

  // Security
  items.push({
    id: "env-setup",
    label: "Environment Variables",
    description: ".env.local file will be created",
    status: "complete", // Always complete as we generate it
    severity: "required",
    category: "security",
  });

  items.push({
    id: "gitignore",
    label: ".gitignore Configuration",
    description: "Secrets excluded from version control",
    status: "complete", // Always complete as we include it
    severity: "required",
    category: "security",
  });

  // Optimization
  items.push({
    id: "typescript",
    label: "TypeScript Enabled",
    description: "Type-safe development",
    status: "complete", // All templates use TypeScript
    severity: "optional",
    category: "optimization",
  });

  return items;
}

// Helper to generate suggestions
export function generateSuggestions(config: {
  selectedFeatures?: Record<string, string[]>;
  integrations?: Record<string, string>;
}): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const allFeatures = Object.values(config.selectedFeatures || {}).flat();

  if (allFeatures.length < 3) {
    suggestions.push({
      id: "add-features",
      title: "Add more features",
      description: "Consider adding authentication, analytics, or other features to make your app more complete.",
      impact: "high",
      category: "features",
      action: { label: "Browse Features" },
    });
  }

  if (!config.integrations?.analytics) {
    suggestions.push({
      id: "add-analytics",
      title: "Add Analytics",
      description: "Track user behavior and measure success with an analytics integration.",
      impact: "medium",
      category: "integrations",
      action: { label: "Add Analytics" },
    });
  }

  if (!config.integrations?.email) {
    suggestions.push({
      id: "add-email",
      title: "Set up Email",
      description: "Configure email for notifications, password resets, and user communication.",
      impact: "medium",
      category: "integrations",
      action: { label: "Configure Email" },
    });
  }

  suggestions.push({
    id: "read-docs",
    title: "Read the Documentation",
    description: "Learn about Cursor AI workflows and best practices for faster development.",
    impact: "low",
    category: "optimization",
    action: { label: "View Docs", href: "https://dawson.does/docs" },
  });

  return suggestions;
}

export { CATEGORIES };

