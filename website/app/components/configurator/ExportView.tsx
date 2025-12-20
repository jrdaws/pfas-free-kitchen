"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, Download, Wand2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { buildCommand, buildCommandSingleLine, getRequiredEnvVars } from "@/lib/command-builder";
import { TEMPLATES } from "@/lib/templates";
import { generateProjectZip } from "@/lib/zip-generator";

interface ExportViewProps {
  template: string;
  projectName: string;
  outputDir: string;
  integrations: Record<string, string>;
  vision?: string;
  mission?: string;
  successCriteria?: string;
  envKeys?: Record<string, string>;
}

export function ExportView({
  template,
  projectName,
  outputDir,
  integrations,
  vision,
  mission,
  successCriteria,
  envKeys,
}: ExportViewProps) {
  const [copied, setCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"cli" | "zip" | "wizard" | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);

  const command = buildCommand({ template, projectName, outputDir, integrations });
  const singleLineCommand = buildCommandSingleLine({ template, projectName, outputDir, integrations });
  const requiredEnvVars = getRequiredEnvVars(integrations);
  const selectedTemplate = TEMPLATES[template as keyof typeof TEMPLATES];

  const handleCopy = () => {
    navigator.clipboard.writeText(singleLineCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await generateProjectZip({
        template,
        projectName,
        integrations,
        vision,
        mission,
        successCriteria,
        envKeys,
      });
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate ZIP. Please try the CLI command instead.");
    } finally {
      setIsDownloading(false);
    }
  };

  const integrationCount = Object.values(integrations).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          Export Your Project
        </h2>
        <p className="text-terminal-dim">
          Choose how you want to export your configured project
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
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
          </div>
        </div>

        {/* Export Options */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Option A: CLI Command */}
          <button
            onClick={() => setSelectedOption(selectedOption === "cli" ? null : "cli")}
            className={`terminal-window cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "cli" ? "border-terminal-accent shadow-lg shadow-terminal-accent/20" : ""
            }`}
          >
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-dim ml-2">
                <Terminal className="inline h-3 w-3 mr-1" />
                Option A
              </span>
            </div>
            <div className="terminal-content text-center py-6">
              <Terminal className="h-12 w-12 mx-auto mb-3 text-terminal-accent" />
              <h3 className="font-display font-bold text-terminal-text mb-2">
                CLI Command
              </h3>
              <p className="text-xs text-terminal-dim">
                Copy command and run in your terminal
              </p>
              <p className="text-xs text-terminal-accent mt-2 font-mono">
                Fastest method
              </p>
            </div>
          </button>

          {/* Option B: Download ZIP */}
          <button
            onClick={() => setSelectedOption(selectedOption === "zip" ? null : "zip")}
            className={`terminal-window cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "zip" ? "border-terminal-accent shadow-lg shadow-terminal-accent/20" : ""
            }`}
          >
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-dim ml-2">
                <Download className="inline h-3 w-3 mr-1" />
                Option B
              </span>
            </div>
            <div className="terminal-content text-center py-6">
              <Download className="h-12 w-12 mx-auto mb-3 text-terminal-accent" />
              <h3 className="font-display font-bold text-terminal-text mb-2">
                Download ZIP
              </h3>
              <p className="text-xs text-terminal-dim">
                Get complete project as ZIP file
              </p>
              <p className="text-xs text-terminal-accent mt-2 font-mono">
                Includes .dd/ files
              </p>
            </div>
          </button>

          {/* Option C: Install Wizard */}
          <button
            onClick={() => setSelectedOption(selectedOption === "wizard" ? null : "wizard")}
            className={`terminal-window cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "wizard" ? "border-terminal-accent shadow-lg shadow-terminal-accent/20" : ""
            }`}
          >
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-dim ml-2">
                <Wand2 className="inline h-3 w-3 mr-1" />
                Option C
              </span>
            </div>
            <div className="terminal-content text-center py-6">
              <Wand2 className="h-12 w-12 mx-auto mb-3 text-terminal-accent" />
              <h3 className="font-display font-bold text-terminal-text mb-2">
                Install Wizard
              </h3>
              <p className="text-xs text-terminal-dim">
                Guided setup with system detection
              </p>
              <p className="text-xs text-terminal-accent mt-2 font-mono">
                Opens in Cursor
              </p>
            </div>
          </button>
        </div>

        {/* CLI Command Details */}
        {selectedOption === "cli" && (
          <div className="terminal-window border-terminal-accent">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-accent ml-2">
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

              <div className="border-t border-terminal-accent/20 pt-4">
                <p className="text-sm text-terminal-dim mb-2">Next steps:</p>
                <ol className="space-y-2 text-sm text-terminal-dim">
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">1.</span>
                    <span>Open your terminal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">2.</span>
                    <span>Paste and run the command</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">3.</span>
                    <span>Navigate to the project directory</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">4.</span>
                    <span>Run <code className="text-terminal-accent">npm install</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">5.</span>
                    <span>Add environment variables to .env.local</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ZIP Download Details */}
        {selectedOption === "zip" && (
          <div className="terminal-window border-terminal-accent">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-accent ml-2">
                <Download className="inline h-3 w-3 mr-1" />
                Download ZIP
              </span>
            </div>
            <div className="terminal-content space-y-4">
              <div>
                <p className="text-sm text-terminal-text mb-4">
                  Your ZIP file will include:
                </p>
                <ul className="space-y-1 text-xs text-terminal-dim list-disc list-inside">
                  <li>Next.js project starter structure</li>
                  <li>package.json with {integrationCount > 0 ? `${integrationCount} integration` : "core"} dependencies</li>
                  <li>.dd/ directory with vision, mission, goals (if provided)</li>
                  <li>.env.local.example with all required variables</li>
                  <li>README with setup instructions</li>
                  <li>Tailwind CSS + TypeScript pre-configured</li>
                </ul>
                <p className="text-xs text-terminal-warning mt-3">
                  💡 For full templates with pre-built components, use the CLI command (Option A)
                </p>
              </div>

              <Button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="w-full bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg font-mono"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating ZIP...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Project ZIP
                  </>
                )}
              </Button>

              <div className="border-t border-terminal-accent/20 pt-4">
                <p className="text-sm text-terminal-dim mb-2">After downloading:</p>
                <ol className="space-y-2 text-sm text-terminal-dim">
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">1.</span>
                    <span>Extract the ZIP file</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">2.</span>
                    <span>Open in your code editor</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">3.</span>
                    <span>Run <code className="text-terminal-accent">npm install</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">4.</span>
                    <span>Copy .env.local.example to .env.local and add your keys</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-terminal-accent font-mono font-bold flex-shrink-0">5.</span>
                    <span>Run <code className="text-terminal-accent">npm run dev</code></span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Install Wizard Details */}
        {selectedOption === "wizard" && (
          <div className="terminal-window border-terminal-warning">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-warning ml-2">
                <Wand2 className="inline h-3 w-3 mr-1" />
                One-Click Install Wizard (Coming Soon)
              </span>
            </div>
            <div className="terminal-content space-y-4 text-center py-8">
              <Wand2 className="h-16 w-16 mx-auto text-terminal-warning opacity-50" />
              <p className="text-terminal-text">
                Install Wizard will be available in Phase 5
              </p>
              <div className="text-xs text-terminal-dim text-left max-w-md mx-auto space-y-2">
                <p className="font-bold">Planned features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Detect if Node.js, npm, and Cursor are installed</li>
                  <li>Guide you through installation if missing</li>
                  <li>Choose installation directory with file picker</li>
                  <li>Generate and install project automatically</li>
                  <li>Open Cursor with project loaded</li>
                  <li>Show next steps for configuration</li>
                </ul>
              </div>
              <p className="text-xs text-terminal-dim mt-4">
                For now, please use Option A (CLI Command) or Option B (Download ZIP)
              </p>
            </div>
          </div>
        )}

        {/* Environment Variables Warning */}
        {requiredEnvVars.length > 0 && selectedOption && (
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
                Don't forget to add these environment variables to your .env.local file:
              </p>
              <div className="bg-terminal-bg/50 p-4 rounded border border-terminal-warning/20">
                <pre className="text-xs font-mono text-terminal-text">
                  {requiredEnvVars.map((varName) => (
                    <div key={varName} className="mb-1">
                      {varName}={envKeys?.[varName] || "your_value_here"}
                    </div>
                  ))}
                </pre>
              </div>
              <p className="text-xs text-terminal-dim">
                Refer to the Environment Variables step or each integration's documentation for obtaining these values.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
