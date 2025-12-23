# Continuous Improvement System

> Multi-Agent Feedback Loop for Dawson-Does Framework
> Version: 1.0 | Created: 2025-12-23

---

## Overview

A 3-agent controller system that runs in 6-hour cycles to continuously improve the project through automated auditing, strategic planning, and curated task distribution.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CONTINUOUS IMPROVEMENT CYCLE                      │
│                         (Every 6 Hours)                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     AUDITOR     │ ───▶ │   STRATEGIST    │ ───▶ │     CURATOR     │
│   (Phase: Check)│      │   (Phase: Plan) │      │   (Phase: Act)  │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ Review state    │      │ Create strategy │      │ Finalize tasks  │
│ Identify gaps   │      │ Draft prompts   │      │ Distribute work │
│ Measure progress│      │ Prioritize      │      │ Quality control │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    ┌─────────────────────────┐
                    │    EXECUTOR AGENTS      │
                    │      (Phase: Do)        │
                    │ CLI, Website, Platform, │
                    │ Testing, Template, etc. │
                    └─────────────────────────┘
                                  │
                                  ▼
                         [Next Cycle Input]
```

---

## Folder Structure

```
output/
├── CONTINUOUS_IMPROVEMENT_SYSTEM.md    # This file
├── ACTIVATE_CONTROLLERS.txt            # One-liners to launch controllers
│
├── shared/
│   ├── reports/                        # All cycle reports
│   │   ├── audit-YYYYMMDD-HHMM.txt
│   │   ├── strategy-YYYYMMDD-HHMM.txt
│   │   └── cycle-summary-YYYYMMDD-HHMM.txt
│   ├── templates/                      # Report templates
│   │   ├── AUDIT_TEMPLATE.md
│   │   ├── STRATEGY_TEMPLATE.md
│   │   └── CYCLE_SUMMARY_TEMPLATE.md
│   ├── metrics/                        # Velocity and quality tracking
│   │   └── velocity-log.csv
│   └── workspace/
│       └── PROJECT_STATUS.md
│
├── controller-agents/
│   ├── auditor/
│   │   ├── inbox/                      # Trigger files
│   │   ├── outbox/                     # Audit reports
│   │   └── workspace/                  # Working notes
│   ├── strategist/
│   │   ├── inbox/                      # Receives audit
│   │   ├── outbox/                     # Strategy + draft prompts
│   │   └── workspace/
│   └── curator/
│       ├── inbox/                      # Receives strategy
│       ├── outbox/                     # Final prompts
│       └── workspace/
│
└── [agent]-agent/                      # Executor agents
    ├── inbox/                          # Final tasks from Curator
    ├── done/
    ├── outbox/
    └── workspace/
```

---

## The PDCA Cycle Mapping

| Phase | Agent | Responsibility |
|-------|-------|----------------|
| **Check** | Auditor | Measure current state, identify deviations |
| **Plan** | Strategist | Create improvement plan, draft tasks |
| **Act** | Curator | Refine and distribute final tasks |
| **Do** | Executors | Implement the tasks |

---

## Quick Start

### 1. Run a Complete Cycle

```bash
# Step 1: Launch Auditor
# Copy into new Cursor chat:
Read and execute output/controller-agents/auditor/inbox/START_CYCLE.txt

# Step 2: After Auditor completes, launch Strategist
# Copy into new Cursor chat:
Read and execute output/controller-agents/strategist/inbox/START_CYCLE.txt

# Step 3: After Strategist completes, launch Curator
# Copy into new Cursor chat:
Read and execute output/controller-agents/curator/inbox/START_CYCLE.txt

# Step 4: Launch executor agents as needed
./scripts/run-agent.sh all
```

### 2. Automated 6-Hour Trigger

GitHub Actions runs every 6 hours and creates a notification issue when a cycle is due.

---

## Success Metrics

| Metric | Target | Measured By |
|--------|--------|-------------|
| Tasks completed per cycle | 5+ | Curator counts done/ files |
| Test pass rate | 100% | Auditor checks npm test |
| Prompt quality score | 8+/10 | Curator self-assessment |
| Cycle completion time | <2 hours | Timestamp diff |
| Blocker resolution rate | 90%+ | Blockers resolved / raised |

---

## Files Reference

| File | Purpose |
|------|---------|
| `prompts/agents/roles/controllers/AUDITOR.md` | Auditor SOP |
| `prompts/agents/roles/controllers/STRATEGIST.md` | Strategist SOP |
| `prompts/agents/roles/controllers/CURATOR.md` | Curator SOP |
| `output/shared/templates/*.md` | Report templates |
| `output/ACTIVATE_CONTROLLERS.txt` | Launch commands |
| `.github/workflows/improvement-cycle.yml` | 6-hour trigger |


