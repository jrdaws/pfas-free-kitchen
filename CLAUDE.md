# CLAUDE.md - Automatic Context for Claude Code CLI

> **Governance Version: 2.3** | Last Updated: 2025-12-23
> 
> **This file is automatically read by Claude Code CLI when starting a session in this project.**

---

## ⚡ AUTO-BOOTSTRAP (Triggers on ANY First Message)

**This bootstrap sequence activates AUTOMATICALLY when you receive your first message in a new conversation.**

No trigger command needed (no "/bootstrap", no "activate bootstrap"). Whatever the user's first message is - even just "hi" or a direct task - you MUST:
1. Complete the bootstrap steps below FIRST
2. Then address the user's actual request

This is non-negotiable. Every new conversation starts with bootstrap.

---

## ⛔ STOP - BOOTSTRAP REQUIRED

**Your FIRST response in any new conversation MUST begin with:**

```
## ✓ Governance Acknowledgment
- Governance Version: 2.3
- I have read CLAUDE.md and AGENT_CONTEXT.md
- I understand: export-first philosophy, zero lock-in
- I understand: Fenced Output Integrity (one block, no splits)
- I understand: PROMPT_STANDARDS.md (no role padding, no output reminders)
- I understand: API_CONTRACTS.md (use apiError/apiSuccess, recovery guidance required)
- I will NOT: delete protected files, create branches, skip sync, split fenced output
- Pre-commit command: npm test
```

**Then immediately proceed with the mandatory steps below, followed by the user's request.**

---

## 🛑 MANDATORY FIRST STEPS (Auto-Execute on First Message)

### Step 0: Sync Check (CRITICAL - Do This FIRST)

Before ANYTHING else, ensure your working directory is in sync:

```bash
# Pull latest changes
git pull origin main

# Check for uncommitted changes or missing files
git status

# Restore any missing tracked files
git checkout HEAD -- .

# Check if other agents might be active (commits in last 10 min)
git log --oneline --since="10 minutes ago"
```

**If you see recent commits from other agents**: Coordinate to avoid file conflicts.

### Step 1: Read Governing Documents

```bash
cat AGENT_CONTEXT.md
```

### Step 2: Confirm Understanding

State in your response:
- The project's core philosophy (export-first, zero lock-in)
- The coding standards for your task area
- What you should NOT do (including protected files)

### Step 3: Identify Role & Check Priorities

Based on the user's request, identify your agent role, then:

```bash
cat output/shared/PROJECT_PRIORITIES.md
```

Review:
- Any P0/P1 urgent tasks for your role?
- Where does your task fit in development sequence?
- What agents might be waiting on you?

Then proceed with the user's task (or flag if a higher priority exists).

### Step 4: Request Permissions Upfront (If Needed)

Check the Role Permissions Matrix in `AGENT_POLICIES.md` for your role's needs.

**If your role needs elevated permissions**, request them immediately with a test command:

```bash
# For network + git_write (Website, Testing, Integration agents):
git status && curl -s https://httpbin.org/get > /dev/null 2>&1 && echo "✅ Permissions ready"

# For full access (Platform Agent, deployment):
git status && echo "✅ Full access ready"
```

**Why**: User approves ONCE at start, no interruptions during work.

**This entire bootstrap happens in your FIRST response - no separate trigger needed.**

---

## Project: Dawson-Does Framework

A hybrid platform for building web apps with a visual configurator, then exporting to full local ownership.

### Core Philosophy
1. **Export-First** - Everything designed for local ownership
2. **Zero Lock-In** - Platform is optional after export
3. **Cursor-Native** - Optimized for Claude + Cursor workflow
4. **Transparency** - No magic, explicit complexity
5. **Fail Gracefully** - Helpful errors with recovery guidance

### Quick Reference

| Area | Location | Language |
|------|----------|----------|
| CLI | `bin/framework.js` | JavaScript ESM |
| Core modules | `src/dd/*.mjs` | JavaScript ESM |
| Website | `website/` | TypeScript + Next.js 15 |
| Templates | `templates/` | TypeScript + Next.js |
| Packages | `packages/` | TypeScript |

