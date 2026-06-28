---
name: local-session-transcription
description: Create local-only meeting/session transcription documents from local audio files, especially zh-TW/Mandarin sessions. Use when a user wants a 1:1 raw transcript plus a second cleaned transcript with filler removed, proper sentences/paragraphs, and a detailed summary placed at the beginning of the Markdown document.
compatibility: Pi coding agent on w-saxs001 with bash, read, write, ffmpeg, curl, opencc, and the local whisper.cpp server on 127.0.0.1:8006.
---

# Local Session Transcription

## W-Question, Evidence, and Locality Gate

Before producing transcript, research, Markdown, PDF, or summary artifacts, apply `../portable/references/w-question-evidence-standard.md` proportionally. Record who requested the artifact, what media or session is in scope, when timestamps and model versions matter, where source media and outputs live, how transcription and cleanup were performed, which local tools and models were used, what inputs the result depends on, what privacy or fidelity risks are prevented, why the chosen backend is safe, and which evidence supports the output.

Keep local-only constraints explicit. Include source path or URL, extraction command class, model or server surface, language assumptions, fallback path, known transcription limitations, and validation evidence when they influence the result. Stop before using network services, deleting media, overwriting source artifacts, or claiming verbatim fidelity when the backend output only supports a lower confidence level.


## Purpose

Create a reusable local-only workflow for meeting/session audio:

1. transcribe the source audio locally through the existing Whisper/STT runtime
2. preserve the raw 1:1 transcript as an audit artifact
3. build a cleaned transcript that removes filler, repetitions, and obvious ASR noise while preserving meaning
4. write a detailed summary at the beginning of the document as `Teil 1`
5. write the cleaned, paragraphized transcript as `Teil 2`
6. export the final Markdown document as a PDF at the end

This skill packages the workflow used for the example local recording `~/Downloads/新錄音 10.m4a` into a repeatable meeting/session transcription process.

## When to Use

Use this skill when:

- the input is a local audio/video recording of a meeting, session, lecture, workshop, briefing, or similar longform spoken event
- the user asks for local transcription, no cloud STT, or zh-TW/TW Mandarin transcription
- the user wants a raw 1:1 transcript first and then a cleaned/readable transcript
- the final output should be a Markdown document plus PDF with a detailed summary before the cleaned transcript
- filler terms such as `嗯`, `呃`, `啊`, `就是`, `那個`, `hm`, `äh`, repeated fragments, and obvious hesitation loops should be removed in a second pass

Do not use this skill for:

- short hotkey dictation snippets; use the dictation path instead
- YouTube/VOD research transcripts where URL download and research exports are the main task; prefer `local-video-stt-research`
- cloud transcription or remote transcript APIs
- translation to another language unless the user explicitly asks for translation

## Current Local Runtime

The current host runtime is:

- shared backend: `http://127.0.0.1:8006/inference`
- backend engine: local `whisper.cpp` server via ROCm/HIP
- preferred language for TW Mandarin sessions: `zh`
- script normalization: OpenCC `s2twp.json`
- optional existing longform wrapper example: `~/.local/bin/whisper-transcribe-raw`
- optional existing longform runtime example: `~/.local/lib/whisper-transcribe-raw.py`

This skill does not introduce a new server, port, ASR engine, or cloud dependency.

## Inputs

Required:

- local media file path, e.g. `~/Downloads/新錄音 10.m4a`

Optional:

- output Markdown path
- language, default `zh` for TW Mandarin sessions
- whether to keep raw transcript only as sidecar backup or also include it as an appendix
- domain vocabulary hints supplied by the user

## Outputs

Minimum output files:

- final Markdown document, e.g. `<source-stem>-transcript.md`
- final PDF document, e.g. `<source-stem>-transcript.pdf`
- raw 1:1 backup Markdown, e.g. `<source-stem>-transcript.1to1-backup.md`
- local artifact directory with normalized audio and intermediate transcript files

The final Markdown and PDF documents must follow the contract in `references/output-contract.md`.
If this package preserves first-class validation evidence for this skill, store it under `validation-artifacts/`.

## Workflow

### 1. Preflight

- [ ] Confirm the source file exists and is readable.
- [ ] Run `ffprobe` to record codec, duration, channels, and size.
- [ ] Confirm `whisper-server.service` is active and `whisper-dictate-record.service` is not active.
- [ ] Confirm local tools exist: `ffmpeg`, `curl`, `opencc`.
- [ ] Create or choose an artifact directory.

