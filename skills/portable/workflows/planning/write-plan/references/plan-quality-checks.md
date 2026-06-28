# Plan Quality Checks

Read this file before saving a drafted plan and again before execution handoff.

Use Section Checks, Content Checks, and Save Checks before saving the first draft.
Use Review Gate Checks only after the plan has been saved and reviewed.

## Section Checks

Verify that the plan contains:

- [ ] Top-level Status
- [ ] Plan Review Status
- [ ] Goal
- [ ] Architecture Summary
- [ ] Technical Context when architecture choices matter
- [ ] Input Artifacts
- [ ] Operational State when prior sessions, handovers, reviews, worktrees, or execution state may affect execution
- [ ] Session Rehydration when recent session state matters, or explicit `N/A`
- [ ] File Map
- [ ] Spec Coverage Map
- [ ] Validation Coverage Map
- [ ] Validation Evidence and Review Evidence when meaningful behavior or governance changes are planned
- [ ] Execution-Review Contract or equivalent explicit plan metadata
- [ ] Autonomy Contract and Stop Conditions when autonomous continuation or execution handoff is possible
- [ ] Execution Mode Recommendation
- [ ] At least one Task Group
- [ ] Validation Strategy
- [ ] Rollback Plan for technical or destructive work
- [ ] Open Questions
- [ ] References

## Content Checks

Verify all of the following:

- [ ] The plan is based on an `approved-spec` artifact
- [ ] The `approved-spec` artifact is referenced explicitly in Input Artifacts
- [ ] Every action step is atomic
- [ ] Every action step uses `- [ ]`
- [ ] All file paths are absolute
- [ ] Every affected file is listed individually in the file map or task groups
- [ ] Task groups have clear goals and boundaries
- [ ] Task groups include Task W-Question Matrix for non-trivial work or explicit `N/A — reason`
- [ ] Task W-Question Matrix covers wer, was, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche validation or review evidence
- [ ] Task groups are marked sequential or parallel-safe when delegation or parallel execution may be used
- [ ] Task groups state delegation readiness and file-overlap constraints when subagents or parallelism may be used
- [ ] Execution Mode Recommendation includes Direct TDD single-slice, Controlled inline execution, Subagent-driven development, Parallel agent development, and Isolated workspace first
- [ ] Execution Mode Recommendation states that TDD is used inside delegated or parallel workers for behavior-changing slices, not treated as mutually exclusive with those controllers
- [ ] File-overlap constraints and dependencies are explicit
- [ ] Every relevant spec requirement, scenario, or success criterion maps to one or more task groups
- [ ] Every meaningful behavior change maps to an automated or manual validation check
- [ ] Validation Evidence separates command/manual proof from review evidence
- [ ] Review Evidence records reviewer type, scope, status, and blocking issues fixed when review is required
- [ ] Session-state alignment is explicit when the plan continues prior work or references handovers
- [ ] Validation commands are concrete
- [ ] Expected outcomes are stated where they reduce ambiguity
- [ ] Commit boundaries are explicit where commits are part of the workflow
- [ ] TDD-style sequencing is used when the change is testable
- [ ] No placeholders remain, including `TODO`, `TBD`, `similar to above`, `implement later`, or vague phrases like `add validation`
- [ ] No vague phrases remain, including `etc.`, `analog`, `similar changes`, `and so on`, or `restliche Dateien`
- [ ] The plan does not rely on hidden assumptions from chat history
- [ ] A worker can execute the plan from the saved artifact without reading the chat transcript
- [ ] Open questions are non-blocking, or the plan is not presented as execution-ready
- [ ] Autonomy continuation, stop, and handover conditions are explicit when the plan may be executed autonomously
- [ ] Stale review risk is assessed when the plan relies on prior review artifacts
- [ ] `~/PORTS.md` is included when ports change
- [ ] Rollback is concrete for config, service, migration, data, port, or destructive work
- [ ] Known risks are paired with concrete mitigations or explicit blocking questions

## Save Checks

- [ ] Use the user-specified path when the user explicitly requested one
- [ ] Otherwise save as sibling `plan.md` when a spec-kit-style feature directory already exists
- [ ] Otherwise save to an existing repo-local plan directory if present
- [ ] Otherwise save to repo-local `plans/`
- [ ] Otherwise save to repo-local `docs/plans/`
- [ ] If the user-specified path conflicts with repo convention, clarify before saving or document the deviation
- [ ] If no naming convention exists, use `YYYY-MM-DD-{topic}-implementation-plan.md`

## Review Gate Checks

Before calling a saved plan `approved-plan` or ready for execution:

- [ ] Read `plan-review-prompt.md`
- [ ] Review the saved plan artifact against the saved `approved-spec`, not only the drafting summary
- [ ] Use an independent reviewer subagent when available; otherwise record that the review was a second-pass self-review
- [ ] Fix every blocking review issue in the plan
- [ ] Each blocking review issue satisfies the W-question/evidence blocker burden: affected W-question or contract field, unsafe execution step, minimum correction, evidence source, and why it is not polish
- [ ] Do not revise solely for non-blocking recommendations
- [ ] Rerun Section Checks, Content Checks, and Save Checks after fixes
- [ ] Rerun plan review until it returns `Status: Approved`, or stop after two unresolved blocking-review iterations and report the blockers
- [ ] Treat `Status: Approved` or an equivalent ready decision with only non-blocking recommendations as approval
- [ ] Top-level status is `Approved` and Plan Review Status records reviewer type, review date, cumulative blocking issues fixed, review artifact or inline approval notes, and approval rationale
- [ ] Only hand off to execution after review approval
- [ ] Approved review result is persisted in the saved plan or linked adjacent review artifact
- [ ] Final response includes saved plan path, review status, reviewer type, cumulative blocking issues fixed count, recommended execution mode, all available execution choices, and next handoff only when the user already selected or explicitly authorized a mode

## Final Standard

Only present the plan as ready when it is execution-ready, explicit, reviewed, and safe to hand off without hidden assumptions.
