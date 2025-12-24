# Automation Folder

This folder contains files for the Agent Auto-Continuation System.

## Contents

| File/Folder | Purpose |
|-------------|---------|
| `continue-trigger.json` | Current pending continuation (if any) |
| `continue-log.csv` | Log of all triggers and executions |
| `archive/` | Archived trigger files after execution |

## Quick Commands

```bash
# Check status
./scripts/auto-continue/check-continue.sh

# Cancel pending
./scripts/auto-continue/cancel-continue.sh

# Trigger manually
./scripts/auto-continue/trigger-continue.sh "AGENT" "prompt" 30 1 1
```

## Documentation

See `docs/automation/AUTO_CONTINUE.md` for full documentation.

