---
name: agent-creator
description: Create new agents, subagents, role-agents, and delegation-ready agent artifacts. Use when a user wants to design a specialized role with explicit scope, tool access, escalation rules, input and output contracts, or runtime-specific subagent packaging.
compatibility: Pi coding agent with read, write, edit, and bash. Designed for agent role design, subagent authoring, and runtime-specific agent packaging.
---

# Agent Creator

Create and improve agent-like artifacts in a domain-agnostic way.

Use this skill when the task is about building a **specialized role**, not just a reusable skill. This includes:

- subagents
- role-agents
- delegated workers
- runtime-specific agent packages
- agent manifests or instructions with scoped responsibilities
- escalation and delegation behavior
- tool authority and boundaries

## W-Question and Evidence Gate

Before creating, refactoring, reviewing, or installing durable skill or agent artifacts, apply `../portable/references/w-question-evidence-standard.md` proportionally. Answer or mark `N/A — reason` for who uses the artifact, what boundary it owns, where it may read or write, how it validates output, which tools or authority it receives, what it depends on, what failure mode it prevents, why this artifact shape is correct, and which evidence supports the decision.

For non-trivial artifacts, include or reference an Evidence Ledger and Decision Ledger. Preserve explicit input contracts, output contracts, tool authority, forbidden actions, escalation rules, validation evidence, and handoff targets. Stop and ask before expanding runtime authority, creating new write paths, changing installed skill scope, or relying on unverified session memory.


## Core Principle

An agent artifact should define:

- what role the agent owns
- when that role should be invoked
- what it is allowed to do
- what it must not do
- what inputs it expects
- what outputs it returns
- when it escalates or hands off

A role-agent is not just a skill with a fancier name. If the artifact has role, scope, authority, delegation, escalation, or long-running responsibility semantics, it belongs here.

## Process

### 1. Capture the role
Determine:
- what responsibility the agent owns
- what it should refuse or escalate
- whether it is autonomous, assistive, or delegated
- whether it is generic or runtime-specific

### 2. Set boundaries
Define:
- scope
- authority
- tools available
- escalation rules
- output contract
- success criteria

### 3. Choose the artifact shape
Common shapes:
- subagent definition
- role-agent instructions
- runtime-specific agent package
- agent adapter over an existing skill or skillset

### 4. Write the artifact
When writing an agent artifact, make sure it explains:
- role and mandate
- inputs
- outputs
- escalation / handoff
- boundaries
- runtime-specific packaging if needed

## Writing Rules

- keep the role narrow enough to trigger clearly
- separate semantic role from runtime adapter details when possible
- if the user really needs a reusable triggered capability instead of a role, recommend `skill-creator`
- if the user needs a portable capability contract across runtimes, recommend `skillset-creator`

## Pi Installation Guidance

Install under:
```text
~/.pi/agent/skills/agent-creator/SKILL.md
```

Reload with:
```text
/reload
```

## Output Expectations

Produce one or more of:
- agent role definition
- subagent instructions
- delegation model
- escalation rules
- runtime-specific packaging notes
- review of an existing agent artifact

## Do Not

- do not treat every repeated workflow as an agent
- do not hide tool authority or escalation logic
- do not collapse generic skill contracts and runtime-specific agent packaging into one muddy artifact unless explicitly required
