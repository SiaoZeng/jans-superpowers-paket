import { describe, expect, it } from "bun:test";
import { resolveAgentModelSpec } from "./model-inheritance";

describe("resolveAgentModelSpec", () => {
	it("passes through explicit model values unchanged", () => {
		expect(
			resolveAgentModelSpec(
				"researcher",
				"openai/gpt-5.4",
				[],
				{ provider: "google", id: "gemini-2.5-pro" },
				"high",
			),
		).toBe("openai/gpt-5.4");
	});

	it("prefers a matching routing rule over inherit", () => {
		expect(
			resolveAgentModelSpec(
				"researcher",
				"inherit",
				[{ agentPattern: "*research*", model: "llama-local/qwen3.6" }],
				{ provider: "openai", id: "gpt-5.4" },
				"high",
			),
		).toBe("llama-local/qwen3.6");
	});

	it("uses inherit from a matching route when configured", () => {
		expect(
			resolveAgentModelSpec(
				"researcher",
				undefined,
				[{ agentPattern: "researcher", model: "inherit" }],
				{ provider: "openai", id: "gpt-5.4" },
				"high",
			),
		).toBe("openai/gpt-5.4:high");
	});

	it("inherits provider, model, and thinking level from the current session model", () => {
		expect(resolveAgentModelSpec("researcher", "inherit", [], { provider: "openai", id: "gpt-5.4" }, "high")).toBe(
			"openai/gpt-5.4:high",
		);
	});

	it("inherits provider and model when no thinking level is available", () => {
		expect(resolveAgentModelSpec("researcher", "inherit", [], { provider: "openai", id: "gpt-5.4" })).toBe(
			"openai/gpt-5.4",
		);
	});

	it("preserves an explicit off thinking level during inheritance", () => {
		expect(resolveAgentModelSpec("researcher", "inherit", [], { provider: "openai", id: "gpt-5.4" }, "off")).toBe(
			"openai/gpt-5.4:off",
		);
	});

	it("preserves slash-heavy provider model identifiers during inheritance", () => {
		expect(
			resolveAgentModelSpec(
				"researcher",
				"inherit",
				[],
				{ provider: "openrouter", id: "anthropic/claude-sonnet-4-5" },
				"minimal",
			),
		).toBe("openrouter/anthropic/claude-sonnet-4-5:minimal");
	});

	it("falls back to default CLI model resolution when inherit is requested without an active session model", () => {
		expect(resolveAgentModelSpec("researcher", "inherit", [], undefined, "high")).toBeUndefined();
	});

	it("keeps undefined when neither frontmatter nor routes specify a model", () => {
		expect(resolveAgentModelSpec("worker", undefined, [], { provider: "openai", id: "gpt-5.4" }, "high")).toBeUndefined();
	});
});
