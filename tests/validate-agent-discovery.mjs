import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tempRoot = mkdtempSync(join(tmpdir(), "jans-superpowers-subagent-"));
const testModulePath = join(tempRoot, "agents-under-test.ts");
const modelInheritanceModulePath = join(tempRoot, "model-inheritance-under-test.ts");
const routingConfigModulePath = join(tempRoot, "routing-config-under-test.ts");
const harnessPath = join(tempRoot, "agent-discovery-harness.ts");
const repoPackageAgentsDir = new URL("../agents", import.meta.url).pathname;

try {
  const sourcePath = new URL("../extensions/subagent/agents.ts", import.meta.url);
  const source = readFileSync(sourcePath, "utf8").replace(
    /import \{ getAgentDir, parseFrontmatter \} from "@(mariozechner|earendil-works)\/pi-coding-agent";/,
    `function getAgentDir() { return process.env.PI_CODING_AGENT_DIR!; }\nfunction parseFrontmatter(content: string) {\n  const lines = content.split(/\\r?\\n/);\n  if (lines[0] !== "---") return { frontmatter: {}, body: content };\n  const end = lines.indexOf("---", 1);\n  const frontmatter: Record<string, string> = {};\n  for (let i = 1; i < end; i += 1) {\n    const match = /^([^:]+):\\s*(.*)$/.exec(lines[i]);\n    if (match) frontmatter[match[1].trim()] = match[2].trim();\n  }\n  return { frontmatter, body: lines.slice(end + 1).join("\\n") };\n}`,
  );
  writeFileSync(testModulePath, source, "utf8");
  writeFileSync(
    modelInheritanceModulePath,
    readFileSync(new URL("../extensions/subagent/model-inheritance.ts", import.meta.url), "utf8").replace(
      './routing-config.js',
      routingConfigModulePath,
    ),
    "utf8",
  );
  writeFileSync(
    routingConfigModulePath,
    readFileSync(new URL("../extensions/subagent/routing-config.ts", import.meta.url), "utf8"),
    "utf8",
  );

  const harness = `
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { discoverAgents } from ${JSON.stringify(testModulePath)};
import { resolveAgentModelSpec } from ${JSON.stringify(modelInheritanceModulePath)};
import { findMatchingRoute } from ${JSON.stringify(routingConfigModulePath)};

const tempRoot = ${JSON.stringify(tempRoot)};
const repoPackageAgentsDir = ${JSON.stringify(repoPackageAgentsDir)};
const userAgentDir = join(tempRoot, "user", "agents");
const packageAgentDir = join(tempRoot, "package", "agents");
const projectRoot = join(tempRoot, "project", "nested");
const projectAgentDir = join(tempRoot, "project", ".omp", "agents");
process.env.PI_CODING_AGENT_DIR = join(tempRoot, "user");

function writeAgent(dir: string, name: string, sourceLabel: string, extraFrontmatter = "") {
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, name + ".md"),
    "---\\n" +
      "name: " + name + "\\n" +
      "description: " + sourceLabel + " test agent for deterministic package discovery\\n" +
      "model: inherit\\n" +
      extraFrontmatter +
      "---\\n\\n" +
      "Body from " + sourceLabel + ".\\n",
    "utf8",
  );
}

writeAgent(packageAgentDir, "shared", "package");
writeAgent(packageAgentDir, "package-only", "package");
writeAgent(packageAgentDir, "invalid-skills", "package", "skills: security-review\\n");
writeAgent(packageAgentDir, "invalid-tools-array", "package", "tools: [read]\\n");
writeAgent(packageAgentDir, "invalid-model-array", "package", "model: [inherit]\\n");
writeAgent(userAgentDir, "shared", "user");
writeAgent(userAgentDir, "user-only", "user");
writeAgent(projectAgentDir, "shared", "project");
writeAgent(projectAgentDir, "project-only", "project");
mkdirSync(projectRoot, { recursive: true });

test.after(() => rmSync(tempRoot, { recursive: true, force: true }));

test("user scope prefers user over package", () => {
  const result = discoverAgents(projectRoot, "user", { packageAgentsDir: packageAgentDir });
  const byName = new Map(result.agents.map((agent) => [agent.name, agent]));
  assert.equal(byName.get("package-only")?.source, "package");
  assert.equal(byName.get("user-only")?.source, "user");
  assert.equal(byName.get("shared")?.source, "user");
  assert.equal(byName.has("project-only"), false);
  assert.equal(byName.has("invalid-skills"), false);
  assert.equal(byName.has("invalid-tools-array"), false);
  assert.equal(byName.has("invalid-model-array"), false);
});

test("both scope prefers project over user over package", () => {
  const result = discoverAgents(projectRoot, "both", { packageAgentsDir: packageAgentDir });
  const byName = new Map(result.agents.map((agent) => [agent.name, agent]));
  assert.equal(byName.get("package-only")?.source, "package");
  assert.equal(byName.get("user-only")?.source, "user");
  assert.equal(byName.get("project-only")?.source, "project");
  assert.equal(byName.get("shared")?.source, "project");
  assert.equal(result.packageAgentsDir, packageAgentDir);
  assert.equal(result.projectAgentsDir, projectAgentDir);
});

test("project scope stays project-only", () => {
  const result = discoverAgents(projectRoot, "project", { packageAgentsDir: packageAgentDir });
  const names = new Set(result.agents.map((agent) => agent.name));
  assert.deepEqual([...names].sort(), ["project-only", "shared"].sort());
});

test("canonical repo agents directory is discoverable as package payload", () => {
  const result = discoverAgents(projectRoot, "user", { packageAgentsDir: repoPackageAgentsDir });
  const names = new Set(result.agents.map((agent) => agent.name));
  assert.equal(result.packageAgentsDir, repoPackageAgentsDir);
  assert.equal(names.has("scout"), true);
  assert.equal(names.has("planner"), true);
  assert.equal(names.has("worker"), true);
  assert.equal(result.agents.filter((agent) => agent.source === "package").length, 21);
});

test("routing and model inheritance stay compatible", () => {
  const matched = findMatchingRoute("researcher", [{ agentPattern: "*research*", model: "inherit" }]);
  assert.equal(matched?.model, "inherit");
  assert.equal(
    resolveAgentModelSpec("researcher", "inherit", [{ agentPattern: "*research*", model: "inherit" }], { provider: "openai", id: "gpt-5.4" }, "high"),
    "openai/gpt-5.4:high",
  );
  assert.equal(
    resolveAgentModelSpec("researcher", undefined, [{ agentPattern: "researcher", model: "llama-local/qwen3.6" }], { provider: "openai", id: "gpt-5.4" }, "high"),
    "llama-local/qwen3.6",
  );
});

console.log("VALIDATE_AGENT_DISCOVERY_OK");
`;
  writeFileSync(harnessPath, harness, "utf8");

  execFileSync(process.execPath, ["--experimental-strip-types", harnessPath], { stdio: "inherit" });
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
