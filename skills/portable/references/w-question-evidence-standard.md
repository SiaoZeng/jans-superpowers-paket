# W-Question, Evidence, Session and Review Standard

## Purpose

Use this reference whenever a skill, workflow, agent, spec, plan, review, or handoff must avoid hidden assumptions and make reasoning auditable.

The standard exists to make these behaviors first-class:

- W-question interrogation before collapsing context into decisions.
- Evidence-led claims instead of memory-led claims.
- Session and handover rehydration when recent work state matters.
- Review convergence without moving goalposts.
- Autonomy control through explicit continuation, stop, and handoff conditions.

## When to Apply

Apply this standard when any of these conditions is true:

- a task creates or reviews a durable artifact such as a spec, plan, review, handover, skill, or agent;
- the user asks for deep, full, first-class, SOTA, vollumfänglich, or W-question coverage;
- the task continues prior work from sessions, handovers, plans, reviews, branches, worktrees, or GraphRAG memory;
- a workflow may execute autonomously after `fahre fort`, `autonom`, `work autonomously`, or an equivalent instruction;
- an agent delegates work or receives delegated work with authority boundaries;
- a reviewer is deciding whether an issue blocks the next workflow step.

Use proportional depth. A small, low-risk skill can mark irrelevant questions as `N/A — reason`, but it must not silently omit a relevant question.

## W-Question Set

### Wer

Answer these when relevant:

- Who is the primary user, operator, or beneficiary?
- Who invokes the skill or agent?
- Who owns the next decision?
- Who verifies the result?
- Who can approve continuation, implementation, merge, or rollback?
- Who is affected if the artifact is wrong?

### Was

Answer these when relevant:

- What is the exact responsibility?
- What is explicitly out of scope?
- What input artifact is required?
- What output artifact must be produced?
- What state, evidence, or decision must be persisted?
- What would be scope drift?

### Wann

Answer these when relevant:

- When should the skill or agent trigger?
- When must it refuse, stop, or hand back?
- When is local context sufficient?
- When is GraphRAG, web research, session audit, or browser evidence required?
- When is a review, verification, backup, rollback, or handoff required?

### Wo

Answer these when relevant:

- Where are source files, specs, plans, reviews, sessions, handovers, registries, logs, and references?
- Where may the workflow write?
- Where is writing forbidden?
- Where is the source of truth?
- Where will evidence be stored or linked?

### Wie

Answer these when relevant:

- How is context gathered?
- How is evidence filtered and cited?
- How is root cause distinguished from workaround?
- How are alternatives compared?
- How are decisions, assumptions, and open questions represented?
- How is verification performed and recorded?
- How is review convergence preserved?

### Womit

Answer these when relevant:

- Which tools, MCP surfaces, commands, agents, or files may be used?
- Which tools are read-only?
- Which tools may mutate state?
- Which tools or commands are forbidden?
- Which runtime-specific surfaces must not be assumed?

### Wovon

Answer these when relevant:

- Which artifacts does the next step depend on?
- Which session or handover state does the task depend on?
- Which external sources or internal findings support the decision?
- Which tests or validation commands gate completion?
- Which assumptions would change the chosen path?

### Wogegen

Answer these when relevant:

- What failure mode does this skill, agent, spec, plan, or review prevent?
- What scope drift does it prevent?
- What security, privacy, compatibility, performance, or operational risk does it prevent?
- What context-loss or stale-state risk does it prevent?
- What review-loop or autonomy-loop risk does it prevent?

### Warum, Wieso, Weshalb

Answer these when relevant:

- Why does this artifact or role exist?
- Why is this boundary correct instead of a neighboring skill, agent, or workflow?
- Why is this output form the right one?
- Why is the proposed next handoff safe?
- Why is the choice production-ready rather than a workaround?
- Why were alternatives rejected?

### Welche

Answer these when relevant:

- Which evidence was inspected?
- Which claims depend on which evidence?
- Which risks are blocking?
- Which risks are non-blocking?
- Which validation evidence is required before a completion claim?
- Which open questions remain, and are they blocking or non-blocking?

## W-Question Coverage Map

Use this compact form in durable artifacts when full prose would be too large:

| W-Question | Answer | Evidence | Blocking if missing? |
|---|---|---|---|
| Wer | {answer or `N/A — reason`} | {source path, session, user request, or `N/A`} | Yes/No |
| Was | {answer or `N/A — reason`} | {source} | Yes/No |
| Wann | {answer or `N/A — reason`} | {source} | Yes/No |
| Wo | {answer or `N/A — reason`} | {source} | Yes/No |
| Wie | {answer or `N/A — reason`} | {source} | Yes/No |
| Womit | {answer or `N/A — reason`} | {source} | Yes/No |
| Wovon | {answer or `N/A — reason`} | {source} | Yes/No |
| Wogegen | {answer or `N/A — reason`} | {source} | Yes/No |
| Warum/Wieso/Weshalb | {answer or `N/A — reason`} | {source} | Yes/No |
| Welche | {answer or `N/A — reason`} | {source} | Yes/No |

