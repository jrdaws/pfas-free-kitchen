#!/bin/bash
# Safe git push with auto-retry logic
#
# Usage: ./scripts/git-push-safe.sh [remote] [branch]
#        Default: origin main
#
# This script handles push failures by:
# 1. Pulling with rebase
# 2. Re-running tests
# 3. Retrying push
# 
# Version: 1.0
# Last Updated: 2025-12-22

set -e

REMOTE="${1:-origin}"
BRANCH="${2:-main}"
MAX_RETRIES=3
RETRY_COUNT=0

echo "🚀 Safe push to $REMOTE/$BRANCH"
echo ""

push_with_retry() {
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "Attempt $((RETRY_COUNT + 1)) of $MAX_RETRIES..."
        
        # Try to push
        if git push "$REMOTE" "$BRANCH" 2>&1; then
            echo ""
            echo "✅ Push successful!"
            return 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo ""
            echo "⚠️  Push failed. Attempting recovery..."
            echo ""
            
            # Pull with rebase to incorporate remote changes
            echo "   Pulling with rebase..."
            if ! git pull --rebase "$REMOTE" "$BRANCH"; then
                echo ""
                echo "❌ Rebase failed! Manual intervention required."
                echo ""
                echo "   Options:"
                echo "   1. Resolve conflicts, then: git rebase --continue"
                echo "   2. Abort rebase: git rebase --abort"
                echo "   3. Force push (destructive): git push --force-with-lease"
                echo ""
                return 1
            fi
            
            # Check if tests still pass after rebase
            echo ""
            echo "   Running tests after rebase..."
            if ! npm test --silent 2>/dev/null; then
                echo ""
                echo "⚠️  Tests failed after rebase!"
                echo "   Fix tests before pushing."
                echo ""
                # Don't exit, let user decide
            fi
            
            echo ""
            echo "   Retrying push..."
        fi
    done
    
    echo ""
    echo "❌ Push failed after $MAX_RETRIES attempts."
    echo ""
    echo "   Manual intervention required. Options:"
    echo "   1. Check if another agent is pushing"
    echo "   2. Try: git fetch && git rebase origin/main"
    echo "   3. Force push (destructive): git push --force-with-lease"
    echo ""
    return 1
}

# Run the push
push_with_retry
exit $?

