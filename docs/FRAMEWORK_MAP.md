# Dawson Does Framework Map

Last generated: `2025-12-16T02:24:30.583Z`
Repo HEAD: `096c1966b95ccc0530ba814989c444e2f0666729`

## What this is
This file is a living roadmap for humans + AI agents: structure, entrypoints, commands, key docs, and where to modify things safely.

## Top-level structure (tracked files)
- `templates/` (38 files)
- `scripts/` (12 files)
- `prompts/` (8 files)
- `.cursor/` (1 files)
- `.dd/` (1 files)
- `.env.example/` (1 files)
- `.githooks/` (1 files)
- `.github/` (1 files)
- `.gitignore/` (1 files)
- `.husky/` (1 files)
- `DESIGN.md/` (1 files)
- `FRAMEWORK_MAP.md/` (1 files)
- `README.md/` (1 files)
- `bin/` (1 files)
- `docs/` (1 files)
- `orchestrator.config.json/` (1 files)
- `package-lock.json/` (1 files)
- `package.json/` (1 files)
- `tasks/` (1 files)

## Key entrypoints
- CLI: `bin/framework.js`
- Prompts: `prompts/`
- Templates: `templates/`
- Automation scripts: `scripts/`
- Cursor rules: `.cursor/rules.md`

## “Start here” docs
- `README.md`
- `DESIGN.md`
- `.cursor/rules.md`
- `prompts/superprompt/v0.1.md`
- `orchestrator.config.json`
- `scripts/orchestrator/capabilities.json`
- `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/project-config.mjs`
- `scripts/figma/parse-figma.mjs`
- `bin/framework.js`

## CLI commands detected
- `framework capabilities`
- `framework cost:summary`
- `framework figma:parse`
- `framework phrases`
- `framework start`
- `framework toggle`

## Capability registry
- `figma.parse` (Parse Figma (sections + frames))
  - Command: `framework figma:parse`
  - Requires env: `FIGMA_TOKEN, FIGMA_FILE_KEY`
- `cost.logging` (Show cost summary)
  - Command: `framework cost:summary`
  - Requires env: `none`
- `start.prompt` (Print framework start prompt)
  - Command: `framework start`
  - Requires env: `none`

## Update rules (for agents)
- Any new script/feature should update:
  - `scripts/orchestrator/capabilities.json` (capability + phrase + command)
  - `bin/framework.js` (wire command)
  - `prompts/superprompt/v0.1.md` (capability negotiation guidance if needed)
- Never break “optional integrations”: missing env must not block.
