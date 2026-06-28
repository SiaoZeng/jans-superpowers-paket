# Runtime Concepts

## GraphRAG Runtime Surface

- `<graphrag-runtime-root>`: the canonical local GraphRAG runtime root, currently `~/.local/share/graphrag/`
- `<graphrag-readme>`: the local authoritative runtime document, currently `<graphrag-runtime-root>/docs/README.md`
- `<graphrag-mcp-proxy-path>`: the runtime's GraphRAG MCP access path; in Pi this is the `graphrag` MCP server exposed through the `mcp` tool
- `<graphrag-client-facing-surface>`: the supported Pi client surface is GraphRAG MCP/API; SurrealDB is the backend datastore and is not a normal Pi client surface
- `<graphrag-cli>`: the local operator CLI entrypoint, currently `graphrag`
- `<graphrag-daemon-owned-surface>`: heavy search, ingest, visual, embedding, and daemon-required native paths owned by `graphrag-mcp.service`; this daemon owns the embedding model, tokenizer, `EmbeddingService`, and `LLMClient`, plus paths such as `memory_conclude_native`, `memory_context_native`, `memory_reasoning_context_native`, `memory_import_bundle_native`, `memory_consolidate`, `compile_context_projection`, all current registry operations, and `start_ingest_docs_job`
- `<graphrag-embedded-safe-surface>`: the lighter subset of GraphRAG operations that can run without starting a second embedding runtime, including tools such as `memory_profile_native`, `memory_session_summary_native`, `memory_export_bundle_native`, `invalidate_memory`, `memory_review_get`, `memory_review_update`, `memory_housekeeping_candidates`, and `memory_apply`
- `<graphrag-universal-filter-surface>`: the live search and ingest classification surface using `source_class` and `knowledge_class`

Pi clients must not start a second embedding runtime. If an operation needs the embedding model, tokenizer, `EmbeddingService`, `LLMClient`, registry lifecycle/write behavior, or other daemon-owned state, route it through the `graphrag-mcp.service` MCP/API surface instead of constructing local runtime clients.

## Native Memory Concepts

- `<facet-substrate-wave-1>`: the current physical storage layer for first-class facets is the existing `tag` table plus node-level `tags[]` fields; `facets` is the canonical semantic term while `tags` remains the Wave-1 compatibility/storage term
- `<open-descriptors>`: open semantic descriptors live separately from canonical facets; the runtime now uses explicit `descriptors[]` fields where available, and historical compatibility-only tags may still be surfaced read-time as descriptors when no explicit descriptor field exists
- `<bounded-context-domain>`: `domain` identifies the thematic bounded context of a record and remains distinct from cross-cutting facet classification

- `<native-memory-scope>`: the effective memory scope expressed with `agent_id`, `user_id`, `session_id`, and `thread_id`; `private` requires at least one scope key, `agent_shared` requires `agent_id`, `workspace_shared` requires `user_id`, and `global` resolves to an empty scope
- `<native-memory-subject-selectors>`: relation-aware selectors `role_id`, `team_id`, and `workspace_id` used for subject-backed memory visibility and writes
- `<native-memory-visibility>`: the intended sharing level, currently `private`, `agent_shared`, `workspace_shared`, or `global`; `global` is high-risk by default and commonly yields a review-needed deferred path rather than an immediate write
- `<native-memory-fidelity>`: the truthfulness level of delivered or portable content, currently values such as `lossless`, `structured_partial`, or `preview_only`
- `<native-memory-receipt>`: the truthful operation receipt; for `memory_conclude_native`, treat the top-level `state` as authoritative for review-needed or degraded outcomes, and use the receipt for the detailed write or non-write result such as `created`, `duplicate`, `superseded`, `not_written`, or `domain_assignment_failed`; receipts may also carry `descriptors` separately from `facets`/`tags`; `memory_import_bundle_native` uses per-entry statuses such as `imported` or `rejected`
- `<overlay-semantic-handles>`: optional semantic-layer carriers such as `entity_handles` and `relation_handles` that may appear on read, context, or portability surfaces when the runtime can preserve overlay-specific graph semantics truthfully
- `<w-question-semantic-interrogation>`: a pre-classification semantic heuristic that asks `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` about a source, memory candidate, or retrieved record before deriving canonical facets, descriptors, provenance cues, or graph-expansion anchors
- `<w-question-interrogation-bundle-phase-1>`: the landed phase-1 raw/intermediate runtime carrier at `properties.semantic.interrogation`; it is versioned with `version = 1` and `derivation_mode = post_extract_v1`, uses the slots `wer|was|wie|wo|womit|wovon|warum` plus `ambiguity_flags`, and stores item-level `value`, `confidence`, `status`, and `source_span`

