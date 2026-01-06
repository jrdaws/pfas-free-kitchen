"use client";

import { useConfiguratorStore, type ComposerMode, type ComposerModeConfig } from "@/lib/configurator-state";
import { cn } from "@/lib/utils";
import { 
  Layers, 
  Sparkles, 
  Wand2, 
  Settings2,
  ChevronDown,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const MODES: {
  id: ComposerMode;
  label: string;
  icon: typeof Layers;
  description: string;
  features: string[];
}[] = [
  {
    id: "registry",
    label: "Pattern Library",
    icon: Layers,
    description: "Fast & consistent using pre-built patterns",
    features: [
      "Uses 40+ tested patterns",
      "Fastest generation (~2s)",
      "Most predictable output",
      "Best for standard layouts",
    ],
  },
  {
    id: "hybrid",
    label: "AI Hybrid",
    icon: Sparkles,
    description: "Creative composition with inspiration matching",
    features: [
      "Matches inspiration sites",
      "Creates custom sections",
      "Applies detected styles",
      "Best for unique designs",
    ],
  },
  {
    id: "auto",
    label: "Smart Auto",
    icon: Wand2,
    description: "Automatically picks the best approach",
    features: [
      "Starts with patterns",
      "Falls back to custom AI",
      "Balances speed & creativity",
      "Recommended for most users",
    ],
  },
];

export function ComposerModeToggle({ 
  className,
  compact = false,
}: { 
  className?: string;
  compact?: boolean;
}) {
  const { composerConfig, setComposerMode, setComposerConfig } = useConfiguratorStore();
  const [showSettings, setShowSettings] = useState(false);
  
  const currentMode = MODES.find((m) => m.id === composerConfig.mode) || MODES[2];
  const CurrentIcon = currentMode.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                "bg-gradient-to-r hover:shadow-md",
                composerConfig.mode === "registry" && "from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30",
                composerConfig.mode === "hybrid" && "from-purple-500/20 to-indigo-600/20 text-purple-400 border border-purple-500/30",
                composerConfig.mode === "auto" && "from-amber-500/20 to-orange-600/20 text-amber-400 border border-amber-500/30",
                className
              )}
            >
              <CurrentIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{currentMode.label}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0 bg-stone-900 border-stone-700" 
            align="end"
            sideOffset={8}
          >
            <ModeSelector 
              currentMode={composerConfig.mode} 
              onSelect={(mode) => {
                setComposerMode(mode);
                setShowSettings(false);
              }}
            />
            <div className="border-t border-stone-700">
              <AdvancedSettings 
                config={composerConfig}
                onUpdate={setComposerConfig}
              />
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Composition Mode</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[280px]">
                <p className="text-xs">
                  Choose how AI composes your preview. Pattern Library is fastest,
                  Hybrid is most creative, Auto balances both.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = composerConfig.mode === mode.id;
          
          return (
            <TooltipProvider key={mode.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setComposerMode(mode.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                      isActive
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-muted/30 border-transparent hover:border-muted-foreground/30 hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {mode.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium text-xs">{mode.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Advanced Settings Collapsible */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Settings2 className="h-3.5 w-3.5" />
            Advanced Settings
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-stone-900 border-stone-700" align="start">
          <AdvancedSettings 
            config={composerConfig}
            onUpdate={setComposerConfig}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ModeSelector({ 
  currentMode, 
  onSelect 
}: { 
  currentMode: ComposerMode;
  onSelect: (mode: ComposerMode) => void;
}) {
  return (
    <div className="p-2 space-y-1">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
              isActive
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-stone-800 border border-transparent"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 mt-0.5 flex-shrink-0",
              isActive ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {mode.label}
                </span>
                {isActive && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AdvancedSettings({
  config,
  onUpdate,
}: {
  config: ComposerModeConfig;
  onUpdate: (config: Partial<ComposerModeConfig>) => void;
}) {
  return (
    <div className="p-4 space-y-4">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        <Settings2 className="h-4 w-4" />
        Advanced Settings
      </h4>
      
      {/* Registry Mode Settings */}
      {(config.mode === "registry" || config.mode === "auto") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Strict Patterns Only</Label>
            <Switch
              checked={config.strictPatterns}
              onCheckedChange={(checked) => onUpdate({ strictPatterns: checked })}
              className="scale-90"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Max Patterns per Page</Label>
              <span className="text-xs font-medium">{config.maxPatterns}</span>
            </div>
            <Slider
              value={[config.maxPatterns]}
              onValueChange={([value]) => onUpdate({ maxPatterns: value })}
              min={3}
              max={15}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}
      
      {/* Hybrid Mode Settings */}
      {(config.mode === "hybrid" || config.mode === "auto") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Use Inspiration Structure</Label>
            <Switch
              checked={config.useInspirationStructure}
              onCheckedChange={(checked) => onUpdate({ useInspirationStructure: checked })}
              className="scale-90"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Enable Custom Sections</Label>
            <Switch
              checked={config.enableGapFiller}
              onCheckedChange={(checked) => onUpdate({ enableGapFiller: checked })}
              className="scale-90"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Style Inheritance</Label>
            <div className="grid grid-cols-3 gap-1">
              {(["full", "colors-only", "none"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => onUpdate({ styleInheritance: style })}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded transition-colors capitalize",
                    config.styleInheritance === style
                      ? "bg-primary text-primary-foreground"
                      : "bg-stone-800 text-muted-foreground hover:bg-stone-700"
                  )}
                >
                  {style === "colors-only" ? "Colors" : style}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Auto Mode Settings */}
      {config.mode === "auto" && (
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Prefer Pattern Library First</Label>
          <Switch
            checked={config.preferRegistry}
            onCheckedChange={(checked) => onUpdate({ preferRegistry: checked })}
            className="scale-90"
          />
        </div>
      )}
    </div>
  );
}

export default ComposerModeToggle;

