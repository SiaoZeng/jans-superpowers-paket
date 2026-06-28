Use the `deepdeepresearch` mode.

Rules:
- Start with `dg`.
- Use the local `dg` CLI against the local degoog backend at `http://127.0.0.1:8082`.
- Discovery pool: up to 50 candidates total.
- Deduplicate and cluster by perspective.
- Final synthesis set: best 10 sources.
- Cover multiple perspective types when the topic allows it.
- Do not synthesize all discovery candidates directly.
- For each selected source, use the token-efficient fetch hierarchy:
  1. direct JSON/API fetch via `curl + jq`
  2. static page fetch via `curl + grep/head/sed/awk`
  3. direct markdown fetch via `Accept: text/markdown` only when clearly supported and likely to be smaller/better
  4. targeted HTML extraction via `bs4` + `lxml` when the page structure is known
  5. readable extraction via `trafilatura`
  6. filtered browser CLI via `webctl`
  7. full browser escalation only if all cheaper paths are insufficient
- Keep the synthesis balanced across agreements, disagreements, gaps, and uncertainty.
