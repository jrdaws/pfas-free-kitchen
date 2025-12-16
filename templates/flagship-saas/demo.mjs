import { can, enforceBudget } from "../../src/platform/entitlements/can.ts";
import { appendAudit } from "../../src/platform/audit/log.ts";

const projectDir = process.cwd();

const r = await can("figma.parse", { projectDir, orgId: "org_demo", actorId: "user_demo" });
appendAudit({ ts: new Date().toISOString(), orgId: "org_demo", actorId: "user_demo", action: "demo.can", meta: r });

try {
  enforceBudget("org_demo", { meter: "ai.tokens", monthlyCap: 1000 }, 50);
  console.log("Budget OK");
} catch (e) {
  console.error("Budget blocked:", e.message);
}
