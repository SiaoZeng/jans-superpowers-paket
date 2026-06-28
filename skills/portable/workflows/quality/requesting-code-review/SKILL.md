---
name: requesting-code-review
description: Use when a meaningful implementation slice is complete, a complex fix landed, or work is about to be merged and an independent review should validate correctness, scope, and quality.
---

# Requesting Code Review

## W-Question, Evidence, and Handoff Gate

When this workflow creates, reviews, executes, verifies, delegates, completes, or hands off durable work, apply `../../../references/w-question-evidence-standard.md` proportionally before the next irreversible or hard-to-review step. Capture the relevant wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence in the saved artifact, review, checkpoint, or final report.

Use an Evidence Ledger, Session Evidence, Decision Ledger, Autonomy Contract, Stop Conditions, and Validation Evidence when prior sessions, handovers, reviews, branches, worktrees, tools, or autonomous continuation affect safety. Stop or hand back when a required source artifact is missing, review state is stale, validation cannot prove the claim, scope or authority would expand, or the next workflow step would rely on hidden chat context.


## Overview

Do not treat passing tests as a substitute for independent review.

This is a parallel quality gate, not an active workflow transition. Use it after meaningful implementation slices, after complex fixes, and before integration when another pass should challenge the work from outside the implementation loop.

## When to Use

Use this workflow when:

- a meaningful implementation slice is complete
- a major feature or cross-file change just landed
- a complex bugfix touched several files or behaviors
- work is about to be merged or turned into a PR
- you want an adversarial second pass on correctness, scope coverage, and quality

Optional but valuable:

- before a risky refactor
- when stuck and a fresh technical perspective may help

Do not use this workflow as a substitute for verification. First verify what you can prove directly, then request independent review for what tests and self-inspection may still miss.

## Hard Gate

Do not skip review just because tests are green, the change feels simple, or you authored the code yourself.

If the workflow calls for review and review tooling is unavailable, state that the review checkpoint remains unmet instead of pretending it occurred.

## Review Request Pattern

Prepare the smallest reviewable scope that still preserves meaning.

Include:

- what was implemented or fixed
- the governing artifact, such as the relevant `approved-plan` slice, `approved-spec`, or explicit requirements
- the review scope, such as changed files, commit range, or diff slice
- any specific risks, edge cases, or open questions

Then request an independent review using the best available reviewer path in the runtime.

## What Review Should Check

- requirements or plan alignment
- missing behavior or scope drift
- cross-file regressions and integration risks
- unclear error handling or silent failure paths
- unnecessary complexity or weak test coverage

## Acting on Review Feedback

- fix critical issues before proceeding
- fix important issues before merge or next major step
- record or defer minor issues only when they are truly non-blocking
- push back on incorrect review comments with technical evidence, not irritation

After material fixes, request re-review of the affected scope.

If review comments are received, switch to:

`/workflow/quality/receiving-code-review`

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "The tests are green, so review is redundant." | Tests prove only what they encode. Review catches scope, design, and maintainability gaps. |
| "This feels simple enough to skip review." | "Feels simple" is a known review-skipping trap. |
| "I already inspected the diff myself." | Self-review is useful, not independent review. |
| "Review will slow me down." | Rework after merge is slower. |
| "The reviewer will probably say it is fine." | Probability is not the same as performing the checkpoint. |

## Red Flags

- moving from green tests straight to merge or PR with no review checkpoint
- treating self-review as independent review
- ignoring important review findings to keep momentum
- asking for review without enough scope context
- claiming review happened when only a quick diff glance occurred

All of these mean: stop and restore a real review checkpoint.

## Parallel Use

Use this alongside active workflows such as:

- `test-driven-development` after meaningful implementation slices
- future debugging workflows after complex fixes
- `/workflow/completion/finishing-a-development-branch` before final integration

If the review produces actionable feedback, pair this workflow with `/workflow/quality/receiving-code-review` for intake and verification before implementing changes.

This skill does not belong in the DOT of those workflows because it is a parallel gate rather than the next active step.

## Final Rule

```text
Verified code is not automatically reviewed code.
```
