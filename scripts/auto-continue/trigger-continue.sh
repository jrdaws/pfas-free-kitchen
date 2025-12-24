#!/bin/bash
# Agent Auto-Continuation Trigger Script
# Usage: ./scripts/auto-continue/trigger-continue.sh "AGENT_NAME" "PROMPT" WAIT_SECS STEP TOTAL [TASK_ID]
#
# This script creates a trigger file that Keyboard Maestro watches.
# When detected, KM will wait the specified time, then paste the prompt into Cursor.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUTOMATION_DIR="$PROJECT_ROOT/output/automation"
TRIGGER_FILE="$AUTOMATION_DIR/continue-trigger.json"
LOG_FILE="$AUTOMATION_DIR/continue-log.csv"
MAX_CONTINUES=5

# Arguments
AGENT="${1:-UNKNOWN}"
PROMPT="${2:-Continue with next step}"
WAIT="${3:-30}"
STEP="${4:-1}"
TOTAL="${5:-1}"
TASK_ID="${6:-task-$(date +%Y%m%d-%H%M%S)}"

# Validate
if [ -z "$AGENT" ] || [ "$AGENT" = "UNKNOWN" ]; then
    echo "❌ Error: Agent name required"
    echo "Usage: $0 AGENT_NAME \"PROMPT\" [WAIT_SECS] [STEP] [TOTAL] [TASK_ID]"
    exit 1
fi

# Check for infinite loop prevention
if [ -f "$TRIGGER_FILE" ]; then
    EXISTING_TASK=$(cat "$TRIGGER_FILE" | grep -o '"task_id"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
    EXISTING_STEP=$(cat "$TRIGGER_FILE" | grep -o '"current_step"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
    
    if [ "$EXISTING_TASK" = "$TASK_ID" ] && [ "$EXISTING_STEP" -ge "$MAX_CONTINUES" ]; then
        echo "❌ Error: Max auto-continues ($MAX_CONTINUES) reached for task $TASK_ID"
        echo "This prevents infinite loops. Delete trigger file to reset."
        exit 1
    fi
fi

# Escape prompt for JSON (handle quotes and newlines)
escape_json() {
    local str="$1"
    # Escape backslashes, quotes, and convert newlines
    str="${str//\\/\\\\}"
    str="${str//\"/\\\"}"
    str="${str//$'\n'/\\n}"
    str="${str//$'\r'/}"
    echo "$str"
}

ESCAPED_PROMPT=$(escape_json "$PROMPT")

# Create trigger file
cat > "$TRIGGER_FILE" << EOF
{
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "agent": "$AGENT",
  "task_id": "$TASK_ID",
  "current_step": $STEP,
  "total_steps": $TOTAL,
  "wait_seconds": $WAIT,
  "next_prompt": "$ESCAPED_PROMPT",
  "auto_continue": true,
  "timeout_minutes": 10
}
EOF

# Log the trigger
if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,agent,task_id,step,total_steps,status" > "$LOG_FILE"
fi
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),$AGENT,$TASK_ID,$STEP,$TOTAL,triggered" >> "$LOG_FILE"

echo ""
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ 🔄 AUTO-CONTINUE SCHEDULED                                   │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ Agent:     $AGENT"
echo "│ Task:      $TASK_ID"
echo "│ Step:      $STEP of $TOTAL"
echo "│ Wait:      ${WAIT}s"
echo "│ Trigger:   $TRIGGER_FILE"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ To cancel: ./scripts/auto-continue/cancel-continue.sh       │"
echo "│ To check:  ./scripts/auto-continue/check-continue.sh        │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

