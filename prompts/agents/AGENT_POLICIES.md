# Agent Policies

> **Version**: 1.2
> **Effective Date**: 2025-12-22
> **Latest Update**: Added AI Prompt Forbidden Patterns and PROMPT_STANDARDS.md reference
> **Purpose**: Define operational policies and protocols for AI agents working on dawson-does-framework

---

## Overview

This document establishes the governance framework for AI agents working on the dawson-does-framework project. All agents must follow these policies to ensure consistent, high-quality contributions that align with project philosophy.

---

## Core Principles

### 1. Export-First Architecture
- **All code must support local ownership**: Users can export and run projects without platform dependency
- **No hidden platform coupling**: All integrations must be optional and clearly documented
- **Local-first development**: Prioritize local dev experience over platform features

### 2. Zero Lock-In
- **Platform services are optional**: Projects must work without platform connectivity
- **Standard patterns only**: Use industry-standard tools and patterns (Next.js, Supabase, etc.)
- **Clear migration paths**: Users can switch providers without major refactoring

### 3. Cursor-Native Development
- **Optimized for Claude Code**: Code and docs designed for AI-assisted development
- **Clear context boundaries**: Files organized for easy AI navigation
- **Explicit over implicit**: Prefer verbosity that aids AI understanding

### 4. Transparency
- **No magic**: All complexity must be explicit and understandable
- **Document decisions**: Include comments explaining non-obvious choices
- **Visible errors**: Never fail silently; always provide actionable feedback

### 5. Fail Gracefully
- **Actionable error messages**: Include recovery guidance in all errors
- **Degrade functionality**: Missing optional features shouldn't block core functionality
- **Clear recovery paths**: Use `src/dd/recovery-guidance.mjs` for error handling

---

## Agent Roles and Responsibilities

### Role Assignment
Each agent has a specific domain of responsibility. Agents must:
- Stay within their assigned role boundaries
- Request handoff when work crosses role boundaries
- Update their memory file after each session

### Available Roles

| Role | Domain | Key Files |
|------|--------|-----------|
| **CLI Agent** | Command-line interface, core modules | `bin/framework.js`, `src/dd/*.mjs` |
| **Website Agent** | Web configurator, Next.js app | `website/`, Next.js pages/components |
| **Template Agent** | Starter templates | `templates/`, `template.json` |
| **Integration Agent** | Third-party integrations | `integrations/`, provider implementations |
| **Documentation Agent** | Docs, guides, context files | `docs/`, `*.md`, `CLAUDE.md` |
| **Testing Agent** | Tests, CI/CD, quality | `tests/`, test infrastructure |
| **Platform Agent** | APIs, deployment, preview | `packages/`, API routes |

---

## Operational Protocols

### Session Initialization (MANDATORY)

Every agent session must begin with:

1. **Read Governance Documents**
   ```bash
   cat AGENT_CONTEXT.md
   ```

2. **Pass Verification Test**
   Answer the 5 questions in AGENT_CONTEXT.md to confirm understanding

3. **Identify Role**
   Based on task assignment, declare your role

4. **Load Role Context**
   Read your role file: `prompts/agents/roles/[ROLE]_AGENT.md`

5. **Load Memory**
   Read your memory file: `prompts/agents/memory/[ROLE]_MEMORY.md`

6. **Establish Continuity**
   State:
   - Last session summary
   - Current priorities from memory
   - Any known blockers

7. **Confirm Ready**
   State understanding of:
   - Your role and boundaries
   - Project philosophy
   - Current task objectives
   - Forbidden actions

### During Work

1. **Stay in Role**
   - Work only on files within your role's domain
   - Request handoff if work crosses boundaries

2. **Follow Code Standards**
   - JavaScript (.mjs): No semicolons, 2-space indent
   - TypeScript (.ts/.tsx): Semicolons, 2-space indent
   - Use `logger.mjs` instead of `console.log`

3. **Test Continuously**
   - Run `npm test` before committing
   - Fix any failing tests before moving on
   - Add tests for new functionality

4. **Document Changes**
   - Update relevant docs when behavior changes
   - Add comments for non-obvious code
   - Update FRAMEWORK_MAP.md if structure changes

### Session Completion (MANDATORY)

Before ending a session, you must:

