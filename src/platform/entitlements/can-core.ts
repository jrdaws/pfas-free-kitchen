export type Plan = "free" | "pro" | "team";

export type Capability = {
  id: string;
  tier?: Plan;
  enabled?: boolean;          // from capability-engine
  optional?: boolean;
  requiresEnv?: string[];
};

export type CanContext = {
  plan?: Plan;
  flags?: Record<string, boolean>; // per-project overrides
};

export type CanResult = { ok: boolean; reason?: string };

const tierRank: Record<Plan, number> = { free: 0, pro: 1, team: 2 };

export function canCore(cap: Capability | undefined, ctx: CanContext = {}): CanResult {
  if (!cap) return { ok: false, reason: "unknown_capability" };

  // project override wins
  if (ctx.flags && typeof ctx.flags[cap.id] === "boolean") {
    return ctx.flags[cap.id] ? { ok: true } : { ok: false, reason: "disabled_by_override" };
  }

  if (cap.enabled === false) return { ok: false, reason: "disabled_or_missing_env" };

  const plan: Plan = ctx.plan ?? "free";
  const required: Plan = cap.tier ?? "free";
  if (tierRank[plan] < tierRank[required]) return { ok: false, reason: `requires_${required}` };

  return { ok: true };
}