## Compiled Context Projection Concepts

- `<compiled-context-projection>`: the bounded working-context product returned by `compile_context_projection`
- `<adapter-contract>`: the explicit adapter-facing contract block returned by `compile_context_projection`
- `<handoff-envelope>`: the optional A2A-style handoff wrapper returned when handoff mode is requested
- `<registry-candidates>`: manifest-first skill candidates that may accompany a compiled context projection for adapter/runtime routing; candidate lists may be empty before the registry is bootstrapped or before compatible, approved, security-scanned manifests exist
- `<registry-daemon-required-operations>`: all current registry operations are daemon-required and must go through GraphRAG MCP/API, including `graphrag_resolve_skill_candidates`, `graphrag_resolve_skill_manifest`, `graphrag_register_skill_manifest`, `graphrag_register_skill_version`, `graphrag_store_skill_content`, `graphrag_record_runtime_compatibility`, `graphrag_record_approval`, `graphrag_record_security_scan`, `graphrag_materialize_skill`, `graphrag_revoke_skill_manifest`, and `graphrag_deactivate_materialized_skill`
- compiled context is now semantic-layer truthful: it can preserve `facets`, `descriptors`, and optional `<overlay-semantic-handles>` instead of flattening everything into raw text or free tags
- `<w-question-semantic-interrogation>` should guide Pi-side interpretation of bounded context products before callers reduce them to memory writes, summaries, or multi-hop expansion cues
- `<w-question-interrogation-bundle-phase-1>` should be treated as additive raw/intermediate evidence, not as a new facet taxonomy, and not as proof that broader traversal consumption already exists
- phase 1 is graph-ready, not graph-complete: callers may see `descriptors`, semantic handles, and explicit `interrogation` readback before later phases teach `multi_hop` or other traversal paths to exploit the new anchors more deeply
- truthful sparse behavior remains valid: `compile_context_projection` may still return `status: sparse` with explicit `degraded_reasons` even after phase-1 W-question rollout
- session memory is conservatively excluded from handoff when explicit session and thread context are absent

## Optional Skill Sync Placeholders

The current GraphRAG runtime now exposes a live manifest-first governed skill registry and lifecycle surface.
These placeholders still do not mean that Pi automatically syncs registry entries into Pi runtime skill files. Registry-backed file sync remains a separate runtime concern that must be verified explicitly.

- `<skill-root>`: the root directory containing the reusable GraphRAG skill collection
- `<skill-id>`: the runtime-neutral canonical identity of a skill, for example `graphrag:graphrag-research`
- `<runtime-relative-namespace-path>`: the runtime-relative materialization path of a skill, for example `graphrag/graphrag-research`
- `<runtime-skill-root>`: the runtime-managed root directory that such a runtime would use for active skill materialization
- `<runtime-skill-package-root>`: the package root that such a runtime would derive from `<runtime-skill-root>` plus `<runtime-relative-namespace-path>`
- `<runtime-skill-file>`: the concrete skill file path that such a runtime would derive from `<runtime-skill-root>` plus `<runtime-relative-namespace-path>`
- `<skills-disabled-archive-root>`: the archive location that such a runtime would use outside normal skill discovery

Manifest-first runtime file sync is still optional even though the registry itself is now live. Verify that the current Pi runtime explicitly implements file materialization before relying on the placeholders above.
