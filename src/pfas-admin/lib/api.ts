/**
 * API client for Admin Console
 * STUB: Replace with actual API calls
 */

import type {
  QueueItem,
  QueueFilters,
  QueueStats,
  ProductForReview,
  RiskAssessment,
  Evidence,
  Report,
  ReportStats,
  DashboardStats,
  CoverageStats,
  ActivityItem,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ============================================================
// QUEUE
// ============================================================

export async function fetchQueue(
  filters: QueueFilters
): Promise<{ items: QueueItem[]; total: number }> {
  // STUB: Mock data
  return {
    items: [
      {
        id: 'q1',
        productId: 'prod_1',
        productName: 'Lodge Cast Iron Skillet 10.25"',
        brandName: 'Lodge',
        categoryName: 'Skillets',
        lane: 'standard',
        status: 'pending',
        riskScore: 15,
        riskTerms: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'q2',
        productId: 'prod_2',
        productName: 'GreenPan Valencia Pro 10" Fry Pan',
        brandName: 'GreenPan',
        categoryName: 'Skillets',
        lane: 'high_risk',
        status: 'pending',
        riskScore: 65,
        riskTerms: ['ceramic nonstick', 'thermolon'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    total: 2,
  };
}

export async function fetchQueueStats(): Promise<QueueStats> {
  return {
    total: 127,
    pending: 43,
    underReview: 12,
    highRisk: 8,
    todayChange: 5,
    avgReviewTime: 4.2,
  };
}

// ============================================================
// PRODUCT REVIEW
// ============================================================

export async function fetchProductForReview(productId: string): Promise<ProductForReview> {
  return {
    id: productId,
    name: 'Lodge Cast Iron Skillet 10.25"',
    slug: 'lodge-cast-iron-skillet-10',
    description: 'Pre-seasoned cast iron skillet',
    brand: { id: 'b1', name: 'Lodge' },
    category: { id: 'c1', name: 'Skillets', slug: 'skillets' },
    sourceUrl: 'https://example.com/product',
    rawData: {},
    components: [
      {
        id: 'comp1',
        role: 'cooking_surface',
        materialId: 'm1',
        materialName: 'Cast Iron',
        pfasStatus: 'unknown',
      },
      {
        id: 'comp2',
        role: 'handle',
        materialId: 'm1',
        materialName: 'Cast Iron',
        pfasStatus: 'unknown',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchRiskAssessment(productId: string): Promise<RiskAssessment> {
  return {
    score: 15,
    level: 'low',
    terms: [],
    ceramicNonstick: false,
    requiresEscalation: false,
  };
}

// ============================================================
// EVIDENCE
// ============================================================

export async function fetchEvidence(
  filters?: { productId?: string }
): Promise<Evidence[]> {
  return [
    {
      id: 'ev1',
      type: 'brand_statement',
      title: 'Lodge PFAS-Free Statement',
      filename: 'lodge-pfas-statement.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 245000,
      sha256Hash: 'abc123...',
      capturedAt: new Date().toISOString(),
      metadata: {},
      linkedProductIds: ['prod_1'],
      uploadedBy: 'user_1',
      uploadedAt: new Date().toISOString(),
    },
  ];
}

export async function uploadEvidence(
  file: File,
  metadata: Partial<Evidence>
): Promise<Evidence> {
  throw new Error('Not implemented');
}

// ============================================================
// REPORTS
// ============================================================

export async function fetchReports(
  filters?: { status?: string; priority?: string }
): Promise<{ items: Report[]; total: number }> {
  return {
    items: [
      {
        id: 'rep1',
        productId: 'prod_3',
        productName: 'Suspicious Nonstick Pan',
        issueType: 'suspected_pfas',
        priority: 'high',
        status: 'submitted',
        description: 'User reports product coating may contain PFAS',
        slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    total: 1,
  };
}

export async function fetchReportStats(): Promise<ReportStats> {
  return {
    total: 34,
    open: 12,
    highPriority: 3,
    resolvedToday: 2,
    slaStatus: {
      onTrack: 9,
      atRisk: 2,
      breached: 1,
    },
  };
}

// ============================================================
// DASHBOARD
// ============================================================

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [queue, reports, coverage] = await Promise.all([
    fetchQueueStats(),
    fetchReportStats(),
    fetchCoverageStats(),
  ]);
  return { queue, reports, coverage };
}

export async function fetchCoverageStats(): Promise<CoverageStats> {
  return {
    published: 1247,
    tier1Plus: 78,
    weekChange: 23,
    tierDistribution: [
      { tier: 0, count: 274 },
      { tier: 1, count: 312 },
      { tier: 2, count: 389 },
      { tier: 3, count: 198 },
      { tier: 4, count: 74 },
    ],
  };
}

export async function fetchRecentActivity(limit = 10): Promise<ActivityItem[]> {
  return [
    {
      id: 'act1',
      type: 'product_published',
      actor: 'user_1',
      actorName: 'Jane Reviewer',
      description: 'Published Lodge Cast Iron Skillet at Tier 3',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'act2',
      type: 'evidence_uploaded',
      actor: 'user_2',
      actorName: 'John Admin',
      description: 'Uploaded lab report for All-Clad D3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ];
}
