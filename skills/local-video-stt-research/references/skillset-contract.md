# Skillset Contract: local-video-stt-research

## 1. Capability boundary

This skillset defines a strict-local transcript and research-export capability for video and audio sources.

It separates three layers:

- implementation layer: local helper CLI and scripts
- skillset layer: stable transcript/research operations and artifact contract
- Pi adapter layer: `SKILL.md` for Pi discovery and invocation guidance

## 2. Stable operations

### 2.1. `resolve_input`
Accept either:
- a YouTube/VOD URL
- a local media file path

### 2.2. `acquire_source`
- URL input -> download source media locally
- local file input -> reuse local file as source

### 2.3. `normalize_audio`
Convert source media to:
- mono
- 16kHz
- PCM WAV

### 2.4. `transcribe_local`
Send normalized WAV to the local `whisper.cpp` server.
Prefer `verbose_json`, but degrade to text fallback when verbose output is unusable.

### 2.5. `export_transcript`
Produce human-readable and machine-readable transcript artifacts.

### 2.6. `export_research_artifacts`
Produce timestamped research support files for later analysis and manual/LLM review.

### 2.7. `publish_final`
When explicitly requested, emit a user-facing Markdown/PDF deliverable above the research-sidecar set.

## 3. Non-goals of the current baseline

- no remote transcript API
- no cloud STT
- no mandatory diarization
- no mandatory local summary generation
- no mandatory caption-first download path

## 4. Execution modes

### 4.1. `strict-local-first-class`
Current target mode:
- input-aware dependency handling
- shared-backend admission truth
- verbose-first with text fallback
- sidecars always preserved
- final Markdown/PDF publishing only when explicitly requested

### 4.2. `strict-local-plus-pyannote`
Planned extension for optional local diarization.

## 5. Input schema

### 5.1. Required
- `input`: URL or local file path

### 5.2. Optional
- `out_dir`
- `language`
- `translate`
- `publish_final`

## 6. Output schema

A run returns one artifact directory containing stable output files. See `output-contract.md`.

## 7. Runtime assumptions

- `yt-dlp` is available for URL inputs
- `ffmpeg` is available
- `python3` is available
- the local `whisper.cpp` server is reachable at `127.0.0.1:8006`
- the local shared-backend lock family is rooted at `/tmp/whisper-transcribe-raw.lock`

## 8. Planned extension points

- local caption-first routing
- optional `pyannote community-1`
- optional local summary backend once a functioning local instruct model is provisioned
