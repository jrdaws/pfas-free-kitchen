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
      { number: 1, content: <>Go to <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline">cursor.sh</a> to download</> },
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
      { number: 1, content: <>Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline">github.com/new</a> to create a repository</> },
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
      { number: 2, content: <>Run: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">npm install -g @anthropic-ai/claude-code</code></> },
      { number: 3, content: <>Run: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">claude-code auth</code> to authenticate</> },
    ],
    primaryAction: "View Documentation",
    primaryUrl: "https://docs.anthropic.com",
  },
  supabase: {
    name: "Supabase",
    description: "Use Supabase to manage user authentication, database, and file storage",
    steps: [
      { number: 1, content: <>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline">Supabase</a> to create an account or login</> },
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
      { number: 1, content: <>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline">vercel.com</a> and sign in</> },
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
      <div className="flex items-center gap-2 py-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100">
          <Check className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-sm text-emerald-600 font-medium">
          {config.name} is ready
        </span>
        <Badge variant="success" className="ml-auto h-5 text-xs">
          Ready
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-sm text-stone-600">{config.description}</p>

      {/* Guided Steps */}
      <div className="space-y-3">
        {config.steps.map((step) => (
          <div key={step.number} className="flex items-start gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F97316] text-white text-xs font-semibold shrink-0">
              {step.number}
            </div>
            <div className="text-sm text-stone-600 pt-0.5">{step.content}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="text-sm"
          onClick={onMarkComplete}
        >
          Show Me How
          <ExternalLink className="h-3 w-3 ml-1.5" />
        </Button>
        
        {config.showConnectButton ? (
          <Button
            size="sm"
            className="text-sm bg-[#F97316] hover:bg-[#EA580C]"
            onClick={onConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                {config.primaryAction}
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            className="text-sm bg-[#F97316] hover:bg-[#EA580C]"
            onClick={() => config.primaryUrl && window.open(config.primaryUrl, "_blank")}
          >
            {config.primaryAction}
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

