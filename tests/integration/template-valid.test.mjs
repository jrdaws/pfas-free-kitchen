// tests/integration/template-valid.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertValidTemplate, assertPackageJson, assertFilesExist } from '../utils/assertions.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

// Get all template directories
function getTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  
  return fs.readdirSync(TEMPLATES_DIR).filter(name => {
    const templatePath = path.join(TEMPLATES_DIR, name);
    return fs.statSync(templatePath).isDirectory();
  });
}

const templates = getTemplates();

if (templates.length === 0) {
  console.log('Warning: No templates found in templates/ directory');
} else {
  // Test each template
  for (const templateName of templates) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);

    test(`template ${templateName}: has valid structure`, () => {
      assertValidTemplate(templatePath);
    });

    test(`template ${templateName}: has valid package.json`, () => {
      const packageJsonPath = path.join(templatePath, 'package.json');
      assertPackageJson(packageJsonPath, ['name', 'version', 'scripts']);

      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for essential scripts
      assert(pkg.scripts.dev, `${templateName}: missing 'dev' script`);
      assert(pkg.scripts.build, `${templateName}: missing 'build' script`);
    });

    test(`template ${templateName}: has README.md`, () => {
      assertFilesExist(templatePath, ['README.md']);
    });

    test(`template ${templateName}: has Next.js app directory`, () => {
      const appDir = path.join(templatePath, 'app');
      assert(fs.existsSync(appDir), `${templateName}: missing app/ directory`);
    });

    test(`template ${templateName}: has tsconfig.json`, () => {
      assertFilesExist(templatePath, ['tsconfig.json']);
      
      const tsconfigPath = path.join(templatePath, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      assert(tsconfig.compilerOptions, `${templateName}: tsconfig missing compilerOptions`);
    });

    test(`template ${templateName}: has .gitignore`, () => {
      assertFilesExist(templatePath, ['.gitignore']);
      
      const gitignorePath = path.join(templatePath, '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      
      // Check for essential patterns
      assert(gitignoreContent.includes('node_modules'), `${templateName}: .gitignore missing node_modules`);
      assert(gitignoreContent.includes('.env'), `${templateName}: .gitignore missing .env`);
    });

    test(`template ${templateName}: has required dependencies`, () => {
      const packageJsonPath = path.join(templatePath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      // Check for Next.js
      assert(deps.next, `${templateName}: missing 'next' dependency`);
      assert(deps.react, `${templateName}: missing 'react' dependency`);
      assert(deps['react-dom'], `${templateName}: missing 'react-dom' dependency`);
    });
  }

  test('all templates: have unique names', () => {
    const names = templates.map(t => {
      const pkgPath = path.join(TEMPLATES_DIR, t, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.name;
    });

    const uniqueNames = new Set(names);
    assert.equal(names.length, uniqueNames.size, 'Template package names must be unique');
  });
}
