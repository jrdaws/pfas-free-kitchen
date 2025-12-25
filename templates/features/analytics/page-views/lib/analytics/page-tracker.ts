/**
 * Page View Tracking Module
 * 
 * Tracks page views and popular content.
 * Stores data in Supabase for analytics.
 */

import { createClient } from "@/lib/supabase";

export interface PageView {
  page: string;
  referrer?: string;
  userAgent?: string;
  sessionId?: string;
  userId?: string;
  timestamp: string;
}

export interface PageStats {
  page: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage?: number;
}

/**
 * Track a page view
 */
export async function trackPageView(
  page: string,
  options: Partial<PageView> = {}
): Promise<void> {
  const supabase = createClient();

  const pageView: PageView = {
    page,
    referrer: typeof document !== "undefined" ? document.referrer : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    ...options,
  };

  try {
    await supabase.from("page_views").insert(pageView);
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}

/**
 * Get page view statistics
 */
export async function getPageStats(
  startDate?: Date,
  endDate?: Date
): Promise<PageStats[]> {
  const supabase = createClient();

  let query = supabase
    .from("page_views")
    .select("page, session_id")
    .order("page");

  if (startDate) {
    query = query.gte("timestamp", startDate.toISOString());
  }
  if (endDate) {
    query = query.lte("timestamp", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Failed to get page stats:", error);
    return [];
  }

  // Aggregate stats
  const statsMap = new Map<string, { views: number; sessions: Set<string> }>();

  for (const row of data) {
    const existing = statsMap.get(row.page) || { views: 0, sessions: new Set() };
    existing.views++;
    if (row.session_id) {
      existing.sessions.add(row.session_id);
    }
    statsMap.set(row.page, existing);
  }

  return Array.from(statsMap.entries()).map(([page, stats]) => ({
    page,
    views: stats.views,
    uniqueVisitors: stats.sessions.size,
  }));
}

/**
 * Get top pages by views
 */
export async function getTopPages(
  limit = 10,
  startDate?: Date,
  endDate?: Date
): Promise<PageStats[]> {
  const stats = await getPageStats(startDate, endDate);
  return stats.sort((a, b) => b.views - a.views).slice(0, limit);
}

/**
 * Get view count for a specific page
 */
export async function getPageViewCount(page: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .eq("page", page);

  if (error) {
    console.error("Failed to get page view count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Hook for client-side page tracking
 */
export function usePageTracking(page: string): void {
  if (typeof window === "undefined") return;

  // Track on mount
  const sessionId = getOrCreateSessionId();
  trackPageView(page, { sessionId });
}

function getOrCreateSessionId(): string {
  if (typeof sessionStorage === "undefined") {
    return `server-${Date.now()}`;
  }

  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

