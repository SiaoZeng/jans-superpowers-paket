import { getAgentDir, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// Phase 1 governor: safety gate, reload reminder, completion-claim warning, and compact status.

type GovernorMode = "log-only" | "observe" | "warn" | "strict" | "yolo-safe";
type DecisionAction = "allow" | "warn" | "confirm" | "block";
type ValidationKind = "test" | "build" | "typecheck" | "lint" | "generic";

interface GateDecision {
	action: DecisionAction;
	reason: string;
	evidence: string;
	nonOverridable: boolean;
	reversible: boolean;
	protectedRoot?: string;
}

interface ValidationEvidence {
	seq: number;
	kind: ValidationKind;
	command: string;
}

interface PromptState {
	startSeq: number;
	latestMutationSeq: number;
	latestValidationSeq: number;
	failedAfterValidation: boolean;
	validations: ValidationEvidence[];
	userText: string;
	validationHints: string[];
}

interface GovernorState {
	seq: number;
	startedAtMs: number;
	warnings: number;
	reloadPending: boolean;
	latestWarning: string;
	backupEvidenceRoots: Set<string>;
	userAuthorizedRoots: Set<string>;
	prompt: PromptState;
	lastCompletionWarningText: string;
}

const CONFIG = {
	safetyMode: "log-only" as GovernorMode,
	workflowMode: "warn" as GovernorMode,
	researchProvenanceMode: "observe" as GovernorMode,
	reloadReminderMode: "warn" as GovernorMode,
	warnUnclassifiedShell: false,
	warnObservedToolCalls: false,
	recordConfirmedActionsAsWarnings: false,
};

const AGENT_DIR = normalizePath(getAgentDir());
const GOVERNOR_LOG_DEFAULT_PATH = path.join(AGENT_DIR, "logs", "superpowers-governor.jsonl");
const GOVERNOR_LOG_DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const GOVERNOR_LOG_EVENT_MAX_CHARS = 16 * 1024;
const GOVERNOR_LOG_FIELD_MAX_CHARS = 8 * 1024;
let governorLogPath = GOVERNOR_LOG_DEFAULT_PATH;
let governorLogMaxBytes = GOVERNOR_LOG_DEFAULT_MAX_BYTES;

const ROOTS = {
	skills: path.join(AGENT_DIR, "skills"),
	extensions: path.join(AGENT_DIR, "extensions"),
	prompts: path.join(AGENT_DIR, "prompts"),
	themes: path.join(AGENT_DIR, "themes"),
};

const GOVERNANCE_ROOTS = [ROOTS.skills, ROOTS.extensions, ROOTS.prompts, ROOTS.themes].map(normalizePath);
const HOME_DIR = normalizePath(os.homedir());
const HOME_PARENT_DIR = normalizePath(path.dirname(HOME_DIR));
const DESTRUCTIVE_ROOTS = [
	"/",
	HOME_PARENT_DIR,
	HOME_DIR,
	"/etc",
	"/usr",
	"/var",
	"/opt",
	"/boot",
	"/root",
	AGENT_DIR,
].map(normalizePath);

const BACKUP_ROOT_BY_GOVERNANCE_ROOT = new Map<string, string>([
	[normalizePath(ROOTS.skills), path.join(AGENT_DIR, "skill-backups") + path.sep],
	[normalizePath(ROOTS.extensions), path.join(AGENT_DIR, "extension-backups") + path.sep],
	[normalizePath(ROOTS.prompts), path.join(AGENT_DIR, "resource-backups") + path.sep],
	[normalizePath(ROOTS.themes), path.join(AGENT_DIR, "resource-backups") + path.sep],
]);

let state = createInitialState();
let latestUserInputText = "";

function createInitialState(): GovernorState {
	return {
		seq: 0,
		startedAtMs: Date.now(),
		warnings: 0,
		reloadPending: false,
		latestWarning: "",
		backupEvidenceRoots: new Set<string>(),
		userAuthorizedRoots: new Set<string>(),
		prompt: createPromptState(0),
		lastCompletionWarningText: "",
	};
}

function createPromptState(currentSeq: number, userText = ""): PromptState {
	return {
		startSeq: currentSeq,
		latestMutationSeq: currentSeq,
		latestValidationSeq: currentSeq,
		failedAfterValidation: false,
		validations: [],
		userText,
		validationHints: extractValidationHints(userText),
	};
}

function resetState() {
	state = createInitialState();
}

function normalizePath(value: string): string {
	return path.resolve(value);
}

function stripAtPrefix(value: string): string {
	return value.startsWith("@") ? value.slice(1) : value;
}

function resolveToolPath(rawPath: string, cwd: string): string {
	const cleaned = stripAtPrefix(String(rawPath || "").trim());
	const base = cleaned.length > 0 ? cleaned : ".";
	return normalizePath(path.isAbsolute(base) ? base : path.resolve(cwd, base));
}

function isInsidePath(candidatePath: string, rootPath: string): boolean {
	const candidate = normalizePath(candidatePath);
	const root = normalizePath(rootPath);
	const relative = path.relative(root, candidate);
	return relative === "" || (relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative));
}

