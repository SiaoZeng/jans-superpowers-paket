---
name: security-review
description: Use when reviewing code, configuration, dependencies, secrets, shell commands, external inputs, service boundaries, permissions, privacy, or agent/tool workflows for security risk.
---

# Security Review

## W-Question, Evidence, and Handoff Gate

When this workflow creates, reviews, executes, verifies, delegates, completes, or hands off durable work, apply `../../../references/w-question-evidence-standard.md` proportionally before the next irreversible or hard-to-review step. Capture the relevant wer, was, wann, wo, wie, womit, wovon, wogegen, warum/wieso/weshalb, and welche evidence in the saved artifact, review, checkpoint, or final report.

Use an Evidence Ledger, Session Evidence, Decision Ledger, Autonomy Contract, Stop Conditions, and Validation Evidence when prior sessions, handovers, reviews, branches, worktrees, tools, or autonomous continuation affect safety. Stop or hand back when a required source artifact is missing, review state is stale, validation cannot prove the claim, scope or authority would expand, or the next workflow step would rely on hidden chat context.


## Overview

Use this workflow for parent/controller-led security review. The parent selects `security-review`, bounds the review target, applies the safe-command policy, and may delegate narrow read-only slices to the `security-reviewer` agent when useful.

This skill is evidence-bounded and non-exploitative. It supports security review of code, prompts, shell commands, dependencies, local administrative workflows, privacy-sensitive data handling, and LLM/agent tool orchestration. It does not certify that a system is secure.

## When to Use

Use this workflow when a task touches any of these areas:

- credentials, tokens, secrets, keys, logs, or other sensitive data
- authentication, authorization, permissions, privilege boundaries, or service boundaries
- shell commands, subprocesses, file paths, environment variables, downloads, parsers, or external inputs
- dependency changes, build scripts, lockfiles, artifacts, provenance, or supply-chain trust
- prompts, tools, MCP servers, GraphRAG ingestion, agents, delegated workflows, or untrusted LLM context
- privacy, retention, telemetry, data minimization, or user-visible security claims

Do not use this workflow as a penetration-testing, exploitation, fuzzing, brute-force, or broad-scanning workflow.

## Hard Gate

Before reviewing, stop and narrow the task if the requested work would require unsafe action. Without a separate approved bounded security-testing plan, do not:

- exploit vulnerabilities, develop proof-of-exploit steps, bypass controls, or access data beyond inspected evidence
- print a raw credential, token, key, cookie, session value, or secret-like value; redact sensitive evidence instead
- run destructive commands, alter permissions, rotate credentials, modify configuration, install packages, restart services, or mutate dependency state
- run broad scans, fuzzing, brute force, credential stuffing, network-heavy probes, or unbounded discovery
- run unbounded network, GPU, background, or long-running commands
- claim complete security assurance, compliance certification, or absence of all vulnerabilities

If these actions appear necessary, output the blocked area, the safe minimum context needed, and the handoff needed for a separate bounded plan.

## Safe Command Policy

Allowed commands are limited to read-only inspection and bounded diagnostics:

- reading assigned files, diffs, manifests, lockfiles, config, prompts, and docs
- bounded `rg`, `grep`, `find`, `ls`, and metadata inspection over the assigned review target
- local static inspection that does not install tools, call external services, mutate files, or reveal secrets

When inspecting secrets or secret-like material, confirm presence through safe metadata only, such as file path, variable name, safe prefix, length, hash presence, or redacted excerpt. Always redact raw values.

## Triage Phase

Define the review boundary before inspecting details:

- review target: files, diff, feature, command, service, prompt, agent, dependency, or workflow under review
- trust boundaries: trusted sources, untrusted sources, external integrations, user-controlled inputs, generated content, and data crossing points
- actors: users, operators, services, agents, tools, attackers, and maintainers relevant to the boundary
- privileges: filesystem, process, network, credential, service, package, and tool capabilities inside the boundary
- inputs: CLI args, environment variables, files, network data, prompts, model outputs, GraphRAG content, dependencies, and config
- outputs: logs, files, commands, API calls, tool calls, messages, artifacts, telemetry, and user-visible responses
- data sensitivity: credentials, PII, private code, business data, system paths, logs, and model context
- deployment assumptions: local-only, developer machine, CI, production, privileged host, service account, offline, or networked mode
- untrusted-content boundaries: any place where external text, documents, code, model output, dependency metadata, or user input may influence tools or decisions

