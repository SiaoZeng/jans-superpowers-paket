# Output Contract

Each run creates a unique artifact directory under the selected output root.

## Files

### `status.json`
Authoritative run status and metadata for both success and failure cases.

### `source.json`
Saved only for URL inputs. Contains `yt-dlp` metadata.

### `source.*`
Downloaded source media for URL inputs.

### `audio.normalized.wav`
Mono 16kHz PCM WAV used for local STT.

### `transcript.verbose.json`
Verbose JSON server response when available, or a synthesized fallback payload when the helper had to degrade to `response_format=text`.

### `transcript.segments.json`
Normalized machine-readable segment export.

### `transcript.original.md`
Human-readable transcript with metadata header and full text.

### `transcript.srt`
Segment-based SRT export.

### `transcript.vtt`
Segment-based VTT export.

### `research.notes.md`
Timestamped segment ledger for downstream research.

### `transcript.text.raw-response.txt`
Saved only when the helper had to use text fallback.

### `transcript.text.normalized.txt`
Saved only when the helper had to normalize a fallback text transcript, for example via OpenCC for zh/TW paths.

### `transcript.final.md`
Saved only when `--publish-final` is used. This is the final user-facing Markdown deliverable above the research-sidecar set.

### `transcript.final.pdf`
Saved only when `--publish-final` is used. This is the rendered PDF copy of `transcript.final.md`.

## GraphRAG note

The artifacts defined here are transcript and research-export artifacts only.
They are not a GraphRAG-native memory write contract and do not imply any
canonical GraphRAG `facets` or `tags`.
If a caller later persists findings or memories derived from these artifacts,
that caller must normalize the write through the current GraphRAG memory
contract instead of forwarding ad-hoc topical labels.

## `status.json` fields

Minimum fields:

- `pipeline_status`
- `input`
- `artifact_dir`
- `language_requested`
- `translate`
- `detected_language`
- `duration`
- `created_at`
- `fallback_used`
- `error`
- `failure_stage`
- `artifacts`

## `pipeline_status` values

Minimum values:

- `completed`
- `completed_with_text_fallback`
- `failed`

## `failure_stage` values

Common values:

- `preflight`
- `resolve_input`
- `acquire_source`
- `normalize_audio`
- `admission`
- `transcription`
- `publishing`

## `transcript.segments.json` fields

Minimum fields:

- `task`
- `language`
- `detected_language`
- `detected_language_probability`
- `duration`
- `full_text`
- `segments[]`

Each segment should include at least:

- `id`
- `start`
- `end`
- `text`
- `avg_logprob`
- `no_speech_prob`
- `words`

## Final publishing contract

When `--publish-final` is used:

- `transcript.final.md` must omit the operational metadata header used in `transcript.original.md`
- `transcript.final.md` must keep the transcript content as a separate user-facing layer above the sidecar set
- `transcript.final.pdf` must be generated locally through `../local-session-transcription/scripts/session-md-to-pdf`
- publishing must not overwrite or delete any research-sidecar artifact
