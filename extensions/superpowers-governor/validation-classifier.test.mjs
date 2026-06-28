import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";

const tempAgentDir = mkdtempSync(join(tmpdir(), `superpowers-governor-agent-${process.pid}-`));
process.env.PI_CODING_AGENT_DIR = tempAgentDir;

const sourcePath = new URL("./index.ts", import.meta.url);
const source = readFileSync(sourcePath, "utf8").replace(
  'import { getAgentDir, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";',
  'type ExtensionAPI = any; type ExtensionContext = any; function getAgentDir() { return process.env.PI_CODING_AGENT_DIR; }',
);
const testModulePath = join(tmpdir(), `superpowers-governor-index-${process.pid}.ts`);
writeFileSync(testModulePath, `${source}\nexport { applyDecision, classifyBash, classifyToolCall, containsCompletionClaim, getGovernorRuntimePathsForTests, recordAuthorizationFromInput, setGovernorLogPathForTests, validationKind, writeGovernorLog };\n`);

const { applyDecision, classifyBash, classifyToolCall, containsCompletionClaim, getGovernorRuntimePathsForTests, recordAuthorizationFromInput, setGovernorLogPathForTests, validationKind, writeGovernorLog } = await import(`file://${testModulePath}?t=${Date.now()}`);
const runtimePaths = getGovernorRuntimePathsForTests();
assert.equal(runtimePaths.agentDir, tempAgentDir);
assert.equal(runtimePaths.logPath, join(tempAgentDir, "logs", "superpowers-governor.jsonl"));
const testHomeDir = homedir();

const allowedValidationCommands = [
  "python -m pytest $HOME/.local/share/whisper-transcribe-raw/tests/test_cli_modes.py -q",
  "python3 -m pytest tests/test_cli_modes.py -q",
  "python -m unittest tests.test_cli_modes",
  "uv run pytest tests -q",
  "pnpm check",
  "pnpm run check",
  "pnpm lint",
  "pnpm run lint",
  "pnpm typecheck",
  "pnpm run typecheck",
  "npm run check",
  "npm run lint",
  "npm run typecheck",
  "cargo check",
  "tsc --noEmit",
];

for (const command of allowedValidationCommands) {
  const decision = classifyBash(command, "/home/example-user");
  assert.equal(decision.action, "allow", `${command} should be allowed, got ${decision.action}: ${decision.reason}`);
  assert.notEqual(validationKind(command), undefined, `${command} should count as validation evidence`);
}

const benignUnclassifiedCommands = [
  "pnpm exec oxfmt",
  "curl -L -s https://raw.githubusercontent.com/KDE/kwin/master/README.md",
  "gh search issues 'amdgpu freeze vaapi brave linux' --repo brave/brave-browser --limit 20",
  "cd /home/example-user",
  "python - <<'PY'\nimport requests\nfrom bs4 import BeautifulSoup\nPY",
];

for (const command of benignUnclassifiedCommands) {
  const decision = classifyBash(command, "/home/example-user");
  assert.equal(decision.action, "allow", `${command} should not produce a governor warning`);
  assert.equal(validationKind(command), undefined, `${command} must not count as validation evidence`);
}

for (const toolName of ["chrome_devtools_take_snapshot", "mcp", "browser_search"]) {
  const decision = classifyToolCall(toolName, {}, "/home/example-user");
  assert.equal(decision?.action, "allow", `${toolName} should be observed without warning noise`);
}

const protectedExtensionPath = join(tempAgentDir, "extensions", "superpowers-governor", "validation-classifier.test.mjs");
const protectedEditWithoutAuthorization = classifyToolCall("edit", { path: protectedExtensionPath }, tempAgentDir);
assert.equal(protectedEditWithoutAuthorization?.action, "block", "governance-root edits without backup or authorization must stay blocked");
recordAuthorizationFromInput(`governor: authorize mutation without backup for ${join(tempAgentDir, "extensions")}`);
const protectedEditWithAuthorization = classifyToolCall("edit", { path: protectedExtensionPath }, tempAgentDir);
assert.equal(protectedEditWithAuthorization?.action, "allow", "authorized governance-root edits should not warn or require confirmation");

