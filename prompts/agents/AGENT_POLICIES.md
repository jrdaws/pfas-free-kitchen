# Agent Policies

> **Version**: 3.0
> **Effective Date**: 2025-12-22
> **Latest Update**: Added Auto-Continuation Protocol for multi-step tasks
> **Purpose**: Define operational policies and protocols for AI agents working on dawson-does-framework

---

## Overview

This document establishes the governance framework for AI agents working on the dawson-does-framework project. All agents must follow these policies to ensure consistent, high-quality contributions that align with project philosophy.

### SOP Compliance Rule (MANDATORY)

**ALL agents MUST read and follow their assigned SOPs before starting work.**

1. Read your role file: `prompts/agents/roles/[ROLE]_AGENT.md`
2. Read any task-specific SOPs referenced in your inbox files
3. Follow ALL steps in the SOP - do not skip steps
4. If an SOP conflicts with a task request, follow the SOP and note the conflict

Failure to follow SOPs results in inconsistent output and breaks the multi-agent workflow.

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

### Media Pipeline Agents

| Role | Domain | Key Files |
|------|--------|-----------|
| **Research Agent** | Asset requirements, briefs | `output/agents/research/` |
| **Media Agent** | Image/graphic generation | `output/agents/media/` |
| **Quality Agent** | Asset review, approval, **SOP guardian** | `output/agents/quality/` |

See `output/shared/media/MEDIA_PIPELINE.md` for full pipeline documentation.

### SOP Guardian Roles (MANDATORY)

**Three agents share SOP Guardian responsibility:**

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Quality Agent** | Proposer | Identify gaps, maintain registry, propose new SOPs |
| **Testing Agent** | Verifier | Test SOPs work, identify gaps during testing |
| **Auditor Agent** | Approver | Approve SOPs, audit compliance, enforce updates |

**All three agents must:**
- Review their memory for SOP opportunities
- Log patterns to `output/agents/quality/workspace/sop-opportunities.md`
- Update existing SOPs when inaccuracies found
- Notify Documentation Agent for major SOP creation

**Rule**: If any Guardian sees the same issue 3+ times without documentation, they MUST propose an SOP.

---

### SOP Proposal Workflow (ALL AGENTS)

**Any agent can propose SOP changes. All proposals go to Documentation Agent.**

```
ANY AGENT → Proposes → DOCUMENTATION AGENT → Drafts → AUDITOR AGENT → Approves → Published
```

#### How to Submit a Proposal

1. Create proposal file:
   ```bash
   cd /Users/joseph.dawson/Documents/dawson-does-framework
   touch output/shared/sop-proposals/PROPOSAL-$(date +%Y%m%d)-[short-name].md
   ```

2. Use template from `docs/sops/SOP_PROPOSAL_PROCESS.md`

3. Documentation Agent will:
   - Review proposal
   - Draft formal SOP if valid
   - Send to Auditor for approval

4. Auditor Agent will:
   - Review for conflicts and alignment
   - Approve, request revision, or reject
   - Provide feedback

5. If approved:
   - Documentation Agent publishes to `docs/sops/`
   - Updates AGENT_POLICIES.md
   - Updates MINDFRAME.md

**Proposal Location**: `output/shared/sop-proposals/`
**Full Process**: See `docs/sops/SOP_PROPOSAL_PROCESS.md`

---

### Sequence Verification Protocol (MANDATORY)

**All agents must verify they're in the correct sequence before starting work.**

#### Before Starting Any Task:

```markdown
## Sequence Check

Current task: [Task name]
Prerequisites:
- [ ] Required certifications present in MINDFRAME.md?
- [ ] Dependencies completed?

**Sequence Status**: ✅ Correct / ⚠️ Out of Order
```

#### If Out of Sequence:

1. **NOTIFY**: "⚠️ Sequence Issue: This task should wait for [Agent] to complete [Task] first."
2. **RECOMMEND**: Provide the correct prompt for the correct agent
3. **OFFER**: "I can proceed with what's possible, or wait. Your choice."
4. **CONTINUE**: If user approves, proceed with available work

#### Sequence Violation Response Format:

```markdown
⚠️ **Sequence Issue Detected**

This task requires certification from [Agent] first.
Current MINDFRAME.md shows: [Status]

**Recommended Action:**

## Redirect to: [Agent] Agent

```
Confirm you are the [Agent] Agent.
[Corrected task for that agent]
```

**What I can do now:** [List available actions]
Would you like me to proceed with what's possible?
```

#### Certification Requirements Matrix:

