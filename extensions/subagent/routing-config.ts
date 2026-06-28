import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export interface AgentModelRouteRule {
	agentPattern: string;
	model: string;
}

export interface AgentModelRoutingConfig {
	version: 1;
	rules: AgentModelRouteRule[];
}

const ROUTING_CONFIG_VERSION = 1;
const AGENT_DIR = process.env.OMP_CODING_AGENT_DIR || process.env.PI_CODING_AGENT_DIR || path.join(os.homedir(), ".omp", "agent");
const ROUTING_CONFIG_PATH = path.join(AGENT_DIR, "subagent-model-routing.json");

export function getRoutingConfigPath(): string {
	return ROUTING_CONFIG_PATH;
}

export function getEmptyRoutingConfig(): AgentModelRoutingConfig {
	return { version: ROUTING_CONFIG_VERSION, rules: [] };
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}

function isRouteRule(value: unknown): value is AgentModelRouteRule {
	if (!value || typeof value !== "object") return false;
	const candidate = value as Record<string, unknown>;
	return isNonEmptyString(candidate.agentPattern) && isNonEmptyString(candidate.model);
}

function normalizeRule(rule: AgentModelRouteRule): AgentModelRouteRule {
	return {
		agentPattern: rule.agentPattern.trim(),
		model: rule.model.trim(),
	};
}

export function loadRoutingConfig(): AgentModelRoutingConfig {
	if (!fs.existsSync(ROUTING_CONFIG_PATH)) return getEmptyRoutingConfig();

	try {
		const raw = fs.readFileSync(ROUTING_CONFIG_PATH, "utf-8");
		const parsed = JSON.parse(raw) as Partial<AgentModelRoutingConfig>;
		const rules = Array.isArray(parsed.rules) ? parsed.rules.filter(isRouteRule).map(normalizeRule) : [];
		return { version: ROUTING_CONFIG_VERSION, rules };
	} catch {
		return getEmptyRoutingConfig();
	}
}

export async function saveRoutingConfig(config: AgentModelRoutingConfig): Promise<void> {
	const normalized: AgentModelRoutingConfig = {
		version: ROUTING_CONFIG_VERSION,
		rules: config.rules.filter(isRouteRule).map(normalizeRule),
	};

	await fs.promises.mkdir(path.dirname(ROUTING_CONFIG_PATH), { recursive: true });
	await fs.promises.writeFile(ROUTING_CONFIG_PATH, `${JSON.stringify(normalized, null, 2)}\n`, {
		encoding: "utf-8",
		mode: 0o600,
	});
}

export async function setRoutingRule(agentPattern: string, model: string): Promise<AgentModelRoutingConfig> {
	const config = loadRoutingConfig();
	const normalized = normalizeRule({ agentPattern, model });
	const idx = config.rules.findIndex((rule) => rule.agentPattern === normalized.agentPattern);
	if (idx >= 0) config.rules[idx] = normalized;
	else config.rules.push(normalized);
	await saveRoutingConfig(config);
	return loadRoutingConfig();
}

export async function removeRoutingRule(agentPattern: string): Promise<{ removed: boolean; config: AgentModelRoutingConfig }> {
	const config = loadRoutingConfig();
	const before = config.rules.length;
	config.rules = config.rules.filter((rule) => rule.agentPattern !== agentPattern.trim());
	const removed = config.rules.length !== before;
	await saveRoutingConfig(config);
	return { removed, config: loadRoutingConfig() };
}

export async function clearRoutingRules(): Promise<void> {
	await saveRoutingConfig(getEmptyRoutingConfig());
}

function escapeRegex(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchAgentPattern(agentPattern: string, agentName: string): boolean {
	const pattern = agentPattern.trim();
	if (!pattern) return false;
	if (pattern === "*") return true;
	if (!pattern.includes("*")) return pattern === agentName;
	const regex = new RegExp(`^${pattern.split("*").map(escapeRegex).join(".*")}$`);
	return regex.test(agentName);
}

export function findMatchingRoute(
	agentName: string,
	rules: AgentModelRouteRule[],
): AgentModelRouteRule | undefined {
	return rules.find((rule) => matchAgentPattern(rule.agentPattern, agentName));
}
