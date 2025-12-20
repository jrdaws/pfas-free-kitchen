# Plugin API Documentation

The dawson-does-framework plugin system allows you to extend the framework's functionality by hooking into key lifecycle events.

## Table of Contents

- [Plugin Structure](#plugin-structure)
- [Available Hooks](#available-hooks)
- [Hook Context](#hook-context)
- [Hook Return Values](#hook-return-values)
- [CLI Commands](#cli-commands)
- [Example Plugin](#example-plugin)
- [Best Practices](#best-practices)

## Plugin Structure

A plugin is a JavaScript/TypeScript module that exports a default object with the following structure:

```javascript
export default {
  // Required fields
  name: "my-plugin",              // Unique plugin identifier
  version: "1.0.0",                // Semantic version
  hooks: {                         // Hook implementations
    "pre:export": async (context) => ({ success: true }),
  },

  // Optional fields
  description: "My custom plugin",  // Human-readable description
  author: "Your Name",              // Plugin author
  capabilities: ["export", "build"], // Related capabilities
};
```

## Available Hooks

### Export Lifecycle

| Hook | When It Runs | Context |
|------|-------------|---------|
| `pre:export` | Before template export starts | `{ templateId, projectDir, projectName, flags }` |
| `pre:export:clone` | Before cloning template | `{ templateId, projectDir, projectName, flags, resolvedTemplate }` |
| `post:export:clone` | After cloning template | `{ templateId, projectDir, projectName, flags, resolvedTemplate, manifestPath }` |
| `post:export` | After export completes | `{ templateId, projectDir, projectName, flags, manifestPath, gitInitialized, remoteConfigured }` |

### Build Lifecycle

| Hook | When It Runs | Context |
|------|-------------|---------|
| `pre:build` | Before build starts | TBD |
| `post:build` | After build completes | TBD |

### Deploy Lifecycle

| Hook | When It Runs | Context |
|------|-------------|---------|
| `pre:deploy` | Before deployment | TBD |
| `post:deploy` | After deployment | TBD |

### Test Lifecycle

| Hook | When It Runs | Context |
|------|-------------|---------|
| `pre:test` | Before tests run | TBD |
| `post:test` | After tests complete | TBD |

### Doctor/Health

| Hook | When It Runs | Context |
|------|-------------|---------|
| `pre:doctor` | Before health check | TBD |
| `post:doctor` | After health check | TBD |

### Configuration

| Hook | When It Runs | Context |
|------|-------------|---------|
| `config:loaded` | After config is loaded | TBD |
| `config:validated` | After config is validated | TBD |

## Hook Context

Each hook receives a context object with information about the current operation:

### Export Context

```typescript
{
  templateId: string;        // Template being exported
  projectDir: string;        // Absolute path to project directory
  projectName: string;       // Project name
  flags: {                   // Command-line flags
    name?: string;
    remote?: string;
    push?: boolean;
    branch?: string;
    dryRun?: boolean;
    force?: boolean;
  };
  resolvedTemplate?: {       // Available after resolution
    mode: "local" | "remote";
    localPath?: string;
    remoteRef?: string;
  };
  manifestPath?: string;     // Available after manifest is written
  gitInitialized?: boolean;  // Available in post:export
  remoteConfigured?: boolean;// Available in post:export
}
```

## Hook Return Values

Hooks must return a promise that resolves to a result object:

```typescript
{
  success: boolean;          // Whether the hook succeeded
  message?: string;          // Optional status message
  data?: any;                // Optional data to pass to subsequent hooks
  skipNext?: boolean;        // If true, skip remaining hooks for this point
}
```

### Examples

**Success:**
```javascript
return {
  success: true,
  message: "Validation passed",
};
```

**Failure (stops export):**
```javascript
return {
  success: false,
  message: "Project name is invalid",
};
```

**Success with data:**
```javascript
return {
  success: true,
  message: "Custom validation complete",
  data: {
    timestamp: new Date().toISOString(),
    customField: "value",
  },
};
```

**Skip remaining hooks:**
```javascript
return {
  success: true,
  skipNext: true, // No more hooks will run for this hook point
};
```

## CLI Commands

### Add a Plugin

```bash
# Add from local file
framework plugin add ./my-plugin.mjs

# Add from npm package
framework plugin add @company/framework-plugin
```

### Remove a Plugin

```bash
framework plugin remove my-plugin
```

### List Installed Plugins

```bash
framework plugin list
```

### Show Available Hooks

```bash
framework plugin hooks
```

### Inspect a Plugin

```bash
framework plugin info ./my-plugin.mjs
```

## Example Plugin

Here's a complete example plugin that validates exports and logs events:

```javascript
// my-validation-plugin.mjs
export default {
  name: "validation-plugin",
  version: "1.0.0",
  description: "Validates project configuration before export",
  author: "Your Team",
  capabilities: ["export", "validation"],

  hooks: {
    /**
     * Validate before export starts
     */
    "pre:export": async (context) => {
      console.log(`\n🔍 Validating export: ${context.projectName}`);

      // Check project name format
      if (!/^[a-z0-9-]+$/.test(context.projectName)) {
        return {
          success: false,
          message: "Project name must be lowercase alphanumeric with hyphens",
        };
      }

      // Check directory doesn't exist
      if (fs.existsSync(context.projectDir) && !context.flags.force) {
        return {
          success: false,
          message: "Directory already exists. Use --force to overwrite.",
        };
      }

      return {
        success: true,
        message: "Validation passed ✅",
      };
    },

    /**
     * Log after export completes
     */
    "post:export": async (context) => {
      console.log(`\n✅ Export complete: ${context.projectDir}`);

      // Log to a file
      const logEntry = {
        timestamp: new Date().toISOString(),
        template: context.templateId,
        project: context.projectName,
        gitInitialized: context.gitInitialized,
      };

      fs.appendFileSync(
        "export-log.json",
        JSON.stringify(logEntry) + "\n"
      );

      return {
        success: true,
        message: "Export logged",
      };
    },
  },
};
```

### Using the Plugin

```bash
# Add the plugin
framework plugin add ./my-validation-plugin.mjs

# Export a template (plugin hooks will run automatically)
framework export saas ./my-project

# Remove the plugin
framework plugin remove validation-plugin
```

## Best Practices

### 1. Fail Fast
Return `{ success: false }` as soon as you detect a problem:

```javascript
if (!isValid(context)) {
  return {
    success: false,
    message: "Specific error message",
  };
}
```

### 2. Provide Clear Messages
Always include a message explaining what happened:

```javascript
return {
  success: true,
  message: "Validated 15 configuration files ✅",
};
```

### 3. Handle Errors Gracefully
Wrap hook logic in try-catch:

```javascript
"pre:export": async (context) => {
  try {
    // Your logic here
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: `Validation failed: ${error.message}`,
    };
  }
}
```

### 4. Keep Hooks Fast
Hooks run synchronously in the export flow. Keep them fast:

```javascript
// ❌ Bad: Slow synchronous operation
"pre:export": async (context) => {
  await heavyDatabaseQuery(); // Blocks export
  return { success: true };
}

// ✅ Good: Fast validation
"pre:export": async (context) => {
  const isValid = quickValidation(context);
  return { success: isValid };
}
```

### 5. Use skipNext Sparingly
Only use `skipNext: true` when you intentionally want to prevent other plugins from running:

```javascript
"pre:export": async (context) => {
  if (isInternalExport(context)) {
    // Skip all other pre:export hooks
    return {
      success: true,
      skipNext: true,
    };
  }
  return { success: true };
}
```

### 6. Version Your Plugins
Follow semantic versioning:

- **Major (1.0.0 → 2.0.0)**: Breaking changes to hook contracts
- **Minor (1.0.0 → 1.1.0)**: New hooks or features
- **Patch (1.0.0 → 1.0.1)**: Bug fixes

### 7. Document Dependencies
If your plugin requires external packages, document them:

```javascript
export default {
  name: "slack-notifier",
  version: "1.0.0",
  description: "Sends export notifications to Slack",
  // Document dependencies in description or README
  hooks: {
    "post:export": async (context) => {
      // Requires: npm install @slack/web-api
      const { WebClient } = await import("@slack/web-api");
      // ...
    },
  },
};
```

## Plugin Storage

Plugins are registered in `.dd/plugins.json`:

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "version": "1.0.0",
      "path": "./my-plugin.mjs",
      "description": "My custom plugin",
      "author": "Your Name",
      "capabilities": ["export"],
      "hooks": ["pre:export", "post:export"],
      "addedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

## Testing Plugins

Test your plugin before using it in production:

```bash
# Validate plugin structure
framework plugin info ./my-plugin.mjs

# Add plugin to a test project
cd test-project
framework plugin add ../my-plugin.mjs

# Run export with plugin
framework export saas ./test-output

# Check logs and verify behavior
# Remove plugin
framework plugin remove my-plugin
```

## Advanced: Plugin Distribution

### Local Development
```bash
# Use relative path
framework plugin add ./plugins/my-plugin.mjs
```

### npm Package
```bash
# Publish to npm
npm publish

# Users can install
framework plugin add @your-org/framework-plugin
```

### GitHub
```bash
# Use GitHub URL (via degit syntax)
framework plugin add github:user/repo/plugin.mjs
```

## Troubleshooting

### Plugin Won't Load

**Check the plugin structure:**
```bash
framework plugin info ./my-plugin.mjs
```

**Common issues:**
- Missing `name`, `version`, or `hooks` fields
- Invalid hook names (use `framework plugin hooks` to see valid names)
- Hooks are not async functions
- Module export is not default export

### Hooks Not Running

**Verify plugin is installed:**
```bash
framework plugin list
```

**Check for errors:**
- Plugin hooks should not throw uncaught errors
- Return `{ success: false }` instead of throwing

### Hook Failures Stop Export

If a hook returns `{ success: false }`, the export stops. This is intentional - hooks can validate and prevent problematic exports.

## Support

- Documentation: https://github.com/jrdaws/framework/tree/main/docs
- Issues: https://github.com/jrdaws/framework/issues
- Examples: https://github.com/jrdaws/framework/tree/main/docs/examples
