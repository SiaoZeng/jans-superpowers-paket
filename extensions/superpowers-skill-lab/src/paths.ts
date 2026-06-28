import * as crypto from "node:crypto";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export const AGENT_ROOT = path.resolve(process.env.OMP_CODING_AGENT_DIR || process.env.PI_CODING_AGENT_DIR || path.join(os.homedir(), ".omp", "agent"));
const SRC_ROOT = path.dirname(fileURLToPath(import.meta.url));
export const EXTENSION_ROOT = path.resolve(SRC_ROOT, "..");
export const PACKAGE_ROOT = path.resolve(EXTENSION_ROOT, "..", "..");
export const RUNS_ROOT = path.join(AGENT_ROOT, "skill-lab", "runs");
export const REGISTRY_ROOT = path.join(AGENT_ROOT, "registries", "skill-lab");
export const PACKAGE_REGISTRY_ROOT = path.join(PACKAGE_ROOT, "registries", "skill-lab");
export const LIVE_GOVERNANCE_ROOTS = [
  path.join(AGENT_ROOT, "skills"),
  path.join(AGENT_ROOT, "extensions"),
  path.join(AGENT_ROOT, "prompts"),
  path.join(AGENT_ROOT, "themes"),
];

export function normalizePath(value: string): string {
  return path.resolve(value);
}

export function isInsidePath(candidatePath: string, rootPath: string): boolean {
  const candidate = normalizePath(candidatePath);
  const root = normalizePath(rootPath);
  const relative = path.relative(root, candidate);
  return relative === "" || (relative.length > 0 && !relative.startsWith("..") && !path.isAbsolute(relative));
}

export function assertQuarantineOutputPath(candidatePath: string): string {
  const normalized = normalizePath(candidatePath);
  if (isInsidePath(normalized, RUNS_ROOT) || isInsidePath(normalized, REGISTRY_ROOT)) return normalized;
  const liveRoot = LIVE_GOVERNANCE_ROOTS.find((root) => isInsidePath(normalized, root));
  if (liveRoot) throw new Error(`Refusing output write inside live governance root: ${liveRoot}`);
  throw new Error(`Refusing output write outside Skill Lab quarantine or registry roots: ${normalized}`);
}

export function makeRunId(now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z").replace("T", "-");
  return `${stamp}-${crypto.randomBytes(4).toString("hex")}`;
}

export function defaultRunDir(runId = makeRunId()): string {
  return path.join(RUNS_ROOT, runId);
}
