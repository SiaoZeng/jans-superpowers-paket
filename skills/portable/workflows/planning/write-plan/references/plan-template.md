# Plan Template

Use this template to create an implementation-ready plan from an `approved-spec` artifact.

## Planning Rules

Apply these rules to every plan:

- use absolute file paths
- every action step uses `- [ ]`
- every action step is atomic enough to execute and review independently
- organize work into task groups with explicit goals
- keep the plan buildable without hidden context from chat history
- include validation commands and expected outcomes where useful
- prefer TDD-style sequencing when the change is testable
- make commit boundaries explicit when commits are part of the workflow
- repeat critical local context inside the relevant task group instead of relying on distant sections
- include an execution-review contract in the saved plan or a referenced context file
- include operational state and session rehydration when prior sessions, handovers, reviews, worktrees, or execution state affect the next safe action
- include an autonomy contract and stop conditions before any autonomous continuation or execution handoff
- include an execution mode recommendation and choice table after plan approval
- include a spec coverage map from requirements, scenarios, and success criteria to task groups
- include a validation coverage map from behavior changes to automated or manual checks
- mark task groups as sequential or parallel-safe when delegation or parallel execution may be used
- avoid placeholders such as `TODO`, `TBD`, `implement later`, `similar to above`, or vague instructions like `add validation`
- if the repo already separates `plan.md` and `tasks.md`, keep this plan focused on sequencing, structure, constraints, and validation rather than full task explosion
- if ports change, include `~/PORTS.md`
- if migrations, services, config, data operations, or destructive steps are involved, make rollback explicit

## Implementation Plan Template