If the smallest safe boundary cannot be established, report the missing context and assumptions instead of guessing.

## Process Flow

1. Restate the review boundary and threat model assumptions.
2. Select applicable review lenses from the checklist reference.
3. Inspect evidence using the safe-command policy.
4. Classify each substantive finding by severity.
5. For each finding, identify root cause and similar-issue search scope.
6. Recommend concrete remediation and validation checks for a separate implementation or verification step.
7. State residual risk, confidence, and uninspected areas.
8. Hand off to the correct workflow or agent delegation when needed.

No finding is valid without evidence. Absence of findings is not proof of security; it only means no evidence-backed finding was identified within the inspected boundary.

## Review Lenses

Use only the lenses that match the bounded task. The detailed checklist lives in `references/security-review-checklist.md`.

- Application Security: input validation, injection, authn/authz, token handling, crypto, parsers, logging, privacy, and business logic.
- CLI/System Security: shell quoting, command injection, destructive flags, path traversal, environment variables, privileged paths, file permissions, and bounded process execution.
- Supply Chain Security: dependency changes, lockfiles, downloads, build scripts, artifact provenance, tampering, and trust assumptions.
- LLM/Agent Security: prompt injection, indirect prompt injection, untrusted content, tool authorization, least privilege, sensitive information disclosure, excessive agency, and human-in-the-loop controls.

## Severity Model

Use these severity categories in findings. Detailed definitions and examples live in `references/severity-model.md`.

- Critical: likely credential exposure, privilege escalation, remote code execution, destructive injection, unauthorized sensitive data access, major privacy breach, or supply-chain compromise in the inspected scope.
- High: likely exploitable vulnerability with meaningful confidentiality, integrity, availability, privacy, privilege, or supply-chain impact.
- Medium: plausible vulnerability, unsafe default, missing control, or incomplete boundary requiring remediation, without clear immediate exploitability.
- Low: defense-in-depth, hardening, validation, logging, documentation, or usability concern that reduces security margin.
- Informational: relevant security context, assumptions, or observations without an immediate vulnerability.

Do not inflate severity without exploitability conditions and impact. Mark confidence when evidence is partial.

## Required Finding Format

Each substantive finding must include:

- Severity
- Title
- Evidence with redacted secret-like values and no raw credential output
- Impact
- Exploitability conditions
- Root cause
- Affected paths or components
- Remediation
- Validation
- Similar-issue search guidance
- Confidence
- Residual risk

If evidence is insufficient, report the item as an assumption, question, or residual risk instead of a finding.

## Output Format

Use these headings:

```markdown
## Review Boundary

## Threat Model Assumptions

## Evidence Inspected

## Findings

## Remediation and Validation

## Similar-Issue Search

## Residual Risk

## Handoff
```

For no-findings reviews, keep the headings and explicitly state that absence of findings is not proof of security.

## Handoff Guidance

- Use `systematic-debugging` when a suspected vulnerability depends on unclear runtime behavior or a failing reproduction that must be understood before fixing.
- Delegate dependency-focused evidence gathering to `dependency-auditor` when the bounded task is about manifests, lockfiles, downloads, build scripts, provenance, or package risk.
- Delegate validation-design work to `test-writer` when a remediation needs concrete tests, abuse cases, or regression checks.
- Delegate operational hardening review to `devops-sre` when service boundaries, deployment assumptions, logging, permissions, or runtime controls need infrastructure expertise.
- Use `verification-before-completion` before claiming a remediation or review process is complete.
- Use `requesting-code-review` after meaningful security-sensitive changes or before integration.

Agent delegations are bounded role tasks, not automatic skill injection. Do not add `skills:` frontmatter or assume subagents receive this workflow unless the parent provides the relevant context.

## References

- `references/security-review-checklist.md`
- `references/severity-model.md`
