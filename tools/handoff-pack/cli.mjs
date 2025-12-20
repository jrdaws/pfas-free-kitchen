#!/usr/bin/env node
import path from "node:path";
import { buildPack } from "./lib/io.mjs";
import { verifyZip } from "./lib/verify.mjs";

function parseArgs(argv) {
  const out = { platform: null, verify: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const v = argv[i + 1];
    if (a === "--chat") out.chat = v, i++;
    else if (a === "--repo") out.repo = v, i++;
    else if (a === "--out") out.out = v, i++;
    else if (a === "--platform") out.platform = v, i++;
    else if (a === "--verify") out.verify = true;
  }
  if (!out.chat || !out.repo || !out.out) {
    console.error("Usage: node tools/handoff-pack/cli.mjs --chat <file> --repo <path> --out <zip> [--platform <file>] [--verify]");
    process.exit(2);
  }
  return out;
}

const args = parseArgs(process.argv);

await buildPack({
  chatPath: path.resolve(args.chat),
  repoPath: path.resolve(args.repo),
  platformExportPath: args.platform ? path.resolve(args.platform) : null,
  outZipPath: path.resolve(args.out),
});

if (args.verify) {
  const ok = await verifyZip(path.resolve(args.out));
  process.exit(ok ? 0 : 1);
}
