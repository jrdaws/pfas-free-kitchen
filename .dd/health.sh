#!/usr/bin/env bash
set -euo pipefail

echo "== repo =="
pwd

echo
echo "== git =="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git status --porcelain=v1 -b || true
else
  echo "(not a git repo)"
fi

echo
echo "== node/npm =="
node -v
npm -v

has_script() {
  local name="$1"
  node - <<'NODE' "$name"
import fs from "node:fs";
const name = process.argv[2];
if (!fs.existsSync("package.json")) process.exit(1);
const pkg = JSON.parse(fs.readFileSync("package.json","utf8"));
process.exit(pkg?.scripts?.[name] ? 0 : 1);
NODE
}

echo
echo "== install =="
if [ -f package.json ]; then
  if [ -d node_modules ]; then
    echo "deps ok"
  else
    echo "deps missing (run: npm install)"
  fi
else
  echo "no package.json"
fi

echo
echo "== checks =="

# Case A: framework repo (has CLI source)
if [ -f "bin/framework.js" ]; then
  echo "-- framework checks --"
  node -c bin/framework.js

  if has_script test; then
    npm test
  fi

  if has_script "caps:validate"; then
    npm run caps:validate
  fi

  # Optional: verify packed tarball includes health.sh when run from framework repo
  if has_script test; then
    npm pack --silent >/dev/null
    PKG="$(ls -t ./*.tgz | head -1)"
    tar -tf "$PKG" | grep -E 'package/\.dd/health\.sh' >/dev/null
    echo "tarball includes .dd/health.sh"
  fi

# Case B: exported app/template (no CLI source)
else
  echo "-- app checks --"

  if has_script lint; then
    npm run lint
  fi

  if has_script typecheck; then
    npm run typecheck
  fi

  if has_script build; then
    npm run build
  fi

  if has_script test; then
    npm test
  else
    echo "(no test script)"
  fi
fi

echo
echo "✅ health passed"
