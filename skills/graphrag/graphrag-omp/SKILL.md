---
name: graphrag-omp
description: Use when Pi needs any GraphRAG routing for research, memory, ingestion, operations, skill registry work, runtime development, context projection, or workflow selection.
---

# GraphRAG OMP Router

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this as the Pi entry router for all GraphRAG use, not only coding tasks. Pick the smallest correct GraphRAG or portable workflow surface, then load and follow that skill. Pi clients should treat the GraphRAG MCP server as the normal client-facing interface.

## Hard Rules

- Use MCP as the client-facing GraphRAG surface in Pi.
- Do not use SurrealDB as a normal Pi client surface; direct database access is exceptional operations or runtime-development work only.
- Do not start a second embedding runtime; use the daemon/MCP/service-owned embedding path.
- Use `compile_context_projection` for bounded working context, adapter contracts, and handoff payloads instead of unbounded raw retrieval dumps.
- Preserve semantic-layer truthful outputs when the runtime provides them, especially `descriptors` separate from canonical `facets`, optional overlay `entity_handles` / `relation_handles`, and phase-1 `interrogation` payloads from `properties.semantic.interrogation`.
- Do not overclaim current GraphRAG traversal depth from the phase-1 W-question rollout; phase 1 is graph-ready and additive, not a full new traversal engine.
- Registry materialization is not Pi file sync; verify explicit runtime support before relying on registry-backed files.
- Keep workflow skills in force: GraphRAG retrieval does not replace framing, planning, debugging, TDD, review, or verification workflows.
- Do not change runtime sleeps or timeouts for ingestion complaints before distinguishing synchronous MCP calls from background jobs and checking service/GPU evidence.

## Routing

- Prior findings, provenance-backed facts, visual evidence, source inspection, or context projection -> `graphrag-research`.
- Durable non-user-specific memory -> `graphrag-memory`.
- Stable user facts, preferences, names, and conventions -> `graphrag-user-memory`.
- Document, code, session, visual ingestion, ingestion settlement, searchable/materialized verification, or sleep/wait guidance -> `graphrag-ingestion`.
- Service, CLI, MCP, jobs, health, backups, stats, ports, remote access, service logs, GPU diagnostics, or ingestion latency triage -> `graphrag-operations`.
- Skill registry, skill-related durable knowledge, approval, revocation, compatibility, or materialization lifecycle -> `graphrag-skills`.
- Local GraphRAG runtime code changes under `~/.local/share/graphrag` -> `graphrag-runtime-development`.
- Unclear scope or implementation work -> route first through portable workflows such as `brainstorming`, `write-spec`, `write-plan`, `systematic-debugging`, `test-driven-development`, `verification-before-completion`, and `requesting-code-review`.
