#!/usr/bin/env node
/**
 * scaffold-tools.mjs
 * Adds common dev tooling to a Next.js (or general JS/TS) project:
 * - ESLint + Prettier
 * - TypeScript strict mode toggle (best effort)
 * - Husky + lint-staged pre-commit
 * - Vitest (unit tests) - optional
 * - Playwright (e2e) - optional
 * - GitHub Actions CI workflow
 *
 * Usage:
 *   node scripts/scaffold-tools.mjs
 *
 * Run inside the target project folder (not the framework repo), or use the CLI later.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import enquirer from "enquirer";

const { prompt } = enquirer;

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", ...opts });
}

function exists(p) {
  return fs.existsSync(p);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

function appendIfMissing(p, needle, toAppend) {
  const cur = exists(p) ? fs.readFileSync(p, "utf8") : "";
  if (!cur.includes(needle)) {
    fs.writeFileSync(p, cur + (cur.endsWith("\n") || cur.length === 0 ? "" : "\n") + toAppend, "utf8");
  }
}

function detectPkgManager() {
  if (exists("pnpm-lock.yaml")) return { name: "pnpm", add: "pnpm add", addD: "pnpm add -D", dlx: "pnpm dlx", run: "pnpm" };
  if (exists("yarn.lock")) return { name: "yarn", add: "yarn add", addD: "yarn add -D", dlx: "yarn dlx", run: "yarn" };
  return { name: "npm", add: "npm i", addD: "npm i -D", dlx: "npx", run: "npm run" };
}

function upsertScripts(pkg, scripts) {
  pkg.scripts = pkg.scripts || {};
  for (const [k, v] of Object.entries(scripts)) {
    pkg.scripts[k] = pkg.scripts[k] || v;
  }
}

function upsertLintStaged(pkg) {
  pkg["lint-staged"] = pkg["lint-staged"] || {
    "*.{js,jsx,ts,tsx,json,md,css,scss}": ["prettier --write"],
    "*.{js,jsx,ts,tsx}": ["eslint --fix"],
  };
}

function bestEffortEnableTsStrict() {
  const tsconfigPath = "tsconfig.json";
  if (!exists(tsconfigPath)) return false;
  try {
    const raw = fs.readFileSync(tsconfigPath, "utf8");
    const parsed = JSON.parse(raw);
    parsed.compilerOptions = parsed.compilerOptions || {};
    // Only set if missing - do not stomp user choice
    if (parsed.compilerOptions.strict === undefined) parsed.compilerOptions.strict = true;
    if (parsed.compilerOptions.noUncheckedIndexedAccess === undefined) parsed.compilerOptions.noUncheckedIndexedAccess = true;
    if (parsed.compilerOptions.noImplicitOverride === undefined) parsed.compilerOptions.noImplicitOverride = true;
    fs.writeFileSync(tsconfigPath, JSON.stringify(parsed, null, 2) + "\n", "utf8");
    return true;
  } catch {
    // Many tsconfigs include comments; skip rather than break
    return false;
  }
}

function writePrettierConfig() {
  writeFile(".prettierrc.json", JSON.stringify({
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    printWidth: 100,
    tabWidth: 2
  }, null, 2) + "\n");

  appendIfMissing(".prettierignore", "node_modules", `node_modules
.next
dist
build
coverage
.vercel
`);
}

function writeEslintConfigIfMissing() {
  // If project already has eslint config, do not overwrite
  const candidates = ["eslint.config.js", ".eslintrc", ".eslintrc.json", ".eslintrc.js"];
  if (candidates.some(exists)) return;

  // Minimal Next.js-friendly config using eslint-config-next if available
  writeFile(".eslintrc.json", JSON.stringify({
    extends: ["next/core-web-vitals", "prettier"]
  }, null, 2) + "\n");
}

function writeGhActionsCI() {
  const wf = `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - name: Install
        run: npm ci
      - name: Lint
        run: npm run lint --if-present
      - name: Test
        run: npm run test --if-present
      - name: Build
        run: npm run build --if-present
`;
  writeFile(".github/workflows/ci.yml", wf);
}

function writeHuskyHook() {
  ensureDir(".husky");
  // husky install writes its own files; we only ensure pre-commit exists
  writeFile(".husky/pre-commit", `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
`);
  run("chmod +x .husky/pre-commit");
}

async function main() {
  if (!exists("package.json")) {
    console.error("No package.json found. Run this inside a JS/TS project folder.");
    process.exit(1);
  }

  const pkgMgr = detectPkgManager();

  const answers = await prompt([
    {
      type: "toggle",
      name: "addVitest",
      message: "Add Vitest (unit tests)?",
      initial: true,
      active: "yes",
      inactive: "no",
    },
    {
      type: "toggle",
      name: "addPlaywright",
      message: "Add Playwright (e2e tests)?",
      initial: false,
      active: "yes",
      inactive: "no",
    },
    {
      type: "toggle",
      name: "addHusky",
      message: "Add Husky + lint-staged (pre-commit checks)?",
      initial: true,
      active: "yes",
      inactive: "no",
    },
    {
      type: "toggle",
      name: "addCI",
      message: "Add GitHub Actions CI workflow?",
      initial: true,
      active: "yes",
      inactive: "no",
    },
    {
      type: "toggle",
      name: "tryStrictTs",
      message: "Try to enable TypeScript strict mode (best effort)?",
      initial: true,
      active: "yes",
      inactive: "no",
    },
  ]);

  const devDeps = [
    "prettier",
    "eslint-config-prettier",
  ];

  // ESLint is often already present with Next.js - install anyway if missing
  const pkg = readJson("package.json");
  const hasEslint = (pkg.devDependencies && pkg.devDependencies.eslint) || (pkg.dependencies && pkg.dependencies.eslint);
  if (!hasEslint) devDeps.push("eslint");

  if (answers.addVitest) {
    devDeps.push("vitest", "@vitest/ui");
  }

  if (answers.addPlaywright) {
    devDeps.push("@playwright/test");
  }

  if (answers.addHusky) {
    devDeps.push("husky", "lint-staged");
  }

  console.log("\nInstalling dev dependencies...\n");
  run(`${pkgMgr.addD} ${devDeps.join(" ")}`);

  console.log("\nWriting config files...\n");
  writePrettierConfig();
  writeEslintConfigIfMissing();

  const pkg2 = readJson("package.json");

  upsertScripts(pkg2, {
    format: "prettier --write .",
    lint: pkg2.scripts?.lint || "eslint .",
    test: answers.addVitest ? "vitest" : (pkg2.scripts?.test || "echo \"no tests configured\""),
  });

  if (answers.addPlaywright) {
    pkg2.scripts["test:e2e"] = pkg2.scripts["test:e2e"] || "playwright test";
  }

  if (answers.addHusky) {
    upsertLintStaged(pkg2);
  }

  writeJson("package.json", pkg2);

  if (answers.tryStrictTs) {
    const did = bestEffortEnableTsStrict();
    if (!did) {
      console.log("Skipped strict TS: tsconfig.json missing or not JSON-parsable (comments).");
    }
  }

  if (answers.addCI) {
    writeGhActionsCI();
  }

  if (answers.addHusky) {
    console.log("\nInitializing Husky...\n");
    // Husky v9 uses "husky init" to create .husky and sample hook
    // Use npx to avoid relying on global installs
    run("npx husky init");
    writeHuskyHook();
  }

  if (answers.addPlaywright) {
    console.log("\nInstalling Playwright browsers (this can take a bit)...\n");
    run("npx playwright install");
  }

  console.log("\nDone.\nNext:");
  console.log("- Run: npm run lint");
  console.log("- Run: npm run format");
  if (answers.addVitest) console.log("- Run: npm run test");
  if (answers.addPlaywright) console.log("- Run: npm run test:e2e");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
