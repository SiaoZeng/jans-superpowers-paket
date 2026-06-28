# Memory Policy

## Primary Native Surface

Prefer GraphRAG's native memory products over ad-hoc raw layer writes for durable memory tasks.

Primary tools by job:

- durable write -> `memory_conclude_native`
- durable profile retrieval -> `memory_profile_native`
- prompt-ready remembered context -> `memory_context_native`
- prior reasoning and decision recall -> `memory_reasoning_context_native`
- session continuation summary -> `memory_session_summary_native`
- portability -> `memory_export_bundle_native`, `memory_import_bundle_native`
- conservative lifecycle cleanup -> `invalidate_memory`
- review-first consolidation -> `memory_housekeeping_candidates`, `memory_consolidate`, `memory_review_get`, `memory_review_update`, `memory_apply`

Use `add_knowledge` only when a task explicitly needs a non-native raw layer write and the native memory surface is not the right fit.

## Fresh Evidence Precedence

When a durable write requires fresh evidence, choose evidence by artifact quality and provenance strength, not by harness brand.

Preferred order:

1. already-ingested provenance that already supports the candidate memory
2. an ingestible session transcript from any compatible runtime
3. another stable source document that can be ingested cleanly
4. raw-layer direct ingest when the task explicitly calls for direct ingest or when native memory is not the right surface
5. ad-hoc temporary documents only as a last fallback

Session evidence is harness-agnostic. A Pi session, Claude Code session, OpenCode session, OsmiumSwarm session, or other agent-runtime session should be treated as equivalent when it provides comparable structured history, attribution, and provenance.

Do not create a temporary markdown evidence document merely because the originating session came from a different harness. Prefer the existing session transcript whenever it is ingestible or has already been ingested into usable provenance objects.

## General Memory Gate

Write only when the content is:

1. durable
2. reusable
3. verified if it is a fact, or explicitly ratified if it is a decision or procedure
4. likely to improve future retrieval or execution

Write-time guidance for general memory:

- choose an explicit domain when possible to mark the bounded context
- before classification, ask `wer/was/wie/wo/womit/wovon/warum-wieso-weshalb` about the candidate so the memory write starts from semantic roles rather than shallow keywording
- add canonical facets when cross-cutting classification matters; in Wave 1 the runtime may still store them on the physical `tags` substrate
- prefer `memory_conclude_native`
- do not send free-form topical labels as `facets` or `tags` to native memory or raw write surfaces
- do not treat labels such as `finding`, product names, model names, hardware names, hostnames, incident labels, or ad-hoc topic bundles as canonical facets by default
- those open labels belong in `descriptors` or, where a surface explicitly needs it, in compatibility-only labels rather than canonical facets
- when a caller has compatibility-only topical labels, keep them out of `memory_conclude_native` and `add_knowledge` unless the runtime explicitly supports them as compatibility tags for that exact surface
- `memory_import_bundle_native` is the normal compatibility-preserving import surface; it may map compatibility-only payloads into canonical facets plus compatibility tags truthfully, while also preserving explicit `descriptors` and optional overlay semantic handles when present
- `add_knowledge` is strict: use it only with explicit canonical resource-class or knowledge-form facets such as `fact`, `decision`, `procedure`, `documents`, `pages`, `blocks`, `files`, `symbols`, `code-graph`, `memory`, `general-memory`, or `user-memory`
- provide grounded fresh evidence; ungrounded or recalled-memory-only candidates fail closed
- prefer existing session-shaped evidence over creating a new temporary document when the session transcript is ingestible and provenance-adequate
- if a user explicitly requests direct ingest without temporary files, prefer the raw direct-ingest path over creating an ad-hoc evidence document unless policy or runtime constraints make that impossible
- do not treat `preview_only` fidelity as storable memory
- choose the smallest sufficient scope using `agent_id`, `user_id`, `session_id`, `thread_id`
- choose visibility intentionally:
  - `private` -> scoped to a concrete caller, session, thread, or narrow context and requires at least one scope key
  - `agent_shared` -> reusable across one agent identity and requires `agent_id`
  - `workspace_shared` -> reusable across a user or workspace identity and requires `user_id`
  - `global` -> broad reusable knowledge with empty scope; treat this as higher-risk and expect a review-needed deferred path unless the runtime explicitly allows immediate write