1. **Update Memory File**
   Add a new entry to `prompts/agents/memory/[ROLE]_MEMORY.md`:
   ```markdown
   ## Session: YYYY-MM-DD HH:MM

   ### Work Completed
   - [Item 1]
   - [Item 2]

   ### Blockers Encountered
   - [Blocker 1, if any]

   ### Next Priorities
   1. [Priority 1]
   2. [Priority 2]

   ### Handoff Notes
   [Any context for next agent]
   ```

2. **Provide Summary**
   - What was accomplished
   - What was not completed and why
   - Test results

3. **Suggest Next Steps**
   - Recommended next tasks
   - Which agent should handle them
   - Any dependencies or blockers

4. **Generate Continuation Prompt**
   Provide a ready-to-use prompt for the next agent including:
   - Task description
   - Context from this session
   - Specific files to review
   - Success criteria

---

## Output Formatting Standards

### Fenced Output Integrity (MANDATORY)

**All agents must follow these rules when outputting code blocks, prompts, or documents.**

#### The One Block Rule
1. **NEVER split** a single logical piece of content across multiple fenced blocks
2. When asked for a complete file, prompt, or document - output the **ENTIRE** content in **ONE** fenced block
3. Do not interrupt fenced content with explanatory text - put all explanations **BEFORE** or **AFTER** the fence
4. If you need to add commentary about code, use **comments INSIDE the fence**, not by breaking out of it
5. Before closing a fence, verify: "Have I included ALL the requested content?"

#### Structure for Long Outputs
When outputting long content, use this exact structure:
1. Brief explanation (1-2 sentences max)
2. ONE complete fenced block with ALL content
3. Any follow-up notes AFTER the fence closes

