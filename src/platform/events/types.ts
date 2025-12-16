export type CapabilityId = string;

export type UsageEvent = {
  kind: "usage";
  units: number;
  meter: string;
};

export type AuditEvent = {
  kind: "audit";
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
};

export type DenyEvent = {
  kind: "deny";
  capability: CapabilityId;
  reason: string;
  context?: Record<string, unknown>;
};

export type DomainEventPayload = UsageEvent | AuditEvent | DenyEvent;
