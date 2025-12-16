# FRAMEWORK_MAP

Generated: 2025-12-16T03:22:53.823Z
Hash: 01e6fa6159

## Recent changes
- (git log unavailable)

## Capability registry
| id | tier | optional | color | phrase | command | paths |
|---|---|---:|---|---|---|---|
| `start.prompt` | `free` | no | `green` | Print framework start prompt | `framework start` | `prompts/tasks/framework-start.md`, `bin/framework.js` |
| `figma.parse` | `pro` | yes | `blue` | Parse Figma (sections + frames) | `framework figma:parse` | `scripts/figma/parse-figma.mjs`, `.env.example`, `bin/framework.js` |
| `cost.logging` | `free` | yes | `purple` | Show cost summary | `framework cost:summary` | `scripts/orchestrator/cost.mjs`, `scripts/orchestrator/cost-summary.mjs`, `bin/framework.js` |

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

