#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:?pass app dir}"
HOOK="$APP_DIR/.dd/after-install.sh"

if [ -x "$HOOK" ]; then
  echo "== post-export hook =="
  (cd "$APP_DIR" && "$HOOK")
else
  echo "(no post-export hook found)"
fi
