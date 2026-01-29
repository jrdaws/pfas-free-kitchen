'use client';

import { useEffect, useState } from 'react';
import { useToast, type Toast as ToastType, type ToastType as ToastVariant } from '@/contexts/ToastContext';
import { SuccessIcon, ErrorIcon, WarningIcon, InfoIcon, CloseIcon } from '@/components/icons';
import styles from './Toast.module.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className={styles.container} role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: ToastType;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  };

  // Handle keyboard dismiss
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      handleDismiss();
    }
  };

  const Icon = getIcon(toast.type);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.icon}>
        <Icon size={18} />
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.closeButton}
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}

function getIcon(type: ToastVariant) {
  switch (type) {
    case 'success':
      return SuccessIcon;
    case 'error':
      return ErrorIcon;
    case 'warning':
      return WarningIcon;
    case 'info':
    default:
      return InfoIcon;
  }
}

// Standalone toast component for direct use
interface ToastProps {
  type: ToastVariant;
  message: string;
  onDismiss?: () => void;
}

export function Toast({ type, message, onDismiss }: ToastProps) {
  const Icon = getIcon(type);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>
        <Icon size={18} />
      </span>
      <span className={styles.message}>{message}</span>
      {onDismiss && (
        <button
          className={styles.closeButton}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}
