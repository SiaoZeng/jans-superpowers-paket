import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function forwardToSkill(pi: ExtensionAPI, commandName: string, skillName: string, description: string) {
	pi.registerCommand(commandName, {
		description,
		handler: async (args) => {
			const suffix = args.trim() ? ` ${args.trim()}` : "";
			pi.sendUserMessage(`/skill:${skillName}${suffix}`);
		},
	});
}

export default function superpowersCommandsExtension(pi: ExtensionAPI) {
	forwardToSkill(pi, "brainstorm", "brainstorming", "Run the brainstorming workflow");
	forwardToSkill(pi, "write-spec", "write-spec", "Run the specification workflow");
	forwardToSkill(pi, "write-plan", "write-plan", "Run the planning workflow");
	forwardToSkill(pi, "execute-plan", "executing-plans", "Run the plan execution controller");
	forwardToSkill(pi, "tdd", "test-driven-development", "Run the TDD workflow");
	forwardToSkill(pi, "debug", "systematic-debugging", "Run the debugging workflow");
	forwardToSkill(pi, "finish-branch", "finishing-a-development-branch", "Run the branch completion workflow");
	forwardToSkill(pi, "receive-review", "receiving-code-review", "Run the review-feedback intake workflow");
}
