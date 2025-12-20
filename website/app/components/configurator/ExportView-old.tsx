"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, AlertCircle } from "lucide-react";
import { buildCommand, buildCommandSingleLine, getRequiredEnvVars } from "@/lib/command-builder";
import { TEMPLATES } from "@/lib/templates";

interface ExportViewProps {
  template: string;
  projectName: string;
  outputDir: string;
  integrations: Record<string, string>;
}

export function ExportView({
  template,
  projectName,
  outputDir,
  integrations,
}: ExportViewProps) {
  const [copied, setCopied] = useState(false);

  const command = buildCommand({ template, projectName, outputDir, integrations });
  const singleLineCommand = buildCommandSingleLine({ template, projectName, outputDir, integrations });
  const requiredEnvVars = getRequiredEnvVars(integrations);
  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  const handleCopy = () => {
    navigator.clipboard.writeText(singleLineCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const integrationCount = Object.values(integrations).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          Export Your Project
        </h2>
        <p className="text-terminal-dim">
          Copy the CLI command to create your project
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Configuration Summary */}
        <div className="terminal-window border-terminal-accent/30">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-accent ml-2">Configuration Summary</span>
          </div>
          <div className="terminal-content space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-terminal-dim mb-1">Template</p>
                <p className="text-terminal-text font-mono">{selectedTemplate?.name}</p>
              </div>
              <div>
                <p className="text-xs text-terminal-dim mb-1">Project Name</p>
                <p className="text-terminal-text font-mono">{projectName}</p>
              </div>
              <div>
                <p className="text-xs text-terminal-dim mb-1">Output Directory</p>
                <p className="text-terminal-text font-mono">{outputDir}</p>
              </div>
              <div>
                <p className="text-xs text-terminal-dim mb-1">Integrations</p>
                <p className="text-terminal-accent font-mono">{integrationCount} selected</p>
              </div>
            </div>

            {integrationCount > 0 && (
              <div className="pt-4 border-t border-terminal-text/20">
                <p className="text-xs text-terminal-dim mb-2">Selected Integrations:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(integrations)
                    .filter(([_, provider]) => provider)
                    .map(([type, provider]) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-terminal-accent/10 border border-terminal-accent/30 text-xs font-mono"
                      >
                        <span className="text-terminal-dim">{type}:</span>
                        <span className="text-terminal-accent">{provider}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CLI Command */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <Terminal className="inline h-3 w-3 mr-1" />
              CLI Command
            </span>
          </div>
          <div className="terminal-content space-y-4">
            <div className="relative">
              <pre className="text-xs text-terminal-text bg-terminal-bg/50 p-4 rounded border border-terminal-text/20 overflow-x-auto font-mono">
                <code>{command}</code>
              </pre>
            </div>

            <Button
              onClick={handleCopy}
              className="w-full bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg font-mono"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Command
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">Next Steps</span>
          </div>
          <div className="terminal-content">
            <ol className="space-y-3 text-sm text-terminal-dim">
              <li className="flex gap-3">
                <span className="text-terminal-accent font-mono font-bold flex-shrink-0">1.</span>
                <span>Copy the command above</span>
              </li>
              <li className="flex gap-3">
                <span className="text-terminal-accent font-mono font-bold flex-shrink-0">2.</span>
                <span>Open your terminal</span>
              </li>
              <li className="flex gap-3">
                <span className="text-terminal-accent font-mono font-bold flex-shrink-0">3.</span>
                <span>Paste and run the command</span>
              </li>
              <li className="flex gap-3">
                <span className="text-terminal-accent font-mono font-bold flex-shrink-0">4.</span>
                <span>Follow the setup instructions in the generated project</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Environment Variables */}
        {requiredEnvVars.length > 0 && (
          <div className="terminal-window border-terminal-warning/50">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-warning ml-2">
                <AlertCircle className="inline h-3 w-3 mr-1" />
                Required Environment Variables
              </span>
            </div>
            <div className="terminal-content space-y-3">
              <p className="text-sm text-terminal-dim">
                Your project will need these environment variables. Create a{" "}
                <code className="text-terminal-accent">.env.local</code> file with:
              </p>

              <div className="bg-terminal-bg/50 p-4 rounded border border-terminal-warning/20">
                <pre className="text-xs font-mono text-terminal-text">
                  {requiredEnvVars.map((varName) => (
                    <div key={varName} className="mb-1">
                      {varName}=<span className="text-terminal-dim">your_value_here</span>
                    </div>
                  ))}
                </pre>
              </div>

              <p className="text-xs text-terminal-dim">
                Refer to each integration's documentation for obtaining these values.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