| Task Type | Requires Certification From | Before |
|-----------|---------------------------|--------|
| **Deployment** | Testing (tests pass) | Platform deploys |
| **Feature Release** | Testing + Documentation | Announcement |
| **Template Update** | Template + Testing | Export to users |
| **Media Integration** | Quality Agent | Website/Template uses |
| **Code Merge** | Testing | Merge to main |
| **SOP Creation** | Documentation | All agents use it |

---

## Media Pipeline Standards (MANDATORY)

**All Media Pipeline agents must enforce these photorealistic image standards.**

### Photorealistic Prompt Requirements

**Every image prompt MUST include:**

| Element | Example | Required? |
|---------|---------|-----------|
| Camera model | "shot on Canon EOS R5" | ✅ YES |
| Lens specification | "85mm f/1.4" | ✅ YES |
| Lighting description | "natural window light from left" | ✅ YES |
| Photography style | "editorial lifestyle photography" | ✅ YES |
| Negative prompt | "cartoon, CGI, plastic skin..." | ✅ YES |

**Standard Negative Prompt (include in every brief):**
```
cartoon, illustration, 3d render, CGI, anime, painting, drawing,
oversaturated, plastic skin, waxy, unrealistic, artificial, stock photo generic,
perfect symmetry, uncanny valley, airbrushed, HDR overdone, bad anatomy,
distorted features, extra limbs, malformed hands, text, watermark, signature
```

### Cost Optimization Requirements

| Phase | Tool | Cost |
|-------|------|------|
| ALL drafts & iterations | Stable Diffusion | $0.002-0.02/image |
| Final hero images ONLY | DALL-E 3 | $0.04-0.12/image |
| Artistic/marketing | Midjourney | Subscription |

**Rationale**: SD is 10-20x cheaper than DALL-E. Use SD for all drafts. Reserve DALL-E for final hero images only.

### Quality Enforcement

**Images MUST have:**
- Natural skin texture (not waxy or plastic)
- Realistic eyes with proper catchlights
- Consistent lighting direction
- Natural color saturation (not oversaturated)
- Correct hands/fingers
- Authentic background bokeh
- Overall "real photo" feel

**Images MUST NOT have:**
- Plastic or poreless skin
- Vacant or expressionless eyes
- Inconsistent shadow directions
- HDR-overdone look
- Wrong number of fingers
- Weird artifacts in backgrounds
- Stock photo generic feel
- Perfect unnatural symmetry

### Agent-Specific Enforcement

| Agent | Enforcement Requirement |
|-------|------------------------|
| Research Agent | Read `PHOTOREALISTIC_PROMPT_GUIDE.md` before creating prompts |
| Media Agent | Verify camera/lens in prompt before generating; Self-check for AI artifacts |
| Quality Agent | Use photorealism checklist; Reject images with obvious AI tells |
| Integration Agents | Verify all assets approved before integration |

### Iteration Limits

- Maximum **3 iterations** per project
- After 3 iterations: Approve best available with documented notes
- Track iteration count in every review report

### Documentation References

- `output/shared/media/PHOTOREALISTIC_PROMPT_GUIDE.md` - Full prompt engineering guide
- `output/shared/media/ENFORCEMENT_CHECKLIST.md` - Pre-handoff checklists
- `output/shared/media/REJECTION_CRITERIA.md` - What to reject and why
- `output/shared/media/QUICK_REFERENCE_CARDS.md` - One-page agent summaries

---

### Controller Agents

| Role | Domain | Key Files |
|------|--------|-----------|
| **Auditor Agent** | Framework review, health check | `output/agents/auditor/` |
| **Strategist Agent** | Task planning, prioritization | `output/agents/strategist/` |
| **Curator Agent** | Prompt refinement, distribution | `output/agents/curator/` |

See `output/CONTINUOUS_IMPROVEMENT_SYSTEM.md` for continuous improvement documentation.

---

## Operational Protocols

### Context Freshness Verification (GLOBAL)

**Before starting work from an inbox prompt, agents MUST verify their context is current.**

#### File Tier Classification

