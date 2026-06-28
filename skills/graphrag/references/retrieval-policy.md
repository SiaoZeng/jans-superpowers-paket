# Retrieval Policy

## Primary Retrieval Routing

- code entities, symbols, source structure -> `search` on `structural`
- historical findings, decisions, episodes, and prior session evidence -> `search` on `episodic`
- facts, doc chunks, comments, durable knowledge -> `search` on `semantic`
- workflows and procedures -> `search_procedures`, then `procedure_steps` when the procedure is known
- artifacts, tables, diagrams, structured doc payloads -> `search` on `artifact`
- visual page retrieval or localized page evidence -> `search_visual`
- source-oriented grounding, text units, audit trail -> `search_sources`, then `inspect_source`
- domain browsing without a strong query -> `search_by_domain`
- facet-aware browsing or narrowing on in-scope core search/native-memory surfaces -> use the surface's facet filter when available
- relations and connected evidence -> `multi_hop` or `traverse`

## Native Memory Serving Routing

Use the native memory products when the task is really about remembered context rather than raw search hits:

- durable memory profile -> `memory_profile_native`
- prompt-ready context pack -> `memory_context_native`
- prior reasoning, decisions, and procedures -> `memory_reasoning_context_native`
- session continuation summary -> `memory_session_summary_native`

Use scoped filters `agent_id`, `user_id`, `session_id`, `thread_id` when remembered data should be constrained to a caller, workspace, session, or thread.
Use `as_of` when a historical slice matters.

## Retrieval Principles

- start with the narrowest likely live surface
- treat `domain` as bounded-context narrowing and `facets` as orthogonal cross-cutting narrowing rather than interchangeable axes
- expect current bounded products and some read surfaces to preserve `descriptors` separately from `facets`/`tags`; do not flatten descriptor-bearing results back into governed facet claims
- when present, preserve optional overlay semantic handles such as `entity_handles` and `relation_handles` instead of collapsing them into prose-only summaries
- when present, preserve the phase-1 raw/intermediate W-question carrier from `properties.semantic.interrogation` as `interrogation`; treat it as additive semantic evidence rather than as a canonical classification layer
- use `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` as a semantic interrogation heuristic before reducing retrieval output into summaries, tags, or follow-on writes
- the W-role heuristic is not a new facet list; it should help derive descriptors, relations, provenance cues, and multi-hop graph anchors from the retrieved material
- use provenance or source inspection when grounding matters
- expand only when the first retrieval is insufficient
- prefer bounded native memory products over assembling raw remembered rows by hand
- keep answers tied to retrieved evidence
- when preparing `multi_hop` or graph-oriented reasoning, use W-role interrogation to identify which actors, objects, methods, sources, dependencies, tools, and reasons should become graph expansion cues
- do not overclaim phase-1 traversal: the current runtime may preserve graph-ready anchors and explicit `interrogation` payloads before later phases teach broader traversal surfaces to consume them deeply
- `inspect_source` is currently the most reliable surface for direct `interrogation` readback; other search surfaces may preserve the value additively but need not surface the full raw bundle every time
- when `search_visual` returns localized evidence, preserve that locality instead of flattening it into generic page summaries

## Pi MCP Gateway Naming

Pi exposes GraphRAG MCP tools with a `graphrag_*` gateway prefix. Runtime/reference names may omit that prefix, but Pi client calls should use the concrete gateway names, for example:

- `search` -> `graphrag_search`
- `search_sources` -> `graphrag_search_sources`
- `compile_context_projection` -> `graphrag_compile_context_projection`
- `resolve_skill_candidates` -> `graphrag_resolve_skill_candidates`
- `resolve_skill_manifest` -> `graphrag_resolve_skill_manifest`
- `get_job_status` -> `graphrag_get_job_status`

## Skill-Related Retrieval

For skill-related knowledge, use `graphrag-skills`.
Do not assume runtime `SKILL.md` artifacts are stored in GraphRAG unless a manifest-first registry is explicitly implemented in the current runtime.
Registry candidate lists may be empty before bootstrap, before content/version records exist, or before compatibility, approval, and security-scan records make a manifest eligible. Treat an empty `graphrag_resolve_skill_candidates` result as an allowed pre-bootstrap state, not proof that file-based Pi skills are absent.
