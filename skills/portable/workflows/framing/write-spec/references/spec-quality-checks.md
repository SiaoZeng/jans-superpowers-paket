# Spec Quality Checks

Read this file before saving a drafted spec and again before planning handoff.

Use Section Checks, Content Checks, and Save Checks before saving the first draft.
Use Review Gate Checks only after the spec has been saved and reviewed.

## Section Checks

### Mini Spec

Verify that the draft contains:

- [ ] Top-level Status
- [ ] Spec Review Status
- [ ] Problem
- [ ] Proposed Change
- [ ] Goals
- [ ] Non-Goals
- [ ] Acceptance Scenarios
- [ ] W-Question Coverage Map when non-trivial, session-derived, autonomous, review-heavy, or explicitly requested
- [ ] Evidence Ledger when claims depend on local files, sessions, GraphRAG, research, or user constraints
- [ ] Decision Ledger when alternatives, boundaries, or handoffs materially affect the design
- [ ] Session Evidence when recent sessions, handovers, aborted turns, stale reviews, or continuation state matter
- [ ] Success Criteria
- [ ] Assumptions
- [ ] Affected Files
- [ ] Delivery Notes when implementation constraints or sequencing details matter
- [ ] Testing
- [ ] Rollback
- [ ] Open Questions
- [ ] References

### Full Spec

Verify that the draft contains:

- [ ] Top-level Status
- [ ] Spec Review Status
- [ ] Context and Scope
- [ ] User Scenarios and Testing
- [ ] Edge Cases
- [ ] Goals
- [ ] Non-Goals
- [ ] Requirements
- [ ] Success Criteria
- [ ] W-Question Coverage Map
- [ ] Evidence Ledger
- [ ] Decision Ledger when alternatives, boundaries, or handoffs materially affect the design
- [ ] Session Evidence when recent sessions, handovers, aborted turns, stale reviews, or continuation state matter
- [ ] Assumptions
- [ ] Key Entities when data is involved
- [ ] Design
- [ ] Alternatives Considered
- [ ] Research Findings when research influenced the design
- [ ] Technical Context when architecture choices matter
- [ ] Affected Files
- [ ] Delivery Notes when implementation constraints or sequencing details matter
- [ ] Testing
- [ ] Risks and Mitigations
- [ ] Rollback Plan
- [ ] Open Questions
- [ ] References

## Content Checks

Verify all of the following:

- [ ] The chosen spec size matches the actual task risk and scope
- [ ] All affected file paths are absolute
- [ ] Every affected file is listed individually
- [ ] Goals are explicit
- [ ] Non-goals are explicit
- [ ] Acceptance scenarios are concrete when behavior matters
- [ ] Success criteria are measurable whenever possible
- [ ] Assumptions are explicit instead of guessed silently
- [ ] Testing is concrete rather than generic
- [ ] Rollback is concrete for technical or destructive work
- [ ] Research references are cited when research influenced the design
- [ ] Session evidence is cited when recent sessions, handovers, aborted turns, stale reviews, or continuation state influenced the design
- [ ] Evidence Ledger maps substantive claims to local files, sessions, GraphRAG findings, URLs, user constraints, or explicit `N/A`
- [ ] W-Question Coverage Map answers wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence or marks irrelevant entries as `N/A — reason`
- [ ] Decision Ledger records chosen direction, meaningful rejected alternatives, evidence, and revisit condition when alternatives or handoffs matter
- [ ] Session Evidence distinguishes completed state from aborted turns, tool failures, stale reviews, and planned-but-not-executed work
- [ ] `~/PORTS.md` is included when ports change
- [ ] No vague phrases remain, including `etc.`, `analog`, `similar changes`, `and so on`, or `restliche Dateien`
- [ ] The spec separates stable user intent from later implementation detail
- [ ] Delivery Notes do not turn the spec into an execution plan
- [ ] Brainstorming outputs are carried forward or referenced when that workflow preceded the spec
- [ ] The spec does not rely on hidden assumptions from chat history
- [ ] No TODO, TBD, placeholder, or unresolved template text remains unless it is an explicit non-blocking open question
- [ ] Each requirement maps to at least one acceptance scenario, success criterion, test, affected file, or explicit non-goal
- [ ] A planner can derive tasks from the spec without reading the chat transcript
- [ ] Known risks are paired with concrete mitigations or explicit open questions
- [ ] Review goal, review scope, review non-scope, success criteria, risk classes, and primary evidence sources are explicit in the saved spec or in a context file referenced by the saved spec
- [ ] Review contract identifies any session-derived state or says session evidence is not relevant
- [ ] Autonomy, continuation, stop, and handoff conditions are explicit when the spec may lead to autonomous execution

## Save Checks

- [ ] Use the user-specified path when the user explicitly requested one
- [ ] Otherwise save to an existing repo-local spec directory if present
- [ ] Otherwise save to repo-local `specs/`
- [ ] If the user-specified path conflicts with repo convention, clarify before saving or document the deviation
- [ ] If no naming convention exists, use `YYYY-MM-DD-{topic}-spec.md`

## Review Gate Checks

Before calling a saved spec `approved-spec` or ready for planning:

- [ ] Read `spec-review-prompt.md`
- [ ] Review the saved spec artifact, not only the drafting summary
- [ ] Use an independent reviewer subagent when available; otherwise record that the review was a second-pass self-review
- [ ] Fix every blocking review issue in the spec
- [ ] Each blocking review issue satisfies the W-question/evidence blocker burden: affected W-question or contract field, unsafe planning step, minimum correction, evidence source, and why it is not polish
- [ ] Do not revise solely for non-blocking recommendations
- [ ] Rerun Section Checks, Content Checks, and Save Checks after fixes
- [ ] Rerun spec review until it returns `Status: Approved`, or stop after two unresolved blocking-review iterations and report the blockers
- [ ] Treat `Status: Approved` or an equivalent ready decision with only non-blocking recommendations as approval
- [ ] Top-level status is `Approved` and Spec Review Status records reviewer type, review date, cumulative blocking issues fixed, review artifact or inline approval notes, and approval rationale
- [ ] Approved review result is persisted in the saved spec or linked adjacent review artifact
- [ ] Only hand off to `write-plan` after review approval
- [ ] Final response includes saved spec path, review status, reviewer type, cumulative blocking issues fixed count, and next handoff

## Final Standard

Only present the spec as ready when it is planning-ready, explicit, reviewed, and safe to hand off without hidden assumptions.