### 2. Raw local STT

Preferred path when an optional host-local wrapper already exists:

```bash
~/.local/bin/whisper-transcribe-raw '<input-file>' \
  --out-dir '<artifact-root>' \
  --force-language zh \
  --diarization off \
  --keep-intermediate
```

If the wrapper is not present or the verbose JSON path fails because the local server emits invalid UTF-8 JSON, use the text fallback documented in `references/runtime-notes.md`:

1. normalize audio to mono 16 kHz PCM WAV with `ffmpeg`
2. POST it to `/inference` with `response_format=text` and `language=zh`
3. normalize the resulting text with `opencc -c s2twp.json`

### 3. Preserve 1:1 transcript

- [ ] Save the uncleaned TW-normalized raw transcript as a backup file.
- [ ] Do not overwrite the raw backup during cleanup.
- [ ] Record the raw backup path in the artifact or validation context, not as a visible metadata line inside the final user-facing document.

The raw transcript may contain ASR artifacts, repeated words, filler, false starts, and missing punctuation. That is expected.

### 4. Build `Teil 2` cleaned transcript

Use the rules in `references/cleanup-and-summary-rules.md`:

- [ ] Remove filler, hesitation sounds, and meaningless repetitions.
- [ ] Keep the speaker's factual claims, sequence, examples, numbers, deadlines, and conditions.
- [ ] Repair punctuation and paragraphing.
- [ ] Correct obvious ASR terms only when the context strongly supports the correction.
- [ ] Do not invent facts, names, amounts, dates, or policy details.
- [ ] Preserve uncertainty when the raw transcript is ambiguous.

### 5. Build `Teil 1` detailed summary

- [ ] Summarize the entire cleaned transcript, not just the first part.
- [ ] Put the summary before the cleaned transcript.
- [ ] Use detailed thematic sections.
- [ ] Include operational details such as requirements, amounts, eligibility, process steps, deadlines, and follow-up actions where present.
- [ ] Do not add external facts unless the user asks for research enrichment.

### 6. Write final Markdown

Use `templates/session-transcript-template.md` as the structure:

1. title only, without a visible metadata block
2. `Teil 1 — 詳細摘要`
3. `Teil 2 — 整理後逐字稿`
4. optional appendix only if the user explicitly requests it

### 7. Export final PDF

Create a PDF from the final Markdown document after all text cleanup and summary work is complete:

```bash
scripts/session-md-to-pdf \
  '<final-transcript.md>' \
  '<final-transcript.pdf>'
```

Use the helper script by default on this host. It renders Markdown to HTML with CJK-capable fonts and uses local Chrome headless print-to-PDF. Do not use a cloud converter.

### 8. Verification

Before reporting completion:

- [ ] Read the final Markdown header and first content section.
- [ ] Verify it contains `Teil 1` before `Teil 2`.
- [ ] Verify the raw backup exists.
- [ ] Verify the Markdown file is valid UTF-8 and contains no Unicode replacement character (`U+FFFD`).
- [ ] Verify the final Markdown does not include the internal metadata block (`Source`, `Language`, `Transcription`, `Normalization`, `Artifact directory`, `1:1 backup`, `PDF`).
- [ ] Verify the PDF exists, is non-empty, and is newer than or same-age as the final Markdown.
- [ ] If this run is being preserved as validation evidence, save the raw backup, final Markdown, final PDF, and the exact fallback command sequence under `validation-artifacts/`.

## Decision Rules

- If the user asks for `1:1`, produce only the raw transcript unless they also request cleanup/summary.
- If the user later asks for cleaned text and summary, preserve the existing raw file as backup before rewriting or creating the final document.
- If the transcript language is TW Mandarin, use `language=zh` for Whisper and `opencc -c s2twp.json` for Traditional/Taiwan normalization.
- If the raw transcript is too noisy, state the uncertainty and avoid overconfident corrections.
- If diarization is not required, default to `--diarization off` for faster and more deterministic session notes.
- Always create the final PDF after the Markdown has reached its final `Teil 1` / `Teil 2` structure, unless the user explicitly opts out.

## References

- `references/output-contract.md`
- `references/cleanup-and-summary-rules.md`
- `references/runtime-notes.md`
- `templates/session-transcript-template.md`
- `scripts/session-md-to-pdf`
