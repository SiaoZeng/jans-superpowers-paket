# Spec Review Prompt

Use this prompt after a draft spec has been saved and before the spec is presented as approved or ready for planning.

Purpose: verify that the saved spec is complete, internally consistent, scoped, evidence-backed where needed, and implementation-planning-ready.

```markdown
Review this spec for planning readiness.

**Spec:** {ABSOLUTE_SPEC_PATH}
**Original Request / Intent:** {REQUEST_SUMMARY_OR_CONTEXT_PATH}
**Review Contract Location:** {SPEC_SECTION_OR_REFERENCED_CONTEXT_PATH}
**Primary Evidence Sources:** {FILES_DOCS_GRAPHRAG_FINDINGS_OR_RESEARCH_REFERENCES}

## Critical Rule

Do not trust the drafting summary. Inspect the saved spec itself and compare it against the request, available evidence, and the write-spec quality checklist.

## What to Check

| Category | Blocking issue examples |
|---|---|
| Completeness | Missing required sections, TODO/TBD placeholders, unresolved open questions that block planning, missing affected files, missing tests, missing rollback for technical/destructive work |
| Scope fidelity | Spec expands beyond the request without rationale, omits requested behavior, mixes independent initiatives into one spec, hides non-goals |
| Evidence and assumptions | Claims not supported by listed evidence, assumptions that should be clarified, research findings without references, GraphRAG or repo context not carried forward when used |
| W-question coverage | Missing relevant wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, or welche evidence questions, or irrelevant entries omitted instead of marked `N/A — reason` |
| Session evidence | Missing session, handover, aborted-turn, stale-review, or continuation-state evidence when prior work state affects planning; treating session claims as automatic truth without corroboration |
| Evidence-to-claim | Substantive design, scope, risk, or handoff claims cannot be traced to local files, sessions, GraphRAG findings, URLs, user constraints, or explicit assumptions |
| Review contract | Missing review goal, scope, non-scope, success criteria, risk classes, session-derived state, or primary evidence sources in the saved spec or a referenced context file |
| Clarity | Requirements ambiguous enough that implementers could build different things, undefined terms, vague phrases such as `etc.`, `analog`, `similar changes`, `and so on`, or `restliche Dateien` |
| Traceability | Requirements cannot be mapped to acceptance scenarios, success criteria, testing, affected files, or explicit non-goals |
| Buildability | A planner could not derive concrete tasks without hidden chat context, missing dependency order, missing migration/service/config/port constraints |
| Safety | Risks, rollback, destructive operations, data changes, security, compatibility, or port registry impacts are omitted or under-specified |

## Calibration

Spec review exists to prevent unsafe planning handoff, not to maximize artifact completeness.

`Status: Approved` means there are no blocking issues. Non-blocking recommendations may still be present.
`Status: Issues Found` means at least one blocking planning-readiness issue exists and must be fixed before handoff.

Block only when the next planning step would be unsafe, ambiguous, unverifiable, or likely wrong. Treat completeness, polish, preferred structure, optional robustness, wording improvements, extra examples, and nicer formatting as non-blocking when a planner can still derive a safe plan from the saved spec.

Risk-adjust strictness:
- Low risk: small brownfield fixes, docs, CLI/UI copy, and changes limited to a few stable files should rarely block unless scope, validation, or file ownership is genuinely unclear.
- Normal risk: multi-file behavior changes may block for missing required behavior, hidden assumptions, unclear affected files, or missing validation signals.
- High risk: migrations, data changes, services, ports, security/auth, compatibility, destructive operations, and irreversible changes require concrete rollback, validation, and sequencing facts before planning readiness.

## Blocker Burden of Proof

Every blocking issue must state all five points:
1. the affected W-question or contract field;
2. the exact planning step that would be unsafe, ambiguous, unverifiable, or likely wrong;
3. the minimum missing fact or correction needed to make planning safe;
4. the evidence source for the finding;
5. why this is not merely polish, preference, optional completeness, or a non-blocking recommendation.

If a finding cannot satisfy this burden, put it under Non-Blocking Recommendations and approve the spec.

## Reviewer convergence contract

- No moving goalposts: judge against the original request, explicit review contract, and this checklist only.
- Approve with non-blocking recommendations when the spec is safe enough to plan from and remaining issues are polish, preference, or optional robustness.
- Do not convert recommendations into blockers in a later pass unless new inspected evidence shows concrete planning or implementation risk.
- If reviewing a revised spec, first check whether prior blocking issues were fixed; add new blockers only for newly introduced critical risk or previously uninspected required scope.
- A blocker must name the exact missing or contradictory planning fact, the affected W-question or contract field, the evidence source, and the minimum correction needed. If the minimum correction is optional, it is not a blocker.

Only block approval for issues that create real planning or implementation risk:

- missing required behavior
- contradictory requirements
- hidden assumptions
- scope drift
- placeholder content
- unclear ownership of affected files or tests
- validation gaps that make success impossible to judge
- rollback or safety gaps for technical, destructive, service, data, migration, or port changes

Do not block approval for minor wording preferences, optional polish, or harmless formatting differences.

## Output Format

# Spec Review

**Status:** Approved | Issues Found

## Blocking Issues
- {section or line}: {specific issue}
  - Affected W-question or contract field: {wer/was/wann/wo/wie/womit/wovon/wogegen/warum-wieso-weshalb/welche/review contract/evidence/session state}
  - unsafe planning step: {exact next planning step at risk}
  - minimum correction: {smallest correction needed}
  - Evidence source: {path, section, session, command, or URL}
  - Why blocking: {why this is not polish or optional completeness}

## Non-Blocking Recommendations
- {optional improvement}

## Approval Notes
- Reviewed saved spec path: {ABSOLUTE_SPEC_PATH}
- Checklist source: `spec-quality-checks.md`
- Evidence inspected: {what evidence was inspected}
- W-question coverage assessment: {complete / sufficient with N/A markings / issues}
- Session-state assessment: {not relevant / sufficient / stale or missing evidence}
- Evidence-to-claim assessment: {sufficient / issues}
- Planning-readiness rationale: {why the spec is now safe to hand to planning}
- Persistence requirement: copy or link this approval result into the spec's `Spec Review Status` section before planning handoff
```

If `Status: Issues Found`, the drafting workflow must update the spec, rerun `spec-quality-checks.md`, and rerun this review prompt before handoff to `write-plan`.
