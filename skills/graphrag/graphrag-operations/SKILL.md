---
name: graphrag-operations
description: Use when operating GraphRAG services, CLI, MCP, jobs, health checks, backups, stats, ports, housekeeping, or remote access from Pi.
---

# GraphRAG Operations

## W-Question, Provenance, and Lifecycle Gate

Before using GraphRAG results to frame, decide, mutate, store, ingest, serve, or review knowledge, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Interrogate retrieved or proposed material with wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence before collapsing it into conclusions, memory records, lifecycle actions, or handoffs.

Preserve provenance from GraphRAG tool outputs, source documents, sessions, job identifiers, domains, and lifecycle states. Treat GraphRAG hits, session transcripts, and prior assistant conclusions as evidence requiring scope-aware verification, not as automatic truth. Stop when source grounding, materialization state, memory scope, user-specific consent, job settlement, schema authority, or rollback safety cannot be proven from current evidence.


## Overview

Use this for operating the local GraphRAG runtime rather than changing application code. Prefer MCP for Pi client interactions, and use the CLI or service controls only for operator tasks that MCP does not cover.

## Operating Surfaces

- MCP -> normal Pi client-facing surface for search, ingest, memory, registry, and context operations.
- CLI -> local operator entrypoint for maintenance, diagnostics, and scripted checks.
- Service -> daemon lifecycle, logs, configuration, and runtime-owned embedding/search paths.
- Jobs -> submit only intentionally, track job IDs, and verify with `get_job_status`.
- Health -> check service readiness, MCP availability, job progress, and degraded components before declaring success.
- Backups -> take or verify backups before destructive maintenance, schema work, or risky data operations.
- Stats -> use `graph_stats` as the metric source for graph/index counts and operational baselines.
- Remote access -> use least privilege, explicit binding, and documented auth; do not expose local services casually.

## Hard Rules

- Do not use SurrealDB as a normal Pi client surface; direct database access is exceptional and must be justified.
- Do not start a second embedding runtime; use the service-owned runtime path.
- `housekeeping` is mutating and is not a pure metrics source; use `graph_stats` for counts, and use explicit dry-run/candidate surfaces where a tool provides them before destructive or cleanup actions.
- Port changes require checking and updating `~/PORTS.md` before completion.
- Preserve provenance and data safety: know whether an action is read-only, mutating, destructive, or externally exposed.

## Ingestion Latency Diagnostics

Use this path when a GraphRAG ingest appears slow, stuck, or wrongly attributed to GPU latency:

- Identify the ingestion surface first: `ingest_session` is synchronous, while `start_ingest_docs_job` is a background job tracked with `get_job_status`.
- Check the system service first on this host: `systemctl status graphrag-mcp.service` and `journalctl -u graphrag-mcp.service`; only check `systemctl --user` if the system service is absent.
- For background document jobs, inspect job `status`, `progress.stage`, `progress.updated_at`, and error fields before adding waits.
- Classify logs before attributing cause: `document_ingest_phase_end stage=extract_facts`, `claude_cli_error`, `fact_extraction_error`, or API 401 evidence points to LLM/fact-extraction behavior, not gfx1151 GPU failure.
- For gfx1151 GPU checks, use `journalctl -k` for AMDGPU/ROCm/KFD/OOM/reset/fault evidence and `rocm-smi --showuse --showmemuse --showpidgpus` for busy/VRAM/PID context.
- Interpret high VRAM with low GPU busy as possible resident model memory from daemon-owned GraphRAG/ColVision runtimes, not by itself as an active GPU bottleneck.

## Verification

- For read-only checks, capture the command/tool and key returned status.
- For mutating operations, verify the expected post-state with MCP/CLI, `graph_stats`, source inspection, or job status.
- For service changes, verify logs, health/readiness, MCP availability, and that no duplicate embedding runtime was started.
- For remote access or ports, verify binding, firewall/exposure assumptions, and `~/PORTS.md` consistency.
