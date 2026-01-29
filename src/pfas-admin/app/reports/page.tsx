import Link from 'next/link';
import { fetchReports, fetchReportStats } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import styles from './reports.module.css';

export default async function ReportsPage() {
  const [{ items }, stats] = await Promise.all([
    fetchReports(),
    fetchReportStats(),
  ]);

  return (
    <div className={styles.page}>
      <header className="page-header">
        <h1 className="page-title">Reports</h1>
        <div className={styles.stats}>
          <span className={`badge badge-error`}>{stats.highPriority} high priority</span>
          <span className={`badge badge-warning`}>{stats.slaStatus.atRisk} at risk</span>
          <span className={`badge badge-success`}>{stats.resolvedToday} resolved today</span>
        </div>
      </header>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Issue Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>SLA</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((report) => {
              const slaRemaining = new Date(report.slaDeadline).getTime() - Date.now();
              const slaHours = Math.round(slaRemaining / (1000 * 60 * 60));
              const slaStatus = slaHours < 0 ? 'breached' : slaHours < 24 ? 'at-risk' : 'ok';

              return (
                <tr key={report.id}>
                  <td>
                    <Link href={`/reports/${report.id}`} className={styles.productLink}>
                      {report.productName}
                    </Link>
                  </td>
                  <td>
                    <span className={styles.issueType}>
                      {report.issueType.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${getPriorityBadge(report.priority)}`}>
                      {report.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${getStatusBadge(report.status)}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.sla} ${styles[slaStatus]}`}>
                      {slaHours < 0 ? `${Math.abs(slaHours)}h overdue` : `${slaHours}h left`}
                    </span>
                  </td>
                  <td>
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </td>
                  <td>
                    <Link href={`/reports/${report.id}`} className="btn btn-primary">
                      Review
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getPriorityBadge(priority: string): string {
  switch (priority) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'normal': return 'info';
    default: return 'neutral';
  }
}

function getStatusBadge(status: string): string {
  switch (status) {
    case 'resolved': return 'success';
    case 'dismissed': return 'neutral';
    case 'under_review': return 'info';
    case 'awaiting_info': return 'warning';
    default: return 'neutral';
  }
}

export const metadata = {
  title: 'Reports',
};
