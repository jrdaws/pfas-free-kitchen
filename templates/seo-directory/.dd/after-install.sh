#!/usr/bin/env bash
set -euo pipefail

npm install

# Commit lockfile if it exists and is new/modified (even if ignored)
if [ -f package-lock.json ]; then
  if ! git diff --quiet -- package-lock.json 2>/dev/null || ! git ls-files --error-unmatch package-lock.json >/dev/null 2>&1; then
    git add -f package-lock.json
    git commit -m "chore: add package-lock.json" || true
  fi
fi
