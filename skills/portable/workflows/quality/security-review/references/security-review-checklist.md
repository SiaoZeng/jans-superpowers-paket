# Security Review Checklist

This checklist provides lenses for bounded security review. It is not a proof obligation for every task. Select only the sections that match the review boundary, threat model assumptions, and available evidence.

## Application Security

Review these areas when the target handles application logic, user input, data flows, APIs, services, or persisted state:

- Input validation: canonicalization, allowlists, size limits, encoding, type checks, and rejection of malformed or hostile input.
- Injection: command, SQL, NoSQL, LDAP, template, path, deserialization, prompt, log, expression, and script injection paths.
- Authentication: identity proofing, login flows, token issuance, token expiry, credential reset, MFA assumptions, and account recovery.
- Authorization: object-level access control, role checks, ownership checks, administrative paths, multi-tenant boundaries, and confused-deputy risks.
- Session and token handling: cookie flags, bearer token scope, storage, rotation, revocation, replay exposure, and accidental logging.
- Cryptography: use of vetted primitives, key storage, randomness, nonce handling, transport protection, password hashing, and downgrade risk.
- Deserialization and parsing: unsafe loaders, parser differentials, archive extraction, file type confusion, decompression limits, and schema validation.
- Logging and monitoring: sensitive data redaction, log injection, audit usefulness, retention assumptions, and access to logs.
- Privacy: data minimization, consent assumptions, collection, retention, transmission, user identifiers, and unnecessary exposure.
- Business logic: abuse cases, race conditions, limit bypass, workflow order violations, quota evasion, and trust in client-controlled state.

## CLI/System Security

Review these areas when the target builds commands, touches local files, runs subprocesses, changes configuration, or interacts with privileged paths:

- Shell quoting: argument arrays instead of shell strings, safe escaping, no interpolation of untrusted input, and shell-specific semantics.
- Command injection: subprocess calls, hooks, build scripts, aliases, environment expansion, globbing, pipes, redirection, and command substitution.
- Path traversal: normalization, symlink behavior, archive extraction, relative paths, temporary files, path joins, and write targets.
- Destructive flags: `rm`, `mv`, `chmod`, `chown`, `dd`, recursive deletion, force flags, overwrite behavior, and dry-run availability.
- Environment variables: secret exposure, path hijacking, proxy settings, locale, shell initialization, and inherited environment trust.
- File permissions: least privilege, umask, executable bits, group/world access, private key modes, and protected roots such as `/etc`.
- Privileged paths: sudo boundaries, service files, system config, package-manager state, credential stores, and root-owned files.
- Background processes: timeout requirements, orphan prevention, PID tracking, resource caps, and deterministic shutdown.
- Bounded commands: finite scope, finite runtime, no broad filesystem scans, no network-heavy scans, and no mutation during review.

## Supply Chain Security

Review these areas when dependencies, lockfiles, generated artifacts, installers, build scripts, downloads, or packaging change:

- Dependency changes: new packages, version jumps, transitive risk, maintainer trust, package namespace confusion, typosquatting, and abandoned projects.
- Lockfiles: unexpected churn, integrity hashes, source URLs, registry changes, generated metadata, and reproducibility assumptions.
- Downloads: transport security, pinned versions, checksums, signatures, mirrors, redirect trust, and offline behavior.
- Build scripts: preinstall/postinstall hooks, code generation, native compilation, network access, environment assumptions, and hidden side effects.
- Provenance: source-to-artifact traceability, build environment, release process, trusted builders, and SLSA-style tampering risk.
- Artifact tampering: binary blobs, vendored archives, generated files, checksum mismatch, unexpected executable content, and repository hygiene.
- Scorecard-style heuristics: branch protection, security policy, pinned dependencies, maintained status, CI practices, and vulnerability disclosure signals.
- Trust considerations: what is trusted by default, which artifacts are mutable, who can publish updates, and whether runtime loads remote code or plugins.

## LLM/Agent Security

Review these areas when prompts, agents, tools, GraphRAG content, MCP servers, external documents, generated code, or delegated workflows are involved:

- Prompt injection: direct malicious instructions in user input or documents that could override system, developer, workflow, or operator intent.
- Indirect prompt injection: hidden or remote instructions embedded in web pages, files, images, code comments, model outputs, retrieved context, or dependency metadata.
- Untrusted content boundaries: clear separation between data to analyze and instructions to follow; quoted untrusted content must not become policy.
- Tool/API authorization: least privilege, explicit user intent for sensitive actions, bounded tool scope, and no tool calls from untrusted instructions.
- Least privilege: read-only reviewers remain read-only; write-capable workers receive the smallest file/task scope needed.
- Sensitive information disclosure: no raw secrets in prompts, logs, reviews, GraphRAG ingestion, subagent handoffs, or final responses.
- Excessive agency: no autonomous service changes, package installs, broad scans, credential rotation, or destructive commands without explicit approved plan.
- Human-in-the-loop controls: require explicit controller/user approval for high-risk operations, external side effects, or sensitive data exposure.
- Context provenance: identify where retrieved context came from and whether it is authoritative, stale, user-controlled, or adversarial.
- Delegation safety: parent-provided instructions must bound subagent scope, tools, evidence expectations, redaction rules, and stopping conditions.
