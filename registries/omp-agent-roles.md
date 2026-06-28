# OMP Agent Role Registry

**Date:** 2026-04-28
**Status:** Approved role contract for the OMP user-level agent roster
**Scope:** User-level reusable OMP agents under `$HOME/.omp/agent/agents/*.md`

## 1. Purpose

This document defines the canonical roles, scopes, and boundaries for the local OMP agent/subagent roster before implementation specs and agent prompt files are changed.

The role registry is intentionally separate from `$HOME/.omp/agent/agents` so the subagent discovery extension does not scan this document as an agent definition.

## 2. Global Role Rules

- [ ] Each agent has one primary scope and must refuse tasks outside that scope.
- [ ] Agents are bounded workers for isolated subtasks; workflow skills remain the canonical process layer.
- [ ] Agents must return compressed handoff output because the parent does not receive the subagent's internal tool transcript.
- [ ] Agents must include concrete file paths, commands, source URLs, timestamps, or evidence notes when claims depend on inspected evidence.
- [ ] Read-only agents must not edit, write, move, delete, install, start services, stop services, or mutate configuration.
- [ ] Write-capable agents must only modify files inside the explicitly assigned scope.
- [ ] Agents must stop and report insufficient context instead of inventing missing requirements.
- [ ] Agents must avoid printing secrets and must redact credential-like values in summaries.
- [ ] New and revised user-level agents use `model: inherit` unless a separate spec changes model policy.
- [ ] Tool allowlists use the current OMP subagent extension contract: `tools:` and `model:` frontmatter only.

## 3. Canonical Role Groups

### 3.1 Discovery and Research

| Role | Scope | Use when | Not for | Write access | Expected output |
|---|---|---|---|---|---|
| `scout` | Fast local codebase reconnaissance for a bounded module or question. | The parent needs compressed local file/code context before planning, debugging, or implementation. | Web research, GraphRAG research, implementation, final review. | No | Files retrieved, key code, architecture map, start-here recommendation. |
| `researcher` | Evidence synthesis from local files and non-browser CLI/web-accessible sources. | A task needs source-led context, comparison of documentation, changelogs, issue trackers, or local docs. | Direct code changes, deep GraphRAG-specific retrieval, unbounded browsing. | No | Research ledger, findings, source confidence, implications, open gaps. |
| `graphrag-researcher` | Retrieval of prior GraphRAG findings, memories, sources, procedures, and provenance-backed context. | Prior internal knowledge, remembered decisions, procedures, or source-grounded findings may change the answer or spec. | Memory writes, GraphRAG runtime code edits, broad web research. | No | Query ledger, retrieved findings, provenance, confidence, implications, misses. |

### 3.2 Framing, Specification, and Planning

| Role | Scope | Use when | Not for | Write access | Expected output |
|---|---|---|---|---|---|
| `planner` | Implementation planning from an approved or sufficiently bounded context artifact. | A spec or explicit requirement needs executable sequencing and validation steps. | Writing the spec, modifying files, approving its own plan. | No | Goal, plan, files to modify, new files, risks, validation commands. |
| `spec-writer` | Drafting implementation-ready specs from consolidated context and role registry constraints. | The parent has research/context and needs a formal spec artifact. | Implementation, plan execution, changing agent files directly. | Yes, only when explicitly asked to write a spec file | Spec draft path or complete spec body, review contract, assumptions, open questions. |
| `plan-reviewer` | Independent review of specs and plans for completeness, sequencing, validation, rollback, and hidden assumptions. | Before execution planning or before implementation begins. | Implementing fixes, broad code review unrelated to plan readiness. | No | Blocking issues, non-blocking recommendations, planning-readiness decision. |
| `architect` | Cross-module design review, boundary decisions, and long-term maintainability assessment. | A change affects role taxonomy, extension contracts, data flow, service boundaries, or multiple subsystems. | Line-level code review, implementation, test-output distillation. | No | Design assessment, trade-offs, boundary risks, recommended direction. |

### 3.3 Implementation and Refactoring

| Role | Scope | Use when | Not for | Write access | Expected output |
|---|---|---|---|---|---|
| `worker` | General delegated implementation inside a precisely assigned scope. | The parent has an approved plan slice or a small bounded implementation task. | Broad autonomous redesign, independent scope expansion, final review. | Yes | Completed changes, files changed, validation attempted, notes. |
| `omp-extension-engineer` | TypeScript implementation for OMP extensions, OMP commands, and OMP extension tests. | A task touches `$HOME/.omp/agent/extensions/*` or OMP extension examples and APIs. | GraphRAG runtime internals, unrelated application code. | Yes, within assigned OMP extension files | Completed extension changes, commands/tests updated, OMP compatibility notes. |
| `graphrag-runtime-engineer` | GraphRAG runtime code changes under `~/.local/share/graphrag` or GraphRAG-adjacent local tooling. | A task explicitly modifies GraphRAG MCP, CLI, service, schema, jobs, ingestion, or memory runtime. | Non-GraphRAG OMP agent prompt work, memory writes through GraphRAG tools. | Yes, within assigned GraphRAG files | Root-cause evidence, changed files, tests, migration or service notes. |
| `refactor-cleaner` | Removal of zombie code, duplicate prompts, obsolete agent definitions, and unused paths after evidence confirms they are unused. | Redundant files or overlapping roles create discoverability or maintenance risk. | Feature implementation, speculative deletion without backup, broad formatting. | Yes, only when assigned a cleanup plan | Cleanup candidates, evidence, changes made, rollback notes. |

### 3.4 Debugging and Testing

