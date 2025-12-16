import type { Capability, CanContext, CanResult } from "./can-core";
import { canCore } from "./can-core";

export { canCore };
export type { Capability, CanContext, CanResult };

// Runtime wrapper (keep async signature in case you later load caps from disk/db)
export async function can(capabilityId: string, ctx: CanContext & { caps?: Capability[] } = {}): Promise<CanResult> {
  const caps = ctx.caps || [];
  const cap = caps.find(c => c.id === capabilityId);
  return canCore(cap, ctx);
}

export async function enforce(capabilityId: string, ctx: CanContext & { caps?: Capability[] } = {}) {
  const r = await can(capabilityId, ctx);
  if (!r.ok) throw new Error(`Capability denied: ${capabilityId} (${r.reason})`);
}
