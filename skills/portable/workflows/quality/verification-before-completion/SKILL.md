---
name: verification-before-completion
description: Use when about to claim implementation, tests, a fix, or a task is complete, before communicating success, moving on, committing, or creating a PR.
---

# Verification Before Completion

## W-Question, Evidence, and Handoff Gate

When this workflow creates, reviews, executes, verifies, delegates, completes, or hands off durable work, apply `../../../references/w-question-evidence-standard.md` proportionally before the next irreversible or hard-to-review step. Capture the relevant wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence in the saved artifact, review, checkpoint, or final report.

Use an Evidence Ledger, Session Evidence, Decision Ledger, Autonomy Contract, Stop Conditions, and Validation Evidence when prior sessions, handovers, reviews, branches, worktrees, tools, or autonomous continuation affect safety. Stop or hand back when a required source artifact is missing, review state is stale, validation cannot prove the claim, scope or authority would expand, or the next workflow step would rely on hidden chat context.


## Overview

Do not claim success without fresh verification evidence.

This is a parallel quality gate, not an active workflow transition. It runs alongside execution workflows such as `test-driven-development` and applies at every completion boundary.

## Hard Gate

Do not claim that work is complete, fixed, or passing until you have run the command that proves that claim and read the output.

If you have not run the verification command in the current context, you do not have evidence for the claim.

## When to Use

Use this workflow when:

- you are about to say a task is complete
- you are about to say tests pass, a build passes, or a bug is fixed
- you are about to move to the next task based on success
- you are about to commit, open a PR, or ask for merge
- a delegated agent reported success and you have not independently checked the result

Do not use this workflow as a replacement for debugging, planning, or coding discipline. It is a gate on claims, not a substitute for upstream work.

## Gate Function

Before making a positive completion claim:

1. identify the exact command or check that proves the claim
2. run it fresh and completely
3. read the output, exit code, and failure count
4. decide whether the result actually supports the claim
5. only then state the result, with evidence

If the check fails, report the actual state instead of a success-shaped summary.

## Common Failure Modes

| Claim | Required Evidence | Not Sufficient |
|-------|-------------------|----------------|
| tests pass | fresh test output with no relevant failures | earlier run, one narrow test, or "should pass" |
| build passes | fresh build command with successful exit | lint passing or code looking correct |
| bug fixed | reproduction no longer fails, plus relevant regression evidence | code changed or manual spot-check only |
| task complete | requirements or plan slice checked against actual result | subagent report or intuition |
| agent finished correctly | independent diff and verification review | trusting the subagent's success message |

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "This should work now." | Run the proving command first. |
| "The focused test passed, that is enough." | Narrow success does not prove overall completion unless the claim is narrow too. |
| "The subagent already verified it." | Agent reports are inputs, not proof. Verify independently. |
| "I do not want to rerun everything." | Then limit the claim to what was actually verified. |
| "I am confident." | Confidence is not evidence. |

## Red Flags

- saying "done", "fixed", "passes", or equivalents before verification
- relying on one partial check for a broad claim
- trusting subagent success without independent review
- using "should", "probably", or "seems" as a substitute for evidence
- wanting to move on because you are tired or the work feels finished

All of these mean: stop, verify, then state the actual result.

## Parallel Use

Use this alongside active workflows such as:

- `test-driven-development` during implementation
- later debugging workflows after reproductions and fixes
- review workflows and `/workflow/completion/finishing-a-development-branch` before final claims
- `/workflow/quality/receiving-code-review` when review feedback has been implemented and is about to be claimed resolved

This skill does not belong in the DOT of those workflows because it is a parallel gate rather than the next active step.

## Final Rule

```text
No completion claim without fresh verification evidence.
```