## Evidence Ledger

Every durable spec, plan, review, or handoff should include or reference an evidence ledger when claims depend on local files, sessions, GraphRAG, web sources, or prior artifacts.

| Evidence ID | Source | Retrieval / Inspection Date | Method | Relevant Claim | Limitations |
|---|---|---|---|---|---|
| E-001 | `/absolute/path` or URL | YYYY-MM-DD | read, rg, GraphRAG, dg, browser, subagent | {claim supported} | {staleness, partial, aborted session, not fetched, etc.} |

Rules:

- Do not make substantive claims from snippets alone when a fetched or inspected source is required.
- Session transcripts are evidence, not automatic truth.
- Aborted turns and partial outputs must be labelled as partial.
- GraphRAG findings should preserve provenance and not overclaim traversal depth or registry support.
- Web sources must include URL, retrieval date, extraction method, and limitation.

## Decision Ledger

Use a decision ledger when alternatives, scope boundaries, or handoffs matter.

| Decision ID | Decision | Alternatives Considered | Why Chosen | Evidence | Revisit Condition |
|---|---|---|---|---|---|
| D-001 | {decision} | {alternatives} | {reason} | E-001, E-002 | {condition} |

Rules:

- Record why an option was rejected when it would otherwise be a plausible path.
- Do not hide unresolved design choices in assumptions.
- If a decision depends on user approval, mark it as pending until approval exists.

## Session Evidence and Rehydration

Use session evidence when recent session state changes the next safe action.

Required checks:

- Identify relevant session JSONL files, handover documents, specs, plans, reviews, worktrees, branches, or execution-state artifacts.
- Distinguish completed assistant claims from aborted turns and tool failures.
- Check whether a saved review or plan became stale after later edits.
- Use session evidence to reconstruct operational state, not to bypass current file inspection.
- If session evidence conflicts with current filesystem state, current filesystem state and explicit user intent win unless a governing artifact says otherwise.

Session evidence table:

| Session / Handover | Why Relevant | State Extracted | Confidence | Follow-up Check |
|---|---|---|---|---|
| `/absolute/path.jsonl` | {reason} | {state} | High/Medium/Low | {file, command, or review needed} |

## Review Convergence Contract

Review exists to decide whether the next workflow step is safe. It does not exist to maximize polish.

A blocking issue must state all of these:

1. the affected W-question or contract field;
2. the exact next workflow step that would be unsafe, ambiguous, unverifiable, or likely wrong;
3. the minimum missing fact or correction needed to make the step safe;
4. the evidence source for the finding;
5. why the finding is not merely polish, preference, optional completeness, or a non-blocking recommendation.

Non-blocking recommendations must not become later blockers unless new evidence shows concrete risk or the artifact changed in a way that introduces the risk.

On re-review:

- inspect prior blockers first;
- approve when prior blockers are fixed and no new concrete risk exists;
- add new blockers only for newly introduced critical risk or previously uninspectable required scope;
- record stale review risk if the reviewed artifact changed after approval.

## Autonomy Contract

Use an autonomy contract before autonomous continuation or execution handoff.

| Field | Required Answer |
|---|---|
| Goal | What outcome should autonomous work deliver? |
| Allowed Scope | Which files, systems, commands, agents, and artifacts are in scope? |
| Non-Scope | Which work must not be silently added? |
| Continuation Condition | When may the agent continue without asking? |
| Stop Condition | When must the agent stop and ask or return to planning/debugging? |
| Handover Condition | When must an execution-state or handover artifact be written? |
| Validation Evidence | Which commands or reviews prove progress? |
| Rollback Evidence | How can changes be reverted or invalidated? |

Stop conditions include:

- missing required source artifact;
- contradictory spec, plan, session, or filesystem state;
- repeated validation failure after root-cause investigation;
- unapproved expansion of scope, authority, service, port, migration, or data operations;
- stale review where the next step depends on the reviewed content;
- inability to prove completion with agreed evidence.

## Output Requirements

For specs:

- include W-Question Coverage Map;
- include Evidence Ledger when research, sessions, GraphRAG, local files, or prior artifacts influenced design;
- include Decision Ledger when alternatives or handoffs matter;
- include Session Evidence when recent sessions or handovers affect scope or state.

For plans:

- include Operational State and Session Rehydration when continuing prior work;
- include task-level W-question coverage for non-trivial task groups;
- include Validation Evidence and Review Evidence separately;
- include Autonomy Contract and Stop Conditions before autonomous execution.

For reviews:

- include W-Question Coverage Assessment;
- include Evidence-to-Claim Assessment;
- include Session-State Assessment when prior sessions matter;
- classify findings as blocking only when the Review Convergence Contract is satisfied.

For agents:

- state input contract, output contract, forbidden actions, tool authority, escalation rules, and `No Changes Made` or exact files changed;
- include W-question and evidence coverage when producing specs, plans, reviews, handovers, or implementation reports;
- preserve read-only boundaries unless the agent role explicitly grants write authority.
