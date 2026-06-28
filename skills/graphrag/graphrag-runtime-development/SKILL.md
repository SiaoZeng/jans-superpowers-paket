---
name: graphrag-runtime-development
description: Use when modifying, debugging, testing, or reviewing local GraphRAG runtime code under ~/.local/share/graphrag, including MCP, CLI, service, jobs, schema, registry, or embedding boundaries.
---

# GraphRAG Runtime Development

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this only for local GraphRAG runtime code work under `~/.local/share/graphrag`. Normal Pi client use should route through MCP and the other GraphRAG skills instead of editing runtime internals.

## Required Method

- Docs first: read `~/.local/share/graphrag/docs/README.md` and relevant linked docs before changing code.
- Root cause first: reproduce the issue, trace the module path and preload/runtime path, then patch the real cause.
- No quick dependency escapes: do not perform opportunistic FastMCP or SurrealDB upgrades to dodge a bug.
- Preserve the intended client boundary: MCP is the Pi-facing surface; SurrealDB is not a normal Pi client API.
- Do not start a second embedding runtime; keep embedding/search work on the daemon-owned path.
- Use context projection for bounded development handoffs when another agent needs focused state.
- Do not patch runtime timing, sleeps, or timeouts for perceived ingestion slowness until the exact path is proven: synchronous MCP call, background job, service log evidence, job progress, and GPU/kernel diagnostics where relevant.

## Ingestion Timing Guardrails

Before changing ingestion runtime code for slow or stuck behavior:

- Confirm whether the request used `ingest_session`, `ingest_docs`, `start_ingest_docs_job`, code ingest, or visual backfill.
- Treat `ingest_session` as a synchronous MCP call; after return, missing retrieval should first be handled with short bounded verification retries and log inspection, not new long sleeps.
- Treat `start_ingest_docs_job` as asynchronous; fix progress/status/reporting bugs only after `get_job_status` evidence shows a runtime defect.
- Distinguish embedding/GPU issues from LLM/fact-extraction issues. On gfx1151, clean kernel logs plus low GPU busy and high resident VRAM do not prove GPU failure.
- Runtime changes are justified only for proven defects such as missing telemetry, wrong terminal status, blocking behavior where job semantics are promised, reproducible index visibility races beyond bounded retries, or incorrect error propagation.

## Development Scope

- MCP tools and schemas.
- CLI commands and service lifecycle.
- Ingestion, jobs, health, stats, backup, and housekeeping paths.
- Memory, context projection, registry, and skill lifecycle code.
- Schema or storage changes, only with explicit migration and rollback reasoning.
- Port or remote-access behavior, with `~/PORTS.md` checked and updated for any port change.

## Verification

- Add or update focused tests before or with behavior changes when feasible.
- Run the smallest relevant test, CLI, MCP, and health checks that prove the fix.
- Verify no duplicate service, embedding runtime, or unintended data mutation remains.
- For registry behavior, distinguish live registry lifecycle from Pi file sync; materialization into Pi files requires explicit runtime support.
- When runtime changes expose semantic-layer outputs such as `descriptors`, overlay `entity_handles` / `relation_handles`, or phase-1 `properties.semantic.interrogation`, keep Pi-facing wording and tests truthful instead of collapsing them back into free-form facets or raw tags.
- When a runtime change affects semantic interpretation, verify that Pi-side wording still encourages `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` interrogation before classification rather than simplistic keyword tagging.
- When the runtime lands a phase-limited semantic feature such as phase-1 W-question interrogation, update Pi guidance to reflect the concrete landed contract and the explicit non-goals, for example graph-ready additive persistence without overclaiming broader traversal consumption.
- Document changed files, commands run, and unresolved risks in the handoff.
