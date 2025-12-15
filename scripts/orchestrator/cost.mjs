import fs from "node:fs";
import path from "node:path";

const LOG_PATH = path.resolve("logs/agent-usage.jsonl");

export function logAgentUsage({
  agent,
  provider,
  model,
  inputTokens = null,
  outputTokens = null,
  costUsd = null,
  metadata = {},
}) {
  const row = {
    ts: new Date().toISOString(),
    agent,
    provider,
    model,
    inputTokens,
    outputTokens,
    costUsd,
    metadata,
  };

  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.appendFileSync(LOG_PATH, JSON.stringify(row) + "\n", "utf8");
}

export function summarizeUsage() {
  if (!fs.existsSync(LOG_PATH)) return { totalCostUsd: 0, rows: 0 };

  const lines = fs.readFileSync(LOG_PATH, "utf8").trim().split("\n").filter(Boolean);
  let total = 0;
  for (const line of lines) {
    try {
      const r = JSON.parse(line);
      if (typeof r.costUsd === "number") total += r.costUsd;
    } catch {}
  }
  return { totalCostUsd: total, rows: lines.length };
}
