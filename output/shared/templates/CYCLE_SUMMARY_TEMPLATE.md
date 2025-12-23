# Cycle Summary

Cycle: [number]
Date: YYYY-MM-DD HH:MM
Curator: CURATOR Agent

---

## Cycle Overview

| Phase | Agent | Status | Duration |
|-------|-------|--------|----------|
| Check | Auditor | ✅ Complete | [time] |
| Plan | Strategist | ✅ Complete | [time] |
| Act | Curator | ✅ Complete | [time] |

---

## Tasks Distributed

| Agent | Task | Priority | Quality Score |
|-------|------|----------|---------------|
| CLI | [Title] | P1 | 8.5/10 |
| Website | [Title] | P2 | 7.8/10 |

**Total Tasks**: [count]
**Average Quality Score**: [score]/10

---

## Quality Assessment

### Approved Prompts

| Task | Clarity | Completeness | Alignment | Actionability | Scope | Total |
|------|---------|--------------|-----------|---------------|-------|-------|
| T1 | 9 | 8 | 9 | 8 | 9 | 8.6 |
| T2 | 8 | 9 | 8 | 9 | 8 | 8.4 |

### Rejected Prompts

| Task | Score | Reason | Disposition |
|------|-------|--------|-------------|
| T[x] | 5.2 | [Reason] | Returned to Strategist |

---

## Velocity Metrics

### This Cycle
- Tasks Created: [count]
- Tasks from Last Cycle Completed: [count]
- Completion Rate: [percentage]

### Trend (Last 5 Cycles)
| Cycle | Created | Completed | Rate |
|-------|---------|-----------|------|
| N-4 | [num] | [num] | [%] |
| N-3 | [num] | [num] | [%] |
| N-2 | [num] | [num] | [%] |
| N-1 | [num] | [num] | [%] |
| N | [num] | [num] | [%] |

---

## Retrospective

### What Worked Well
- [Positive observation]
- [Positive observation]

### What Needs Improvement
- [Area for improvement]
- [Area for improvement]

### Action Items for Next Cycle
- [Specific action]

---

## Vision Alignment Check

| Principle | Tasks Aligned | Notes |
|-----------|---------------|-------|
| Export-First | [count]/[total] | [notes] |
| Zero Lock-In | [count]/[total] | [notes] |
| Cursor-Native | [count]/[total] | [notes] |
| Transparency | [count]/[total] | [notes] |
| Fail Gracefully | [count]/[total] | [notes] |

---

## Files Created

### Reports
- `output/shared/reports/audit-YYYYMMDD-HHMM.txt`
- `output/shared/reports/strategy-YYYYMMDD-HHMM.txt`
- `output/shared/reports/cycle-summary-YYYYMMDD-HHMM.txt`

### Task Prompts Distributed
- `output/cli-agent/inbox/YYYYMMDD-HHMM-P1-task-xxx.txt`
- `output/website-agent/inbox/YYYYMMDD-HHMM-P2-task-xxx.txt`
[etc.]

---

## Next Cycle

**Scheduled Start**: [timestamp + 6 hours]
**Trigger**: Auditor reads new commits and test results

### Carry-Forward Items
- [Items that didn't complete this cycle]

### Watch Items
- [Things to monitor]

---

## Executor Launch Commands

Copy these into new Cursor chats to launch agents:

CLI AGENT
Read and execute the task in output/cli-agent/inbox/[task-file].txt

WEBSITE AGENT
Read and execute the task in output/website-agent/inbox/[task-file].txt

[etc. for each agent with tasks]

---

(CURATOR Agent)

