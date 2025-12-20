/**
 * Example Plugin for dawson-does-framework
 *
 * This plugin demonstrates:
 * - Hook implementation
 * - Context access
 * - Success/failure handling
 * - Plugin metadata
 */

export default {
  name: "example-plugin",
  version: "1.0.0",
  description: "Example plugin demonstrating the plugin system",
  author: "Dawson Framework Team",
  capabilities: ["export", "logging"],

  hooks: {
    /**
     * Pre-export hook: Runs before template export begins
     */
    "pre:export": async (context) => {
      console.log(`\n[Example Plugin] Pre-export hook triggered`);
      console.log(`  Template: ${context.templateId}`);
      console.log(`  Project: ${context.projectName}`);
      console.log(`  Directory: ${context.projectDir}`);

      // Example: Validate project name
      if (context.projectName.length < 3) {
        return {
          success: false,
          message: "Project name must be at least 3 characters",
        };
      }

      return {
        success: true,
        message: "Pre-export validation passed",
      };
    },

    /**
     * Post-export:clone hook: Runs after template is cloned
     */
    "post:export:clone": async (context) => {
      console.log(`\n[Example Plugin] Post-clone hook triggered`);
      console.log(`  Manifest: ${context.manifestPath}`);

      // Example: Log clone success
      return {
        success: true,
        message: "Template cloned successfully",
        data: {
          timestamp: new Date().toISOString(),
        },
      };
    },

    /**
     * Post-export hook: Runs after export completes
     */
    "post:export": async (context) => {
      console.log(`\n[Example Plugin] Post-export hook triggered`);
      console.log(`  Git initialized: ${context.gitInitialized}`);
      console.log(`  Remote configured: ${context.remoteConfigured}`);

      // Example: Log export completion
      return {
        success: true,
        message: "Export workflow completed",
        data: {
          projectDir: context.projectDir,
          completedAt: new Date().toISOString(),
        },
      };
    },

    /**
     * Pre-doctor hook: Runs before health check
     */
    "pre:doctor": async (context) => {
      console.log(`\n[Example Plugin] Pre-doctor hook triggered`);

      // Example: Perform custom health checks
      return {
        success: true,
        message: "Custom health checks passed",
      };
    },
  },
};
