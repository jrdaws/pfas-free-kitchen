#!/bin/bash
# Cancel pending auto-continuation
# Usage: ./scripts/auto-continue/cancel-continue.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUTOMATION_DIR="$PROJECT_ROOT/output/automation"
TRIGGER_FILE="$AUTOMATION_DIR/continue-trigger.json"
LOG_FILE="$AUTOMATION_DIR/continue-log.csv"

if [ -f "$TRIGGER_FILE" ]; then
    # Log the cancellation
    if [ -f "$LOG_FILE" ]; then
        AGENT=$(cat "$TRIGGER_FILE" | grep -o '"agent"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        TASK_ID=$(cat "$TRIGGER_FILE" | grep -o '"task_id"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        STEP=$(cat "$TRIGGER_FILE" | grep -o '"current_step"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
        TOTAL=$(cat "$TRIGGER_FILE" | grep -o '"total_steps"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),$AGENT,$TASK_ID,$STEP,$TOTAL,cancelled" >> "$LOG_FILE"
    fi
    
    rm -f "$TRIGGER_FILE"
    echo "❌ Auto-continuation cancelled"
    echo ""
    echo "The pending continuation has been removed."
    echo "Keyboard Maestro will not trigger."
else
    echo "ℹ️  No pending auto-continuation to cancel"
fi

