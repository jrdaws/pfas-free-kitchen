/**
 * Feedback Storage Module
 * 
 * Handles storing and retrieving user feedback in Supabase.
 * See output/website-agent/inbox/20251223-1900-P2-task-user-feedback-api.txt for requirements.
 */

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";

export interface FeedbackInput {
  rating: number; // 1-5
  message?: string;
  projectConfig?: {
    template?: string;
    features?: string[];
    integrations?: Record<string, string>;
  };
  generationTier?: "fast" | "balanced" | "quality";
}

export interface Feedback extends FeedbackInput {
  id: string;
  ip_hash: string;
  created_at: string;
}

/**
 * Hash an IP address for rate limiting (privacy-preserving)
 */
export function hashIP(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Check if an IP has exceeded the rate limit (5 submissions per hour)
 */
export async function checkRateLimit(ipHash: string): Promise<{ allowed: boolean; remaining: number }> {
  if (!isSupabaseConfigured()) {
    // If Supabase not configured, allow (development mode)
    return { allowed: true, remaining: 5 };
  }

  const supabase = getSupabase();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", oneHourAgo);

  if (error) {
    console.error("[Feedback] Rate limit check failed:", error);
    // On error, be permissive (allow the request)
    return { allowed: true, remaining: 5 };
  }

  const currentCount = count || 0;
  const limit = 5;
  const remaining = Math.max(0, limit - currentCount);

  return {
    allowed: currentCount < limit,
    remaining,
  };
}

/**
 * Store feedback in Supabase
 */
export async function storeFeedback(
  input: FeedbackInput,
  ipHash: string
): Promise<{ id: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    // Development mode: log and return mock ID
    console.log("[Feedback] Development mode - feedback not stored:", input);
    return { id: `dev-${Date.now()}` };
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      rating: input.rating,
      message: input.message?.slice(0, 1000) || null, // Limit message length
      project_config: input.projectConfig || null,
      generation_tier: input.generationTier || null,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Feedback] Failed to store:", error);
    return { error: error.message };
  }

  return { id: data.id };
}

/**
 * Validate feedback input
 */
export function validateFeedback(input: unknown): { valid: true; data: FeedbackInput } | { valid: false; error: string } {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "Request body must be an object" };
  }

  const body = input as Record<string, unknown>;

  // Rating is required and must be 1-5
  if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
    return { valid: false, error: "Rating must be a number between 1 and 5" };
  }

  // Message is optional but must be string if provided
  if (body.message !== undefined && typeof body.message !== "string") {
    return { valid: false, error: "Message must be a string" };
  }

  // Message length limit
  if (typeof body.message === "string" && body.message.length > 1000) {
    return { valid: false, error: "Message must be 1000 characters or less" };
  }

  // Generation tier validation
  if (body.generationTier !== undefined) {
    const validTiers = ["fast", "balanced", "quality"];
    if (!validTiers.includes(body.generationTier as string)) {
      return { valid: false, error: "Generation tier must be one of: fast, balanced, quality" };
    }
  }

  return {
    valid: true,
    data: {
      rating: body.rating as number,
      message: body.message as string | undefined,
      projectConfig: body.projectConfig as FeedbackInput["projectConfig"],
      generationTier: body.generationTier as FeedbackInput["generationTier"],
    },
  };
}

