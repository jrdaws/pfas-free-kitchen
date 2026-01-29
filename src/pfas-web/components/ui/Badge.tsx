import { type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'tier';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  bgColor?: string;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  color,
  bgColor,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(styles.badge, styles[variant], styles[size], className)}
      style={{
        ...(color && { color }),
        ...(bgColor && { backgroundColor: bgColor }),
      }}
    >
      {children}
    </span>
  );
}