- use canonical facets such as `memory` plus `general-memory` when cross-cutting retrieval or classification benefits from them, but do not rely on facets as a replacement for native scope or visibility
- expect truthful outcomes from `memory_conclude_native`; check the top-level `state` first for review-needed or degraded outcomes, then inspect the receipt for detailed write or non-write results such as `created`, `duplicate`, `superseded`, `not_written`, or `domain_assignment_failed`
- receipts and serving products may carry `descriptors` separately from `facets`/`tags`; if the runtime surfaces them, preserve that distinction instead of reclassifying descriptors as canonical facets
- current portability/context products may also carry optional overlay semantic handles such as `entity_handles` and `relation_handles`; preserve them truthfully when present rather than flattening them into generic notes
- current read surfaces may also carry the phase-1 raw/intermediate W-question payload from `properties.semantic.interrogation`; preserve it as additive semantic evidence rather than collapsing it into free tags or pretending it is already a final canonical entity/relation decision
- the W-role heuristic may produce more than tags: it can also identify actor/subject roles, method/process cues, dependency/evidence basis, and reason/causal semantics that belong in descriptors, relations, provenance, or later graph traversal

Never write to durable memory:

- passwords
- API keys
- bearer tokens
- cookies or auth state
- private credentials
- secrets or secret-like material
- sensitive internal infrastructure details
- private local file locations
- internal hostnames or private endpoints
- auth file locations

## User Memory Gate

Write only when the content is:

1. stable across future sessions
2. clearly beneficial to future collaboration
3. not unnecessarily private or ephemeral
4. explicitly established by the user or clearly confirmed

User-profile writes require explicit user confirmation or an explicit remember/save signal.

User memory should stay minimal and high-signal. Prefer a few stable profile facts over many fine-grained preferences.

Write-time guidance for user memory:

- prefer `memory_conclude_native`
- do not send free-form topical labels as `facets` or `tags`; canonical user-memory writes should stay on stable facets such as `memory`, `user-memory`, `preferences`, `profile`, or another runtime-approved canonical facet
- open user-specific descriptors still belong in `descriptors` rather than canonical facets when the runtime supports them
- provide grounded fresh evidence; ungrounded user-memory candidates fail closed the same way as general memory candidates
- prefer existing session-shaped evidence over creating a new temporary document when the session transcript is ingestible and provenance-adequate
- if a user explicitly requests direct ingest without temporary files, prefer the raw direct-ingest path over creating an ad-hoc evidence document unless policy or runtime constraints make that impossible
- do not treat `preview_only` fidelity as storable user memory
- prefer `workspace_shared` with `user_id` for cross-session user memory across a broader workspace context
- use `private` with `user_id` plus an additional narrowing key such as `agent_id`, `session_id`, or `thread_id` when the memory should stay narrower than workspace scope
- use narrower `private` session or thread scope only when the memory should stay limited to a specific session, thread, or very narrow context
- do not use the obsolete `subject-id` convention
- use canonical facets such as `memory` plus `user-memory` only as secondary classification, not as a replacement for native scope or visibility

Never write to user memory, even with explicit confirmation:

- credentials or secrets
- financial or payment data
- government identifiers
- health data
- exact addresses or location history
- highly sensitive personal data with no clear durable collaboration value

## Retrieval First

Before any write:

1. check whether retrieval already contains the fact
2. avoid duplicate or redundant writes
3. write only the minimal durable form

Preferred retrieval path before a write:

- use the native memory serving tools when the task is about remembered context
- if an older skill, agent, or helper appears to emit ad-hoc tags or obsolete facet labels, fix the caller guidance first instead of weakening the runtime contract
- when retrieval or portability already returns explicit `descriptors`, `entity_handles`, or `relation_handles`, prefer preserving those fields over inventing new free-form facet labels during follow-on memory operations
- do not mistake the W-role heuristic for a new facet taxonomy; use it to derive better descriptors, relations, provenance cues, and, only where justified, a smaller set of canonical facets
- use `search`, `search_sources`, or `search_procedures` when the task is broader retrieval
- if the relevant evidence likely exists in a prior or current session transcript, prefer retrieving or ingesting that session artifact before inventing a new document-shaped evidence carrier
- treat session artifacts as harness-agnostic evidence sources; evaluate them by structure, provenance, and ingestibility rather than by the runtime that produced them
- use `check_duplicate` only as a focused duplicate check, not as a substitute for retrieval

When retrieving remembered data:

- pass `agent_id`, `user_id`, `session_id`, `thread_id` as appropriate
- use `as_of` when historical memory state matters
- retrieve user memory only when it is relevant to the current task

## Separation Rule

- use general memory for technical, project, system, and procedural knowledge
- use user memory for names, nicknames, preferences, and user profile conventions
- do not mix user profile facts into general technical memory
- do not store runtime `SKILL.md` artifacts in GraphRAG by default; keep runtime skills on disk unless an explicit manifest-first registry is actually implemented
