import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

let bootstrapPending = true;

function isDelegatedSubagentChild() {
	return process.env.OMP_SUPERPOWERS_SUBAGENT === "1";
}

const BOOTSTRAP_BLOCK = [
	"<EXTREMELY_IMPORTANT>",
	"You have OMP Superpowers workflows installed.",
	"",
	"Before the first substantive response or action in this session, check whether any installed skill applies.",
	"",
	"If a skill applies, load and follow it before continuing.",
	"",
	"Routing priority:",
	"1. Process/framing skills first (`brainstorming`, `write-plan`, `systematic-debugging`)",
	"2. Workspace/controller skills second (`using-git-worktrees`, `executing-plans`, `subagent-driven-development`)",
	"3. Execution skills third (`test-driven-development`)",
	"4. Parallel gates alongside execution (`verification-before-completion`, `requesting-code-review`)",
	"5. Completion workflow last (`finishing-a-development-branch`)",
	"",
	"Do not rationalize that a request is too small, too obvious, or too urgent to justify the skill check.",
	"",
	"Artifact-boundary rule: produce at most one major workflow artifact per user turn by default. After a spec, review, plan, or review artifact is complete, stop with the recommended next handoff unless the user explicitly requested continuation or autonomous execution in this turn.",
	"",
	"Do not automatically chain write-spec -> write-plan -> execution just because a handoff is named. A named handoff is a recommended next step, not permission to keep cycling.",
	"",
	"User instructions and project instructions such as AGENTS.md override skill defaults.",
	"",
	"Autonomous execution rule: if the user says to work autonomously, proceed with the selected workflow without asking for routine confirmations, execution-mode choices, or checkpoint approvals. Persist checkpoints in files or concise status output and continue. Ask only for genuine blockers: destructive irreversible actions, missing secrets, paid/external account actions, ambiguous product decisions that cannot be inferred from the plan/spec, or repeated verification failures.",
	"",
	"If this turn is a narrowly scoped delegated task that already includes explicit workflow instructions, do not restart top-level workflow arbitration unless a required workflow is still missing.",
	"</EXTREMELY_IMPORTANT>",
].join("\n");

export default function superpowersBootstrapExtension(pi: ExtensionAPI) {
	function armBootstrap() {
		bootstrapPending = true;
	}

	pi.on("session_start", () => {
		armBootstrap();
	});

	pi.on("session_compact", () => {
		armBootstrap();
	});

	pi.on("before_agent_start", (event, ctx) => {
		if (!bootstrapPending) return;

		bootstrapPending = false;

		if (isDelegatedSubagentChild()) return;

		if (ctx.hasUI) {
			ctx.ui.setStatus("superpowers", "Superpowers bootstrap active");
		}

		return {
			systemPrompt: `${event.systemPrompt}\n\n${BOOTSTRAP_BLOCK}`,
		};
	});

	pi.on("session_shutdown", (_event, ctx) => {
		if (ctx.hasUI) {
			ctx.ui.setStatus("superpowers", undefined);
		}
	});
}
