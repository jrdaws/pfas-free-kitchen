import { fetchRecentActivity } from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import styles from './audit.module.css';

export default async function AuditPage() {
  const activity = await fetchRecentActivity(50);

  return (
    <div className={styles.page}>
      <header className="page-header">
        <h1 className="page-title">Audit Log</h1>
        <div className={styles.filters}>
          <select defaultValue="all">
            <option value="all">All Actions</option>
            <option value="product_published">Product Published</option>
            <option value="product_rejected">Product Rejected</option>
            <option value="evidence_uploaded">Evidence Uploaded</option>
            <option value="report_resolved">Report Resolved</option>
          </select>
          <input type="date" />
          <input type="date" />
        </div>
      </header>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className={styles.timestamp}>
                    <span className={styles.date}>
                      {format(new Date(item.timestamp), 'MMM d, yyyy')}
                    </span>
                    <span className={styles.time}>
                      {format(new Date(item.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${getActionBadge(item.type)}`}>
                    {item.type.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>{item.actorName}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getActionBadge(type: string): string {
  switch (type) {
    case 'product_published': return 'badge-success';
    case 'product_rejected': return 'badge-error';
    case 'evidence_uploaded': return 'badge-info';
    case 'report_resolved': return 'badge-warning';
    default: return 'badge-neutral';
  }
}

export const metadata = {
  title: 'Audit Log',
};
