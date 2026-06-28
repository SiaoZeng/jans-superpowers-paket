#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const agentsDir = path.resolve(process.argv[2] ?? path.join(packageRoot, "agents"));
const archiveDir = path.join(agentsDir, "archive");

const expectedAgents = [
  "architect",
  "code-reviewer",
  "debugger",
  "dependency-auditor",
  "devops-sre",
  "docs-writer",
  "graphrag-researcher",
  "graphrag-runtime-engineer",
  "performance-reviewer",
  "omp-extension-engineer",
  "plan-reviewer",
  "planner",
  "refactor-cleaner",
  "researcher",
  "reviewer",
  "scout",
  "security-reviewer",
  "spec-writer",
  "test-runner",
  "test-writer",
  "worker",
].sort();

const defaultDuplicateFiles = [
  "code-reviewer-default.md",
  "reviewer-default.md",
  "worker-default.md",
].sort();

const readOnlyTools = new Map([
  ["architect", "read, grep, find, ls, bash"],
  ["code-reviewer", "read, grep, find, ls, bash"],
  ["debugger", "read, grep, find, ls, bash"],
  ["dependency-auditor", "read, grep, find, ls, bash"],
  ["devops-sre", "read, grep, find, ls, bash"],
  ["graphrag-researcher", "read, grep, find, ls, bash"],
  ["performance-reviewer", "read, grep, find, ls, bash"],
  ["plan-reviewer", "read, grep, find, ls, bash"],
  ["planner", "read, grep, find, ls"],
  ["researcher", "read, grep, find, ls, bash"],
  ["reviewer", "read, grep, find, ls, bash"],
  ["scout", "read, grep, find, ls, bash"],
  ["security-reviewer", "read, grep, find, ls, bash"],
  ["test-runner", "read, grep, find, ls, bash"],
  ["test-writer", "read, grep, find, ls, bash"],
]);

const writeCapableAgents = new Set([
  "docs-writer",
  "graphrag-runtime-engineer",
  "omp-extension-engineer",
  "refactor-cleaner",
  "spec-writer",
  "worker",
]);

const allowedFrontmatterKeys = new Set(["name", "description", "tools", "model"]);
const requiredHeadings = [
  "## Mission",
  "## Scope",
  "## Forbidden Actions",
  "## Required Context",
  "## Protocol",
  "## Output Format",
  "## Failure Behavior",
  "## Handoff",
];

