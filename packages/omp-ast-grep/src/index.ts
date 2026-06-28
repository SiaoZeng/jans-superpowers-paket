import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import {
	findSgCliPathSync,
	getConfiguredSgCliPathError,
	getConfiguredSgCliPathOverride,
} from "./ast-grep/binary-path.js";
import { getCacheDir, getCachedBinaryPath } from "./ast-grep/downloader.js";
import { ast_gparse, ast_grep_replace, ast_grep_scan, ast_grep_search, ast_grep_test } from "./ast-grep/tools.js";

/**
 * omp-ast-grep — AST-aware code search and replace for the OMP coding agent.
 *
 * Ports omo's ast-grep tool stack as a OMP extension. Resolves the `sg`
 * binary in this order: cache → @ast-grep/cli npm package → platform
 * package → PATH → Homebrew. The package does not auto-download binaries.
 *
 * Tools registered:
 *   - ast_grep_search   — AST pattern search across files (parallel-safe)
 *   - ast_grep_replace  — AST pattern replace, sequential when applying
 *   - ast_gparse        — AST/query debug inspection for ast-grep patterns
 *   - ast_grep_test     — validate patterns or inline rules against example code
 *   - ast_grep_scan     — run advanced inline YAML rules across repository files
 *
 * Commands registered:
 *   - /ast-grep         — show binary path and cache/config state
 *   - /ast-grep install — show manual install guidance
 *
 * See README.md for installation and usage.
 */
export default function (pi: ExtensionAPI): void {
	pi.registerTool(ast_gparse);
	pi.registerTool(ast_grep_test);
	pi.registerTool(ast_grep_scan);
	pi.registerTool(ast_grep_search);
	pi.registerTool(ast_grep_replace);

	pi.registerCommand("ast-grep", {
		description: "Show ast-grep binary path and cache/config directory state",
		handler: async (args, ctx) => {
			const trimmed = args.trim();
			const wantsInstall = trimmed === "install" || trimmed === "download";

			const cachedPath = getCachedBinaryPath();
			const localPath = findSgCliPathSync();
			const configuredPath = getConfiguredSgCliPathOverride();
			const configuredPathError = getConfiguredSgCliPathError();
			const cacheDir = getCacheDir();

			if (wantsInstall) {
				ctx.ui.notify(
					"This companion package does not auto-download binaries. Install ast-grep via npm/cargo/brew or configure OMP_AST_GREP_PATH / AST_GREP_BIN.",
					"info",
				);
				return;
			}

			const lines = [
				"omp-ast-grep",
				`  Cache dir      : ${cacheDir}`,
				`  Configured sg  : ${configuredPath ?? "not configured"}`,
				`  Config error   : ${configuredPathError ?? "none"}`,
				`  Cached sg      : ${cachedPath ?? "not downloaded"}`,
				`  Local sg       : ${localPath ?? "not on PATH"}`,
			].join("\n");
			ctx.ui.notify(lines, "info");
		},
	});
}
