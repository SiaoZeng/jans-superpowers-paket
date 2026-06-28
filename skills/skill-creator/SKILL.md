---
name: skill-creator
description: Create new agent skills, refactor existing skills, and package reusable skillsets for different runtimes. Use when a user wants to design, review, improve, standardize, or install a SKILL.md-based capability, especially when the skill should be portable across Pi, Anthropic-style skills, Copilot-style skills, MCP adapters, or runtime-specific wrappers.
compatibility: Pi coding agent with read, write, edit, and bash. Designed for Agent Skills style repositories and local Pi skill installation.
---

# Skill Creator

Create, review, and evolve skills in a domain-agnostic way.

This skill is for building **reusable capabilities**, not just writing one-off prompts. It should be used whenever the task is about:

- creating a new `SKILL.md`
- refactoring or improving an existing skill
- splitting implementation, skill contract, and runtime adapters cleanly
- packaging a capability so it can be reused across multiple agent runtimes
- turning an existing workflow, wrapper, tool, or process into a skill or skillset
- reviewing whether a skill is too narrow, too runtime-specific, or too implementation-coupled

## W-Question and Evidence Gate

Before creating, refactoring, reviewing, or installing durable skill or agent artifacts, apply `../portable/references/w-question-evidence-standard.md` proportionally. Answer or mark `N/A — reason` for who uses the artifact, what boundary it owns, where it may read or write, how it validates output, which tools or authority it receives, what it depends on, what failure mode it prevents, why this artifact shape is correct, and which evidence supports the decision.

For non-trivial artifacts, include or reference an Evidence Ledger and Decision Ledger. Preserve explicit input contracts, output contracts, tool authority, forbidden actions, escalation rules, validation evidence, and handoff targets. Stop and ask before expanding runtime authority, creating new write paths, changing installed skill scope, or relying on unverified session memory.


## Core Principle

A skill should describe:

- **when** to use it
- **what** it enables
- **which inputs** it expects
- **which outputs** it should produce
- **which resources** or helper files belong to it
- **which steps** or decision logic the agent should follow

A skill should **not** be just a raw API description or a random prompt dump.

## Operating Modes

### Mode 1: Create a new skill
Use this when the user has an idea, workflow, wrapper, tool, or repeatable process that should become a skill.

### Mode 2: Improve an existing skill
Use this when a skill already exists but needs better triggering, clearer structure, better docs, or cleaner packaging.

### Mode 3: Convert implementation into a portable skillset
Use this when a working implementation exists already, but the user wants a reusable semantic layer on top of it, such as a runtime-agnostic skillset plus runtime-specific adapters.

## Process

### 1. Capture intent
First determine:

- what capability the user wants to package
- who or what will use it
- whether it is domain-specific or domain-agnostic
- whether it is a single skill or a broader skillset
- whether there is already an implementation artifact underneath it

### 2. Identify the right boundary
Decide which layer is being created:

- **implementation layer**: concrete backend, wrapper, scripts, API, execution logic
- **skill layer**: semantic capability contract, usage rules, input/output model, reusable behavior
- **adapter layer**: runtime-specific integration for OpenClaw, Hermes, MCP, Copilot, Pi, or another host

When possible, keep these layers separate.

If the request is actually about building a role-bound agent, subagent, or delegated worker with authority and escalation rules, prefer `agent-creator`.
If the request is really about building a portable capability layer above implementations and below runtime adapters, prefer `skillset-creator`.

### 3. Choose the correct artifact shape
Use the smallest safe shape:

- **single skill** when one capability can be described and invoked directly
- **skillset** when the capability is broader and should support multiple runtime adapters or multiple tool surfaces
- **runtime adapter skill** only when one host environment needs its own thin wrapper over a generic skillset

### 4. Design the skill structure
A good skill package typically contains:

```text
skill-name/
├── SKILL.md
├── references/
├── scripts/
└── assets/
```

Guidelines:

- put durable detail into `references/`
- put deterministic helper logic into `scripts/`
- keep `SKILL.md` readable and action-oriented
- avoid bloating `SKILL.md` with giant dumps when structured references would work better

### 5. Write or refactor the `SKILL.md`
Ensure the result has:

- valid frontmatter
- a specific, trigger-friendly description
- a clear statement of what the skill does
- explicit usage and decision flow
- references to bundled files when needed
- clear separation between production guidance and exploratory/demo material if both exist

## Writing Rules

### Frontmatter
Must include:

- `name`
- `description`

Prefer also adding:

- `compatibility`

### Naming
Prefer lowercase hyphenated names.

Examples:
- `skill-creator`
- `image-generation-skillset`
- `openclaw-image-adapter`

### Descriptions
Descriptions should be a little trigger-friendly rather than too timid.

Bad:
- `Helps create skills.`

Better:
- `Create new agent skills, refactor existing skills, and package reusable skillsets for different runtimes. Use when a user wants to design, review, improve, standardize, or install a SKILL.md-based capability.`

### Layer discipline
If the capability spans multiple concerns, document the split explicitly:

- implementation
- skillset
- adapters

Do not hide runtime-specific logic inside a supposedly generic skill.

## Review Checklist

Before calling a skill ready, verify:

- the name matches the directory
- the description is specific and triggerable
- the skill explains when to use it
- the skill explains what the outputs should be
- helper docs/scripts are referenced clearly
- the skill is not over-coupled to one runtime unless that is intentional
- if demo/inspiration material exists, it is explicitly non-normative

## Pi Installation Guidance

For Pi, install a global skill under:

```text
~/.pi/agent/skills/<skill-name>/SKILL.md
```

Or project-local under:

```text
<repo>/.pi/skills/<skill-name>/SKILL.md
```

After adding or editing the skill, reload Pi skills with:

```text
/reload
```

## Output Expectations

When using this skill, produce one or more of the following as appropriate:

- a proposed skill name and description
- a full `SKILL.md`
- recommended directory structure
- notes on how to split generic skillset vs runtime adapters
- installation instructions for Pi or another target runtime
- a review of an existing skill with concrete improvements

## Do Not

- do not produce a runtime-specific skill when the user asked for a domain-agnostic one
- do not collapse implementation and semantic contract into one confused artifact if separation helps
- do not treat a raw HTTP API as automatically equal to a skill
- do not leave the trigger description vague
- do not bury important usage rules in unrelated reference files
- do not absorb responsibilities that belong to `agent-creator` or `skillset-creator` just because the request uses the word "skill" loosely

## If the user already has a working implementation

When a backend or wrapper already exists, prefer this order:

1. identify the implementation layer
2. define the reusable skill or skillset contract above it
3. define runtime-specific adapters below or beside that contract
4. install the resulting skill into Pi if requested

## References

If needed, read local or external reference material about skill authoring, Agent Skills format, or runtime-specific adapter conventions before drafting the final skill.
