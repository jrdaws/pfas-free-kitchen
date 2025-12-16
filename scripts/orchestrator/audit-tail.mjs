import { tailAudit } from "../../src/platform/audit/log.ts";

const n = Number(process.argv[2] || "50");
const rows = tailAudit(n);
console.log(JSON.stringify(rows, null, 2));
