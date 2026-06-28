---
name: graphrag-skills
description: Use when the task is about skill-related durable knowledge in GraphRAG or about an explicitly implemented manifest-first skill registry model, not when assuming runtime skill sync exists by default.
---

# GraphRAG Skills

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this wrapper when the task is about skills as knowledge: reviewing reusable skill findings, deciding whether a skill-related fact belongs in GraphRAG, or working with the now-live manifest-first skill registry model. Runtime skill artifacts such as `SKILL.md` still stay on disk by default unless a runtime explicitly wires registry materialization into file targets. The normative rules live in `references/sync-policy.md`, and runtime placeholders live in `../references/runtime-concepts.md`.

Pi MCP gateway naming note: tool names may appear with the GraphRAG server prefix and underscores, such as `graphrag_resolve_skill_candidates` or `graphrag_materialize_skill`; map those names to the conceptual tool names below instead of assuming a separate API.

## When to Use

- skill-related durable findings should be reviewed or remembered
- the task is about whether a runtime skill artifact belongs on disk or in GraphRAG
- the live manifest-first skill registry, approval, compatibility, revocation, or materialization lifecycle must be inspected

Do not use this skill for generic retrieval; use `graphrag-research` first.
Do not assume runtime file sync exists unless the current runtime explicitly exposes it.
Boundary routing: ingestion tasks belong to `graphrag-ingestion`; runtime operations, service health, and maintenance belong to `graphrag-operations`; GraphRAG code changes belong to `graphrag-runtime-development`; top-level OMP GraphRAG routing belongs to `graphrag-omp`.

## Default Rule

- runtime skill artifacts such as `SKILL.md` stay on disk by default
- GraphRAG may store derived workflow knowledge about skills
- when the runtime truthfully serves skill-related knowledge with `descriptors` or optional overlay handles, preserve those fields as knowledge semantics rather than treating them as Pi file-sync signals
- use `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` to interrogate skill-related knowledge before deriving descriptors, relations, or sync conclusions; this heuristic is not a file-sync state machine and not a new facet list
- the GraphRAG registry surface is live for read, write, materialize, revoke, and deactivate operations
- runtime file sync remains optional and must be verified before use
- current registry reality: `materialize_skill` records a `materialization_event` with a `runtime://` path; it does not create or overwrite Pi-local `SKILL.md` files unless a separate file materializer exists and is explicitly wired
- current registry reality: `resolve_skill_candidates` may return no candidates until approved, scanned, and compatible skill versions exist
- current registry reality: the current runtime should use `version_id` governance unless a manifest fallback is explicitly implemented

## Quick Gate

- generic retrieval -> `graphrag-research`
- durable findings about skills -> general memory, not raw runtime artifact sync
- skill-related knowledge may still be cross-cutting via facets such as `skills`, `agents`, `runtime-model`, `baseline-sync`, or `installable-baseline` even when the bounded context domain stays stable
- registry reads and writes -> use the live manifest-first registry surface
- review the current runtime before claiming file-sync behavior into Pi-local runtime paths
- only use sync guidance when the runtime explicitly implements registry-backed skill file materialization
- follow the full policy in `references/sync-policy.md`