function governanceRootFor(candidatePath: string): string | undefined {
	const candidate = normalizePath(candidatePath);
	return GOVERNANCE_ROOTS.find((root) => isInsidePath(candidate, root));
}

function isSecretPath(candidatePath: string): boolean {
	const base = path.basename(candidatePath).toLowerCase();
	const full = candidatePath.toLowerCase();
	return (
		base === ".env" ||
		base.startsWith(".env.") ||
		base.includes("secret") ||
		base.includes("token") ||
		base.includes("credential") ||
		full.includes("/.config/gh/") ||
		full.includes("/.ssh/") ||
		full.includes("/.gnupg/")
	);
}

function decision(
	action: DecisionAction,
	reason: string,
	evidence: string,
	options: Partial<Pick<GateDecision, "nonOverridable" | "reversible" | "protectedRoot">> = {},
): GateDecision {
	return {
		action,
		reason,
		evidence,
		nonOverridable: options.nonOverridable ?? false,
		reversible: options.reversible ?? true,
		protectedRoot: options.protectedRoot,
	};
}

function shellTokens(command: string): string[] {
	const tokens: string[] = [];
	let current = "";
	let quote: string | null = null;
	let escaped = false;
	for (const ch of command) {
		if (escaped) {
			current += ch;
			escaped = false;
			continue;
		}
		if (ch === "\\") {
			escaped = true;
			continue;
		}
		if (quote) {
			if (ch === quote) quote = null;
			else current += ch;
			continue;
		}
		if (ch === "'" || ch === '"') {
			quote = ch;
			continue;
		}
		if (/\s/.test(ch)) {
			if (current.length > 0) {
				tokens.push(current);
				current = "";
			}
			continue;
		}
		current += ch;
	}
	if (current.length > 0) tokens.push(current);
	return tokens;
}

function containsRecursiveRm(command: string): boolean {
	const lower = command.toLowerCase();
	if (/\brm\s+--recursive\b/.test(lower)) return true;
	const tokens = shellTokens(lower);
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] !== "rm") continue;
		for (const token of tokens.slice(i + 1)) {
			if (!token.startsWith("-")) break;
			if (token === "--recursive") return true;
			if (/^-[a-z]*r[a-z]*$/.test(token)) return true;
		}
	}
	return /\brm\s+-[a-z]*r[a-z]*\b/.test(lower);
}

function extractRmTargets(command: string, cwd = "/"): string[] {
	const tokens = shellTokens(command);
	const targets: string[] = [];
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] !== "rm") continue;
		for (const token of tokens.slice(i + 1)) {
			if (token === "--") continue;
			if (token.startsWith("-")) continue;
			if (/^[;&|]$/.test(token)) break;
			targets.push(resolveToolPath(token, cwd));
		}
	}
	return targets;
}

function isDangerousRmTarget(target: string): boolean {
	const normalized = normalizePath(target);
	return DESTRUCTIVE_ROOTS.some((root) => {
		if (root === "/") return normalized === "/";
		return normalized === root || isInsidePath(normalized, root);
	});
}

