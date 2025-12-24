#!/bin/bash
# Check pending auto-continuation status
# Usage: ./scripts/auto-continue/check-continue.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AUTOMATION_DIR="$PROJECT_ROOT/output/automation"
TRIGGER_FILE="$AUTOMATION_DIR/continue-trigger.json"
LOG_FILE="$AUTOMATION_DIR/continue-log.csv"

echo ""
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ 🔄 AUTO-CONTINUATION STATUS                                  │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

if [ -f "$TRIGGER_FILE" ]; then
    echo "📋 PENDING CONTINUATION:"
    echo ""
    
    if command -v jq &> /dev/null; then
        cat "$TRIGGER_FILE" | jq .
    else
        cat "$TRIGGER_FILE"
    fi
    
    echo ""
    echo "⏱️  Waiting for Keyboard Maestro to detect and execute..."
    echo ""
    echo "Commands:"
    echo "  Cancel: ./scripts/auto-continue/cancel-continue.sh"
    echo "  View:   cat $TRIGGER_FILE"
else
    echo "✅ No pending auto-continuation"
    echo ""
fi

# Show recent log entries
if [ -f "$LOG_FILE" ]; then
    echo "📊 RECENT LOG (last 5 entries):"
    echo ""
    tail -6 "$LOG_FILE" | head -1  # Header
    echo "---"
    tail -5 "$LOG_FILE"
    echo ""
fi

