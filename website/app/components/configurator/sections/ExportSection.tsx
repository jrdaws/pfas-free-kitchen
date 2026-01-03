"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Download, 
  Github, 
  Check, 
  Copy, 
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportSectionProps {
  projectName: string;
  template: string;
  featureCount: number;
  isReady: boolean;
  onExport: (method: "npx" | "zip" | "github") => void;
}

export function ExportSection({
  projectName,
  template,
  featureCount,
  isReady,
  onExport,
}: ExportSectionProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  // Generate a mock NPX command
  const npxCommand = `npx @jrdaws/framework clone ${projectName?.toLowerCase().replace(/\s+/g, "-") || "my-project"}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(npxCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (method: "npx" | "zip" | "github") => {
    setExporting(method);
    try {
      await onExport(method);
    } finally {
      setExporting(null);
    }
  };

  if (!isReady) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-400">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs font-medium">Not ready</span>
        </div>
        <p className="text-[10px] text-white/40">
          Complete steps above first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Ready indicator */}
      <div className="flex items-center gap-1.5 text-emerald-400">
        <Sparkles className="h-3 w-3" />
        <span className="text-xs font-medium">Ready!</span>
      </div>

      {/* Project summary */}
      <div className="text-[10px] text-white/50 flex gap-2">
        <span>{template || "SaaS"}</span>
        <span>•</span>
        <span>{featureCount} features</span>
      </div>

      {/* NPX Command - Compact */}
      <div className="bg-black/30 rounded p-2 border border-white/10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-white/40">Quick Start</span>
          <button
            onClick={handleCopy}
            className="text-[10px] text-white/40 hover:text-white flex items-center gap-0.5"
          >
            {copied ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
          </button>
        </div>
        <code className="text-[10px] font-mono text-[var(--primary)] break-all leading-tight block">
          {npxCommand}
        </code>
      </div>

      {/* Export options - Compact */}
      <div className="space-y-1">
        <Button
          size="sm"
          className="w-full h-6 text-[10px] justify-start gap-1.5 bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white"
          onClick={() => handleExport("npx")}
          disabled={!!exporting}
        >
          {exporting === "npx" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Terminal className="h-3 w-3" />}
          Use NPX
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full h-6 text-[10px] justify-start gap-1.5 border-white/20 text-white/70 hover:bg-white/10"
          onClick={() => handleExport("zip")}
          disabled={!!exporting}
        >
          {exporting === "zip" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
          ZIP
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="w-full h-6 text-[10px] justify-start gap-1.5 border-white/20 text-white/70 hover:bg-white/10"
          onClick={() => handleExport("github")}
          disabled={!!exporting}
        >
          {exporting === "github" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Github className="h-3 w-3" />}
          GitHub
        </Button>
      </div>
    </div>
  );
}

