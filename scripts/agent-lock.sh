#!/bin/bash
# Agent lock file management
#
# Usage: 
#   ./scripts/agent-lock.sh acquire <role>  - Acquire lock for an agent role
#   ./scripts/agent-lock.sh release         - Release lock (runs validation first)
#   ./scripts/agent-lock.sh release --force - Release lock without validation
#   ./scripts/agent-lock.sh status          - Check lock status
#   ./scripts/agent-lock.sh force-release   - Force release (use with caution)
#
# Version: 2.0
# Last Updated: 2025-12-22

LOCK_FILE=".agent-lock"
LOCK_TIMEOUT_MINUTES=120  # 2 hours - locks older than this can be force-released

show_usage() {
    echo "Agent Lock Management"
    echo ""
    echo "Usage:"
    echo "  $0 acquire <role>   Acquire lock for agent role (e.g., CLI, Website)"
    echo "  $0 release          Release your lock"
    echo "  $0 status           Check current lock status"
    echo "  $0 force-release    Force release stale lock"
    echo ""
}

acquire_lock() {
    local ROLE="$1"
    
    if [ -z "$ROLE" ]; then
        echo "❌ Error: Role name required"
        echo "   Usage: $0 acquire <role>"
        exit 1
    fi
    
    # Check if lock exists
    if [ -f "$LOCK_FILE" ]; then
        local LOCK_AGENT=$(head -1 "$LOCK_FILE" 2>/dev/null || echo "unknown")
        local LOCK_TIME=$(sed -n '2p' "$LOCK_FILE" 2>/dev/null || echo "unknown")
        local LOCK_EPOCH=$(sed -n '3p' "$LOCK_FILE" 2>/dev/null || echo "0")
        local NOW_EPOCH=$(date +%s)
        local AGE_MINUTES=$(( (NOW_EPOCH - LOCK_EPOCH) / 60 ))
        
        echo ""
        echo "⚠️  Lock already exists!"
        echo "   Locked by: $LOCK_AGENT"
        echo "   Since: $LOCK_TIME ($AGE_MINUTES minutes ago)"
        echo ""
        
        if [ $AGE_MINUTES -gt $LOCK_TIMEOUT_MINUTES ]; then
            echo "   Lock is stale (> $LOCK_TIMEOUT_MINUTES min). Use 'force-release' to clear."
        else
            echo "   Wait for the other agent to finish, or use 'force-release' if stuck."
        fi
        echo ""
        exit 1
    fi
    
    # Create lock
    local TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')
    local EPOCH=$(date +%s)
    
    echo "$ROLE Agent" > "$LOCK_FILE"
    echo "$TIMESTAMP" >> "$LOCK_FILE"
    echo "$EPOCH" >> "$LOCK_FILE"
    echo "$USER@$(hostname)" >> "$LOCK_FILE"
    
    echo ""
    echo "🔒 Lock acquired!"
    echo "   Role: $ROLE Agent"
    echo "   Time: $TIMESTAMP"
    echo ""
    echo "   Remember to release when done: $0 release"
    echo ""
}

release_lock() {
    local SKIP_VALIDATION="${1:-false}"
    
    if [ ! -f "$LOCK_FILE" ]; then
        echo "ℹ️  No lock file exists."
        exit 0
    fi
    
    # Run validation before releasing (unless --force)
    if [ "$SKIP_VALIDATION" != "--force" ]; then
        echo ""
        echo "🔍 Running pre-release validation..."
        echo ""
        
        if [ -x "./scripts/validate-agent-work.sh" ]; then
            if ./scripts/validate-agent-work.sh; then
                echo ""
                echo "✅ Validation passed!"
            else
                echo ""
                echo "❌ Validation FAILED!"
                echo ""
                echo "   Your work may not meet governance standards."
                echo "   Options:"
                echo "   1. Fix issues and try again"
                echo "   2. Release anyway: $0 release --force"
                echo ""
                exit 1
            fi
        else
            echo "   ⚠️  Validation script not found, skipping..."
        fi
    fi
    
    rm -f "$LOCK_FILE"
    echo ""
    echo "🔓 Lock released!"
    echo ""
}

check_status() {
    if [ ! -f "$LOCK_FILE" ]; then
        echo ""
        echo "🟢 No active lock - workspace is available"
        echo ""
        exit 0
    fi
    
    local LOCK_AGENT=$(head -1 "$LOCK_FILE" 2>/dev/null || echo "unknown")
    local LOCK_TIME=$(sed -n '2p' "$LOCK_FILE" 2>/dev/null || echo "unknown")
    local LOCK_EPOCH=$(sed -n '3p' "$LOCK_FILE" 2>/dev/null || echo "0")
    local LOCK_HOST=$(sed -n '4p' "$LOCK_FILE" 2>/dev/null || echo "unknown")
    local NOW_EPOCH=$(date +%s)
    local AGE_MINUTES=$(( (NOW_EPOCH - LOCK_EPOCH) / 60 ))
    
    echo ""
    echo "🔴 Workspace is LOCKED"
    echo ""
    echo "   Agent: $LOCK_AGENT"
    echo "   Since: $LOCK_TIME"
    echo "   Age:   $AGE_MINUTES minutes"
    echo "   Host:  $LOCK_HOST"
    echo ""
    
    if [ $AGE_MINUTES -gt $LOCK_TIMEOUT_MINUTES ]; then
        echo "   ⚠️  Lock is STALE (> $LOCK_TIMEOUT_MINUTES min)"
        echo "   Consider: $0 force-release"
    fi
    echo ""
}

force_release() {
    if [ ! -f "$LOCK_FILE" ]; then
        echo "ℹ️  No lock file exists."
        exit 0
    fi
    
    local LOCK_AGENT=$(head -1 "$LOCK_FILE" 2>/dev/null || echo "unknown")
    
    echo ""
    echo "⚠️  Force releasing lock held by: $LOCK_AGENT"
    
    rm -f "$LOCK_FILE"
    
    echo "🔓 Lock force-released!"
    echo ""
    echo "   Note: If the other agent is still working, you may have conflicts."
    echo ""
}

# Main
case "${1:-}" in
    acquire)
        acquire_lock "$2"
        ;;
    release)
        release_lock "$2"  # Pass --force if provided
        ;;
    status)
        check_status
        ;;
    force-release)
        force_release
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

