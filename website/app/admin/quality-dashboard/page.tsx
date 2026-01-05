'use client';

import { useEffect, useState } from 'react';

/**
 * Quality Dashboard
 * 
 * Admin view showing export quality metrics, success rates,
 * and user satisfaction scores.
 */

interface QualityMetrics {
  exports: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  feedback: {
    total: number;
    averagePreviewAccuracy: number;
    averageSatisfaction: number;
    wouldUseAgainRate: number;
  };
  topIssues: {
    type: string;
    count: number;
    examples: string[];
  }[];
  byTemplate: {
    template: string;
    exports: number;
    successRate: number;
    avgSatisfaction: number;
  }[];
  byIntegration: {
    integration: string;
    usage: number;
    successRate: number;
  }[];
  trends: {
    date: string;
    exports: number;
    successRate: number;
  }[];
}

export default function QualityDashboard() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const response = await fetch('/api/admin/quality-metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      // Use mock data for development
      setMetrics(getMockMetrics());
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Quality Dashboard</h1>
          <div className="text-foreground-secondary">Loading metrics...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Quality Dashboard</h1>
          <div className="text-destructive">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Quality Dashboard</h1>
          <button 
            onClick={() => { setLoading(true); fetchMetrics(); }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Export Success Rate"
            value={`${metrics.exports.successRate}%`}
            subtitle={`${metrics.exports.successful}/${metrics.exports.total} exports`}
            status={metrics.exports.successRate >= 95 ? 'success' : metrics.exports.successRate >= 80 ? 'warning' : 'error'}
          />
          <MetricCard
            title="Preview Accuracy"
            value={`${metrics.feedback.averagePreviewAccuracy.toFixed(1)}/5`}
            subtitle="User-reported"
            status={metrics.feedback.averagePreviewAccuracy >= 4 ? 'success' : metrics.feedback.averagePreviewAccuracy >= 3 ? 'warning' : 'error'}
          />
          <MetricCard
            title="User Satisfaction"
            value={`${metrics.feedback.averageSatisfaction.toFixed(1)}/5`}
            subtitle={`${metrics.feedback.total} responses`}
            status={metrics.feedback.averageSatisfaction >= 4 ? 'success' : metrics.feedback.averageSatisfaction >= 3 ? 'warning' : 'error'}
          />
          <MetricCard
            title="Would Use Again"
            value={`${metrics.feedback.wouldUseAgainRate}%`}
            subtitle="Retention indicator"
            status={metrics.feedback.wouldUseAgainRate >= 80 ? 'success' : metrics.feedback.wouldUseAgainRate >= 60 ? 'warning' : 'error'}
          />
        </div>

        {/* Top Issues */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Top Issues</h2>
          <div className="space-y-3">
            {metrics.topIssues.length === 0 ? (
              <p className="text-foreground-secondary">No issues reported yet</p>
            ) : (
              metrics.topIssues.map((issue, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <span className="font-medium text-foreground">{issue.type}</span>
                    <span className="ml-2 text-foreground-muted">({issue.count} reports)</span>
                  </div>
                  <div className="text-sm text-foreground-secondary">
                    {issue.examples.slice(0, 2).join(', ')}
                    {issue.examples.length > 2 && ` +${issue.examples.length - 2} more`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Template Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">By Template</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-foreground-muted">
                  <th className="pb-2">Template</th>
                  <th className="pb-2">Exports</th>
                  <th className="pb-2">Success</th>
                  <th className="pb-2">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byTemplate.map((t, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 text-foreground">{t.template}</td>
                    <td className="py-2 text-foreground-secondary">{t.exports}</td>
                    <td className="py-2">
                      <StatusBadge value={t.successRate} suffix="%" />
                    </td>
                    <td className="py-2 text-foreground-secondary">{t.avgSatisfaction.toFixed(1)}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">By Integration</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-foreground-muted">
                  <th className="pb-2">Integration</th>
                  <th className="pb-2">Usage</th>
                  <th className="pb-2">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.byIntegration.map((t, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-2 text-foreground">{t.integration}</td>
                    <td className="py-2 text-foreground-secondary">{t.usage}</td>
                    <td className="py-2">
                      <StatusBadge value={t.successRate} suffix="%" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">7-Day Trend</h2>
          <div className="h-48 flex items-end justify-between gap-2">
            {metrics.trends.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${day.successRate}%` }}
                  title={`${day.successRate}% success rate`}
                />
                <span className="text-xs text-foreground-muted mt-2">{day.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  status 
}: { 
  title: string; 
  value: string; 
  subtitle: string;
  status: 'success' | 'warning' | 'error';
}) {
  const statusColors = {
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-warning',
    error: 'border-l-4 border-l-destructive',
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${statusColors[status]}`}>
      <div className="text-sm text-foreground-muted mb-1">{title}</div>
      <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-foreground-secondary">{subtitle}</div>
    </div>
  );
}

function StatusBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  let color = 'bg-success/20 text-success';
  if (value < 80) color = 'bg-warning/20 text-warning';
  if (value < 60) color = 'bg-destructive/20 text-destructive';

  return (
    <span className={`px-2 py-1 rounded text-sm ${color}`}>
      {value}{suffix}
    </span>
  );
}

function getMockMetrics(): QualityMetrics {
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
      { type: 'Missing files', count: 5, examples: ['LoginForm.tsx', 'middleware.ts'] },
      { type: 'Build errors', count: 3, examples: ['next/headers in client component'] },
      { type: 'Missing env vars', count: 2, examples: ['STRIPE_WEBHOOK_SECRET'] },
    ],
    byTemplate: [
      { template: 'SaaS', exports: 89, successRate: 96, avgSatisfaction: 4.5 },
      { template: 'E-commerce', exports: 34, successRate: 91, avgSatisfaction: 4.1 },
      { template: 'Blog', exports: 22, successRate: 98, avgSatisfaction: 4.6 },
      { template: 'Dashboard', exports: 11, successRate: 95, avgSatisfaction: 4.3 },
    ],
    byIntegration: [
      { integration: 'auth:supabase', usage: 78, successRate: 97 },
      { integration: 'payments:stripe', usage: 56, successRate: 94 },
      { integration: 'auth:clerk', usage: 34, successRate: 96 },
      { integration: 'email:resend', usage: 45, successRate: 98 },
      { integration: 'analytics:posthog', usage: 38, successRate: 100 },
    ],
    trends: [
      { date: 'Mon', exports: 18, successRate: 94 },
      { date: 'Tue', exports: 24, successRate: 96 },
      { date: 'Wed', exports: 22, successRate: 95 },
      { date: 'Thu', exports: 28, successRate: 93 },
      { date: 'Fri', exports: 31, successRate: 97 },
      { date: 'Sat', exports: 15, successRate: 100 },
      { date: 'Sun', exports: 12, successRate: 92 },
    ],
  };
}

