# FRAMEWORK_MAP

Generated: 2025-12-16T05:07:05.818Z
Hash: 01e6fa6159

## Recent changes
- f33ebba 2025-12-15 Add repo health script
e66266a 2025-12-15 Auto-refresh FRAMEWORK_MAP on capabilities/phrases
7558ac8 2025-12-15 Ignore backup files
140e1b8 2025-12-15 Fix framework-map recentChanges + remove duplicate dispatcher block
6ffa4d1 2025-12-15 Add optional Google/Meta/Apple integration scaffolding + capabilities
3745882 2025-12-15 Update framework map + hooks
404f57f 2025-12-15 Update husky hook header for v10 compatibility
5ac3efb 2025-12-15 Add provider-agnostic platform core + capability annotations + auto-regenerated FRAMEWORK_MAP
f865806 2025-12-15 Add auto-generated FRAMEWORK_MAP (BFS + tree + reverse graph + tiers) and enforce updates
486ba3f 2025-12-15 Make call graph recursive BFS from bin/framework.js
e7e8d37 2025-12-15 Enhance FRAMEWORK_MAP: call graph + tiered capabilities + recent changes
a5f741c 2025-12-15 Add auto-updating framework map for agents (docs/FRAMEWORK_MAP.md)
096c196 2025-12-15 Add auto-updating FRAMEWORK_MAP.md (repo roadmap for agents)
ab3d212 2025-12-15 Fix syntax error in CLI (remove extra brace)
ee2f188 2025-12-15 Fix CLI dispatcher so phrases/capabilities/toggle work
3c49fba 2025-12-15 Add dynamic phrases/capabilities/toggles + optional figma + superprompt section
b520656 2025-12-15 Add framework function phrases + capability negotiation
6596592 2025-12-15 Make Figma parsing optional when env vars missing
57341d7 2025-12-15 Fix CLI dispatcher (framework start)
6558946 2025-12-15 Ignore local scratch projects (next-seo-template, test-project)
3fe9b34 2025-12-15 Add framework start CLI, Figma parsing, PR visual workflow, and agent cost logging
0a40cc4 2025-12-15 Add standardized design rules (shadcn + figma + dribbble)
658b7b9 2025-12-15 Add design system and UI workflow (shadcn + figma + dribbble)
f612f6f 2025-12-14 Add multi-model orchestrator (start/follow-rules/compacting)
0941329 2025-12-14 Add template-local gitignore

## Capability registry
| id | tier | optional | color | phrase | command | paths |
|---|---|---:|---|---|---|---|
| `start.prompt` | `free` | no | `green` | Print framework start prompt | `framework start` | `prompts/tasks/framework-start.md`, `bin/framework.js` |
| `figma.parse` | `pro` | yes | `blue` | Parse Figma (sections + frames) | `framework figma:parse` | `scripts/figma/parse-figma.mjs`, `.env.example`, `bin/framework.js` |
| `cost.logging` | `free` | yes | `purple` | Show cost summary | `framework cost:summary` | `scripts/orchestrator/cost.mjs`, `scripts/orchestrator/cost-summary.mjs`, `bin/framework.js` |
| `integrations.google.gmail` | `team` | yes | `blue` | Enable Google OAuth + Gmail API scaffolding | `docs: open docs/integrations/google-gmail.md` | `src/platform/integrations/google/index.ts`, `docs/integrations/google-gmail.md`, `.env.example` |
| `integrations.meta.graph` | `team` | yes | `blue` | Enable Meta OAuth + Graph API scaffolding | `docs: open docs/integrations/meta.md` | `src/platform/integrations/meta/index.ts`, `docs/integrations/meta.md`, `.env.example` |
| `auth.apple` | `team` | yes | `blue` | Enable Apple Sign In scaffolding | `docs: open docs/integrations/apple.md` | `src/platform/integrations/apple/index.ts`, `docs/integrations/apple.md`, `.env.example` |

## Call Graph (Execution BFS)
Used for: runtime reasoning, blast-radius analysis, debugging

- `bin/framework.js`  -  start.prompt [free/required/green], figma.parse [pro/optional/blue], cost.logging [free/optional/purple]
  - `scripts/orchestrator/project-config.mjs`
  - `scripts/orchestrator/capability-engine.mjs`

## Dependency Tree (Structural)
Used for: onboarding, refactors, capability ownership

- `bin/framework.js`  -  start.prompt [free/required/green], figma.parse [pro/optional/blue], cost.logging [free/optional/purple]
- `├─ scripts/orchestrator/project-config.mjs`
- `│  scripts/orchestrator/project-config.mjs`
- `└─ scripts/orchestrator/capability-engine.mjs`
- `   scripts/orchestrator/capability-engine.mjs`
- `   └─ scripts/orchestrator/project-config.mjs`
- `      scripts/orchestrator/project-config.mjs`

## Reverse graph (What depends on this file)

- `scripts/orchestrator/project-config.mjs` <- `bin/framework.js`, `scripts/orchestrator/capability-engine.mjs`
- `scripts/orchestrator/capability-engine.mjs` <- `bin/framework.js`

## Notes
- Optional integrations should never block progress. If env is missing, skip with a clear message.

