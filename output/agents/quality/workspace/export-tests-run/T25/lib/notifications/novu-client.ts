const NOVU_APP_ID = process.env.NEXT_PUBLIC_NOVU_APP_ID;

export function isNovuConfigured(): boolean {
  return !!NOVU_APP_ID;
}

export function getSubscriberHashUrl(subscriberId: string): string {
  return `/api/notifications/subscriber-hash?subscriberId=${subscriberId}`;
}

