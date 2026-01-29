'use client';

import { useState, useEffect } from 'react';
import styles from './AnnouncementBar.module.css';

const STORAGE_KEY = 'pfas-announcement-dismissed';

interface AnnouncementBarProps {
  message?: string;
  showBadge?: boolean;
  badgeText?: string;
}

export function AnnouncementBar({
  message = 'Verified PFAS-Free Products • Independent Lab Testing • No Sponsored Rankings',
  showBadge = true,
  badgeText = 'Trusted',
}: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check localStorage after mount
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
      // Small delay for smooth animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }, 300);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div 
      className={`${styles.bar} ${isVisible ? styles.visible : ''}`}
      role="banner"
      aria-label="Site announcement"
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {showBadge && (
            <span className={styles.badge}>
              <svg 
                className={styles.badgeIcon} 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" 
                  clipRule="evenodd" 
                />
              </svg>
              {badgeText}
            </span>
          )}
          <span className={styles.message}>{message}</span>
        </div>
        
        <button
          className={styles.dismissButton}
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          type="button"
        >
          <svg 
            className={styles.dismissIcon} 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AnnouncementBar;
