# Security Review Severity Model

Use this model for evidence-backed security findings. Severity combines impact, exploitability conditions, privilege required, exposed data sensitivity, affected boundary, and confidence. No evidence means no finding. absence of findings is not proof of security; it only describes the inspected scope.

## Critical

A Critical finding is likely to cause severe compromise inside the inspected scope with realistic exploitability or direct sensitive exposure.

Typical signals:

- credential exposure involving live tokens, private keys, session secrets, password material, or deploy credentials
- privilege escalation to administrator, root, service account, production credentials, or cross-tenant access
- remote code execution, destructive command injection, arbitrary file write in privileged context, or unsafe deserialization with command impact
- unauthorized access to sensitive data, major privacy breach, or broad data exfiltration path
- supply-chain compromise, malicious dependency execution, tampered artifact, or untrusted installer with privileged effects
- LLM/agent tool abuse that can trigger destructive actions, leak secrets, or bypass human approval through connected tools

Example contexts:

- Application: auth bypass exposes another user's private records.
- CLI/system: untrusted input reaches a shell command running with elevated privileges.
- Supply chain: install hook downloads and executes mutable remote code.
- LLM/agent: indirect prompt injection can cause a tool-enabled agent to print or transmit secrets.

## High

A High finding is likely exploitable and has meaningful confidentiality, integrity, availability, privacy, privilege, or supply-chain impact, but does not clearly meet Critical criteria.

Typical signals:

- authorization flaw affecting important resources or roles
- injection risk with constrained but meaningful impact
- sensitive information disclosure requiring some precondition
- unsafe default that exposes privileged actions or private data in common deployments
- dependency or build-script risk with plausible exploitation path
- agent/tool workflow missing authorization for impactful but non-destructive operations

Example contexts:

- Application: object-level access control is missing for records belonging to other users.
- CLI/system: user-controlled path can overwrite files inside the project workspace.
- Supply chain: new dependency has unpinned install-time code execution and weak maintainer signals.
- LLM/agent: untrusted documents can instruct an agent to call read tools outside the intended review boundary.

## Medium

A Medium finding is a plausible vulnerability, unsafe default, missing control, or incomplete boundary that requires remediation but lacks clear immediate exploitability or high impact in the inspected evidence.

Typical signals:

- incomplete input validation where impact depends on downstream use
- missing rate limits, incomplete authorization checks, or weak session controls with limited scope
- logs may include sensitive metadata but not raw credentials
- shell command construction is fragile but current inputs are controlled
- dependency provenance or lockfile behavior is unclear enough to require follow-up
- prompt or tool boundary is ambiguous and could become unsafe with future changes

Example contexts:

- Application: parser accepts unexpected formats that could later feed a dangerous sink.
- CLI/system: command uses shell strings but current arguments are hardcoded.
- Supply chain: lockfile changes are unexplained and need review before trust is assumed.
- LLM/agent: parent/subagent handoff does not clearly mark untrusted content as data.

## Low

A Low finding is a defense-in-depth, hardening, validation, logging, documentation, or usability concern that improves security margin but is not a direct vulnerability in the inspected evidence.

Typical signals:

- missing explicit error handling around security-relevant but low-impact paths
- incomplete documentation of trust boundaries or operator assumptions
- logging could be clearer without currently exposing sensitive data
- validation could be stricter even though current callers are trusted
- dependency review metadata is incomplete but no risky change is identified
- agent prompt could express a safety boundary more clearly

Example contexts:

- Application: security-sensitive branch lacks a regression test.
- CLI/system: command timeout is documented in caller but not near helper function.
- Supply chain: package update lacks a short rationale in the change notes.
- LLM/agent: read-only role mentions redaction but not residual-risk confidence.

## Informational

An Informational item is relevant security context, an inspected assumption, or a non-vulnerability observation. It may guide future review without requiring immediate remediation.

Typical signals:

- no evidence-backed vulnerability, but a trust boundary or deployment assumption matters
- a safe pattern is confirmed and worth recording
- an area was intentionally out of scope and belongs in residual risk
- a control exists but its runtime configuration was not inspected
- a future change may require security review if scope expands

Example contexts:

- Application: endpoint is local-only according to inspected configuration.
- CLI/system: privileged path is referenced only in documentation.
- Supply chain: dependency version is pinned and unchanged.
- LLM/agent: subagent tool allowlist is read-only for the inspected role.

## Evidence Expectations

Every substantive finding must include:

- affected path, component, command, dependency, prompt, or workflow
- redacted excerpt or metadata sufficient to support the claim
- impact statement tied to confidentiality, integrity, availability, privacy, privilege, supply chain, or tool authorization
- exploitability conditions and assumptions
- root cause, not just symptom
- remediation that can be implemented by a separate worker
- validation that can prove the fix or reduce the risk
- confidence level: High, Medium, or Low
- residual risk and uninspected boundaries

Do not include a raw credential, token, key, cookie, session value, or private secret in evidence. Use safe prefixes, lengths, variable names, paths, hashes, or redacted excerpts.

## Non-Overclaiming Rules

- No evidence means no finding.
- Absence of findings is not proof of security.
- A review covers only the stated review boundary and evidence inspected.
- Unknowns belong in residual risk, not in inflated severity.
- Plausible but unconfirmed issues must include confidence and missing evidence.
- Security review is not compliance certification, penetration-test attestation, or complete vulnerability assurance.
- Severity may be lowered or raised only when evidence changes impact or exploitability conditions.
