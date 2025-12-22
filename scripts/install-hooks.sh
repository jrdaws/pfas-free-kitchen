#!/bin/bash
# Install git hooks for dawson-does-framework
#
# Usage: ./scripts/install-hooks.sh
#
# This script copies hook templates from scripts/hooks/ to .git/hooks/
# and makes them executable.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_SRC="$SCRIPT_DIR/hooks"
HOOKS_DST="$REPO_ROOT/.git/hooks"

echo "📦 Installing git hooks..."

# Ensure .git/hooks exists
mkdir -p "$HOOKS_DST"

# Copy each hook
for hook in "$HOOKS_SRC"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        echo "   Installing: $hook_name"
        cp "$hook" "$HOOKS_DST/$hook_name"
        chmod +x "$HOOKS_DST/$hook_name"
    fi
done

echo ""
echo "✅ Git hooks installed successfully!"
echo ""
echo "Installed hooks:"
ls -la "$HOOKS_DST" | grep -v "\.sample$" | tail -n +2

exit 0

