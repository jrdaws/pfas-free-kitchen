"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ExternalLink, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface GuidedStep {
  number: number;
  content: React.ReactNode;
}

interface ToolSetupSectionProps {
  toolId: "cursor" | "github" | "claude-code" | "supabase" | "vercel";
  isComplete?: boolean;
  isLoading?: boolean;
  onMarkComplete?: () => void;
  onConnect?: () => void;
}

const TOOL_CONFIGS: Record<string, {
  name: string;
  description: string;
  steps: GuidedStep[];
  primaryAction: string;
  primaryUrl?: string;
  showConnectButton?: boolean;
}> = {
  cursor: {
    name: "Cursor",
    description: "AI-powered code editor that makes you extraordinarily productive",
    steps: [
      { number: 1, content: <>Go to <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">cursor.sh</a> to download</> },
      { number: 2, content: "Install Cursor on your machine" },
      { number: 3, content: "Sign in with your GitHub account (recommended)" },
    ],
    primaryAction: "Download Cursor",
    primaryUrl: "https://cursor.sh",
  },
  github: {
    name: "GitHub",
    description: "Create a repository to store your project code",
    steps: [
      { number: 1, content: <>Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/new</a> to create a repository</> },
      { number: 2, content: "Name your repository and choose visibility" },
      { number: 3, content: "Initialize with a README (optional)" },
    ],
    primaryAction: "Create Repository",
    primaryUrl: "https://github.com/new",
  },
  "claude-code": {
    name: "Claude Code",
    description: "AI coding assistant CLI for your terminal",
    steps: [
      { number: 1, content: "Open your terminal" },
      { number: 2, content: <>Run: <code className="bg-background-alt px-1.5 py-0.5 rounded text-xs font-mono text-foreground">npm install -g @anthropic-ai/claude-code</code></> },
      { number: 3, content: <>Run: <code className="bg-background-alt px-1.5 py-0.5 rounded text-xs font-mono text-foreground">claude-code auth</code> to authenticate</> },
    ],
    primaryAction: "View Documentation",
    primaryUrl: "https://docs.anthropic.com",
  },
  supabase: {
    name: "Supabase",
    description: "Use Supabase to manage user authentication, database, and file storage",
    steps: [
      { number: 1, content: <>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase</a> to create an account or login</> },
      { number: 2, content: "Create a new project or select an existing one" },
      { number: 3, content: <>Click &quot;Connect Supabase&quot; below to authorize access</> },
    ],
    primaryAction: "Connect Supabase",
    showConnectButton: true,
  },
  vercel: {
    name: "Vercel",
    description: "Deploy your application to the world",
    steps: [
      { number: 1, content: <>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">vercel.com</a> and sign in</> },
      { number: 2, content: "Import your GitHub repository" },
      { number: 3, content: "Configure environment variables" },
    ],
    primaryAction: "Deploy to Vercel",
    primaryUrl: "https://vercel.com/new",
  },
};

export function ToolSetupSection({
  toolId,
  isComplete = false,
  isLoading = false,
  onMarkComplete,
  onConnect,
}: ToolSetupSectionProps) {
  const [copied, setCopied] = useState(false);
  const config = TOOL_CONFIGS[toolId];

  const copyCommand = useCallback((command: string) => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (!config) return null;

  if (isComplete) {
    return (
      <div className="flex items-center gap-1.5 py-1">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20">
          <Check className="h-3 w-3 text-emerald-400" />
        </div>
        <span className="text-xs text-emerald-400 font-medium">
          {config.name} ready
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Description - Compact */}
      <p className="text-[10px] text-white/50">{config.description}</p>

      {/* Guided Steps - Compact */}
      <div className="space-y-1.5">
        {config.steps.map((step) => (
          <div key={step.number} className="flex items-start gap-2">
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[9px] font-semibold shrink-0 mt-0.5">
              {step.number}
            </div>
            <div className="text-[11px] text-white/70 leading-tight [&_a]:text-[var(--primary)] [&_a]:hover:underline [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[9px]">
              {step.content}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons - Compact */}
      <div className="flex gap-1.5 pt-1">
        {config.showConnectButton ? (
          <Button
            size="sm"
            className="h-6 text-[10px] px-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white"
            onClick={onConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <>
                Connect
                <ExternalLink className="h-2 w-2 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-6 text-[10px] px-2 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white"
            onClick={() => config.primaryUrl && window.open(config.primaryUrl, "_blank")}
          >
            {config.primaryAction}
            <ExternalLink className="h-2 w-2 ml-1" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-[10px] px-2 border-white/20 text-white/70 hover:bg-white/10"
          onClick={onMarkComplete}
        >
          Done
          <Check className="h-2 w-2 ml-1" />
        </Button>
      </div>
    </div>
  );
}

