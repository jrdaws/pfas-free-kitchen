import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validatePlugin,
  loadPluginRegistry,
  savePluginRegistry,
  addPlugin,
  removePlugin,
  listPlugins,
  executeHooks,
  getHookPoints,
  HOOK_POINTS,
} from "../../src/dd/plugins.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures", "plugins");

// Ensure fixtures directory exists
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

test("plugins: validatePlugin accepts valid plugin", () => {
  const plugin = {
    name: "test-plugin",
    version: "1.0.0",
    hooks: {
      "pre:export": async () => ({ success: true }),
    },
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("plugins: validatePlugin rejects plugin without name", () => {
  const plugin = {
    version: "1.0.0",
    hooks: {},
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("name")));
});

test("plugins: validatePlugin rejects plugin without version", () => {
  const plugin = {
    name: "test-plugin",
    hooks: {},
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("version")));
});

test("plugins: validatePlugin rejects plugin without hooks", () => {
  const plugin = {
    name: "test-plugin",
    version: "1.0.0",
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("hooks")));
});

test("plugins: validatePlugin rejects unknown hook point", () => {
  const plugin = {
    name: "test-plugin",
    version: "1.0.0",
    hooks: {
      "invalid:hook": async () => ({ success: true }),
    },
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("Unknown hook")));
});

test("plugins: validatePlugin rejects non-function hook", () => {
  const plugin = {
    name: "test-plugin",
    version: "1.0.0",
    hooks: {
      "pre:export": "not a function",
    },
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("must be a function")));
});

test("plugins: loadPluginRegistry returns empty when no registry exists", () => {
  const testDir = path.join(FIXTURES_DIR, "no-registry");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const registry = loadPluginRegistry(testDir);

  assert.deepEqual(registry, { plugins: [] });
});

test("plugins: savePluginRegistry creates .dd directory", () => {
  const testDir = path.join(FIXTURES_DIR, "save-registry-test");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const registry = { plugins: [] };
  savePluginRegistry(registry, testDir);

  const ddDir = path.join(testDir, ".dd");
  assert.ok(fs.existsSync(ddDir));

  const registryPath = path.join(ddDir, "plugins.json");
  assert.ok(fs.existsSync(registryPath));
});

test("plugins: savePluginRegistry and loadPluginRegistry roundtrip", () => {
  const testDir = path.join(FIXTURES_DIR, "roundtrip-test");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const registry = {
    plugins: [
      {
        name: "test-plugin",
        version: "1.0.0",
        path: "./test-plugin.mjs",
        hooks: ["pre:export"],
      },
    ],
  };

  savePluginRegistry(registry, testDir);
  const loaded = loadPluginRegistry(testDir);

  assert.deepEqual(loaded, registry);
});

test("plugins: listPlugins returns empty array when no plugins", () => {
  const testDir = path.join(FIXTURES_DIR, "list-empty");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const plugins = listPlugins(testDir);

  assert.deepEqual(plugins, []);
});

test("plugins: removePlugin removes plugin from registry", () => {
  const testDir = path.join(FIXTURES_DIR, "remove-test");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const registry = {
    plugins: [
      {
        name: "plugin-1",
        version: "1.0.0",
        path: "./plugin-1.mjs",
        hooks: [],
      },
      {
        name: "plugin-2",
        version: "1.0.0",
        path: "./plugin-2.mjs",
        hooks: [],
      },
    ],
  };

  savePluginRegistry(registry, testDir);

  removePlugin("plugin-1", testDir);

  const loaded = loadPluginRegistry(testDir);
  assert.equal(loaded.plugins.length, 1);
  assert.equal(loaded.plugins[0].name, "plugin-2");
});

test("plugins: removePlugin throws when plugin not found", () => {
  const testDir = path.join(FIXTURES_DIR, "remove-not-found");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const registry = { plugins: [] };
  savePluginRegistry(registry, testDir);

  assert.throws(
    () => removePlugin("non-existent", testDir),
    /not found/
  );
});

test("plugins: getHookPoints returns all hook points", () => {
  const hookPoints = getHookPoints();

  assert.ok(Array.isArray(hookPoints));
  assert.ok(hookPoints.length > 0);

  const hasPreExport = hookPoints.some(h => h.name === "pre:export");
  assert.ok(hasPreExport);
});

test("plugins: HOOK_POINTS contains expected hooks", () => {
  assert.ok(HOOK_POINTS["pre:export"]);
  assert.ok(HOOK_POINTS["post:export"]);
  assert.ok(HOOK_POINTS["pre:build"]);
  assert.ok(HOOK_POINTS["post:build"]);
  assert.ok(HOOK_POINTS["pre:deploy"]);
  assert.ok(HOOK_POINTS["post:deploy"]);
});

test("plugins: executeHooks returns empty results when no plugins", async () => {
  const testDir = path.join(FIXTURES_DIR, "execute-empty");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const result = await executeHooks("pre:export", {}, testDir);

  assert.equal(result.executed, 0);
  assert.equal(result.allSucceeded, true);
  assert.ok(Array.isArray(result.results));
});

test("plugins: executeHooks throws on unknown hook point", async () => {
  await assert.rejects(
    () => executeHooks("invalid:hook", {}),
    /Unknown hook point/
  );
});

test("plugins: validatePlugin accepts optional fields", () => {
  const plugin = {
    name: "test-plugin",
    version: "1.0.0",
    description: "Test plugin",
    author: "Test Author",
    capabilities: ["billing", "auth"],
    hooks: {
      "pre:export": async () => ({ success: true }),
    },
  };

  const result = validatePlugin(plugin);
  assert.equal(result.valid, true);
});
