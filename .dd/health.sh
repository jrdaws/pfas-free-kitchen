#!/usr/bin/env bash
set -euo pipefail

echo "== repo =="
pwd
echo

echo "== git =="
git status -sb
echo

echo "== node/npm =="
node -v
npm -v
echo

echo "== install =="
npm ci >/dev/null 2>&1 || npm i >/dev/null 2>&1
echo "deps ok"
echo

echo "== syntax checks =="
node -c bin/framework.js
node -c scripts/orchestrator/framework-map.mjs
echo "syntax ok"
echo

echo "== map regen =="
npm run -s framework:map
test -f FRAMEWORK_MAP.md && echo "map ok: FRAMEWORK_MAP.md" || (echo "map missing" && exit 1)
echo

echo "== capabilities sanity =="
test -f scripts/orchestrator/capabilities.json && node -e "const j=require('./scripts/orchestrator/capabilities.json'); console.log('caps:', (j.caps||[]).length)"
echo

echo "== package scripts =="
node -e "const p=require('./package.json'); console.log(Object.keys(p.scripts||{}).sort().join('\n'))" | sed -n '1,40p'
echo

echo "== done =="
