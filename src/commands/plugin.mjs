/**
 * Plugin management commands
 */

import {
  addPlugin,
  removePlugin,
  listPlugins,
  getHookPoints,
  loadPlugin,
} from "../dd/plugins.mjs";

export async function cmdPlugin(args = []) {
  const [subcommand, ...rest] = args;

  if (!subcommand || subcommand === "help") {
    showPluginHelp();
    return;
  }

  switch (subcommand) {
    case "add":
      await cmdPluginAdd(rest);
      break;
    case "remove":
      await cmdPluginRemove(rest);
      break;
    case "list":
      await cmdPluginList(rest);
      break;
    case "hooks":
      await cmdPluginHooks();
      break;
    case "info":
      await cmdPluginInfo(rest);
      break;
    default:
      console.error(`Unknown plugin subcommand: ${subcommand}`);
      console.error("Run 'framework plugin help' for usage");
      process.exit(1);
  }
}

function showPluginHelp() {
  console.log(`Plugin Management Commands:

  framework plugin add <path>        Add a plugin
  framework plugin remove <name>     Remove a plugin
  framework plugin list              List installed plugins
  framework plugin hooks             Show available hook points
  framework plugin info <path>       Show plugin information

Examples:
  framework plugin add ./my-plugin.mjs
  framework plugin add @company/framework-plugin
  framework plugin remove my-plugin
  framework plugin list
  framework plugin hooks
`);
}

async function cmdPluginAdd([pluginPath, ...rest]) {
  if (!pluginPath) {
    console.error("Error: Plugin path is required");
    console.error("Usage: framework plugin add <path>");
    process.exit(1);
  }

  const projectDir = rest[0] || ".";

  try {
    console.log(`📦 Adding plugin: ${pluginPath}`);

    const plugin = await addPlugin(pluginPath, projectDir);

    console.log(`✅ Plugin '${plugin.name}' v${plugin.version} added successfully`);

    if (plugin.description) {
      console.log(`   ${plugin.description}`);
    }

    console.log(`\n   Hooks registered:`);
    for (const hookName of Object.keys(plugin.hooks)) {
      console.log(`   - ${hookName}`);
    }

    if (plugin.capabilities && plugin.capabilities.length > 0) {
      console.log(`\n   Capabilities: ${plugin.capabilities.join(", ")}`);
    }
  } catch (error) {
    console.error(`❌ Failed to add plugin: ${error.message}`);
    process.exit(1);
  }
}

async function cmdPluginRemove([pluginName, ...rest]) {
  if (!pluginName) {
    console.error("Error: Plugin name is required");
    console.error("Usage: framework plugin remove <name>");
    process.exit(1);
  }

  const projectDir = rest[0] || ".";

  try {
    console.log(`🗑️  Removing plugin: ${pluginName}`);

    removePlugin(pluginName, projectDir);

    console.log(`✅ Plugin '${pluginName}' removed successfully`);
  } catch (error) {
    console.error(`❌ Failed to remove plugin: ${error.message}`);
    process.exit(1);
  }
}

async function cmdPluginList([projectDir = "."]) {
  try {
    const plugins = listPlugins(projectDir);

    if (plugins.length === 0) {
      console.log("No plugins installed.");
      console.log("\nAdd a plugin with: framework plugin add <path>");
      return;
    }

    console.log(`Installed Plugins (${plugins.length}):\n`);

    for (const plugin of plugins) {
      console.log(`📦 ${plugin.name} v${plugin.version}`);

      if (plugin.description) {
        console.log(`   ${plugin.description}`);
      }

      if (plugin.author) {
        console.log(`   Author: ${plugin.author}`);
      }

      console.log(`   Hooks: ${plugin.hooks.join(", ")}`);

      if (plugin.capabilities && plugin.capabilities.length > 0) {
        console.log(`   Capabilities: ${plugin.capabilities.join(", ")}`);
      }

      console.log(`   Path: ${plugin.path}`);
      console.log(`   Added: ${new Date(plugin.addedAt).toLocaleDateString()}`);
      console.log();
    }
  } catch (error) {
    console.error(`❌ Failed to list plugins: ${error.message}`);
    process.exit(1);
  }
}

async function cmdPluginHooks() {
  const hookPoints = getHookPoints();

  console.log(`Available Hook Points (${hookPoints.length}):\n`);

  // Group by category
  const categories = {
    "Export": ["pre:export", "post:export", "pre:export:clone", "post:export:clone"],
    "Build": ["pre:build", "post:build"],
    "Deploy": ["pre:deploy", "post:deploy"],
    "Test": ["pre:test", "post:test"],
    "Doctor": ["pre:doctor", "post:doctor"],
    "Config": ["config:loaded", "config:validated"],
  };

  for (const [category, hooks] of Object.entries(categories)) {
    console.log(`${category}:`);

    for (const hook of hooks) {
      const hookPoint = hookPoints.find(h => h.name === hook);
      if (hookPoint) {
        console.log(`  ${hookPoint.name.padEnd(25)} ${hookPoint.description}`);
      }
    }

    console.log();
  }

  console.log(`Hook Contract:`);
  console.log(`  async function(context) {`);
  console.log(`    return {`);
  console.log(`      success: boolean,`);
  console.log(`      message?: string,`);
  console.log(`      data?: any,`);
  console.log(`      skipNext?: boolean`);
  console.log(`    };`);
  console.log(`  }`);
}

async function cmdPluginInfo([pluginPath]) {
  if (!pluginPath) {
    console.error("Error: Plugin path is required");
    console.error("Usage: framework plugin info <path>");
    process.exit(1);
  }

  try {
    console.log(`📦 Loading plugin: ${pluginPath}\n`);

    const plugin = await loadPlugin(pluginPath);

    console.log(`Name:        ${plugin.name}`);
    console.log(`Version:     ${plugin.version}`);

    if (plugin.description) {
      console.log(`Description: ${plugin.description}`);
    }

    if (plugin.author) {
      console.log(`Author:      ${plugin.author}`);
    }

    console.log(`\nHooks (${Object.keys(plugin.hooks).length}):`);
    for (const hookName of Object.keys(plugin.hooks)) {
      console.log(`  - ${hookName}`);
    }

    if (plugin.capabilities && plugin.capabilities.length > 0) {
      console.log(`\nCapabilities: ${plugin.capabilities.join(", ")}`);
    }

    console.log(`\n✅ Plugin is valid and ready to use`);
  } catch (error) {
    console.error(`❌ Failed to load plugin: ${error.message}`);
    process.exit(1);
  }
}
