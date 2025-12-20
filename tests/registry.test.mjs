import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  validateTemplateMetadata,
  loadTemplateMetadata,
  discoverLocalTemplates,
  searchTemplates,
  filterByCategory,
  filterByTag,
  sortTemplates,
  getTemplateById,
  getCategories,
  getTags,
  isCompatible,
} from "../src/dd/registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, "fixtures", "registry");

// Ensure fixtures directory exists
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

test("registry: validateTemplateMetadata accepts valid metadata", () => {
  const metadata = {
    id: "test-template",
    name: "Test Template",
    version: "1.0.0",
    description: "A test template",
    tags: ["test"],
    capabilities: ["auth"],
  };

  const result = validateTemplateMetadata(metadata);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test("registry: validateTemplateMetadata rejects missing id", () => {
  const metadata = {
    name: "Test Template",
    version: "1.0.0",
    description: "A test template",
  };

  const result = validateTemplateMetadata(metadata);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("id")));
});

test("registry: validateTemplateMetadata rejects missing name", () => {
  const metadata = {
    id: "test",
    version: "1.0.0",
    description: "A test template",
  };

  const result = validateTemplateMetadata(metadata);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("name")));
});

test("registry: validateTemplateMetadata rejects missing version", () => {
  const metadata = {
    id: "test",
    name: "Test",
    description: "A test template",
  };

  const result = validateTemplateMetadata(metadata);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("version")));
});

test("registry: validateTemplateMetadata rejects invalid tags", () => {
  const metadata = {
    id: "test",
    name: "Test",
    version: "1.0.0",
    description: "Test",
    tags: "not-an-array",
  };

  const result = validateTemplateMetadata(metadata);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes("tags")));
});

test("registry: searchTemplates filters by id", () => {
  const templates = [
    { id: "saas", name: "SaaS", description: "A SaaS template" },
    { id: "blog", name: "Blog", description: "A blog template" },
  ];

  const results = searchTemplates(templates, "saas");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "saas");
});

test("registry: searchTemplates filters by name", () => {
  const templates = [
    { id: "saas", name: "SaaS Starter", description: "A SaaS template" },
    { id: "blog", name: "Blog", description: "A blog template" },
  ];

  const results = searchTemplates(templates, "starter");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "saas");
});

test("registry: searchTemplates filters by description", () => {
  const templates = [
    { id: "saas", name: "SaaS", description: "A subscription template" },
    { id: "blog", name: "Blog", description: "A blog template" },
  ];

  const results = searchTemplates(templates, "subscription");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "saas");
});

test("registry: searchTemplates filters by tags", () => {
  const templates = [
    { id: "saas", name: "SaaS", tags: ["nextjs", "react"] },
    { id: "blog", name: "Blog", tags: ["gatsby", "react"] },
  ];

  const results = searchTemplates(templates, "nextjs");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "saas");
});

test("registry: searchTemplates is case insensitive", () => {
  const templates = [
    { id: "saas", name: "SaaS Starter", description: "Test" },
  ];

  const results = searchTemplates(templates, "SAAS");
  assert.equal(results.length, 1);
});

test("registry: searchTemplates returns all when query is empty", () => {
  const templates = [
    { id: "saas", name: "SaaS" },
    { id: "blog", name: "Blog" },
  ];

  const results = searchTemplates(templates, "");
  assert.equal(results.length, 2);
});

test("registry: filterByCategory filters correctly", () => {
  const templates = [
    { id: "saas", category: "SaaS" },
    { id: "blog", category: "Blog" },
    { id: "docs", category: "SaaS" },
  ];

  const results = filterByCategory(templates, "SaaS");
  assert.equal(results.length, 2);
  assert.ok(results.every(t => t.category === "SaaS"));
});

test("registry: filterByCategory is case insensitive", () => {
  const templates = [
    { id: "saas", category: "SaaS" },
  ];

  const results = filterByCategory(templates, "saas");
  assert.equal(results.length, 1);
});

test("registry: filterByTag filters correctly", () => {
  const templates = [
    { id: "saas", tags: ["nextjs", "react"] },
    { id: "blog", tags: ["gatsby"] },
  ];

  const results = filterByTag(templates, "nextjs");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "saas");
});

test("registry: filterByTag is case insensitive", () => {
  const templates = [
    { id: "saas", tags: ["NextJS"] },
  ];

  const results = filterByTag(templates, "nextjs");
  assert.equal(results.length, 1);
});

test("registry: sortTemplates sorts by name", () => {
  const templates = [
    { id: "c", name: "Charlie" },
    { id: "a", name: "Alice" },
    { id: "b", name: "Bob" },
  ];

  const sorted = sortTemplates(templates, "name");
  assert.equal(sorted[0].name, "Alice");
  assert.equal(sorted[1].name, "Bob");
  assert.equal(sorted[2].name, "Charlie");
});

