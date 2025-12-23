# Strategy Report

Cycle: [number]
Date: YYYY-MM-DD HH:MM
Strategist: STRATEGIST Agent
Responding to: audit-YYYYMMDD-HHMM.txt

---

## Strategic Priorities

Based on Auditor's findings, this cycle focuses on:

1. **[Priority 1]**: [Why this matters]
2. **[Priority 2]**: [Why this matters]
3. **[Priority 3]**: [Why this matters]

---

## Task Matrix

| ID | Task | Agent | Priority | Effort | Depends On |
|----|------|-------|----------|--------|------------|
| T1 | [Title] | [Agent] | P1 | Med | None |
| T2 | [Title] | [Agent] | P1 | High | T1 |
| T3 | [Title] | [Agent] | P2 | Low | None |

---

## Resource Allocation

### CLI Agent
- T[x]: [Task title]

### Website Agent
- T[x]: [Task title]

### Platform Agent
- T[x]: [Task title]

### Testing Agent
- T[x]: [Task title]

### Template Agent
- T[x]: [Task title]

### Documentation Agent
- T[x]: [Task title]

### Integration Agent
- T[x]: [Task title]

---

## Dependencies Map

```
T1 ──────────────────▶ T2
        │
        └──────────────▶ T3
                              │
T4 ────────────────────────────▶ T5
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Mitigation] |

---

## Draft Task Prompts

### T1: [Task Title]

```
# Task: [Title]

Priority: P1
Assigned To: [Agent]
Depends On: None
Estimated Effort: Medium

## Context
[Why this task matters now, reference to Auditor findings]

## Objectives
1. [Specific objective]
2. [Specific objective]

## Success Criteria
- [ ] [Measurable outcome]
- [ ] [Measurable outcome]

## Files to Modify
- [file path]
- [file path]

## Handoff
1. Move task to done/
2. Write completion report to outbox/
3. Update memory file
```

[Repeat for each task]

---

## Deferred Items

Tasks explicitly NOT included this cycle:
- [Item]: [Reason for deferral]

---

## Handoff

Report saved to: output/shared/reports/strategy-YYYYMMDD-HHMM.txt
Draft prompts saved to: output/controller-agents/strategist/outbox/drafts/
Next agent: CURATOR
Activation: Read and execute output/controller-agents/curator/inbox/START_CYCLE.txt

