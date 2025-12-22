# Plugins

Plugins extend the Dawson Does Framework by hooking into key lifecycle events during template export, build, deploy, and other operations. They enable validation, automation, logging, and custom behavior without modifying core framework code.

## Table of Contents

- [What Are Plugins?](#what-are-plugins)
- [Why Plugins Exist](#why-plugins-exist)
- [Plugin Architecture](#plugin-architecture)
- [Hook Lifecycle](#hook-lifecycle)
- [Creating Custom Plugins](#creating-custom-plugins)
- [Plugin Discovery and Loading](#plugin-discovery-and-loading)
- [Real-World Examples](#real-world-examples)
- [Best Practices](#best-practices)
- [Testing Plugins](#testing-plugins)
- [Distribution](#distribution)

## What Are Plugins?

A plugin is a JavaScript/TypeScript module that exports hooks for framework lifecycle events. Plugins can:

- **Validate** export conditions before starting
- **Transform** files during the export process
- **Log** events for audit trails
- **Notify** external systems about operations
- **Block** operations that don't meet requirements
- **Enhance** templates with custom behavior

### Plugin Structure

```javascript
// my-plugin.mjs
export default {
  name: "my-plugin",
  version: "1.0.0",
  description: "Custom validation and logging",
  author: "Your Name",
  capabilities: ["export", "validation"],

  hooks: {
    "pre:export": async (context) => {
      // Validate before export starts
      console.log(`Validating export: ${context.projectName}`);
      return { success: true };
    },

    "post:export": async (context) => {
      // Log after export completes
      console.log(`Export completed: ${context.projectDir}`);
      return { success: true };
    },
  },
};
```

### Minimal Plugin

The simplest possible plugin:

```javascript
export default {
  name: "simple-logger",
  version: "1.0.0",
  hooks: {
    "post:export": async (context) => {
      console.log(`Exported ${context.templateId} to ${context.projectDir}`);
      return { success: true };
    },
  },
};
```

## Why Plugins Exist

### 1. Extensibility Without Forking

**Problem**: Organizations need custom behavior but don't want to fork the framework.

**Solution**: Plugins provide extension points without modifying core code.

```javascript
// Add company-specific validation
export default {
  name: "company-standards",
  version: "1.0.0",
  hooks: {
    "pre:export": async (context) => {
      // Check naming convention
      if (!/^[a-z0-9-]+$/.test(context.projectName)) {
        return {
          success: false,
          message: "Project name must be lowercase alphanumeric with hyphens",
        };
      }

      return { success: true };
    },
  },
};
```

### 2. Separation of Concerns

**Problem**: Core framework should focus on core functionality, not everyone's specific needs.

**Solution**: Plugins handle specialized requirements:
- Company-specific validation
- External system integration
- Custom logging formats
- Compliance checks
- Security scanning

### 3. Community Contributions

**Problem**: Community wants to share useful functionality.

**Solution**: Plugins can be published and shared:

```bash
# Install community plugin
npm install -g framework-plugin-eslint-check
framework plugin add framework-plugin-eslint-check

# Now runs on every export
framework export saas ./my-app
# ✓ ESLint check passed
```

### 4. Testability

**Problem**: Testing custom behavior in framework core is difficult.

**Solution**: Plugins are independently testable:

```javascript
import { describe, it } from 'node:test';
import plugin from './my-plugin.mjs';

describe('my-plugin', () => {
  it('validates project names', async () => {
    const result = await plugin.hooks["pre:export"]({
      projectName: "invalid_name",
      projectDir: "/tmp/test",
    });

    assert.equal(result.success, false);
  });
});
```

## Plugin Architecture

### Plugin System Design

```
┌─────────────────────────────────────────┐
│         Framework Core                  │
│    (export, deploy, etc.)               │
└────────────┬────────────────────────────┘
             │ triggers
             ↓
┌─────────────────────────────────────────┐
│         Hook Executor                   │
│    executeHooks(hookPoint, context)     │
└────────────┬────────────────────────────┘
             │ loads
             ↓
┌─────────────────────────────────────────┐
│         Plugin Registry                 │
│    .dd/plugins.json                     │
└────────────┬────────────────────────────┘
             │ references
             ↓
┌─────────────────────────────────────────┐
│         Plugin Modules                  │
│    • validation-plugin.mjs              │
│    • logging-plugin.mjs                 │
│    • @company/framework-plugin          │
└─────────────────────────────────────────┘
```

### Plugin Loading Flow

```
1. Framework triggers hook point
   ↓
2. Load plugin registry (.dd/plugins.json)
   ↓
3. For each plugin:
   a. Import plugin module
   b. Validate plugin structure
   c. Check if plugin has hook
   d. Execute hook with context
   ↓
4. Collect results
   ↓
5. If any plugin fails → abort operation
   If all succeed → continue
```

### Plugin Registry

Plugins are registered in `.dd/plugins.json`:

```json
{
  "plugins": [
    {
      "name": "validation-plugin",
      "version": "1.0.0",
      "path": "./plugins/validation-plugin.mjs",
      "description": "Validates project configuration",
      "author": "Your Team",
      "capabilities": ["export", "validation"],
      "hooks": ["pre:export", "post:export"],
      "addedAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "name": "@company/security-scan",
      "version": "2.1.0",
      "path": "@company/security-scan",
      "description": "Security vulnerability scanning",
      "author": "Security Team",
      "capabilities": ["security"],
      "hooks": ["post:export", "pre:deploy"],
      "addedAt": "2025-01-16T14:20:00.000Z"
    }
  ]
}
```

## Hook Lifecycle

### Available Hook Points

| Hook | When It Runs | Context |
|------|-------------|---------|
| `pre:export` | Before template export starts | `{ templateId, projectDir, projectName, flags }` |
| `pre:export:clone` | Before cloning template | `{ ..., resolvedTemplate }` |
| `post:export:clone` | After cloning template | `{ ..., manifestPath }` |
| `post:export` | After export completes | `{ ..., gitInitialized, remoteConfigured }` |
| `pre:build` | Before build starts | TBD |
| `post:build` | After build completes | TBD |
| `pre:deploy` | Before deployment | TBD |
| `post:deploy` | After deployment | TBD |
| `pre:test` | Before tests run | TBD |
| `post:test` | After tests complete | TBD |
| `pre:doctor` | Before health check | TBD |
| `post:doctor` | After health check | TBD |
| `config:loaded` | After config is loaded | TBD |
| `config:validated` | After config is validated | TBD |

### Export Hook Flow

Here's the complete flow during `framework export`:

```
┌─────────────────────────────────────────┐
│ 1. Validation Phase                     │
│    - Check template exists              │
│    - Validate flags                     │
│    - Verify git availability            │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 2. HOOK: pre:export                     │
│    - Validate project requirements      │
│    - Check preconditions                │
│    - Verify permissions                 │
│    ⚠️  If any plugin fails → ABORT      │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 3. Template Resolution                  │
│    - Resolve local vs remote            │
│    - Check version pinning              │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 4. HOOK: pre:export:clone               │
│    - Validate resolved template         │
│    - Pre-clone preparation              │
│    ⚠️  If any plugin fails → ABORT      │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 5. Template Clone                       │
│    - Clone using degit or fs.copy       │
│    - Exclude node_modules, .git         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 6. Manifest Creation                    │
│    - Hash all files (SHA256)            │
│    - Write .dd/template-manifest.json   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 7. HOOK: post:export:clone              │
│    - Process cloned files               │
│    - Modify templates                   │
│    - Add custom files                   │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 8. Integration Application              │
│    - Validate integrations              │
│    - Copy integration files             │
│    - Merge dependencies                 │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 9. Starter Files                        │
│    - README.md                          │
│    - .gitignore                         │
│    - .dd/config.json                    │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 10. Git Initialization                  │
│    - git init                           │
│    - git add -A                         │
│    - git commit                         │
└────────────┬────────────────────────────┘
             ↓
┌─────────────────────────────────────────┐
│ 11. HOOK: post:export                   │
│    - Logging                            │
│    - Notifications                      │
│    - Post-processing                    │
│    - Documentation generation           │
└─────────────────────────────────────────┘
```

### Hook Context

Each hook receives a context object with operation details:

#### Export Context

```typescript
{
  // Basic info (available in all export hooks)
  templateId: string;              // "saas", "blog", etc.
  projectDir: string;              // Absolute path to target
  projectName: string;             // Project name
  flags: {
    name?: string;                 // --name flag
    remote?: string;               // --remote flag
    push?: boolean;                // --push flag
    branch?: string;               // --branch flag
    dryRun?: boolean;              // --dry-run flag
    force?: boolean;               // --force flag
    templateSource?: "local" | "remote" | "auto";
    frameworkVersion?: string;
    integrations?: {
      auth?: string;
      payments?: string;
      email?: string;
      db?: string;
      ai?: string;
      analytics?: string;
      storage?: string;
    };
  };

  // Available after template resolution (pre:export:clone onwards)
  resolvedTemplate?: {
    mode: "local" | "remote";
    localPath?: string;            // If mode = "local"
    remoteRef?: string;            // If mode = "remote"
  };

  // Available after manifest creation (post:export:clone onwards)
  manifestPath?: string;

  // Available in post:export
  gitInitialized?: boolean;
  remoteConfigured?: boolean;
}
```

### Hook Return Values

Hooks must return a promise that resolves to a result object:

```typescript
{
  success: boolean;          // Required: whether hook succeeded
  message?: string;          // Optional: status message
  data?: any;                // Optional: data for subsequent hooks
  skipNext?: boolean;        // Optional: skip remaining hooks
}
```

#### Success Example

```javascript
return {
  success: true,
  message: "Validation passed: all checks OK",
};
```

#### Failure Example (aborts operation)

```javascript
return {
  success: false,
  message: "Project name contains invalid characters",
};
```

#### Success with Data

```javascript
return {
  success: true,
  message: "Analysis complete",
  data: {
    filesScanned: 127,
    issuesFound: 0,
  },
};
```

#### Skip Remaining Hooks

```javascript
return {
  success: true,
  skipNext: true,  // No more hooks will run for this point
  message: "Internal export detected, skipping validation",
};
```

## Creating Custom Plugins

### Step 1: Create Plugin File

```javascript
// plugins/my-validation-plugin.mjs
import fs from 'node:fs';
import path from 'node:path';

export default {
  name: "my-validation-plugin",
  version: "1.0.0",
  description: "Custom validation for project exports",
  author: "Your Name",
  capabilities: ["export", "validation"],

  hooks: {
    /**
     * Validate before export starts
     */
    "pre:export": async (context) => {
      console.log(`\n🔍 Validating export: ${context.projectName}`);

      // Check 1: Project name format
      if (!/^[a-z0-9-]+$/.test(context.projectName)) {
        return {
          success: false,
          message: "Project name must be lowercase alphanumeric with hyphens",
        };
      }

      // Check 2: Directory doesn't exist
      if (fs.existsSync(context.projectDir) && !context.flags.force) {
        return {
          success: false,
          message: "Directory already exists. Use --force to overwrite.",
        };
      }

      // Check 3: Required env vars for integrations
      if (context.flags.integrations?.auth === "supabase") {
        if (!process.env.SUPABASE_URL) {
          console.warn("⚠️  Warning: SUPABASE_URL not set");
        }
      }

      console.log("✅ Validation passed");
      return {
        success: true,
        message: "All validation checks passed",
      };
    },

    /**
     * Log after export completes
     */
    "post:export": async (context) => {
      console.log(`\n📝 Logging export...`);

      // Create audit log
      const logEntry = {
        timestamp: new Date().toISOString(),
        template: context.templateId,
        project: context.projectName,
        directory: context.projectDir,
        gitInitialized: context.gitInitialized,
        integrations: context.flags.integrations,
      };

      // Append to log file
      const logPath = path.join(process.cwd(), ".dd", "export-log.json");
      let logs = [];

      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, "utf8"));
      }

      logs.push(logEntry);

      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

      console.log(`✅ Export logged to ${logPath}`);

      return {
        success: true,
        message: "Export logged successfully",
        data: { logPath },
      };
    },
  },
};
```

### Step 2: Add Plugin to Project

```bash
# Add plugin to current project
framework plugin add ./plugins/my-validation-plugin.mjs

# Output:
# ✅ Plugin added: my-validation-plugin (v1.0.0)
#    Hooks: pre:export, post:export
```

### Step 3: Use Plugin

```bash
# Export a template (plugin hooks run automatically)
framework export saas ./my-app

# Output:
# 🔍 Validating export: my-app
# ✅ Validation passed
#
# [... normal export process ...]
#
# 📝 Logging export...
# ✅ Export logged to .dd/export-log.json
```

### Step 4: Remove Plugin (Optional)

```bash
framework plugin remove my-validation-plugin
```

## Plugin Discovery and Loading

### Loading Sequence

```javascript
// 1. Framework triggers hook point
await executeHooks("pre:export", context, projectDir);

// 2. Load plugin registry
const registry = loadPluginRegistry(projectDir);
// Reads: .dd/plugins.json

// 3. Load each plugin module
const plugins = [];
for (const meta of registry.plugins) {
  const plugin = await loadPlugin(meta.path);
  plugins.push(plugin);
}

// 4. Execute hooks in order
const results = [];
for (const plugin of plugins) {
  if (plugin.hooks["pre:export"]) {
    const result = await plugin.hooks["pre:export"](context);
    results.push({ plugin: plugin.name, ...result });

    // If plugin failed, abort
    if (!result.success) {
      throw new Error(`Plugin ${plugin.name} failed: ${result.message}`);
    }

    // If plugin requests skip
    if (result.skipNext) {
      break;
    }
  }
}
```

### Plugin Path Resolution

```javascript
// Local file path
framework plugin add ./plugins/my-plugin.mjs
// Resolves to: /absolute/path/to/plugins/my-plugin.mjs

// Relative path
framework plugin add ../shared-plugins/company-plugin.mjs

// npm package
framework plugin add @company/framework-plugin
// Imports from node_modules

// GitHub URL (future)
framework plugin add github:user/repo/plugin.mjs
```

### Plugin Validation

Before loading, plugins are validated:

```javascript
function validatePlugin(plugin) {
  const errors = [];

  // Check required fields
  if (!plugin.name) {
    errors.push("Plugin must have a 'name' field");
  }

  if (!plugin.version) {
    errors.push("Plugin must have a 'version' field");
  }

  if (!plugin.hooks || typeof plugin.hooks !== "object") {
    errors.push("Plugin must have a 'hooks' object");
  }

  // Validate hook names
  for (const hookName of Object.keys(plugin.hooks)) {
    if (!HOOK_POINTS[hookName]) {
      errors.push(`Unknown hook point: ${hookName}`);
    }

    if (typeof plugin.hooks[hookName] !== "function") {
      errors.push(`Hook '${hookName}' must be a function`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

## Real-World Examples

### Example 1: Project Name Validator

```javascript
// plugins/name-validator.mjs
export default {
  name: "name-validator",
  version: "1.0.0",
  description: "Enforces project naming conventions",

  hooks: {
    "pre:export": async (context) => {
      const { projectName } = context;

      // Check length
      if (projectName.length < 3) {
        return {
          success: false,
          message: "Project name must be at least 3 characters",
        };
      }

      if (projectName.length > 50) {
        return {
          success: false,
          message: "Project name must be less than 50 characters",
        };
      }

      // Check format
      if (!/^[a-z0-9-]+$/.test(projectName)) {
        return {
          success: false,
          message: "Project name must be lowercase alphanumeric with hyphens",
        };
      }

      // Check reserved names
      const reserved = ["test", "tmp", "temp", "node_modules"];
      if (reserved.includes(projectName)) {
        return {
          success: false,
          message: `Project name "${projectName}" is reserved`,
        };
      }

      return { success: true };
    },
  },
};
```

### Example 2: Slack Notifier

```javascript
// plugins/slack-notifier.mjs
export default {
  name: "slack-notifier",
  version: "1.0.0",
  description: "Sends export notifications to Slack",

  hooks: {
    "post:export": async (context) => {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;

      if (!webhookUrl) {
        console.log("ℹ️  Skipping Slack notification (no webhook URL)");
        return { success: true };
      }

      try {
        const message = {
          text: `🚀 New project exported`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Project*: \`${context.projectName}\`\n*Template*: \`${context.templateId}\`\n*Directory*: \`${context.projectDir}\``,
              },
            },
          ],
        };

        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          throw new Error(`Slack API error: ${response.status}`);
        }

        console.log("✅ Slack notification sent");
        return { success: true };
      } catch (error) {
        console.error("Failed to send Slack notification:", error.message);
        // Don't fail the export if notification fails
        return { success: true };
      }
    },
  },
};
```

### Example 3: License Checker

```javascript
// plugins/license-checker.mjs
import fs from 'node:fs';
import path from 'node:path';

export default {
  name: "license-checker",
  version: "1.0.0",
  description: "Verifies all dependencies have approved licenses",

  hooks: {
    "post:export:clone": async (context) => {
      console.log("\n📋 Checking licenses...");

      const packageJsonPath = path.join(context.projectDir, "package.json");

      if (!fs.existsSync(packageJsonPath)) {
        return {
          success: false,
          message: "No package.json found",
        };
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // In real implementation, would check license info
      // For demo, just count packages
      const packageCount = Object.keys(dependencies).length;

      console.log(`✅ Checked ${packageCount} packages`);

      return {
        success: true,
        message: `License check passed (${packageCount} packages)`,
        data: { packageCount },
      };
    },
  },
};
```

### Example 4: Git Branch Enforcer

```javascript
// plugins/branch-enforcer.mjs
export default {
  name: "branch-enforcer",
  version: "1.0.0",
  description: "Enforces git branch naming conventions",

  hooks: {
    "pre:export": async (context) => {
      const branch = context.flags.branch || "main";

      // Allowed patterns
      const patterns = [
        /^main$/,
        /^master$/,
        /^develop$/,
        /^feature\/[a-z0-9-]+$/,
        /^fix\/[a-z0-9-]+$/,
        /^release\/v\d+\.\d+\.\d+$/,
      ];

      const isValid = patterns.some(pattern => pattern.test(branch));

      if (!isValid) {
        return {
          success: false,
          message: `Branch name "${branch}" doesn't match allowed patterns`,
        };
      }

      return { success: true };
    },
  },
};
```

### Example 5: File Size Monitor

```javascript
// plugins/file-size-monitor.mjs
import fs from 'node:fs';
import path from 'node:path';

export default {
  name: "file-size-monitor",
  version: "1.0.0",
  description: "Monitors and reports project file sizes",

  hooks: {
    "post:export": async (context) => {
      console.log("\n📊 Analyzing file sizes...");

      const stats = {
        totalFiles: 0,
        totalSize: 0,
        largeFiles: [],
      };

      function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Skip node_modules, .git, etc.
          if (entry.name === "node_modules" || entry.name === ".git") {
            continue;
          }

          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile()) {
            const stat = fs.statSync(fullPath);
            stats.totalFiles++;
            stats.totalSize += stat.size;

            // Track files > 1MB
            if (stat.size > 1024 * 1024) {
              stats.largeFiles.push({
                path: path.relative(context.projectDir, fullPath),
                size: stat.size,
              });
            }
          }
        }
      }

      walkDir(context.projectDir);

      console.log(`   Files: ${stats.totalFiles}`);
      console.log(`   Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);

      if (stats.largeFiles.length > 0) {
        console.log(`   ⚠️  Large files (>1MB): ${stats.largeFiles.length}`);
        stats.largeFiles.forEach(file => {
          console.log(`      ${file.path}: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        });
      }

      return {
        success: true,
        message: "File size analysis complete",
        data: stats,
      };
    },
  },
};
```

## Best Practices

### 1. Fail Fast

Return failure immediately when you detect a problem:

```javascript
// Good: Fail immediately
"pre:export": async (context) => {
  if (!isValid(context)) {
    return {
      success: false,
      message: "Validation failed: specific reason",
    };
  }
  // Continue with more checks...
}

// Bad: Don't continue after detecting error
"pre:export": async (context) => {
  let error = null;
  if (!isValid(context)) {
    error = "Validation failed";
  }
  // Keep processing...
  return { success: !error, message: error };
}
```

### 2. Provide Clear Messages

Always include helpful error messages:

```javascript
// Good: Specific, actionable message
return {
  success: false,
  message: "Project name 'My_App' contains invalid characters. Use lowercase letters, numbers, and hyphens only.",
};

// Bad: Vague message
return {
  success: false,
  message: "Invalid name",
};
```

### 3. Handle Errors Gracefully

Wrap hook logic in try-catch:

```javascript
"pre:export": async (context) => {
  try {
    // Your validation logic
    const result = await validateProject(context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      message: `Validation failed: ${error.message}`,
    };
  }
}
```

### 4. Keep Hooks Fast

Hooks run synchronously in the export flow:

```javascript
// Good: Fast operation
"pre:export": async (context) => {
  const isValid = /^[a-z0-9-]+$/.test(context.projectName);
  return { success: isValid };
}

// Bad: Slow operation blocks export
"pre:export": async (context) => {
  await heavyDatabaseQuery();  // Blocks export
  await externalApiCall();     // Blocks export
  return { success: true };
}
```

### 5. Use skipNext Sparingly

Only use `skipNext: true` when absolutely necessary:

```javascript
"pre:export": async (context) => {
  // Skip validation for internal exports
  if (context.flags.internal) {
    return {
      success: true,
      skipNext: true,  // Skip other validation plugins
    };
  }

  // Normal validation
  return { success: true };
}
```

### 6. Version Your Plugins

Follow semantic versioning:

- **Major (1.0.0 → 2.0.0)**: Breaking changes to hook contracts
- **Minor (1.0.0 → 1.1.0)**: New hooks or features
- **Patch (1.0.0 → 1.0.1)**: Bug fixes

### 7. Document Dependencies

If your plugin requires external packages:

```javascript
export default {
  name: "slack-notifier",
  version: "1.0.0",
  description: "Sends notifications to Slack. Requires: SLACK_WEBHOOK_URL env var",

  hooks: {
    "post:export": async (context) => {
      if (!process.env.SLACK_WEBHOOK_URL) {
        console.log("ℹ️  Set SLACK_WEBHOOK_URL to enable Slack notifications");
        return { success: true };  // Don't fail if optional
      }
      // ... send notification
    },
  },
};
```

### 8. Make Side Effects Optional

Don't force behavior on users:

```javascript
// Good: Configurable behavior
export default {
  name: "logger",
  version: "1.0.0",
  hooks: {
    "post:export": async (context) => {
      // Only log if explicitly enabled
      if (process.env.ENABLE_EXPORT_LOGGING === "true") {
        await writeLog(context);
      }
      return { success: true };
    },
  },
};
```

### 9. Don't Modify Core Framework State

Plugins should be read-only on context:

```javascript
// Good: Read context, return data
"post:export": async (context) => {
  const analysis = analyzeProject(context.projectDir);
  return { success: true, data: analysis };
}

// Bad: Modify context (doesn't work anyway)
"post:export": async (context) => {
  context.customField = "value";  // ❌ Context is immutable
  return { success: true };
}
```

### 10. Test Your Plugins

Write tests for plugin hooks:

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import plugin from './my-plugin.mjs';

describe('my-plugin', () => {
  it('validates project names', async () => {
    const context = {
      projectName: "valid-name",
      projectDir: "/tmp/test",
      templateId: "saas",
      flags: {},
    };

    const result = await plugin.hooks["pre:export"](context);
    assert.equal(result.success, true);
  });

  it('rejects invalid names', async () => {
    const context = {
      projectName: "Invalid_Name",
      projectDir: "/tmp/test",
      templateId: "saas",
      flags: {},
    };

    const result = await plugin.hooks["pre:export"](context);
    assert.equal(result.success, false);
    assert.match(result.message, /invalid/i);
  });
});
```

## Testing Plugins

### Manual Testing

```bash
# 1. Validate plugin structure
framework plugin info ./my-plugin.mjs

# 2. Add to test project
cd test-project
framework plugin add ../my-plugin.mjs

# 3. Test with export
framework export saas ./test-output

# 4. Verify behavior
cat .dd/export-log.json

# 5. Remove plugin
framework plugin remove my-plugin
```

### Automated Testing

```javascript
// test/my-plugin.test.mjs
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import plugin from '../plugins/my-plugin.mjs';

describe('my-plugin', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugin-test-'));
  });

  describe('pre:export hook', () => {
    it('validates project names', async () => {
      const context = {
        projectName: "valid-name",
        projectDir: path.join(tempDir, "valid-name"),
        templateId: "saas",
        flags: {},
      };

      const result = await plugin.hooks["pre:export"](context);

      assert.equal(result.success, true);
      assert.ok(result.message);
    });

    it('rejects uppercase names', async () => {
      const context = {
        projectName: "InvalidName",
        projectDir: path.join(tempDir, "InvalidName"),
        templateId: "saas",
        flags: {},
      };

      const result = await plugin.hooks["pre:export"](context);

      assert.equal(result.success, false);
      assert.match(result.message, /lowercase/);
    });

    it('rejects underscores', async () => {
      const context = {
        projectName: "invalid_name",
        projectDir: path.join(tempDir, "invalid_name"),
        templateId: "saas",
        flags: {},
      };

      const result = await plugin.hooks["pre:export"](context);

      assert.equal(result.success, false);
    });
  });

  describe('post:export hook', () => {
    it('creates log file', async () => {
      const logDir = path.join(tempDir, ".dd");
      fs.mkdirSync(logDir, { recursive: true });

      const context = {
        projectName: "test-project",
        projectDir: tempDir,
        templateId: "saas",
        flags: {},
        gitInitialized: true,
      };

      const result = await plugin.hooks["post:export"](context);

      assert.equal(result.success, true);

      const logPath = path.join(logDir, "export-log.json");
      assert.ok(fs.existsSync(logPath));

      const log = JSON.parse(fs.readFileSync(logPath, "utf8"));
      assert.ok(Array.isArray(log));
      assert.equal(log.length, 1);
      assert.equal(log[0].project, "test-project");
    });
  });
});
```

## Distribution

### Local Development

```bash
# Use relative or absolute path
framework plugin add ./plugins/my-plugin.mjs
framework plugin add /absolute/path/to/plugin.mjs
```

### npm Package

```bash
# 1. Create package
mkdir framework-plugin-myfeature
cd framework-plugin-myfeature

# 2. Create package.json
cat > package.json << EOF
{
  "name": "@myorg/framework-plugin-myfeature",
  "version": "1.0.0",
  "description": "My custom framework plugin",
  "main": "index.mjs",
  "type": "module",
  "keywords": ["framework", "plugin"],
  "author": "Your Name"
}
EOF

# 3. Create plugin
cat > index.mjs << EOF
export default {
  name: "myfeature",
  version: "1.0.0",
  hooks: { /* ... */ }
};
EOF

# 4. Publish
npm publish

# 5. Users install
npm install -g @myorg/framework-plugin-myfeature
framework plugin add @myorg/framework-plugin-myfeature
```

### GitHub Distribution (Future)

```bash
# Direct from GitHub
framework plugin add github:user/repo/plugin.mjs

# Specific version
framework plugin add github:user/repo/plugin.mjs#v1.2.0
```

## Related Concepts

- **[Integrations](./integrations.md)**: Pre-built service integrations
- **[Capabilities](./capabilities.md)**: Plan-gated features
- **[Agent Safety](./agent-safety.md)**: Safety features for AI agents
- **[Drift Detection](./drift-detection.md)**: Track template changes

## Next Steps

- Read the [Plugin API Documentation](/Users/joseph.dawson/Documents/dawson-does-framework/docs/PLUGIN_API.md)
- Explore [Example Plugins](/Users/joseph.dawson/Documents/dawson-does-framework/docs/examples/)
- Learn about [Hook Points](/Users/joseph.dawson/Documents/dawson-does-framework/docs/PLUGIN_API.md#available-hooks)
- Create your [First Plugin](/Users/joseph.dawson/Documents/dawson-does-framework/docs/guides/creating-plugins.md)

---

**Previous**: [Integrations](./integrations.md)
**Next**: [Drift Detection](./drift-detection.md)
