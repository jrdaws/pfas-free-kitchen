import fs from "node:fs";
import path from "node:path";

function readTpl(p) {
  return fs.readFileSync(p, "utf8");
}

export function renderAllTemplates({ tplDir, outContextDir, outArtifactsDir, createdAtIso }) {
  fs.mkdirSync(outContextDir, { recursive: true });
  fs.mkdirSync(outArtifactsDir, { recursive: true });

  const files = [
    ["context", "goals.md.tpl", "goals.md"],
    ["context", "constraints.md.tpl", "constraints.md"],
    ["context", "glossary.md.tpl", "glossary.md"],
    ["context", "DECISIONS.md.tpl", "DECISIONS.md"],
    ["context", "ANTI-GOALS.md.tpl", "ANTI-GOALS.md"],
    ["context", "INVARIANTS.md.tpl", "INVARIANTS.md"],
    ["context", "FAILURE_LOG.md.tpl", "FAILURE_LOG.md"],

    ["artifacts", "files_created.md.tpl", "files_created.md"],
    ["artifacts", "commits.md.tpl", "commits.md"],
    ["artifacts", "TIMELINE.md.tpl", "TIMELINE.md"],
    ["artifacts", "OPEN_QUESTIONS.md.tpl", "OPEN_QUESTIONS.md"],
    ["artifacts", "KNOWN_DEBT.md.tpl", "KNOWN_DEBT.md"],
  ];

  for (const [kind, tplName, outName] of files) {
    const tplPath = path.join(tplDir, tplName);
    const outPath = path.join(kind === "context" ? outContextDir : outArtifactsDir, outName);
    const content = readTpl(tplPath).replaceAll("{{created_at}}", createdAtIso);
    fs.writeFileSync(outPath, content, "utf8");
  }
}
