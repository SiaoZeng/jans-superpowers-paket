Use the `research` mode.

Rules:
- Start with `dg`.
- Use the local `dg` CLI against the local degoog backend at `http://127.0.0.1:8082`.
- Discovery cap: 5 candidates total.
- Prefer official or primary sources first, then the best supporting sources.
- Keep the result evidence-based but concise.
- For selected URLs, use the token-efficient fetch hierarchy:
  1. direct JSON/API fetch via `curl + jq`
  2. static page fetch via `curl + grep/head/sed/awk`
  3. direct markdown fetch via `Accept: text/markdown` only when clearly supported and likely to be smaller/better
  4. targeted HTML extraction via `bs4` + `lxml` when the page structure is known
  5. readable extraction via `trafilatura`
  6. filtered browser CLI via `webctl`
  7. full browser escalation only if all cheaper paths are insufficient
- Escalate beyond `dg` only when discovery is insufficient or the task has moved beyond discovery.
- Do not send raw full-page HTML to the model when JSON, static filtering, markdown, targeted `bs4`, or readable extraction would suffice.
