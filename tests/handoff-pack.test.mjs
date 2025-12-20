import test from "node:test";
import assert from "node:assert/strict";
import { buildChatIndex, extractContentByIndex } from "../tools/handoff-pack/lib/chat_index_write.mjs";
import { sha256String } from "../tools/handoff-pack/lib/hash.mjs";

test("handoff-pack: chat_index offsets slice exact content and sha matches", () => {
  const raw =
`# CHAT_RAW v1

<<<BEGIN_MESSAGE>>>
id: 000001
ts: null
role: user
tags: ["x"]
source: chat_input
<<<CONTENT>>>
hello
<<<END_MESSAGE>>>

<<<BEGIN_MESSAGE>>>
id: 000002
ts: null
role: assistant
tags: ["y"]
source: chat_input
<<<CONTENT>>>
world
<<<END_MESSAGE>>>
`;

  const idx = buildChatIndex(raw, "2025-01-01T00:00:00Z", "UTC");
  assert.equal(idx.message_count, 2);

  const m1 = idx.messages[0];
  const m2 = idx.messages[1];

  const c1 = extractContentByIndex(raw, m1);
  const c2 = extractContentByIndex(raw, m2);

  assert.equal(c1.trimEnd(), "hello");
  assert.equal(c2.trimEnd(), "world");

  assert.equal(m1.sha256, sha256String(c1));
  assert.equal(m2.sha256, sha256String(c2));
});
