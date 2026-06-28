# CLI Usage

## Command

```bash
scripts/pi-local-video-stt <input> [options]
```

## Supported inputs

- YouTube/VOD URL
- local audio file
- local video file

## Options

```text
--out-dir DIR        Root directory for artifacts. Default: ./.pi-local-video-stt
--language LANG      Whisper language value. Default: auto
--translate          Ask whisper.cpp to translate speech to English
--publish-final      Emit final Markdown and PDF deliverables above the research sidecars
```

## Examples

### URL -> transcript artifacts

```bash
scripts/pi-local-video-stt \
  "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Local file -> transcript artifacts

```bash
scripts/pi-local-video-stt \
  ./lecture.mp4 \
  --out-dir ./artifacts
```

### Local file -> translated English transcript

```bash
scripts/pi-local-video-stt \
  ./mandarin-talk.m4a \
  --translate \
  --out-dir ./artifacts
```

### Local file -> final Markdown/PDF deliverables plus sidecars

```bash
scripts/pi-local-video-stt \
  ./mandarin-talk.m4a \
  --publish-final \
  --out-dir ./artifacts
```

## Exit behavior

- exit `0` on success
- nonzero exit on validation, admission, download, normalization, transcription, or publishing failure

## Notes

- URL mode keeps processing local after the media download step.
- Local file mode does not require `yt-dlp`.
- The helper CLI is still transcript-first; `--publish-final` adds a user-facing packaging layer rather than a summary model.
