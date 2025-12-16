# Dawson Does Framework Map

Generated: 2025-12-16T02:14:23.155Z

Git: main @ ab3d212

## Purpose
This file is the "road map" for humans and AI agents to understand the repo structure, entrypoints, capabilities, and how to troubleshoot.

## Entrypoints
- CLI entry: `bin/framework.js`
- Default template scaffold: `templates/`
- Prompts: `prompts/`
- Scripts/tools: `scripts/`

## Key Files

- `README.md` - ## Recommended Prompt Order
- `DESIGN.md` - ## Figma → shadcn Planning
- `.cursor/rules.md` - ## Dawson Does Framework - Chat Triggers
- `orchestrator.config.json` - {
- `.env.example` - # Figma
- `bin/framework.js` - #!/usr/bin/env node
- `scripts/orchestrator/capabilities.json` - {
- `scripts/orchestrator/capability-engine.mjs` - import fs from "node:fs";
- `scripts/orchestrator/project-config.mjs` - import fs from "node:fs";
- `scripts/orchestrator/cost.mjs` - import fs from "node:fs";
- `scripts/orchestrator/cost-summary.mjs` - import { summarizeUsage } from "./cost.mjs";
- `scripts/figma/parse-figma.mjs` - #!/usr/bin/env node
- `prompts/superprompt/v0.1.md` - You are Claude Code operating inside Cursor AND you are my AI EXECUTIVE SYSTEM.

## CLI Commands (from capabilities registry)

| Phrase | Command | Requires Env |
|---|---|---|
| Parse Figma (sections + frames) | `framework figma:parse` | FIGMA_TOKEN, FIGMA_FILE_KEY |
| Show cost summary | `framework cost:summary` |  |
| Print framework start prompt | `framework start` |  |

## Project Feature Toggles
Per-project toggles live at: `.dd/config.json` (within a project folder).

Typical flow:
- `framework capabilities <projectDir>`
- `framework phrases <projectDir>`
- `framework toggle <capId> on|off <projectDir>`

## Directory Index (tracked files)

### .cursor (1)
- `.cursor/rules.md`

### .dd (1)
- `.dd/config.json`

### .env.example (1)
- `.env.example`

### .githooks (1)
- `.githooks/pre-commit`

### .github (1)
- `.github/workflows/visual-regression.yml`

### .gitignore (1)
- `.gitignore`

### bin (1)
- `bin/framework.js`

### DESIGN.md (1)
- `DESIGN.md`

### FRAMEWORK_MAP.md (1)
- `FRAMEWORK_MAP.md`

### orchestrator.config.json (1)
- `orchestrator.config.json`

### package-lock.json (1)
- `package-lock.json`

### package.json (1)
- `package.json`

### prompts (8)
- `prompts/agents/executor.v0.1.md`
- `prompts/agents/research.v0.1.md`
- `prompts/agents/reviewer.v0.1.md`
- `prompts/orchestrator/handoff.research.md`
- `prompts/superprompt/v0.1.md`
- `prompts/tasks/figma-to-shadcn.md`
- `prompts/tasks/framework-start.md`
- `prompts/tasks/tasks.v0.1.yaml`

### README.md (1)
- `README.md`

### scripts (11)
- `scripts/figma/parse-figma.mjs`
- `scripts/meta/generate-framework-map.mjs`
- `scripts/orchestrate.mjs`
- `scripts/orchestrator/capabilities.json`
- `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/cost-summary.mjs`
- `scripts/orchestrator/cost.mjs`
- `scripts/orchestrator/project-config.mjs`
- `scripts/providers/anthropic.mjs`
- `scripts/providers/openai.mjs`
- `scripts/scaffold-tools.mjs`

### tasks (1)
- `tasks/README.md`

### templates (38)
- `templates/seo-directory/.cursor/rules.md`
- `templates/seo-directory/.env.local.example`
- `templates/seo-directory/.eslintrc.json`
- `templates/seo-directory/.github/workflows/ci.yml`
- `templates/seo-directory/.gitignore`
- `templates/seo-directory/.husky/pre-commit`
- `templates/seo-directory/.prettierignore`
- `templates/seo-directory/.prettierrc.json`
- `templates/seo-directory/PROJECT.md`
- `templates/seo-directory/README.md`
- `templates/seo-directory/components.json`
- `templates/seo-directory/eslint.config.mjs`
- `templates/seo-directory/next-env.d.ts`
- `templates/seo-directory/next.config.ts`
- `templates/seo-directory/package.json`
- `templates/seo-directory/postcss.config.mjs`
- `templates/seo-directory/prompts/agents/executor.v0.1.md`
- `templates/seo-directory/prompts/agents/research.v0.1.md`
- `templates/seo-directory/prompts/agents/reviewer.v0.1.md`
- `templates/seo-directory/prompts/superprompt/v0.1.md`
- `templates/seo-directory/public/file.svg`
- `templates/seo-directory/public/globe.svg`
- `templates/seo-directory/public/next.svg`
- `templates/seo-directory/public/vercel.svg`
- `templates/seo-directory/public/window.svg`
- `templates/seo-directory/src/app/favicon.ico`
- `templates/seo-directory/src/app/globals.css`
- `templates/seo-directory/src/app/layout.tsx`
- `templates/seo-directory/src/app/page.tsx`
- `templates/seo-directory/src/components/ui/badge.tsx`
- `templates/seo-directory/src/components/ui/button.tsx`
- `templates/seo-directory/src/components/ui/card.tsx`
- `templates/seo-directory/src/components/ui/input.tsx`
- `templates/seo-directory/src/components/ui/separator.tsx`
- `templates/seo-directory/src/components/ui/tabs.tsx`
- `templates/seo-directory/src/lib/utils.ts`
- `templates/seo-directory/tests/visual/home.spec.ts`
- `templates/seo-directory/tsconfig.json`

## Troubleshooting Quick Notes

- If CLI breaks, run: `node bin/framework.js help` and fix syntax errors first.
- If optional integrations are missing credentials, the correct behavior is to skip with a clear message.
- If Figma parsing fails, confirm `FIGMA_TOKEN` + `FIGMA_FILE_KEY` are set (or run without them).

