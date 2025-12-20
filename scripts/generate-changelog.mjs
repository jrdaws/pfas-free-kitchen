#!/usr/bin/env node
/**
 * Generate changelog entries from conventional commits
 *
 * Usage:
 *   node scripts/generate-changelog.mjs [from-ref] [to-ref]
 *   node scripts/generate-changelog.mjs [count]
 *
 * Examples:
 *   node scripts/generate-changelog.mjs v0.1.0 HEAD
 *   node scripts/generate-changelog.mjs 10  # Last 10 commits
 */

import { execSync } from "node:child_process";

const [arg1, arg2] = process.argv.slice(2);

try {
  let logCommand;

  // If arg1 is a number, show last N commits
  if (arg1 && !isNaN(arg1) && !arg2) {
    logCommand = `git log -n ${arg1} --pretty=format:"%s|||%b|||%H"`;
  } else {
    // Otherwise use ref range (or default to last 10)
    const fromRef = arg1 || "";
    const toRef = arg2 || "HEAD";
    const range = fromRef ? `${fromRef}..${toRef}` : `-n 10`;
    logCommand = `git log ${range} --pretty=format:"%s|||%b|||%H"`;
  }

  const log = execSync(logCommand, { encoding: "utf8" });
  if (!log) {
    console.log("No commits found.");
    process.exit(0);
  }

  const trimmedLog = log.trim();

  if (!trimmedLog) {
    console.log("No commits found in range.");
    process.exit(0);
  }

  const commits = trimmedLog.split("\n").map((line) => {
    const [subject, body, hash] = line.split("|||");
    return {
      subject: subject ? subject.trim() : "",
      body: body ? body.trim() : "",
      hash: hash ? hash.trim() : ""
    };
  });

  // Parse conventional commits
  const changes = {
    breaking: [],
    added: [],
    changed: [],
    deprecated: [],
    removed: [],
    fixed: [],
    security: [],
  };

  const conventionalPattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(([^)]+)\))?(!)?:\s*(.+)$/;

  for (const commit of commits) {
    const match = commit.subject.match(conventionalPattern);
    if (!match) continue;

    const [, type, , scope, breaking, description] = match;
    const entry = scope ? `**${scope}**: ${description}` : description;

    // Check for breaking changes
    if (breaking || commit.body.includes("BREAKING CHANGE")) {
      changes.breaking.push(entry);
      continue;
    }

    // Categorize by type
    switch (type) {
      case "feat":
        changes.added.push(entry);
        break;
      case "fix":
        changes.fixed.push(entry);
        break;
      case "perf":
        changes.changed.push(`Improved ${entry}`);
        break;
      case "revert":
        changes.removed.push(entry);
        break;
      case "refactor":
        changes.changed.push(entry);
        break;
    }
  }

  // Output changelog section
  console.log(`## [Unreleased] - ${new Date().toISOString().split("T")[0]}\n`);

  if (changes.breaking.length > 0) {
    console.log("### BREAKING CHANGES\n");
    changes.breaking.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  if (changes.added.length > 0) {
    console.log("### Added\n");
    changes.added.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  if (changes.changed.length > 0) {
    console.log("### Changed\n");
    changes.changed.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  if (changes.deprecated.length > 0) {
    console.log("### Deprecated\n");
    changes.deprecated.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  if (changes.removed.length > 0) {
    console.log("### Removed\n");
    changes.removed.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  if (changes.fixed.length > 0) {
    console.log("### Fixed\n");
    changes.fixed.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  if (changes.security.length > 0) {
    console.log("### Security\n");
    changes.security.forEach((item) => console.log(`- ${item}`));
    console.log();
  }

  // Show commit count
  console.log(`_${commits.length} commit(s) processed_`);
} catch (error) {
  console.error("Error generating changelog:", error.message);
  process.exit(1);
}
