/**
 * Version management utilities
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..", "..");

/**
 * Get current framework version from package.json
 */
export function getCurrentVersion() {
  const pkgPath = path.join(PKG_ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return pkg.version;
}

/**
 * Get package name
 */
export function getPackageName() {
  const pkgPath = path.join(PKG_ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return pkg.name;
}

/**
 * Check for available updates from npm registry
 */
export async function checkForUpdates() {
  const packageName = getPackageName();
  const currentVersion = getCurrentVersion();

  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);

    if (!response.ok) {
      return {
        hasUpdate: false,
        current: currentVersion,
        latest: currentVersion,
        error: `Failed to check for updates: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const latestVersion = data.version;

    return {
      hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
      current: currentVersion,
      latest: latestVersion,
      packageName,
    };
  } catch (error) {
    return {
      hasUpdate: false,
      current: currentVersion,
      latest: currentVersion,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Compare two semver versions
 * Returns: 1 if a > b, -1 if a < b, 0 if equal
 */
export function compareVersions(a, b) {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;

    if (aVal > bVal) return 1;
    if (aVal < bVal) return -1;
  }

  return 0;
}

/**
 * Get upgrade command based on package manager
 */
export function getUpgradeCommand(packageName) {
  // Check which package manager is available
  const packageManagers = [
    { name: "npm", command: `npm install -g ${packageName}@latest` },
    { name: "yarn", command: `yarn global add ${packageName}@latest` },
    { name: "pnpm", command: `pnpm add -g ${packageName}@latest` },
  ];

  // Default to npm
  return packageManagers[0].command;
}
