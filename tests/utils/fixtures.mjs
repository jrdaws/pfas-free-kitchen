import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import fse from "fs-extra";

/**
 * Creates a temporary test project directory
 * @returns {string} Path to the temporary project
 */
export function createTempProject() {
  const tmpDir = path.join(os.tmpdir(), `framework-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

/**
 * Cleans up a temporary project directory
 * @param {string} projectPath - Path to the project to clean up
 */
export function cleanupTempProject(projectPath) {
  if (fs.existsSync(projectPath)) {
    fse.removeSync(projectPath);
  }
}

/**
 * Creates a mock template structure for testing
 * @param {string} basePath - Base path to create the template in
 * @returns {string} Path to the created template
 */
export function createMockTemplate(basePath) {
  const templatePath = path.join(basePath, "template");
  fs.mkdirSync(templatePath, { recursive: true });

  // Create basic template structure
  fs.writeFileSync(
    path.join(templatePath, "package.json"),
    JSON.stringify({
      name: "test-template",
      version: "1.0.0",
      type: "module"
    }, null, 2)
  );

  // Create .dd directory with manifest
  const ddDir = path.join(templatePath, ".dd");
  fs.mkdirSync(ddDir, { recursive: true });

  fs.writeFileSync(
    path.join(ddDir, "manifest.json"),
    JSON.stringify({
      template: "test-template",
      version: "1.0.0",
      capabilities: []
    }, null, 2)
  );

  return templatePath;
}

/**
 * Creates a mock Supabase client for testing
 * @returns {object} Mock Supabase client
 */
export function mockSupabase() {
  return {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
    }),
    auth: {
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signIn: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}

/**
 * Creates a temporary git repository for testing
 * @param {string} basePath - Base path to create the repo in
 * @returns {string} Path to the git repository
 */
export function createTempGitRepo(basePath) {
  const repoPath = path.join(basePath, "repo");
  fs.mkdirSync(repoPath, { recursive: true });

  // Initialize git repo
  spawnSync("git", ["init"], { cwd: repoPath });
  spawnSync("git", ["config", "user.name", "Test User"], { cwd: repoPath });
  spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: repoPath });

  // Create initial commit
  fs.writeFileSync(path.join(repoPath, "README.md"), "# Test Repo");
  spawnSync("git", ["add", "."], { cwd: repoPath });
  spawnSync("git", ["commit", "-m", "Initial commit"], { cwd: repoPath });

  return repoPath;
}

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {object} Parsed JSON object
 */
export function readJSON(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

/**
 * Writes a JSON object to a file
 * @param {string} filePath - Path to write to
 * @param {object} data - Data to write
 */
export function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
