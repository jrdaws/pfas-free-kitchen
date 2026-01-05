import { NextRequest } from "next/server";
import { apiSuccess, apiError, ErrorCodes } from "@/lib/api-errors";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/admin/quality-metrics
 * 
 * Fetch aggregated quality metrics for the admin dashboard.
 * Requires admin authentication (implement as needed).
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return apiError(ErrorCodes.UNAUTHORIZED, "Admin access required", 401);
    // }

    if (!isSupabaseConfigured()) {
      // Return mock data for development
      return apiSuccess(getMockMetrics());
    }

    const supabase = getSupabase();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch export feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from("export_feedback")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (feedbackError) {
      console.error("[Quality Metrics] Feedback query failed:", feedbackError);
    }

    const feedbackData = feedback || [];

    // Calculate metrics
    const metrics = calculateMetrics(feedbackData);

    return apiSuccess(metrics);
  } catch (error) {
    console.error("[Quality Metrics API Error]", error);
    return apiError(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to fetch quality metrics",
      500
    );
  }
}

interface ExportFeedbackRow {
  id: string;
  template: string;
  integrations: Record<string, string>;
  build_successful: boolean;
  preview_accuracy: number;
  overall_satisfaction: number;
  missing_files: string[] | null;
  build_errors: string[] | null;
  what_was_missing: string | null;
  would_use_again: boolean;
  created_at: string;
}

function calculateMetrics(feedback: ExportFeedbackRow[]) {
  const total = feedback.length;
  const successful = feedback.filter(f => f.build_successful).length;
  
  // Export success
  const exports = {
    total,
    successful,
    failed: total - successful,
    successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
  };

  // Feedback aggregates
  const avgPreview = total > 0 
    ? feedback.reduce((sum, f) => sum + f.preview_accuracy, 0) / total 
    : 0;
  const avgSatisfaction = total > 0 
    ? feedback.reduce((sum, f) => sum + f.overall_satisfaction, 0) / total 
    : 0;
  const wouldUseAgain = total > 0 
    ? Math.round((feedback.filter(f => f.would_use_again).length / total) * 100) 
    : 0;

  const feedbackMetrics = {
    total,
    averagePreviewAccuracy: avgPreview,
    averageSatisfaction: avgSatisfaction,
    wouldUseAgainRate: wouldUseAgain,
  };

  // Top issues
  const missingFilesCount: Record<string, number> = {};
  const buildErrorsCount: Record<string, number> = {};

  for (const f of feedback) {
    if (f.missing_files) {
      for (const file of f.missing_files) {
        missingFilesCount[file] = (missingFilesCount[file] || 0) + 1;
      }
    }
    if (f.build_errors) {
      for (const error of f.build_errors) {
        const key = error.substring(0, 50);
        buildErrorsCount[key] = (buildErrorsCount[key] || 0) + 1;
      }
    }
  }

  const topIssues = [
    {
      type: "Missing files",
      count: Object.keys(missingFilesCount).length,
      examples: Object.entries(missingFilesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([file]) => file),
    },
    {
      type: "Build errors",
      count: Object.keys(buildErrorsCount).length,
      examples: Object.entries(buildErrorsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([error]) => error),
    },
  ].filter(i => i.count > 0);

  // By template
  const templateStats: Record<string, { exports: number; successful: number; satisfaction: number }> = {};
  for (const f of feedback) {
    if (!templateStats[f.template]) {
      templateStats[f.template] = { exports: 0, successful: 0, satisfaction: 0 };
    }
    templateStats[f.template].exports++;
    if (f.build_successful) templateStats[f.template].successful++;
    templateStats[f.template].satisfaction += f.overall_satisfaction;
  }

  const byTemplate = Object.entries(templateStats)
    .map(([template, stats]) => ({
      template,
      exports: stats.exports,
      successRate: Math.round((stats.successful / stats.exports) * 100),
      avgSatisfaction: stats.satisfaction / stats.exports,
    }))
    .sort((a, b) => b.exports - a.exports);

  // By integration
  const integrationStats: Record<string, { usage: number; successful: number }> = {};
  for (const f of feedback) {
    if (f.integrations) {
      for (const [category, provider] of Object.entries(f.integrations)) {
        if (!provider) continue;
        const key = `${category}:${provider}`;
        if (!integrationStats[key]) {
          integrationStats[key] = { usage: 0, successful: 0 };
        }
        integrationStats[key].usage++;
        if (f.build_successful) integrationStats[key].successful++;
      }
    }
  }

  const byIntegration = Object.entries(integrationStats)
    .map(([integration, stats]) => ({
      integration,
      usage: stats.usage,
      successRate: Math.round((stats.successful / stats.usage) * 100),
    }))
    .sort((a, b) => b.usage - a.usage);

  // Daily trends
  const dailyStats: Record<string, { exports: number; successful: number }> = {};
  for (const f of feedback) {
    const date = new Date(f.created_at).toLocaleDateString("en-US", { weekday: "short" });
    if (!dailyStats[date]) {
      dailyStats[date] = { exports: 0, successful: 0 };
    }
    dailyStats[date].exports++;
    if (f.build_successful) dailyStats[date].successful++;
  }

  const trends = Object.entries(dailyStats)
    .map(([date, stats]) => ({
      date,
      exports: stats.exports,
      successRate: stats.exports > 0 ? Math.round((stats.successful / stats.exports) * 100) : 0,
    }));

  return {
    exports,
    feedback: feedbackMetrics,
    topIssues,
    byTemplate,
    byIntegration,
    trends,
  };
}

function getMockMetrics() {
  return {
    exports: {
      total: 156,
      successful: 148,
      failed: 8,
      successRate: 95,
    },
    feedback: {
      total: 42,
      averagePreviewAccuracy: 4.2,
      averageSatisfaction: 4.4,
      wouldUseAgainRate: 88,
    },
    topIssues: [
      { type: "Missing files", count: 5, examples: ["LoginForm.tsx", "middleware.ts"] },
      { type: "Build errors", count: 3, examples: ["next/headers in client component"] },
    ],
    byTemplate: [
      { template: "SaaS", exports: 89, successRate: 96, avgSatisfaction: 4.5 },
      { template: "E-commerce", exports: 34, successRate: 91, avgSatisfaction: 4.1 },
      { template: "Blog", exports: 22, successRate: 98, avgSatisfaction: 4.6 },
    ],
    byIntegration: [
      { integration: "auth:supabase", usage: 78, successRate: 97 },
      { integration: "payments:stripe", usage: 56, successRate: 94 },
      { integration: "auth:clerk", usage: 34, successRate: 96 },
    ],
    trends: [
      { date: "Mon", exports: 18, successRate: 94 },
      { date: "Tue", exports: 24, successRate: 96 },
      { date: "Wed", exports: 22, successRate: 95 },
      { date: "Thu", exports: 28, successRate: 93 },
      { date: "Fri", exports: 31, successRate: 97 },
      { date: "Sat", exports: 15, successRate: 100 },
      { date: "Sun", exports: 12, successRate: 92 },
    ],
  };
}

