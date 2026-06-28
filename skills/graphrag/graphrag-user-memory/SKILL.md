---
name: graphrag-user-memory
description: Use when stable user-specific facts, preferences, names, conventions, or profile information should be stored for future sessions through GraphRAG's current native memory surface.
---

# GraphRAG User Memory

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this wrapper for durable user-specific memory. Prefer `memory_conclude_native` with the current native scope model instead of older `subject-id` conventions. The normative rules live in `../references/memory-policy.md`.

Pi MCP gateway naming note: tool names may appear with the GraphRAG server prefix and underscores, such as `graphrag_memory_conclude_native` or `graphrag_memory_profile_native`; map those names to the conceptual tool names below instead of assuming a separate API.

Keep user memory minimal and high-signal. Prefer a few stable profile facts over many fine-grained preferences.

## When to Use

- a stable user fact improves future collaboration
- a repeated preference or convention should persist across sessions
- user-scoped memory portability or conservative lifecycle management is needed

Do not use this skill for general technical memory.
Retrieve user memory only when it is relevant to the current task.
Boundary routing: ingestion tasks belong to `graphrag-ingestion`; runtime operations, service health, and maintenance belong to `graphrag-operations`; GraphRAG code changes belong to `graphrag-runtime-development`; top-level OMP GraphRAG routing belongs to `graphrag-omp`.

## Quick Gate

- retrieval first
- fresh evidence is session-agnostic: if a compatible session transcript already captures the user-established fact or preference with sufficient provenance, prefer that transcript over creating a temporary evidence document
- do not privilege one harness over another; Pi, Claude Code, OpenCode, OsmiumSwarm, and similar runtimes are equivalent when their session artifacts are equally ingestible and attributable
- use ad-hoc temporary documents only when no suitable session-shaped or already-ingested provenance exists
- new user-memory write -> requires explicit user confirmation or remember/save signal
- new user-memory write -> must have stable collaboration value
- new user-memory write -> prefer `workspace_shared` with `user_id` for broader cross-session user memory
- new user-memory write -> use `private` with `user_id` plus an additional narrowing key such as `agent_id`, `session_id`, or `thread_id` when the memory should stay narrower than workspace scope
- if the user-memory record also needs cross-cutting classification, add canonical facets such as `user-memory`, `preferences`, `profile`, or `session-memory` without replacing native scope/visibility
- keep open user-specific semantics in `descriptors` rather than canonical facets when the runtime supports them
- before choosing user-memory facets or descriptors, interrogate the candidate with `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb`, especially to separate raw user fact, reasoning-about-user, source basis, and intent
- do not pass free-form labels, topic bundles, hostnames, hardware names, or obsolete labels such as `finding` as user-memory `facets` or `tags`
- new user-memory write -> use narrower session or thread scope only when the memory should not generalize
- new user-memory write -> use live subject selectors `role_id`, `team_id`, and `workspace_id` only when the memory is intentionally shared or constrained by those relation-backed subjects
- portability or lifecycle task -> use the native export, import, invalidate, review, and apply surfaces without inventing a fresh remember/save requirement
- daemon-required native memory paths include `memory_conclude_native`, `memory_context_native`, `memory_reasoning_context_native`, `memory_import_bundle_native`, and `memory_consolidate`; route these through the GraphRAG MCP daemon and do not start a second embedding runtime to compensate for an unavailable daemon
- embedded-safe native memory paths include `memory_profile_native`, `memory_session_summary_native`, `memory_export_bundle_native`, `invalidate_memory`, `memory_housekeeping_candidates`, `memory_review_get`, `memory_review_update`, and `memory_apply`
- do not use the obsolete `subject-id` convention
- if the write path reports `unknown facets`, `unknown tags`, or missing canonical base facet errors, treat that as caller-contract drift and normalize the caller input instead of weakening the runtime contract
- if current serving or portability outputs already carry `descriptors` or optional overlay semantic handles, preserve them truthfully instead of flattening them into free-form facet labels
- never store secrets, financial data, government IDs, health data, exact addresses, or location history
- follow the full native memory rules in `../references/memory-policy.md`
