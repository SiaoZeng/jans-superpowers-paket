import type { ChildProcess } from "node:child_process";
import { createInterface } from "node:readline";

import { SearchTimeoutError } from "./errors.js";

export interface ProcessOutput {
	stdout: string;
	stderr: string;
	exitCode: number;
	stdoutLimitReached?: boolean;
}

export interface LineLimitedProcessOutput extends ProcessOutput {
	totalLineCount: number;
	stoppedEarly: boolean;
	stdoutLimitReached?: boolean;
}

function truncateStringToUtf8Bytes(text: string, maxBytes: number): string {
	const buffer = Buffer.from(text, "utf-8");
	if (buffer.length <= maxBytes) {
		return text;
	}
	return buffer.subarray(0, maxBytes).toString("utf-8");
}

function attachTimeout(proc: ChildProcess, timeoutMs: number, reject: (error: Error) => void): () => void {
	let timeoutHandle: NodeJS.Timeout | null = setTimeout(() => {
		proc.kill("SIGTERM");
		hardKillHandle = setTimeout(() => {
			if (proc.exitCode === null) {
				proc.kill("SIGKILL");
			}
		}, 1000);
		reject(new SearchTimeoutError(timeoutMs));
	}, timeoutMs);
	let hardKillHandle: NodeJS.Timeout | null = null;

	return () => {
		if (timeoutHandle !== null) {
			clearTimeout(timeoutHandle);
			timeoutHandle = null;
		}
		if (hardKillHandle !== null) {
			clearTimeout(hardKillHandle);
			hardKillHandle = null;
		}
	};
}

export async function collectProcessOutputWithTimeout(
	proc: ChildProcess,
	timeoutMs: number,
	maxStdoutBytes?: number,
): Promise<ProcessOutput> {
	let stdout = "";
	let stderr = "";
	let stdoutLimitReached = false;

	proc.stdout?.setEncoding("utf-8");
	proc.stderr?.setEncoding("utf-8");

	proc.stdout?.on("data", (chunk: string) => {
		if (stdoutLimitReached) {
			return;
		}
		stdout += chunk;
		if (maxStdoutBytes !== undefined && Buffer.byteLength(stdout, "utf-8") >= maxStdoutBytes) {
			stdout = truncateStringToUtf8Bytes(stdout, maxStdoutBytes);
			stdoutLimitReached = true;
			proc.kill("SIGTERM");
			setTimeout(() => {
				if (proc.exitCode === null) {
					proc.kill("SIGKILL");
				}
			}, 1000);
		}
	});
	proc.stderr?.on("data", (chunk: string) => {
		stderr += chunk;
	});

	const exitCode = await new Promise<number>((resolve, reject) => {
		const cleanup = attachTimeout(proc, timeoutMs, reject);

		proc.once("close", (code) => {
			cleanup();
			resolve(code ?? 0);
		});

		proc.once("error", (err) => {
			cleanup();
			reject(err);
		});
	});

	const result: ProcessOutput = { stdout, stderr, exitCode };
	if (stdoutLimitReached) {
		result.stdoutLimitReached = true;
	}
	return result;
}

export async function collectProcessOutputByLineLimitWithTimeout(
	proc: ChildProcess,
	timeoutMs: number,
	lineLimit?: number,
	maxStdoutBytes?: number,
): Promise<LineLimitedProcessOutput> {
	let stderr = "";
	const stdoutLines: string[] = [];
	let totalLineCount = 0;
	let stdoutBytes = 0;
	let stoppedEarly = false;
	let stdoutLimitReached = false;

	proc.stdout?.setEncoding("utf-8");
	proc.stderr?.setEncoding("utf-8");
	proc.stderr?.on("data", (chunk: string) => {
		stderr += chunk;
	});

	const rl = proc.stdout ? createInterface({ input: proc.stdout }) : null;
	if (rl) {
		rl.on("line", (line) => {
			totalLineCount++;
			const lineBytes = Buffer.byteLength(`${line}\n`, "utf-8");
			const wouldExceedBytes = maxStdoutBytes !== undefined && stdoutBytes + lineBytes > maxStdoutBytes;
			if (wouldExceedBytes) {
				stdoutLimitReached = true;
				stoppedEarly = true;
				proc.kill("SIGTERM");
				setTimeout(() => {
					if (proc.exitCode === null) {
						proc.kill("SIGKILL");
					}
				}, 1000);
				return;
			}
			if (lineLimit === undefined || stdoutLines.length < lineLimit) {
				stdoutLines.push(line);
				stdoutBytes += lineBytes;
			}
			if (!stoppedEarly) {
				const lineCapHit = lineLimit !== undefined && stdoutLines.length >= lineLimit;
				if (lineCapHit) {
					stoppedEarly = true;
					proc.kill("SIGTERM");
					setTimeout(() => {
						if (proc.exitCode === null) {
							proc.kill("SIGKILL");
						}
					}, 1000);
				}
			}
		});
	}

	const exitCode = await new Promise<number>((resolve, reject) => {
		const cleanup = attachTimeout(proc, timeoutMs, reject);

		proc.once("close", (code) => {
			cleanup();
			rl?.close();
			resolve(code ?? 0);
		});

		proc.once("error", (err) => {
			cleanup();
			rl?.close();
			reject(err);
		});
	});

	const result: LineLimitedProcessOutput = {
		stdout: stdoutLines.join("\n"),
		stderr,
		exitCode,
		totalLineCount,
		stoppedEarly,
	};
	if (stdoutLimitReached) {
		result.stdoutLimitReached = true;
	}
	return result;
}