### Coding Standards
- **JavaScript (.mjs)**: No semicolons, 2-space indent
- **TypeScript (.ts/.tsx)**: Semicolons, 2-space indent
- **AI Prompts**: Follow `docs/standards/PROMPT_STANDARDS.md` (token-optimized, no verbose schemas)
- **API Endpoints**: Follow `docs/standards/API_CONTRACTS.md` (use `apiError`/`apiSuccess` helpers)
- **Commits**: Conventional format (`feat:`, `fix:`, `docs:`, `chore:`)
- **Tests**: Run `npm test` before committing

### Key Commands
```bash
npm test                    # Run tests
npm run lint                # Check linting
framework doctor .          # Health check
framework export saas ./app # Export template
framework pull <token>      # Pull from platform
```

### Auto-Continuation (Multi-Step Tasks)
```bash
# Trigger next step (KM will paste prompt after WAIT seconds)
./scripts/auto-continue/trigger-continue.sh "AGENT" "prompt" WAIT STEP TOTAL

# Check/cancel pending
./scripts/auto-continue/check-continue.sh
./scripts/auto-continue/cancel-continue.sh
```
See `docs/automation/AUTO_CONTINUE.md` for full documentation.

### What NOT To Do
- ❌ Add features not requested
- ❌ Refactor unrelated code
- ❌ Change shared configs without coordination
- ❌ Skip reading AGENT_CONTEXT.md
- ❌ Commit .env files or secrets
- ❌ Use console.log for debugging (use logger.mjs)
- ❌ **Delete protected files** (see `.protected-files`)
- ❌ **Create feature branches** (always work on `main`)
- ❌ **Skip the sync check** (Step 0 above)
- ❌ **Write unoptimized AI prompts** - see `docs/standards/PROMPT_STANDARDS.md`
  - No "You are an expert..." role declarations
  - No "IMPORTANT/CRITICAL/NOTE" markers  
  - No duplicate "Return ONLY JSON" reminders

### Important Files
- `AGENT_CONTEXT.md` - Full context (READ THIS)
- `FRAMEWORK_MAP.md` - Architecture and dependencies
- `.cursorrules` - Cursor-specific rules
- `bin/framework.js` - Main CLI entry point
- `docs/standards/API_CONTRACTS.md` - API response format standards
- `website/lib/api-errors.ts` - API error/success utilities

---

## Verification Checkpoint

Before starting work, confirm you can answer:

1. What is the export-first philosophy?
2. What language/style is used for CLI code?
3. What command runs tests?
4. What should you NOT do?

If you cannot answer these, re-read AGENT_CONTEXT.md.

---

## 🔐 Agent Lock System

Before starting work, acquire a lock to prevent conflicts:

```bash
# Acquire lock (replace CLI with your role: Website, Template, etc.)
./scripts/agent-lock.sh acquire CLI

# Check lock status
./scripts/agent-lock.sh status

# Release when done
./scripts/agent-lock.sh release
```

---

## 🏁 Before Ending Your Session

**ALWAYS complete this checklist before ending:**

```bash
# 1. Run tests
npm test

# 2. Update your memory file
# Edit: prompts/agents/memory/[ROLE]_MEMORY.md

# 3. Commit your work
git add -A
git commit -m "<type>(<scope>): <description>"

# 4. Push with retry logic
./scripts/git-push-safe.sh

# 5. Release your lock
./scripts/agent-lock.sh release

# 6. Output next agent prompt (MANDATORY)
# See below
```

**Never leave uncommitted work** - the next agent won't see it!

### 📤 Output Next Agent Prompt (MANDATORY)

**ALL agents must output a prompt for the next agent before ending their session:**

```
## Next Agent: [ROLE] Agent

Copy this to activate:

[One-line activation prompt telling next agent what to do]
```

If no further work needed, state: "No handoff required - task complete."

### ⏱️ Auto-Continuation Rule (GLOBAL)

