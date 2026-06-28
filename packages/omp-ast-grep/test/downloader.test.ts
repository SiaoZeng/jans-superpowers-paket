import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
	DEFAULT_AST_GREP_VERSION,
	ensureAstGrepBinary,
	getBinaryName,
	getCacheDir,
	isVersionOutputCompatible,
	PLATFORM_MAP,
} from "../src/ast-grep/downloader.js";

const originalXdgCacheHome = process.env["XDG_CACHE_HOME"];

describe("downloader helpers", () => {
	beforeEach(() => {
		process.env["XDG_CACHE_HOME"] = "/tmp/omp-ast-grep-cache-test";
	});

	afterEach(() => {
		if (originalXdgCacheHome === undefined) {
			delete process.env["XDG_CACHE_HOME"];
		} else {
			process.env["XDG_CACHE_HOME"] = originalXdgCacheHome;
		}
	});

	it("#given cache environment override #when building cache dir #then returns pi ast grep cache path", () => {
		const cacheDirectory = getCacheDir();
		expect(cacheDirectory).toContain("omp-ast-grep");
		if (process.platform !== "win32") {
			expect(cacheDirectory).toBe(join("/tmp/omp-ast-grep-cache-test", "omp-ast-grep", "bin"));
		}
	});

	it("#given current platform #when resolving binary name #then returns platform specific sg name", () => {
		const expectedBinaryName = process.platform === "win32" ? "sg.exe" : "sg";
		expect(getBinaryName()).toBe(expectedBinaryName);
	});

	it("#given platform map #when inspecting keys #then contains supported platform entries", () => {
		const expectedKeys = [
			"darwin-arm64",
			"darwin-x64",
			"linux-arm64",
			"linux-x64",
			"win32-x64",
			"win32-arm64",
			"win32-ia32",
		];
		const keys = Object.keys(PLATFORM_MAP);
		expect(keys).toHaveLength(7);
		expect([...keys].sort()).toEqual([...expectedKeys].sort());
	});

	it("#given default version #when inspecting downloader constant #then matches ast grep cli version", () => {
		expect(DEFAULT_AST_GREP_VERSION).toBe("0.42.3");
	});

	it("#given version output #when validating compatibility #then matches expected version exactly", () => {
		expect(isVersionOutputCompatible("ast-grep 0.42.3", "0.42.3")).toBe(true);
		expect(isVersionOutputCompatible("ast-grep 0.42.2", "0.42.3")).toBe(false);
	});

	it("#given invalid cached binary #when ensuring binary #then returns null instead of trusting cache", async () => {
		const cacheDirectory = getCacheDir();
		mkdirSync(cacheDirectory, { recursive: true });
		const binaryPath = join(cacheDirectory, getBinaryName());
		writeFileSync(binaryPath, "bad", "utf-8");
		const result = await ensureAstGrepBinary();
		expect(result).toBeNull();
	});
});
