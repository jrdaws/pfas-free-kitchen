export type RealtimePayload = Record<string, unknown>;

export interface RealtimeProvider {
  publish(channel: string, event: string, payload: RealtimePayload): Promise<void>;
  // Subscribe should return an unsubscribe function
  subscribe(channel: string, handler: (event: string, payload: RealtimePayload) => void): Promise<() => void>;
}
