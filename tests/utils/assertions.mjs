import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Asserts that a manifest file is valid
 * @param {string} manifestPath - Path to the manifest file
 */
export function assertValidManifest(manifestPath) {
  assert.ok(fs.existsSync(manifestPath), `Manifest file not found: ${manifestPath}`);

  const content = fs.readFileSync(manifestPath, "utf-8");
  let manifest;

  try {
    manifest = JSON.parse(content);
  } catch (err) {
    assert.fail(`Manifest is not valid JSON: ${err.message}`);
  }

  // Check required fields
  assert.ok(manifest.template, "Manifest missing 'template' field");
  assert.ok(manifest.version, "Manifest missing 'version' field");
  assert.ok(Array.isArray(manifest.capabilities), "Manifest 'capabilities' must be an array");

  // Validate capabilities structure
  for (const cap of manifest.capabilities) {
    assert.ok(cap.id, "Capability missing 'id' field");
    assert.ok(cap.type, "Capability missing 'type' field");
  }
}

/**
 * Asserts that a template directory has valid structure
 * @param {string} templatePath - Path to the template directory
 */
export function assertValidTemplate(templatePath) {
  assert.ok(fs.existsSync(templatePath), `Template directory not found: ${templatePath}`);

  // Check for required files
  const packageJsonPath = path.join(templatePath, "package.json");
  assert.ok(fs.existsSync(packageJsonPath), "Template missing package.json");

  // Check for .dd directory
  const ddDir = path.join(templatePath, ".dd");
  assert.ok(fs.existsSync(ddDir), "Template missing .dd directory");

  // Check for manifest
  const manifestPath = path.join(ddDir, "manifest.json");
  assertValidManifest(manifestPath);
}

/**
 * Asserts that a directory contains specific files
 * @param {string} dirPath - Path to the directory
 * @param {string[]} expectedFiles - Array of expected file names
 */
export function assertHasFiles(dirPath, expectedFiles) {
  assert.ok(fs.existsSync(dirPath), `Directory not found: ${dirPath}`);

  for (const file of expectedFiles) {
    const filePath = path.join(dirPath, file);
    assert.ok(fs.existsSync(filePath), `Expected file not found: ${file}`);
  }
}

/**
 * Asserts that a file contains specific content
 * @param {string} filePath - Path to the file
 * @param {string|RegExp} expectedContent - Expected content or pattern
 */
export function assertFileContains(filePath, expectedContent) {
  assert.ok(fs.existsSync(filePath), `File not found: ${filePath}`);

  const content = fs.readFileSync(filePath, "utf-8");

  if (expectedContent instanceof RegExp) {
    assert.ok(expectedContent.test(content), `File does not match pattern: ${expectedContent}`);
  } else {
    assert.ok(content.includes(expectedContent), `File does not contain: ${expectedContent}`);
  }
}

/**
 * Asserts that a directory is a valid git repository
 * @param {string} dirPath - Path to the directory
 */
export function assertIsGitRepo(dirPath) {
  const gitDir = path.join(dirPath, ".git");
  assert.ok(fs.existsSync(gitDir), "Directory is not a git repository");
}

/**
 * Asserts that a package.json has specific dependencies
 * @param {string} packageJsonPath - Path to package.json
 * @param {string[]} expectedDeps - Array of expected dependency names
 */
export function assertHasDependencies(packageJsonPath, expectedDeps) {
  assert.ok(fs.existsSync(packageJsonPath), `package.json not found: ${packageJsonPath}`);

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const dep of expectedDeps) {
    assert.ok(allDeps[dep], `Missing dependency: ${dep}`);
  }
}

/**
 * Asserts that environment variables are set correctly
 * @param {object} env - Environment object
 * @param {string[]} requiredVars - Array of required variable names
 */
export function assertHasEnvVars(env, requiredVars) {
  for (const varName of requiredVars) {
    assert.ok(env[varName], `Missing environment variable: ${varName}`);
  }
}
