# Registry Lifecycle Runbook

The Pi gateway exposes registry operations with `graphrag_*` tool names. Candidate resolution may be empty before registry bootstrap or before compatible, approved, security-scanned versions exist.

## Bootstrap And Publish

1. Register the manifest with `graphrag_register_skill_manifest`.
2. Register the concrete version with `graphrag_register_skill_version`; retain the returned or chosen `version_id`.
3. Store linked content with `graphrag_store_skill_content`.
4. Record runtime compatibility for the same `version_id` with `graphrag_record_runtime_compatibility`.
5. Record approval for the same `version_id` with `graphrag_record_approval`.
6. Record the security-scan result for the same `version_id` with `graphrag_record_security_scan`.

## Resolve And Inspect

1. Resolve candidates with `graphrag_resolve_skill_candidates`. Empty candidates are valid before bootstrap or eligibility records.
2. Resolve the selected manifest/version with `graphrag_resolve_skill_manifest`.
3. Show or inspect the returned manifest, version, content, compatibility, approval, and scan evidence before runtime use.

## Materialize

1. Use `graphrag_materialize_skill` only after manifest, `version_id`, compatibility, approval, and security-scan evidence match.
2. In current Pi reality, materialization records an event only; it does not create, overwrite, archive, or delete Pi `SKILL.md` files unless a separate file-sync adapter exists.

## Revoke Or Deactivate

1. Revoke an unsafe or superseded manifest/version with `graphrag_revoke_skill_manifest`.
2. Deactivate a materialized skill event with `graphrag_deactivate_materialized_skill`.
3. Do not assume revocation or deactivation mutates Pi files without an explicit adapter that provides deterministic mapping, provenance, archive, overwrite safety, and rollback.