function hasShellControlOrRedirection(command: string): boolean {
	return /(;|&&|\|\||\||>|<|`|\$\(|\n|\r)/.test(command);
}

function hasMutatingValidationFlag(lowerCommand: string): boolean {
	return shellTokens(lowerCommand).some((token) =>
		token === "-u" ||
		token === "--fix" ||
		token === "--write" ||
		token === "--apply" ||
		token === "--update" ||
		token === "--update-snapshot" ||
		token === "--updatesnapshot" ||
		token.startsWith("--fix=") ||
		token.startsWith("--write=") ||
		token.startsWith("--apply=") ||
		token.startsWith("--update="),
	);
}

function isSafeReadOnlyQueryCommand(command: string): boolean {
	const trimmed = command.trim();
	const tokens = shellTokens(trimmed);
	const [tool, subcommand] = tokens;
	if (!tool) return true;
	if (["ls", "pwd", "rg", "grep", "test"].includes(tool)) return true;
	if (tool === "find") {
		const mutatingFindPredicates = new Set(["-delete", "-exec", "-execdir", "-ok", "-okdir", "-fprint", "-fprintf", "-fls"]);
		return !tokens.some((token) => mutatingFindPredicates.has(token));
	}
	if (tool === "git" && (subcommand === "status" || subcommand === "diff")) {
		return !tokens.some((token) => token === "--output" || token.startsWith("--output="));
	}
	return false;
}

function containsFindDeletion(command: string): boolean {
	const tokens = shellTokens(command.toLowerCase());
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i] !== "find") continue;
		if (tokens.slice(i + 1).includes("-delete")) return true;
	}
	return false;
}

function validationCommandKind(command: string): ValidationKind | undefined {
	const trimmed = command.trim();
	const lower = trimmed.toLowerCase();
	const boundary = "(?:$|\\s)";
	if (!trimmed || hasShellControlOrRedirection(trimmed)) return undefined;
	if (hasMutatingValidationFlag(lower)) return undefined;

	if (new RegExp(`^(pytest|python\\d*(?:\\.\\d+)?\\s+-m\\s+(?:pytest|unittest)|uv\\s+run\\s+(?:pytest|python\\d*(?:\\.\\d+)?\\s+-m\\s+(?:pytest|unittest)))${boundary}`).test(lower)) return "test";
	if (new RegExp(`^(cargo\\s+test|npm\\s+(?:test|run\\s+test)|pnpm\\s+(?:test|run\\s+test)|bun\\s+(?:test|run\\s+test))${boundary}`).test(lower)) return "test";

	if (new RegExp(`^(tsc(?:\\s+--noemit)?|pnpm\\s+(?:exec\\s+)?tsc|npm\\s+exec\\s+tsc|bun\\s+x\\s+tsc)${boundary}`).test(lower)) return "typecheck";
	if (new RegExp(`^(cargo\\s+check|npm\\s+run\\s+typecheck|pnpm\\s+(?:run\\s+)?typecheck|bun\\s+(?:run\\s+)?typecheck)${boundary}`).test(lower)) return "typecheck";

	if (new RegExp(`^(npm\\s+run\\s+lint|pnpm\\s+(?:run\\s+)?lint|bun\\s+(?:run\\s+)?lint|ruff\\s+check|mypy|pyright|eslint)${boundary}`).test(lower)) return "lint";
	if (new RegExp(`^(npm\\s+run\\s+check|pnpm\\s+(?:run\\s+)?check|bun\\s+(?:run\\s+)?check)${boundary}`).test(lower)) return "generic";
	if (new RegExp(`^(npm\\s+run\\s+build|pnpm\\s+(?:run\\s+)?build|bun\\s+(?:run\\s+)?build|build)${boundary}`).test(lower)) return "build";

	return undefined;
}

function isReadOnlyCommand(command: string): boolean {
	const trimmed = command.trim();
	if (!trimmed) return true;
	if (hasShellControlOrRedirection(trimmed)) return false;
	if (validationCommandKind(trimmed)) return true;
	if (isSafeReadOnlyQueryCommand(trimmed)) return true;
	if (/(^|\s)(rm|sudo|su|doas|chmod|chown|pacman|yay|npm|pnpm|bun|pip|uv)\b/.test(trimmed)) return false;
	if (/(\brm\b|\bmv\b|\bcp\b|\btee\b|\bdd\b|\btruncate\b)/.test(trimmed)) return false;
	return false;
}

function containsPackageDestructive(command: string): boolean {
	return /\b(pacman|yay)\b.*(?:^|\s)(-R\w*|--remove|--noconfirm|remove|autoremove|clean|upgrade|sync|--sysupgrade|-Syu|-Syyu|-Syuu)\b/i.test(command) ||
		/\b(npm|pnpm|bun|pip|uv)\b.*\b(uninstall|remove|prune|clean|purge|upgrade)\b/i.test(command);
}

function containsProtectedRootReference(command: string, cwd = "/"): boolean {
	const protectedRoots = DESTRUCTIVE_ROOTS.filter((root) => root !== "/");
	for (const root of protectedRoots) {
		if (command.includes(`${root}/`) || command.includes(` ${root}`) || command.includes(`'${root}`) || command.includes(`"${root}`)) return true;
	}
	for (const token of shellTokens(command)) {
		if (token.startsWith("-") || token.includes("=")) continue;
		if (!token.startsWith("/") && !token.startsWith(".")) continue;
		const target = resolveToolPath(token, cwd);
		if (protectedRoots.some((root) => target === root || isInsidePath(target, root))) return true;
	}
	return false;
}

function isBackupPathToken(token: string): boolean {
	return token.includes(".before-") || token.includes("-before-") || token.includes(".backup-") || token.includes("-backup-");
}

function isAdjacentBackupCopy(source: string, destination: string): boolean {
	if (!path.isAbsolute(source) || !path.isAbsolute(destination)) return false;
	if (!isBackupPathToken(destination)) return false;
	if (path.dirname(source) !== path.dirname(destination)) return false;
	return path.basename(destination).startsWith(`${path.basename(source)}.`) || path.basename(destination).startsWith(`${path.basename(source)}-`);
}

function isPrivilegedBackupCpLine(line: string): boolean {
	const tokens = shellTokens(line);
	if (tokens.length !== 5 || tokens[0] !== "sudo" || tokens[1] !== "-n" || tokens[2] !== "cp") return false;
	const source = tokens[3];
	const destination = tokens[4];
	const allowedSource = source.startsWith("/etc/") || source.startsWith("/usr/lib/systemd/system/") || source.startsWith("/lib/systemd/system/");
	return allowedSource && isAdjacentBackupCopy(source, destination);
}

