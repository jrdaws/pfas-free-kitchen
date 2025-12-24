# Checkpoint SOP

> **Version**: 1.0.0 | **Last Updated**: 2025-12-24
> 
> **Purpose**: Standardize checkpoint process with mandatory memory updates
> **Audience**: All 13 agents
> **Maintained By**: Auditor Agent

---

## Overview

A "checkpoint" is a mid-session or end-session save point. It ensures:
1. Work is committed and pushed
2. Memory is updated for continuity
3. State is certified in MINDFRAME

---

## Checkpoint Trigger

When user says: `checkpoint`, `save`, `commit`, or `end session`

---

## Mandatory Checkpoint Steps

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKPOINT PROTOCOL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. RUN TESTS                                                    │
│     npm test                                                     │
│     └── Must pass before continuing                             │
│                                                                  │
│  2. COMMIT & PUSH                                                │
│     git add -A && git commit && git push                        │
│     └── Use conventional commit format                          │
│                                                                  │
│  3. UPDATE MEMORY (MANDATORY)                                   │
│     prompts/agents/memory/[ROLE]_MEMORY.md                      │
│     └── Add session entry with required fields                 │
│                                                                  │
│  4. CERTIFY (if significant work)                               │
│     ./scripts/certify.sh [CODE] [AREA] [STATUS] [VIBE] [NOTES] │
│     └── Updates MINDFRAME.md                                    │
│                                                                  │
│  5. OUTPUT SUMMARY                                               │
│     └── Show checkpoint confirmation to user                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Memory Update Requirements

### The 5 Distillation Categories

Every checkpoint MUST capture insights from these 5 categories:

| # | Category | What to Save | When | Required? |
|---|----------|--------------|------|-----------|
| 1 | **Operational** | Tasks, decisions, files changed | Every session | ✅ ALWAYS |
| 2 | **Patterns** | Recurring errors, common questions | When count ≥2 | 🟡 If applicable |
| 3 | **Insights** | Commands, gotchas, workarounds | When novel | 🟡 If applicable |
| 4 | **Metrics** | Duration, task count, errors | Every session | ✅ ALWAYS |
| 5 | **Relationships** | Handoffs, agent coordination | When new | 🟡 If applicable |

### Mandatory Session Entry Template

```markdown
### Session: [DATE] [TIME] ([Brief Label])

## 📋 OPERATIONAL (Required)
#### Work Completed
- [Task 1]
- [Task 2]

#### Key Decisions
- [Decision]: [Reasoning]

#### Files Changed
- [file1.ts] - [what changed]
- [file2.md] - [what changed]

#### Blockers/Issues
- [Issue or "None"]

## 📊 METRICS (Required)
- **Duration**: [X] minutes
- **Tasks Completed**: [N]
- **Errors Encountered**: [N]

## 🔄 PATTERNS (If applicable - when count ≥2)
#### Recurring Issues
- [Issue seen multiple times]: [Count]

#### Common Questions
- [Question asked repeatedly]

## 💡 INSIGHTS (If applicable - when novel)
#### Useful Commands Discovered
- `[command]`: [what it does]

#### Gotchas/Workarounds
- [Problem]: [Solution]

## 🤝 RELATIONSHIPS (If applicable - when new)
#### Agent Handoffs
- From [Agent] → To [Agent]: [Topic]

#### Dependencies Discovered
- [File/Component] depends on [Other]
```

### Quick Capture Checklist

Before completing checkpoint, mentally run through:

```
□ OPERATIONAL: What did I do? What did I decide? What files?
□ METRICS: How long? How many tasks? Any errors?
□ PATTERNS: Did I see this issue before? Is this a repeat question?
□ INSIGHTS: Did I learn something useful? Any gotchas?
□ RELATIONSHIPS: Did I hand off to another agent? New dependencies?
```

---

## Distillation Categories

### Category 1: Operational State (ALWAYS save)

| What | Why | Where |
|------|-----|-------|
| Tasks completed | Continuity | Session entry |
| Decisions made | Audit trail | Session entry |
| Files changed | Reference | Session entry |
| Current blockers | Handoff | Active Context |

