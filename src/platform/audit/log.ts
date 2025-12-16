import fs from "node:fs";
import path from "node:path";

export type AuditRow = {
  ts: string;
  orgId?: string;
  actorId?: string;
  action: string;
  target?: string;
  meta?: Record<string, unknown>;
};

const DEFAULT_PATH = path.resolve("logs/audit.log.jsonl");

export function appendAudit(row: AuditRow, filePath = DEFAULT_PATH) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(row) + "\n", "utf8");
}

export function tailAudit(limit = 50, filePath = DEFAULT_PATH): AuditRow[] {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean);
  const slice = lines.slice(Math.max(0, lines.length - limit));
  return slice.map((l) => JSON.parse(l));
}
