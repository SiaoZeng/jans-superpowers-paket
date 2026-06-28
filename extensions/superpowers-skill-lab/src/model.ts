export type TargetType = "skill" | "prompt" | "theme" | "extension" | "artifact";
export type EvaluationSplit = "trainable" | "holdout";
export type OrganismStatus = "baseline" | "candidate" | "staged" | "rejected" | "failed" | "aborted";
export type PatternStatus = "reference-only" | "spec-derived-pattern" | "rejected" | "candidate";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface EvolutionTarget {
  target_type: TargetType;
  absolute_path: string;
  sha256: string;
  content: string;
  read_at: string;
}

export interface Organism {
  organism_id: string;
  parent_id: string | null;
  additional_parent_ids: string[];
  target_fingerprint: string;
  candidate_content_path: string | null;
  candidate_diff_path: string | null;
  source_failure_case_ids: string[];
  source_learning_log_ids: string[];
  status: OrganismStatus;
  change_summary: string;
}

export interface EvaluationCase {
  id: string;
  split: EvaluationSplit;
  input: string;
  expected: string;
  category: string;
  difficulty: string;
  source: string;
  failure_type?: string;
}

export interface FailureCase {
  case_id: string;
  split: EvaluationSplit;
  input: string;
  expected: string;
  failure_type: string;
  message: string;
}

export interface EvaluationResult {
  organism_id: string;
  score: number;
  metric_breakdown: Record<string, number>;
  trainable_failure_cases: FailureCase[];
  holdout_failure_cases: FailureCase[];
  viability: boolean;
  validation_errors: string[];
  evaluator_version: string;
  evaluated_at: string;
}

export interface LearningLogEntry {
  log_id: string;
  organism_id: string;
  created_at: string;
  summary: string;
  outcome: string;
}

export interface SkillLabRun {
  run_id: string;
  run_dir: string;
  status: "created" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  target_sha256: string;
  mutator: string;
  tool_version: string;
}

export interface ExternalPattern {
  name: string;
  source_url: string;
  retrieval_date: string;
  source_revision: string | null;
  license: string;
  status: PatternStatus;
  extracted_concepts: string[];
  rejected_concepts: string[];
  omp_native_mapping: string;
  materialization_policy: string;
}

export function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

export function invalid(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string, errors: string[]) {
  if (typeof record[key] !== "string" || String(record[key]).trim() === "") errors.push(`${key} must be a non-empty string`);
}

function requireStringArray(record: Record<string, unknown>, key: string, errors: string[]) {
  if (!Array.isArray(record[key]) || !(record[key] as unknown[]).every((item) => typeof item === "string" && item.trim() !== "")) {
    errors.push(`${key} must be a non-empty string array`);
  }
}

export function validateEvolutionTarget(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return invalid(["EvolutionTarget must be an object"]);
  for (const key of ["target_type", "absolute_path", "sha256", "content", "read_at"]) requireString(value, key, errors);
  if (typeof value.target_type === "string" && !["skill", "prompt", "theme", "extension", "artifact"].includes(value.target_type)) errors.push("target_type is unsupported");
  if (typeof value.sha256 === "string" && !/^[a-f0-9]{64}$/.test(value.sha256)) errors.push("sha256 must be a lowercase SHA-256 hex digest");
  return invalid(errors);
}

export function validateOrganism(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return invalid(["Organism must be an object"]);
  for (const key of ["organism_id", "target_fingerprint", "status", "change_summary"]) requireString(value, key, errors);
  requireStringArray(value, "additional_parent_ids", errors);
  requireStringArray(value, "source_failure_case_ids", errors);
  requireStringArray(value, "source_learning_log_ids", errors);
  if (!(typeof value.parent_id === "string" || value.parent_id === null)) errors.push("parent_id must be a string or null");
  if (!(typeof value.candidate_content_path === "string" || value.candidate_content_path === null)) errors.push("candidate_content_path must be a string or null");
  if (!(typeof value.candidate_diff_path === "string" || value.candidate_diff_path === null)) errors.push("candidate_diff_path must be a string or null");
  if (typeof value.status === "string" && !["baseline", "candidate", "staged", "rejected", "failed", "aborted"].includes(value.status)) errors.push("status is unsupported");
  return invalid(errors);
}

export function validateEvaluationCase(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return invalid(["EvaluationCase must be an object"]);
  for (const key of ["id", "split", "input", "expected", "category", "difficulty", "source"]) requireString(value, key, errors);
  if (typeof value.split === "string" && !["trainable", "holdout"].includes(value.split)) errors.push("split must be trainable or holdout");
  if (value.failure_type !== undefined && typeof value.failure_type !== "string") errors.push("failure_type must be a string when provided");
  return invalid(errors);
}

export function validateEvaluationResult(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return invalid(["EvaluationResult must be an object"]);
  for (const key of ["organism_id", "evaluator_version", "evaluated_at"]) requireString(value, key, errors);
  if (typeof value.score !== "number" || value.score < 0 || value.score > 1) errors.push("score must be a number between 0 and 1");
  if (!isObject(value.metric_breakdown)) errors.push("metric_breakdown must be an object");
  if (!Array.isArray(value.trainable_failure_cases)) errors.push("trainable_failure_cases must be an array");
  if (!Array.isArray(value.holdout_failure_cases)) errors.push("holdout_failure_cases must be an array");
  if (typeof value.viability !== "boolean") errors.push("viability must be boolean");
  if (!Array.isArray(value.validation_errors)) errors.push("validation_errors must be an array");
  return invalid(errors);
}

export function validateExternalPattern(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObject(value)) return invalid(["ExternalPattern must be an object"]);
  for (const key of ["name", "source_url", "retrieval_date", "license", "status", "omp_native_mapping", "materialization_policy"]) requireString(value, key, errors);
  if (!(typeof value.source_revision === "string" || value.source_revision === null)) errors.push("source_revision must be a string or null");
  requireStringArray(value, "extracted_concepts", errors);
  requireStringArray(value, "rejected_concepts", errors);
  if (typeof value.status === "string" && !["reference-only", "spec-derived-pattern", "rejected", "candidate"].includes(value.status)) errors.push("status is unsupported");
  return invalid(errors);
}

export function parseJson<T>(text: string, validator: (value: unknown) => ValidationResult, source: string): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`${source}: malformed JSON: ${(error as Error).message}`);
  }
  const result = validator(parsed);
  if (!result.valid) throw new Error(`${source}: invalid JSON record: ${result.errors.join("; ")}`);
  return parsed as T;
}

export function parseJsonl<T>(text: string, validator: (value: unknown) => ValidationResult, source: string): T[] {
  const records: T[] = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    if (line.trim() === "") continue;
    records.push(parseJson<T>(line, validator, `${source}:${index + 1}`));
  }
  return records;
}

export function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function stringifyJsonl(values: unknown[]): string {
  return values.map((value) => JSON.stringify(value)).join("\n") + (values.length > 0 ? "\n" : "");
}
