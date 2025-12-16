import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";

export function resolveProjectDir(arg) {
  return path.resolve(arg || ".");
}

export async function loadProjectConfig(projectDir) {
  const p = path.join(projectDir, ".dd", "config.json");
  if (!fs.existsSync(p)) return { plan: "free", featureOverrides: {}, integrations: {} };
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return { plan: "free", featureOverrides: {}, integrations: {} };
  }
}

export async function saveProjectConfig(projectDir, cfg) {
  const p = path.join(projectDir, ".dd", "config.json");
  await fse.ensureDir(path.dirname(p));
  await fse.writeFile(p, JSON.stringify(cfg, null, 2), "utf8");
  return p;
}
