import type { EvolutionTarget, FailureCase, LearningLogEntry, Organism } from "./model.ts";
import { REGISTRY_ROOT, RUNS_ROOT } from "./paths.ts";

export type MutatorName = "noop" | "fixture-passing" | "fixture-failing";

export interface MutatorInput {
  target: Pick<EvolutionTarget, "target_type" | "absolute_path" | "sha256" | "content">;
  parent: Pick<Organism, "organism_id" | "target_fingerprint" | "status" | "change_summary">;
  trainable_failure_cases: FailureCase[];
  learning_log_summaries: string[];
  budget: {
    max_candidate_bytes: number;
    max_growth_ratio: number;
    max_failure_cases: number;
  };
  policy: {
    holdout_visible: false;
    live_write_allowed: false;
    allowed_output_roots: string[];
  };
}

export interface MutatorOutput {
  content: string;
  change_summary: string;
  source_failure_case_ids: string[];
  source_learning_log_ids: string[];
}

export interface BuildMutatorInputOptions {
  target: EvolutionTarget;
  parent: Organism;
  trainableFailureCases: FailureCase[];
  holdoutFailureCases: FailureCase[];
  learningLog: LearningLogEntry[];
}

export function buildMutatorInput(options: BuildMutatorInputOptions): MutatorInput {
  if (options.trainableFailureCases.some((failure) => failure.split !== "trainable")) {
    throw new Error("Mutator input may only include trainable failure cases");
  }
  if (options.holdoutFailureCases.length > 0) {
    throw new Error("Holdout failure cases are evaluator-only and must not be provided to mutators");
  }
  return {
    target: {
      target_type: options.target.target_type,
      absolute_path: options.target.absolute_path,
      sha256: options.target.sha256,
      content: options.target.content,
    },
    parent: {
      organism_id: options.parent.organism_id,
      target_fingerprint: options.parent.target_fingerprint,
      status: options.parent.status,
      change_summary: options.parent.change_summary,
    },
    trainable_failure_cases: options.trainableFailureCases.slice(0, 20),
    learning_log_summaries: options.learningLog.slice(-20).map((entry) => `${entry.log_id}: ${entry.summary} => ${entry.outcome}`),
    budget: {
      max_candidate_bytes: Math.max(Buffer.byteLength(options.target.content, "utf8") * 1.5, Buffer.byteLength(options.target.content, "utf8") + 1024),
      max_growth_ratio: 1.5,
      max_failure_cases: 20,
    },
    policy: {
      holdout_visible: false,
      live_write_allowed: false,
      allowed_output_roots: [RUNS_ROOT, REGISTRY_ROOT],
    },
  };
}

export async function noopMutator(input: MutatorInput): Promise<MutatorOutput> {
  return {
    content: input.target.content,
    change_summary: "No-op mutator returned parent content unchanged.",
    source_failure_case_ids: input.trainable_failure_cases.map((failure) => failure.case_id),
    source_learning_log_ids: [],
  };
}

export async function fixturePassingMutator(input: MutatorInput): Promise<MutatorOutput> {
  let content = input.target.content;
  if (!content.includes("TRAIN_MARKER: alpha")) content += "\n- TRAIN_MARKER: alpha\n";
  if (!content.includes("GENERAL_FIXTURE_PASS: enabled")) content += "\n- GENERAL_FIXTURE_PASS: enabled\n";
  if (!content.includes("## Procedure")) content += "\n## Procedure\n\n1. Preserve deterministic fixture methodology.\n";
  return {
    content,
    change_summary: "Deterministic fixture mutator enabled the generic fixture capability without using holdout payloads.",
    source_failure_case_ids: input.trainable_failure_cases.map((failure) => failure.case_id),
    source_learning_log_ids: [],
  };
}

export async function fixtureFailingMutator(input: MutatorInput): Promise<MutatorOutput> {
  let content = input.target.content;
  content = content.replace(/- GENERAL_FIXTURE_PASS: enabled\n?/g, "");
  if (!content.includes("TRAIN_MARKER: alpha")) content += "\n- TRAIN_MARKER: alpha\n";
  return {
    content,
    change_summary: "Deterministic failing fixture mutator removes the generic fixture-pass marker while keeping a valid skill structure.",
    source_failure_case_ids: input.trainable_failure_cases.map((failure) => failure.case_id),
    source_learning_log_ids: [],
  };
}

export async function runMutator(name: MutatorName, input: MutatorInput): Promise<MutatorOutput> {
  if (name === "noop") return noopMutator(input);
  if (name === "fixture-passing") return fixturePassingMutator(input);
  if (name === "fixture-failing") return fixtureFailingMutator(input);
  throw new Error(`Unsupported mutator: ${name}`);
}
