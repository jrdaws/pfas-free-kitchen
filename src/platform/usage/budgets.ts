import fs from "node:fs";
import path from "node:path";

export type Budget = {
  meter: string;
  monthlyCap: number;
};

export type UsageRow = {
  ts: string;
  orgId: string;
  meter: string;
  units: number;
  meta?: Record<string, unknown>;
};

const DEFAULT_USAGE_PATH = path.resolve("logs/usage.log.jsonl");

export function appendUsage(row: UsageRow, filePath = DEFAULT_USAGE_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(row) + "\n", "utf8");
}

export function monthKey(d = new Date()) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function sumMonthUsage(orgId: string, meter: string, filePath = DEFAULT_USAGE_PATH) {
  if (!fs.existsSync(filePath)) return 0;
  const key = monthKey();
  const lines = fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean);
  let total = 0;
  for (const l of lines) {
    try {
      const r = JSON.parse(l) as UsageRow;
      if (r.orgId !== orgId) continue;
      if (r.meter !== meter) continue;
      if (!r.ts.startsWith(key)) continue;
      total += r.units;
    } catch {}
  }
  return total;
}

export function wouldExceed(orgId: string, budget: Budget, deltaUnits: number, filePath = DEFAULT_USAGE_PATH) {
  const used = sumMonthUsage(orgId, budget.meter, filePath);
  return used + deltaUnits > budget.monthlyCap;
}
