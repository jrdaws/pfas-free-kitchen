"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, FileCode, Key } from "lucide-react";

interface ProjectSetupSectionProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  outputDir: string;
  onOutputDirChange: (dir: string) => void;
  envKeys?: Record<string, string>;
  onEnvKeyChange?: (key: string, value: string) => void;
}

export function ProjectSetupSection({
  projectName,
  onProjectNameChange,
  outputDir,
  onOutputDirChange,
  envKeys = {},
  onEnvKeyChange,
}: ProjectSetupSectionProps) {
  // Generate slug from project name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleProjectNameChange = (name: string) => {
    onProjectNameChange(name);
    // Auto-update output dir if it matches the previous slug pattern
    const slug = generateSlug(name);
    if (!outputDir || outputDir === generateSlug(projectName)) {
      onOutputDirChange(slug);
    }
  };

  return (
    <div className="space-y-2">
      {/* Project Name - Compact */}
      <div className="space-y-1">
        <Label className="text-[10px] text-white/60 flex items-center gap-1">
          <FileCode className="h-2.5 w-2.5" />
          Project Name
        </Label>
        <Input
          value={projectName}
          onChange={(e) => handleProjectNameChange(e.target.value)}
          placeholder="My Project"
          className="h-7 text-xs bg-black/30 border-white/15 text-white placeholder:text-white/30"
        />
      </div>

      {/* Output Directory - Compact */}
      <div className="space-y-1">
        <Label className="text-[10px] text-white/60 flex items-center gap-1">
          <Folder className="h-2.5 w-2.5" />
          Directory
        </Label>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/40 font-mono">~/</span>
          <Input
            value={outputDir}
            onChange={(e) => onOutputDirChange(e.target.value)}
            placeholder="my-project"
            className="h-7 text-xs bg-black/30 border-white/15 text-white placeholder:text-white/30 font-mono"
          />
        </div>
      </div>

      {/* Environment Keys Preview - Compact */}
      {Object.keys(envKeys).length > 0 && onEnvKeyChange && (
        <div className="text-[10px] text-white/50 bg-black/20 rounded p-1.5 border border-white/10">
          <Key className="h-2.5 w-2.5 inline mr-1" />
          {Object.keys(envKeys).length} env keys set
        </div>
      )}

      {projectName && outputDir && (
        <div className="text-[10px] text-emerald-400/70 bg-black/20 rounded p-1.5 font-mono truncate">
          ~/{outputDir}/
        </div>
      )}
    </div>
  );
}

