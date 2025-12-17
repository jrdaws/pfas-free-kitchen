#!/usr/bin/env bash
set -euo pipefail

node -c bin/framework.js
npm test
npm run caps:validate

npm pack --silent
PKG="$(ls -t ./*.tgz | head -1)"
tar -tf "$PKG" | grep -E 'package/\.dd/health\.sh' >/dev/null

echo "✅ dev checks passed"