| Role | Scope | Use when | Not for | Write access | Expected output |
|---|---|---|---|---|---|
| `debugger` | Root-cause analysis for failures, regressions, unexpected behavior, and build/test errors. | Cause is unclear and a fix would otherwise be speculative. | Applying fixes, broad refactors, writing production code. | No | Symptoms, observations, hypotheses tested, root cause, fix recommendation. |
| `test-runner` | Bounded validation execution and compact failure distillation. | Test/build/log output would flood the parent context or needs independent verification. | Designing new tests, editing tests, applying fixes. | No | Commands run, pass/fail summary, failing tests, relevant logs, next actions. |
| `test-writer` | Regression-test and TDD test-slice design that returns concrete test slices and patch instructions without editing files in this implementation phase. | A bugfix or feature needs a failing test or validation harness before implementation. | Production code implementation, direct test-file edits, broad test-suite rewrites. | No | Test intent, target files, proposed test cases, expected red/green behavior, commands. |

### 3.5 Review, Security, and Quality

| Role | Scope | Use when | Not for | Write access | Expected output |
|---|---|---|---|---|---|
| `code-reviewer` | Review completed work against the governing spec, plan, or explicit task slice. | After implementation and validation, before completion or merge. | General architecture brainstorming, implementation, speculative style-only review. | No | Critical, Important, Suggestions, summary, plan/spec conformance. |
| `reviewer` | General read-only quality, maintainability, and integration review when no governing plan exists. | A quick independent quality pass is needed for existing code or docs. | Security-focused review, plan-readiness review, code modifications. | No | Critical, Warnings, Suggestions, summary. |
| `security-reviewer` | Security, privacy, credential-handling, privilege-boundary, shell-safety, and supply-chain review. | A change touches auth, tokens, secrets, downloads, shell commands, services, file permissions, or external inputs. | General quality review, implementation, vulnerability exploitation. | No | Findings by severity, evidence, affected paths, mitigation recommendations. |
| `performance-reviewer` | Performance, resource, concurrency, memory, GPU/CPU risk, and scalability review. | A change may affect runtime cost, large files, background jobs, GPU, tests, or service performance. | Running unbounded GPU processes, implementing optimizations. | No | Hotspots, measurements inspected, bounded validation suggestions, risk severity. |
| `dependency-auditor` | Dependency, package, changelog, compatibility, and supply-chain impact review. | A task adds, removes, or upgrades packages, models, CLIs, services, or runtime dependencies. | Editing lockfiles or installing packages unless explicitly delegated as worker task. | No | Dependency delta, upstream evidence, compatibility risks, recommended action. |

### 3.6 Documentation and Operations

| Role | Scope | Use when | Not for | Write access | Expected output |
|---|---|---|---|---|---|
| `docs-writer` | Documentation updates from verified implementation evidence and durable decisions. | README, usage docs, role docs, or operational notes must reflect completed and verified changes. | Speculative documentation, code changes, undocumented assumptions. | Yes, documentation files only | Files changed, source evidence used, user-facing changes, unresolved doc gaps. |
| `devops-sre` | Operational review for services, systemd units, environment files, backups, ports, logs, and rollback. | A task touches service lifecycle, privileged paths, environment, ports, long-running processes, or backups. | Direct service changes unless explicitly assigned with approved plan. | No by default | Operational risks, verification commands, rollback requirements, port-registry impact. |

## 4. Baseline Role Revisions

| Existing role | Decision | Required revision |
|---|---|---|
| `scout` | Keep and strengthen | Add explicit non-scope, read-only bash boundary, evidence requirements, and concise handoff contract. |
| `planner` | Keep and strengthen | Tie planning to approved specs or bounded context, add validation and rollback expectations, prevent speculative scope expansion. |
| `worker` | Keep and strengthen | Require assigned scope, files changed, validation, and refusal to broaden task without parent approval. |
| `reviewer` | Keep but narrow | Define as general read-only quality reviewer when no plan/spec-specific review is needed. |
| `code-reviewer` | Keep and strengthen | Keep as plan/spec-conformance reviewer and require exact severity definitions. |
| `worker-default` | Archive or remove from active discovery | Duplicate of `worker`; active duplicate creates selection noise. |
| `reviewer-default` | Archive or remove from active discovery | Duplicate of reviewer roles; active duplicate creates selection noise. |
| `code-reviewer-default` | Archive or remove from active discovery | Duplicate of `code-reviewer`; active duplicate creates selection noise. |

## 5. Prompt File Standard

Each implemented agent prompt must contain:

- [ ] YAML frontmatter with `name`, `description`, role-specific `tools` where restriction is needed, and `model: inherit`.
- [ ] Mission statement.
- [ ] Scope boundaries.
- [ ] Forbidden actions.
- [ ] Context required from the parent.
- [ ] Execution protocol.
- [ ] Output format with stable headings.
- [ ] Failure behavior.
- [ ] Handoff contract.

## 6. Implementation Priority

- [ ] First priority: revise `scout`, `planner`, `worker`, `reviewer`, and `code-reviewer` because they are already active baseline roles.
- [ ] Second priority: create missing generic roles that directly support the existing workflow skills: `researcher`, `graphrag-researcher`, `spec-writer`, `plan-reviewer`, `architect`, `debugger`, `test-runner`, `test-writer`, `security-reviewer`, `performance-reviewer`, `dependency-auditor`, `docs-writer`, `devops-sre`, and `refactor-cleaner`.
- [ ] Third priority: create local-domain implementation specialists: `omp-extension-engineer` and `graphrag-runtime-engineer`.
- [ ] Fourth priority: evaluate whether additional language specialists are needed after the generic and local-domain roster has been used in real tasks.
