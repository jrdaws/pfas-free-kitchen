import fs from "node:fs";
import path from "node:path";
import { ProviderHealth } from "./types";

export type ProviderKind = "auth" | "billing" | "analytics" | "llm" | "webhooks";

export type ProviderModule = {
  name: string;
  health: () => Promise<ProviderHealth>;
};

const IMPL_DIR = path.resolve(process.cwd(), "src/platform/providers/impl");

export function listProviderImplFiles(): string[] {
  if (!fs.existsSync(IMPL_DIR)) return [];
  return fs.readdirSync(IMPL_DIR)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .map((f) => path.join(IMPL_DIR, f));
}

export async function loadProviders(): Promise<Record<string, ProviderModule>> {
  const files = listProviderImplFiles();
  const out: Record<string, ProviderModule> = {};
  for (const f of files) {
    const mod: any = await import(pathToFileUrl(f));
    const p: ProviderModule = mod.default || mod.provider;
    if (p?.name) out[p.name] = p;
  }
  return out;
}

export async function healthAll(): Promise<{ ok: boolean; results: Record<string, ProviderHealth> }> {
  const providers = await loadProviders();
  const results: Record<string, ProviderHealth> = {};
  let ok = true;

  for (const [name, p] of Object.entries(providers)) {
    try {
      const h = await p.health();
      results[name] = h;
      if (h.status !== "ok") ok = false;
    } catch (e: any) {
      ok = false;
      results[name] = { status: "error", details: e?.message || String(e) };
    }
  }

  return { ok, results };
}

function pathToFileUrl(p: string) {
  const u = new URL("file://");
  u.pathname = p;
  return u.toString();
}
