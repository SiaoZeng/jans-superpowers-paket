---
name: receiving-code-review
description: Use when receiving review feedback before implementing suggested changes, especially when feedback is unclear, possibly wrong, or in tension with existing codebase behavior.
---

# Receiving Code Review

## W-Question, Evidence, and Handoff Gate

When this workflow creates, reviews, executes, verifies, delegates, completes, or hands off durable work, apply `../../../references/w-question-evidence-standard.md` proportionally before the next irreversible or hard-to-review step. Capture the relevant wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence in the saved artifact, review, checkpoint, or final report.

Use an Evidence Ledger, Session Evidence, Decision Ledger, Autonomy Contract, Stop Conditions, and Validation Evidence when prior sessions, handovers, reviews, branches, worktrees, tools, or autonomous continuation affect safety. Stop or hand back when a required source artifact is missing, review state is stale, validation cannot prove the claim, scope or authority would expand, or the next workflow step would rely on hidden chat context.


## Overview

Treat review feedback as technical input to evaluate, not as instructions to obey blindly.

This is a parallel quality workflow for handling incoming review comments rigorously before implementation changes are made.

## Hard Gate

Do not implement review feedback before you understand it and verify it against the codebase reality.

Do not respond with performative agreement just to appear cooperative.

If the feedback is unclear, stop and clarify before implementing any part of it.

## Response Pattern

When receiving review feedback:

1. read the full feedback without reacting
2. restate the technical requirement or concern
3. verify it against code, tests, and existing behavior
4. decide whether it is correct for this codebase
5. respond with technical acknowledgment or reasoned pushback
6. only then implement, one item at a time

## When to Use

Use this workflow when:

- a reviewer suggested changes to code you own or just modified
- a review comment may be correct but needs verification first
- the feedback seems unclear, broad, or technically questionable
- feedback may conflict with existing architecture, compatibility, or user intent

Do not use this workflow as a substitute for asking for review. It starts after review feedback already exists.

## Forbidden Response Style

Avoid performative phrases such as:

- "You're absolutely right"
- "Great point"
- "Excellent feedback"
- "Thanks, I'll implement that now"

Prefer:

- technical restatement
- explicit verification notes
- concise factual correction or fix summary

## Workflow-Specific Harness

### Step 1: Understand before acting

If the comment is ambiguous:

- ask for clarification before implementing anything
- do not implement only the parts you think you understood if the unresolved parts may change the whole response

### Step 2: Verify against reality

Before accepting feedback, check:

- what the code currently does
- what tests currently prove
- whether the reviewer’s claim matches actual behavior
- whether the suggestion would break compatibility or existing intent
- whether the codebase already has a reason for the current implementation

### Step 3: Decide whether to accept or push back

Accept when the reviewer is technically correct for this codebase.

Push back when:

- the suggestion is technically incorrect
- it breaks existing behavior
- it violates YAGNI for unused functionality
- it conflicts with project or user decisions
- it assumes context the reviewer may not have

Push back factually, not defensively.

### Step 4: Implement carefully

After verification:

- address one item at a time
- verify each fix
- re-review the affected scope if the changes are material

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "The reviewer probably knows better, so I should just change it." | Reviewers can be wrong or lack context. Verify first. |
| "Agreeing quickly is the safest response." | Performative agreement creates technical debt when the feedback is wrong. |
| "I understand most of it, I can implement now and ask later." | Partial understanding often produces the wrong fix. Clarify first. |
| "Pushing back will sound difficult." | Technical correctness matters more than social performance. |

## Red Flags

- implementing feedback before checking the codebase
- thanking or agreeing before understanding the issue
- treating review as authoritative proof instead of input
- partial implementation while important ambiguity remains
- avoiding justified pushback because it feels uncomfortable

All of these mean: stop and return to technical evaluation.

## Parallel Use

Use this alongside:

- `/workflow/quality/requesting-code-review` after review comments arrive
- `/workflow/quality/verification-before-completion` before claiming the review items are resolved

This workflow is about review intake and evaluation, not about the original request for review.

## Final Rule

```text
Review feedback deserves verification, not obedience.
```
