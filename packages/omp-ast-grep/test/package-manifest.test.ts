import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

interface PackageManifest {
	omp: {
		extensions?: string[];
		skills?: string[];
		prompts?: string[];
	};
}

function isPackageManifest(value: unknown): value is PackageManifest {
	return typeof value === "object" && value !== null && "omp" in value;
}

function readPackageJson(): PackageManifest {
	const parsed: unknown = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8"));
	if (!isPackageManifest(parsed)) {
		throw new Error("package.json does not contain a valid omp manifest");
	}
	return parsed;
}

describe("package manifest guidance resources", () => {
	it("#given package manifest #when inspecting omp resources #then extensions skills and prompts are exported", () => {
		// given
		const pkg = readPackageJson();

		// when / then
		expect(pkg.omp.extensions).toEqual(["./src/index.ts"]);
		expect(pkg.omp.skills).toEqual(["./skills"]);
		expect(pkg.omp.prompts).toEqual(["./prompts"]);
	});

	it("#given declared skill and prompt resources #when checking filesystem #then referenced files exist", () => {
		// given
		const skillPath = join(repoRoot, "skills", "ast-grep-guidance", "SKILL.md");
		const promptPath = join(repoRoot, "prompts", "ast-grep-workflow.md");
		const referencePath = join(repoRoot, "skills", "ast-grep-guidance", "references", "workflow.md");

		// when / then
		expect(existsSync(skillPath)).toBe(true);
		expect(existsSync(promptPath)).toBe(true);
		expect(existsSync(referencePath)).toBe(true);
	});
});
