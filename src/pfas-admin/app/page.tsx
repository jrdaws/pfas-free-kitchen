import {
  fetchQueueStats,
  fetchReportStats,
  fetchCoverageStats,
  fetchRecentActivity,
} from '@/lib/api';
import { MetricCard, ActivityFeed, TierChart, SLAStatus } from '@/components/dashboard';
import styles from './page.module.css';

export default async function DashboardPage() {
  const [queueStats, reportStats, coverage, activity] = await Promise.all([
    fetchQueueStats(),
    fetchReportStats(),
    fetchCoverageStats(),
    fetchRecentActivity(),
  ]);

  return (
    <div className={styles.page}>
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </header>

      {/* Metrics Row */}
      <div className={styles.metricsRow}>
        <MetricCard
          title="Review Queue"
          value={queueStats.pending}
          change={queueStats.todayChange}
          link="/queue"
        />
        <MetricCard
          title="Open Reports"
          value={reportStats.open}
          subtitle={`${reportStats.highPriority} high-priority`}
          link="/reports"
        />
        <MetricCard
          title="Published"
          value={coverage.published}
          change={coverage.weekChange}
        />
        <MetricCard
          title="Tier 1+ Coverage"
          value={`${coverage.tier1Plus}%`}
          target="80%"
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        <TierChart data={coverage.tierDistribution} />
        <SLAStatus data={reportStats.slaStatus} />
      </div>

      {/* Activity Feed */}
      <ActivityFeed items={activity} />
    </div>
  );
}
