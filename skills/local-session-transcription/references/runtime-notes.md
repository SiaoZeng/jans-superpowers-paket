# Runtime Notes — Local Session Transcription

## Local Backend

- Endpoint: `http://127.0.0.1:8006/inference`
- Required header: `X-Whisper-Client: local`
- User service: `whisper-server.service`
- Dictation record service must not be active during longform/session work: `whisper-dictate-record.service`

## Preferred Raw Transcription Command

If the optional host-local wrapper already exists, use:

```bash
~/.local/bin/whisper-transcribe-raw '<input-file>' \
  --out-dir '<artifact-root>' \
  --force-language zh \
  --diarization off \
  --keep-intermediate
```

## Text Fallback for Invalid verbose_json

Some local `verbose_json` responses can fail if the server produces malformed UTF-8 inside JSON. In that case, use a text response fallback:

```bash
ffmpeg -y -i '<input-file>' -vn -ar 16000 -ac 1 -c:a pcm_s16le '<artifact-dir>/normalized.wav'

curl -sS --max-time 10800 \
  -X POST 'http://127.0.0.1:8006/inference' \
  -H 'X-Whisper-Client: local' \
  -F 'file=@<artifact-dir>/normalized.wav' \
  -F 'response_format=text' \
  -F 'language=zh' \
  -o '<artifact-dir>/transcript.text.raw-response.txt'

opencc -c s2twp.json \
  < '<artifact-dir>/transcript.text.raw-response.txt' \
  > '<artifact-dir>/transcript.tw.txt'
```

## PDF Export

Use the bundled helper:

```bash
scripts/session-md-to-pdf \
  '<final-transcript.md>' \
  '<final-transcript.pdf>'
```

The helper uses local Chrome/Chromium headless printing and CJK-capable CSS fonts. It does not call a cloud service.

## Validation Evidence Root

If this package preserves first-class validation artifacts for this consumer, store them under:

```text
validation-artifacts/
```

A bounded fallback-backed sample may live under:

```text
validation-artifacts/session-fallback-sample/
```

## Verification Commands

```bash
python3 - <<'PY'
from pathlib import Path
md = Path('<final-transcript.md>')
pdf = Path('<final-transcript.pdf>')
text = md.read_text(encoding='utf-8')
assert '## Teil 1' in text and '## Teil 2' in text
assert text.index('## Teil 1') < text.index('## Teil 2')
assert '\ufffd' not in text
assert pdf.exists() and pdf.stat().st_size > 0
print('ok')
PY
```
