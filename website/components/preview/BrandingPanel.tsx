"use client";

import { useState } from "react";
import type { BrandingConfig, ColorScheme, FontScheme, SpacingScheme } from "@/lib/patterns/types";
import { DEFAULT_BRANDING } from "@/lib/patterns/types";

interface BrandingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  branding: BrandingConfig;
  onChange: (branding: BrandingConfig) => void;
}

// ============================================================================
// Presets
// ============================================================================

const PRESETS: Record<string, BrandingConfig> = {
  dark: {
    colors: {
      primary: "#F97316",
      secondary: "#3B82F6",
      accent: "#8B5CF6",
      background: "#0A0A0A",
      foreground: "#FFFFFF",
      muted: "#94A3B8",
      border: "#27272A",
      card: "#18181B",
      destructive: "#EF4444",
      success: "#22C55E",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono",
    },
    spacing: {
      containerMax: "1280px",
      sectionPadding: "py-24",
      componentGap: "gap-8",
    },
    borderRadius: "md",
    shadowStyle: "medium",
  },
  light: {
    colors: {
      primary: "#3B82F6",
      secondary: "#10B981",
      accent: "#8B5CF6",
      background: "#FFFFFF",
      foreground: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
      card: "#F8FAFC",
      destructive: "#EF4444",
      success: "#22C55E",
    },
    fonts: {
      heading: "Plus Jakarta Sans",
      body: "Inter",
      mono: "JetBrains Mono",
    },
    spacing: {
      containerMax: "1280px",
      sectionPadding: "py-24",
      componentGap: "gap-8",
    },
    borderRadius: "md",
    shadowStyle: "subtle",
  },
  vibrant: {
    colors: {
      primary: "#E94560",
      secondary: "#0F3460",
      accent: "#16C79A",
      background: "#1A1A2E",
      foreground: "#FFFFFF",
      muted: "#A0AEC0",
      border: "#2D3748",
      card: "#16213E",
      destructive: "#EF4444",
      success: "#16C79A",
    },
    fonts: {
      heading: "Space Grotesk",
      body: "DM Sans",
      mono: "JetBrains Mono",
    },
    spacing: {
      containerMax: "1280px",
      sectionPadding: "py-32",
      componentGap: "gap-10",
    },
    borderRadius: "lg",
    shadowStyle: "dramatic",
  },
  minimal: {
    colors: {
      primary: "#000000",
      secondary: "#404040",
      accent: "#666666",
      background: "#FAFAFA",
      foreground: "#171717",
      muted: "#737373",
      border: "#E5E5E5",
      card: "#FFFFFF",
      destructive: "#DC2626",
      success: "#16A34A",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono",
    },
    spacing: {
      containerMax: "1024px",
      sectionPadding: "py-20",
      componentGap: "gap-6",
    },
    borderRadius: "sm",
    shadowStyle: "none",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function BrandingPanel({
  isOpen,
  onClose,
  branding,
  onChange,
}: BrandingPanelProps) {
  const [activeTab, setActiveTab] = useState<"colors" | "fonts" | "spacing">("colors");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-white/10 z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Branding</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {(["colors", "fonts", "spacing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "text-orange-400 border-b-2 border-orange-400"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "colors" && (
            <ColorsTab branding={branding} onChange={onChange} />
          )}
          {activeTab === "fonts" && (
            <FontsTab branding={branding} onChange={onChange} />
          )}
          {activeTab === "spacing" && (
            <SpacingTab branding={branding} onChange={onChange} />
          )}
        </div>

        {/* Footer with presets */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Quick Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <PresetButton
              label="Dark"
              colors={[
                PRESETS.dark.colors.background,
                PRESETS.dark.colors.card,
                PRESETS.dark.colors.primary,
              ]}
              onClick={() => onChange(PRESETS.dark)}
            />
            <PresetButton
              label="Light"
              colors={[
                PRESETS.light.colors.background,
                PRESETS.light.colors.card,
                PRESETS.light.colors.primary,
              ]}
              onClick={() => onChange(PRESETS.light)}
            />
            <PresetButton
              label="Vibrant"
              colors={[
                PRESETS.vibrant.colors.background,
                PRESETS.vibrant.colors.card,
                PRESETS.vibrant.colors.primary,
              ]}
              onClick={() => onChange(PRESETS.vibrant)}
            />
            <PresetButton
              label="Minimal"
              colors={[
                PRESETS.minimal.colors.background,
                PRESETS.minimal.colors.card,
                PRESETS.minimal.colors.primary,
              ]}
              onClick={() => onChange(PRESETS.minimal)}
            />
          </div>
          <button
            onClick={() => onChange(DEFAULT_BRANDING)}
            className="w-full mt-2 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Colors Tab
// ============================================================================

function ColorsTab({
  branding,
  onChange,
}: {
  branding: BrandingConfig;
  onChange: (b: BrandingConfig) => void;
}) {
  const updateColor = (key: keyof ColorScheme, value: string) => {
    onChange({
      ...branding,
      colors: {
        ...branding.colors,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <ColorPicker
        label="Primary"
        value={branding.colors.primary}
        onChange={(v) => updateColor("primary", v)}
        description="Main brand color for buttons and accents"
      />
      <ColorPicker
        label="Secondary"
        value={branding.colors.secondary}
        onChange={(v) => updateColor("secondary", v)}
        description="Supporting color for secondary elements"
      />
      <ColorPicker
        label="Accent"
        value={branding.colors.accent}
        onChange={(v) => updateColor("accent", v)}
        description="Highlight color for important elements"
      />
      
      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
          Background & Text
        </p>
      </div>
      
      <ColorPicker
        label="Background"
        value={branding.colors.background}
        onChange={(v) => updateColor("background", v)}
        description="Page background color"
      />
      <ColorPicker
        label="Foreground"
        value={branding.colors.foreground}
        onChange={(v) => updateColor("foreground", v)}
        description="Primary text color"
      />
      <ColorPicker
        label="Muted"
        value={branding.colors.muted}
        onChange={(v) => updateColor("muted", v)}
        description="Secondary/muted text color"
      />
      
      <div className="border-t border-white/10 pt-4 mt-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
          UI Elements
        </p>
      </div>
      
      <ColorPicker
        label="Card"
        value={branding.colors.card}
        onChange={(v) => updateColor("card", v)}
        description="Card and surface backgrounds"
      />
      <ColorPicker
        label="Border"
        value={branding.colors.border}
        onChange={(v) => updateColor("border", v)}
        description="Border color for elements"
      />
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm text-white">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 px-2 py-1 bg-slate-800 border border-white/10 rounded text-xs text-white font-mono uppercase"
          />
        </div>
      </div>
      {description && <p className="text-xs text-white/40">{description}</p>}
    </div>
  );
}

// ============================================================================
// Fonts Tab
// ============================================================================

const FONT_OPTIONS = [
  "Inter",
  "Plus Jakarta Sans",
  "DM Sans",
  "Outfit",
  "Space Grotesk",
  "Poppins",
  "Montserrat",
  "Geist",
  "Cal Sans",
  "Playfair Display",
  "Lora",
  "Merriweather",
];

const MONO_FONT_OPTIONS = [
  "JetBrains Mono",
  "Fira Code",
  "Source Code Pro",
  "IBM Plex Mono",
  "Roboto Mono",
];

function FontsTab({
  branding,
  onChange,
}: {
  branding: BrandingConfig;
  onChange: (b: BrandingConfig) => void;
}) {
  const updateFont = (key: keyof FontScheme, value: string) => {
    onChange({
      ...branding,
      fonts: {
        ...branding.fonts,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <FontSelector
        label="Heading Font"
        value={branding.fonts.heading}
        options={FONT_OPTIONS}
        onChange={(v) => updateFont("heading", v)}
        preview="The Quick Brown Fox"
        previewSize="text-xl font-bold"
      />
      <FontSelector
        label="Body Font"
        value={branding.fonts.body}
        options={FONT_OPTIONS}
        onChange={(v) => updateFont("body", v)}
        preview="The quick brown fox jumps over the lazy dog."
        previewSize="text-sm"
      />
      <FontSelector
        label="Mono Font"
        value={branding.fonts.mono}
        options={MONO_FONT_OPTIONS}
        onChange={(v) => updateFont("mono", v)}
        preview="const code = true;"
        previewSize="text-sm"
      />
    </div>
  );
}

function FontSelector({
  label,
  value,
  options,
  onChange,
  preview,
  previewSize = "text-base",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  preview: string;
  previewSize?: string;
}) {
  return (
    <div>
      <label className="text-sm text-white mb-2 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white mb-2"
      >
        {options.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
      <div
        className={`p-3 bg-slate-800/50 rounded text-white/80 ${previewSize}`}
        style={{ fontFamily: value }}
      >
        {preview}
      </div>
    </div>
  );
}

// ============================================================================
// Spacing Tab
// ============================================================================

const BORDER_RADIUS_OPTIONS = ["none", "sm", "md", "lg", "full"] as const;
const SHADOW_STYLE_OPTIONS = ["none", "subtle", "medium", "dramatic"] as const;
const SECTION_PADDING_OPTIONS = ["py-12", "py-16", "py-20", "py-24", "py-32"];
const CONTAINER_WIDTH_OPTIONS = ["960px", "1024px", "1152px", "1280px", "1440px"];

function SpacingTab({
  branding,
  onChange,
}: {
  branding: BrandingConfig;
  onChange: (b: BrandingConfig) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm text-white mb-2 block">Border Radius</label>
        <div className="flex gap-2">
          {BORDER_RADIUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onChange({ ...branding, borderRadius: option })}
              className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                branding.borderRadius === option
                  ? "bg-orange-500/20 border-orange-500 text-orange-400"
                  : "bg-slate-800 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-white mb-2 block">Shadow Style</label>
        <div className="grid grid-cols-2 gap-2">
          {SHADOW_STYLE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onChange({ ...branding, shadowStyle: option })}
              className={`py-2 text-xs rounded-lg border transition-colors capitalize ${
                branding.shadowStyle === option
                  ? "bg-orange-500/20 border-orange-500 text-orange-400"
                  : "bg-slate-800 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-white mb-2 block">Section Padding</label>
        <select
          value={branding.spacing.sectionPadding}
          onChange={(e) =>
            onChange({
              ...branding,
              spacing: { ...branding.spacing, sectionPadding: e.target.value },
            })
          }
          className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white"
        >
          {SECTION_PADDING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replace("py-", "")}px vertical
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-white mb-2 block">Container Width</label>
        <select
          value={branding.spacing.containerMax}
          onChange={(e) =>
            onChange({
              ...branding,
              spacing: { ...branding.spacing, containerMax: e.target.value },
            })
          }
          className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white"
        >
          {CONTAINER_WIDTH_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// Preset Button
// ============================================================================

function PresetButton({
  label,
  colors,
  onClick,
}: {
  label: string;
  colors: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm text-white transition-colors"
    >
      <div className="flex -space-x-1">
        {colors.map((c, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2 border-slate-900"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      {label}
    </button>
  );
}

// ============================================================================
// Icons
// ============================================================================

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default BrandingPanel;

