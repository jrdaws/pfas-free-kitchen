import { sha256String } from "./hash.mjs";

const CONTENT_MARKER = "<<<CONTENT>>>\n";
const END_MARKER = "\n<<<END_MESSAGE>>>";

export function buildChatIndex(chatRawText, createdAtIso, timezone) {
  const messages = [];
  let searchFrom = 0;
  let idCounter = 0;

  while (true) {
    const c = chatRawText.indexOf(CONTENT_MARKER, searchFrom);
    if (c < 0) break;

    const contentStartChar = c + CONTENT_MARKER.length;
    const end = chatRawText.indexOf(END_MARKER, contentStartChar);
    if (end < 0) break;

    const contentEndChar = end;
    const before = chatRawText.slice(0, contentStartChar);
    const content = chatRawText.slice(contentStartChar, contentEndChar);

    const byteStart = Buffer.byteLength(before, "utf8");
    const byteEnd = byteStart + Buffer.byteLength(content, "utf8");

    idCounter++;
    const id = String(idCounter).padStart(6, "0");

    messages.push({
      id,
      ts: null,
      role: "unknown",
      byte_start: byteStart,
      byte_end: byteEnd,
      sha256: sha256String(content),
      tags: [],
      has_code_block: content.includes("```"),
      has_terminal_output: /(\n|\r)([^\n]*[%$#] )/.test(content) || content.includes("zsh:"),
      mentions_files: [],
      mentions_commits: [],
      mentions_commands: [],
    });

    searchFrom = end + END_MARKER.length;
  }

  return {
    schema_version: "chat_index_v1",
    created_at: createdAtIso,
    timezone,
    message_count: messages.length,
    messages,
  };
}

export function extractContentByIndex(chatRawText, m) {
  const buf = Buffer.from(chatRawText, "utf8");
  return buf.slice(m.byte_start, m.byte_end).toString("utf8");
}