function parseFrontmatter(filePath, content) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") {
    throw new Error("missing leading frontmatter delimiter '---'");
  }

  const end = lines.indexOf("---", 1);
  if (end === -1) {
    throw new Error("missing closing frontmatter delimiter '---'");
  }

  const frontmatter = new Map();
  for (let i = 1; i < end; i += 1) {
    const line = lines[i];
    if (line.trim() === "") continue;
    if (/^\s/.test(line) || line.trim().startsWith("-") || line.includes(": [") || line.includes(": {")) {
      throw new Error(`unsupported non-scalar frontmatter syntax on line ${i + 1}`);
    }
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) {
      throw new Error(`invalid frontmatter line ${i + 1}: ${line}`);
    }
    const [, key, value] = match;
    if (frontmatter.has(key)) {
      throw new Error(`duplicate frontmatter key '${key}'`);
    }
    frontmatter.set(key, value.trim().replace(/^['"]|['"]$/g, ""));
  }

  return {
    frontmatter,
    body: lines.slice(end + 1).join("\n"),
  };
}

function activeMarkdownFiles() {
  if (!fs.existsSync(agentsDir)) return [];
  return fs
    .readdirSync(agentsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort();
}

function findArchiveWithDefaults() {
  if (!fs.existsSync(archiveDir)) return null;
  const dirs = fs
    .readdirSync(archiveDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const dir of dirs) {
    const full = path.join(archiveDir, dir);
    const files = fs
      .readdirSync(full, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();
    if (defaultDuplicateFiles.every((file) => files.includes(file))) {
      return full;
    }
  }
  return null;
}

function markdownHeadingPattern(heading) {
  return new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m");
}

function sectionBody(body, heading, nextHeading) {
  const startPattern = markdownHeadingPattern(heading);
  const startMatch = startPattern.exec(body);
  if (!startMatch) return null;
  const start = startMatch.index + startMatch[0].length;
  const rest = body.slice(start);
  const nextPattern = markdownHeadingPattern(nextHeading);
  const nextMatch = nextPattern.exec(rest);
  return (nextMatch ? rest.slice(0, nextMatch.index) : rest).trim();
}

function validateRequiredSections(file, body, errors) {
  for (let index = 0; index < requiredHeadings.length; index += 1) {
    const heading = requiredHeadings[index];
    const nextHeading = requiredHeadings[index + 1] ?? null;
    if (!markdownHeadingPattern(heading).test(body)) {
      errors.push(`${file}: missing required Markdown heading '${heading}'`);
      continue;
    }
    const content = nextHeading ? sectionBody(body, heading, nextHeading) : sectionBody(body, heading, "## __END_SENTINEL__");
    if (!content || content.length < 30) {
      errors.push(`${file}: required section '${heading}' must contain explicit non-empty guidance`);
    }
  }

  const outputFormat = sectionBody(body, "## Output Format", "## Failure Behavior") ?? "";
  const stableLabelMatches = outputFormat.match(/^-\s+(?:`[^`]+`:|`[^`]+`:\s|\*\*[^*]+:\*\*|\*\*[^*]+\*\*:\s)/gm) ?? [];
  if (stableLabelMatches.length < 3) {
    errors.push(`${file}: '## Output Format' must define at least three stable bullet labels using backticks or bold labels`);
  }
}

function validate() {
  const errors = [];
  const files = activeMarkdownFiles();
  const names = [];
  const seenNames = new Map();

  for (const duplicate of defaultDuplicateFiles) {
    if (files.includes(duplicate)) {
      errors.push(`default duplicate remains active: ${duplicate}`);
    }
  }

  for (const file of files) {
    const filePath = path.join(agentsDir, file);
    const stem = file.replace(/\.md$/, "");
    let parsed;
    try {
      parsed = parseFrontmatter(filePath, fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
      continue;
    }

    const { frontmatter, body } = parsed;
    for (const key of frontmatter.keys()) {
      if (!allowedFrontmatterKeys.has(key)) {
        errors.push(`${file}: unsupported frontmatter key '${key}'`);
      }
    }

    const name = frontmatter.get("name");
    const description = frontmatter.get("description");
    const model = frontmatter.get("model");
    const tools = frontmatter.get("tools");

    if (!name) errors.push(`${file}: missing frontmatter name`);
    if (!description) errors.push(`${file}: missing frontmatter description`);
    if (description && description.length < 20) errors.push(`${file}: description is too short to guide delegation`);
    if (name) {
      names.push(name);
      const existing = seenNames.get(name);
      if (existing) errors.push(`${file}: duplicate name '${name}' also used by ${existing}`);
      seenNames.set(name, file);
      if (name !== stem) errors.push(`${file}: frontmatter name '${name}' does not match filename stem '${stem}'`);
    }
    if (model !== "inherit") errors.push(`${file}: model must be 'inherit'`);

    if (name && readOnlyTools.has(name)) {
      const expected = readOnlyTools.get(name);
      if (tools !== expected) errors.push(`${file}: read-only role must have tools '${expected}', got '${tools ?? "<omitted>"}'`);
    }
    if (name && writeCapableAgents.has(name) && tools !== undefined) {
      errors.push(`${file}: write-capable role must omit tools frontmatter in this roster, got '${tools}'`);
    }
    if (tools !== undefined) {
      if (tools.includes("[") || tools.includes("]") || tools.includes("{")) {
        errors.push(`${file}: tools must be a comma-separated scalar string`);
      }
      for (const tool of tools.split(",").map((value) => value.trim())) {
        if (!tool) errors.push(`${file}: tools contains an empty tool entry`);
      }
    }

    validateRequiredSections(file, body, errors);
    if (name && writeCapableAgents.has(name)) {
      const outputFormat = sectionBody(body, "## Output Format", "## Failure Behavior") ?? "";
      if (!/Rollback Notes/.test(outputFormat)) {
        errors.push(`${file}: write-capable role output format must include 'Rollback Notes'`);
      }
    }
  }

  const sortedNames = names.sort();
  for (const expected of expectedAgents) {
    if (!sortedNames.includes(expected)) errors.push(`missing active agent '${expected}'`);
  }
  for (const actual of sortedNames) {
    if (!expectedAgents.includes(actual)) errors.push(`unexpected active agent '${actual}'`);
  }

  const directDefaultsActive = defaultDuplicateFiles.some((file) => files.includes(file));
  if (!directDefaultsActive && fs.existsSync(archiveDir) && !findArchiveWithDefaults()) {
    errors.push("default duplicate agents are inactive but no archive directory contains all three default files");
  }

  return errors;
}

const errors = validate();
if (errors.length > 0) {
  console.error(`OMP agent roster validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`OMP agent roster validation passed: ${expectedAgents.length} active agents valid.`);
