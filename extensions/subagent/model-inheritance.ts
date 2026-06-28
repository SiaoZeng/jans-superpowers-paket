import { type AgentModelRouteRule, findMatchingRoute } from "./routing-config.js";

export interface CurrentSessionModel {
	provider: string;
	id: string;
}

function formatInheritedModelSpec(
	currentModel: CurrentSessionModel | undefined,
	thinkingLevel?: string,
): string | undefined {
	if (!currentModel) return undefined;
	return thinkingLevel
		? `${currentModel.provider}/${currentModel.id}:${thinkingLevel}`
		: `${currentModel.provider}/${currentModel.id}`;
}

export function resolveAgentModelSpec(
	agentName: string,
	agentModel: string | undefined,
	routingRules: AgentModelRouteRule[],
	currentModel: CurrentSessionModel | undefined,
	thinkingLevel?: string,
): string | undefined {
	if (agentModel && agentModel !== "inherit") return agentModel;

	const matchedRoute = findMatchingRoute(agentName, routingRules);
	if (matchedRoute) {
		if (matchedRoute.model === "inherit") {
			return formatInheritedModelSpec(currentModel, thinkingLevel);
		}
		return matchedRoute.model;
	}

	if (agentModel !== "inherit") return undefined;
	return formatInheritedModelSpec(currentModel, thinkingLevel);
}