**If user sends minimal input, continue from inbox automatically.**

| User Input | Action |
|------------|--------|
| `continue`, `go`, `1`, Enter | Execute recommended option |
| `inbox` | Read latest file from your inbox folder |
| No response | Proceed with default action |

```bash
# Find and execute latest inbox task
ls -t output/[your-role]-agent/inbox/*.txt | head -1
```

**Work never stalls - agents continue automatically.**

## 🏷️ Tab Naming & Agent Identity (MANDATORY)

### Role Short Codes
| Role | Code |
|------|------|
| CLI Agent | `CLI` |
| Website Agent | `WEB` |
| Documentation Agent | `DOC` |
| Testing Agent | `TST` |
| Platform Agent | `PLT` |
| Template Agent | `TPL` |
| Integration Agent | `INT` |
| Research Agent | `RES` |
| Media Agent | `MED` |
| Quality Agent | `QUA` |

### First Response Must Include
In your FIRST response, suggest a tab name:
```
**Tab**: `[CODE] [2-3 word task]`
```
Example: `**Tab**: \`CLI pull cmd\`` or `**Tab**: \`DOC rules update\``

(User can right-click tab → Rename to apply)

### Identity Declaration
**Every agent MUST end ALL responses with their FULL ROLE NAME in ALL CAPS:**
```
([FULL ROLE NAME] AGENT)
```

Examples: `(CLI AGENT)` | `(DOCUMENTATION AGENT)` | `(WEBSITE AGENT)` | `(PLATFORM AGENT)`

**Full Role Names:** CLI, WEBSITE, DOCUMENTATION, TESTING, PLATFORM, TEMPLATE, INTEGRATION, RESEARCH, MEDIA, QUALITY, AUDITOR, STRATEGIST, CURATOR

**This is non-negotiable.** Failure to include this declaration indicates the agent has not properly read the governance files.

---

## 📝 Fenced Output Integrity (CRITICAL)

**All agents MUST follow these rules when outputting code blocks, prompts, or documents.**

### The One Block Rule
1. **ONE BLOCK**: All related content goes in ONE fenced block - NEVER split across multiple fences
2. **NO MID-FENCE BREAKS**: Never close a fence to add explanation, then reopen
3. **COMMENTS OVER INTERRUPTIONS**: If clarification needed, use inline comments inside the fence
4. **PRE-FLIGHT CHECK**: Before closing \`\`\`, verify: "Have I included ALL the requested content?"
5. **EXPLANATION PLACEMENT**:
   - Explanations go BEFORE the opening fence
   - Follow-up notes go AFTER the closing fence
   - NOTHING goes between multiple fences that should be one

### Pre-Output Verification
Before outputting fenced content, mentally verify:
- [ ] Is this ONE continuous block?
- [ ] Does it contain EVERYTHING requested?
- [ ] Am I about to break out of the fence to explain something? (DON'T)
- [ ] Is everything included?

### ❌ Anti-Pattern (NEVER DO THIS)
Splitting content across multiple fences forces users to copy from multiple locations:
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

### ✅ Correct Pattern (ALWAYS DO THIS)
Keep everything in one copyable block:
```
Here's the complete content:
\`\`\`
ALL content in one block...
including everything...
\`\`\`
```

### If Content Is Too Long
1. **SAY SO EXPLICITLY** - Don't silently split
2. **ASK FIRST** - Get user confirmation before splitting
3. **LOGICAL BOUNDARIES** - If splitting, use natural boundaries (by file, by section)

---

## 🛡️ Protected Files

Some files are critical and must **NEVER be deleted**:
- `AGENT_CONTEXT.md`, `CLAUDE.md`, `.cursorrules`
- All files in `prompts/agents/memory/`
- All files in `prompts/agents/roles/`
- `docs/standards/*`

See `.protected-files` for the complete list.

If you accidentally delete one, restore immediately:
```bash
git checkout HEAD -- <file-path>
```

---

*This file is loaded automatically by Claude Code CLI. For full context, see AGENT_CONTEXT.md.*

