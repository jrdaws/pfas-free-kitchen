"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useConfiguratorStore } from "@/lib/configurator-state";
import {
  buildCommand,
  buildCommandSingleLine,
  getRequiredEnvVars,
} from "@/lib/command-builder";
import { Copy, Check, Terminal, FileCode, Key, ChevronDown, ChevronUp } from "lucide-react";

interface NPXCommandDisplayProps {
  className?: string;
  showEnvVars?: boolean;
  showFileTree?: boolean;
}

export function NPXCommandDisplay({
  className,
  showEnvVars = true,
  showFileTree = false,
}: NPXCommandDisplayProps) {
  const { template, projectName, outputDir, integrations, selectedFeatures } =
    useConfiguratorStore();

  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [showFullCommand, setShowFullCommand] = useState(false);

  // Build the command
  const config = useMemo(
    () => ({
      template,
      projectName: projectName || "my-app",
      outputDir: outputDir || "./my-app",
      integrations,
    }),
    [template, projectName, outputDir, integrations]
  );

  const multiLineCommand = useMemo(() => buildCommand(config), [config]);
  const singleLineCommand = useMemo(() => buildCommandSingleLine(config), [config]);
  const envVars = useMemo(() => getRequiredEnvVars(integrations), [integrations]);

  // Generate NPX command (public package command)
  const npxCommand = useMemo(() => {
    const parts = [`npx @jrdaws/framework export ${template} ${outputDir || "./my-app"}`];
    
    Object.entries(integrations)
      .filter(([_, value]) => value)
      .forEach(([key, value]) => {
        parts[0] += ` --${key} ${value}`;
      });

    return parts[0];
  }, [template, outputDir, integrations]);

  // Generate .env.local template
  const envTemplate = useMemo(() => {
    if (envVars.length === 0) return "";
    return envVars.map((v) => `${v}=`).join("\n");
  }, [envVars]);

  // Copy handlers
  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(npxCommand);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = npxCommand;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedCommand(true);
      setTimeout(() => setCopiedCommand(false), 2000);
    }
  };

  const copyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envTemplate);
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = envTemplate;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  // Count selected features
  const featureCount = useMemo(() => {
    return Object.values(selectedFeatures).flat().length;
  }, [selectedFeatures]);

  // Count integrations
  const integrationCount = useMemo(() => {
    return Object.values(integrations).filter(Boolean).length;
  }, [integrations]);

  return (
    <Card className={cn("border-slate-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#0052FF]" />
            Your NPX Command
          </CardTitle>
          <div className="flex items-center gap-2">
            {integrationCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {integrationCount} integration{integrationCount !== 1 ? "s" : ""}
              </Badge>
            )}
            {featureCount > 0 && (
              <Badge className="bg-[#0052FF] text-white text-xs">
                {featureCount} feature{featureCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Run this command to scaffold your project locally
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Command Display */}
        <div className="relative">
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-emerald-400 whitespace-pre-wrap break-all">
              {showFullCommand ? multiLineCommand : npxCommand}
            </pre>
          </div>

          {/* Copy Button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={copyCommand}
            className="absolute top-2 right-2 h-8"
          >
            {copiedCommand ? (
              <>
                <Check className="h-4 w-4 mr-1 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>

          {/* Toggle full/compact */}
          {Object.keys(integrations).filter((k) => integrations[k]).length > 2 && (
            <button
              onClick={() => setShowFullCommand(!showFullCommand)}
              className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-700"
            >
              {showFullCommand ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show compact
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show expanded
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Steps */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="font-medium text-slate-800 text-sm mb-3">Quick Start</h4>
          <ol className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0052FF] text-white text-xs flex items-center justify-center font-medium">
                1
              </span>
              <span className="text-slate-600">
                Copy and run the command above in your terminal
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0052FF] text-white text-xs flex items-center justify-center font-medium">
                2
              </span>
              <span className="text-slate-600">
                Navigate to <code className="text-[#0052FF] bg-slate-100 px-1 rounded">{outputDir || "./my-app"}</code>
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0052FF] text-white text-xs flex items-center justify-center font-medium">
                3
              </span>
              <span className="text-slate-600">
                Run <code className="text-[#0052FF] bg-slate-100 px-1 rounded">npm install</code> then{" "}
                <code className="text-[#0052FF] bg-slate-100 px-1 rounded">npm run dev</code>
              </span>
            </li>
          </ol>
        </div>

        {/* Environment Variables */}
        {showEnvVars && envVars.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium text-slate-800 text-sm">
                  Required Environment Variables
                </h4>
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                  {envVars.length} required
                </Badge>
              </div>
              <Button size="sm" variant="outline" onClick={copyEnv} className="h-7 text-xs">
                {copiedEnv ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy .env template
                  </>
                )}
              </Button>
            </div>

            <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-slate-300">
                {envVars.map((v, i) => (
                  <div key={v} className="flex">
                    <span className="text-slate-500 select-none mr-2">{i + 1}</span>
                    <span className="text-amber-400">{v}</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-slate-600">your_value_here</span>
                  </div>
                ))}
              </pre>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Create a <code className="text-[#0052FF]">.env.local</code> file in your project
              root and add these variables.
            </p>
          </div>
        )}

        {/* What's Included Summary */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-medium text-slate-800 text-sm mb-3 flex items-center gap-2">
            <FileCode className="h-4 w-4 text-[#0052FF]" />
            What&apos;s Included
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Check className="h-3 w-3 text-emerald-500" />
              {template.charAt(0).toUpperCase() + template.slice(1)} template
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Check className="h-3 w-3 text-emerald-500" />
              Next.js 15 + React 19
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Check className="h-3 w-3 text-emerald-500" />
              TypeScript configured
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Check className="h-3 w-3 text-emerald-500" />
              Tailwind CSS styling
            </div>
            {integrationCount > 0 && (
              <div className="flex items-center gap-2 text-slate-600">
                <Check className="h-3 w-3 text-emerald-500" />
                {integrationCount} integration{integrationCount !== 1 ? "s" : ""} ready
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600">
              <Check className="h-3 w-3 text-emerald-500" />
              .dd/ context files
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NPXCommandDisplay;

