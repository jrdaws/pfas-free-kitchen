export function renderChatRaw({ parsed, createdAtIso, timezone }) {
  const header =
`# CHAT_RAW v1
# Encoding: UTF-8
# Newlines: \\n only
# created_at: ${createdAtIso}
# timezone: ${timezone}
# NOTE: Content between markers must be verbatim.

`;

  if (parsed.mode === "canonical") {
    return header + parsed.blocks.map(b => b.blockText).join("\n") + "\n";
  }

  const m = parsed.messages[0];
  return header +
`<<<BEGIN_MESSAGE>>>
id: ${m.id}
ts: ${m.ts ?? "null"}
role: ${m.role}
tags: [${m.tags.map(t => JSON.stringify(t)).join(", ")}]
source: chat_input
<<<CONTENT>>>
${m.content}
<<<END_MESSAGE>>>
`;
}
