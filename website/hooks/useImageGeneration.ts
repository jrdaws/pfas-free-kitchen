"use client";

import { useState, useCallback } from "react";

export type ImageStyle = "photorealistic" | "illustration" | "minimal" | "abstract";
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3";
export type ModelTier = "schnell" | "pro";

interface GenerateImageParams {
  prompt: string;
  style?: ImageStyle;
  aspectRatio?: AspectRatio;
  colorPalette?: string[];
  model?: ModelTier;
}

interface UseImageGenerationOptions {
  onSuccess?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

interface UseImageGenerationReturn {
  generateImage: (params: GenerateImageParams) => Promise<string | null>;
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  reset: () => void;
}

export function useImageGeneration(
  options: UseImageGenerationOptions = {}
): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async (params: GenerateImageParams): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        options.onSuccess?.(data.imageUrl);
        return data.imageUrl;
      } else {
        const errorMessage = data.error || "Image generation failed";
        setError(errorMessage);
        options.onError?.(errorMessage);
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      options.onError?.(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setGeneratedImage(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    generateImage,
    isGenerating,
    generatedImage,
    error,
    reset,
  };
}

// Utility to generate multiple images in parallel
export async function generateMultipleImages(
  prompts: GenerateImageParams[]
): Promise<(string | null)[]> {
  const results = await Promise.all(
    prompts.map(async (params) => {
      try {
        const response = await fetch("/api/generate/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const data = await response.json();
        return data.success ? data.imageUrl : null;
      } catch {
        return null;
      }
    })
  );
  return results;
}
