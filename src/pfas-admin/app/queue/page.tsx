import Link from 'next/link';
import { fetchQueue, fetchQueueStats } from '@/lib/api';
import type { QueueFilters, QueueItem } from '@/lib/types';
import styles from './queue.module.css';

interface QueuePageProps {
  searchParams: Record<string, string>;
}

export default async function QueuePage({ searchParams }: QueuePageProps) {
  const filters: QueueFilters = {
    lane: (searchParams.lane as QueueFilters['lane']) || 'all',
    status: (searchParams.status as QueueFilters['status']) || 'pending',
    assigned: (searchParams.assigned as QueueFilters['assigned']) || 'all',
    page: parseInt(searchParams.page || '1', 10),
    limit: 20,
  };

  const [{ items, total }, stats] = await Promise.all([
    fetchQueue(filters),
    fetchQueueStats(),
  ]);

  return (
    <div className={styles.page}>
      <header className="page-header">
        <h1 className="page-title">Review Queue</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{stats.pending}</strong> pending
          </span>
          <span className={styles.stat}>
            <strong>{stats.highRisk}</strong> high-risk
          </span>
          <span className={styles.stat}>
            Avg. review: <strong>{stats.avgReviewTime}h</strong>
          </span>
        </div>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <FilterSelect
          label="Lane"
          value={filters.lane}
          options={[
            { value: 'all', label: 'All Lanes' },
            { value: 'standard', label: 'Standard' },
            { value: 'high_risk', label: 'High Risk' },
          ]}
          param="lane"
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'under_review', label: 'Under Review' },
          ]}
          param="status"
        />
        <FilterSelect
          label="Assigned"
          value={filters.assigned}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unassigned', label: 'Unassigned' },
            { value: 'mine', label: 'Assigned to Me' },
          ]}
          param="assigned"
        />
      </div>

      {/* Queue Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Lane</th>
              <th>Risk</th>
              <th>Age</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span>Showing {items.length} of {total}</span>
      </div>
    </div>
  );
}

function QueueRow({ item }: { item: QueueItem }) {
  const ageHours = Math.round(
    (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60)
  );

  return (
    <tr>
      <td>
        <Link href={`/queue/${item.id}`} className={styles.productLink}>
          {item.productName}
        </Link>
      </td>
      <td>{item.brandName}</td>
      <td>{item.categoryName}</td>
      <td>
        <span className={`badge ${item.lane === 'high_risk' ? 'badge-warning' : 'badge-neutral'}`}>
          {item.lane === 'high_risk' ? 'High Risk' : 'Standard'}
        </span>
      </td>
      <td>
        <RiskIndicator score={item.riskScore} terms={item.riskTerms} />
      </td>
      <td>{ageHours}h</td>
      <td>
        <div className={styles.actions}>
          <Link href={`/queue/${item.id}`} className="btn btn-primary">
            Review
          </Link>
          <button className="btn btn-secondary">Assign</button>
        </div>
      </td>
    </tr>
  );
}

function RiskIndicator({ score, terms }: { score: number; terms: string[] }) {
  let level = 'low';
  let color = 'var(--risk-low)';

  if (score >= 60) {
    level = 'high';
    color = 'var(--risk-high)';
  } else if (score >= 30) {
    level = 'moderate';
    color = 'var(--risk-moderate)';
  }

  return (
    <div className={styles.riskIndicator} title={terms.join(', ')}>
      <span className={styles.riskBar} style={{ width: `${score}%`, background: color }} />
      <span className={styles.riskScore}>{score}</span>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  param,
}: {
  label: string;
  value?: string;
  options: Array<{ value: string; label: string }>;
  param: string;
}) {
  return (
    <div className={styles.filterGroup}>
      <label>{label}</label>
      <select defaultValue={value}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const metadata = {
  title: 'Review Queue',
};
