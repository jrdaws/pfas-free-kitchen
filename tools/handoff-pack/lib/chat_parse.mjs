import { sha256String } from "./hash.mjs";

const BEGIN = "<<<BEGIN_MESSAGE>>>";
const END = "<<<END_MESSAGE>>>";

export function parseChatTranscript(rawText) {
  if (rawText.includes(BEGIN) && rawText.includes(END)) {
    const blocks = [];
    let idx = 0;
    while (true) {
      const b = rawText.indexOf(BEGIN, idx);
      if (b < 0) break;
      const e = rawText.indexOf(END, b);
      if (e < 0) break;
      const blockText = rawText.slice(b, e + END.length);
      blocks.push({ kind: "canonical_block", blockText });
      idx = e + END.length;
    }
    return { mode: "canonical", blocks };
  }

  return {
    mode: "wrapped_single",
    messages: [{
      id: "000001",
      ts: null,
      role: "user",
      tags: ["unparsed_transcript"],
      content: rawText,
      sha256: sha256String(rawText),
    }],
  };
}
