import crypto from "node:crypto";
import fs from "node:fs";

export function sha256Bytes(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function sha256String(s) {
  return sha256Bytes(Buffer.from(s, "utf8"));
}

export function sha256File(p) {
  const b = fs.readFileSync(p);
  return sha256Bytes(b);
}
