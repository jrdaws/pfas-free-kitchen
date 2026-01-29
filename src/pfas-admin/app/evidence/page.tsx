import Link from 'next/link';
import { fetchEvidence } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import styles from './evidence.module.css';

export default async function EvidencePage() {
  const evidence = await fetchEvidence();

  return (
    <div className={styles.page}>
      <header className="page-header">
        <h1 className="page-title">Evidence Library</h1>
        <Link href="/evidence/upload" className="btn btn-primary">
          + Upload Evidence
        </Link>
      </header>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Linked Products</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <div className={styles.evidenceCell}>
                    <span className={styles.filename}>{ev.title}</span>
                    <code className={styles.hash}>{ev.sha256Hash.slice(0, 12)}...</code>
                  </div>
                </td>
                <td>
                  <span className="badge badge-neutral">
                    {ev.type.replace('_', ' ')}
                  </span>
                </td>
                <td>{ev.linkedProductIds.length} products</td>
                <td>{ev.uploadedBy}</td>
                <td>
                  {formatDistanceToNow(new Date(ev.uploadedAt), { addSuffix: true })}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className="btn btn-ghost">View</button>
                    <button className="btn btn-ghost">Link</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Evidence Library',
};
