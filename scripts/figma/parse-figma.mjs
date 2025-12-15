#!/usr/bin/env node
import "dotenv/config";

const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;

if (!token || !fileKey) {
  console.error("Missing FIGMA_TOKEN or FIGMA_FILE_KEY in env.");
  process.exit(1);
}

const api = (path) => `https://api.figma.com/v1/${path}`;

async function getJSON(url) {
  const res = await fetch(url, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error ${res.status}: ${text}`);
  }
  return res.json();
}

// Walk the document and pull "sections" + frames
function collectSections(node, out = []) {
  if (!node) return out;
  const type = node.type;
  const name = node.name;

  if (type === "SECTION") {
    out.push({ name, id: node.id, type });
  }

  if (node.children) {
    for (const child of node.children) collectSections(child, out);
  }
  return out;
}

function collectTopFrames(node, out = []) {
  if (!node) return out;
  const type = node.type;
  const name = node.name;

  if (type === "FRAME") {
    out.push({ name, id: node.id, type });
  }

  if (node.children) {
    for (const child of node.children) collectTopFrames(child, out);
  }
  return out;
}

const main = async () => {
  const file = await getJSON(api(`files/${fileKey}`));
  const doc = file?.document;

  const sections = collectSections(doc, []);
  const frames = collectTopFrames(doc, []).slice(0, 50);

  const output = {
    fileKey,
    name: file?.name,
    sections,
    frames,
    generatedAt: new Date().toISOString(),
  };

  console.log(JSON.stringify(output, null, 2));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
