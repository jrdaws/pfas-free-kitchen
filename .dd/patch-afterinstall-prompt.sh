#!/usr/bin/env bash
set -euo pipefail

APPLY=0
if [ "${1:-}" = "--apply" ]; then APPLY=1; fi

cd "$(dirname "$0")/.."

FILE="bin/framework.js"
BACKUP="bin/framework.js.bak.$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found"
  exit 1
fi

cp "$FILE" "$BACKUP"
echo "Backup created: $BACKUP"

python3 - <<'PY'
import pathlib, re

p = pathlib.Path("bin/framework.js")
s = p.read_text()

helper = r'''
// Ask whether to run .dd/after-install.sh (and remember the user's choice)
async function askYesNo(question, defaultNo = True) {
  return await new Promise((resolve) => {
    const readline = require("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const suffix = defaultNo ? " [y/N] " : " [Y/n] ";
    rl.question(question + suffix, (answer) => {
      rl.close();
      const a = String(answer || "").trim().toLowerCase();
      if (!a) return resolve(!defaultNo);
      resolve(a === "y" || a === "yes");
    });
  });
}

async function maybeRunAfterInstall(OUT) {
  const fs = require("fs");
  const path = require("path");
  const { execSync } = require("child_process");

  const ddDir = path.join(OUT, ".dd");
  const hookPath = path.join(ddDir, "after-install.sh");
  const configPath = path.join(ddDir, "config.json");

  if (!fs.existsSync(hookPath)) return;

  // Read config (if it exists)
  let cfg = {};
  try {
    if (fs.existsSync(configPath)) {
      cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (_) {
    cfg = {};
  }

  // Skip asking if user said "don't ask again"
  if (cfg && cfg.afterInstall && cfg.afterInstall.dontAskAgain === true) return;

  console.log("");
  console.log("First-time setup:");
  const runNow = await askYesNo("[ ] Run first-time setup now? (installs packages)", true);
  const dontAskAgain = await askYesNo("[ ] Don’t show this question again for this app?", true);

  // Save preference
  try {
    cfg.afterInstall = cfg.afterInstall || {};
    cfg.afterInstall.dontAskAgain = dontAskAgain;
    fs.mkdirSync(ddDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\\n");
  } catch (_) {}

  if (!runNow) return;

  console.log("== running after-install hook ==");
  execSync(`bash "${hookPath}"`, { stdio: "inherit", cwd: OUT });
}
'''

# Fix the Python True/False issue in helper text (we want JS true/false)
helper = helper.replace("defaultNo = True", "defaultNo = true")

if "function maybeRunAfterInstall" not in s:
  # Insert helper after "use strict"; if present, else at top
  m = re.search(r'^[ \t]*"use strict";[ \t]*\r?\n', s, flags=re.M)
  if m:
    s = s[:m.end()] + helper + "\n" + s[m.end():]
  else:
    s = helper + "\n" + s

# Insert call right after the line that prints "✅ Export complete!"
if "maybeRunAfterInstall(" not in s:
  lines = s.splitlines(True)

  # detect OUT variable name
  out_var = "OUT"
  text = "".join(lines)
  if re.search(r"\bconst\s+OUT\b|\blet\s+OUT\b|\bvar\s+OUT\b", text):
    out_var = "OUT"
  elif re.search(r"\bconst\s+outDir\b|\blet\s+outDir\b|\bvar\s+outDir\b", text):
    out_var = "outDir"

  idx = None
  for i, line in enumerate(lines):
    if "✅ Export complete!" in line:
      idx = i
      break
  if idx is None:
    raise SystemExit("ERROR: Could not find the line that prints '✅ Export complete!'")

  lines.insert(idx + 1, f"  await maybeRunAfterInstall({out_var});\n")
  s = "".join(lines)

p.write_text(s)
print("Patched bin/framework.js")
PY

echo ""
echo "----- DIFF -----"
git diff -- "$FILE" || true
echo "--------------"

echo ""
echo "Patch prepared. Review the diff above."
echo ""
if [ "$APPLY" -ne 1 ]; then
  echo "Dry-run mode: not committing, not pushing, not linking."
  echo "To apply: .dd/patch-afterinstall-prompt.sh --apply"
  exit 0
fi

git add "$FILE"
git commit -m "Export: prompt to run after-install with dont-ask-again" || true
git push

npm link
echo "Done."
