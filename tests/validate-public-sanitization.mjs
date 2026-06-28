import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const forbidden = [
  { name: "private home path", pattern: /\/home\/jan(?:\/|\b)/ },
  { name: "private forgejo host", pattern: new RegExp("leyo" + "x101", "i") },
  { name: "private tailscale domain fragment", pattern: new RegExp("tailf" + "46ea8", "i") },
  { name: "private forgejo namespace", pattern: /jan\.admin/i },
  { name: "private source repo", pattern: /\/home\/jan\/gh\// },
  { name: "raw private key", pattern: /-----BEGIN (?:OPENSSH|RSA|EC|DSA)? ?PRIVATE KEY-----/ },
];

const skippedDirs = new Set([".git", "node_modules", "dist", "coverage", ".cache", ".tmp", "tmp", "__pycache__"]);
const skippedFiles = new Set(["package-lock.json"]);
const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skippedDirs.has(entry.name)) continue;
      walk(join(dir, entry.name));
      continue;
    }
    if (!entry.isFile() && !entry.isSymbolicLink()) continue;
    if (skippedFiles.has(entry.name)) continue;
    const full = join(dir, entry.name);
    const rel = relative(repoRoot, full).split(sep).join("/");
    let text;
    try {
      text = readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      for (const rule of forbidden) {
        assert.equal(rule.pattern.global, false, `${rule.name} pattern must not be global`);
        if (rule.pattern.test(lines[index])) {
          violations.push(`${rel}:${index + 1}:${rule.name}:${lines[index].slice(0, 220)}`);
        }
      }
    }
  }
}

walk(repoRoot);

assert.deepEqual(violations, [], `public sanitization violations:\n${violations.join("\n")}`);
console.log("PUBLIC_SANITIZATION_OK");
