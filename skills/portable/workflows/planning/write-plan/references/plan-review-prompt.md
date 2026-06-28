# Plan Review Prompt

Use this prompt after a draft implementation plan has been saved and before the plan is presented as approved or ready for execution.

Purpose: verify that the saved plan is complete, aligned with the approved spec, decomposed into executable units, and safe to hand to an implementer or execution workflow without hidden chat context.

```markdown
Review this implementation plan for execution readiness.

**Plan:** {ABSOLUTE_PLAN_PATH}
**Approved Spec:** {ABSOLUTE_SOURCE_PATH}
**Execution-Review Contract Location:** {PLAN_SECTION_OR_REFERENCED_CONTEXT_PATH}
**Primary Evidence Sources:** {REPO_FILES_DOCS_GRAPHRAG_FINDINGS_OR_RESEARCH_REFERENCES}

## Critical Rule

Do not trust the drafting summary. Inspect the saved plan itself and compare it against the saved approved spec, available evidence, and the write-plan quality checklist.

If no `approved-spec` artifact exists, stop and hand off to `write-spec` instead of reviewing the plan.

## What to Check

| Category | Blocking issue examples |
|---|---|
| Completeness | Missing required sections, TODO/TBD placeholders, incomplete task groups, missing steps, missing rollback for technical/destructive work |
| Spec alignment | Approved-spec requirement, scenario, success criterion, risk, non-goal, or constraint not covered by the plan; plan adds scope without rationale |
| Execution-review contract | Missing plan goal, source contract, execution scope, non-scope, dependency order, validation contract, or risk classes in the saved plan or referenced context file |
| W-question coverage | Missing task-level wer, was, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, or welche validation/review evidence for non-trivial task groups |
| Session state | Missing operational state, session rehydration, stale-review assessment, or handover evidence when prior sessions affect the next safe execution step |
| Autonomy control | Missing continuation, stop, handover, validation, or rollback conditions for autonomous execution or continuation |
| Task decomposition | Task groups have unclear boundaries, mix unrelated goals, skip prerequisite steps, or cannot be reviewed independently |
| Atomicity | Steps combine multiple actions, are too vague to execute, omit required file paths, or rely on hidden context |
| Buildability | A worker could not execute from the saved artifact alone, command sequence is contradictory, file ownership is unclear, or dependencies are unstated |
| Validation | Missing concrete validation command, missing expected outcome where needed, behavior changes not tied to tests/manual checks, no evidence path for completion claims |
| Delegation safety | Parallel-safe groups not identified, file-overlap constraints missing, task slices would conflict in subagent execution |
| Safety | Rollback, data/config/service/migration/port changes, security, compatibility, or performance risks are omitted or under-specified |

## Calibration

Plan review exists to prevent unsafe execution handoff, not to maximize artifact completeness.

`Status: Approved` means there are no blocking issues. Non-blocking recommendations may still be present.
`Status: Issues Found` means at least one blocking execution-readiness issue exists and must be fixed before handoff.

Block only when the next execution step would be unsafe, ambiguous, unverifiable, or likely wrong. Treat completeness, polish, preferred structure, optional robustness, wording improvements, extra decomposition, and nicer formatting as non-blocking when an implementer can still execute safely from the saved plan.

Risk-adjust strictness:
- Low risk: small brownfield fixes, docs, CLI/UI copy, and changes limited to a few stable files should rarely block unless scope, validation, or file ownership is genuinely unclear.
- Normal risk: multi-file behavior changes may block for missing required behavior, contradictory sequencing, hidden assumptions, or missing validation evidence.
- High risk: migrations, data changes, services, ports, security/auth, compatibility, destructive operations, and irreversible changes require concrete rollback, validation, and sequencing before execution readiness.

## Blocker Burden of Proof

Every blocking issue must state all five points:
1. the affected W-question or contract field;
2. the exact execution step that would be unsafe, ambiguous, unverifiable, or likely wrong;
3. the minimum missing fact or correction needed to make execution safe;
4. the evidence source for the finding;
5. why this is not merely polish, preference, optional completeness, or a non-blocking recommendation.

If a finding cannot satisfy this burden, put it under Non-Blocking Recommendations and approve the plan.

## Reviewer convergence contract

- No moving goalposts: judge against the approved spec, explicit execution-review contract, and this checklist only.
- Approve with non-blocking recommendations when the plan is safe enough to execute and remaining issues are polish, preference, or optional robustness.
- Do not convert recommendations into blockers in a later pass unless new inspected evidence shows concrete execution risk.
- If reviewing a revised plan, first check whether prior blocking issues were fixed; add new blockers only for newly introduced critical risk or previously uninspected required scope.
- A blocker must name the exact missing or contradictory execution fact, affected W-question or contract field, evidence source, and the minimum correction needed. If the minimum correction is optional, it is not a blocker.

Only block approval for issues that create real execution risk:

- missing required behavior from the approved spec
- contradictory sequencing
- placeholder content
- unclear file ownership or affected files
- task groups too vague for an implementer to act on
- validation gaps that make success impossible to judge
- missing rollback or mitigation for technical, destructive, service, data, migration, or port changes
- hidden assumptions from chat history
- unsafe delegation boundaries for a plan likely to be executed through subagents

Do not block approval for minor wording preferences, optional polish, or harmless formatting differences.

## Output Format

# Plan Review

**Status:** Approved | Issues Found

## Blocking Issues
- {task group, section, or line}: {specific issue}
  - Affected W-question or contract field: {wer/was/wo/wie/womit/wovon/wogegen/warum-wieso-weshalb/welche/execution contract/session state/autonomy}
  - unsafe execution step: {exact next execution step at risk}
  - minimum correction: {smallest correction needed}
  - Evidence source: {path, section, session, command, or URL}
  - Why blocking: {why this is not polish or optional completeness}

## Non-Blocking Recommendations
- {optional improvement}

## Approval Notes
- Reviewed saved plan path: {ABSOLUTE_PLAN_PATH}
- Reviewed approved spec path: {ABSOLUTE_SOURCE_PATH}
- Checklist source: `plan-quality-checks.md`
- Evidence inspected: {what evidence was inspected}
- W-question coverage assessment: {complete / sufficient with N/A markings / issues}
- Session-state assessment: {not relevant / sufficient / stale or missing evidence}
- Autonomy and stop-condition assessment: {not relevant / sufficient / issues}
- Execution-readiness rationale: {why the plan is now safe to hand to execution}
- Persistence requirement: copy or link this approval result into the plan's `Plan Review Status` section before execution handoff
```

If `Status: Issues Found`, the planning workflow must update the plan, rerun `plan-quality-checks.md`, and rerun this review prompt before handoff to execution.
