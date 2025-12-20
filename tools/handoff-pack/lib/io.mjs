import fs from "node:fs";
import path from "node:path";

import { parseChatTranscript } from "./chat_parse.mjs";
import { renderChatRaw } from "./chat_raw_write.mjs";
import { buildChatIndex } from "./chat_index_write.mjs";
import { renderAllTemplates } from "./render_templates.mjs";
import { captureRepoAdditions, captureEnv } from "./repo_capture.mjs";
import { writeZipFromDir } from "./zip_write.mjs";

function isoNow() {
  return new Date().toISOString();
}

export async function buildPack({ chatPath, repoPath, platformExportPath, outZipPath }) {
  const createdAtIso = isoNow();
  const timezone = "America/Los_Angeles";

  const staging = path.resolve(path.dirname(outZipPath), "_staging_handoff_pack");
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });

  const chatDir = path.join(staging, "chat");
  const ctxDir = path.join(staging, "context");
  const artDir = path.join(staging, "artifacts");
  fs.mkdirSync(chatDir, { recursive: true });
  fs.mkdirSync(ctxDir, { recursive: true });
  fs.mkdirSync(artDir, { recursive: true });

  const rawInput = fs.readFileSync(chatPath, "utf8");
  const parsed = parseChatTranscript(rawInput);
  const chatRaw = renderChatRaw({ parsed, createdAtIso, timezone });
  fs.writeFileSync(path.join(chatDir, "0001_chat_raw.md"), chatRaw, "utf8");

  const chatIndex = buildChatIndex(chatRaw, createdAtIso, timezone);
  fs.writeFileSync(path.join(chatDir, "0002_chat_index.json"), JSON.stringify(chatIndex, null, 2) + "\n", "utf8");

  const tplDir = path.resolve("tools/handoff-pack/templates");
  renderAllTemplates({ tplDir, outContextDir: ctxDir, outArtifactsDir: artDir, createdAtIso });

  const repoOut = path.join(staging, "repo");
  fs.mkdirSync(repoOut, { recursive: true });
  const { commits, status } = await captureRepoAdditions({ repoPath, outDir: staging });
  await captureEnv({ repoPath, outDir: staging });

  fs.appendFileSync(path.join(artDir, "commits.md"), `\n## git log --oneline -n 200\n\n\`\`\`\n${commits}\n\`\`\`\n`, "utf8");
  fs.appendFileSync(path.join(artDir, "files_created.md"), `\n## git status --porcelain\n\n\`\`\`\n${status}\n\`\`\`\n`, "utf8");

  if (platformExportPath && fs.existsSync(platformExportPath)) {
    const peDir = path.join(staging, "platform_export");
    fs.mkdirSync(peDir, { recursive: true });
    fs.copyFileSync(platformExportPath, path.join(peDir, path.basename(platformExportPath)));
  }

  const readmeTpl = fs.readFileSync(path.join(tplDir, "README.md.tpl"), "utf8").replaceAll("{{created_at}}", createdAtIso);
  fs.writeFileSync(path.join(staging, "README.md"), readmeTpl, "utf8");

  writeZipFromDir(staging, outZipPath);
}
