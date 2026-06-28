import * as crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import type { EvaluationResult, EvolutionTarget, LearningLogEntry, Organism, SkillLabRun } from "./model.ts";
import { stringifyJson, stringifyJsonl } from "./model.ts";
import { deriveFailureCases, evaluateCandidateAfterValidation, evaluateSkillText, loadDataset, validateCandidateBeforeEvaluation } from "./evaluator.ts";
import { buildMutatorInput, runMutator, type MutatorName } from "./mutators.ts";
import { assertQuarantineOutputPath, defaultRunDir, makeRunId, RUNS_ROOT } from "./paths.ts";
import { generatePromotionReport, generateScorecard, generateUnifiedDiff } from "./reports.ts";
import { validateSkillText } from "./skillValidation.ts";

export interface RunSkillLabOptions {
  targetPath: string;
  datasetPath: string;
  mutator: MutatorName;
}

export interface RunSkillLabResult {
  run: SkillLabRun;
  target: EvolutionTarget;
  baseline: Organism;
  candidate: Organism;
  baseline_result: EvaluationResult;
  candidate_result: EvaluationResult;
}

export function sha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export function captureTarget(targetPath: string): EvolutionTarget {
  const absolute = path.resolve(targetPath);
  const content = readFileSync(absolute, "utf8");
  return {
    target_type: path.basename(absolute) === "SKILL.md" ? "skill" : "artifact",
    absolute_path: absolute,
    sha256: sha256(content),
    content,
    read_at: new Date().toISOString(),
  };
}

function ensureRunRoot() {
  mkdirSync(RUNS_ROOT, { recursive: true });
}

function writeQuarantined(filePath: string, content: string) {
  const safePath = assertQuarantineOutputPath(filePath);
  mkdirSync(path.dirname(safePath), { recursive: true });
  writeFileSync(safePath, content, "utf8");
}

export async function runSkillLab(options: RunSkillLabOptions): Promise<RunSkillLabResult> {
  ensureRunRoot();
  const runId = makeRunId();
  const runDir = defaultRunDir(runId);
  assertQuarantineOutputPath(path.join(runDir, "run.json"));
  mkdirSync(path.join(runDir, "baseline"), { recursive: true });
  mkdirSync(path.join(runDir, "candidates"), { recursive: true });

  const target = captureTarget(options.targetPath);
  const targetValidation = validateSkillText(target.content);
  if (!targetValidation.valid) throw new Error(`Target validation failed: ${targetValidation.errors.join("; ")}`);
  const dataset = loadDataset(options.datasetPath);

  const run: SkillLabRun = {
    run_id: runId,
    run_dir: runDir,
    status: "created",
    started_at: new Date().toISOString(),
    target_sha256: target.sha256,
    mutator: options.mutator,
    tool_version: "superpowers-skill-lab-phase1",
  };

  const baseline: Organism = {
    organism_id: "baseline",
    parent_id: null,
    additional_parent_ids: [],
    target_fingerprint: target.sha256,
    candidate_content_path: path.join(runDir, "baseline", "SKILL.md"),
    candidate_diff_path: null,
    source_failure_case_ids: [],
    source_learning_log_ids: [],
    status: "baseline",
    change_summary: "Captured immutable baseline target.",
  };
  const baselineResult = evaluateSkillText(target.content, dataset, baseline.organism_id);
  const baselineFailures = deriveFailureCases(baselineResult);
  const mutatorInput = buildMutatorInput({
    target,
    parent: baseline,
    trainableFailureCases: baselineFailures.trainable_failure_cases,
    holdoutFailureCases: [],
    learningLog: [],
  });

  const mutatorOutput = await runMutator(options.mutator, mutatorInput);
  const candidateId = `candidate-${crypto.randomBytes(3).toString("hex")}`;
  const candidateDir = path.join(runDir, "candidates", candidateId);
  const candidateContentPath = path.join(candidateDir, "SKILL.md");
  const candidateDiffPath = path.join(candidateDir, "candidate.diff");
  const candidateValidation = validateCandidateBeforeEvaluation(mutatorOutput.content, target.content);
  const candidateResult = evaluateCandidateAfterValidation(mutatorOutput.content, dataset, candidateId, target.content);
  const candidateStatus = candidateValidation.valid && candidateResult.metric_breakdown.holdout >= baselineResult.metric_breakdown.holdout && candidateResult.score >= baselineResult.score ? "staged" : "rejected";
  const candidate: Organism = {
    organism_id: candidateId,
    parent_id: baseline.organism_id,
    additional_parent_ids: [],
    target_fingerprint: target.sha256,
    candidate_content_path: candidateContentPath,
    candidate_diff_path: candidateDiffPath,
    source_failure_case_ids: mutatorOutput.source_failure_case_ids,
    source_learning_log_ids: mutatorOutput.source_learning_log_ids,
    status: candidateStatus,
    change_summary: mutatorOutput.change_summary,
  };
  const learningLog: LearningLogEntry[] = [{
    log_id: `log-${candidateId}`,
    organism_id: candidateId,
    created_at: new Date().toISOString(),
    summary: mutatorOutput.change_summary,
    outcome: candidateStatus,
  }];

  const diff = generateUnifiedDiff(target.content, mutatorOutput.content, "baseline/SKILL.md", `candidates/${candidateId}/SKILL.md`);
  writeQuarantined(path.join(runDir, "run.json"), stringifyJson(run));
  writeQuarantined(path.join(runDir, "config.json"), stringifyJson({ targetPath: path.resolve(options.targetPath), datasetPath: path.resolve(options.datasetPath), mutator: options.mutator, live_write_allowed: false }));
  writeQuarantined(path.join(runDir, "target.json"), stringifyJson(target));
  writeQuarantined(path.join(runDir, "dataset.json"), stringifyJson(dataset));
  writeQuarantined(path.join(runDir, "organisms.jsonl"), stringifyJsonl([baseline, candidate]));
  writeQuarantined(path.join(runDir, "evaluation-results.jsonl"), stringifyJsonl([baselineResult, candidateResult]));
  writeQuarantined(path.join(runDir, "learning-log.jsonl"), stringifyJsonl(learningLog));
  writeQuarantined(path.join(runDir, "baseline", "SKILL.md"), target.content);
  writeQuarantined(candidateContentPath, mutatorOutput.content);
  writeQuarantined(candidateDiffPath, diff);
  writeQuarantined(path.join(runDir, "candidate.diff"), diff);
  writeQuarantined(path.join(runDir, "scorecard.md"), generateScorecard(run, baselineResult, candidateResult, candidate));
  if (candidate.status === "staged") writeQuarantined(path.join(runDir, "promotion.md"), generatePromotionReport(run, candidate));
  run.status = "completed";
  run.completed_at = new Date().toISOString();
  writeQuarantined(path.join(runDir, "run.json"), stringifyJson(run));

  return { run, target, baseline, candidate, baseline_result: baselineResult, candidate_result: candidateResult };
}
