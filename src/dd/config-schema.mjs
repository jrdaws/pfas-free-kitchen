/**
 * JSON Schema and validation for .dd/config.json
 */

export const CONFIG_SCHEMA = {
  type: "object",
  properties: {
    plan: {
      type: "string",
      enum: ["free", "pro", "team"],
      description: "Plan tier for capability access control"
    },
    featureOverrides: {
      type: "object",
      additionalProperties: { type: "boolean" },
      description: "Explicit capability enable/disable overrides"
    },
    integrations: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          enabled: { type: "boolean" }
        },
        additionalProperties: true
      },
      description: "Integration-specific configuration"
    },
    afterInstall: {
      type: "object",
      properties: {
        policy: {
          type: "string",
          enum: ["prompt", "auto", "off"]
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

/**
 * Validate config object against schema
 * @param {object} config - Config object to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateConfig(config) {
  const errors = [];

  if (typeof config !== "object" || config === null) {
    return { valid: false, errors: ["Config must be an object"] };
  }

  // Validate plan
  if (config.plan !== undefined) {
    if (!["free", "pro", "team"].includes(config.plan)) {
      errors.push(`Invalid plan: "${config.plan}". Must be one of: free, pro, team`);
    }
  }

  // Validate featureOverrides
  if (config.featureOverrides !== undefined) {
    if (typeof config.featureOverrides !== "object" || config.featureOverrides === null) {
      errors.push("featureOverrides must be an object");
    } else {
      for (const [key, value] of Object.entries(config.featureOverrides)) {
        if (typeof value !== "boolean") {
          errors.push(`featureOverrides["${key}"] must be a boolean, got ${typeof value}`);
        }
      }
    }
  }

  // Validate integrations
  if (config.integrations !== undefined) {
    if (typeof config.integrations !== "object" || config.integrations === null) {
      errors.push("integrations must be an object");
    } else {
      for (const [intName, intConfig] of Object.entries(config.integrations)) {
        if (typeof intConfig !== "object" || intConfig === null) {
          errors.push(`integrations["${intName}"] must be an object`);
        } else if (intConfig.enabled !== undefined && typeof intConfig.enabled !== "boolean") {
          errors.push(`integrations["${intName}"].enabled must be a boolean`);
        }
      }
    }
  }

  // Validate afterInstall
  if (config.afterInstall !== undefined) {
    if (typeof config.afterInstall !== "object" || config.afterInstall === null) {
      errors.push("afterInstall must be an object");
    } else if (config.afterInstall.policy !== undefined) {
      if (!["prompt", "auto", "off"].includes(config.afterInstall.policy)) {
        errors.push(`afterInstall.policy must be one of: prompt, auto, off. Got "${config.afterInstall.policy}"`);
      }
    }
  }

  // Check for unknown top-level keys
  const knownKeys = ["plan", "featureOverrides", "integrations", "afterInstall"];
  const unknownKeys = Object.keys(config).filter(k => !knownKeys.includes(k));
  if (unknownKeys.length > 0) {
    errors.push(`Unknown config keys: ${unknownKeys.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}
