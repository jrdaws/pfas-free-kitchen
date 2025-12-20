/**
 * Drift detection - compare current state vs template manifest
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { listTemplateFiles } from "./manifest.mjs";

/**
 * Calculate SHA256 hash of file
 */
function sha256File(filepath) {
  const content = fs.readFileSync(filepath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Detect drift between current project state and template manifest
 * @param {string} projectDir - Project directory path
 * @returns {{ hasDrift: boolean, added: string[], modified: string[], deleted: string[], unchanged: number, error?: string }}
 */
export function detectDrift(projectDir) {
  const manifestPath = path.join(projectDir, ".dd/template-manifest.json");

  // Check if manifest exists
  if (!fs.existsSync(manifestPath)) {
    return {
      hasDrift: false,
      added: [],
      modified: [],
      deleted: [],
      unchanged: 0,
      error: "No template manifest found (.dd/template-manifest.json). This project may not have been exported from the framework.",
    };
  }

  // Load manifest
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch (err) {
    return {
      hasDrift: false,
      added: [],
      modified: [],
      deleted: [],
      unchanged: 0,
      error: `Failed to parse template manifest: ${err.message}`,
    };
  }

  if (!manifest.files || !Array.isArray(manifest.files)) {
    return {
      hasDrift: false,
      added: [],
      modified: [],
      deleted: [],
      unchanged: 0,
      error: "Invalid manifest format: missing 'files' array",
    };
  }

  // Build map of manifest files: path -> sha256
  const manifestFiles = new Map();
  for (const file of manifest.files) {
    manifestFiles.set(file.path, file.sha256);
  }

  // Get current files (normalize paths to forward slashes for cross-platform consistency)
  const currentFilesAbs = listTemplateFiles(projectDir);
  const currentFiles = currentFilesAbs.map((abs) => 
    path.relative(projectDir, abs).replaceAll("\\", "/")
  );

  // Detect changes
  const added = [];
  const modified = [];
  const deleted = [];
  let unchanged = 0;

  // Check current files against manifest
  for (const filePath of currentFiles) {
    const absPath = path.join(projectDir, filePath);

    if (!manifestFiles.has(filePath)) {
      // File exists now but wasn't in manifest
      added.push(filePath);
    } else {
      // File was in manifest, check if modified
      const currentHash = sha256File(absPath);
      const manifestHash = manifestFiles.get(filePath);

      if (currentHash !== manifestHash) {
        modified.push(filePath);
      } else {
        unchanged++;
      }

      // Mark as seen
      manifestFiles.delete(filePath);
    }
  }

  // Remaining manifest files are deleted
  for (const filePath of manifestFiles.keys()) {
    deleted.push(filePath);
  }

  const hasDrift = added.length > 0 || modified.length > 0 || deleted.length > 0;

  return {
    hasDrift,
    added: added.sort(),
    modified: modified.sort(),
    deleted: deleted.sort(),
    unchanged,
  };
}
