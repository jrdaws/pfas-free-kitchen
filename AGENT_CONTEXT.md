# Agent Context - Read This First

> This file provides essential context for AI agents working on the dawson-does-framework.
> **Every agent must read this file before starting work.**

---

## 🛑 MANDATORY VERIFICATION TEST

Before proceeding with ANY task, you must pass this verification. 
**Include your answers in your first response:**

### Questions (Answer All)

1. **Philosophy**: What does "export-first" mean in this project?
2. **Code Style**: What is the semicolon rule for `.mjs` files vs `.ts` files?
3. **Architecture**: Where is the main CLI entry point located?
4. **Forbidden**: Name 3 things you should NOT do.
5. **Process**: What command must you run before committing?

### Required Format
```
## Context Verification ✓
1. Export-first means: [your answer]
2. Semicolon rule: [your answer]
3. CLI entry point: [your answer]
4. Forbidden actions: [your answer]
5. Pre-commit command: [your answer]

I have read and understood AGENT_CONTEXT.md. Proceeding with task.
```

**If you cannot answer these questions, re-read this entire file before continuing.**

---

## Project Vision
Build a hybrid platform where users can prototype apps in a web UI, then export to full local ownership via a single `npx` command. Zero lock-in, unlimited customization.

## Core Philosophy
1. **Export-First**: Everything designed for local ownership
2. **Cursor-Native**: Optimized for Claude Code + Cursor workflow
3. **Zero Lock-In**: Platform is optional after export
4. **Transparency**: Explicit complexity, no magic black boxes
5. **Developer-Centric**: Built for developers, by developers

## Architecture Overview
```
dawson-does-framework/
├── bin/framework.js       # Main CLI entry point
├── src/dd/                 # Core framework modules
├── website/                # Next.js web configurator
├── templates/              # Starter templates (saas, seo-directory, etc.)
├── packages/               # Shared packages (ai-agent, deploy-engine, etc.)
└── docs/                   # Documentation
```

## Key Flows
1. **Web → Local**: User configures in web UI → saves to Supabase → `npx @jrdaws/framework pull <token>` → full project locally
2. **CLI Export**: `framework export saas ./my-app --auth supabase` → scaffolds project with integrations
3. **Development**: Open in Cursor → Claude Code assists → deploy

## Coding Standards
- **Language**: TypeScript for website, JavaScript (.mjs) for CLI
- **Style**: 2-space indent, no semicolons in .mjs, semicolons in .ts
- **Naming**: camelCase for functions/variables, PascalCase for components/classes
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Testing**: Node.js test runner for CLI, Playwright for E2E

## Integration Patterns
- Integrations are optional add-ons, never required
- Each integration has its own directory: `templates/{template}/integrations/{type}/{provider}/`
- Integration metadata lives in `integration.json`
- Missing env vars should warn, not error

## Error Handling
- Always provide actionable error messages
- Include recovery guidance (see `src/dd/recovery-guidance.mjs`)
- Never crash silently - log what went wrong

## Dependencies
- Minimize external dependencies
- Prefer Node.js built-ins when possible
- Pin versions in package.json

## What NOT to Do
- Don't add features not requested
- Don't refactor unrelated code
- Don't change shared configs without coordination
- Don't add console.log debugging (use logger.mjs)
- Don't commit .env files or secrets

## Before You Start
1. Run `git status` to see current state
2. Run `npm test` to ensure tests pass
3. Read the specific files for your task area
4. Ask if anything is unclear

## When You're Done
1. Run `npm test` to verify
2. Run `npm run lint` if available
3. Commit with conventional commit message
4. Note any follow-up tasks needed

---
*This context applies to all agents working on dawson-does-framework.*