function isUserBackupCpLine(line: string): boolean {
	const tokens = shellTokens(line);
	if (tokens.length !== 3 || tokens[0] !== "cp") return false;
	const source = tokens[1];
	const destination = tokens[2];
	const homePrefix = HOME_DIR.endsWith(path.sep) ? HOME_DIR : `${HOME_DIR}${path.sep}`;
	return source.startsWith(homePrefix) && destination.startsWith(homePrefix) && isAdjacentBackupCopy(source, destination);
}

function isBackupChmodLine(line: string): boolean {
	const tokens = shellTokens(line);
	if (tokens.length !== 3 || tokens[0] !== "chmod") return false;
	return (tokens[1] === "600" || tokens[1] === "0600") && path.isAbsolute(tokens[2]) && isBackupPathToken(tokens[2]);
}

function isBackupListingLine(line: string): boolean {
	const tokens = shellTokens(line);
	if (tokens.length < 2 || tokens[0] !== "ls") return false;
	const targets = tokens.slice(1).filter((token) => !token.startsWith("-"));
	return targets.length > 0 && targets.every((target) => path.isAbsolute(target) && isBackupPathToken(target));
}

function isBackupMetaLine(line: string): boolean {
	return line === "set -euo pipefail" || /^[A-Za-z_][A-Za-z0-9_]*=\$\(date \+%Y%m%d(?:%H%M%S|-?%H%M%S)\)$/.test(line) || line.startsWith("printf ");
}

