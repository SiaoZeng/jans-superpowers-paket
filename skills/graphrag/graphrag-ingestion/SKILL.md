---
name: graphrag-ingestion
description: Use when documents, code, sessions, or visual artifacts should be ingested or backfilled into GraphRAG and verified through searchable, materialized, and fully settled states.
---

# GraphRAG Ingestion

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this for adding source material to GraphRAG. Prefer durable, attributable source documents over ad-hoc temporary text. Ingestion is daemon-required: use the running GraphRAG MCP daemon and do not start a second embedding runtime. Ingestion is complete only after the requested state is verified through GraphRAG retrieval or job surfaces; a client timeout does not automatically mean the server-side ingest failed.

## Ingestion Surfaces

- Documents -> `ingest_docs` for synchronous ingest or `start_ingest_docs_job` for background ingest.
- Code -> `ingest_code`, then verify structural retrieval.
- Sessions -> `ingest_session` when a transcript is suitable evidence for later retrieval or memory grounding.
- Visual documentation -> `backfill_visual_docs`, then verify visual search and source provenance.

## Durable-Document Policy

- Ingest only stable, useful, attributable material with future retrieval value.
- Prefer canonical project docs, source files, transcripts, and generated artifacts over lossy summaries.
- Do not ingest secrets, credentials, private auth locations, transient scratch text, or unreviewed sensitive local paths.
- Use ingestion to ground later memory writes; do not turn one-off guesses into durable evidence.
- Do not confuse ingestion metadata or topical descriptors with native memory facet inputs. Labels such as product names, hardware names, model names, or ad-hoc research topics are not automatically valid GraphRAG `facets`/`tags` for later durable writes.
- Session and document ingest may preserve explicit `descriptors` and, where supported by the runtime path, optional overlay semantic handles such as `entity_handles` / `relation_handles`; those are not equivalent to canonical memory facets.
- The currently landed phase-1 runtime may also persist a raw/intermediate W-question payload at `properties.semantic.interrogation`; treat that as additive semantic evidence, not as a new facet list.
- Before deriving semantic labels from ingested content, use `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` as an interrogation heuristic so richer descriptors, relation cues, provenance cues, and multi-hop anchors can be identified before classification.

## Settlement States

- `searchable`: material can be found through `search`, `search_sources`, or `search_visual`.
- `materialized`: source records and inspectable provenance exist, and `inspect_source` returns the expected content or metadata.
- `fully_settled`: async jobs are terminal-success via `get_job_status`, indexes are queryable, provenance checks pass, and any requested visual backfill is searchable.

## Timing and Polling Rules

Do not use one fixed sleep for all ingestion types. Choose timing by surface and evidence:

- `ingest_session` is a synchronous MCP tool, not a background job. After it returns `ok`, `already_ingested`, or `duplicate`, immediately verify with `search_sources`, `inspect_source`, or targeted `search`. Do not add long sleeps for normal session ingests.
- If a just-returned session ingest is not immediately searchable, use only short bounded retries such as 1s, 2s, then 5s before inspecting service logs or reporting a settling/blocker state.
- `start_ingest_docs_job` is asynchronous. Poll `get_job_status` instead of blind sleeping: start with short intervals such as 1s, 2s, 5s, then use 10-15s intervals for larger documents while progress is changing.
- Document ingest with `extract_facts=true`, visual work, PDFs, or large architecture docs may take minutes. Treat first retrieval success as `searchable`, source inspection as `materialized`, and terminal job status as `fully_settled`.
- If job progress is stuck, inspect GraphRAG service logs before increasing waits. Distinguish GPU/embedding delay from LLM/fact-extraction delay.

## Verification

- Session verification -> use the returned `session_id` or transcript path immediately; then run `search_sources`, `inspect_source`, or targeted `search`. No long sleeps unless verification shows an actual settling delay.
- If a later memory or raw-layer write fails with `unknown facets`, `unknown tags`, or missing canonical base facet errors, classify that as caller-side memory-contract drift, not as an ingestion-settlement failure by default.
- Job verification -> `get_job_status` until terminal state; do not claim full settlement while a job is queued or running.
- Source verification -> `search_sources`, then `inspect_source` for the resolved source.
- Content verification -> `search` with the expected `source_class` or `knowledge_class`.
- When verification surfaces explicit `descriptors`, `entity_handles`, `relation_handles`, or `interrogation`, treat that as truthful materialized semantic output rather than evidence that the same terms became canonical facets.
- `inspect_source` is the preferred surface when the question is whether phase-1 `properties.semantic.interrogation` actually materialized on persisted rows.
- Visual verification -> `search_visual`, then inspect the linked source when grounding matters.
- Record job IDs, source IDs, and verification queries in the handoff when another agent must continue.
