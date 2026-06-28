# Runtime Notes

## Local-only boundary

This skill is local-only for AI work:

- transcription is local
- transcript export is local
- research artifacts are local
- final Markdown/PDF publishing is local
- no cloud STT or transcript API is in the default path

The only network dependency in normal URL mode is source acquisition from the media host via `yt-dlp`.

## Local whisper server

Expected endpoint:

```text
http://127.0.0.1:8006/inference
```

Health check:

```text
http://127.0.0.1:8006/health
```

Expected behavior:

- accepts multipart upload
- supports `response_format=verbose_json`
- supports `response_format=text`
- supports `language`
- supports `translate`

## Shared-backend admission

This helper now follows the shared backend family truth instead of pretending the backend is unconstrained:

- it must acquire the same backend lock family rooted at `/tmp/whisper-transcribe-raw.lock`
- if the lock is already held, the helper must fail fast with a saved failure manifest rather than continuing best-effort
- URL download and local file discovery happen before backend admission; backend-dependent steps happen after admission succeeds

## Text fallback for unusable verbose output

`response_format=verbose_json` remains the preferred path, but it is not the only path.
When verbose output is unusable, the helper may fall back to text:

- automatic fallback when verbose JSON cannot be parsed or is unusable
- forced fallback when `PI_LOCAL_VIDEO_STT_FORCE_TEXT_FALLBACK=1` is set for validation

For zh/TW-oriented fallback paths, normalize text with OpenCC:

```bash
opencc -c s2twp.json
```

## Validation Evidence Root

If this package preserves first-class validation artifacts for this skill, store them under:

```text
validation-artifacts/
```

A package-local command ledger for preserved local-file, fallback, URL, admission-failure, and publish-final runs should live at:

```text
validation-artifacts/commands.txt
```

## Final Markdown/PDF publishing

When `--publish-final` is used, the helper publishes a separate user-facing layer above the research sidecars:

- final Markdown path: `transcript.final.md`
- final PDF path: `transcript.final.pdf`
- PDF renderer: `../local-session-transcription/scripts/session-md-to-pdf`

Publishing must not overwrite or delete:

- `transcript.original.md`
- `transcript.verbose.json`
- `transcript.segments.json`
- `research.notes.md`
- `transcript.srt`
- `transcript.vtt`

## Local summary state

A local summary model is not currently part of the baseline because no validated local instruct backend is currently provisioned as default on this host.

Therefore the baseline remains transcript-first and research-export-first even though final Markdown/PDF publishing is now available as a user-triggered packaging layer.
