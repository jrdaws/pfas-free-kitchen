"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useImageGeneration, type ImageStyle, type AspectRatio, type ModelTier } from "@/hooks/useImageGeneration";
import { Loader2, Sparkles, Download, RefreshCw, Image as ImageIcon } from "lucide-react";

interface ImageGeneratorPanelProps {
  defaultPrompt?: string;
  defaultStyle?: ImageStyle;
  defaultColors?: string[];
  onImageGenerated?: (url: string) => void;
  className?: string;
}

const STYLE_OPTIONS: { value: ImageStyle; label: string; icon: string }[] = [
  { value: "photorealistic", label: "Photo", icon: "📷" },
  { value: "illustration", label: "Illustration", icon: "🎨" },
  { value: "minimal", label: "Minimal", icon: "◻️" },
  { value: "abstract", label: "Abstract", icon: "🔷" },
];

const ASPECT_OPTIONS: { value: AspectRatio; label: string }[] = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "9:16", label: "9:16 (Portrait)" },
];

export function ImageGeneratorPanel({
  defaultPrompt = "",
  defaultStyle = "minimal",
  defaultColors = [],
  onImageGenerated,
  className,
}: ImageGeneratorPanelProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [style, setStyle] = useState<ImageStyle>(defaultStyle);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [model, setModel] = useState<ModelTier>("schnell");
  const [colorPalette, setColorPalette] = useState<string[]>(defaultColors);
  const [colorInput, setColorInput] = useState("");

  const { generateImage, isGenerating, generatedImage, error, reset } =
    useImageGeneration({
      onSuccess: (url) => onImageGenerated?.(url),
    });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    await generateImage({
      prompt: prompt.trim(),
      style,
      aspectRatio,
      colorPalette: colorPalette.length > 0 ? colorPalette : undefined,
      model,
    });
  };

  const handleAddColor = () => {
    const color = colorInput.trim().replace("#", "");
    if (color && /^[0-9A-Fa-f]{6}$/.test(color)) {
      setColorPalette([...colorPalette, `#${color}`]);
      setColorInput("");
    }
  };

  const handleRemoveColor = (index: number) => {
    setColorPalette(colorPalette.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("flex flex-col gap-4 p-4 bg-slate-900 rounded-xl", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">AI Image Generator</h3>
      </div>

      {/* Prompt input */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Describe your image</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A modern SaaS dashboard with analytics charts..."
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      {/* Style selection */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Style</label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setStyle(value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                style === value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Aspect Ratio</label>
        <select
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {ASPECT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Color palette */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Color Palette (optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            placeholder="#6366f1"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddColor}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Add
          </button>
        </div>
        {colorPalette.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {colorPalette.map((color, i) => (
              <button
                key={i}
                onClick={() => handleRemoveColor(i)}
                className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-lg text-sm group"
              >
                <div
                  className="w-4 h-4 rounded-full border border-slate-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-slate-400">{color}</span>
                <span className="text-slate-600 group-hover:text-red-400">×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Model toggle */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-slate-400">Model:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setModel("schnell")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              model === "schnell"
                ? "bg-green-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            ⚡ Schnell (Fast)
          </button>
          <button
            onClick={() => setModel("pro")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              model === "pro"
                ? "bg-purple-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            ✨ Pro (Quality)
          </button>
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={cn(
          "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
          isGenerating || !prompt.trim()
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-500"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Image
          </>
        )}
      </button>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Generated image */}
      {generatedImage && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-700">
            <img
              src={generatedImage}
              alt="Generated image"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <a
              href={generatedImage}
              download="generated-image.webp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

