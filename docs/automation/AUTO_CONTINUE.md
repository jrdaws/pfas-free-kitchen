# Agent Auto-Continuation System

> **Version**: 1.0.0 | **Last Updated**: 2025-12-24
> 
> **Purpose**: Enable AI agents to trigger their own continuation prompts for multi-step tasks
> **Requires**: Keyboard Maestro (macOS)

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Quick Start](#quick-start)
4. [Scripts Reference](#scripts-reference)
5. [Keyboard Maestro Setup](#keyboard-maestro-setup)
6. [Agent Protocol](#agent-protocol)
7. [Safety Features](#safety-features)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The Auto-Continuation System allows AI agents to "self-prompt" for multi-step tasks, enabling unattended overnight operation.

### The Problem

Multi-step agent tasks require manual user intervention between steps, breaking flow and preventing automation.

### The Solution

```
Agent completes step 1 → Creates trigger file → KM detects → KM waits → KM pastes next prompt → Agent continues
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTO-CONTINUATION FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Agent identifies multi-step task                                │
│       │                                                              │
│       ▼                                                              │
│  2. Agent runs: trigger-continue.sh "AGENT" "next prompt" 30 1 3   │
│       │                                                              │
│       ▼                                                              │
│  3. Script creates: output/automation/continue-trigger.json        │
│       │                                                              │
│       ▼                                                              │
│  4. Keyboard Maestro detects new file                               │
│       │                                                              │
│       ▼                                                              │
│  5. KM waits specified seconds (e.g., 30s)                          │
│       │                                                              │
│       ▼                                                              │
│  6. KM activates Cursor, opens new chat, pastes prompt              │
│       │                                                              │
│       ▼                                                              │
│  7. KM archives trigger file, logs execution                        │
│       │                                                              │
│       ▼                                                              │
│  8. Agent receives prompt, continues with next step                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Make Scripts Executable

```bash
cd /Users/joseph.dawson/Documents/dawson-does-framework
chmod +x scripts/auto-continue/*.sh
```

### 2. Test the Trigger Script

```bash
./scripts/auto-continue/trigger-continue.sh "TESTING" "This is a test prompt" 10 1 1
```

### 3. Check Status

```bash
./scripts/auto-continue/check-continue.sh
```

### 4. Cancel (if needed)

```bash
./scripts/auto-continue/cancel-continue.sh
```

### 5. Set Up Keyboard Maestro

See [Keyboard Maestro Setup](#keyboard-maestro-setup) below.

---

## Scripts Reference

### trigger-continue.sh

Triggers an auto-continuation.

```bash
./scripts/auto-continue/trigger-continue.sh "AGENT_NAME" "PROMPT" WAIT_SECS STEP TOTAL [TASK_ID]
```

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| AGENT_NAME | Yes | - | Agent that will receive the prompt (e.g., "DOCUMENTATION") |
| PROMPT | Yes | - | The prompt text to paste |
| WAIT_SECS | No | 30 | Seconds to wait before pasting |
| STEP | No | 1 | Current step number |
| TOTAL | No | 1 | Total steps in task |
| TASK_ID | No | auto | Unique task identifier |

**Example:**

```bash
./scripts/auto-continue/trigger-continue.sh "DOCUMENTATION" "Continue with step 2: Update the README template for export clarity." 30 2 3 "export-clarity-task"
```

### cancel-continue.sh

Cancels a pending auto-continuation.

```bash
./scripts/auto-continue/cancel-continue.sh
```

### check-continue.sh

Shows current status and recent log entries.

```bash
./scripts/auto-continue/check-continue.sh
```

### km-executor.sh

Helper script for Keyboard Maestro. Not called directly by agents.

```bash
./scripts/auto-continue/km-executor.sh read      # Extract trigger values
./scripts/auto-continue/km-executor.sh archive   # Move trigger to archive
./scripts/auto-continue/km-executor.sh log-executed  # Log completion
```

---

## Keyboard Maestro Setup

### Create the Macro

1. Open Keyboard Maestro
2. Create a new macro: "Agent Auto-Continue"
3. Add trigger: **Folder Trigger**
   - Watch: `~/Documents/dawson-does-framework/output/automation/`
   - Trigger on: File added or modified
   - Match: `continue-trigger.json`

### Macro Actions

Add these actions in order:

#### Action 1: Execute Shell Script (Read Trigger)

```bash
cd ~/Documents/dawson-does-framework
./scripts/auto-continue/km-executor.sh read
```

- Save results to variable: `TriggerOutput`

#### Action 2: Search Variable

Search `TriggerOutput` for `WAIT=(\d+)` and save to `WaitSeconds`

#### Action 3: Search Variable

Search `TriggerOutput` for `(?<=PROMPT_START\n)[\s\S]*(?=\nPROMPT_END)` and save to `NextPrompt`

#### Action 4: Pause

Pause for `%Variable%WaitSeconds%` seconds

#### Action 5: Activate Application

Activate: Cursor

#### Action 6: Pause

Pause: 0.5 seconds

#### Action 7: Type Keystroke

Press: ⌘N (new chat)

#### Action 8: Pause

Pause: 1 second

#### Action 9: Set Clipboard

Set clipboard to: `%Variable%NextPrompt%`

#### Action 10: Type Keystroke

Press: ⌘V (paste)

#### Action 11: Pause

Pause: 0.5 seconds

#### Action 12: Type Keystroke

Press: Return (submit)

#### Action 13: Execute Shell Script (Log & Archive)

```bash
cd ~/Documents/dawson-does-framework
./scripts/auto-continue/km-executor.sh log-executed
./scripts/auto-continue/km-executor.sh archive
```

---

## Agent Protocol

### When to Use Auto-Continue

- Task requires 3+ distinct steps
- Each step needs separate agent interaction
- Steps can run independently
- Overnight/unattended operation needed

### How to Trigger

At the end of a step, include this in your response:

```markdown
## 🔄 Auto-Continue: Step X of Y

**Next step in: 30 seconds**

To continue manually instead, copy this prompt:
[Next prompt here]

To cancel auto-continue:
```bash
./scripts/auto-continue/cancel-continue.sh
```
```

Then run the trigger script:

```bash
./scripts/auto-continue/trigger-continue.sh "AGENT_NAME" "Next prompt text here" 30 1 3 "task-id"
```

### Example Multi-Step Task

**Step 1 of 3: Research**

```markdown
## 🔄 Auto-Continue: Step 1 of 3

Research complete. **Step 2 triggers in 30 seconds.**

Manual prompt:
"Continue with step 2: Create the implementation based on research findings."

To cancel: `./scripts/auto-continue/cancel-continue.sh`
```

```bash
./scripts/auto-continue/trigger-continue.sh "DOCUMENTATION" "Continue with step 2: Create the implementation based on research findings." 30 2 3 "research-impl-task"
```

---

## Safety Features

### 1. Max Auto-Continues

Maximum 5 auto-continues per task ID prevents infinite loops.

### 2. Timeout

If KM doesn't execute within 10 minutes, trigger is considered stale.

### 3. User Cancel

User can always run `cancel-continue.sh` to stop pending continuation.

### 4. Logging

All triggers and executions are logged to `output/automation/continue-log.csv`.

### 5. Archive

Executed triggers are archived to `output/automation/archive/` with timestamps.

### 6. Auditor Verification

All auto-continued tasks should end with an Auditor Agent verification step.

---

## Troubleshooting

### Trigger file created but KM doesn't detect

1. Check KM macro is enabled
2. Verify folder path in KM trigger
3. Check `continue-trigger.json` exists:
   ```bash
   cat output/automation/continue-trigger.json
   ```

### KM detects but doesn't paste

1. Ensure Cursor is running
2. Check script permissions:
   ```bash
   chmod +x scripts/auto-continue/*.sh
   ```
3. Test km-executor manually:
   ```bash
   ./scripts/auto-continue/km-executor.sh read
   ```

### Infinite loop protection triggers

Reset by deleting the trigger file:
```bash
rm output/automation/continue-trigger.json
```

### View execution log

```bash
cat output/automation/continue-log.csv
```

---

## Files

| File | Purpose |
|------|---------|
| `scripts/auto-continue/trigger-continue.sh` | Create continuation trigger |
| `scripts/auto-continue/cancel-continue.sh` | Cancel pending continuation |
| `scripts/auto-continue/check-continue.sh` | Check status |
| `scripts/auto-continue/km-executor.sh` | KM helper script |
| `output/automation/continue-trigger.json` | Current trigger (if pending) |
| `output/automation/continue-log.csv` | Execution log |
| `output/automation/archive/` | Archived triggers |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-24 | Platform Agent | Initial implementation |

