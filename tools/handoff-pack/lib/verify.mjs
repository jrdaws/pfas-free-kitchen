import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { sha256String } from "./hash.mjs";
import { extractContentByIndex } from "./chat_index_write.mjs";

function mustExist(p) {
  if (!fs.existsSync(p)) throw new Error(`MISSING: ${p}`);
}

export async function verifyZip(zipPath) {
  try {
    mustExist(zipPath);

    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "handoff-verify-"));
    execFileSync("unzip", ["-q", zipPath, "-d", tmp], { stdio: "inherit" });

    // Required files
    const chatRaw = path.join(tmp, "chat", "0001_chat_raw.md");
    const chatIdx = path.join(tmp, "chat", "0002_chat_index.json");
    const readme = path.join(tmp, "README.md");
    mustExist(chatRaw);
    mustExist(chatIdx);
    mustExist(readme);

    const rawText = fs.readFileSync(chatRaw, "utf8");
    const idx = JSON.parse(fs.readFileSync(chatIdx, "utf8"));

    if (!idx.messages || !Array.isArray(idx.messages)) throw new Error("chat_index invalid: missing messages[]");

    for (const m of idx.messages) {
      const content = extractContentByIndex(rawText, m);
      const got = sha256String(content);
      if (got !== m.sha256) throw new Error(`SHA MISMATCH message ${m.id}: expected ${m.sha256} got ${got}`);
    }

    console.log("PASS: verifyZip");
    return true;
  } catch (e) {
    console.error("FAIL: verifyZip");
    console.error(String(e?.stack || e));
    return false;
  }
}
