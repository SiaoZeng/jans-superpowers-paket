---
name: graphrag-research
description: Use when GraphRAG should be searched for prior findings, provenance-backed facts, procedures, code knowledge, visual evidence, or native memory context before framing, spec work, plan review, or answering.
---

# GraphRAG Research

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to retrieve, frame, decide, review, or hand off knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, context packs, review inputs, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, retrieval scope, memory scope, source inspection, or context projection safety cannot be proven from current evidence.


## Overview

Use this as the primary GraphRAG retrieval wrapper. Start with the narrowest live surface that matches the task, expand only when needed, and treat the local GraphRAG runtime under `~/.local/share/graphrag/` plus the runtime MCP tool surface as the concrete source of truth. The normative retrieval rules live in `../references/retrieval-policy.md`, and runtime surface concepts live in `../references/runtime-concepts.md`.

Pi MCP gateway naming note: tool names may appear with the GraphRAG server prefix and underscores, such as `graphrag_search` or `graphrag_compile_context_projection`; map those names to the conceptual tool names below instead of assuming a separate API.

Use retrieved findings as input to `brainstorming`, `write-spec`, plan review, or grounded answers. This skill does not replace the canonical `brainstorming -> write-spec -> write-plan` chain.

## When to Use

- prior findings or past decisions may already exist
- provenance-backed answers are preferred over ad-hoc recall
- procedures, code knowledge, artifact evidence, or graph relations must be retrieved
- visual page evidence or localized evidence may matter
- prompt-ready remembered context, prior reasoning, or session continuation context is needed

Do not use this skill for durable memory writes; use `graphrag-memory` or `graphrag-user-memory`.
For skill-related storage or manifest-first registry questions, use `graphrag-skills`.
Boundary routing: ingestion tasks belong to `graphrag-ingestion`; runtime operations, service health, and maintenance belong to `graphrag-operations`; GraphRAG code changes belong to `graphrag-runtime-development`; top-level OMP GraphRAG routing belongs to `graphrag-omp`.

## Quick Gate

- code entities and symbols -> `search` on `structural`
- historical findings, decisions, and episode evidence -> `search` on `episodic`
- facts, docs, comments, durable knowledge -> `search` on `semantic`
- workflows and procedures -> `search_procedures`, then `procedure_steps` when a procedure is resolved
- artifacts, tables, diagrams -> `search` on `artifact`, or `memory_context_native` when a bounded prompt-ready pack is better than raw hits
- source grounding and provenance -> `search_sources`, then `inspect_source`
- ingestion verification -> combine targeted `search`, `search_sources`, and `inspect_source`; if a scoped/domain search misses, retry unscoped before declaring ingest failure
- visual page retrieval or localized evidence -> `search_visual`, then provenance/source inspection as needed
- domain browsing -> `search_by_domain`
- facet-aware narrowing on in-scope core search/native-memory surfaces -> pass facet filters when available
- graph relations -> `multi_hop` or `traverse`
- durable profile view -> `memory_profile_native`
- prompt-ready remembered context -> `memory_context_native`
- adapter-ready bounded working context or handoff payload -> `compile_context_projection`; prefer this over manually assembling raw hits when the next step needs bounded working context, provenance-preserving handoff, or a prompt-ready pack
- descriptor-bearing or overlay-bearing outputs should stay semantically truthful: preserve `descriptors` separately from canonical `facets`, and preserve optional `entity_handles` / `relation_handles` when the runtime exposes them
- when the runtime exposes phase-1 `interrogation` payloads from `properties.semantic.interrogation`, preserve them as additive raw/intermediate semantic evidence instead of flattening them into prose or reclassifying them as final canonical decisions
- interrogate retrieved material with `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` before collapsing it into summaries, tags, or follow-on memory candidates
- use the W-role heuristic to identify multi-hop-relevant anchors such as actors, methods, sources, tools, dependencies, and reasons, not only generic topic tags
- do not overclaim current traversal depth from phase-1 rollout alone: graph-ready anchors and `interrogation` payloads may be present before later phases deepen `multi_hop` consumption
- manual raw hit assembly -> diagnostic inspection only, not the default context or handoff path
- prior reasoning, decisions, or procedural evidence -> `memory_reasoning_context_native`
- session continuation summary -> `memory_session_summary_native`
- historical slice or temporal audit -> pass `as_of`
- remembered data scope -> filter with `agent_id`, `user_id`, `session_id`, `thread_id` as appropriate
- subject-backed memory scope -> also pass `role_id`, `team_id`, `workspace_id` when relevant
- skill-runtime possibilities -> inspect live registry via `resolve_skill_candidates` or `resolve_skill_manifest` instead of assuming disk-only skills
- retrieval first
- a scoped or domain-filtered miss is not proof of absence; use source inspection or unscoped fallback when verifying fresh ingestion
- provenance when grounding matters
- no memory writes here
- keep answers tied to retrieved evidence
- follow `../references/retrieval-policy.md`
