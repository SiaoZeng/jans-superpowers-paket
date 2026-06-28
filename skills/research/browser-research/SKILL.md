---
name: browser-research
description: Use when a web source requires JavaScript rendering, DOM interaction, snapshots, or browser-only extraction before it can be used reliably in research, framing, or answers.
---

# Browser Research

## W-Question and Provenance Gate

Before turning discovery into research conclusions, apply `../../portable/references/w-question-evidence-standard.md` proportionally. Use the W-questions to define who needs the answer, what claim is being tested, when current information matters, where sources came from, how they were fetched, which tools were used, what prior artifacts the answer depends on, what risk the research prevents, why selected sources are credible, and which evidence supports each claim.

Maintain a provenance ledger for sources, retrieval dates, extraction methods, source quality, limitations, and discarded candidates when they affect the conclusion. Distinguish quick discovery from evidence-grade synthesis. Stop or downgrade confidence when authoritative sources cannot be fetched, browser extraction is incomplete, sources disagree without resolution, or the next workflow would depend on unverified claims.


## Overview

Use this skill when CLI-first research has already identified a relevant page, but static fetching is insufficient. This skill is for browser-assisted page understanding, not for general search discovery.

Use the extracted evidence as input to research synthesis or framing/spec work. This skill is not a replacement for the `brainstorming -> write-spec -> write-plan` chain.

Use `dg-webresearch` for search discovery.
Use `deep-research` for multi-source evidence synthesis.

Before using browser tooling, exhaust cheaper paths in this order when applicable:

1. direct JSON/API fetch via `curl + jq`
2. static page fetch with `curl + grep/head/sed/awk`
3. direct markdown fetch via `Accept: text/markdown` only when clearly supported and likely to be smaller/better
4. targeted HTML extraction via `bs4` + `lxml` when the page structure is known
5. readable main-content extraction via `trafilatura`
6. filtered stateful browser CLI via `webctl`
7. only then full browser/devtools escalation

## When to Use

- the page depends on JavaScript rendering
- relevant content is hidden behind tabs, expanders, or interaction
- DOM inspection is needed before answering
- a snapshot or screenshot is needed for confidence
- console or network inspection is needed to understand the loaded content
- browser state or minimal multi-step interaction is needed and cheaper static fetch paths failed

Do not use this skill as the default path for ordinary docs pages that work with `curl`.
Do not use this skill for query design, broad multi-source synthesis, or general frontend debugging.

## Browser Choice

Use the lighter browser path first when possible.

### `webctl` via `bash`

Prefer `webctl` when:
- a stateful browser session is needed
- the page can be handled with filtered snapshots instead of full devtools inspection
- you want to keep strict control over what enters model context

Useful patterns:

```bash
webctl navigate "https://example.com"
webctl snapshot --interactive-only --limit 30
webctl snapshot --within "role=main"
webctl snapshot | grep -i "keyword"
```

Use `webctl` after static fetch, targeted `bs4` extraction, and readable extraction have failed to provide enough signal, not before.

### Chrome DevTools tools

Use Pi-exposed Chrome DevTools tools only when they are available in the current runtime. Tool names may be namespace-qualified or absent depending on the harness. If Chrome DevTools tools are unavailable and `webctl` is insufficient, report a blocker or return to CLI-first research instead of inventing a browser path.

Prefer Chrome DevTools when:
- DOM extraction needs precise scripting
- network or console inspection matters
- the page requires richer interaction than `webctl` can cheaply cover
- screenshots or browser debugging evidence are needed

## Browser Safety Gate

Before browser interaction, confirm all of the following:

- no credential entry, login flow, account creation, purchase, irreversible action, or destructive form submission is required
- no captcha, paywall, consent bypass, or access-control circumvention is attempted
- no private user data, cookies, tokens, local files, or session secrets will be exposed in the output
- downloads are avoided unless explicitly requested and safe
- clicks and fills are limited to revealing already accessible content, such as tabs, expanders, filters, or pagination
- Terms-of-Service-sensitive scraping concerns are treated as a blocker or escalated to the user

If any condition fails, stop and ask or report the blocker.

## Direct Browser Workflow

1. Confirm cheaper fetch paths failed or were insufficient.
2. Pass the Browser Safety Gate.
3. Choose `webctl` first if filtered browser interaction is enough.
4. Otherwise open the target page with `chrome_devtools_new_page` or `chrome_devtools_navigate_page` when those tools are available.
5. Inspect structure with `chrome_devtools_take_snapshot`.
6. Extract the relevant content with `chrome_devtools_evaluate_script`.
7. If needed, click or fill only safe minimal controls to reveal the target state.
8. Clean up after extraction: close any page opened for the task with `chrome_devtools_close_page`.
9. If the last remaining page cannot be closed, navigate it back to `about:blank`.
10. Use screenshots only when visual confirmation matters.
11. Use console or network inspection only when the page's real content cannot be understood from the DOM alone.

## Preferred Direct Tools

- `bash` for `webctl`
- `chrome_devtools_new_page`
- `chrome_devtools_navigate_page`
- `chrome_devtools_select_page`
- `chrome_devtools_close_page`
- `chrome_devtools_wait_for`
- `chrome_devtools_take_snapshot`
- `chrome_devtools_evaluate_script`
- `chrome_devtools_take_screenshot`
- `chrome_devtools_click`
- `chrome_devtools_fill`
- `chrome_devtools_list_console_messages`
- `chrome_devtools_list_network_requests`
- `chrome_devtools_get_network_request`

## Provenance Ledger Gate

Browser-assisted evidence must include a source ledger:

- title
- URL
- retrieval date or current session date
- browser path used, such as `webctl` or Chrome DevTools
- extraction method, such as snapshot, DOM script, screenshot, console, or network
- selector, accessible region, DOM path, screenshot path, or network request identifier when relevant
- exact quote, fragment, visual observation, or data point used
- limitations, such as dynamic content, authentication blocked, script-rendered state, or screenshot-only evidence

No browser-derived claim may be presented without linking it to this ledger.

## Extraction Rules

- prefer DOM extraction over screenshots
- extract the smallest relevant content area
- snapshot first, then evaluate
- close or reset temporary browser pages after the needed evidence is captured
- avoid full-page dumps when one container is enough
- avoid sending full accessibility trees or full HTML when filtered snapshots are enough
- escalate to console or network only when content loading behavior matters

For reusable selectors and extraction patterns, see `references/extraction-patterns.md`.

## Common Mistakes

- starting browser work before CLI discovery is complete
- skipping JSON/static/bs4/trafilatura paths and going straight to the browser
- assuming markdown-first is always the right pre-browser step even when the site does not support it well
- using `bs4` as a generic full-page text extractor instead of a targeted structure-aware pre-browser step
- using screenshots when DOM extraction would be enough
- dumping the entire page instead of targeted containers
- leaving temporary browser pages open after extraction
- entering credentials, submitting forms, or clicking destructive controls
- exposing private cookies, tokens, local files, or session data in output
- turning page research into general frontend debugging

## Environment Notes

- this skill uses Chrome DevTools only when the current Pi runtime exposes compatible tools
- benchmark findings currently favor static-first over unconditional markdown-first before browser escalation
- `bs4` and `lxml` are installed and available in this environment for targeted HTML extraction
- `webctl` CLI is installed and available in this environment
- `trafilatura` CLI is installed and available in this environment
- this is an escalation path, not the default research path