```markdown
# {Feature Name} Implementation Plan

**Date:** YYYY-MM-DD
**Project:** {Project Name}
**Status:** Draft
<!-- Update to `Approved` only after plan review passes and before execution handoff. -->

## Plan Review Status
- Review Status: Pending | Approved
- Reviewer Type: Independent | Second-pass self-review | N/A while draft
- Review Date: YYYY-MM-DD or `N/A while draft`
- Blocking Issues Fixed: {cumulative count across review iterations or `0`}
- Review Artifact: {inline approval notes, adjacent review artifact path, or `N/A while draft`}
- Approval Notes: {why the reviewed plan is execution-ready or `N/A while draft`}

## Goal
One sentence describing what this plan delivers.

## Architecture Summary
2-3 short paragraphs on the chosen implementation approach.

## Technical Context
- Language/Version: {Value or `N/A`}
- Primary Dependencies: {Value or `N/A`}
- Storage: {Value or `N/A`}
- Testing Stack: {Value or `N/A`}
- Platform: {Value or `N/A`}
- Constraints: {Value or `N/A`}

## Input Artifacts
- Spec: /absolute/path/to/spec.md
- Supporting Docs: /absolute/path/to/doc.md or `N/A`
- Session Evidence: /absolute/path/to/session.jsonl, /absolute/path/to/handover.md, or `N/A`

## Operational State
- Current Workspace: {path and git/worktree state, or `N/A`}
- Current Artifact State: {approved spec, existing plan, review status, or `N/A`}
- Current Session State: {what has already happened, what is only planned, and what is unknown}
- Stale Review Risk: {review artifact and freshness status, or `None`}

## Session Rehydration
| Session / Handover / State Source | Why Relevant | State Extracted | Confidence | Follow-up Check |
|---|---|---|---|---|
| {path or `N/A`} | {reason} | {state} | High/Medium/Low | {check or `None`} |

## Execution-Review Contract
- Plan Goal: {implementation outcome this plan must deliver}
- Source Contract: {approved-spec path and covered requirements/scenarios}
- Execution Scope: {files, interfaces, config, services, migrations, docs, tests, generated artifacts, registries in scope}
- Execution Non-Scope: {boundaries that must not be expanded silently}
- Dependency Order: {sequential prerequisites and parallel-safe groups}
- Validation Contract: {commands, expected outcomes, manual checks, completion evidence}
- Risk Classes: {rollback, data/config/service risks, security, compatibility, performance, ports, or `None`}

## Autonomy Contract
| Field | Required Answer |
|---|---|
| Goal | {outcome autonomous work may deliver, or `N/A` if no autonomous continuation} |
| Allowed Scope | {files, commands, agents, services, or `N/A`} |
| Non-Scope | {boundaries that must not be expanded silently} |
| Continuation Condition | {when to continue without asking, or `N/A`} |
| Stop Condition | {when to stop and ask or return to planning/debugging} |
| Handover Condition | {when to write execution-state or handover} |
| Validation Evidence | {commands, review, manual checks} |
| Rollback Evidence | {backup, revert, migration undo, or `N/A`} |

## Execution Mode Recommendation
| Mode | Recommended? | Use When | TDD Relationship | Handoff |
|---|---|---|---|---|
| Direct TDD single-slice | Yes/No | One small implementation slice | This mode is the TDD workflow | `Handoff: /workflow/execution/test-driven-development [artifact=approved-plan]` |
| Controlled inline execution | Yes/No | Sequential or tightly coordinated task groups | Use TDD inside each behavior-changing slice | `Handoff: /workflow/controller/executing-plans [artifact=approved-plan]` |
| Subagent-driven development | Yes/No | Mostly independent task groups needing per-task reintegration and review | Each worker uses TDD for behavior-changing slices | `Handoff: /workflow/controller/subagent-driven-development [artifact=approved-plan]` |
| Parallel agent development | Yes/No | Truly independent domains with no unstable file overlap | Each worker uses TDD for behavior-changing slices | `Handoff: /workflow/controller/dispatching-parallel-agents [artifact=approved-plan]` |
| Isolated workspace first | Yes/No | Current workspace is dirty, shared, or unsafe | Runs before the selected execution mode | `Handoff: /workflow/workspace/using-git-worktrees [artifact=approved-plan]` |

Recommended Mode: {one mode plus rationale}

## File Map
| Absolute Path | Action | Responsibility |
|---|---|---|
| /absolute/path/to/file | Modify | {Why this file changes} |

## Spec Coverage Map
| Spec Requirement / Scenario / Success Criterion | Covered By Task Group(s) | Notes |
|---|---|---|
| {FR-001 or scenario name} | Task Group 1 | {Coverage note} |

## Validation Coverage Map
| Behavior / Risk | Validation Step | Expected Evidence |
|---|---|---|
| {Behavior or risk} | {Command or manual check} | {Passing output or observation} |

## Task Group 1: {Name}
**Goal:** {What this group accomplishes}
**Execution Mode:** Sequential | Parallel-safe with {task groups} | Must run after {task group}

**Task W-Question Matrix:**
| W-Question | Answer | Evidence | Blocking if missing? |
|---|---|---|---|
| Wer | {executor, reviewer, approver or `N/A — reason`} | {source} | Yes/No |
| Was | {change and non-scope} | {source} | Yes/No |
| Wo | {absolute paths and state locations} | {source} | Yes/No |
| Wie | {execution and verification method} | {source} | Yes/No |
| Womit | {tools, commands, agents, MCP surfaces} | {source} | Yes/No |
| Wovon | {prerequisites and artifacts} | {source} | Yes/No |
| Wogegen | {risks prevented and rollback protection} | {source} | Yes/No |
| Warum/Wieso/Weshalb | {sequence rationale} | {source} | Yes/No |
| Welche | {validation and review evidence} | {source} | Yes/No |

**Delegation Readiness:** {single-controller only / subagent-safe with constraints / parallel-safe with constraints / not safe because reason}
**Stop Conditions:** {task-specific stop conditions or `None beyond global contract`}

**Files:**
- Create: /absolute/path/to/new-file
- Modify: /absolute/path/to/existing-file
- Test: /absolute/path/to/test-file

- [ ] Step 1: {single action}
- [ ] Step 2: Run `{exact command}` and verify `{expected outcome}`
- [ ] Step 3: {single action}
- [ ] Step 4: Run `{exact command}` and verify `{expected outcome}`
- [ ] Step 5: Commit `{suggested commit message}`

## Task Group 2: {Name}
**Goal:** {What this group accomplishes}
**Execution Mode:** Sequential | Parallel-safe with {task groups} | Must run after {task group}

**Task W-Question Matrix:**
| W-Question | Answer | Evidence | Blocking if missing? |
|---|---|---|---|
| Wer | {executor, reviewer, approver or `N/A — reason`} | {source} | Yes/No |
| Was | {change and non-scope} | {source} | Yes/No |
| Wo | {absolute paths and state locations} | {source} | Yes/No |
| Wie | {execution and verification method} | {source} | Yes/No |
| Womit | {tools, commands, agents, MCP surfaces} | {source} | Yes/No |
| Wovon | {prerequisites and artifacts} | {source} | Yes/No |
| Wogegen | {risks prevented and rollback protection} | {source} | Yes/No |
| Warum/Wieso/Weshalb | {sequence rationale} | {source} | Yes/No |
| Welche | {validation and review evidence} | {source} | Yes/No |

**Delegation Readiness:** {single-controller only / subagent-safe with constraints / parallel-safe with constraints / not safe because reason}
**Stop Conditions:** {task-specific stop conditions or `None beyond global contract`}

**Files:**
- Create: /absolute/path/to/new-file
- Modify: /absolute/path/to/existing-file
- Test: /absolute/path/to/test-file

- [ ] Step 1: {single action}
- [ ] Step 2: Run `{exact command}` and verify `{expected outcome}`

## Validation Evidence
| Validation ID | Command or Check | Expected Evidence | Required Before Claim |
|---|---|---|---|
| V-001 | {command or manual check} | {passing output or observation} | {task group or final completion} |

## Review Evidence
| Review ID | Reviewer | Scope | Status | Blocking Issues Fixed |
|---|---|---|---|---|
| R-001 | {independent reviewer or self-review limitation} | {scope} | Pending/Approved | {count} |

## Validation Strategy
- [ ] Unit: {what must pass}
- [ ] Integration: {what must pass}
- [ ] Manual: {what must be checked}

## Rollback Plan
- [ ] Revert /absolute/path/to/file
- [ ] Undo dependent config, service, migration, or data changes in reverse order
- [ ] Restore prior port registration state if `~/PORTS.md` was changed

## Open Questions
None

Use `- [ ] {Question}` only for actual non-blocking follow-up questions. Blocking questions mean the plan is not ready for execution.

## References
- {Spec, docs, prior decisions, issues, research URLs}
```

## Task Group Guidance

Prefer task groups that align to one of these boundaries:

- setup or foundation needed before feature work
- one independently testable user story or capability slice
- one integration boundary
- one migration or rollout phase

Avoid grouping unrelated files or unrelated goals into the same task group.
