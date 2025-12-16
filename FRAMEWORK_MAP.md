# FRAMEWORK_MAP

Auto-generated. Do not edit manually.
Last updated: 2025-12-16T02:38:38.051Z

This file is the authoritative roadmap for humans and AI agents.

## Project Structure

- DESIGN.md
- FRAMEWORK_MAP.md
- README.md
- bin
  - framework.js
- docs
  - FRAMEWORK_MAP.md
- logs
- next-seo-template
  - PROJECT.md
  - README.md
  - components.json
  - eslint.config.mjs
  - next-env.d.ts
  - next.config.ts
  - package-lock.json
  - package.json
  - postcss.config.mjs
  - prompts
    - agents
      - executor.v0.1.md
      - research.v0.1.md
      - reviewer.v0.1.md
    - superprompt
      - v0.1.md
  - public
    - file.svg
    - globe.svg
    - next.svg
    - vercel.svg
    - window.svg
  - src
    - app
      - favicon.ico
      - globals.css
      - layout.tsx
      - page.tsx
    - components
      - ui
        - badge.tsx
        - button.tsx
        - card.tsx
        - input.tsx
        - separator.tsx
        - tabs.tsx
    - lib
      - utils.ts
  - tsconfig.json
- orchestrator.config.json
- package-lock.json
- package.json
- prompts
  - agents
    - executor.v0.1.md
    - research.v0.1.md
    - reviewer.v0.1.md
  - orchestrator
    - handoff.research.md
  - superprompt
    - v0.1.md
  - tasks
    - figma-to-shadcn.md
    - framework-start.md
    - tasks.v0.1.yaml
- scripts
  - figma
    - parse-figma.mjs
  - meta
    - generate-framework-map.mjs
  - orchestrate.mjs
  - orchestrator
    - capabilities.json
    - capability-engine.mjs
    - cost-summary.mjs
    - cost.mjs
    - generate-framework-map.mjs
    - project-config.mjs
  - providers
    - anthropic.mjs
    - openai.mjs
  - scaffold-tools.mjs
- tasks
  - README.md
- templates
  - automation
  - internal-tool
  - saas
  - seo-directory
    - PROJECT.md
    - README.md
    - components.json
    - eslint.config.mjs
    - next-env.d.ts
    - next.config.ts
    - package.json
    - postcss.config.mjs
    - prompts
      - agents
        - executor.v0.1.md
        - research.v0.1.md
        - reviewer.v0.1.md
      - superprompt
        - v0.1.md
    - public
      - file.svg
      - globe.svg
      - next.svg
      - vercel.svg
      - window.svg
    - src
      - app
        - favicon.ico
        - globals.css
        - layout.tsx
        - page.tsx
      - components
        - ui
      - lib
        - utils.ts
    - tests
      - visual
        - home.spec.ts
    - tsconfig.json
- test-project
  - PROJECT.md
  - README.md
  - package-lock.json
  - package.json
  - prompts
    - agents
      - executor.v0.1.md
      - research.v0.1.md
      - reviewer.v0.1.md
    - superprompt
      - v0.1.md

## CLI Commands (detected)

- `framework start`
- `framework capabilities`
- `framework phrases`
- `framework toggle`
- `framework figma:parse`
- `framework cost:summary`
- `framework start`
- `framework capabilities`
- `framework phrases`
- `framework toggle`
- `framework figma:parse`
- `framework cost:summary`
## Capabilities (tiered)

### free

- **start.prompt** - Print framework start prompt
  - Tier: `free`
  - Command: `framework start`

### pro

- **figma.parse** - Parse Figma (sections + frames)
  - Tier: `pro`
  - Command: `framework figma:parse` (env: FIGMA_TOKEN, FIGMA_FILE_KEY)
- **cost.logging** - Show cost summary
  - Tier: `pro`
  - Command: `framework cost:summary`

## Prompts & Agents

- agents
  - executor.v0.1.md
  - research.v0.1.md
  - reviewer.v0.1.md
- orchestrator
  - handoff.research.md
- superprompt
  - v0.1.md
- tasks
  - figma-to-shadcn.md
  - framework-start.md
  - tasks.v0.1.yaml

## Call Graph (simple import scan)

- **bin/framework.js**
  - calls/imports:
    - scripts/orchestrator/project-config.mjs
    - scripts/orchestrator/capability-engine.mjs
- **scripts/orchestrator/capability-engine.mjs**
  - calls/imports:
    - scripts/orchestrator/project-config.mjs
- **scripts/orchestrator/project-config.mjs**
  - calls/imports:
    - (none)
- **scripts/figma/parse-figma.mjs**
  - calls/imports:
    - (none)
- **scripts/orchestrator/cost.mjs**
  - calls/imports:
    - (none)
- **scripts/orchestrator/cost-summary.mjs**
  - calls/imports:
    - scripts/orchestrator/cost.mjs
## Recent Changes (git log)

- 2025-12-15 a5f741c Add auto-updating framework map for agents (docs/FRAMEWORK_MAP.md)
- 2025-12-15 096c196 Add auto-updating FRAMEWORK_MAP.md (repo roadmap for agents)
- 2025-12-15 ab3d212 Fix syntax error in CLI (remove extra brace)
- 2025-12-15 ee2f188 Fix CLI dispatcher so phrases/capabilities/toggle work
- 2025-12-15 3c49fba Add dynamic phrases/capabilities/toggles + optional figma + superprompt section
- 2025-12-15 b520656 Add framework function phrases + capability negotiation
- 2025-12-15 6596592 Make Figma parsing optional when env vars missing
- 2025-12-15 57341d7 Fix CLI dispatcher (framework start)
- 2025-12-15 6558946 Ignore local scratch projects (next-seo-template, test-project)
- 2025-12-15 3fe9b34 Add framework start CLI, Figma parsing, PR visual workflow, and agent cost logging
- 2025-12-15 0a40cc4 Add standardized design rules (shadcn + figma + dribbble)
- 2025-12-15 658b7b9 Add design system and UI workflow (shadcn + figma + dribbble)
- 2025-12-14 f612f6f Add multi-model orchestrator (start/follow-rules/compacting)
- 2025-12-14 0941329 Add template-local gitignore
- 2025-12-14 21a3109 Add gitignore for node_modules/.next/env
