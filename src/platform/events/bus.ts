export type EventEnvelope<TType extends string = string, TPayload = unknown> = {
  id: string;
  type: TType;
  ts: string;
  orgId?: string;
  actorId?: string;
  payload: TPayload;
};

export type EventHandler<T extends EventEnvelope = EventEnvelope> = (e: T) => void | Promise<void>;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on(type: string, handler: EventHandler) {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler);
    this.handlers.set(type, set);
    return () => set.delete(handler);
  }

  async emit<T extends EventEnvelope>(event: T) {
    const set = this.handlers.get(event.type);
    if (!set || set.size === 0) return;
    await Promise.allSettled([...set].map((h) => h(event)));
  }
}

export const bus = new EventBus();
