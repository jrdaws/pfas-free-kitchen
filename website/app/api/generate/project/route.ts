import { NextRequest, NextResponse } from "next/server";
import { generateProject, type StreamEvent } from "@dawson-framework/ai-agent";
import { checkRateLimit, isRedisAvailable } from "@/lib/rate-limiter";
import { checkCostLimit, recordUsage, TOKEN_ESTIMATES, isCostTrackingAvailable } from "@/lib/cost-tracker";
import crypto from "crypto";

type ModelTier = 'fast' | 'balanced' | 'quality';

interface GenerateProjectRequest {
  description: string;
  projectName?: string;
  template?: string;
  vision?: string;
  mission?: string;
  inspirations?: Array<{ type: string; value: string; preview?: string }>;
  userApiKey?: string;
  sessionId: string;
  seed?: number;
  modelTier?: ModelTier;
  stream?: boolean;
}

interface CacheEntry {
  result: any;
  generatedAt: string;
  expiresAt: number;
}

// In-memory cache for project generation results
const projectCache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Cost control
const MAX_INPUT_LENGTH = 10000;

/**
 * Generate cache key from request parameters
 */
function generateCacheKey(params: {
  description: string;
  projectName?: string;
  template?: string;
  vision?: string;
  mission?: string;
  seed?: number;
}): string {
  const keyData = JSON.stringify({
    description: params.description,
    projectName: params.projectName || "",
    template: params.template || "",
    vision: params.vision || "",
    mission: params.mission || "",
    seed: params.seed,
  });
  return crypto.createHash("sha256").update(keyData).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GenerateProjectRequest = await request.json();
    const {
      description,
      projectName,
      template,
      vision,
      mission,
      inspirations,
      userApiKey,
      sessionId,
      seed,
      modelTier,
      stream: enableStreaming,
    } = body;

    // Validate required fields
    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Validation failed", message: "Description is required" },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Validation failed", message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Cost control: Limit input size
    const descriptionLength = description.length;
    if (descriptionLength > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        {
          error: "Input too long",
          message: `Description must be less than ${MAX_INPUT_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // Check cache first (only for deterministic requests with seed)
    const cacheKey = generateCacheKey({
      description,
      projectName,
      template,
      vision,
      mission,
      seed,
    });

    const cachedResult = projectCache.get(cacheKey);
    if (cachedResult && cachedResult.expiresAt > Date.now()) {
      console.log(`[Project Cache Hit] ${Date.now() - startTime}ms`);
      
      // For cached results with streaming, send as single complete event
      if (enableStreaming) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'complete', 
              result: {
                success: true,
                ...cachedResult.result,
                generatedAt: cachedResult.generatedAt,
                cached: true,
                remainingDemoGenerations: null,
              }
            })}\n\n`));
            controller.close();
          }
        });
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
      
      return NextResponse.json({
        success: true,
        ...cachedResult.result,
        generatedAt: cachedResult.generatedAt,
        cached: true,
        remainingDemoGenerations: null,
      });
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(sessionId, userApiKey);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `You've reached the demo limit. Add your Anthropic API key for unlimited access.`,
          rateLimited: true,
          resetAt: rateLimitResult.resetAt,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Cost limit check (platform-wide daily/monthly caps)
    // Only enforce for platform API key usage (not when user provides their own)
    if (!userApiKey) {
      const costCheck = await checkCostLimit(TOKEN_ESTIMATES.projectGeneration);
      if (!costCheck.allowed) {
        console.warn(`[Cost Limit] Blocked: ${costCheck.reason}`);
        return NextResponse.json(
          {
            error: "Service temporarily limited",
            message: "The service has reached its usage limit. Please try again later or provide your own Anthropic API key.",
            costLimited: true,
            resetAt: costCheck.stats.daily.resetAt,
          },
          { status: 503 }
        );
      }
      if (costCheck.alertLevel === "warning" || costCheck.alertLevel === "critical") {
        console.warn(`[Cost Alert] ${costCheck.alertLevel.toUpperCase()}: Daily ${costCheck.stats.daily.percentUsed}%, Monthly ${costCheck.stats.monthly.percentUsed}%`);
      }
    }

    // Check API key availability
    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "No API key available",
          message: "Please provide your Anthropic API key to generate projects.",
        },
        { status: 401 }
      );
    }

    // Validate modelTier if provided
    const validTiers: ModelTier[] = ['fast', 'balanced', 'quality'];
    const tier = modelTier && validTiers.includes(modelTier) ? modelTier : 'balanced';

    // Call AI agent package
    console.log(`[Project Generation] Starting for: ${projectName || "Untitled"} (tier: ${tier}, stream: ${enableStreaming})`);

    const projectInput = {
      description,
      projectName,
      template,
      vision,
      mission,
      inspirations: inspirations?.map(i => ({
        type: i.type as "url" | "image" | "figma",
        value: i.value,
        preview: i.preview,
      })),
    };

    // Handle streaming response
    if (enableStreaming) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const result = await generateProject(
              projectInput,
              { 
                apiKey, 
                modelTier: tier,
                stream: true,
                onProgress: (event: StreamEvent) => {
                  // Send progress events
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                    type: 'progress',
                    stage: event.stage,
                    eventType: event.type,
                    message: event.message,
                  })}\n\n`));
                }
              }
            );

            const generatedAt = new Date().toISOString();

            // Cache the result
            projectCache.set(cacheKey, {
              result: {
                intent: result.intent,
                architecture: result.architecture,
                files: result.code.files,
                integrationCode: result.code.integrationCode,
                cursorrules: result.context.cursorrules,
                startPrompt: result.context.startPrompt,
              },
              generatedAt,
              expiresAt: Date.now() + CACHE_TTL,
            });

            // Clean up old cache entries
            if (projectCache.size > 100) {
              const now = Date.now();
              for (const [key, entry] of projectCache.entries()) {
                if (entry.expiresAt < now) {
                  projectCache.delete(key);
                }
              }
            }

            // Record token usage for cost tracking (platform API key only)
            if (!userApiKey) {
              // Estimate tokens based on output size
              const estimatedTokens = TOKEN_ESTIMATES.projectGeneration;
              await recordUsage(estimatedTokens);
            }

            // Log success metrics
            const duration = Date.now() - startTime;
            console.log(
              `[Project Generated] ${projectName || "Untitled"} | ${duration}ms | Template: ${result.intent.suggestedTemplate} | Files: ${result.code.files.length} | Redis: ${isRedisAvailable()} | CostTracking: ${isCostTrackingAvailable()}`
            );

            // Send final complete event with full result
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              result: {
                success: true,
                intent: result.intent,
                architecture: result.architecture,
                files: result.code.files,
                integrationCode: result.code.integrationCode,
                cursorrules: result.context.cursorrules,
                startPrompt: result.context.startPrompt,
                generatedAt,
                seed: seed || Date.now(),
                remainingDemoGenerations:
                  rateLimitResult.remaining >= 0 ? rateLimitResult.remaining : null,
                redisEnabled: isRedisAvailable(),
              }
            })}\n\n`));
            controller.close();
          } catch (error: any) {
            const duration = Date.now() - startTime;
            console.error(`[Project Generation Error] ${duration}ms`, error);
            
            // Send error event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              error: error?.code || 'generation_failed',
              message: error?.message || 'Failed to generate project',
              retryable: error?.retryable || false,
            })}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response (original behavior)
    const result = await generateProject(
      projectInput,
      { apiKey, modelTier: tier }
    );

    const generatedAt = new Date().toISOString();

    // Cache the result
    projectCache.set(cacheKey, {
      result: {
        intent: result.intent,
        architecture: result.architecture,
        files: result.code.files,
        integrationCode: result.code.integrationCode,
        cursorrules: result.context.cursorrules,
        startPrompt: result.context.startPrompt,
      },
      generatedAt,
      expiresAt: Date.now() + CACHE_TTL,
    });

    // Clean up old cache entries
    if (projectCache.size > 100) {
      const now = Date.now();
      for (const [key, entry] of projectCache.entries()) {
        if (entry.expiresAt < now) {
          projectCache.delete(key);
        }
      }
    }

    // Record token usage for cost tracking (platform API key only)
    if (!userApiKey) {
      const estimatedTokens = TOKEN_ESTIMATES.projectGeneration;
      await recordUsage(estimatedTokens);
    }

    // Log success metrics
    const duration = Date.now() - startTime;
    console.log(
      `[Project Generated] ${projectName || "Untitled"} | ${duration}ms | Template: ${result.intent.suggestedTemplate} | Files: ${result.code.files.length} | Redis: ${isRedisAvailable()} | CostTracking: ${isCostTrackingAvailable()}`
    );

    return NextResponse.json({
      success: true,
      intent: result.intent,
      architecture: result.architecture,
      files: result.code.files,
      integrationCode: result.code.integrationCode,
      cursorrules: result.context.cursorrules,
      startPrompt: result.context.startPrompt,
      generatedAt,
      seed: seed || Date.now(),
      remainingDemoGenerations:
        rateLimitResult.remaining >= 0 ? rateLimitResult.remaining : null,
      redisEnabled: isRedisAvailable(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Enhanced error handling
    console.error(`[Project Generation Error] ${duration}ms`, error);

    // Handle AI agent errors specifically
    if (error?.code) {
      const statusCode = error.code.includes("429")
        ? 429
        : error.code.includes("401")
        ? 401
        : 500;

      return NextResponse.json(
        {
          error: error.code,
          message: error.message || "Project generation failed",
          retryable: error.retryable || false,
        },
        { status: statusCode }
      );
    }

    // Generic error handling
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        error: "Generation failed",
        message: "Failed to generate project. Please try again.",
        details: isDevelopment ? error.message : undefined,
        stack: isDevelopment ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
