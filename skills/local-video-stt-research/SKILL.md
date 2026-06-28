---
name: local-video-stt-research
description: Create local-only transcripts and research-ready artifacts from YouTube/VOD URLs or local media files using yt-dlp, ffmpeg, and the local whisper.cpp server. Supports explicit backend-admission behavior, text fallback when verbose_json is unusable, and optional final Markdown/PDF publishing.
compatibility: Pi coding agent on this host with bash, read, yt-dlp, ffmpeg, curl, python3, and the local whisper-server on 127.0.0.1:8006.
allowed-tools: Bash(python3:*) Bash(yt-dlp:*) Bash(ffmpeg:*) Bash(curl:*) Bash(find:*) Bash(mkdir:*) Bash(ls:*)
---

# Local Video STT Research

## W-Question, Evidence, and Locality Gate

Before producing transcript, research, Markdown, PDF, or summary artifacts, apply `../portable/references/w-question-evidence-standard.md` proportionally. Record who requested the artifact, what media or session is in scope, when timestamps and model versions matter, where source media and outputs live, how transcription and cleanup were performed, which local tools and models were used, what inputs the result depends on, what privacy or fidelity risks are prevented, why the chosen backend is safe, and which evidence supports the output.

Keep local-only transcription and summarization constraints explicit. Include source path or user-provided URL, extraction command class, model or server surface, language assumptions, fallback path, known transcription limitations, and validation evidence when they influence the result. User-provided YouTube or VOD retrieval through `yt-dlp` remains allowed by this skill. Stop before using unapproved cloud STT, remote transcript APIs, remote summarization, media upload services, deleting media, overwriting source artifacts, or claiming verbatim fidelity when the backend output only supports a lower confidence level.


## Purpose

This skill is the Pi adapter for a first-class strict-local transcript workflow:

- source media may come from YouTube/VOD or an already local file
- download and audio normalization happen locally
- speech-to-text runs on the local `whisper.cpp` server
- outputs are research-ready files, not cloud summaries
- no external transcript API is part of the default path

## When to use

Use this skill when:

- a YouTube or VOD transcript is needed
- transcription must stay local
- timestamps and segment exports are needed for research
- the user wants artifact files instead of just pasted text
- local media files should be transcribed through the same pipeline

Do not default to `youtube-transcript-api`, cloud STT, or remote summary APIs.

## Quick start

Run the helper CLI directly from the package root:

```bash
scripts/pi-local-video-stt --help
```

Transcribe a YouTube URL into a chosen output directory:

```bash
scripts/pi-local-video-stt \
  "https://www.youtube.com/watch?v=VIDEO_ID" \
  --out-dir ./artifacts
```

Transcribe a local file:

```bash
scripts/pi-local-video-stt \
  ./meeting.mp4 \
  --language auto \
  --out-dir ./artifacts
```

Translate non-English speech to English with local whisper.cpp:

```bash
scripts/pi-local-video-stt \
  ./talk.m4a \
  --translate \
  --out-dir ./artifacts
```

Publish a final Markdown/PDF deliverable above the research sidecars:

```bash
scripts/pi-local-video-stt \
  ./talk.m4a \
  --publish-final \
  --out-dir ./artifacts
```

## Default operating mode

The current implementation is `strict-local-first-class`:

- `yt-dlp` is required only for URL inputs
- `ffmpeg` is required for normalization
- local `whisper.cpp` server is the only STT backend
- helper admission follows the shared backend lock truth rather than best-effort parallelism
- `verbose_json` is preferred, but text fallback is available when verbose output is unusable
- final Markdown/PDF publishing is optional and user-triggered
- no mandatory diarization
- no mandatory LLM summary

This is intentionally transcript-first and research-export-first.
It does not define or emit GraphRAG-native memory `facets` or `tags`; if outputs from this skill are later turned into GraphRAG memory, the caller must normalize them through the canonical GraphRAG memory contract instead of forwarding ad-hoc topical labels.

## Workflow

1. Validate only the dependencies required for the chosen input mode and requested output mode.
2. Resolve input as URL or local file.
3. For URLs, fetch metadata and download source media with `yt-dlp`.
4. Normalize audio to mono 16kHz WAV with `ffmpeg`.
5. Acquire shared-backend admission before backend inference.
6. Prefer `response_format=verbose_json`, but fall back to `response_format=text` when needed.
7. Persist transcript and research artifacts.
8. If requested, publish final Markdown/PDF outputs above the sidecar set.
9. Return the artifact directory path.

## Produced artifacts

The helper CLI writes a per-run directory containing at least:

- `status.json`
- `source.json` for URL inputs
- downloaded `source.*` media for URL inputs
- `audio.normalized.wav`
- `transcript.verbose.json`
- `transcript.segments.json`
- `transcript.original.md`
- `transcript.srt`
- `transcript.vtt`
- `research.notes.md`
- `transcript.final.md` when `--publish-final` is used
- `transcript.final.pdf` when `--publish-final` is used

See:

- [skillset contract](references/skillset-contract.md)
- [CLI usage](references/cli-usage.md)
- [output contract](references/output-contract.md)
- [runtime notes](references/runtime-notes.md)

If this package preserves first-class validation evidence for this skill, store it under `validation-artifacts/`.

## Agent usage rules

- Prefer this skill over remote transcript services when the user requires local processing.
- Use `--language auto` unless the user explicitly asks for a forced language.
- Use `--translate` only when the user asks for English translation from speech.
- Use `--publish-final` only when the operator explicitly wants a final Markdown/PDF deliverable.
- Do not claim local summarization exists by default; the current baseline still centers on transcript and research exports.
- If the user wants multi-speaker diarization, state that this skill currently provides the local transcript-first path first and that `pyannote community-1` remains a later optional extension.

## Verification

Before claiming the CLI works, run at least:

```bash
scripts/pi-local-video-stt --help
```

For a smoke test without external download, use a local media file such as the user-home-agnostic sample path below:

```bash
scripts/pi-local-video-stt \
  ~/whisper.cpp/samples/jfk.wav \
  --out-dir /tmp/local-video-stt-smoke
```