#### Pre-Output Verification
Before outputting fenced content, mentally verify:
1. Is this ONE continuous block?
2. Does it contain EVERYTHING requested?
3. Am I about to break out of the fence to explain something? (DON'T - use comments instead)
4. Is everything included?

#### ❌ Anti-Pattern (NEVER DO THIS)
```
Here's the first part:
\`\`\`
partial content...
\`\`\`
And here's more:
\`\`\`
rest of content...
\`\`\`
```

The above pattern forces users to copy from multiple locations - this is FORBIDDEN.

#### ✅ Correct Pattern (ALWAYS DO THIS)
```
Here's the complete content:
\`\`\`
ALL content in one block...
including everything...
nothing left out...
\`\`\`
```

#### Explanation Placement Rules
- **BEFORE**: All explanations go BEFORE the opening fence
- **AFTER**: Follow-up notes go AFTER the closing fence
- **NEVER BETWEEN**: NOTHING goes between multiple fences that should be one

#### Content Too Long?
If content is genuinely too long for one block:
1. **SAY SO EXPLICITLY**: Tell the user it's too long
2. **ASK FIRST**: Get confirmation before splitting
3. **LOGICAL BOUNDARIES**: If splitting is approved, split at natural boundaries (by file, by section)
4. **NEVER SILENTLY SPLIT**: Don't surprise the user with fragmented output

---

## Code Quality Standards

### Forbidden Actions

Agents must NEVER:
- Add features not explicitly requested
- Refactor code outside the task scope
- Change shared configurations without coordination
- Skip reading governance documents
- Commit secrets, API keys, or `.env` files
- Use `console.log` for debugging (use `logger.mjs`)
- Work outside their assigned role domain
- Skip the memory update at session end

### AI Prompt Forbidden Patterns

When writing AI prompts (in `packages/ai-agent/src/prompts/`), agents must NEVER:
- Start with "You are an expert..." (use action verbs)
- Add "IMPORTANT/CRITICAL/NOTE" markers (state constraints inline)
- Repeat "Return ONLY JSON" at the end (say it once in OUTPUT)
- Use verbose JSON schemas (use inline notation)
- Include explanatory prose about what AI should do (show patterns)

**Full guide:** `docs/standards/PROMPT_STANDARDS.md`

### Required Actions

Agents must ALWAYS:
- Read AGENT_CONTEXT.md before starting
- Pass the verification test
- Run `npm test` before committing
- Use conventional commit messages
- Update documentation when behavior changes
- Provide actionable error messages
- Follow the coding style for each language
- **Follow PROMPT_STANDARDS.md when writing AI prompts**
- Update their memory file at session end

---

## Handoff Protocol

When work requires another agent:

1. **Identify the Right Agent**
   Use the role table to determine which agent should handle the work

2. **Update Your Memory**
   Document what you completed and what remains

3. **Create Handoff Prompt**
   Use the template from `prompts/agents/HANDOFF_TEMPLATE.md`

4. **Include Context**
   - What you did
   - What remains
   - Any blockers or decisions made
   - Specific files to review

5. **Provide Success Criteria**
   Clear, testable criteria for the next agent

6. **Suggest Tab Name**
   Include a suggested tab name using short codes:
   ```
   **Suggested tab**: `[CODE] [2-3 word task]`
   ```
   Examples: `WEB auth fix` | `CLI pull cmd` | `TST doctor test`

### Role Short Codes for Handoffs
| Role | Code |
|------|------|
| CLI | `CLI` |
| Website | `WEB` |
| Documentation | `DOC` |
| Testing | `TST` |
| Platform | `PLT` |
| Template | `TPL` |
| Integration | `INT` |

---

## Error Handling Policy

### Error Message Requirements

All errors must include:
1. **What went wrong**: Clear description of the error
2. **Why it matters**: Impact on the user's work
3. **How to fix it**: Actionable recovery steps
4. **Where to learn more**: Links to docs or examples

### Example Error Structure
```javascript
throw new Error(`
Failed to export template "${templateName}"

Problem: Template manifest not found at ${manifestPath}
Impact: Cannot generate project structure

Fix:
  1. Ensure template exists: framework templates
  2. Check template name spelling
  3. Verify manifest exists: cat templates/${templateName}/template.json

Learn more: docs/templates/README.md
`)
```

### Using Recovery Guidance
Import and use the recovery guidance system:
```javascript
import { getRecoveryGuidance } from './recovery-guidance.mjs'

// In error handler
const guidance = getRecoveryGuidance('TEMPLATE_NOT_FOUND')
console.error(guidance)
```

---

## Testing Requirements

### Before Committing

1. **Run Full Test Suite**
   ```bash
   npm test
   ```

2. **Check Test Coverage** (if applicable)
   ```bash
   npm run test:coverage
   ```

3. **Verify No Lint Errors**
   ```bash
   npm run lint
   ```

### Test Patterns

- **Unit tests**: For pure functions and utilities
- **Integration tests**: For CLI commands and workflows
- **E2E tests**: For full user journeys (Playwright)

### Test Naming
```javascript
// Good
test('export command creates template with auth integration', ...)

// Bad
test('test1', ...)
```

---

## Commit Message Standards

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `chore`: Maintenance (deps, config, etc.)
- `test`: Adding or updating tests
- `refactor`: Code refactoring without behavior change

### Examples
```bash
feat(cli): add --cursor flag to pull command
fix(website): resolve hydration mismatch in editor
docs(agents): create agent governance system
chore(deps): update Next.js to 15.1.0
test(integration): add E2E tests for configurator flow
```

---

## Version History

### Version 1.2 (2025-12-22)
- Added **AI Prompt Forbidden Patterns** section
- Added prompt writing to Required Actions
- Referenced `docs/standards/PROMPT_STANDARDS.md` for full prompt guidelines
- Agents must write token-optimized prompts from the start

### Version 1.1 (2025-12-22)
- Added **Fenced Output Integrity** standards
- Added Output Formatting Standards section
- Updated forbidden actions to include output splitting
- Added pre-output verification checklist
- Added anti-pattern and correct pattern examples

### Version 1.0 (2025-12-22)
- Initial release
- Defined 7 agent roles
- Established session protocols
- Created memory system
- Documented handoff procedures

---

## Quick Reference

### Session Start Checklist
- [ ] Read AGENT_CONTEXT.md
- [ ] Pass verification test
- [ ] Identify role
- [ ] Load role file
- [ ] Load memory file
- [ ] Confirm ready

### Session End Checklist
- [ ] Run `npm test`
- [ ] Update memory file
- [ ] Provide summary
- [ ] Suggest next steps
- [ ] Generate continuation prompt

### Before Commit
- [ ] Tests pass
- [ ] No lint errors
- [ ] Docs updated (if needed)
- [ ] Conventional commit message

---

*For role-specific details, see `prompts/agents/roles/[ROLE]_AGENT.md`*
*For session history, see `prompts/agents/memory/[ROLE]_MEMORY.md`*
