# Agent Task System

> A hybrid manual + automated system for coordinating AI agent work

---

## Quick Start

### 1. Start File Watcher (Option C)

Run this in a terminal to get notifications when new tasks appear:

```bash
./scripts/watch-inboxes.sh
```

You'll receive macOS notifications when tasks are added to any inbox.

### 2. Check Pending Tasks (Option A)

```bash
./scripts/run-agent.sh all
```

### 3. Launch an Agent (Option A)

Copy the activation line from `output/ACTIVATE_AGENTS.txt` into a new Cursor chat.

---

## How It Works

```
                    ┌─────────────────────────────────────────┐
                    │          TASK COORDINATION              │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│   Option A    │           │   Option C    │           │   Option D    │
│    Manual     │           │ File Watcher  │           │ GitHub Actions│
├───────────────┤           ├───────────────┤           ├───────────────┤
│ You run:      │           │ Watches for   │           │ Runs on:      │
│ run-agent.sh  │           │ new .txt in   │           │ - Push        │
│ and paste     │           │ inbox folders │           │ - Schedule    │
│ into Cursor   │           │ Sends macOS   │           │ - Manual      │
│               │           │ notification  │           │               │
└───────────────┘           └───────────────┘           └───────────────┘
        │                             │                             │
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                                      ▼
                            ┌───────────────┐
                            │  Agent reads  │
                            │  task file &  │
                            │  executes     │
                            └───────────────┘
                                      │
                                      ▼
                            ┌───────────────┐
                            │ Moves task to │
                            │ done/ folder  │
                            │ Writes report │
                            │ to outbox/    │
                            └───────────────┘
```

---

## Components

### Option A: Manual Control (run-agent.sh)

```bash
./scripts/run-agent.sh all        # Show all pending tasks
./scripts/run-agent.sh platform   # Show platform agent tasks
```

### Option C: File Watcher (watch-inboxes.sh)

```bash
./scripts/watch-inboxes.sh        # Start watching (Ctrl+C to stop)
```

Requires: `brew install fswatch`

### Option D: GitHub Actions (agent-tasks.yml)

Automatically runs on:
- **Push:** When task files are added/modified
- **Schedule:** Every 6 hours to check for stale tasks
- **Manual:** Via workflow_dispatch

Check status at: `https://github.com/[repo]/actions/workflows/agent-tasks.yml`

---

## Folder Structure

```
output/
├── ACTIVATE_AGENTS.txt      # One-liner commands to launch agents
├── TASK_SYSTEM.md           # This documentation
│
├── shared/
│   └── workspace/
│       └── PROJECT_STATUS.md
│
└── [agent]-agent/
    ├── inbox/               # Pending tasks (agents read from here)
    ├── done/                # Completed tasks (moved from inbox)
    ├── outbox/              # Completion reports (agents write here)
    └── workspace/           # Working documents
```

---

## Workflow

### Creating a Task

1. Create a `.txt` file in the agent's inbox
2. File watcher notifies you (if running)
3. GitHub Actions updates status on push

### Executing a Task

1. Copy activation line from `ACTIVATE_AGENTS.txt`
2. Paste into new Cursor chat
3. Agent reads task, executes, writes report

### After Completion

1. Agent moves task from `inbox/` to `done/`
2. Agent writes completion report to `outbox/`
3. Agent updates memory file

---

## Best Practices

1. **Keep file watcher running** during work sessions
2. **Check GitHub Actions** for stale task alerts
3. **One agent per Cursor chat** to avoid confusion
4. **Review outbox** for handoff notes between agents

