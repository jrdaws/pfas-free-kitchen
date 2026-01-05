/**
 * Sanity CMS Client with Lazy Initialization
 * 
 * Gracefully handles missing configuration.
 */

import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2024-01-01";

// Check if Sanity is configured
const isSanityConfigured = 
  projectId && 
  !projectId.includes("placeholder");

// Warn in development if not configured
if (!isSanityConfigured && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.warn(`
⚠️  Sanity CMS configuration missing

Required environment variables:
  NEXT_PUBLIC_SANITY_PROJECT_ID
  NEXT_PUBLIC_SANITY_DATASET

Get these from: https://www.sanity.io/manage
  `);
}

/**
 * Check if Sanity is configured
 */
export function isCmsConfigured(): boolean {
  return isSanityConfigured;
}

// Create client only if configured
function createSanityClient(preview = false): SanityClient | null {
  if (!isSanityConfigured) {
    return null;
  }
  
  return createClient({
    projectId: projectId!,
    dataset,
    apiVersion,
    useCdn: !preview,
    perspective: preview ? "previewDrafts" : "published",
    token: preview ? process.env.SANITY_API_TOKEN : undefined,
  });
}

// Lazy-loaded clients
let _client: SanityClient | null = null;
let _previewClient: SanityClient | null = null;

export function getClient(preview = false): SanityClient | null {
  if (!isSanityConfigured) {
    return null;
  }
  
  if (preview) {
    if (!_previewClient) {
      _previewClient = createSanityClient(true);
    }
    return _previewClient;
  }
  
  if (!_client) {
    _client = createSanityClient(false);
  }
  return _client;
}

// Legacy exports for backward compatibility
export const client = isSanityConfigured 
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

export const previewClient = isSanityConfigured
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "previewDrafts",
      token: process.env.SANITY_API_TOKEN,
    })
  : null;

/**
 * Fetch data from Sanity with automatic caching
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 60,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T | null> {
  const sanityClient = getClient();
  
  if (!sanityClient) {
    console.warn("[Sanity] CMS not configured, returning null");
    return null;
  }

  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate, tags },
    });
  } catch (error) {
    console.error("[Sanity] Fetch error:", error);
    return null;
  }
}