test("registry: sortTemplates sorts by id", () => {
  const templates = [
    { id: "c", name: "Charlie" },
    { id: "a", name: "Alice" },
    { id: "b", name: "Bob" },
  ];

  const sorted = sortTemplates(templates, "id");
  assert.equal(sorted[0].id, "a");
  assert.equal(sorted[1].id, "b");
  assert.equal(sorted[2].id, "c");
});

test("registry: sortTemplates sorts by category", () => {
  const templates = [
    { id: "a", name: "A", category: "Z" },
    { id: "b", name: "B", category: "A" },
    { id: "c", name: "C", category: "M" },
  ];

  const sorted = sortTemplates(templates, "category");
  assert.equal(sorted[0].category, "A");
  assert.equal(sorted[1].category, "M");
  assert.equal(sorted[2].category, "Z");
});

test("registry: getTemplateById returns correct template", () => {
  const templates = [
    { id: "saas", name: "SaaS" },
    { id: "blog", name: "Blog" },
  ];

  const result = getTemplateById(templates, "blog");
  assert.ok(result);
  assert.equal(result.id, "blog");
});

test("registry: getTemplateById returns undefined for missing template", () => {
  const templates = [
    { id: "saas", name: "SaaS" },
  ];

  const result = getTemplateById(templates, "nonexistent");
  assert.equal(result, undefined);
});

test("registry: getCategories returns unique categories", () => {
  const templates = [
    { id: "a", category: "SaaS" },
    { id: "b", category: "Blog" },
    { id: "c", category: "SaaS" },
  ];

  const categories = getCategories(templates);
  assert.equal(categories.length, 2);
  assert.ok(categories.includes("SaaS"));
  assert.ok(categories.includes("Blog"));
});

test("registry: getCategories returns sorted array", () => {
  const templates = [
    { id: "a", category: "Z" },
    { id: "b", category: "A" },
    { id: "c", category: "M" },
  ];

  const categories = getCategories(templates);
  assert.deepEqual(categories, ["A", "M", "Z"]);
});

test("registry: getTags returns unique tags", () => {
  const templates = [
    { id: "a", tags: ["nextjs", "react"] },
    { id: "b", tags: ["react", "gatsby"] },
  ];

  const tags = getTags(templates);
  assert.equal(tags.length, 3);
  assert.ok(tags.includes("nextjs"));
  assert.ok(tags.includes("react"));
  assert.ok(tags.includes("gatsby"));
});

test("registry: getTags returns sorted array", () => {
  const templates = [
    { id: "a", tags: ["z", "a", "m"] },
  ];

  const tags = getTags(templates);
  assert.deepEqual(tags, ["a", "m", "z"]);
});

test("registry: isCompatible returns true when no min version", () => {
  const template = { id: "test" };
  assert.equal(isCompatible(template, "1.0.0"), true);
});

test("registry: isCompatible returns true for exact version", () => {
  const template = { minFrameworkVersion: "1.0.0" };
  assert.equal(isCompatible(template, "1.0.0"), true);
});

test("registry: isCompatible returns true for higher version", () => {
  const template = { minFrameworkVersion: "1.0.0" };
  assert.equal(isCompatible(template, "2.0.0"), true);
});

test("registry: isCompatible returns false for lower version", () => {
  const template = { minFrameworkVersion: "2.0.0" };
  assert.equal(isCompatible(template, "1.0.0"), false);
});

test("registry: isCompatible handles minor versions", () => {
  const template = { minFrameworkVersion: "1.5.0" };
  assert.equal(isCompatible(template, "1.4.0"), false);
  assert.equal(isCompatible(template, "1.5.0"), true);
  assert.equal(isCompatible(template, "1.6.0"), true);
});

test("registry: loadTemplateMetadata returns null for missing file", () => {
  const testDir = path.join(FIXTURES_DIR, "no-metadata");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  fs.mkdirSync(testDir, { recursive: true });

  const metadata = loadTemplateMetadata(testDir);
  assert.equal(metadata, null);
});

test("registry: discoverLocalTemplates finds templates", () => {
  // Use actual templates directory
  const templatesDir = path.join(__dirname, "..", "templates");
  const templates = discoverLocalTemplates(templatesDir);

  assert.ok(Array.isArray(templates));
  assert.ok(templates.length > 0);
});

test("registry: discoverLocalTemplates returns empty for missing directory", () => {
  const testDir = path.join(FIXTURES_DIR, "nonexistent");
  const templates = discoverLocalTemplates(testDir);

  assert.deepEqual(templates, []);
});
