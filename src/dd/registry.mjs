/**
 * Template Registry for dawson-does-framework
 *
 * Manages template discovery, metadata, and registry sources.
 * Supports local-first with future remote registry capability.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..", "..");

/**
 * Template metadata schema
 */
export const TEMPLATE_SCHEMA = {
  name: "string",
  id: "string",
  version: "string",
  description: "string",
  author: "string",
  category: "string",
  tags: "array",
  minFrameworkVersion: "string",
  capabilities: "array",
  dependencies: "object",
};

/**
 * Registry configuration
 */
export const DEFAULT_REGISTRY = {
  type: "local",
  path: path.join(PKG_ROOT, "templates"),
};

/**
 * Load template metadata from template.json
 */
export function loadTemplateMetadata(templatePath) {
  const metadataPath = path.join(templatePath, "template.json");

  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(content);
    return metadata;
  } catch (error) {
    console.error(`Failed to load template metadata: ${error.message}`);
    return null;
  }
}

/**
 * Validate template metadata structure
 */
export function validateTemplateMetadata(metadata) {
  const errors = [];

  if (!metadata.id || typeof metadata.id !== "string") {
    errors.push("Missing or invalid 'id' field");
  }

  if (!metadata.name || typeof metadata.name !== "string") {
    errors.push("Missing or invalid 'name' field");
  }

  if (!metadata.version || typeof metadata.version !== "string") {
    errors.push("Missing or invalid 'version' field");
  }

  if (!metadata.description || typeof metadata.description !== "string") {
    errors.push("Missing or invalid 'description' field");
  }

  if (metadata.tags && !Array.isArray(metadata.tags)) {
    errors.push("'tags' must be an array");
  }

  if (metadata.capabilities && !Array.isArray(metadata.capabilities)) {
    errors.push("'capabilities' must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Discover templates from local filesystem
 */
export function discoverLocalTemplates(registryPath = DEFAULT_REGISTRY.path) {
  const templates = [];

  if (!fs.existsSync(registryPath)) {
    return templates;
  }

  const entries = fs.readdirSync(registryPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const templatePath = path.join(registryPath, entry.name);
    const metadata = loadTemplateMetadata(templatePath);

    if (metadata) {
      templates.push({
        ...metadata,
        path: templatePath,
        source: "local",
      });
    } else {
      // Fallback for templates without template.json
      templates.push({
        id: entry.name,
        name: entry.name,
        version: "unknown",
        description: `Template: ${entry.name}`,
        category: "uncategorized",
        tags: [],
        capabilities: [],
        path: templatePath,
        source: "local",
        legacy: true,
      });
    }
  }

  return templates;
}

/**
 * Search templates by query
 */
export function searchTemplates(templates, query) {
  if (!query) return templates;

  const lowerQuery = query.toLowerCase();

  return templates.filter(template => {
    // Search in id, name, description
    if (template.id?.toLowerCase().includes(lowerQuery)) return true;
    if (template.name?.toLowerCase().includes(lowerQuery)) return true;
    if (template.description?.toLowerCase().includes(lowerQuery)) return true;

    // Search in tags
    if (template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
      return true;
    }

    // Search in category
    if (template.category?.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });
}

/**
 * Filter templates by category
 */
export function filterByCategory(templates, category) {
  if (!category) return templates;

  return templates.filter(
    template => template.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Filter templates by tag
 */
export function filterByTag(templates, tag) {
  if (!tag) return templates;

  return templates.filter(template =>
    template.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Sort templates by various criteria
 */
export function sortTemplates(templates, sortBy = "name") {
  const sorted = [...templates];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "id":
      return sorted.sort((a, b) => a.id.localeCompare(b.id));

    case "category":
      return sorted.sort((a, b) => {
        const catA = a.category || "zzz";
        const catB = b.category || "zzz";
        return catA.localeCompare(catB);
      });

    default:
      return sorted;
  }
}

/**
 * Get template by ID
 */
export function getTemplateById(templates, id) {
  return templates.find(template => template.id === id);
}

/**
 * Get all categories from templates
 */
export function getCategories(templates) {
  const categories = new Set();

  for (const template of templates) {
    if (template.category) {
      categories.add(template.category);
    }
  }

  return Array.from(categories).sort();
}

/**
 * Get all tags from templates
 */
export function getTags(templates) {
  const tags = new Set();

  for (const template of templates) {
    if (template.tags) {
      for (const tag of template.tags) {
        tags.add(tag);
      }
    }
  }

  return Array.from(tags).sort();
}

/**
 * Check framework version compatibility
 */
export function isCompatible(template, frameworkVersion) {
  if (!template.minFrameworkVersion) return true;

  // Simple semver comparison (major.minor.patch)
  const [reqMajor, reqMinor] = template.minFrameworkVersion.split(".").map(Number);
  const [fwMajor, fwMinor] = frameworkVersion.split(".").map(Number);

  if (reqMajor > fwMajor) return false;
  if (reqMajor === fwMajor && reqMinor > fwMinor) return false;

  return true;
}

/**
 * Remote registry support (future)
 */
export async function fetchRemoteRegistry(registryUrl) {
  try {
    const response = await fetch(registryUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.statusText}`);
    }

    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    throw new Error(`Remote registry error: ${error.message}`);
  }
}

/**
 * Merge multiple registry sources
 */
export function mergeRegistries(registries) {
  const templates = [];
  const seen = new Set();

  for (const registry of registries) {
    for (const template of registry) {
      // Deduplicate by ID
      if (!seen.has(template.id)) {
        templates.push(template);
        seen.add(template.id);
      }
    }
  }

  return templates;
}

/**
 * Load registry configuration from .dd/config.json
 */
export function loadRegistryConfig(projectDir = ".") {
  const configPath = path.join(projectDir, ".dd", "config.json");

  if (!fs.existsSync(configPath)) {
    return { registries: [DEFAULT_REGISTRY] };
  }

  try {
    const content = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(content);

    return {
      registries: config.registries || [DEFAULT_REGISTRY],
    };
  } catch (error) {
    return { registries: [DEFAULT_REGISTRY] };
  }
}
