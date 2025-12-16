import { resolveEnabledCaps } from "../../scripts/orchestrator/capability-engine.mjs";
import { appendAudit } from "../audit/log";
import { wouldExceed, appendUsage, type Budget } from "../usage/budgets";

export type CanContext = {
  projectDir?: string;
  orgId?: string;
  actorId?: string;
  plan?: "free" | "pro" | "team";
};

export type CanResult = {
  ok: boolean;
  reason?: string;
};

export async function can(capabilityId: string, ctx: CanContext = {}): Promise<CanResult> {
  const projectDir = ctx.projectDir || ".";
  const caps = await resolveEnabledCaps(projectDir);
  const cap = caps.find((c: any) => c.id === capabilityId);

  if (!cap) {
    appendAudit({
      ts: new Date().toISOString(),
      orgId: ctx.orgId,
      actorId: ctx.actorId,
      action: "entitlement.deny",
      target: capabilityId,
      meta: { reason: "unknown_capability" }
    });
    return { ok: false, reason: "unknown_capability" };
  }

  if (!cap.enabled) {
    appendAudit({
      ts: new Date().toISOString(),
      orgId: ctx.orgId,
      actorId: ctx.actorId,
      action: "entitlement.deny",
      target: capabilityId,
      meta: { reason: "disabled_or_missing_env", requiresEnv: cap.requiresEnv || [] }
    });
    return { ok: false, reason: "disabled_or_missing_env" };
  }

  return { ok: true };
}

export async function enforce(capabilityId: string, ctx: CanContext = {}) {
  const r = await can(capabilityId, ctx);
  if (!r.ok) throw new Error(`Capability denied: ${capabilityId} (${r.reason})`);
}

export function enforceBudget(orgId: string, budget: Budget, deltaUnits: number) {
  if (wouldExceed(orgId, budget, deltaUnits)) {
    appendAudit({
      ts: new Date().toISOString(),
      orgId,
      action: "budget.deny",
      target: budget.meter,
      meta: { deltaUnits, monthlyCap: budget.monthlyCap }
    });
    throw new Error(`Budget exceeded for meter ${budget.meter}`);
  }
  appendUsage({
    ts: new Date().toISOString(),
    orgId,
    meter: budget.meter,
    units: deltaUnits
  });
}
