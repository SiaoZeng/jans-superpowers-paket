# Sync Policy

## Default Mode

Runtime skill files on disk are the source of truth by default.
The current GraphRAG runtime now exposes a live manifest-first governed skill registry, but that does not automatically make Pi-local runtime files registry-backed.

Default-mode rules:

- keep runtime skill artifacts such as `SKILL.md` on disk
- store only derived reusable findings about skills in GraphRAG
- use `graphrag-research` for generic retrieval
- do not claim Pi-local file sync semantics that the runtime does not actually expose

## What May Be Stored In GraphRAG By Default

Safe default storage:

- reusable workflow findings about how skills should be structured or used
- review findings about skill quality, policy, validation, or portability
- generalized lessons that apply beyond one concrete runtime artifact
- descriptor-bearing or relation-bearing skill knowledge when the runtime truthfully serves it as knowledge rather than as Pi-local file state
- W-question-derived skill semantics such as actor, dependency, tool, reason, or source roles when they are stored as knowledge semantics rather than file-sync metadata

Do not store by default:

- runtime `SKILL.md` files as if GraphRAG were the canonical live registry
- private local sync targets
- auth-bearing locators
- ad-hoc claims that a skill is runtime-approved when no runtime approval mechanism exists

## Current Pi Reality

The live registry supports records and materialization events. Current Pi materialization does not create, overwrite, archive, or delete Pi `SKILL.md` files. Pi file sync requires a separate adapter that provides all of the following before it is considered safe:

- deterministic mapping from registry manifest to Pi runtime file targets
- durable provenance tying each on-disk file to a specific manifest and content version
- overwrite safety that refuses unrelated or ambiguous local files
- archive behavior for deactivation or replacement
- rollback behavior for failed or partial sync attempts

Until such an adapter exists and is explicitly wired into the Pi runtime, `graphrag_materialize_skill` is an event-recording registry operation, not Pi file mutation.
Current runtime outputs may still carry semantic-layer truth such as `descriptors` or optional overlay handles around skill-related knowledge, but that does not change the file-sync boundary.

## Registry Bootstrap Sequence

Use the Pi `graphrag_*` gateway names for current registry bootstrap:

1. `graphrag_register_skill_manifest` to create or update the canonical manifest identity and runtime mapping metadata
2. `graphrag_register_skill_version` to register a concrete `version_id` for the manifest
3. `graphrag_store_skill_content` to store content linked to that version
4. `graphrag_record_runtime_compatibility` to mark the `version_id` compatible with the target runtime
5. `graphrag_record_approval` to record governance approval for the `version_id`
6. `graphrag_record_security_scan` to record the security-scan outcome for the `version_id`
7. `graphrag_resolve_skill_manifest` or `graphrag_resolve_skill_candidates` to verify the eligible manifest/version can be resolved
8. `graphrag_materialize_skill` only as a materialization event unless a separate Pi file-sync adapter with deterministic mapping, provenance, overwrite safety, archive, and rollback exists

`version_id` compatibility, approval, and security-scan records are part of eligibility. Missing or mismatched records should be treated as not materializable for runtime use, even if a manifest exists.

## Opt-In Manifest-First Mode

The GraphRAG registry lifecycle now exists live. Only use manifest-first file-sync behavior when the current runtime explicitly implements materialization into runtime file targets.
In that opt-in mode:

1. resolve the canonical manifest by `skill-id`
2. verify lifecycle, `version_id` compatibility, approval, and security scan there
3. resolve the linked approved content deterministically
4. materialize only into the runtime-managed target derived from `<runtime-skill-root>` and `<runtime-relative-namespace-path>`
5. abort on ambiguity, provenance mismatch, or competing active manifests

Registry-backed approval, compatibility, revocation, materialization events, and write-side governance are now live GraphRAG behavior. Pi-local file sync, archive-on-disable, rollback, and package-level on-disk materialization still require explicit runtime adapter support.

## Identity And Mapping In Opt-In Mode

If a manifest-first runtime is explicitly present:

- each stored skill should have one canonical `skill-id`
- the canonical `skill-id` should stay runtime-neutral, for example `graphrag:graphrag-research`
- runtime mapping should be derived from `<runtime-skill-root>` plus the manifest's `<runtime-relative-namespace-path>`
- multi-file sync should treat `<runtime-skill-package-root>` as one unit
- only one active manifest should exist per `skill-id`

## Sanitization Rule

Before storing or syncing any skill-related content:

- never persist absolute or private local paths unless the file is intentionally local runtime documentation rather than durable GraphRAG memory
- do not persist secrets, tokens, cookies, auth state, or private credentials
- apply the same denylist principles as `../../references/memory-policy.md`
- store only the minimal durable content needed for retrieval or an explicitly implemented sync flow

## Sync Safety In Opt-In Mode

Before syncing a skill into runtime files:

1. verify that registry-backed file sync is actually implemented in the current Pi runtime
2. verify the manifest is the intended record
3. verify lifecycle state and runtime approval
4. verify the materialization target is deterministic
5. verify referenced content passes sanitization
6. verify on-disk provenance before overwrite or removal
7. abort if mapping or ownership is ambiguous
8. avoid overwriting unrelated local skills

If provenance is missing, malformed, or mismatched, overwrite or removal must abort to manual review.