function isPrivilegedTimestampedBackupCommand(command: string): boolean {
	const lines = command.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0 || !lines.some(isPrivilegedBackupCpLine)) return false;
	for (const line of lines) {
		if (line !== "set -euo pipefail" && /[;&<>]|\|\||&&|`/.test(line)) return false;
		if (isBackupMetaLine(line) || isPrivilegedBackupCpLine(line) || isUserBackupCpLine(line) || isBackupChmodLine(line) || isBackupListingLine(line)) continue;
		return false;
	}
	return true;
}

function classifyBash(command: string, cwd = "/"): GateDecision {
	try {
		const trimmed = command.trim();
		if (isReadOnlyCommand(trimmed)) return decision("allow", "Read-only or validation command", trimmed || "empty command");

		if (containsRecursiveRm(trimmed)) {
			const targets = extractRmTargets(trimmed, cwd);
			const dangerous = targets.length === 0 || targets.some(isDangerousRmTarget);
			return decision("block", "Recursive removal detected", targets.join(", ") || trimmed, {
				nonOverridable: dangerous,
				reversible: false,
			});
		}

		if (containsFindDeletion(trimmed)) {
			return decision("block", "Find deletion detected", trimmed, {
				nonOverridable: false,
				reversible: false,
			});
		}

		if (isPrivilegedTimestampedBackupCommand(trimmed)) {
			return decision("allow", "Timestamped privileged backup command", trimmed, { reversible: true });
		}

		if (/\b(sudo|su|doas)\b/i.test(trimmed)) {
			const escalatedDestructive = containsPackageDestructive(trimmed) || /\b(systemctl|service)\b/i.test(trimmed) || containsProtectedRootReference(trimmed, cwd);
			return decision("confirm", "Privilege escalation detected", trimmed, {
				nonOverridable: escalatedDestructive,
				reversible: false,
			});
		}

		if (/\b(chmod|chown)\b/i.test(trimmed)) {
			const highRisk = /\bchmod\b.*\b777\b/i.test(trimmed) || /\s-R\b/.test(trimmed) || GOVERNANCE_ROOTS.some((root) => trimmed.includes(root)) || containsProtectedRootReference(trimmed, cwd);
			return decision("confirm", "Permission or ownership mutation detected", trimmed, {
				nonOverridable: highRisk,
				reversible: false,
			});
		}

		if (containsPackageDestructive(trimmed)) {
			return decision("confirm", "Package manager destructive operation detected", trimmed, {
				nonOverridable: /\bsudo\b/i.test(trimmed),
				reversible: false,
			});
		}

		if (CONFIG.warnUnclassifiedShell) return decision("warn", "Unclassified shell command", trimmed, { reversible: false });
		return decision("allow", "Unclassified shell command allowed by focused safety policy", trimmed, { reversible: false });
	} catch (error) {
		return decision("block", "Safety classifier failed for bash command", String(error), {
			nonOverridable: true,
			reversible: false,
		});
	}
}

function hasBackupEvidence(root: string): boolean {
	const normalized = normalizePath(root);
	return state.backupEvidenceRoots.has(normalized) || state.userAuthorizedRoots.has(normalized);
}

function classifyWriteLike(toolName: string, rawPath: string, cwd: string): GateDecision {
	try {
		const target = resolveToolPath(rawPath, cwd);
		if (isSecretPath(target)) {
			return decision("block", `${toolName} to secret-like path blocked`, target, {
				nonOverridable: true,
				reversible: false,
			});
		}
		if (target.split(path.sep).includes(".git")) {
			return decision("block", `${toolName} under .git blocked`, target, {
				nonOverridable: true,
				reversible: false,
			});
		}

		const root = governanceRootFor(target);
		if (!root) return decision("allow", `${toolName} outside protected roots`, target);

		if (root === normalizePath(ROOTS.skills) || root === normalizePath(ROOTS.extensions)) {
			if (hasBackupEvidence(root)) {
				return decision("allow", `${toolName} under governance root with backup or explicit authorization`, target, {
					protectedRoot: root,
					reversible: true,
				});
			}
			return decision("block", `${toolName} under governance root without backup or explicit authorization`, target, {
				protectedRoot: root,
				reversible: false,
			});
		}

		if (root === normalizePath(ROOTS.prompts) || root === normalizePath(ROOTS.themes)) {
			const hasEvidence = hasBackupEvidence(root);
			return decision(hasEvidence ? "allow" : "confirm", `${toolName} under prompt/theme governance root`, target, {
				protectedRoot: root,
				reversible: hasEvidence,
			});
		}

		return decision("allow", `${toolName} path allowed`, target);
	} catch (error) {
		return decision("block", `Safety classifier failed for ${toolName}`, String(error), {
			nonOverridable: true,
			reversible: false,
		});
	}
}

function classifyToolCall(toolName: string, input: Record<string, unknown>, cwd: string): GateDecision | undefined {
	if (toolName === "bash") return classifyBash(String(input.command ?? ""), cwd);
	if (toolName === "write" || toolName === "edit") return classifyWriteLike(toolName, String(input.path ?? ""), cwd);
	if (toolName.startsWith("mcp") || toolName.startsWith("chrome_devtools") || toolName.includes("browser")) {
		if (CONFIG.warnObservedToolCalls) return decision("warn", "Phase 1 observes MCP/browser-like tool calls without blocking", toolName);
		return decision("allow", "Observed tool call allowed without warning noise", toolName);
	}
	return undefined;
}

function getGovernorRuntimePathsForTests() {
	return {
		agentDir: AGENT_DIR,
		logPath: GOVERNOR_LOG_DEFAULT_PATH,
		roots: ROOTS,
		backupRoots: Array.from(BACKUP_ROOT_BY_GOVERNANCE_ROOT.values()),
	};
}

function setGovernorLogPathForTests(logPath: string, maxBytes = GOVERNOR_LOG_DEFAULT_MAX_BYTES) {
	governorLogPath = logPath;
	governorLogMaxBytes = maxBytes;
	try {
		if (fs.existsSync(governorLogPath)) fs.unlinkSync(governorLogPath);
	} catch {
		// Test-only helper should not make production paths brittle.
	}
}

function redactLogText(value: string): string {
	return value
		.replace(/(authorization\s*:\s*bearer\s+)[^\s'"`]+/gi, "$1<redacted>")
		.replace(/\b(password|passwd|token|secret|api[_-]?key|credential)(\s*[=:]\s*)[^\s'"`]+/gi, "$1$2<redacted>")
		.replace(/(\.env[^\n]{0,160})(\n[\s\S]*)?/gi, "$1<redacted-env-content>");
}

function sanitizeLogValue(value: unknown): unknown {
	if (typeof value === "string") {
		const redacted = redactLogText(value);
		return redacted.length > GOVERNOR_LOG_FIELD_MAX_CHARS ? `${redacted.slice(0, GOVERNOR_LOG_FIELD_MAX_CHARS)}…<truncated>` : redacted;
	}
	if (Array.isArray(value)) return value.map(sanitizeLogValue);
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [key, child] of Object.entries(value as Record<string, unknown>)) out[key] = sanitizeLogValue(child);
		return out;
	}
	return value;
}

function boundedLogLine(record: Record<string, unknown>): string {
	const sanitized = sanitizeLogValue(record) as Record<string, unknown>;
	let line = JSON.stringify(sanitized);
	if (line.length <= GOVERNOR_LOG_EVENT_MAX_CHARS) return `${line}\n`;
	line = JSON.stringify({
		ts: sanitized.ts,
		seq: sanitized.seq,
		action: sanitized.action,
		reason: sanitized.reason,
		evidence: "<event truncated>",
		truncated: true,
	});
	return `${line}\n`;
}

