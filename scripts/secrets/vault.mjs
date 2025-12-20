import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const PROJECT_ROOT = process.cwd();
const DD_DIR = path.join(PROJECT_ROOT, ".dd");
const FILE_FALLBACK = path.join(DD_DIR, "secrets.json");
const SERVICE = "dawson-does-framework";

function ensureDir() {
  if (!fs.existsSync(DD_DIR)) fs.mkdirSync(DD_DIR, { recursive: true });
}

function keychainAvailable() {
  const r = spawnSync("security", ["-h"], { stdio: "ignore" });
  return r.status === 0;
}

function kcSet(key, value) {
  const r = spawnSync("security", ["add-generic-password", "-a", process.env.USER, "-s", SERVICE, "-w", value, "-U", "-l", key], { stdio: "ignore" });
  return r.status === 0;
}

function kcGet(key) {
  const r = spawnSync("security", ["find-generic-password", "-a", process.env.USER, "-s", SERVICE, "-l", key, "-w"], { encoding: "utf8" });
  if (r.status !== 0) return null;
  return (r.stdout || "").trim();
}

function fileLoad() {
  if (!fs.existsSync(FILE_FALLBACK)) return {};
  return JSON.parse(fs.readFileSync(FILE_FALLBACK, "utf8"));
}

function fileSave(obj) {
  ensureDir();
  fs.writeFileSync(FILE_FALLBACK, JSON.stringify(obj, null, 2));
}

const [cmd, k, v] = process.argv.slice(2);

if (!cmd || !["set", "get", "list"].includes(cmd)) {
  console.log("Usage:");
  console.log("  node scripts/secrets/vault.mjs set KEY VALUE");
  console.log("  node scripts/secrets/vault.mjs get KEY");
  console.log("  node scripts/secrets/vault.mjs list");
  process.exit(1);
}

if (cmd === "list") {
  const obj = fileLoad();
  console.log("Stored keys (file fallback):", Object.keys(obj));
  console.log("Keychain keys are not enumerable via this script.");
  process.exit(0);
}

if (!k) process.exit(1);

if (cmd === "set") {
  if (v == null) process.exit(1);
  if (keychainAvailable()) {
    const ok = kcSet(k, v);
    if (ok) {
      console.log("✅ stored in keychain:", k);
      process.exit(0);
    }
  }
  const obj = fileLoad();
  obj[k] = v;
  fileSave(obj);
  console.log("✅ stored in .dd/secrets.json:", k);
  process.exit(0);
}

if (cmd === "get") {
  if (keychainAvailable()) {
    const got = kcGet(k);
    if (got) {
      console.log(got);
      process.exit(0);
    }
  }
  const obj = fileLoad();
  if (obj[k]) {
    console.log(obj[k]);
    process.exit(0);
  }
  process.exit(2);
}
