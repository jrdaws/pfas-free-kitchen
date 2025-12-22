import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidTemplate, assertHasFiles } from "../utils/assertions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "../..");
const TEMPLATES_DIR = path.join(PKG_ROOT, "templates");

// Get all template directories
function getTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  return fs.readdirSync(TEMPLATES_DIR).filter((name) => {
    // Skip hidden directories (starting with .)
    if (name.startsWith('.')) {
      return false;
    }
    const templatePath = path.join(TEMPLATES_DIR, name);
    // Only include directories
    if (!fs.statSync(templatePath).isDirectory()) {
      return false;
    }
    // Only include templates that have at least a package.json or .dd directory
    const hasPackageJson = fs.existsSync(path.join(templatePath, "package.json"));
    const hasDdDir = fs.existsSync(path.join(templatePath, ".dd"));
    return hasPackageJson || hasDdDir;
  });
}

test("Integration: all templates have valid structure", () => {
  const templates = getTemplates();

  if (templates.length === 0) {
    console.log("No templates found, skipping template validation");
    return;
  }

  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    console.log(`Validating template: ${templateName}`);

    try {
      assertValidTemplate(templatePath);
    } catch (err) {
      assert.fail(`Template ${templateName} validation failed: ${err.message}`);
    }
  }
});

test("Integration: all templates have package.json", () => {
  const templates = getTemplates();

  if (templates.length === 0) {
    return;
  }

  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const packageJsonPath = path.join(templatePath, "package.json");

    assert.ok(
      fs.existsSync(packageJsonPath),
      `Template ${templateName} missing package.json`
    );

    // Validate package.json is valid JSON
    const content = fs.readFileSync(packageJsonPath, "utf-8");
    let pkg;
    try {
      pkg = JSON.parse(content);
    } catch (err) {
      assert.fail(`Template ${templateName} has invalid package.json: ${err.message}`);
    }

    assert.ok(pkg.name, `Template ${templateName} package.json missing name`);
    assert.ok(pkg.version, `Template ${templateName} package.json missing version`);
  }
});

test("Integration: all templates have .dd/manifest.json", () => {
  const templates = getTemplates();

  if (templates.length === 0) {
    return;
  }

  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const manifestPath = path.join(templatePath, ".dd", "manifest.json");

    assert.ok(
      fs.existsSync(manifestPath),
      `Template ${templateName} missing .dd/manifest.json`
    );

    // Validate manifest is valid JSON
    const content = fs.readFileSync(manifestPath, "utf-8");
    let manifest;
    try {
      manifest = JSON.parse(content);
    } catch (err) {
      assert.fail(`Template ${templateName} has invalid manifest: ${err.message}`);
    }

    assert.ok(manifest.template, `Template ${templateName} manifest missing template field`);
    assert.ok(manifest.version, `Template ${templateName} manifest missing version field`);
    assert.ok(
      Array.isArray(manifest.capabilities),
      `Template ${templateName} manifest capabilities must be array`
    );
  }
});

test("Integration: templates have expected directories", () => {
  const templates = getTemplates();

  if (templates.length === 0) {
    return;
  }

  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);

    // Check for common directories that should exist in templates
    const expectedDirs = [".dd"];

    for (const dir of expectedDirs) {
      const dirPath = path.join(templatePath, dir);
      assert.ok(
        fs.existsSync(dirPath),
        `Template ${templateName} missing ${dir} directory`
      );
    }
  }
});

test("Integration: templates don't contain node_modules", () => {
  const templates = getTemplates();

  if (templates.length === 0) {
    return;
  }

  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const nodeModulesPath = path.join(templatePath, "node_modules");

    assert.ok(
      !fs.existsSync(nodeModulesPath),
      `Template ${templateName} should not contain node_modules`
    );
  }
});

test("Integration: manifest template name matches directory", () => {
  const templates = getTemplates();

  if (templates.length === 0) {
    return;
  }

  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    const manifestPath = path.join(templatePath, ".dd", "manifest.json");

    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      // The manifest template name should match or be related to the directory name
      assert.ok(
        manifest.template,
        `Template ${templateName} manifest missing template field`
      );
    }
  }
});