### Category 2: Patterns (Save when count ≥2)

| What | Why | Where |
|------|-----|-------|
| Recurring errors | SOP candidate | Known Issues |
| Common questions | FAQ candidate | Insights |
| Slow operations | Optimization | Performance Notes |
| Lock conflicts | Process improvement | Coordination Notes |

### Category 3: Insights (Save when novel)

| What | Why | Where |
|------|-----|-------|
| Useful commands | Future reference | Quick Reference |
| File locations | Navigation | Key Files |
| Gotchas discovered | Avoid repeating | Insights |
| Workarounds used | Problem solving | Session Notes |

### Category 4: Metrics (Save every session)

| What | Why | Where |
|------|-----|-------|
| Session duration | Velocity tracking | Metrics |
| Tasks completed | Productivity | Metrics |
| Tests passed | Health | Metrics |
| Errors hit | Quality | Metrics |

### Category 5: Relationships (Save when new)

| What | Why | Where |
|------|-----|-------|
| Agent handoffs | Coordination | Handoff Notes |
| File dependencies | Architecture | Key Files |
| SOP references | Governance | Related SOPs |
| External tools used | Environment | Tools |

---

## Checkpoint Confirmation Format

After completing checkpoint, output:

```
## ✅ CHECKPOINT COMPLETE

| Item | Status |
|------|--------|
| Tests | ✅ [N] passing |
| Committed | ✅ [hash] |
| Pushed | ✅ origin/main |
| Memory Updated | ✅ [file] |
| Certified | ✅/⏭️ [area] |

### Session Summary (saved to memory)
- Duration: [time]
- Tasks: [count] completed
- Key Decision: [most important]
- Next: [handoff or continue]
```

---

## Memory File Structure Enhancement

### Proposed New Sections

```markdown
## 🔧 Quick Reference

### Useful Commands
- [command]: [what it does]

### Key File Locations
- [file]: [purpose]

---

## 📊 Session Metrics

| Session | Duration | Tasks | Decisions | Errors |
|---------|----------|-------|-----------|--------|
| 2025-12-24 | 45min | 5 | 2 | 0 |
| 2025-12-23 | 30min | 3 | 1 | 1 |

---

## ❓ FAQ (from user questions)

### Q: [Common question]
A: [Answer for future reference]

---

## 🔄 Coordination Log

| Date | With Agent | Topic | Resolution |
|------|------------|-------|------------|
| 2025-12-24 | Testing | Lock conflict | Waited 5min |
```

---

## Checkpoint Script

```bash
#!/bin/bash
# scripts/checkpoint.sh

AGENT_CODE=$1

echo "🔄 Running checkpoint for $AGENT_CODE Agent..."

# 1. Run tests
echo "📋 Running tests..."
npm test || { echo "❌ Tests failed - fix before checkpoint"; exit 1; }

# 2. Stage all changes
git add -A

# 3. Check for changes
if git diff --cached --quiet; then
  echo "ℹ️ No changes to commit"
else
  # 4. Commit
  read -p "Commit message: " MSG
  git commit -m "$MSG"
  
  # 5. Push
  ./scripts/git-push-safe.sh
fi

# 6. Remind about memory
echo ""
echo "📝 REMINDER: Update your memory file!"
echo "   File: prompts/agents/memory/${AGENT_CODE}_MEMORY.md"
echo ""
echo "   Required fields:"
echo "   - Work Completed"
echo "   - Key Decisions"
echo "   - Time Spent"
echo ""

echo "✅ Checkpoint complete!"
```

---

## Related Documents

- [MEMORY_FORMAT.md](../../prompts/agents/MEMORY_FORMAT.md) - Memory file structure
- [MINDFRAME.md](../../output/shared/MINDFRAME.md) - Certification tracking

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-24 | Auditor Agent | Initial creation |

---

## Approval Chain

| Role | Agent | Date | Status |
|------|-------|------|--------|
| Proposer | Auditor Agent | 2025-12-24 | ✅ Created |
| Reviewer | Auditor Agent | 2025-12-24 | ✅ Self-approved (meta-SOP) |
