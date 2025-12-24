"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [selectedOption, setSelectedOption] = useState<"cli" | "zip" | "wizard" | "pull" | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectToken, setProjectToken] = useState<string | null>(null);
  const [showPostDownloadModal, setShowPostDownloadModal] = useState(false);

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
      // Show post-download modal after successful download
      setShowPostDownloadModal(true);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate ZIP. Please try the CLI command instead.");
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleCopyFullTemplateCommand = () => {
    const fullCommand = `npx @jrdaws/framework export ${template} ./${projectName}`;
    navigator.clipboard.writeText(fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToPlatform = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template,
          project_name: projectName,
          output_dir: outputDir,
          integrations,
          env_keys: envKeys,
          vision,
          mission,
          success_criteria: successCriteria,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save project");
      }

      const data = await response.json();
      setProjectToken(data.token);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Save failed:", error);
      alert(`Failed to save to platform: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const integrationCount = Object.values(integrations).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Export Your Project
        </h2>
        <p className="text-muted-foreground">
          Choose how you want to export your configured project
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Configuration Summary */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Check className="h-4 w-4" />
              Configuration Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Template</p>
                <p className="text-foreground font-mono">{selectedTemplate?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Project Name</p>
                <p className="text-foreground font-mono">{projectName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Output Directory</p>
                <p className="text-foreground font-mono">{outputDir}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Integrations</p>
                <p className="text-primary font-mono">{integrationCount} selected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* Option A: CLI Command - FULL TEMPLATE */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "cli" ? "border-primary shadow-lg shadow-primary/20" : ""
            }`}
            onClick={() => setSelectedOption(selectedOption === "cli" ? null : "cli")}
          >
            <CardHeader className="pb-2">
              <Badge variant="success" className="w-fit">Recommended</Badge>
            </CardHeader>
            <CardContent className="text-center py-4">
              <Terminal className="h-12 w-12 mx-auto mb-3 text-primary" />
              <h3 className="font-display font-bold text-foreground mb-2">
                Full Template
              </h3>
              <p className="text-xs text-muted-foreground">
                All components, pages & integrations
              </p>
              <p className="text-xs text-primary mt-2 font-mono">
                ✓ Production-ready
              </p>
            </CardContent>
          </Card>

          {/* Option B: Download ZIP - FULL TEMPLATE */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "zip" ? "border-primary shadow-lg shadow-primary/20" : ""
            }`}
            onClick={() => setSelectedOption(selectedOption === "zip" ? null : "zip")}
          >
            <CardHeader className="pb-2">
              <Badge className="w-fit">Quick Start</Badge>
            </CardHeader>
            <CardContent className="text-center py-4">
              <Download className="h-12 w-12 mx-auto mb-3 text-primary" />
              <h3 className="font-display font-bold text-foreground mb-2">
                Download ZIP
              </h3>
              <p className="text-xs text-muted-foreground">
                Template + integrations bundled
              </p>
              <p className="text-xs text-primary mt-2 font-mono">
                ✓ Ready to customize
              </p>
            </CardContent>
          </Card>

          {/* Option C: Pull from Platform */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "pull" ? "border-primary shadow-lg shadow-primary/20" : ""
            }`}
            onClick={() => {
              if (selectedOption === "pull") {
                setSelectedOption(null);
              } else {
                setSelectedOption("pull");
                if (!projectToken) {
                  handleSaveToPlatform();
                }
              }
            }}
          >
            <CardHeader className="pb-2">
              <Badge className="w-fit">Option C</Badge>
            </CardHeader>
            <CardContent className="text-center py-4">
              <ExternalLink className="h-12 w-12 mx-auto mb-3 text-primary" />
              <h3 className="font-display font-bold text-foreground mb-2">
                Pull from Platform
              </h3>
              <p className="text-xs text-muted-foreground">
                Save and pull later with a token
              </p>
              <p className="text-xs text-primary mt-2 font-mono">
                {projectToken ? "Saved!" : "Cloud sync"}
              </p>
            </CardContent>
          </Card>

          {/* Option D: Install Wizard */}
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedOption === "wizard" ? "border-primary shadow-lg shadow-primary/20" : ""
            }`}
            onClick={() => setSelectedOption(selectedOption === "wizard" ? null : "wizard")}
          >
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit">Coming Soon</Badge>
            </CardHeader>
            <CardContent className="text-center py-4">
              <Wand2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-display font-bold text-foreground mb-2">
                Install Wizard
              </h3>
              <p className="text-xs text-muted-foreground">
                Guided setup with system detection
              </p>
              <p className="text-xs text-muted-foreground mt-2 font-mono">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CLI Command Details */}
        {selectedOption === "cli" && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Terminal className="h-4 w-4" />
                CLI Command
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="text-xs text-foreground bg-muted p-4 rounded border border-border overflow-x-auto font-mono">
                  <code>{command}</code>
                </pre>
              </div>

              <Button
                onClick={handleCopy}
                className="w-full font-mono"
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

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">Next steps:</p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">1.</span>
                    <span>Open your terminal</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">2.</span>
                    <span>Paste and run the command</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">3.</span>
                    <span>Navigate to the project directory</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">4.</span>
                    <span>Run <code className="text-primary">npm install</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">5.</span>
                    <span>Add environment variables to .env.local</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ZIP Download Details */}
        {selectedOption === "zip" && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Download className="h-4 w-4" />
                Download Project ZIP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* What's included */}
              <div className="bg-primary/10 rounded border border-primary/30 p-4">
                <p className="text-sm text-primary font-bold mb-3">
                  ✓ Full template with your configuration
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-foreground font-bold mb-2">Template Files:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• All page routes & layouts</li>
                      <li>• Pre-built UI components</li>
                      <li>• Styling & configuration</li>
                      <li>• .dd/ context files</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-foreground font-bold mb-2">Integrations:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Selected integration code</li>
                      <li>• API routes & handlers</li>
                      <li>• .env.local.example</li>
                      <li>• Dependencies configured</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="w-full font-mono"
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

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-2">After downloading:</p>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">1.</span>
                    <span>Extract the ZIP file</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">2.</span>
                    <span>Run <code className="text-primary">npm install</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">3.</span>
                    <span>Copy .env.local.example to .env.local and add your API keys</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-mono font-bold flex-shrink-0">4.</span>
                    <span>Run <code className="text-primary">npm run dev</code> to start</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pull from Platform Details */}
        {selectedOption === "pull" && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <ExternalLink className="h-4 w-4" />
                Pull from Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSaving && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-foreground">Saving to platform...</span>
                </div>
              )}

              {projectToken && !isSaving && (
                <>
                  <div>
                    <p className="text-sm text-foreground mb-4">
                      ✅ Project saved to platform! Use this command to pull it later:
                    </p>
                    <div className="relative">
                      <pre className="text-xs text-foreground bg-muted p-4 rounded border border-border overflow-x-auto font-mono">
                        <code>npx @jrdaws/framework pull {projectToken}</code>
                      </pre>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`npx @jrdaws/framework pull ${projectToken}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full font-mono"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Pull Command
                      </>
                    )}
                  </Button>

                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground mb-2">How it works:</p>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="text-primary font-mono font-bold flex-shrink-0">1.</span>
                        <span>Your configuration is saved to the platform with token: <code className="text-primary">{projectToken}</code></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-mono font-bold flex-shrink-0">2.</span>
                        <span>Run the pull command from anywhere to download the configured project</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-mono font-bold flex-shrink-0">3.</span>
                        <span>All integrations, env variables, and context will be included</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-primary font-mono font-bold flex-shrink-0">4.</span>
                        <span>Project expires after 30 days for security</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-primary/10 border border-primary/30 rounded p-4">
                    <p className="text-xs text-foreground">
                      💡 <strong>Tip:</strong> Share this token with your team to collaborate, or use it on a different machine to continue working on the project.
                    </p>
                  </div>
                </>
              )}

              {!projectToken && !isSaving && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Something went wrong. Please try again.</p>
                  <Button
                    onClick={handleSaveToPlatform}
                    className="font-mono"
                  >
                    Retry Save
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Install Wizard Details */}
        {selectedOption === "wizard" && (
          <Card className="border-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                <Wand2 className="h-4 w-4" />
                One-Click Install Wizard (Coming Soon)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center py-8">
              <Wand2 className="h-16 w-16 mx-auto text-amber-500 opacity-50" />
              <p className="text-foreground">
                Install Wizard will be available in Phase 5
              </p>
              <div className="text-xs text-muted-foreground text-left max-w-md mx-auto space-y-2">
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
              <p className="text-xs text-muted-foreground mt-4">
                For now, please use Option A (CLI Command) or Option B (Download ZIP)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables Warning */}
        {requiredEnvVars.length > 0 && selectedOption && (
          <Card className="border-amber-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
                <AlertCircle className="h-4 w-4" />
                Required Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Don&apos;t forget to add these environment variables to your .env.local file:
              </p>
              <div className="bg-muted p-4 rounded border border-amber-500/20">
                <pre className="text-xs font-mono text-foreground">
                  {requiredEnvVars.map((varName) => (
                    <div key={varName} className="mb-1">
                      {varName}={envKeys?.[varName] || "your_value_here"}
                    </div>
                  ))}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Refer to the Environment Variables step or each integration&apos;s documentation for obtaining these values.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Post-Download Modal */}
      {showPostDownloadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="border-primary max-w-lg w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Check className="h-4 w-4" />
                Download Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <Check className="h-12 w-12 mx-auto mb-3 text-primary" />
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  Project Downloaded!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your {selectedTemplate?.name} template is ready
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded p-4">
                <p className="text-sm text-foreground mb-3">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Extract the ZIP and open in your IDE</li>
                  <li>2. Run <code className="text-primary">npm install</code></li>
                  <li>3. Copy <code className="text-primary">.env.local.example</code> to <code className="text-primary">.env.local</code></li>
                  <li>4. Run <code className="text-primary">npm run dev</code></li>
                </ol>
              </div>

              <Button
                onClick={() => setShowPostDownloadModal(false)}
                className="w-full"
              >
                Got it!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
