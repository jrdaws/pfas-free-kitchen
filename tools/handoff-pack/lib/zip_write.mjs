import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function writeZipFromDir(srcDir, outZipPath) {
  fs.mkdirSync(path.dirname(outZipPath), { recursive: true });
  if (fs.existsSync(outZipPath)) fs.rmSync(outZipPath, { force: true });

  // -X strips extra file attrs for more deterministic output
  // -r recurse, -q quiet
  execFileSync("zip", ["-X", "-r", "-q", outZipPath, "."], { cwd: srcDir, stdio: "inherit" });
}
