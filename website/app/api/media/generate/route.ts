import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { nanoid } from "nanoid";
import { 
  getJob, 
  setJob, 
  cleanupOldJobs, 
  type GenerationJob 
} from "@/lib/media-jobs";

// Types
interface AssetRequest {
  id: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  model: "stable-diffusion" | "dall-e-3" | "flux";
}

interface GenerateRequest {
  assets: AssetRequest[];
  projectName: string;
  assetTarget: "PROJECT" | "TEMPLATE";
}

// Model configurations
const MODEL_CONFIGS = {
  flux: {
    model: "black-forest-labs/flux-schnell" as const,
    cost: 0.03,
  },
  "stable-diffusion": {
    model: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b" as const,
    cost: 0.02,
  },
  "dall-e-3": {
    // Note: DALL-E would need OpenAI integration
    // For now, fallback to Flux
    model: "black-forest-labs/flux-dev" as const,
    cost: 0.08,
  },
};

// Map dimensions to aspect ratio
function getAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.1) return "1:1";
  if (Math.abs(ratio - 16 / 9) < 0.1) return "16:9";
  if (Math.abs(ratio - 4 / 3) < 0.1) return "4:3";
  if (Math.abs(ratio - 9 / 16) < 0.1) return "9:16";
  if (Math.abs(ratio - 3 / 2) < 0.1) return "3:2";
  return "16:9"; // Default
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.assets || body.assets.length === 0) {
      return NextResponse.json(
        { success: false, error: "No assets provided" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: "REPLICATE_API_TOKEN not configured",
          simulation: true 
        },
        { status: 503 }
      );
    }

    // Create job
    const jobId = nanoid();
    const job: GenerationJob = {
      id: jobId,
      status: "pending",
      assets: body.assets.map((asset) => ({
        id: asset.id,
        status: "pending",
        progress: 0,
      })),
      createdAt: new Date().toISOString(),
      projectName: body.projectName,
      assetTarget: body.assetTarget,
    };

    setJob(job);
    cleanupOldJobs();

    // Start async generation (don't await)
    processGenerationJob(jobId, body.assets, apiToken);

    return NextResponse.json({
      success: true,
      jobId,
      estimatedTime: body.assets.length * 15, // ~15 seconds per image
    });
  } catch (error) {
    console.error("Media generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start generation" },
      { status: 500 }
    );
  }
}

// Async generation processor
async function processGenerationJob(
  jobId: string,
  assets: AssetRequest[],
  apiToken: string
) {
  const job = getJob(jobId);
  if (!job) return;

  job.status = "processing";
  setJob(job);

  const replicate = new Replicate({ auth: apiToken });

  for (const asset of assets) {
    const currentJob = getJob(jobId);
    if (!currentJob) return;

    const jobAsset = currentJob.assets.find((a) => a.id === asset.id);
    if (!jobAsset) continue;

    jobAsset.status = "generating";
    jobAsset.progress = 10;
    setJob(currentJob);

    try {
      const modelConfig = MODEL_CONFIGS[asset.model] || MODEL_CONFIGS.flux;
      const aspectRatio = getAspectRatio(asset.width, asset.height);

      // Build input based on model
      let input: Record<string, unknown>;
      
      if (asset.model === "stable-diffusion") {
        input = {
          prompt: asset.prompt,
          negative_prompt: asset.negativePrompt || "blurry, low quality, distorted, watermark",
          width: Math.min(asset.width, 1024),
          height: Math.min(asset.height, 1024),
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 25,
        };
      } else {
        // Flux models
        input = {
          prompt: asset.prompt,
          aspect_ratio: aspectRatio,
          output_format: "webp",
          output_quality: 90,
          num_outputs: 1,
        };
      }

      jobAsset.progress = 30;
      setJob(currentJob);

      // Run generation
      const output = await replicate.run(modelConfig.model, { input });

      jobAsset.progress = 90;
      setJob(currentJob);

      // Extract URL from output
      let imageUrl: string | undefined;
      if (Array.isArray(output) && output.length > 0) {
        imageUrl = output[0] as string;
      } else if (typeof output === "string") {
        imageUrl = output;
      }

      if (imageUrl) {
        jobAsset.status = "complete";
        jobAsset.progress = 100;
        jobAsset.imageUrl = imageUrl;
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error(`Failed to generate asset ${asset.id}:`, error);
      jobAsset.status = "failed";
      jobAsset.error = error instanceof Error ? error.message : "Generation failed";
    }

    setJob(currentJob);
  }

  // Update job status
  const finalJob = getJob(jobId);
  if (finalJob) {
    const allComplete = finalJob.assets.every(
      (a) => a.status === "complete" || a.status === "failed"
    );
    const anyFailed = finalJob.assets.some((a) => a.status === "failed");
    
    finalJob.status = allComplete ? (anyFailed ? "failed" : "complete") : "processing";
    setJob(finalJob);
  }
}
