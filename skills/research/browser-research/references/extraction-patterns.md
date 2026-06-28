# Extraction Patterns

## Start With A Snapshot

Before extracting content, inspect the page structure with a snapshot. Use that to find stable targets before evaluating JavaScript.

Typical container targets:

- `article`
- `main`
- `.content`
- `.docs-content`
- `.markdown-body`

## Extract Main Content Only

Prefer one focused section instead of a broad container or full page.

Typical expression shape:

```javascript
() => {
  const heading = [...document.querySelectorAll('main h1, main h2, article h1, article h2')]
    .find(el => /install|usage|api|example/i.test(el.textContent || ''));
  const section = heading?.closest('section') || heading?.parentElement;
  if (!section) return { truncated: false, text: '' };
  const text = section.innerText;
  return {
    truncated: text.length > 4000,
    text: text.slice(0, 4000)
  };
}
```

Use a snapshot first to identify the relevant heading or section, then target that subsection specifically. Broad selectors are only a starting point and should be narrowed after snapshot review. If no useful section matches, refine the selector after a fresh snapshot instead of dumping the page.

## Extract Code Blocks

Use this when the page contains examples that matter more than prose.

```javascript
() => {
  const section = document.querySelector('main section, article section, .docs-content section');
  if (!section) return [];
  return [...section.querySelectorAll('pre code')]
    .slice(0, 3)
    .map(e => e.textContent.slice(0, 1200));
}
```

Choose the relevant section first. Do not dump every code block on the page.

## Extract Tables

Use this when version matrices, feature support tables, or comparisons are important.

```javascript
() => {
  const table = document.querySelector('main table, article table, .content table, .docs-content table');
  if (!table) return [];
  return [...table.querySelectorAll('tr')].map(row =>
    [...row.querySelectorAll('th, td')].map(cell => cell.innerText.trim())
  );
}
```

If the page has multiple tables, choose the relevant section first from a snapshot and then target that table specifically.

## Reveal Hidden Content Carefully

Only interact when the target content is behind a minimal control such as:

- tab buttons
- expanders
- collapsible sections

After the interaction:

1. wait for the relevant text or state
2. take a new snapshot if structure changed
3. extract only the needed container

## Escalate To Console Or Network

Escalate only when:

- the DOM does not reflect the real loaded content
- requests are failing or blocked
- content is populated asynchronously and the source must be confirmed

Do not inspect console or network by default.

## Cleanup After Extraction

After the relevant evidence is captured:

1. close the temporary page if it was opened just for the task
2. if only one page remains and it cannot be closed, navigate it to `about:blank`
3. leave the browser in a low-activity idle state
