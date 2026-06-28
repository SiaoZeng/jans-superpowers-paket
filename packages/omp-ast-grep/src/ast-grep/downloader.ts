import { homedir } from "node:os";
import { join } from "node:path";

import { getCachedBinaryPath as getCachedBinaryPathShared } from "./binary-downloader.js";

const CACHE_DIR_NAME = "omp-ast-grep";
const DEFAULT_VERSION = "0.42.3";

interface PlatformInfo {
	arch: string;
	os: string;
}

const PLATFORM_MAP: Record<string, PlatformInfo> = {
	"darwin-arm64": { arch: "aarch64", os: "apple-darwin" },
	"darwin-x64": { arch: "x86_64", os: "apple-darwin" },
	"linux-arm64": { arch: "aarch64", os: "unknown-linux-gnu" },
	"linux-x64": { arch: "x86_64", os: "unknown-linux-gnu" },
	"win32-x64": { arch: "x86_64", os: "pc-windows-msvc" },
	"win32-arm64": { arch: "aarch64", os: "pc-windows-msvc" },
	"win32-ia32": { arch: "i686", os: "pc-windows-msvc" },
};

export function isVersionOutputCompatible(output: string, expectedVersion: string): boolean {
	const normalized = output.trim();
	return normalized.startsWith("ast-grep ") && normalized.includes(expectedVersion);
}

export function getCacheDir(): string {
	if (process.platform === "win32") {
		const localAppData = process.env["LOCALAPPDATA"] ?? process.env["APPDATA"];
		const base = localAppData ?? join(homedir(), "AppData", "Local");
		return join(base, CACHE_DIR_NAME, "bin");
	}

	const xdgCache = process.env["XDG_CACHE_HOME"];
	const base = xdgCache ?? join(homedir(), ".cache");
	return join(base, CACHE_DIR_NAME, "bin");
}

export function getBinaryName(): string {
	return process.platform === "win32" ? "sg.exe" : "sg";
}

export function getCachedBinaryPath(): string | null {
	return getCachedBinaryPathShared(getCacheDir(), getBinaryName());
}

export async function downloadAstGrep(_version: string = DEFAULT_VERSION): Promise<string | null> {
	return null;
}

export async function ensureAstGrepBinary(): Promise<string | null> {
	return null;
}

export { DEFAULT_VERSION as DEFAULT_AST_GREP_VERSION, PLATFORM_MAP };
