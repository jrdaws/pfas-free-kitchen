#!/bin/bash
# Watch agent inboxes for new tasks and send macOS notifications
# Usage: ./scripts/watch-inboxes.sh
# Stop: Ctrl+C

OUTPUT_DIR="output"
WATCH_PATTERN="*/inbox/*.txt"

echo "👀 Watching agent inboxes for new tasks..."
echo "   Press Ctrl+C to stop"
echo ""

# Check if fswatch is installed
if ! command -v fswatch &> /dev/null; then
    echo "❌ fswatch not installed. Install with: brew install fswatch"
    exit 1
fi

# Watch for new files in inbox directories
fswatch -0 --event Created "$OUTPUT_DIR" 2>/dev/null | while IFS= read -r -d '' file; do
    # Only process inbox .txt files
    if [[ "$file" == *"/inbox/"* ]] && [[ "$file" == *.txt ]]; then
        # Extract agent name from path
        AGENT=$(echo "$file" | sed -n 's|.*/\([^/]*\)-agent/inbox/.*|\1|p')
        FILENAME=$(basename "$file")
        
        # Convert agent name to uppercase (bash 3.x compatible)
        AGENT_UPPER=$(echo "$AGENT" | tr '[:lower:]' '[:upper:]')

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📬 NEW TASK DETECTED"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Agent: $AGENT_UPPER"
        echo "File:  $FILENAME"
        echo ""
        echo "Launch command:"
        echo "Read and execute the task in $file"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # Send macOS notification
        osascript -e "display notification \"New task for $AGENT_UPPER Agent\" with title \"Dawson-Does Framework\" sound name \"Glass\""
    fi
done