function writeGovernorLog(record: Record<string, unknown>) {
	try {
		const entry = { ts: new Date().toISOString(), seq: state.seq, ...record };
		const line = boundedLogLine(entry);
		fs.mkdirSync(path.dirname(governorLogPath), { recursive: true });
		const previous = fs.existsSync(governorLogPath) ? fs.readFileSync(governorLogPath, "utf8") : "";
		let next = `${previous}${line}`;
		while (Buffer.byteLength(next, "utf8") > governorLogMaxBytes) {
			const newline = next.indexOf("\n");
			if (newline < 0) {
				next = next.slice(Math.max(0, next.length - governorLogMaxBytes));
				break;
			}
			next = next.slice(newline + 1);
		}
		if (Buffer.byteLength(next, "utf8") > governorLogMaxBytes) next = next.slice(Math.max(0, next.length - governorLogMaxBytes));
		fs.writeFileSync(governorLogPath, next, "utf8");
	} catch {
		// Governor logging must never block the requested tool action.
	}
}

function readGovernorLogTail(lines = 50): string {
	try {
		if (!fs.existsSync(governorLogPath)) return "Governor log is empty.";
		return fs.readFileSync(governorLogPath, "utf8").trimEnd().split(/\r?\n/).slice(-Math.max(1, lines)).join("\n") || "Governor log is empty.";
	} catch (error) {
		return `Could not read governor log: ${(error as Error).message}`;
	}
}

function recordWarning(message: string, ctx?: ExtensionContext, _notify = false) {
	state.warnings++;
	state.latestWarning = message;
	writeGovernorLog({ action: "log", reason: message, safetyMode: CONFIG.safetyMode });
	renderStatus(ctx);
}

function renderStatus(ctx?: ExtensionContext) {
	if (!ctx?.hasUI) return;
	const parts = [`Governor:${CONFIG.safetyMode}`];
	if (state.reloadPending) parts.push("reload pending");
	if (state.warnings > 0) parts.push(`logged:${state.warnings}`);
	ctx.ui.setStatus("superpowers-governor", parts.join(" | "));
	ctx.ui.setWidget("superpowers-governor", undefined);
}

async function applyDecision(dec: GateDecision, ctx: ExtensionContext): Promise<{ block: true; reason: string } | undefined> {
	const reason = `${dec.reason}: ${dec.evidence}`;
	if (dec.action !== "allow") recordWarning(`[${dec.action}] ${reason}`, ctx, false);
	return undefined;
}

function recordAuthorizationFromInput(text: string) {
	const normalizedText = text.trim();
	for (const root of GOVERNANCE_ROOTS) {
		if (normalizedText === `governor: authorize mutation without backup for ${root}`) {
			state.userAuthorizedRoots.add(root);
		}
	}
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasRecentTimestampedBackupFilesystemEvidence(backupRoot: string): boolean {
	try {
		if (!fs.existsSync(backupRoot)) return false;
		const entries = fs.readdirSync(backupRoot, { withFileTypes: true });
		const lowerBound = state.startedAtMs - 5000;
		for (const entry of entries) {
			if (!/\d{8}-\d{6}/.test(entry.name)) continue;
			const fullPath = path.join(backupRoot, entry.name);
			const stat = fs.statSync(fullPath);
			if (stat.mtimeMs >= lowerBound) return true;
		}
		return false;
	} catch {
		return false;
	}
}

function backupDestinationTokenMatches(token: string, timestampedBackupRoot: RegExp, assignsTimestampedBackupDir: boolean): boolean {
	return timestampedBackupRoot.test(token) || (assignsTimestampedBackupDir && /^\$(backup_dir|\{backup_dir\})(\/|$)/.test(token));
}

function stripShellComment(segment: string): string {
	let quote: string | null = null;
	let escaped = false;
	for (let i = 0; i < segment.length; i++) {
		const ch = segment[i];
		if (escaped) {
			escaped = false;
			continue;
		}
		if (ch === "\\") {
			escaped = true;
			continue;
		}
		if (quote) {
			if (ch === quote) quote = null;
			continue;
		}
		if (ch === "'" || ch === '"') {
			quote = ch;
			continue;
		}
		if (ch === "#" && (i === 0 || /\s/.test(segment[i - 1] ?? ""))) return segment.slice(0, i).trim();
	}
	return segment.trim();
}

function tarOptionWritesArchive(token: string): boolean {
	if (!token.startsWith("-") || token.startsWith("--")) return false;
	const letters = token.replace(/^-+/, "");
	return /[cruA]/.test(letters) && !/[txd]/.test(letters);
}

function segmentWritesBackupDestination(segment: string, timestampedBackupRoot: RegExp, assignsTimestampedBackupDir: boolean): boolean {
	const uncommented = stripShellComment(segment);
	const tokens = shellTokens(uncommented);
	const tool = tokens[0];
	if (!tool || !["cp", "rsync", "tar", "install"].includes(tool)) return false;

	if (tool === "tar") {
		const writesArchive = tokens.some((token) => tarOptionWritesArchive(token)) || tokens.includes("--create") || tokens.includes("--append") || tokens.includes("--update");
		if (!writesArchive) return false;
		for (let i = 1; i < tokens.length; i++) {
			const token = tokens[i] ?? "";
			if (token === "-f" || (/^-[A-Za-z]+$/.test(token) && token.includes("f"))) {
				const archive = tokens[i + 1];
				if (archive && backupDestinationTokenMatches(archive, timestampedBackupRoot, assignsTimestampedBackupDir)) return true;
			}
			if (token.startsWith("--file=")) {
				const archive = token.slice("--file=".length);
				if (backupDestinationTokenMatches(archive, timestampedBackupRoot, assignsTimestampedBackupDir)) return true;
			}
		}
		return false;
	}

	const positional = tokens.slice(1).filter((token) => !token.startsWith("-"));
	const destination = positional.at(-1);
	return !!destination && backupDestinationTokenMatches(destination, timestampedBackupRoot, assignsTimestampedBackupDir);
}

function commandCreatesBackup(command: string, backupRoot: string): boolean {
	if (!command.includes(backupRoot)) return false;
	const backupRootPattern = escapeRegExp(backupRoot);
	const timestampedBackupRoot = new RegExp(`${backupRootPattern}[^\\s"']*(\\d{8}-\\d{6}|\\$\\(date \\+%Y%m%d-%H%M%S\\))`);
	const assignsTimestampedBackupDir = new RegExp(`\\bbackup_dir=${backupRootPattern}[^\\s;"']*\\$\\(date \\+%Y%m%d-%H%M%S\\)`).test(command);
	const commandSegments = command
		.split(/(?:&&|[;\n\r&])/)
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0 && !segment.startsWith("#"));
	const creationSegmentTargetsBackup = commandSegments.some((segment) => segmentWritesBackupDestination(segment, timestampedBackupRoot, assignsTimestampedBackupDir));
	return creationSegmentTargetsBackup && hasRecentTimestampedBackupFilesystemEvidence(backupRoot);
}

