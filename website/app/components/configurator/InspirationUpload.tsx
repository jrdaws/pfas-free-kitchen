"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Link as LinkIcon, Figma, X, Image as ImageIcon, FileText } from "lucide-react";
import { Inspiration } from "@/lib/configurator-state";

interface InspirationUploadProps {
  inspirations: Inspiration[];
  description: string;
  onAddInspiration: (inspiration: Inspiration) => void;
  onRemoveInspiration: (id: string) => void;
  onDescriptionChange: (description: string) => void;
}

export function InspirationUpload({
  inspirations,
  description,
  onAddInspiration,
  onRemoveInspiration,
  onDescriptionChange,
}: InspirationUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    const isFigma = urlInput.includes("figma.com");
    const inspiration: Inspiration = {
      id: Date.now().toString(),
      type: isFigma ? "figma" : "url",
      value: urlInput.trim(),
      preview: urlInput.trim(),
    };

    onAddInspiration(inspiration);
    setUrlInput("");
  };

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const inspiration: Inspiration = {
            id: Date.now().toString() + Math.random(),
            type: "image",
            value: file.name,
            preview: e.target?.result as string,
          };
          onAddInspiration(inspiration);
        };
        reader.readAsDataURL(file);
      });
    },
    [onAddInspiration]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-terminal-text mb-2">
          Add Inspiration
        </h2>
        <p className="text-terminal-dim">
          Upload images, paste URLs, or describe what you want to build
        </p>
        <p className="text-xs text-terminal-accent mt-2">
          Optional: Skip this step if you want to start from a blank template
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Text Description */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <FileText className="inline h-3 w-3 mr-1" />
              Describe Your Vision
            </span>
          </div>
          <div className="terminal-content space-y-3">
            <Label className="text-terminal-text">
              What features and functionality do you want?
            </Label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Example: A modern SaaS dashboard with user authentication, subscription billing, and real-time analytics. Clean design with dark mode support..."
              className="w-full min-h-[120px] p-4 rounded border-2 border-terminal-text/30 bg-terminal-bg text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none resize-y"
            />
            <p className="text-xs text-terminal-dim">
              Describe features, design style, user flows, or anything the AI should know
            </p>
          </div>
        </div>

        {/* Image Upload (Drag & Drop) */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <ImageIcon className="inline h-3 w-3 mr-1" />
              Upload Images
            </span>
          </div>
          <div className="terminal-content">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${
                  isDragging
                    ? "border-terminal-accent bg-terminal-accent/10"
                    : "border-terminal-text/30 hover:border-terminal-text/50"
                }
              `}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-terminal-text/50" />
              <p className="text-terminal-text mb-2">
                Drag & drop images here, or click to browse
              </p>
              <p className="text-xs text-terminal-dim">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* URL / Figma Link */}
        <div className="terminal-window">
          <div className="terminal-header">
            <div className="terminal-dot bg-terminal-error"></div>
            <div className="terminal-dot bg-terminal-warning"></div>
            <div className="terminal-dot bg-terminal-text"></div>
            <span className="text-xs text-terminal-dim ml-2">
              <LinkIcon className="inline h-3 w-3 mr-1" />
              Paste URLs or Figma Links
            </span>
          </div>
          <div className="terminal-content space-y-3">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlAdd()}
                placeholder="https://dribbble.com/shots/... or https://figma.com/..."
                className="flex-1 bg-terminal-bg border-terminal-text/30 text-terminal-text font-mono text-sm"
              />
              <Button
                onClick={handleUrlAdd}
                disabled={!urlInput.trim()}
                className="bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-terminal-dim">
              Paste design inspiration from Dribbble, Behance, websites, or Figma files
            </p>
          </div>
        </div>

        {/* Inspirations Grid */}
        {inspirations.length > 0 && (
          <div className="terminal-window border-terminal-accent/30">
            <div className="terminal-header">
              <div className="terminal-dot bg-terminal-error"></div>
              <div className="terminal-dot bg-terminal-warning"></div>
              <div className="terminal-dot bg-terminal-text"></div>
              <span className="text-xs text-terminal-accent ml-2">
                {inspirations.length} Inspiration{inspirations.length !== 1 ? "s" : ""} Added
              </span>
            </div>
            <div className="terminal-content">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {inspirations.map((inspiration) => (
                  <div
                    key={inspiration.id}
                    className="relative group rounded-lg border-2 border-terminal-text/30 overflow-hidden hover:border-terminal-accent transition-all"
                  >
                    {/* Preview */}
                    {inspiration.type === "image" && inspiration.preview && (
                      <img
                        src={inspiration.preview}
                        alt={inspiration.value}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    {inspiration.type === "url" && (
                      <div className="w-full h-32 bg-terminal-bg/50 flex items-center justify-center p-4">
                        <LinkIcon className="h-8 w-8 text-terminal-text/50 mb-2" />
                      </div>
                    )}
                    {inspiration.type === "figma" && (
                      <div className="w-full h-32 bg-terminal-bg/50 flex items-center justify-center p-4">
                        <Figma className="h-8 w-8 text-terminal-text/50 mb-2" />
                      </div>
                    )}

                    {/* Label */}
                    <div className="p-2 bg-terminal-bg/80 backdrop-blur">
                      <p className="text-xs text-terminal-text truncate font-mono">
                        {inspiration.type === "image"
                          ? inspiration.value
                          : new URL(inspiration.value).hostname}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveInspiration(inspiration.id)}
                      className="absolute top-2 right-2 p-1 rounded bg-terminal-error hover:bg-terminal-error/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