| Tier | Files | Threshold | Check When |
|------|-------|-----------|------------|
| **Tier 1** (Critical) | AGENT_CONTEXT.md, CLAUDE.md, AGENT_POLICIES.md, PROJECT_PRIORITIES.md | 2 hours | Every session |
| **Tier 2** (Role-Specific) | [ROLE]_AGENT.md, [ROLE]_MEMORY.md, Role SOPs | 4 hours | If role matches |
| **Tier 3** (Reference) | docs/sops/*.md, docs/standards/*.md | 24 hours | If task references |

#### Quick Freshness Check

```bash
./scripts/check-context-freshness.sh [ROLE]
# Example: ./scripts/check-context-freshness.sh DOC
```

#### Pre-Work Verification (Required for Inbox Tasks)

When starting from an inbox prompt, include this check:

```markdown
## Pre-Work Context Verification

**AGENT_POLICIES.md**: v1.9 ✅
**Last governance change**: [X hours ago]
**PROJECT_PRIORITIES.md**: Checked ✅
**Context Status**: ✅ Fresh / ⚠️ Stale (re-reading)
```

#### Mindframe Update Triggers

| Trigger | Action Required |
|---------|-----------------|
| Governance version changed | Full re-read of AGENT_POLICIES.md |
| New SOP added | Read if relevant to role |
| New P0/P1 in priorities | Acknowledge and prioritize |
| Memory file has new session | Review for context/blockers |
| Role file version changed | Re-read entire role file |

**If stale**: Re-read the affected files before proceeding with any work.

---

### Auto-Continuation Rule (GLOBAL)

**If user sends minimal input, agent MUST auto-continue from inbox.**

| User Input | Agent Action |
|------------|--------------|
| `continue`, `go`, `next` | Execute Option 1 (default) from previous options |
| `1`, `2`, `3`, `4`, `5` | Execute that numbered option |
| Just presses Enter | Execute Option 1 (default) |
| `inbox` or `check inbox` | Read and execute latest file from your inbox folder |
| No response (idle) | Same as "continue" - proceed with default |

**Auto-Continue Behavior:**

When continuing without specific instruction:

```bash
# Find your latest inbox task
ls -t output/[your-role]-agent/inbox/*.txt | head -1

# Read and execute it
cat output/[your-role]-agent/inbox/[latest-file].txt
```

**This ensures work never stalls waiting for user input.**

---

### Session Initialization (MANDATORY)

Every agent session must begin with:

0. **Read Shared Mindframe (FIRST)**
   ```bash
   cat output/shared/MINDFRAME.md
   ```
   - Check Quick Vibe Check for 10-second status
   - Adopt certified understanding from other agents
   - Don't re-verify things that have current certifications
   - Note any 🟡 or 🔴 vibes that might affect your work

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

6. **Check Project Priorities (NEW)**
   ```bash
   cat output/shared/PROJECT_PRIORITIES.md
   ```
   Review:
   - Any P0/P1 urgent tasks for your role?
   - Where does your task fit in the development sequence?
   - What other agents might be waiting on you?

7. **Declare Required Permissions**
   State what permissions your role typically needs (see below)

8. **Establish Continuity**
   State:
   - Last session summary
   - Current priorities from memory
   - Any known blockers
   - **Any urgent tasks from PROJECT_PRIORITIES.md**

9. **Confirm Ready**
   State understanding of:
   - Your role and boundaries
   - Project philosophy
   - Current task objectives
   - Forbidden actions
   - **Current project priority context**

---

### Role Permissions Matrix

Each role has typical permission requirements. Agents should inform users upfront:

| Role | Network | Git Write | All | Common Tasks |
|------|---------|-----------|-----|--------------|
| CLI | ❌ | ✅ | ❌ | Commits, CLI changes |
| Website | ✅ | ✅ | ❌ | npm install, deploy, commits |
| Template | ❌ | ✅ | ❌ | Template changes, commits |
| Integration | ✅ | ✅ | ❌ | API tests, package installs |
| Documentation | ❌ | ✅ | ❌ | Doc updates, commits |
| Testing | ✅ | ✅ | ❌ | npm test, API tests |
| Platform | ✅ | ✅ | ✅ | Full access for deployment |
| Auditor | ❌ | ❌ | ❌ | Read-only analysis |
| Strategist | ❌ | ❌ | ❌ | Read-only planning |
| Curator | ❌ | ✅ | ❌ | File distribution |
| Research | ❌ | ❌ | ❌ | Read-only research |
| Media | ✅ | ❌ | ❌ | API calls to image services |
| Quality | ❌ | ✅ | ❌ | File approval/movement |

### Permission Request Protocol (BLOCKING REQUIREMENT)

⛔ **AGENTS MUST REQUEST ALL NEEDED PERMISSIONS IN THEIR FIRST RESPONSE**

This is not optional. Agents must PREDICT what permissions they'll need and PROBE for them upfront.

**Philosophy**: Fire all permission triggers at the START with probe operations, not during work.

#### Step 1: Analyze Task Scope

Before starting work, identify ALL operations that require permissions:

| Operation Type | Permission Needed | Probe Command |
|----------------|-------------------|---------------|
| Git commits | `git_write` | `git status` |
| Network/API calls | `network` | `curl -s https://httpbin.org/get > /dev/null` |
| Create files outside workspace | `all` | `touch /tmp/probe.txt && rm /tmp/probe.txt` |
| Run npm install | `network` | Request network permission |
| Access .env files | `all` | `cat .env.local 2>/dev/null` |
| File creation in specific paths | sandbox | Create dummy file in target location |

#### Step 2: Fire Permission Probes

Run ALL needed permission triggers in ONE command block:

```bash
# Standard probe (network + git_write):
git status && curl -s https://httpbin.org/get > /dev/null 2>&1 && echo "✅ Permissions ready"

# Extended probe (Platform/Integration agents):
git status && \
  curl -s https://httpbin.org/get > /dev/null 2>&1 && \
  touch /tmp/permission-probe.txt && rm /tmp/permission-probe.txt && \
  echo "✅ Full permissions ready"
```

#### Step 3: Probe Specific Paths (if needed)

If your task creates files in specific locations, probe that location:

```bash
# Example: Need to create files in output/agents/website/inbox/
mkdir -p output/agents/website/inbox && \
  touch output/agents/website/inbox/.probe && \
  rm output/agents/website/inbox/.probe && \
  echo "✅ Inbox write permission confirmed"
```

#### Permission Prediction Matrix

| Task Type | Likely Permissions | Probe Strategy |
|-----------|-------------------|----------------|
| Code generation | `git_write` | `git add --dry-run .` |
| API testing | `network` | `curl -s https://example.com` |
| Deployment | `network`, `git_write`, `all` | Full probe |
| File export | `all` | Touch target directory |
| npm operations | `network` | Request network |
| Template creation | `all` | Create temp file in target |

#### Step 4: User Approves Once

After approval, the session continues WITHOUT further permission prompts.

**Failure to Probe Upfront = Governance Violation**

If you hit a permission error mid-session, you failed to predict your needs. Note this in your session end and improve next time.

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

4. **Checkpoint Protocol (MANDATORY)**
   
   ⛔ **AGENTS MUST CHECKPOINT EVERY 15-20 MINUTES OR AFTER SIGNIFICANT WORK**
   
   **User Shorthand:** `checkpoint` or `cp` = run checkpoint immediately
   
   **Triggers:**
   - User says `checkpoint` or `cp`
   - After completing a significant task
   - After creating 3+ files
   - Every 15-20 minutes of active work
   
   **Graceful Stop Rule:**
   - Complete quick tasks (< 2 min remaining)
   - Find a safe stopping point (no broken code)
   - Complete current file edits before stopping
   - Document partial work clearly
   
   **Pre-Check (FIRST!):**
   - Review recent commits for governance/SOP changes
   - Re-read if `AGENT_POLICIES.md` or `CHECKPOINT_SOP.md` updated
   
   **Auditor Review:**
   - Stage files with `git add -A` (do NOT commit directly)
   - Create review request in `output/agents/auditor/inbox/`
   - Auditor will review and commit when ready
   
   **SOP Opportunity Scan:**
   - Review session for repeating patterns/workarounds
   - Log opportunities to `sop-opportunities.md`
   - Include in checkpoint output
   - Escalate to formal SOP proposal when count ≥ 3
   
   **Save Checkpoint Snapshot (NEW - MANDATORY):**
   - Write to `output/shared/checkpoints/CP-[DATE]-[TIME]-[ROLE].md`
   - Include: tasks completed, commits, files changed, pending work
   - Creates persistent audit trail of all sessions
   - View past checkpoints: `ls output/shared/checkpoints/`
   
   **Format:**
   ```markdown
   ## 📦 Checkpoint [HH:MM]
   
   ### Offloaded:
   - ✅ [file/change]
   
   ### Committed:
   `[hash] [message]`
   
   ### In Progress:
   - [remaining work]
   
   ---
   ```
   
   **Full SOP**: See `docs/sops/CHECKPOINT_SOP.md`

5. **Document Changes**
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

4. **Smart Handoff: Propose Next Agent (MANDATORY)**
   
   **ALL agents must analyze and propose the best next agent before ending their session.**

   ### Step 4a: Review Project State
   ```bash
   cat output/shared/PROJECT_PRIORITIES.md
   ```

   ### Step 4b: Analyze What's Needed
   
   Consider these factors in order:
   
   | Factor | Weight | Question |
   |--------|--------|----------|
   | **Urgency** | 40% | Is there a P0/P1 issue? |
   | **Sequence** | 25% | What naturally comes next in the workflow? |
   | **Recently Identified** | 20% | Did I discover something that needs immediate action? |
   | **Dependencies** | 15% | Is another agent blocked waiting for this? |

   ### Step 4c: Agent Selection Matrix
   
   | Scenario | Best Agent | Trigger |
   |----------|------------|---------|
   | Code changes made | Testing | Always verify changes |
   | Bug discovered | (by type) | See Bug Triage SOP routing |
   | New feature complete | Testing | E2E validation |
   | Docs outdated | Documentation | Sync needed |
   | Deploy ready | Platform | Release process |
   | Assets needed | Research | Start media pipeline |
   | Assets pending review | Quality | Review and approve |
   | Integration broken | Integration | Fix connectivity |
   | Template issue | Template | Update templates |

   ### Step 4d: Output Numbered Options (MANDATORY)
   
   **ALL agents must end with numbered quick-select options:**
   
   ```
   ---
   
   ## Quick Actions (reply with number, or just press Enter to continue):
   
   1. [Recommended agent + brief action] ← DEFAULT
   2. [Alternative agent if applicable]
   3. Read latest handoff: `cd /Users/joseph.dawson/Documents/dawson-does-framework && cat output/[agent]/inbox/[file].txt`
   4. Check project priorities: `cd /Users/joseph.dawson/Documents/dawson-does-framework && cat output/shared/PROJECT_PRIORITIES.md`
   5. No further action needed
   
   **⏱️ Auto-continue**: If no response, proceed with Option 1
   ```

### Step 4d: Quick Actions Section (BLOCKING REQUIREMENT)

   ⛔ **EVERY RESPONSE MUST END WITH A QUICK ACTIONS SECTION**
   
   This is not optional. ALL agents must include numbered quick actions at the END of EVERY response.
   
   **EXACT FORMAT:**
   
   ```
   ## Quick Actions (reply with number):
   
   1. **[Agent Role]**: [Brief action description] ← DEFAULT
   2. **[Alternative action]**: [Description]
   3. **[Useful command]**: `cd /Users/joseph.dawson/Documents/dawson-does-framework && [command]`
   4. No further action needed
   
   **⏱️ Auto-continue**: If no response in 35 minutes, proceed with Option 1
   ```
   
   **Rules:**
   - Always include at least 3 options
   - Option 1 should be the DEFAULT (most logical next step)
   - Include at least one useful terminal command
   - Always include "No further action needed" as last option
   - Include the auto-continue timer notice
   
   **This allows users to quickly select next actions by typing a single number.**

---

### Step 4e: Handoff Prompt Format (BLOCKING REQUIREMENT)
   
   ⛔ **SESSION CANNOT END WITHOUT A VALID HANDOFF PROMPT**
   
   Failure to provide a handoff prompt is a governance violation.
   
   **EXACT FORMAT (no variations allowed):**
   
   The fenced code block starts IMMEDIATELY after the header line.
   
   ```
   Next Agent: [Role] Agent
   ```
   [Task description with context, file references, and what to do]
   ```
   ```
   
   **Format Rules:**
   
   | Element | Location | Required |
   |---------|----------|----------|
   | `Next Agent: [Role] Agent` | Header line (no ##) | ✅ Yes |
   | Fenced block | IMMEDIATELY after header | ✅ Yes |
   | Task description | INSIDE fenced block | ✅ Yes |
   
   **The entire task goes INSIDE the fenced block for easy copying.**
   
   ---
   
   **Example - Testing Agent:**
   
   Next Agent: Testing Agent
   ```
   Verify the 3 new SOPs in docs/sops/ are actionable by walking through each checklist. Create a sample bug report using BUG_TRIAGE_SOP.md. Reference output/shared/MINDFRAME.md for current system state.
   ```
   
   ---
   
   **Example - Website Agent (with file reference):**
   
   Next Agent: Website Agent
   ```
   Implement the 24 approved sidebar icons from output/shared/media/approved/configurator-sidebar/ into the configurator. Reference output/agents/website/inbox/media-configurator-sidebar/IMPLEMENT.txt for integration details.
   ```
   
   ---
   
   **Example - Quality Agent:**
   
   Next Agent: Quality Agent
   ```
   Review the 5 newly generated hero images in output/agents/media/outbox/. Apply photorealism checklist from PHOTOREALISTIC_PROMPT_GUIDE.md. Approve or provide feedback.
   ```
   
   ---
   
   **If no further work is needed:**
   
   State explicitly: "No handoff required - task complete." But this should be RARE.

   ### Step 4e: Update Project Priorities
   
   Before ending, update `output/shared/PROJECT_PRIORITIES.md`:
   - Add any new tasks discovered
   - Mark completed tasks
   - Adjust priorities if needed
   
   **If no further work needed**: End with options but recommend Option 5.

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
- **Provide terminal commands when referencing output files** (see below)

### Output File Reference Rule (MANDATORY)

When referencing ANY local file, agents MUST include:
1. **Full absolute file path**
2. **`cd` command** to change to project directory first
3. **Terminal command** to open the file or folder

**Format:** Commands on separate lines, NO comments, include `cd`:

```
File saved to: /Users/joseph.dawson/Documents/dawson-does-framework/output/agents/testing/outbox/completion-report.txt

cd /Users/joseph.dawson/Documents/dawson-does-framework && open output/agents/testing/outbox/completion-report.txt
```

**Or to open the folder:**
```
cd /Users/joseph.dawson/Documents/dawson-does-framework && open output/agents/testing/outbox/
```

**Rules:**
- ALWAYS include `cd` to project root first (ensures correct directory)
- Use FULL absolute paths for file references
- NO `#` comments in commands (causes terminal errors)
- One command per line for easy copying
- Works regardless of current terminal location

---

### Prompt Output SOP (MANDATORY)

When creating prompts for other agents, ALWAYS follow this pattern:

**1. Save prompts to .txt files:**
- Location: `output/[agent-name]/inbox/[task-name].txt`
- Format: Complete, self-contained prompt with all context

**2. Create activation command file:**
- Location: `output/[project]/ACTIVATE_[PROJECT].txt`
- Contains: One-liner activation commands for each agent

**3. Provide short activation instruction:**
When handing off, give users a simple paste-able command:

```
Read output/[agent]/inbox/[task-file].txt and execute the task.
```

**Example workflow:**
```
1. Create prompt file → output/agents/media/inbox/PROJECT-xyz.txt
2. Create activation file → output/shared/media/ACTIVATE_XYZ.txt
3. Tell user: "Copy this to activate: Read output/agents/media/inbox/PROJECT-xyz.txt and execute the task."
```

**Benefits:**
- Prompts are version-controlled
- Easy handoff between sessions
- Agents can read complete context
- Users just copy one line to activate

### Prompt Lifecycle (ONE LOCATION RULE)

⚠️ **A prompt should exist in exactly ONE location at any time.**

```
┌─────────────────────────────────────────────────────────┐
│ 1. CREATION                                              │
│    Agent A creates → output/agent-b/inbox/TASK-x.txt     │
├─────────────────────────────────────────────────────────┤
│ 2. EXECUTION                                             │
│    Agent B reads from inbox/, executes task             │
├─────────────────────────────────────────────────────────┤
│ 3. COMPLETION                                            │
│    Agent B MOVES file: inbox/ → done/                   │
│    mv output/agent-b/inbox/TASK-x.txt output/agent-b/done/ │
└─────────────────────────────────────────────────────────┘
```

**Rules:**
- **Never duplicate** prompts across folders
- **Always MOVE** completed prompts to `done/`
- **Done folder** is the permanent record of completed work
- **See full SOP**: `docs/sops/AGENT_FOLDER_STRUCTURE_SOP.md`

### Standard Agent Folder Structure

Every agent MUST have exactly:

```
output/[agent-name]/
├── inbox/      # Pending prompts
├── outbox/     # Completed outputs, handoff prompts
├── done/       # Completed prompts (moved from inbox)
└── workspace/  # Temporary/working files
```

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
| Research (Media) | `RES` |
| Media | `MED` |
| Quality (Media) | `QUA` |
| Auditor | `AUD` |
| Strategist | `STR` |
| Curator | `CUR` |

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

## Auto-Continuation Protocol

For multi-step tasks that require agent continuation without human intervention.

### When to Use

- Task requires 3+ distinct steps
- Each step needs separate agent interaction
- Overnight/unattended operation needed
- Steps can run independently

### How to Trigger

At end of a step, include this marker and run the trigger script:

```markdown
## 🔄 Auto-Continue: Step X of Y

**Next step in: 30 seconds**

To continue manually: [copy next prompt here]
To cancel: `./scripts/auto-continue/cancel-continue.sh`
```

```bash
./scripts/auto-continue/trigger-continue.sh "AGENT_NAME" "Next prompt text" 30 STEP TOTAL "task-id"
```

### Safety Rules

| Rule | Value | Purpose |
|------|-------|---------|
| Max auto-continues | 5 per task | Prevent infinite loops |
| Timeout | 10 minutes | Detect stale triggers |
| Logging | All triggers | Audit trail |
| Final step | Auditor verification | Quality assurance |

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/auto-continue/trigger-continue.sh` | Trigger continuation |
| `scripts/auto-continue/cancel-continue.sh` | Cancel pending |
| `scripts/auto-continue/check-continue.sh` | Check status |

**Full documentation**: `docs/automation/AUTO_CONTINUE.md`

---

## Version History

### Version 3.0 (2025-12-24)
- Added **Auto-Continuation Protocol** for multi-step unattended tasks
- Created `scripts/auto-continue/` with trigger, cancel, check scripts
- Keyboard Maestro integration for automatic prompt pasting
- Safety features: max 5 continues, timeout, logging, auditor verification

### Version 2.9 (2025-12-24)
- Enhanced **Permission Probing Protocol** - agents probe specific paths upfront
- Fire ALL permission triggers at session start with dummy operations
- Added permission prediction matrix for common task types
- Probe target directories before creating files there

### Version 2.8 (2025-12-24)
- Added **Checkpoint Protocol** - mandatory progress offloading every 15-20 min
- Created `docs/sops/CHECKPOINT_SOP.md` with full protocol
- Added checkpoint to MINDFRAME.md Reply Rules section
- Ensures work is saved incrementally, not just at session end

### Version 2.7 (2025-12-23)
- Made **Permission Request BLOCKING** - must request upfront in first response
- Added **Reply Rules section to MINDFRAME.md** for quick reference
- Identity declaration now uses FULL ROLE NAME in ALL CAPS
- Auto-continue timer set to 35 minutes

### Version 2.6 (2025-12-23)
- Made **Quick Actions section a BLOCKING requirement** for EVERY response
- Users can reply with a number for quick selection
- Must include DEFAULT option and auto-continue timer

### Version 2.5 (2025-12-23)
- Made **Handoff Prompt a BLOCKING requirement** - sessions cannot end without one
- Fixed format: Both "Confirm you are..." AND "cd && cat" go INSIDE fenced block
- Added validation check reference (Check 8 in validate-agent-work.sh)
- Will become a blocking error in future versions

### Version 2.4 (2025-12-23)
- Added **SOP Proposal Process** - any agent can propose SOPs
- Created `docs/sops/SOP_PROPOSAL_PROCESS.md`
- Workflow: Any Agent → Documentation → Auditor → Published
- Proposal folder: `output/shared/sop-proposals/`

### Version 2.3 (2025-12-23)
- Added **Sequence Verification Protocol** - agents must check order before work
- Expanded **SOP Guardian** to Testing and Auditor (3-agent responsibility)
- Added **Certification Requirements Matrix**
- Agents must notify user if sequence is wrong and offer redirect

### Version 2.2 (2025-12-23)
- Standardized **Handoff Prompt Format** with role identity
- Prompts must start with "Confirm you are the [Role] Agent."
- Removed "Copy this to activate:" text
- Added Step 4e for handoff format

### Version 2.1 (2025-12-23)
- Added **Shared Mindframe & Certification System**
- Agents read MINDFRAME.md at session start
- Agents certify their domain at session end
- Trust inheritance between agents
- Created certify.sh script

### Version 2.0 (2025-12-23)
- Enhanced **File Path Rule** - must include `cd` command for directory safety
- Full absolute paths required for all file references
- Commands work regardless of current terminal location

### Version 1.9 (2025-12-23)
- Added **Context Freshness Verification** system
- File tier classification (Critical/Role-Specific/Reference)
- Freshness thresholds (2hr/4hr/24hr)
- Pre-work verification checklist
- Created check-context-freshness.sh script

### Version 1.8 (2025-12-23)
- Added **Auto-Continuation Rule** - agents continue from inbox on minimal input
- User can just press Enter or say "continue" to proceed
- Agents auto-execute Option 1 (default) when idle
- Added inbox check command for self-directed work

### Version 1.7 (2025-12-23)
- Added **Numbered Quick-Select Options** for easy handoff
- User can reply with just a number (1, 2, 3...) to continue
- Option 3 always points to latest handoff file
- Option 4 always shows project priorities

### Version 1.6 (2025-12-23)
- Added **Smart Handoff System** with agent selection matrix
- Agents must analyze urgency, sequence, and dependencies
- Added PROJECT_PRIORITIES.md check to session start
- Session end must update project priorities

### Version 1.5 (2025-12-23)
- Added **Quality Agent SOP Guardian** responsibility
- Quality Agent must track all SOPs in SOP_REGISTRY.md
- Quality Agent must identify and propose new SOPs from feedback patterns

### Version 1.4 (2025-12-23)
- Made **"Output Next Agent Prompt"** mandatory for ALL agents
- Added next-agent routing table by role
- Updated Session End Checklist with handoff requirement

### Version 1.3 (2025-12-23)
- Added **Standard Operating Procedures** section
- Added Bug Triage, Doc Sync, Deployment SOP references
- Added documentation freshness check command

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

## Standard Operating Procedures

The following SOPs define mandatory processes that ALL agents must follow:

| SOP | Location | Purpose |
|-----|----------|---------|
| **Bug Triage** | `docs/sops/BUG_TRIAGE_SOP.md` | P0-P3 severity classification, agent routing |
| **Documentation Sync** | `docs/sops/DOCUMENTATION_SYNC_SOP.md` | Keep docs current with code |
| **Deployment** | `docs/sops/DEPLOYMENT_SOP.md` | Pre-deploy checklists, rollback procedures |
| **SOP Proposal Process** | `docs/sops/SOP_PROPOSAL_PROCESS.md` | How to propose and adopt new SOPs |
| **AI Model Selection** | `docs/sops/AI_MODEL_SELECTION_SOP.md` | Token limits, model tiers, truncation handling |
| **Haiku JSON Compliance** | `docs/sops/HAIKU_JSON_COMPLIANCE_SOP.md` | JSON schema issues with Haiku model |
| **Template Hygiene** | `docs/sops/TEMPLATE_HYGIENE_SOP.md` | node_modules, versioning, structure |
| **Media Naming** | `docs/sops/MEDIA_NAMING_SOP.md` | Asset naming conventions |
| **SSR Compatibility** | `docs/sops/SSR_COMPATIBILITY_SOP.md` | Client-only component patterns |
| **SEO Generation** | `docs/sops/SEO_GENERATION_SOP.md` | Multi-agent SEO pipeline |
| **Session Checkpoint** | `docs/sops/CHECKPOINT_SOP.md` | Periodic progress offloading |
| **Agent Creation** | `docs/sops/AGENT_CREATION_SOP.md` | How to create new agents |
| **Agent Folder Structure** | `docs/sops/AGENT_FOLDER_STRUCTURE_SOP.md` | Standard inbox/outbox/done/workspace |
| **Agent Persistent Settings** | `docs/sops/AGENT_PERSISTENT_SETTINGS_SOP.md` | Agent-specific configuration |
| **Certification Requirements** | `docs/sops/CERTIFICATION_REQUIREMENTS_SOP.md` | MINDFRAME certification standards |
| **Folder Deprecation** | `docs/sops/FOLDER_DEPRECATION_SOP.md` | Migrating old folder structures |
| **shadcn/ui Implementation** | `docs/sops/SHADCN_IMPLEMENTATION_SOP.md` | UI component standards |

### SOP Compliance

- **MANDATORY**: All agents must follow relevant SOPs
- **Bug reporting**: Use Bug Triage SOP for all bug reports
- **Doc updates**: Follow Doc Sync SOP after any code change
- **Deployments**: Platform Agent must follow Deployment SOP

### Documentation Freshness

Run weekly or before releases:
```bash
./scripts/check-doc-freshness.sh
```

---

## Quick Reference

### Session Start Checklist
- [ ] **Read MINDFRAME.md** (Quick Vibe Check, certifications)
- [ ] Read AGENT_CONTEXT.md
- [ ] Pass verification test
- [ ] Identify role
- [ ] Load role file
- [ ] Load memory file
- [ ] **Check PROJECT_PRIORITIES.md** for urgent tasks
- [ ] Confirm ready (including priority context)

### Session End Checklist
- [ ] Run `npm test`
- [ ] Update memory file
- [ ] **Update MINDFRAME.md** with your certification (if work completed)
- [ ] Update PROJECT_PRIORITIES.md
- [ ] **Output numbered quick-select options** (MANDATORY - see Step 4d)
- [ ] Sign off with role: `([CODE] Agent)`

### Before Commit
- [ ] Tests pass
- [ ] No lint errors
- [ ] Docs updated (if needed)
- [ ] Conventional commit message

---

## Critical Documentation Updates

### COMPLETE_SETUP_GUIDE.md (KEEP UPDATED)

The file `docs/COMPLETE_SETUP_GUIDE.md` must be updated whenever:

| Change Type | Action Required |
|-------------|-----------------|
| New tool/dependency added | Add to Section 1 |
| Folder structure changes | Update Section 3 |
| New automation script | Add to Section 4 & 6 |
| New agent type created | Add to Section 4.3 |
| Workflow/process changes | Update Section 5 |
| New commands added | Update Section 6 |

**Update process:**
1. Make changes to relevant section
2. Increment version (MAJOR.MINOR.PATCH)
3. Add entry to Version History table
4. Commit: `docs(setup): update complete setup guide vX.X.X`

This file is protected and must NEVER be deleted.

---

*For role-specific details, see `prompts/agents/roles/[ROLE]_AGENT.md`*
*For session history, see `prompts/agents/memory/[ROLE]_MEMORY.md`*
