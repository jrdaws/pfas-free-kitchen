"use client";

import { useState } from "react";
import { Loader2, Check, AlertCircle, Image, Play, Pause, DollarSign, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  useMediaStudioStore,
  useAssetCount,
  PlannedAsset,
  GeneratorModel 
} from "@/lib/media-studio-state";
import { getModelCost } from "@/lib/prompt-templates";

export function GenerationProgress() {
  const {
    assets,
    isGenerating,
    generationProgress,
    setGenerating,
    updateProgress,
    markAssetComplete,
    markAssetFailed,
    updateAsset,
    updateCosts,
  } = useMediaStudioStore();

  const assetCounts = useAssetCount();
  const [currentlyGenerating, setCurrentlyGenerating] = useState<string | null>(null);

  // Calculate costs
  const estimatedCost = assets.reduce((sum, a) => sum + getModelCost(a.model), 0);
  const actualCost = assets
    .filter((a) => a.status === "complete" || a.status === "approved")
    .reduce((sum, a) => sum + getModelCost(a.model), 0);

  const pendingAssets = assets.filter(
    (a) => a.status === "pending" || a.status === "rejected"
  );
  const completedAssets = assets.filter(
    (a) => a.status === "complete" || a.status === "reviewing" || a.status === "approved"
  );

  // Real generation via API
  const handleStartGeneration = async () => {
    setGenerating(true);

    try {
      // Prepare assets for API
      const assetRequests = pendingAssets.map((asset) => ({
        id: asset.id,
        prompt: asset.prompt?.composedPrompt || asset.description,
        negativePrompt: asset.prompt?.negativePrompt,
        width: asset.dimensions.width,
        height: asset.dimensions.height,
        model: asset.model === "dall-e-3" ? "flux" as const : asset.model, // Map DALL-E to Flux
      }));

      // Start generation job
      const response = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: assetRequests,
          projectName: useMediaStudioStore.getState().projectName,
          assetTarget: useMediaStudioStore.getState().assetTarget,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // Fallback to simulation if API not available
        console.warn("API not available, using simulation:", data.error);
        await runSimulatedGeneration();
        return;
      }

      // Poll for status
      const jobId = data.jobId;
      let jobComplete = false;

      while (!jobComplete) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusResponse = await fetch(`/api/media/status/${jobId}`);
        const statusData = await statusResponse.json();

        if (!statusData.success) {
          console.error("Status check failed:", statusData.error);
          break;
        }

        const job = statusData.job;

        // Update asset statuses
        for (const jobAsset of job.assets) {
          const asset = assets.find((a) => a.id === jobAsset.id);
          if (!asset) continue;

          if (jobAsset.status === "generating") {
            setCurrentlyGenerating(jobAsset.id);
            updateAsset(jobAsset.id, { status: "generating" });
            updateProgress({
              assetId: jobAsset.id,
              percent: jobAsset.progress,
              stage: jobAsset.progress < 30 ? "Loading model" : jobAsset.progress < 80 ? "Generating" : "Optimizing",
              message: `Generating ${asset.name}...`,
            });
          } else if (jobAsset.status === "complete" && jobAsset.imageUrl) {
            markAssetComplete(jobAsset.id, jobAsset.imageUrl);
          } else if (jobAsset.status === "failed") {
            markAssetFailed(jobAsset.id, jobAsset.error || "Generation failed");
          }
        }

        jobComplete = job.status === "complete" || job.status === "failed";
      }
    } catch (error) {
      console.error("Generation error:", error);
      // Fallback to simulation
      await runSimulatedGeneration();
    }

    setCurrentlyGenerating(null);
    updateProgress(null);
    setGenerating(false);
    updateCosts(estimatedCost, actualCost + pendingAssets.reduce((sum, a) => sum + getModelCost(a.model), 0));
  };

  // Fallback simulation when API is not available
  const runSimulatedGeneration = async () => {
    for (const asset of pendingAssets) {
      setCurrentlyGenerating(asset.id);
      updateAsset(asset.id, { status: "generating" });

      for (let percent = 0; percent <= 100; percent += 10) {
        updateProgress({
          assetId: asset.id,
          percent,
          stage: percent < 30 ? "Loading model" : percent < 80 ? "Generating" : "Optimizing",
          message: `Generating ${asset.name}... (simulated)`,
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const placeholderUrl = `https://placehold.co/${asset.dimensions.width}x${asset.dimensions.height}/1a1a2e/6366f1?text=${encodeURIComponent(asset.name)}`;
      markAssetComplete(asset.id, placeholderUrl);
    }
  };

  const handleStopGeneration = () => {
    setGenerating(false);
    setCurrentlyGenerating(null);
    updateProgress(null);
  };

  const handleChangeModel = (assetId: string, model: GeneratorModel) => {
    updateAsset(assetId, { model });
  };

  const overallProgress = assets.length > 0
    ? Math.round((completedAssets.length / assets.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Generation Controls */}
      <div className="border border-terminal-text/20 rounded-lg p-6 bg-terminal-bg/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-mono font-bold text-terminal-text">
              Image Generation
            </h3>
            <p className="text-sm text-terminal-dim mt-1">
              {pendingAssets.length} assets ready to generate
            </p>
          </div>

          {!isGenerating ? (
            <Button
              onClick={handleStartGeneration}
              disabled={pendingAssets.length === 0}
              className="bg-terminal-accent hover:bg-terminal-accent/80 text-terminal-bg"
            >
              <Play className="h-4 w-4 mr-2" />
              Generate All ({pendingAssets.length})
            </Button>
          ) : (
            <Button
              onClick={handleStopGeneration}
              variant="destructive"
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop Generation
            </Button>
          )}
        </div>

        {/* Overall Progress Bar */}
        {(isGenerating || completedAssets.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-terminal-dim">
                {isGenerating 
                  ? generationProgress?.message || "Generating..."
                  : `${completedAssets.length} of ${assets.length} complete`
                }
              </span>
              <span className="font-mono text-terminal-text">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-terminal-text/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-terminal-accent transition-all duration-500 ease-out rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Generation Details */}
        {isGenerating && generationProgress && (
          <div className="mt-4 p-3 border border-terminal-accent/30 rounded-lg bg-terminal-accent/5">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-terminal-accent animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-mono text-terminal-text">
                  {generationProgress.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-terminal-text/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-terminal-accent transition-all duration-300"
                      style={{ width: `${generationProgress.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-terminal-dim">
                    {generationProgress.percent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asset Gallery */}
      <div className="border border-terminal-text/20 rounded-lg p-6 bg-terminal-bg/50">
        <h3 className="text-lg font-mono font-bold text-terminal-text mb-4">
          Generated Assets ({completedAssets.length} of {assets.length} complete)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              isCurrentlyGenerating={currentlyGenerating === asset.id}
              onChangeModel={handleChangeModel}
            />
          ))}
        </div>

        {assets.length === 0 && (
          <div className="text-center py-12 text-terminal-dim">
            <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-mono">No assets to generate</p>
            <p className="text-sm mt-1">Go back and plan some assets first</p>
          </div>
        )}
      </div>

      {/* Cost Summary */}
      <div className="border border-terminal-text/20 rounded-lg p-4 bg-terminal-bg/50">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-terminal-dim" />
          <h4 className="text-sm font-mono font-bold text-terminal-text">Cost Summary</h4>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-terminal-dim">Estimated</p>
            <p className="text-lg font-mono text-terminal-text">${estimatedCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-terminal-dim">Actual</p>
            <p className="text-lg font-mono text-green-400">${actualCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-terminal-dim">Model Breakdown</p>
            <p className="text-xs text-terminal-dim mt-1">
              SD: {assets.filter((a) => a.model === "stable-diffusion").length} × $0.02 |
              DALL-E: {assets.filter((a) => a.model === "dall-e-3").length} × $0.08
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Asset Card Component
function AssetCard({
  asset,
  isCurrentlyGenerating,
  onChangeModel,
}: {
  asset: PlannedAsset;
  isCurrentlyGenerating: boolean;
  onChangeModel: (assetId: string, model: GeneratorModel) => void;
}) {
  const statusConfig = {
    pending: { color: "text-terminal-dim", bg: "bg-terminal-text/10", icon: null },
    generating: { color: "text-terminal-accent", bg: "bg-terminal-accent/20", icon: Loader2 },
    complete: { color: "text-green-400", bg: "bg-green-400/20", icon: Check },
    reviewing: { color: "text-yellow-400", bg: "bg-yellow-400/20", icon: null },
    approved: { color: "text-green-400", bg: "bg-green-400/20", icon: Check },
    rejected: { color: "text-red-400", bg: "bg-red-400/20", icon: AlertCircle },
  };

  const config = statusConfig[asset.status];
  const StatusIcon = config.icon;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      isCurrentlyGenerating ? "border-terminal-accent shadow-lg shadow-terminal-accent/20" : "border-terminal-text/20"
    }`}>
      {/* Image Preview */}
      <div className="aspect-video bg-terminal-text/5 relative">
        {asset.generatedUrl ? (
          <img
            src={asset.generatedUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isCurrentlyGenerating ? (
              <Loader2 className="h-8 w-8 text-terminal-accent animate-spin" />
            ) : (
              <Image className="h-8 w-8 text-terminal-text/30" />
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-mono ${config.bg} ${config.color}`}>
          <span className="flex items-center gap-1">
            {StatusIcon && <StatusIcon className={`h-3 w-3 ${isCurrentlyGenerating ? "animate-spin" : ""}`} />}
            {asset.status}
          </span>
        </div>
      </div>

      {/* Asset Info */}
      <div className="p-3 space-y-2">
        <div>
          <p className="font-mono text-sm font-bold text-terminal-text truncate">
            {asset.name}
          </p>
          <p className="text-xs text-terminal-dim">
            {asset.dimensions.width}×{asset.dimensions.height}
          </p>
        </div>

        {/* Model Selector (only for pending assets) */}
        {asset.status === "pending" && (
          <div className="flex gap-1">
            <button
              onClick={() => onChangeModel(asset.id, "stable-diffusion")}
              className={`flex-1 px-2 py-1 rounded text-xs font-mono flex items-center justify-center gap-1 transition-all ${
                asset.model === "stable-diffusion"
                  ? "bg-terminal-accent text-terminal-bg"
                  : "bg-terminal-text/10 text-terminal-dim hover:bg-terminal-text/20"
              }`}
            >
              <Zap className="h-3 w-3" />
              SD
            </button>
            <button
              onClick={() => onChangeModel(asset.id, "dall-e-3")}
              className={`flex-1 px-2 py-1 rounded text-xs font-mono flex items-center justify-center gap-1 transition-all ${
                asset.model === "dall-e-3"
                  ? "bg-yellow-400 text-terminal-bg"
                  : "bg-terminal-text/10 text-terminal-dim hover:bg-terminal-text/20"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              DALL-E
            </button>
          </div>
        )}

        {/* Cost */}
        <p className="text-xs text-terminal-dim">
          Cost: ${getModelCost(asset.model).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

