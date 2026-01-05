"use client";

import { ImageGeneratorPanel } from "@/app/components/preview/ImageGeneratorPanel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ImageGeneratorPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Image Generator
          </h1>
          <p className="text-slate-400">
            Generate custom images for your SaaS project using Flux AI.
            Describe what you want and let AI create it for you.
          </p>
        </div>

        <ImageGeneratorPanel
          defaultPrompt=""
          defaultStyle="minimal"
          onImageGenerated={(url) => console.log("Generated:", url)}
        />

        <div className="mt-8 p-4 bg-slate-900/50 border border-slate-800 rounded-lg">
          <h3 className="font-medium text-white mb-2">💡 Prompt Tips</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>• Be specific about what you want to see</li>
            <li>• Include context like &ldquo;for a SaaS landing page&rdquo;</li>
            <li>• Mention composition: &ldquo;centered&rdquo;, &ldquo;left-aligned&rdquo;</li>
            <li>• Add mood: &ldquo;professional&rdquo;, &ldquo;friendly&rdquo;, &ldquo;bold&rdquo;</li>
            <li>• Use color palette for brand consistency</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <h3 className="font-medium text-amber-400 mb-2">⚠️ Setup Required</h3>
          <p className="text-sm text-amber-300/80">
            To generate real images, add your Replicate API token:
          </p>
          <code className="block mt-2 p-2 bg-slate-900 rounded text-xs text-slate-300">
            REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxx
          </code>
          <p className="text-sm text-amber-300/80 mt-2">
            Get your token from{" "}
            <a
              href="https://replicate.com/account/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-200"
            >
              replicate.com/account/api-tokens
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

