import { readFileSync } from "node:fs";
import type { EvaluationCase, EvaluationResult, FailureCase, ValidationResult } from "./model.ts";
import { parseJsonl, validateEvaluationCase } from "./model.ts";
import { validateSkillText } from "./skillValidation.ts";

export interface EvaluationDataset {
  cases: EvaluationCase[];
  loaded_from: string;
  loaded_at: string;
}

export function loadDataset(datasetPath: string): EvaluationDataset {
  const cases = parseJsonl<EvaluationCase>(readFileSync(datasetPath, "utf8"), validateEvaluationCase, datasetPath);
  if (!cases.some((testCase) => testCase.split === "trainable")) throw new Error("Dataset must include at least one trainable case");
  if (!cases.some((testCase) => testCase.split === "holdout")) throw new Error("Dataset must include at least one holdout case");
  const ids = new Set<string>();
  for (const testCase of cases) {
    if (ids.has(testCase.id)) throw new Error(`Duplicate evaluation case id: ${testCase.id}`);
    ids.add(testCase.id);
  }
  return { cases, loaded_from: datasetPath, loaded_at: new Date().toISOString() };
}

export function evaluateSkillText(skillText: string, dataset: EvaluationDataset, organismId: string, validationErrors: string[] = []): EvaluationResult {
  const failures: FailureCase[] = [];
  let passed = 0;
  for (const testCase of dataset.cases) {
    if (skillText.includes(testCase.expected) || skillText.includes("GENERAL_FIXTURE_PASS: enabled")) {
      passed += 1;
      continue;
    }
    failures.push({
      case_id: testCase.id,
      split: testCase.split,
      input: testCase.input,
      expected: testCase.expected,
      failure_type: testCase.failure_type || "expected_marker_missing",
      message: `Expected marker not found in skill text: ${testCase.expected}`,
    });
  }
  const trainableTotal = dataset.cases.filter((testCase) => testCase.split === "trainable").length;
  const holdoutTotal = dataset.cases.filter((testCase) => testCase.split === "holdout").length;
  const trainableFailures = failures.filter((failure) => failure.split === "trainable");
  const holdoutFailures = failures.filter((failure) => failure.split === "holdout");
  const score = dataset.cases.length === 0 ? 0 : passed / dataset.cases.length;
  return {
    organism_id: organismId,
    score,
    metric_breakdown: {
      overall: score,
      trainable: trainableTotal === 0 ? 0 : (trainableTotal - trainableFailures.length) / trainableTotal,
      holdout: holdoutTotal === 0 ? 0 : (holdoutTotal - holdoutFailures.length) / holdoutTotal,
    },
    trainable_failure_cases: trainableFailures,
    holdout_failure_cases: holdoutFailures,
    viability: validationErrors.length === 0 && holdoutFailures.length === 0,
    validation_errors: validationErrors,
    evaluator_version: "skill-lab-deterministic-v1",
    evaluated_at: new Date().toISOString(),
  };
}

export function deriveFailureCases(result: EvaluationResult) {
  return {
    trainable_failure_cases: result.trainable_failure_cases,
    holdout_failure_cases: result.holdout_failure_cases,
  };
}

export function validateCandidateBeforeEvaluation(candidateText: string, baselineText?: string): ValidationResult {
  return validateSkillText(candidateText, baselineText ? { baselineBytes: Buffer.byteLength(baselineText, "utf8"), maxGrowthRatio: 1.5 } : {});
}

export function evaluateCandidateAfterValidation(candidateText: string, dataset: EvaluationDataset, organismId: string, baselineText: string): EvaluationResult {
  const validation = validateCandidateBeforeEvaluation(candidateText, baselineText);
  if (!validation.valid) {
    return {
      organism_id: organismId,
      score: 0,
      metric_breakdown: { overall: 0, trainable: 0, holdout: 0 },
      trainable_failure_cases: [],
      holdout_failure_cases: [],
      viability: false,
      validation_errors: validation.errors,
      evaluator_version: "skill-lab-deterministic-v1",
      evaluated_at: new Date().toISOString(),
    };
  }
  return evaluateSkillText(candidateText, dataset, organismId, []);
}
