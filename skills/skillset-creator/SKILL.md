---
name: skillset-creator
description: Create portable skillsets that separate semantic capability contracts from concrete implementations and runtime adapters. Use when a user wants one reusable capability layer to work across Pi, Anthropic-style skills, OpenClaw, Hermes, MCP, Copilot, or other hosts without rewriting the core capability each time.
compatibility: Pi coding agent with read, write, edit, and bash. Designed for runtime-neutral capability contracts and adapter-aware packaging.
---

# Skillset Creator

Create and improve **portable capability layers**.

Use this skill when the user needs something broader than a single skill and more reusable than a runtime-specific integration. A skillset is the right shape when you need:

- one capability used across multiple runtimes
- a semantic contract above a wrapper or backend
- explicit separation between implementation, skillset contract, and adapters
- reusable operations such as list, get, create, update, cancel, inspect
- runtime-specific packaging without runtime-specific ownership of the core semantics

## W-Question and Evidence Gate

Before creating, refactoring, reviewing, or installing durable skill or agent artifacts, apply `../portable/references/w-question-evidence-standard.md` proportionally. Answer or mark `N/A — reason` for who uses the artifact, what boundary it owns, where it may read or write, how it validates output, which tools or authority it receives, what it depends on, what failure mode it prevents, why this artifact shape is correct, and which evidence supports the decision.

For non-trivial artifacts, include or reference an Evidence Ledger and Decision Ledger. Preserve explicit input contracts, output contracts, tool authority, forbidden actions, escalation rules, validation evidence, and handoff targets. Stop and ask before expanding runtime authority, creating new write paths, changing installed skill scope, or relying on unverified session memory.


## Core Principle

A skillset should define:

- the portable capability contract
- the stable operation set
- the input/output schemas
- how implementations attach below it
- how adapters attach above or beside it

A skillset is not the implementation itself.
A skillset is not a runtime-specific adapter.
A skillset is the **semantic layer** between those two.

## Process

### 1. Capture the reusable capability
Determine:
- what the reusable capability is
- which parts are semantic contract vs implementation detail
- which runtimes need adapters

### 2. Separate the layers
Always try to distinguish:
- implementation layer
- semantic skillset layer
- adapter layer

### 3. Define the contract
Specify:
- stable capability name
- operations
- inputs
- outputs
- lifecycle / states if relevant
- adapter expectations

### 4. Define the adapter model
For each runtime or host:
- what transport does it need?
- what naming changes are acceptable?
- what must remain identical to the core contract?

## Writing Rules

- prefer runtime-neutral names
- keep core operations generic and stable
- do not let one host runtime define the meaning of the whole skillset
- if the task is really only about one reusable `SKILL.md`, recommend `skill-creator`
- if the task is really about a role with delegation and escalation, recommend `agent-creator`

## Pi Installation Guidance

Install under:
```text
~/.pi/agent/skills/skillset-creator/SKILL.md
```

Reload with:
```text
/reload
```

## Output Expectations

Produce one or more of:
- skillset contract
- operation schema
- layer split between implementation / skillset / adapters
- runtime adapter guidance
- review of an existing skillset design

## Do Not

- do not confuse wrapper/backend code with the skillset layer
- do not let runtime adapters redefine the core capability
- do not name the skillset after one host runtime unless the user explicitly wants a host-specific package rather than a portable capability layer
