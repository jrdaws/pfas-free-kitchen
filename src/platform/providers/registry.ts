import type { ProviderHealth } from "./types";

export type ProviderRef = {
  id: string;
  kind: "auth" | "billing" | "analytics" | "llm" | "webhooks";
  modulePath: string; // dynamic import path
};

export const providers: ProviderRef[] = [
  // keep empty for now - valid
];

export async function runHealthChecks() {
  const results: { id: string; kind: string; ok: boolean; detail?: unknown }[] = [];
  for (const p of providers) {
    try {
      const mod: any = await import(p.modulePath);
      const inst = await (mod.default?.() ?? mod.getProvider?.() ?? mod.provider);
      const h: ProviderHealth = await inst.health();
      results.push({ id: p.id, kind: p.kind, ok: h.ok, detail: h.detail });
    } catch (e: any) {
      results.push({ id: p.id, kind: p.kind, ok: false, detail: String(e?.message ?? e) });
    }
  }
  return results;
}
