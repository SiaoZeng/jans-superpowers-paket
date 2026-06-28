# Output Contract — Local Session Transcription

## File Set

For an input file `<source>`, produce at least:

1. final Markdown document: `<source-stem>-transcript.md`
2. final PDF document: `<source-stem>-transcript.pdf`
3. raw backup: `<source-stem>-transcript.1to1-backup.md`
4. artifact directory with normalized audio and intermediate raw text

The final Markdown document may overwrite an earlier raw-only Markdown file only after the raw-only version has been copied to the `1to1-backup` path. The PDF must be generated after the final Markdown is complete.

## Final Markdown Structure

The final document must use this order:

```markdown
# <title> — 摘要與整理後逐字稿

## Teil 1 — 詳細摘要

...

## Teil 2 — 整理後逐字稿

...
```

Do not include a visible internal metadata block in the final user-facing document. The following lines are intentionally excluded from the final Markdown and PDF body: `Source`, `Language`, `Transcription`, `Normalization`, `Artifact directory`, `1:1 backup`, and `PDF`.

## Teil 1 Requirements

`Teil 1` is a detailed summary of the full session.

It should include, where present:

- core topic and purpose
- actors and audience
- key decisions or recommendations
- process steps
- eligibility criteria
- amounts, dates, deadlines, and percentages
- risks, limitations, or caveats
- follow-up actions
- conclusion

Do not include invented context or research facts that are not present in the transcript unless the user explicitly asks for external enrichment.

## Teil 2 Requirements

`Teil 2` is the cleaned transcript.

It should:

- preserve the order of the spoken content
- remove filler and non-semantic repetitions
- repair punctuation and paragraphs
- retain meaning, factual claims, examples, numbers, and conditions
- correct obvious ASR errors only when the context strongly supports the correction
- mark uncertainty when a phrase cannot be safely resolved

## PDF Requirements

The PDF is a rendered copy of the final Markdown document.

Requirements:

- generated locally; no cloud conversion
- same content order as Markdown: title, `Teil 1`, then `Teil 2`; no visible internal metadata block
- CJK-capable font rendering, preferably `Noto Sans CJK TC`
- path convention: same basename as final Markdown, `.pdf` suffix
- regenerated whenever the Markdown is materially changed
- verified to exist and be non-empty before reporting completion

Preferred helper:

```bash
scripts/session-md-to-pdf \
  '<final-transcript.md>' \
  '<final-transcript.pdf>'
```

## Raw Backup Requirements

The raw backup preserves the first-pass 1:1 transcript. It may include:

- filler words
- repeated phrases
- ASR artifacts
- missing punctuation
- awkward segmentation

The backup is the audit surface. Do not silently replace it with the cleaned transcript.

## Validation Evidence

A preserved first-class validation run may store:

- normalized fallback audio
- `transcript.text.raw-response.txt`
- `transcript.tw.txt`
- raw backup Markdown
- final Markdown
- final PDF
- the exact command sequence used for fallback and PDF generation

The package-local validation root for this skill is:

```text
validation-artifacts/
```

## Encoding and Language

- All Markdown files must be UTF-8.
- For TW Mandarin sessions, normalize raw text with OpenCC `s2twp.json` before writing human-readable Markdown.
- Do not translate unless explicitly requested.
