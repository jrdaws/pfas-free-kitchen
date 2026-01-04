"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Palette, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_SCHEMES, type ColorScheme } from "@/lib/configurator-state";

interface BrandingSectionProps {
  selectedScheme: string;
  onSchemeChange: (schemeId: string) => void;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  onCustomColorChange: (colorKey: keyof BrandingSectionProps['customColors'], value: string) => void;
}

export function BrandingSection({
  selectedScheme,
  onSchemeChange,
  customColors,
  onCustomColorChange,
}: BrandingSectionProps) {
  const [showCustom, setShowCustom] = useState(selectedScheme === 'custom');
  const selectedSchemeData = COLOR_SCHEMES.find(s => s.id === selectedScheme);

  const handleSchemeSelect = (schemeId: string) => {
    onSchemeChange(schemeId);
    setShowCustom(schemeId === 'custom');
  };

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] text-white/50">
        Colors for your generated project
      </p>

      {/* Color Scheme Dropdown */}
      <div className="space-y-1.5">
        {COLOR_SCHEMES.filter(s => s.id !== 'custom').map((scheme) => {
          const isSelected = selectedScheme === scheme.id;
          
          return (
            <button
              key={scheme.id}
              onClick={() => handleSchemeSelect(scheme.id)}
              className={cn(
                "w-full text-left p-2 rounded-md border transition-all",
                isSelected
                  ? "bg-[var(--primary)]/15 border-[var(--primary)]/40"
                  : "bg-black/20 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-2">
                {/* Color swatches */}
                <div className="flex gap-0.5">
                  <div 
                    className="w-4 h-4 rounded-l-sm" 
                    style={{ backgroundColor: scheme.primary }}
                  />
                  <div 
                    className="w-4 h-4" 
                    style={{ backgroundColor: scheme.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-r-sm" 
                    style={{ backgroundColor: scheme.accent }}
                  />
                </div>
                <span className={cn(
                  "font-medium text-xs flex-1 truncate",
                  isSelected ? "text-[var(--primary)]" : "text-white/90"
                )}>
                  {scheme.name}
                </span>
                {isSelected && (
                  <Check className="h-3 w-3 text-[var(--primary)] shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Colors Toggle */}
      <button
        onClick={() => {
          setShowCustom(!showCustom);
          if (!showCustom) {
            handleSchemeSelect('custom');
          }
        }}
        className={cn(
          "w-full flex items-center justify-between p-2 rounded-md border transition-all",
          selectedScheme === 'custom'
            ? "bg-[var(--primary)]/15 border-[var(--primary)]/40"
            : "bg-black/20 border-white/10 hover:border-white/20"
        )}
      >
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-white/60" />
          <span className={cn(
            "font-medium text-xs",
            selectedScheme === 'custom' ? "text-[var(--primary)]" : "text-white/90"
          )}>
            Custom Colors
          </span>
        </div>
        <ChevronDown className={cn(
          "h-3 w-3 text-white/40 transition-transform",
          showCustom && "rotate-180"
        )} />
      </button>

      {/* Custom Color Inputs */}
      {showCustom && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200 bg-black/20 rounded-lg p-2 border border-white/10">
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'accent', label: 'Accent' },
            { key: 'background', label: 'Background' },
            { key: 'foreground', label: 'Text' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Label className="text-[10px] text-white/60 w-16 shrink-0">
                {label}
              </Label>
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="color"
                  value={customColors[key as keyof typeof customColors]}
                  onChange={(e) => onCustomColorChange(key as keyof typeof customColors, e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <Input
                  value={customColors[key as keyof typeof customColors]}
                  onChange={(e) => onCustomColorChange(key as keyof typeof customColors, e.target.value)}
                  placeholder="#000000"
                  className="h-6 text-[10px] font-mono bg-black/30 border-white/15 text-white placeholder:text-white/30 uppercase"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {selectedSchemeData && (
        <div className="mt-2 p-2 rounded-lg border border-white/10" style={{ backgroundColor: customColors.background }}>
          <p className="text-[10px] mb-1" style={{ color: customColors.foreground }}>Preview:</p>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              className="h-5 text-[9px] px-2"
              style={{ backgroundColor: customColors.primary, color: '#fff' }}
            >
              Primary
            </Button>
            <Button 
              size="sm" 
              className="h-5 text-[9px] px-2"
              style={{ backgroundColor: customColors.accent, color: customColors.foreground }}
            >
              Accent
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

