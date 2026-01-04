/**
 * Novu Client-Side Utilities
 * 
 * Helpers for the browser-side notification center.
 */

const NOVU_APP_ID = process.env.NEXT_PUBLIC_NOVU_APP_ID;

/**
 * Get subscriber hash for secure frontend identification
 * This should be called server-side and passed to the client
 */
export function getSubscriberHashUrl(subscriberId: string): string {
  return `/api/notifications/subscriber-hash?subscriberId=${subscriberId}`;
}

/**
 * Notification Center configuration
 */
export interface NotificationCenterConfig {
  subscriberId: string;
  subscriberHash?: string;
  onNotificationClick?: (notification: unknown) => void;
  onUnseenCountChanged?: (count: number) => void;
}

/**
 * Default notification center configuration
 */
export function getDefaultConfig(subscriberId: string): NotificationCenterConfig {
  return {
    subscriberId,
    onNotificationClick: (notification: unknown) => {
      console.log("Notification clicked:", notification);
    },
    onUnseenCountChanged: (count: number) => {
      console.log("Unseen count changed:", count);
    },
  };
}

/**
 * Check if Novu is configured
 */
export function isNovuConfigured(): boolean {
  return !!NOVU_APP_ID;
}

