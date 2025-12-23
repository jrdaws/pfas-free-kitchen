# Coordination Protocol for Parallel Agents

> **Version:** 1.0
> **Purpose:** Define how multiple AI agents work in parallel without conflicts

---

## Session Start Protocol

Every agent session must:

### Step 1: Check Inboxes
```bash
# Check your specific inbox first
ls -la output/[your-agent]/inbox/

# Then check shared inbox for unclaimed tasks
ls -la output/shared/inbox/
```

### Step 2: Claim a Task
If taking a task from shared inbox, move it to your inbox:
```bash
mv output/shared/inbox/TASK.txt output/[your-agent]/inbox/
```

### Step 3: Announce Start
Write to your workspace:
```
output/[your-agent]/workspace/CURRENT_TASK.txt
```

Contents:
```
Task: [Task name]
Started: YYYY-MM-DD HH:MM
Expected Duration: [X minutes/hours]
Files I Will Modify:
- file1.ts
- file2.mjs
```

### Step 4: Check for Conflicts
Before modifying files, check if another agent is working on them:
```bash
grep -r "file1.ts" output/*/workspace/CURRENT_TASK.txt
```

If conflict found, coordinate or wait.

---

## During Work Protocol

### 1. File Locking (Soft Lock)
When starting to modify a file, add to your CURRENT_TASK.txt:
```
Currently Editing:
- packages/ai-agent/src/index.ts [LOCKED]
```

### 2. Progress Updates
For long tasks (>30 min), update workspace:
```
output/[your-agent]/workspace/PROGRESS.txt
```

### 3. Questions/Blockers
If blocked, write to shared:
```
output/shared/inbox/YYYYMMDD-HHMM-P0-blocker-[description].txt
```

---

## Session End Protocol

### Step 1: Write Completion Report
```
output/[your-agent]/outbox/YYYYMMDD-HHMM-completion-[task].txt
```

Format:
```
================================================================================
COMPLETION REPORT: [Task Name]
================================================================================
Agent: [Your Agent]
Date: YYYY-MM-DD HH:MM
Duration: [X minutes]

## Work Completed
- [Item 1]
- [Item 2]

## Files Modified
- path/to/file1.ts
- path/to/file2.mjs

## Tests
- npm test: [PASS/FAIL] ([X]/[Y] tests)

## Commits Made
- [commit hash] [message]

## Follow-up Needed
- [ ] [Item requiring attention]

## Handoff Required?
[YES - see output/[target-agent]/inbox/...] or [NO]
================================================================================
```

### Step 2: Clear Workspace
Remove or update:
```
rm output/[your-agent]/workspace/CURRENT_TASK.txt
```

### Step 3: Create Handoffs
If work needs continuation by another agent:
```
output/[target-agent]/inbox/YYYYMMDD-HHMM-P[X]-handoff-[task].txt
```

---

## Conflict Resolution

### Same File Conflict
If two agents need the same file:

1. **Check timestamps** - Earlier claim wins
2. **Coordinate** - One agent waits
3. **Split work** - Divide file sections
4. **Merge** - Work separately, merge after

### Task Dependency
If Task B depends on Task A:

1. Task A agent writes to Task B agent's inbox when ready
2. Include all context needed
3. Task B agent waits for inbox message

---

## Emergency Protocols

### Agent Crash (Incomplete Session)
If an agent session ends unexpectedly:
1. `CURRENT_TASK.txt` remains in workspace
2. Next agent of same type should check and recover
3. Clean up any partial work

### Blocking Issue
For issues blocking all work:
1. Write to `output/shared/inbox/` with P0 priority
2. Any available agent can address
3. Resolution goes to `output/shared/outbox/`

---

## File Templates

### Task Assignment Template
```
================================================================================
TASK ASSIGNMENT
================================================================================
Priority: P[0-3]
Target Agent: [Agent Name] or [Any]
Created By: [Your Agent]
Date: YYYY-MM-DD HH:MM

## Task Description
[Clear description of what needs to be done]

## Context
[Background information, why this is needed]

## Files to Review
- path/to/file1.ts
- path/to/file2.mjs

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Estimated Effort
[X minutes/hours]

## Dependencies
[None] or [Depends on Task X]
================================================================================
```

### Handoff Template
```
================================================================================
HANDOFF: [Task Name]
================================================================================
From: [Your Agent]
To: [Target Agent]
Date: YYYY-MM-DD HH:MM
Priority: P[0-3]

## What I Did
- [Completed item 1]
- [Completed item 2]

## What Remains
- [ ] Remaining item 1
- [ ] Remaining item 2

## Key Context
[Important decisions made, gotchas, etc.]

## Files Modified (By Me)
- path/to/file.ts

## Files To Modify (By You)
- path/to/other-file.ts

## How to Test
```bash
[test commands]
```

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
================================================================================
```

---

## Reading Protocol for Self-Prompting

Agents can use files as prompts for themselves:

### Step 1: Read Task File
```bash
cat output/[your-agent]/inbox/TASK.txt
```

### Step 2: Copy Contents
Select and copy the entire file contents

### Step 3: Start New Chat
Paste as the first message in a new Cursor chat

### Step 4: Agent Bootstraps
The agent will:
1. Read governance files (AGENT_CONTEXT.md)
2. Pass verification
3. Execute the task
4. Write completion to outbox

---

## Automation Options

For automated workflows, see:
- `output/shared/workspace/AUTOMATION_OPTIONS.md`