const unsafeValidationCommands = [
  "python -m pytest tests -q && rm -rf /tmp/omp-governor-test",
  "tsc --noEmit > out.txt",
  "pnpm check | tee log.txt",
  "pnpm run check:danger",
  "npm run lint:write",
  "pnpm run typecheck:custom",
  "pnpm test:danger",
  "npm run test:danger",
  "lint --fix",
  "build --write",
  "find . -delete",
  "find . \"-delete\"",
  "find . -exec rm -rf {} +",
  "find . -fprint /tmp/out",
  "git diff --output=patch.diff",
  "git diff \"--output=patch.diff\"",
  "eslint --fix src/index.ts",
  "eslint \"--fix\" src/index.ts",
  "ruff check --fix .",
  "pnpm lint -- --fix",
];

for (const command of unsafeValidationCommands) {
  assert.equal(validationKind(command), undefined, `${command} must not count as validation evidence`);
}

const destructiveDeletionCommands = [
  "rm -rf /tmp/omp-governor-test",
  "find . -delete",
  "find . \"-delete\"",
  "find . -exec rm -rf {} +",
];

const logPath = join(tmpdir(), `superpowers-governor-log-${process.pid}.jsonl`);
setGovernorLogPathForTests(logPath, 1024);
const mockCtx = {
  hasUI: true,
  cwd: tempAgentDir,
  ui: {
    confirm: async () => { throw new Error("log-only mode must not ask for confirmation"); },
    notify: () => { throw new Error("log-only mode must not notify warnings"); },
    setStatus: () => undefined,
    setWidget: () => undefined,
  },
};

for (const command of destructiveDeletionCommands) {
  const decision = classifyBash(command, "/home/example-user");
  assert.notEqual(decision.action, "allow", `${command} must still be classified as risky`);
  const applied = await applyDecision(decision, mockCtx);
  assert.equal(applied, undefined, `${command} must be logged only, not blocked`);
}

const secretWriteDecision = classifyToolCall("write", { path: join(tempAgentDir, ".ssh", "id_rsa") }, tempAgentDir);
assert.notEqual(secretWriteDecision?.action, "allow", "secret-like writes should still be classified as risky");
assert.equal(await applyDecision(secretWriteDecision, mockCtx), undefined, "secret-like write risk must be logged only, not blocked");
const logText = readFileSync(logPath, "utf8");
assert.match(logText, /Recursive removal detected|Find deletion detected/);
assert.match(logText, /secret-like path/i);

writeGovernorLog({ reason: "large", evidence: "x".repeat(3000) });
writeGovernorLog({ reason: "large2", evidence: "y".repeat(3000) });
assert.ok(readFileSync(logPath, "utf8").length <= 1024, "governor log must stay bounded by configured byte limit");

const privilegedBackupCommand = `set -euo pipefail
ts=$(date +%Y%m%d%H%M%S)
sudo -n cp /etc/systemd/system/surrealdb.service /etc/systemd/system/surrealdb.service.before-surreal-argv-secret-fix-$ts
cp ${testHomeDir}/.config/graphrag/surrealdb.env ${testHomeDir}/.config/graphrag/surrealdb.env.before-surreal-argv-secret-fix-$ts
chmod 600 ${testHomeDir}/.config/graphrag/surrealdb.env.before-surreal-argv-secret-fix-$ts
printf '%s\\n' "$ts"
ls -l /etc/systemd/system/surrealdb.service.before-surreal-argv-secret-fix-$ts ${testHomeDir}/.config/graphrag/surrealdb.env.before-surreal-argv-secret-fix-$ts`;
assert.equal(classifyBash(privilegedBackupCommand, testHomeDir).action, "allow", "timestamped privileged backup bundles should not require confirmation");

for (const command of [
  "sudo systemctl restart surrealdb.service",
  "sudo -n cp /etc/systemd/system/surrealdb.service /etc/systemd/system/surrealdb.service.new",
  "sudo -n cp /etc/sudoers /tmp/sudoers-copy",
]) {
  const decision = classifyBash(command, "/home/example-user");
  assert.notEqual(decision.action, "allow", `${command} must still be classified as risky`);
  assert.equal(await applyDecision(decision, mockCtx), undefined, `${command} must be logged only, not blocked`);
}

for (const command of ["ls test", "grep lint README.md", "touch build"]) {
  assert.equal(validationKind(command), undefined, `${command} must not count as validation evidence`);
}

for (const text of ["done", "fixed", "complete", "completed", "fertig", "behoben", "abgeschlossen", "umgesetzt"]) {
  assert.equal(containsCompletionClaim(text), false, `${text} must not trigger completion-evidence warnings`);
}

for (const text of ["tests pass", "all tests passed", "build passes", "verified", "validated"]) {
  assert.equal(containsCompletionClaim(text), true, `${text} should still trigger explicit verification-claim checks`);
}

console.log("validation classifier regression tests passed");
