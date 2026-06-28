---
name: dg-webresearch
description: Use when current web information is needed for quick discovery, especially for package versions, changelogs, release notes, bug reports, vendor docs, or recent facts that may be newer than model knowledge.
---

# DG Web Research

## W-Question and Provenance Gate

Before turning discovery into research conclusions, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Use the W-questions to define who needs the answer, what claim is being tested, when current information matters, where sources came from, how they were fetched, which tools were used, what prior artifacts the answer depends on, what risk the research prevents, why selected sources are credible, and which evidence supports each claim.

Maintain a provenance ledger for sources, retrieval dates, extraction methods, source quality, limitations, and discarded candidates when they affect the conclusion. Distinguish quick discovery from evidence-grade synthesis. Stop or downgrade confidence when authoritative sources cannot be fetched, browser extraction is incomplete, sources disagree without resolution, or the next workflow would depend on unverified claims.


## Overview

Use `dg` as the mandatory first step for web discovery when it is available. This skill is only for finding candidate sources quickly and choosing which ones deserve deeper follow-up.

In this environment, `dg` is usually a local CLI wrapper around the locally hosted degoog/SearXNG instance at `http://127.0.0.1:8082`.
Do not replace available `dg` with MCP search, browser search, GraphRAG search, or ad-hoc web tooling for initial discovery when `dg` is applicable.
If `dg` or the local endpoint is unavailable, record the blocker and either use an explicitly available alternative discovery tool, proceed from already-known candidate URLs, or stop with a discovery blocker. Do not hand off to another research workflow that also depends on `dg` unless candidate sources are already known.

This skill covers two domain-agnostic discovery modes:

- `quickresearch` -> gather up to **3** candidates
- `research` -> gather up to **5** candidates

Use `deep-research` when multiple sources must be compared or synthesized.
Use `browser-research` when CLI fetching is insufficient or a page depends on JavaScript and DOM interaction.

## When to Use

- A quick current fact lookup is needed.
- Official docs, changelogs, issues, or recent announcements must be found.
- The task starts with search, not with page interaction.
- The answer depends on finding likely source candidates first.

Do not use this skill for browser-only follow-up or evidence synthesis across multiple sources.

## Quick Start

Sanity check the local CLI/search path first if there is any doubt:

```bash
dg --help
curl -sf http://127.0.0.1:8082/ >/dev/null
```

Quickresearch default:

```bash
dg -j -n 3 "search query"
```

Research default:

```bash
dg -j -n 5 "search query"
```

Use larger counts only when discovery has clearly widened beyond the requested mode.

If `jq` is available:

```bash
dg -j -n 10 "search query" | jq -r '.results[] | "- \(.title)\n  \(.url)"'
```

## Discovery Workflow

1. Start with `dg` when available; otherwise record the unavailable command or endpoint and the chosen fallback: explicit alternative discovery tool, already-known candidate URLs, or blocker.
2. Pick the mode before searching:
   - `quickresearch` -> cap discovery at 3 candidates
   - `research` -> cap discovery at 5 candidates
3. If the topic is broad, run 2-3 focused queries instead of one vague query while staying within the mode cap.
4. Scan titles, snippets, and URLs for the best candidate sources.
5. Prefer official sources first.
6. Do not answer factual claims from snippets alone. Fetch selected sources or hand off to `deep-research` or `browser-research` before making factual assertions.
7. Only escalate away from `dg` if `dg` is unavailable, the local degoog endpoint is unreachable, selected sources must be fetched/synthesized, or the task has clearly moved beyond discovery.
8. Before browser escalation, try cheaper non-browser fetch paths when practical: JSON/API, static fetch, markdown only if clearly supported, targeted HTML extraction, then readable extraction.
9. Use `webctl` or any stateful browser path only through `browser-research` or after explicitly applying its Browser Safety Gate and browser provenance ledger.
10. Escalate to `deep-research` if multiple sources must be reconciled and candidate sources are known.
11. Escalate to `browser-research` if the chosen page cannot be handled cleanly via CLI.

## Query Patterns

Quick fact check:

```bash
dg -j -n 3 "latest rust stable version"
```

Docs or API lookup:

```bash
dg -j -n 5 "project feature official docs"
```

Release notes or changelog lookup:

```bash
dg -j -n 5 "project changelog release notes"
```

Recent news or updates:

```bash
dg -t news -n 5 "query"
```

Language-specific search:

```bash
dg -l de -n 5 "query"
dg -l en -n 5 "query"
```

## Provenance Ledger Gate

Discovery outputs must include a minimal source ledger. For each candidate that influences the next step, record:

- title
- URL
- source type, such as official docs, changelog, issue, advisory, maintainer post, or community discussion
- retrieval date or current session date
- discovery query and mode (`quickresearch` or `research`)
- snippet or reason selected
- limitations, such as snippet-only, not fetched, duplicate, or needs browser extraction

No factual synthesis claim may be made from this skill unless the selected source was fetched and cited; otherwise report candidates only.

## Source Quality Order

Prefer sources by query type:

For versions, APIs, and documented behavior:

1. Official vendor or project documentation
2. Official changelog or release notes
3. Official repository content and issue tracker
4. Maintainer posts or trusted engineering blogs
5. Community discussions

For regressions, incidents, or security-sensitive questions:

1. Official status pages or security advisories
2. Official repository issue tracker and linked pull requests
3. Official release notes or changelog
4. Official documentation
5. Community discussions

## Common Mistakes

- Using one vague search instead of several focused queries
- Skipping `dg` and jumping straight to MCP search, browser tooling, or GraphRAG for initial web discovery
- Trusting the first result without checking source quality
- Starting browser interaction before discovery is complete
- Using this skill for synthesis instead of escalating to `deep-research`

## Environment Notes

- `dg` is the primary discovery tool when available.
- In this environment, `dg` usually targets the local degoog service at `http://127.0.0.1:8082` by default.
- `quickresearch` means a discovery cap of 3 candidates.
- `research` means a discovery cap of 5 candidates.
- `jq` is useful for parsing JSON output.
- This skill does not cover browser extraction or deep source synthesis.
