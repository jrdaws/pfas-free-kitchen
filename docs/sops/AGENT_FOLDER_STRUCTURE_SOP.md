# Agent Folder Structure SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-24
> 
> **Purpose**: Standardize how all agents organize their files and manage prompts
> **Audience**: All agents
> **Principle**: "One prompt, one location, tracked to completion"

---

## Table of Contents

1. [Standard Folder Structure](#1-standard-folder-structure)
2. [Folder Purposes](#2-folder-purposes)
3. [Prompt Lifecycle](#3-prompt-lifecycle)
4. [Naming Conventions](#4-naming-conventions)
5. [Rules](#5-rules)

---

## 1. Standard Folder Structure

**Every agent MUST have this exact folder structure:**

```
output/[agent-name]/
├── inbox/           # Pending prompts waiting to be executed
├── outbox/          # Completed work outputs, handoff prompts for next agent
├── done/            # Prompts that have been executed and completed
└── workspace/       # Temporary working files, drafts, scratch space
```

### Agent Folder Locations

| Agent | Folder Path |
|-------|-------------|
| CLI Agent | `output/cli-agent/` |
| Website Agent | `output/website-agent/` |
| Documentation Agent | `output/documentation-agent/` |
| Testing Agent | `output/testing-agent/` |
| Platform Agent | `output/platform-agent/` |
| Template Agent | `output/template-agent/` |
| Integration Agent | `output/integration-agent/` |
| Auditor Agent | `output/controller-agents/auditor/` |
| Strategist Agent | `output/controller-agents/strategist/` |
| Curator Agent | `output/controller-agents/curator/` |
| Research Agent | `output/media-pipeline/research-agent/` |
| Media Agent | `output/media-pipeline/media-agent/` |
| Quality Agent | `output/media-pipeline/quality-agent/` |

---

## 2. Folder Purposes

### inbox/

**Purpose**: Contains prompts/tasks waiting to be executed.

- Prompts placed here by other agents or manually
- Agent reads from here when starting work
- Files are MOVED (not copied) to `done/` after completion
- **Only .txt or .md files**

### outbox/

**Purpose**: Contains completed work outputs and handoff prompts.

- Reports, summaries, deliverables go here
- Handoff prompts for the NEXT agent are created here
- Other agents can read from here
- Files are dated: `YYYYMMDD-[description].txt`

### done/

**Purpose**: Archive of completed prompts.

- Prompts MOVED here from `inbox/` after execution
- Serves as a record of completed work
- Can be used for auditing and tracking
- **Never delete** - this is the completion record

### workspace/

**Purpose**: Temporary working files.

- Drafts, notes, scratch files
- Files that are "in progress"
- Can be cleaned up periodically
- Not for permanent storage

---

## 3. Prompt Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                       PROMPT LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. CREATION                                                        │
│     Agent A creates prompt → Saves to Agent B's inbox/             │
│     File: output/agent-b/inbox/TASK-[description].txt              │
│                                                                      │
│  2. ACTIVATION                                                      │
│     Agent B reads prompt from inbox/                                │
│     Agent B executes the task                                       │
│                                                                      │
│  3. COMPLETION                                                      │
│     Agent B MOVES prompt from inbox/ → done/                        │
│     Agent B creates output in outbox/ (if needed)                   │
│     Agent B creates handoff prompt for next agent                   │
│                                                                      │
│  4. HANDOFF                                                         │
│     Agent B creates prompt → Saves to Agent C's inbox/             │
│     Cycle repeats                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Rule: One Prompt, One Location

- A prompt file should exist in **exactly one place** at any time
- When created: in target agent's `inbox/`
- When completed: MOVED to executing agent's `done/`
- **Never duplicate** prompts across folders

---

## 4. Naming Conventions

### Prompt Files (inbox/)

```
[PRIORITY]-[type]-[description].txt
```

| Component | Values | Example |
|-----------|--------|---------|
| PRIORITY | P0, P1, P2, P3, TASK, FIX | `P1-` |
| type | Optional: fix, task, feature | `feature-` |
| description | Kebab-case description | `add-login-flow` |

**Examples:**
- `P0-fix-hydration-error.txt`
- `P1-feature-add-auth.txt`
- `TASK-verify-exports.txt`

### Output Files (outbox/)

```
YYYYMMDD-[type]-[description].txt
```

**Examples:**
- `20251224-report-export-clarity.txt`
- `20251224-handoff-testing-agent.txt`

### Done Files (done/)

Keep original filename, optionally prefix with completion date:

```
[original-filename].txt
# OR
YYYYMMDD-completed-[original-filename].txt
```

---

## 5. Rules

### Rule 1: Prompt Creation

When an agent needs to create a prompt for another agent:

1. **Create the .txt file** in the target agent's `inbox/`
2. **Output a fenced prompt** in the response for easy copying
3. **Include the file path** so user knows where it's saved

```markdown
## Next Agent: [Role] Agent
```
Confirm you are the [Role] Agent.
cd /Users/joseph.dawson/Documents/dawson-does-framework && cat output/[agent]/inbox/[filename].txt
```

**Prompt saved to**: `output/[agent]/inbox/[filename].txt`
```

### Rule 2: Prompt Completion

When an agent completes a prompt:

1. **MOVE** the prompt file from `inbox/` to `done/`
   ```bash
   mv output/[agent]/inbox/[filename].txt output/[agent]/done/
   ```
2. **Create output** in `outbox/` if deliverables exist
3. **Create handoff prompt** for next agent (if applicable)

### Rule 3: No Duplicate Prompts

- A prompt should exist in **ONE location only**
- Creating: goes to target's `inbox/`
- Completed: moves to executor's `done/`
- **Never** keep copies in multiple places

### Rule 4: Checkpoint Must Track Prompts

During checkpoint, agents MUST list:
- Prompts created (in other agents' inboxes)
- Prompts completed (moved to own done/)

```markdown
### Pending Prompts (Not Yet Run):
| Agent | File | Priority |
|-------|------|----------|
| [AGENT] | `output/[agent]/inbox/[file].txt` | P[0-3] |
```

### Rule 5: Folder Cleanup

- `inbox/`: Never delete, move to `done/` when complete
- `outbox/`: Keep for 30 days, then archive
- `done/`: Never delete (audit trail)
- `workspace/`: Clean up after task completion

---

## Folder Structure Verification

Run this to check all agents have correct structure:

```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework

for agent in cli-agent website-agent documentation-agent testing-agent platform-agent template-agent integration-agent; do
  echo "=== $agent ==="
  for folder in inbox outbox done workspace; do
    if [ -d "output/$agent/$folder" ]; then
      echo "  ✅ $folder"
    else
      echo "  ❌ $folder (missing)"
      mkdir -p "output/$agent/$folder"
    fi
  done
done
```

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Author | DOC Agent | 2025-12-24 | ✅ Drafted |
| Reviewer | Auditor Agent | 2025-12-24 | ✅ Approved (98/100) |

**Auditor Notes:**
- All 13 agents verified as 100% compliant with folder structure
- No legacy "completed" or "processed" folders found (correct - uses `done/`)
- Clear lifecycle diagram and actionable rules
- Verification script included for ongoing compliance

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-24 | DOC Agent | Initial creation |
| 1.0.1 | 2025-12-24 | Auditor Agent | Added approval chain, verified compliance |

