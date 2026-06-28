Use the `deep-research` mode.

Rules:
- Start with `dg`.
- Use the local `dg` CLI against the local degoog backend at `http://127.0.0.1:8082`.
- Discovery pool: up to 20 candidates total.
- Deduplicate and reduce to the best 6 synthesis sources.
- Do not synthesize all discovery candidates directly.
- For each selected source, use the token-efficient fetch hierarchy:
  1. direct JSON/API fetch via `curl + jq`
  2. static page fetch via `curl + grep/head/sed/awk`
  3. direct markdown fetch via `Accept: text/markdown` only when clearly supported and likely to be smaller/better
  4. targeted HTML extraction via `bs4` + `lxml` when the page structure is known
  5. readable extraction via `trafilatura`
  6. filtered browser CLI via `webctl`
  7. full browser escalation only if all cheaper paths are insufficient
- Keep the final answer evidence-based, explicit about conflicts, and clear about uncertainty.
