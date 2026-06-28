# Operator Safety

## Client Surface Boundaries

- Use GraphRAG MCP/API as the normal Pi client surface.
- Do not use direct SurrealDB remote/client access for normal Pi operations; SurrealDB is the backend datastore behind the GraphRAG daemon.
- Do not start a second embedding runtime from Pi clients. The daemon-owned `graphrag-mcp.service` owns the embedding model, tokenizer, `EmbeddingService`, and `LLMClient`.

## Mutating Operations

- Treat `housekeeping` as mutating unless the specific tool mode is documented as read-only; use `graph_stats` for read-only counts and baselines.
- Run `graphrag_delete_source` with dry-run first; only perform destructive deletion after reviewing the derived records that would be removed.
- Track background jobs with `graphrag_get_job_status` instead of assuming completion from job submission.
- Do not treat synchronous `graphrag_ingest_session` like a background document job; after return, verify directly and use only short bounded retries before log inspection.

## gfx1151 Ingestion Diagnostics

- On gfx1151, high VRAM with low GPU busy can indicate resident model memory from daemon-owned GraphRAG/ColVision runtimes, not an active GPU bottleneck.
- Require kernel or service-log evidence before labeling ingestion latency as AMDGPU, ROCm, KFD, OOM, reset, fault, or embedding failure.
- Classify `extract_facts`, `claude_cli_error`, `fact_extraction_error`, or API 401 evidence as LLM/fact-extraction behavior unless GPU evidence independently contradicts it.

## Operational Change Controls

- Any new port assignment or changed port mapping requires checking and updating `~/PORTS.md`.
- Test FastMCP upgrades in a throwaway environment first, including transport tests for the MCP client/server path used by Pi.
- Test SurrealDB upgrades only after taking a backup and running a golden query corpus against the upgraded instance.

## Remote MCP Exposure

- Do not expose private local paths through remote MCP responses unless they are intentionally part of the operator contract.
- Remote MCP access must be host-scoped and protected with a bearer token.
