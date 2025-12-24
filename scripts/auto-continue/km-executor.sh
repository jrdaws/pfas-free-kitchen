#!/bin/bash
# Keyboard Maestro Executor Script
# This script is called by Keyboard Maestro when a trigger file is detected
# It reads the trigger, extracts values, and outputs them for KM to use
#
# Usage: ./scripts/auto-continue/km-executor.sh [action]
#   action: "read" - Output trigger values
#           "archive" - Move trigger to archive
#           "log-executed" - Log that execution completed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUTOMATION_DIR="$PROJECT_ROOT/output/automation"
TRIGGER_FILE="$AUTOMATION_DIR/continue-trigger.json"
ARCHIVE_DIR="$AUTOMATION_DIR/archive"
LOG_FILE="$AUTOMATION_DIR/continue-log.csv"

ACTION="${1:-read}"

case "$ACTION" in
    "read")
        if [ ! -f "$TRIGGER_FILE" ]; then
            echo "ERROR:No trigger file found"
            exit 1
        fi
        
        # Extract values using grep (more portable than jq)
        WAIT=$(cat "$TRIGGER_FILE" | grep -o '"wait_seconds"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
        AGENT=$(cat "$TRIGGER_FILE" | grep -o '"agent"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        STEP=$(cat "$TRIGGER_FILE" | grep -o '"current_step"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
        TOTAL=$(cat "$TRIGGER_FILE" | grep -o '"total_steps"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
        
        # Extract prompt (handles multi-line)
        if command -v jq &> /dev/null; then
            PROMPT=$(cat "$TRIGGER_FILE" | jq -r '.next_prompt')
        else
            # Fallback: extract between quotes after next_prompt
            PROMPT=$(cat "$TRIGGER_FILE" | grep -o '"next_prompt"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*: *"//' | sed 's/"$//')
        fi
        
        # Output in format KM can parse: WAIT|AGENT|STEP|TOTAL
        # Prompt is output separately for KM to set as variable
        echo "WAIT=$WAIT"
        echo "AGENT=$AGENT"
        echo "STEP=$STEP"
        echo "TOTAL=$TOTAL"
        echo "PROMPT_START"
        echo "$PROMPT"
        echo "PROMPT_END"
        ;;
        
    "archive")
        if [ -f "$TRIGGER_FILE" ]; then
            mkdir -p "$ARCHIVE_DIR"
            ARCHIVE_NAME="$(date +%Y%m%d-%H%M%S).json"
            mv "$TRIGGER_FILE" "$ARCHIVE_DIR/$ARCHIVE_NAME"
            echo "Archived to: $ARCHIVE_DIR/$ARCHIVE_NAME"
        fi
        ;;
        
    "log-executed")
        if [ -f "$LOG_FILE" ]; then
            # Get the last triggered entry and mark as executed
            AGENT=$(cat "$TRIGGER_FILE" 2>/dev/null | grep -o '"agent"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4 || echo "UNKNOWN")
            TASK_ID=$(cat "$TRIGGER_FILE" 2>/dev/null | grep -o '"task_id"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4 || echo "unknown")
            STEP=$(cat "$TRIGGER_FILE" 2>/dev/null | grep -o '"current_step"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' || echo "0")
            TOTAL=$(cat "$TRIGGER_FILE" 2>/dev/null | grep -o '"total_steps"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' || echo "0")
            echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),$AGENT,$TASK_ID,$STEP,$TOTAL,executed" >> "$LOG_FILE"
            echo "Logged execution"
        fi
        ;;
        
    *)
        echo "Usage: $0 [read|archive|log-executed]"
        exit 1
        ;;
esac