function recordBackupEvidence(command: string) {
	for (const [governanceRoot, backupRoot] of BACKUP_ROOT_BY_GOVERNANCE_ROOT) {
		if (commandCreatesBackup(command, backupRoot)) state.backupEvidenceRoots.add(governanceRoot);
	}
}

function commandLooksMutating(command: string): boolean {
	if (isReadOnlyCommand(command)) return false;
	return /\b(rm|mv|cp|tee|install|sed\s+-i|python|node|npm|pnpm|bun|pacman|yay|chmod|chown|touch|mkdir|write)\b/i.test(command);
}

function extractValidationHints(text: string): string[] {
	const hints = new Set<string>();
	for (const match of text.matchAll(/`([^`\n]+)`/g)) {
		const hint = String(match[1] ?? "").trim();
		if (hint.length > 0) hints.add(hint);
	}
	for (const match of text.matchAll(/(?:validate with|verify with|run|use|using|with)\s+(?:the\s+)?(?:command\s+)?([A-Za-z0-9_./:-]+(?:\s+[A-Za-z0-9_./:-]+){0,4})/gi)) {
		let hint = String(match[1] ?? "").trim();
		hint = hint.split(/\s+(?:before|after|then|and)\s+/i)[0]?.trim() ?? "";
		if (hint.length > 0 && !/^(the|this|that|a|an)$/i.test(hint)) hints.add(hint);
	}
	return [...hints];
}

function matchesPromptValidationHint(command: string): boolean {
	return state.prompt.validationHints.some((hint) => command.includes(hint) || hint.includes(command));
}

function validationKind(command: string): ValidationKind | undefined {
	const explicitKind = validationCommandKind(command);
	if (explicitKind) return explicitKind;
	if (hasShellControlOrRedirection(command)) return undefined;
	const lower = command.toLowerCase();
	if (hasMutatingValidationFlag(lower)) return undefined;
	if (/^(npm|pnpm|bun)\s/.test(lower)) return undefined;
	if (/^(pytest|vitest|jest|cargo test|test)(?:$|\s)/.test(lower)) return "test";
	if (matchesPromptValidationHint(command)) return "generic";
	return undefined;
}

function recordToolResult(event: { toolName: string; input: any; isError?: boolean }, ctx: ExtensionContext) {
	state.seq++;
	const success = !event.isError;
	if (!success) {
		if (state.prompt.latestValidationSeq > state.prompt.startSeq) state.prompt.failedAfterValidation = true;
		renderStatus(ctx);
		return;
	}

	if (event.toolName === "bash") {
		const command = String(event.input?.command ?? "");
		recordBackupEvidence(command);
		const kind = validationKind(command);
		if (kind) {
			const evidence = { seq: state.seq, kind, command };
			state.prompt.validations.push(evidence);
			state.prompt.latestValidationSeq = state.seq;
			state.prompt.failedAfterValidation = false;
		} else if (commandLooksMutating(command)) {
			state.prompt.latestMutationSeq = state.seq;
		}
	}

	if (event.toolName === "write" || event.toolName === "edit") {
		const target = resolveToolPath(String(event.input?.path ?? ""), ctx.cwd);
		state.prompt.latestMutationSeq = state.seq;
		const root = governanceRootFor(target);
		if (root) state.reloadPending = true;
	}

	renderStatus(ctx);
}

function extractTextFromContent(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content
		.map((part) => {
			if (part && typeof part === "object" && (part as any).type === "text") return String((part as any).text ?? "");
			return "";
		})
		.join("\n");
}

function extractAssistantText(message: unknown): string {
	if (!message || typeof message !== "object") return "";
	const msg = message as any;
	if (msg.role && msg.role !== "assistant") return "";
	return extractTextFromContent(msg.content);
}

function containsCompletionClaim(text: string): boolean {
	const lower = text.toLowerCase();
	return /\b(all tests? pass(?:ed)?|tests? pass(?:ed)?|test passed|build passes|build passed|verified|validated)\b/.test(lower);
}

function latestValidationOfKinds(kinds: ValidationKind[]): ValidationEvidence | undefined {
	for (let i = state.prompt.validations.length - 1; i >= 0; i--) {
		const evidence = state.prompt.validations[i];
		if (evidence && kinds.includes(evidence.kind)) return evidence;
	}
	return undefined;
}

function evidenceIsFresh(evidence: ValidationEvidence | undefined): boolean {
	return !!evidence && evidence.seq > state.prompt.startSeq && evidence.seq >= state.prompt.latestMutationSeq && !state.prompt.failedAfterValidation;
}

function claimHasEvidence(text: string): boolean {
	const lower = text.toLowerCase();
	if (/\b(all tests? pass(?:ed)?|tests? pass(?:ed)?|test passed)\b/.test(lower)) return evidenceIsFresh(latestValidationOfKinds(["test"]));
	if (/\b(build passes|build passed)\b/.test(lower)) return evidenceIsFresh(latestValidationOfKinds(["build", "typecheck"]));
	if (/\b(verified|validated)\b/.test(lower)) return evidenceIsFresh(latestValidationOfKinds(["test", "build", "typecheck", "lint", "generic"]));
	return true;
}

function checkCompletionClaim(_pi: ExtensionAPI, text: string, ctx: ExtensionContext) {
	if (!containsCompletionClaim(text)) return;
	if (claimHasEvidence(text)) return;
	if (state.lastCompletionWarningText === text) return;
	state.lastCompletionWarningText = text;
	recordWarning("Completion claim lacks fresh current-prompt verification evidence", ctx);
}

export default function superpowersGovernor(pi: ExtensionAPI) {
	pi.registerCommand("governor-reload", {
		description: "Reload extensions, skills, prompts, and themes after governor-related changes",
		handler: async (_args, ctx) => {
			await ctx.reload();
			return;
		},
	});

	pi.registerCommand("governor-log", {
		description: "Show the bounded Superpowers governor JSONL log tail",
		handler: async (args, ctx) => {
			const match = args.match(/(?:--tail\s+)?(\d+)/);
			const tail = match ? Number.parseInt(match[1] ?? "50", 10) : 50;
			const content = readGovernorLogTail(Number.isFinite(tail) ? tail : 50);
			if (ctx.hasUI) ctx.ui.notify(content, "info");
			else pi.sendMessage({ customType: "superpowers-governor-log", content, display: true }, { deliverAs: "followUp" });
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		resetState();
		renderStatus(ctx);
	});

	pi.on("input", async (event) => {
		latestUserInputText = String(event.text ?? "");
		recordAuthorizationFromInput(latestUserInputText);
		return { action: "continue" };
	});

	pi.on("agent_start", async (_event, ctx) => {
		state.prompt = createPromptState(state.seq, latestUserInputText);
		state.lastCompletionWarningText = "";
		renderStatus(ctx);
	});

	pi.on("tool_call", async (event, ctx) => {
		const dec = classifyToolCall(event.toolName, (event.input ?? {}) as Record<string, unknown>, ctx.cwd);
		if (!dec) return undefined;
		return applyDecision(dec, ctx);
	});

	pi.on("tool_result", async (event, ctx) => {
		recordToolResult(
			{ toolName: event.toolName, input: event.input, isError: event.isError },
			ctx,
		);
		return undefined;
	});

	pi.on("turn_end", async (event, ctx) => {
		checkCompletionClaim(pi, extractAssistantText(event.message), ctx);
	});

	pi.on("agent_end", async (event, ctx) => {
		const messages = Array.isArray(event.messages) ? event.messages : [];
		for (let i = messages.length - 1; i >= 0; i--) {
			const text = extractAssistantText(messages[i]);
			if (text) {
				checkCompletionClaim(pi, text, ctx);
				break;
			}
		}
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		ctx.ui.setStatus("superpowers-governor", undefined);
		ctx.ui.setWidget("superpowers-governor", undefined);
	});
}
