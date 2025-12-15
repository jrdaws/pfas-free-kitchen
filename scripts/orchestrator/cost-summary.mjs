import { summarizeUsage } from "./cost.mjs";

const s = summarizeUsage();
console.log(`Rows: ${s.rows}`);
console.log(`Total cost (USD): ${s.totalCostUsd.toFixed(4)}`);
