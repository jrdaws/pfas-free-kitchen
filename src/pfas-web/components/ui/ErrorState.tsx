/**
 * ErrorState Component
 * 
 * Displays user-friendly error messages with retry options.
 * Used for API errors, not found states, and service unavailability.
 */

import styles from './ErrorState.module.css';
import { Button } from './Button';

export type ErrorType = 
  | 'api-error' 
  | 'not-found' 
  | 'search-unavailable' 
  | 'network-error'
  | 'permission-denied'
  | 'server-error';

interface ErrorStateProps {
  /** Type of error to display */
  type: ErrorType;
  /** Optional callback for retry action */
  onRetry?: () => void;
  /** Optional custom title override */
  title?: string;
  /** Optional custom message override */
  message?: string;
  /** Optional additional action */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface ErrorContent {
  icon: string;
  title: string;
  message: string;
  showRetry: boolean;
}

const ERROR_CONTENT: Record<ErrorType, ErrorContent> = {
  'api-error': {
    icon: '⚠️',
    title: 'Something went wrong',
    message: 'We couldn\'t load the data. Please try again in a moment.',
    showRetry: true,
  },
  'not-found': {
    icon: '🔍',
    title: 'Not found',
    message: 'The page or product you\'re looking for doesn\'t exist or has been removed.',
    showRetry: false,
  },
  'search-unavailable': {
    icon: '🔎',
    title: 'Search unavailable',
    message: 'Search is temporarily unavailable. Try browsing by category instead.',
    showRetry: true,
  },
  'network-error': {
    icon: '📡',
    title: 'Connection issue',
    message: 'Please check your internet connection and try again.',
    showRetry: true,
  },
  'permission-denied': {
    icon: '🔒',
    title: 'Access denied',
    message: 'You don\'t have permission to view this content.',
    showRetry: false,
  },
  'server-error': {
    icon: '🔧',
    title: 'Server error',
    message: 'Our servers are experiencing issues. We\'re working on it.',
    showRetry: true,
  },
};

export function ErrorState({ 
  type, 
  onRetry, 
  title: customTitle, 
  message: customMessage,
  action 
}: ErrorStateProps) {
  const content = ERROR_CONTENT[type];
  const title = customTitle || content.title;
  const message = customMessage || content.message;

  return (
    <div className={styles.container} role="alert" aria-live="polite">
      <div className={styles.iconWrapper}>
        <span className={styles.icon} aria-hidden="true">{content.icon}</span>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        {content.showRetry && onRetry && (
          <Button onClick={onRetry} variant="primary" size="md">
            Try Again
          </Button>
        )}
        {action && (
          action.href ? (
            <a href={action.href} className={styles.actionLink}>
              {action.label}
            </a>
          ) : (
            <Button onClick={action.onClick} variant="secondary" size="md">
              {action.label}
            </Button>
          )
        )}
        {type === 'not-found' && (
          <a href="/" className={styles.actionLink}>
            Go to Homepage
          </a>
        )}
        {type === 'search-unavailable' && (
          <a href="/cookware" className={styles.actionLink}>
            Browse by Category
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error display for smaller contexts
 */
export function InlineError({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className={styles.inlineContainer} role="alert">
      <span className={styles.inlineIcon} aria-hidden="true">⚠️</span>
      <span className={styles.inlineMessage}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className={styles.inlineRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
