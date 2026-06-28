---
name: graphrag-memory
description: Use when durable non-user-specific knowledge should be stored, served, ported, or lifecycle-managed through GraphRAG's current native memory surfaces.
---

# GraphRAG Memory

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this wrapper for durable general memory operations. Prefer the native memory surface over ad-hoc raw layer writes: `memory_conclude_native` for writes, `memory_profile_native` or other native serving tools for retrieval, `memory_export_bundle_native` and `memory_import_bundle_native` for portability, and the review/apply lifecycle tools for conservative cleanup or consolidation. Fresh evidence is session-agnostic: if a compatible session transcript already exists and can be ingested or has already been ingested with usable provenance, prefer that session evidence over creating ad-hoc temporary documents. The normative rules live in `../references/memory-policy.md`.

Pi MCP gateway naming note: tool names may appear with the GraphRAG server prefix and underscores, such as `graphrag_memory_conclude_native` or `graphrag_memory_profile_native`; map those names to the conceptual tool names below instead of assuming a separate API.

## When to Use

- stable technical or project knowledge should be remembered
- a verified fact, ratified decision, or reusable procedure has future value
- durable memory should be exported, imported, invalidated, reviewed, or consolidated

Do not use this skill for user profile facts or raw runtime skill artifacts.
Boundary routing: ingestion tasks belong to `graphrag-ingestion`; runtime operations, service health, and maintenance belong to `graphrag-operations`; GraphRAG code changes belong to `graphrag-runtime-development`; top-level OMP GraphRAG routing belongs to `graphrag-omp`.

## Quick Gate

- retrieval first
- default durable write -> `memory_conclude_native`
- native writes need grounded fresh evidence; ungrounded or recalled-only candidates fail closed
- prefer the strongest available fresh evidence source in this order:
  1. already-ingested provenance linked to the target fact or decision
  2. an ingestible session transcript from any compatible harness
  3. another stable source document that can be ingested cleanly
  4. raw-layer direct ingest only when the task explicitly calls for direct ingest or native memory is not the right fit
  5. ad-hoc temporary documents only as a last fallback
- session evidence is harness-agnostic: prefer any ingestible session transcript with sufficient message history and provenance, regardless of whether it came from Pi, Claude Code, OpenCode, OsmiumSwarm, or another runtime
- do not privilege a transcript because of product name alone; privilege it because it is structured, attributable, and suitable as fresh evidence
- `preview_only` fidelity is not storable
- durable profile or summary view -> native memory serving tools
- daemon-required native memory paths include `memory_conclude_native`, `memory_context_native`, `memory_reasoning_context_native`, `memory_import_bundle_native`, and `memory_consolidate`; route these through the GraphRAG MCP daemon and do not start a second embedding runtime to compensate for an unavailable daemon
- embedded-safe native memory paths include `memory_profile_native`, `memory_session_summary_native`, `memory_export_bundle_native`, `invalidate_memory`, `memory_housekeeping_candidates`, `memory_review_get`, `memory_review_update`, and `memory_apply`
- portability -> `memory_export_bundle_native` or `memory_import_bundle_native`
- lifecycle cleanup -> `invalidate_memory`, `memory_housekeeping_candidates`, `memory_consolidate`, `memory_review_get`, `memory_review_update`, `memory_apply`
- choose explicit domain plus the smallest sufficient scope
- add canonical facets when the memory should remain discoverable across overlays such as skills, agents, runtime-models, legal, research, wiki, or code-graph
- do not pass free-form topic labels, hostnames, GPU names, model names, incident nicknames, or labels like `finding` as native memory `facets` or `tags`
- if the input only has topical compatibility labels, either normalize them into canonical facets first or use a portability/import surface that explicitly supports compatibility-preserving mapping
- keep open semantics in `descriptors`, not in canonical `facets`; when the runtime returns explicit `descriptors`, preserve that distinction instead of reclassifying them as facets
- before choosing facets/descriptors, interrogate the candidate with `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb`
- the W-role heuristic is not only about tags; use it to derive better descriptors, relation cues, provenance hints, and future multi-hop anchors
- the landed phase-1 runtime is additive and non-destructive: if `interrogation` is surfaced, treat it as raw/intermediate semantic evidence rather than as a replacement for `descriptors` or as proof that entity/relation promotion already happened
- choose visibility intentionally: `private`, `agent_shared`, `workspace_shared`, or `global`
- `private` requires at least one scope key, `agent_shared` requires `agent_id`, `workspace_shared` requires `user_id`, and `global` commonly enters a high-risk deferred review path
- scope uses `agent_id`, `user_id`, `session_id`, `thread_id`
- subject-backed memory may additionally use `role_id`, `team_id`, and `workspace_id`; these are live relation-aware selectors, not the obsolete generic `subject-id` convention
- truthful outcomes matter: check the top-level `state` first for review-needed or degraded outcomes, then inspect the receipt for detailed write or non-write results such as `created`, `duplicate`, `superseded`, `not_written`, or `domain_assignment_failed`
- current receipts, serving products, and portability bundles may also carry explicit `descriptors`, optional overlay `entity_handles` / `relation_handles`, and phase-1 `interrogation` payloads; preserve those fields truthfully when present
- if a write fails with `unknown facets`, `unknown tags`, or missing canonical base facet errors, treat that as caller-contract drift and fix the caller or skill guidance instead of loosening the runtime semantics
- no secrets, private paths, internal endpoints, or auth locations
- follow the full native memory rules in `../references/memory-policy.md`
