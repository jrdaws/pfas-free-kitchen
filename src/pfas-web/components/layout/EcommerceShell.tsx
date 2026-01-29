'use client';

import { AnnouncementBar } from './AnnouncementBar';
import { EcommerceHeader } from './EcommerceHeader';
import { EcommerceFooter } from './EcommerceFooter';
import { CompareTray } from '@/components/compare';
import styles from './EcommerceShell.module.css';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface EcommerceShellProps {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  breadcrumbs?: Breadcrumb[];
  showAnnouncement?: boolean;
}

export function EcommerceShell({
  children,
  showBreadcrumbs = false,
  breadcrumbs = [],
  showAnnouncement = true,
}: EcommerceShellProps) {
  return (
    <div className={styles.shell}>
      {/* Skip link for accessibility */}
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      {/* Announcement bar */}
      {showAnnouncement && <AnnouncementBar />}

      {/* Header with navigation */}
      <EcommerceHeader />

      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 0 && (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <div className={styles.breadcrumbsInner}>
            <ol className={styles.breadcrumbList}>
              <li>
                <a href="/" className={styles.breadcrumbLink}>
                  Home
                </a>
              </li>
              {breadcrumbs.map((crumb, index) => (
                <li key={index}>
                  <span className={styles.breadcrumbSeparator} aria-hidden="true">
                    /
                  </span>
                  {crumb.href ? (
                    <a href={crumb.href} className={styles.breadcrumbLink}>
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={styles.breadcrumbCurrent} aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {/* Main content */}
      <main id="main-content" className={styles.main}>
        {children}
      </main>

      {/* Footer */}
      <EcommerceFooter />

      {/* Compare Tray - floating at bottom */}
      <CompareTray />
    </div>
  );
}

export default EcommerceShell;
