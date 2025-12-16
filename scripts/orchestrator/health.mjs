import { healthAll } from "../../src/platform/providers/index.ts";

const r = await healthAll();
console.log(JSON.stringify(r, null, 2));
process.exit(r.ok ? 0 : 1);
