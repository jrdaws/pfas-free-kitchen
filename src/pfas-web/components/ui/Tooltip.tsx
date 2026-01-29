'use client';

import { type ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  disabled?: boolean;
  delayDuration?: number;
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  disabled = false,
  delayDuration = 300,
}: TooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={styles.content}
            side={side}
            align={align}
            sideOffset={5}
          >
            {content}
            <TooltipPrimitive.Arrow className={styles.arrow} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
