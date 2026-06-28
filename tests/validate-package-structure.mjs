import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = relative(repoRoot, full).split(sep).join("/");
    if (entry.isDirectory()) {
      if ([".git", "node_modules", "dist", "coverage", ".cache", ".tmp", "tmp", "__pycache__"].includes(entry.name)) continue;
      out.push(...walk(full));
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      out.push(rel);
    }
  }
  return out.sort();
}

for (const dir of ["extensions", "agents", "skills", "prompts", "themes", "registries", "examples", "tests", "packages"]) {
  assert.equal(existsSync(join(repoRoot, dir)), true, `missing required directory: ${dir}`);
}

for (const absent of ["docs", "plans", "specs", "inventory", "packages/ecc-universal"]) {
  assert.equal(existsSync(join(repoRoot, absent)), false, `private-only path must be absent: ${absent}`);
}

for (const file of [
  "package.json",
  "README.md",
  "MANIFEST.md",
  "LICENSE",
  "examples/settings.example.json",
  "examples/mcp.example.json",
  "examples/models.example.json",
  "tests/validate-public-sanitization.mjs",
  "tests/validate-package-structure.mjs",
  "tests/validate-agent-discovery.mjs",
  "tests/validate-portability.sh",
  "tests/validate-superpowers-governor.sh",
  "tests/validate-superpowers-skill-lab.sh",
  "registries/omp-agent-roles.md",
  "registries/validate-omp-agent-roster.mjs",
  "registries/agent-precedence.json",
  "registries/skill-precedence.json",
  "extensions/subagent/index.ts",
  "extensions/subagent/agents.ts",
  "extensions/subagent/model-inheritance.ts",
  "extensions/subagent/model-inheritance.test.ts",
  "extensions/subagent/routing-config.ts",
  "extensions/superpowers-bootstrap.ts",
  "extensions/superpowers-commands.ts",
  "extensions/superpowers-governor/index.ts",
  "extensions/superpowers-governor/README.md",
  "extensions/superpowers-governor/validation-classifier.test.mjs",
  "extensions/superpowers-skill-lab/index.ts",
  "extensions/ecc-omp-adapter.ts",
  "extensions/superpowers-skill-lab/README.md",
  "extensions/superpowers-skill-lab/skill-lab.test.mjs",
  "packages/omp-ast-grep/package.json",
  "packages/omp-ast-grep/README.md",
]) {
  const full = join(repoRoot, file);
  assert.equal(existsSync(full), true, `missing required file: ${file}`);
  assert.equal(statSync(full).isFile(), true, `required path is not a file: ${file}`);
}

const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
assert.equal(pkg.name, "jans-superpowers-paket");
assert.equal(pkg.private, undefined);
assert.equal(pkg.license, "MIT");
assert.equal(pkg.type, "module");
assert.ok(Array.isArray(pkg.keywords) && pkg.keywords.includes("omp-package"));
assert.deepEqual(pkg.omp.extensions, [
  "./extensions/superpowers-bootstrap.ts",
  "./extensions/subagent/index.ts",
  "./extensions/superpowers-governor/index.ts",
  "./extensions/superpowers-commands.ts",
  "./extensions/superpowers-skill-lab/index.ts",
  "./extensions/ecc-omp-adapter.ts",
]);
assert.deepEqual(pkg.omp.skills, ["./skills"]);
assert.deepEqual(pkg.omp.prompts, ["./prompts"]);
assert.deepEqual(pkg.omp.themes, ["./themes"]);

const allFiles = walk(repoRoot);
for (const rel of allFiles) {
  assert.equal(rel.includes("/validation-artifacts/"), false, `validation artifact packaged: ${rel}`);
  assert.equal(rel.includes("/__pycache__/"), false, `python cache packaged: ${rel}`);
  assert.equal(rel.endsWith(".pyc"), false, `pyc packaged: ${rel}`);
  assert.equal(rel.includes("/node_modules/"), false, `node_modules packaged: ${rel}`);
  assert.equal(/backup/i.test(rel), false, `backup artifact packaged: ${rel}`);
}

const skillEntrypoints = allFiles.filter((rel) => rel.startsWith("skills/") && rel.endsWith("/SKILL.md"));
assert.equal(skillEntrypoints.length, 33, "expected 33 packaged SKILL.md files");
for (const rel of skillEntrypoints) {
  const text = readFileSync(join(repoRoot, rel), "utf8");
  assert.ok(text.startsWith("---\n"), `missing frontmatter start: ${rel}`);
  assert.ok(text.includes("\nname:"), `missing name frontmatter: ${rel}`);
  assert.ok(text.includes("\ndescription:"), `missing description frontmatter: ${rel}`);
}

const agentFiles = readdirSync(join(repoRoot, "agents"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort();
assert.equal(agentFiles.length, 21, "expected 21 active packaged agents");

const promptFiles = readdirSync(join(repoRoot, "prompts"), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort();
assert.equal(promptFiles.length, 7, "expected 7 packaged prompts");

console.log(`PACKAGE_STRUCTURE_OK skills=${skillEntrypoints.length} agents=${agentFiles.length} prompts=${promptFiles.length}`);
