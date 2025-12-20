// src/dd/manifest.mjs
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Return an array of absolute file paths under rootDir, recursively,
 * skipping: .git, node_modules, .next, .dd
 */
export function listTemplateFiles(rootDir) {
  const skipNames = new Set([".git", "node_modules", ".next", ".dd"]);
  const out = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (skipNames.has(e.name)) continue;
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) walk(abs);
      else if (e.isFile()) out.push(abs);
    }
  }

  walk(rootDir);
  out.sort(); // stable ordering
  return out;
}

/**
 * sha256 of a file (hex)
 */
export function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Write .dd/template-manifest.json into outDir.
 * data is expected to include templateId, flags, resolved (and anything else).
 */
export function writeManifest(outDir, data) {
  const ddDir = path.join(outDir, ".dd");
  fs.mkdirSync(ddDir, { recursive: true });

  const filesAbs = listTemplateFiles(outDir);

  const files = filesAbs.map((abs) => ({
    path: path.relative(outDir, abs).replaceAll("\\", "/"),
    sha256: sha256File(abs),
  }));

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    templateId: data?.templateId ?? null,
    templateSource: data?.flags?.templateSource ?? null,
    frameworkVersion: data?.flags?.frameworkVersion ?? null,
    resolvedRef: data?.resolved?.localPath ?? data?.resolved?.remoteRef ?? null,
    files,
  };

  const outPath = path.join(ddDir, "template-manifest.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return outPath;
}
