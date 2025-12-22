import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { listTemplateFiles, sha256File } from "../../src/dd/manifest.mjs";

test("manifest: listTemplateFiles skips .dd and node_modules and is stable", () => {
  const root = path.resolve("tests/fixtures/template-mini");

  const files = listTemplateFiles(root).map((p) =>
    path.relative(root, p).replaceAll("\\\\", "/")
  );

  // Only these should be included
  assert.deepEqual(files, ["a.txt", "b.txt"]);

  // Hashes should be stable and deterministic
  const aHash = sha256File(path.join(root, "a.txt"));
  const bHash = sha256File(path.join(root, "b.txt"));

  assert.equal(aHash.length, 64);
  assert.equal(bHash.length, 64);
  assert.notEqual(aHash, bHash);
});
