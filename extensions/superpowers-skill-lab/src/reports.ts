import type { EvaluationResult, Organism, SkillLabRun } from "./model.ts";

export function generateUnifiedDiff(before: string, after: string, fromFile = "baseline/SKILL.md", toFile = "candidate/SKILL.md"): string {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const lines = [`--- ${fromFile}`, `+++ ${toFile}`];
  const max = Math.max(beforeLines.length, afterLines.length);
  for (let index = 0; index < max; index++) {
    const oldLine = beforeLines[index];
    const newLine = afterLines[index];
    if (oldLine === newLine) {
      if (oldLine !== undefined) lines.push(` ${oldLine}`);
      continue;
    }
    if (oldLine !== undefined) lines.push(`-${oldLine}`);
    if (newLine !== undefined) lines.push(`+${newLine}`);
  }
  return `${lines.join("\n")}\n`;
}

export function generateScorecard(run: SkillLabRun, baseline: EvaluationResult, candidate: EvaluationResult, organism: Organism): string {
  return `# Skill Lab Scorecard\n\n` +
    `- Run ID: ${run.run_id}\n` +
    `- Mutator: ${run.mutator}\n` +
    `- Candidate status: ${organism.status}\n` +
    `- Baseline score: ${baseline.score.toFixed(3)}\n` +
    `- Candidate score: ${candidate.score.toFixed(3)}\n` +
    `- Baseline trainable: ${baseline.metric_breakdown.trainable.toFixed(3)}\n` +
    `- Baseline holdout: ${baseline.metric_breakdown.holdout.toFixed(3)}\n` +
    `- Candidate trainable: ${candidate.metric_breakdown.trainable.toFixed(3)}\n` +
    `- Candidate holdout: ${candidate.metric_breakdown.holdout.toFixed(3)}\n` +
    `- Validation errors: ${candidate.validation_errors.length === 0 ? "none" : candidate.validation_errors.join("; ")}\n` +
    `\n## Safety Notice\n\nNo live skill was modified. All candidate artifacts remain quarantined under ${run.run_dir}.\n`;
}

export function generatePromotionReport(run: SkillLabRun, organism: Organism): string {
  return `# Skill Lab Promotion Report\n\n` +
    `- Run ID: ${run.run_id}\n` +
    `- Candidate organism: ${organism.organism_id}\n` +
    `- Candidate status: ${organism.status}\n` +
    `\n## Required Manual Gates\n\n` +
    `- Create a timestamped backup before any live governance-root write.\n` +
    `- Obtain explicit Governor authorization for the intended live target path.\n` +
    `- Review the scorecard, diff, target fingerprint, and candidate content manually.\n` +
    `- Apply promotion only through a separate approved workflow; Phase 1 does not promote.\n` +
    `- Run /governor-reload or /reload after any authorized live promotion.\n` +
    `\n## Safety Notice\n\nNo live skill was modified by this Skill Lab run.\n`;
}
