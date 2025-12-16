import { can } from "../../src/platform/entitlements/can.ts";

const projectDir = process.argv[2] || ".";
const ids = (process.argv[3] || "core.scaffold,seo.programmatic,figma.parse,cost.logging").split(",");

for (const id of ids) {
  const r = await can(id.trim(), { projectDir });
  console.log(`${id.trim()}: ${r.ok ? "OK" : "DENY"}${r.reason ? " (" + r.reason + ")" : ""}`);
}
