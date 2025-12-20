/**
 * Plugin system for dawson-does-framework
 *
 * Plugin Interface:
 * {
 *   name: string,
 *   version: string,
 *   description?: string,
 *   author?: string,
 *   hooks: {
 *     [hookName]: async (context) => HookResult
 *   },
 *   capabilities?: string[]
 * }
 *
 * Hook Result:
 * {
 *   success: boolean,
 *   message?: string,
 *   data?: any,
 *   skipNext?: boolean
 * }
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Available hook points in the framework
 */
export const HOOK_POINTS = {
  // Export lifecycle
  "pre:export": "Before template export starts",
  "post:export": "After template export completes",
  "pre:export:clone": "Before cloning template",
  "post:export:clone": "After cloning template",

  // Build lifecycle
  "pre:build": "Before build starts",
  "post:build": "After build completes",

  // Deploy lifecycle
  "pre:deploy": "Before deployment",
  "post:deploy": "After deployment",

  // Test lifecycle
  "pre:test": "Before tests run",
  "post:test": "After tests complete",

  // Doctor/health
  "pre:doctor": "Before health check",
  "post:doctor": "After health check",

  // Configuration
  "config:loaded": "After config is loaded",
  "config:validated": "After config is validated",
};

/**
 * Load plugin registry from project directory
 */
export function loadPluginRegistry(projectDir = ".") {
  const registryPath = path.join(projectDir, ".dd", "plugins.json");

  if (!fs.existsSync(registryPath)) {
    return { plugins: [] };
  }

  try {
    const content = fs.readFileSync(registryPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load plugin registry: ${error.message}`);
    return { plugins: [] };
  }
}

/**
 * Save plugin registry to project directory
 */
export function savePluginRegistry(registry, projectDir = ".") {
  const ddDir = path.join(projectDir, ".dd");
  if (!fs.existsSync(ddDir)) {
    fs.mkdirSync(ddDir, { recursive: true });
  }

  const registryPath = path.join(ddDir, "plugins.json");
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

/**
 * Validate plugin structure
 */
export function validatePlugin(plugin) {
  const errors = [];

  if (!plugin.name || typeof plugin.name !== "string") {
    errors.push("Plugin must have a 'name' field (string)");
  }

  if (!plugin.version || typeof plugin.version !== "string") {
    errors.push("Plugin must have a 'version' field (string)");
  }

  if (!plugin.hooks || typeof plugin.hooks !== "object") {
    errors.push("Plugin must have a 'hooks' object");
  } else {
    // Validate hook names
    for (const hookName of Object.keys(plugin.hooks)) {
      if (!HOOK_POINTS[hookName]) {
        errors.push(`Unknown hook point: ${hookName}`);
      }

      if (typeof plugin.hooks[hookName] !== "function") {
        errors.push(`Hook '${hookName}' must be a function`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Load a plugin from a file path or npm package
 */
export async function loadPlugin(pluginPath) {
  try {
    // Handle both file paths and npm packages
    let resolvedPath = pluginPath;

    // If it's a local path, resolve it
    if (pluginPath.startsWith(".") || pluginPath.startsWith("/")) {
      resolvedPath = path.resolve(pluginPath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Plugin file not found: ${resolvedPath}`);
      }
    }

    // Dynamic import
    const pluginUrl = pluginPath.startsWith(".") || pluginPath.startsWith("/")
      ? pathToFileURL(resolvedPath).href
      : pluginPath;

    const module = await import(pluginUrl);
    const plugin = module.default || module;

    // Validate plugin structure
    const validation = validatePlugin(plugin);
    if (!validation.valid) {
      throw new Error(`Invalid plugin: ${validation.errors.join(", ")}`);
    }

    return plugin;
  } catch (error) {
    throw new Error(`Failed to load plugin: ${error.message}`);
  }
}

/**
 * Add a plugin to the registry
 */
export async function addPlugin(pluginPath, projectDir = ".") {
  const plugin = await loadPlugin(pluginPath);
  const registry = loadPluginRegistry(projectDir);

  // Check if plugin already exists
  const existingIndex = registry.plugins.findIndex(p => p.name === plugin.name);

  if (existingIndex >= 0) {
    throw new Error(`Plugin '${plugin.name}' is already installed. Use 'framework plugin remove' first.`);
  }

  // Add to registry
  registry.plugins.push({
    name: plugin.name,
    version: plugin.version,
    path: pluginPath,
    description: plugin.description || "",
    author: plugin.author || "",
    capabilities: plugin.capabilities || [],
    hooks: Object.keys(plugin.hooks),
    addedAt: new Date().toISOString(),
  });

  savePluginRegistry(registry, projectDir);

  return plugin;
}

/**
 * Remove a plugin from the registry
 */
export function removePlugin(pluginName, projectDir = ".") {
  const registry = loadPluginRegistry(projectDir);
  const initialLength = registry.plugins.length;

  registry.plugins = registry.plugins.filter(p => p.name !== pluginName);

  if (registry.plugins.length === initialLength) {
    throw new Error(`Plugin '${pluginName}' not found`);
  }

  savePluginRegistry(registry, projectDir);

  return true;
}

/**
 * List all installed plugins
 */
export function listPlugins(projectDir = ".") {
  const registry = loadPluginRegistry(projectDir);
  return registry.plugins;
}

/**
 * Load all plugins from registry
 */
export async function loadAllPlugins(projectDir = ".") {
  const registry = loadPluginRegistry(projectDir);
  const plugins = [];

  for (const pluginMeta of registry.plugins) {
    try {
      const plugin = await loadPlugin(pluginMeta.path);
      plugins.push(plugin);
    } catch (error) {
      console.error(`Failed to load plugin '${pluginMeta.name}': ${error.message}`);
    }
  }

  return plugins;
}

/**
 * Execute hooks for a given hook point
 */
export async function executeHooks(hookPoint, context, projectDir = ".") {
  if (!HOOK_POINTS[hookPoint]) {
    throw new Error(`Unknown hook point: ${hookPoint}`);
  }

  const plugins = await loadAllPlugins(projectDir);
  const results = [];

  for (const plugin of plugins) {
    if (plugin.hooks[hookPoint]) {
      try {
        const result = await plugin.hooks[hookPoint](context);

        results.push({
          plugin: plugin.name,
          success: result?.success ?? true,
          message: result?.message,
          data: result?.data,
        });

        // If a hook says to skip remaining hooks
        if (result?.skipNext) {
          break;
        }
      } catch (error) {
        results.push({
          plugin: plugin.name,
          success: false,
          message: error.message,
          error: error,
        });
      }
    }
  }

  return {
    hookPoint,
    executed: results.length,
    results,
    allSucceeded: results.every(r => r.success),
  };
}

/**
 * Get available hook points
 */
export function getHookPoints() {
  return Object.entries(HOOK_POINTS).map(([name, description]) => ({
    name,
    description,
  }));
}
