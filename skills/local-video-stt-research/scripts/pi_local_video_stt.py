#!/usr/bin/env python3
from __future__ import annotations

import argparse
import fcntl
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

WHISPER_URL = "http://127.0.0.1:8006/inference"
WHISPER_HEALTH_URL = "http://127.0.0.1:8006/health"
DEFAULT_OUT_DIR = ".pi-local-video-stt"
BACKEND_LOCK_PATH = "/tmp/whisper-transcribe-raw.lock"
SKILLS_ROOT = Path(__file__).resolve().parent.parent.parent
PDF_RENDERER = str(SKILLS_ROOT / "local-session-transcription" / "scripts" / "session-md-to-pdf")

_BACKEND_LOCK_FD: int | None = None


class CommandResult:
    def __init__(self, *, returncode: int, stdout: str, stderr: str) -> None:
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


class TranscriptionFallbackRequired(RuntimeError):
    pass


class ArtifactFailure(RuntimeError):
    def __init__(self, error: str, *, failure_stage: str, pipeline_status: str = "failed") -> None:
        super().__init__(error)
        self.error = error
        self.failure_stage = failure_stage
        self.pipeline_status = pipeline_status


def run(cmd: list[str], *, input_text: str | None = None) -> CommandResult:
    completed = subprocess.run(
        cmd,
        input=input_text,
        text=True,
        capture_output=True,
        check=False,
    )
    return CommandResult(
        returncode=completed.returncode,
        stdout=completed.stdout,
        stderr=completed.stderr,
    )


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def ensure_command(name: str) -> None:
    if shutil.which(name) is None:
        raise ArtifactFailure(f"missing_required_command:{name}", failure_stage="preflight")


def required_commands_for_input(input_value: str) -> list[str]:
    required = ["ffmpeg", "curl"]
    if is_url(input_value):
        required.insert(0, "yt-dlp")
    return required


def yt_dlp_base_cmd() -> list[str]:
    cmd = ["yt-dlp"]
    for runtime in ("node", "bun", "deno"):
        runtime_path = shutil.which(runtime)
        if runtime_path:
            cmd += ["--js-runtimes", f"{runtime}:{runtime_path}"]
            break
    return cmd


def build_health_check_command() -> list[str]:
    return ["curl", "-fsS", "--max-time", "2", WHISPER_HEALTH_URL]


def check_whisper_server() -> None:
    result = run(build_health_check_command())
    if result.returncode != 0:
        raise ArtifactFailure("whisper_server_unreachable", failure_stage="preflight")


def acquire_backend_lock() -> bool:
    global _BACKEND_LOCK_FD
    if _BACKEND_LOCK_FD is not None:
        return True

    fd = os.open(BACKEND_LOCK_PATH, os.O_CREAT | os.O_RDWR, 0o600)
    try:
        fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        os.close(fd)
        return False

    _BACKEND_LOCK_FD = fd
    return True


def release_backend_lock() -> None:
    global _BACKEND_LOCK_FD
    if _BACKEND_LOCK_FD is None:
        return
    fcntl.flock(_BACKEND_LOCK_FD, fcntl.LOCK_UN)
    os.close(_BACKEND_LOCK_FD)
    _BACKEND_LOCK_FD = None


def is_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9._-]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-.")
    return value or "unknown"


def artifact_label_for_input(input_value: str) -> str:
    if is_url(input_value):
        parsed = urlparse(input_value)
        base = parsed.netloc + parsed.path
        if parsed.query:
            base += "-" + parsed.query
        return slugify(base)[:80]
    return slugify(Path(input_value).stem or Path(input_value).name)


def unique_artifact_dir(out_dir: Path, label: str) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    artifact_dir = out_dir / f"{stamp}-{slugify(label)}"
    artifact_dir.mkdir(parents=True, exist_ok=False)
    return artifact_dir


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_status(
    artifact_dir: Path,
    *,
    pipeline_status: str,
    input_value: str,
    language_requested: str,
    translate: bool,
    detected_language: str | None,
    duration: float | None,
    artifacts: dict[str, str | None],
    error: str | None = None,
    failure_stage: str | None = None,
    fallback_used: bool,
) -> Path:
    status_path = artifact_dir / "status.json"
    payload = {
        "pipeline_status": pipeline_status,
        "input": input_value,
        "artifact_dir": str(artifact_dir),
        "language_requested": language_requested,
        "translate": translate,
        "detected_language": detected_language,
        "duration": duration,
        "created_at": now_iso(),
        "fallback_used": fallback_used,
        "error": error,
        "failure_stage": failure_stage,
        "artifacts": {**artifacts, "status_json": str(status_path)},
    }
    write_json(status_path, payload)
    return status_path


def fetch_yt_metadata(url: str) -> dict:
    result = run(yt_dlp_base_cmd() + ["--dump-single-json", "--no-playlist", url])
    if result.returncode != 0:
        raise ArtifactFailure("yt_dlp_metadata_failed", failure_stage="acquire_source")
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ArtifactFailure("yt_dlp_metadata_invalid_json", failure_stage="acquire_source") from exc


def download_source(url: str, artifact_dir: Path) -> Path:
    output_template = str(artifact_dir / "source.%(ext)s")
    result = run(
        yt_dlp_base_cmd()
        + [
            "--no-playlist",
            "-f",
            "ba/b",
            "-o",
            output_template,
            url,
        ]
    )
    if result.returncode != 0:
        raise ArtifactFailure("yt_dlp_download_failed", failure_stage="acquire_source")
    candidates = sorted(p for p in artifact_dir.glob("source.*") if p.name != "source.json")
    if not candidates:
        raise ArtifactFailure("yt_dlp_download_missing_source_media", failure_stage="acquire_source")
    return candidates[0]


def normalize_audio(source_path: Path, artifact_dir: Path) -> Path:
    output_path = artifact_dir / "audio.normalized.wav"
    result = run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(source_path),
            "-vn",
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ]
    )
    if result.returncode != 0 or not output_path.exists():
        raise ArtifactFailure("ffmpeg_normalization_failed", failure_stage="normalize_audio")
    return output_path


def request_verbose_json(audio_path: Path, *, language: str, translate: bool) -> dict:
    cmd = [
        "curl",
        "-fsS",
        "--max-time",
        "10800",
        "-X",
        "POST",
        WHISPER_URL,
        "-H",
        "X-Whisper-Client: local",
        "-F",
        f"file=@{audio_path}",
        "-F",
        "response_format=verbose_json",
        "-F",
        f"language={language}",
    ]
    if translate:
        cmd += ["-F", "translate=true"]
    result = run(cmd)
    if result.returncode != 0:
        raise TranscriptionFallbackRequired("verbose_json_request_failed")
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise TranscriptionFallbackRequired("verbose_json_invalid_json") from exc
    if not isinstance(payload, dict) or "text" not in payload:
        raise TranscriptionFallbackRequired("verbose_json_missing_text")
    return payload


def request_text_response(audio_path: Path, *, language: str, translate: bool) -> str:
    cmd = [
        "curl",
        "-fsS",
        "--max-time",
        "10800",
        "-X",
        "POST",
        WHISPER_URL,
        "-H",
        "X-Whisper-Client: local",
        "-F",
        f"file=@{audio_path}",
        "-F",
        "response_format=text",
        "-F",
        f"language={language}",
    ]
    if translate:
        cmd += ["-F", "translate=true"]
    result = run(cmd)
    if result.returncode != 0:
        raise ArtifactFailure("text_fallback_request_failed", failure_stage="transcription")
    return result.stdout.strip()


def normalize_text_fallback(text: str, language: str) -> str:
    normalized_language = language.lower()
    if normalized_language not in {"zh", "tw", "zh-tw"}:
        return text.strip()
    if shutil.which("opencc") is None:
        raise ArtifactFailure("opencc_missing_for_zh_fallback", failure_stage="transcription")
    result = run(["opencc", "-c", "s2twp.json"], input_text=text)
    if result.returncode != 0:
        raise ArtifactFailure("opencc_normalization_failed", failure_stage="transcription")
    return result.stdout.strip()


def fallback_verbose_payload(text: str, *, reason: str, language: str) -> dict:
    return {
        "task": "transcribe",
        "language": language,
        "detected_language": None,
        "detected_language_probability": None,
        "duration": None,
        "text": text,
        "segments": [],
        "fallback_used": True,
        "fallback_reason": reason,
    }


def transcribe_with_fallback(
    audio_path: Path,
    *,
    artifact_dir: Path,
    language: str,
    translate: bool,
) -> tuple[dict, dict[str, object]]:
    if os.environ.get("PI_LOCAL_VIDEO_STT_FORCE_TEXT_FALLBACK") == "1":
        reason = "forced_text_fallback"
    else:
        try:
            payload = request_verbose_json(audio_path, language=language, translate=translate)
            return payload, {
                "fallback_used": False,
                "pipeline_status": "completed",
                "fallback_reason": None,
            }
        except TranscriptionFallbackRequired as exc:
            reason = str(exc)
    text = request_text_response(audio_path, language=language, translate=translate)
    write_text(artifact_dir / "transcript.text.raw-response.txt", text + "\n")
    normalized = normalize_text_fallback(text, language)
    if normalized != text:
        write_text(artifact_dir / "transcript.text.normalized.txt", normalized + "\n")
    payload = fallback_verbose_payload(normalized, reason=reason, language=language)
    return payload, {
        "fallback_used": True,
        "pipeline_status": "completed_with_text_fallback",
        "fallback_reason": reason,
    }


def build_segment_payload(payload: dict) -> dict:
    normalized_segments = []
    for index, segment in enumerate(payload.get("segments") or []):
        normalized_segments.append(
            {
                "id": segment.get("id", index),
                "start": segment.get("start"),
                "end": segment.get("end"),
                "text": (segment.get("text") or "").strip(),
                "avg_logprob": segment.get("avg_logprob"),
                "no_speech_prob": segment.get("no_speech_prob"),
                "words": segment.get("words") or [],
            }
        )
    return {
        "task": payload.get("task"),
        "language": payload.get("language"),
        "detected_language": payload.get("detected_language"),
        "detected_language_probability": payload.get("detected_language_probability"),
        "duration": payload.get("duration"),
        "full_text": (payload.get("text") or "").strip(),
        "segments": normalized_segments,
    }


def sec_to_srt(seconds: float) -> str:
    total_ms = int(round(seconds * 1000))
    hours = total_ms // 3_600_000
    minutes = (total_ms % 3_600_000) // 60_000
    secs = (total_ms % 60_000) // 1000
    ms = total_ms % 1000
    return f"{hours:02}:{minutes:02}:{secs:02},{ms:03}"


def sec_to_vtt(seconds: float) -> str:
    total_ms = int(round(seconds * 1000))
    hours = total_ms // 3_600_000
    minutes = (total_ms % 3_600_000) // 60_000
    secs = (total_ms % 60_000) // 1000
    ms = total_ms % 1000
    return f"{hours:02}:{minutes:02}:{secs:02}.{ms:03}"


def write_srt(path: Path, segments: list[dict]) -> None:
    lines: list[str] = []
    for idx, seg in enumerate(segments, start=1):
        if seg.get("start") is None or seg.get("end") is None:
            continue
        lines.append(str(idx))
        lines.append(f"{sec_to_srt(float(seg['start']))} --> {sec_to_srt(float(seg['end']))}")
        lines.append(seg.get("text", "").strip())
        lines.append("")
    if not lines:
        lines = ["1", "00:00:00,000 --> 00:00:00,000", "", ""]
    write_text(path, "\n".join(lines))


def write_vtt(path: Path, segments: list[dict]) -> None:
    lines = ["WEBVTT", ""]
    for seg in segments:
        if seg.get("start") is None or seg.get("end") is None:
            continue
        lines.append(f"{sec_to_vtt(float(seg['start']))} --> {sec_to_vtt(float(seg['end']))}")
        lines.append(seg.get("text", "").strip())
        lines.append("")
    write_text(path, "\n".join(lines) + "\n")


def resolved_detected_language(payload: dict) -> str | None:
    detected = payload.get("detected_language")
    if detected not in (None, ""):
        return str(detected)
    language = payload.get("language")
    if language not in (None, "", "auto"):
        return str(language)
    return None


def write_transcript_md(
    path: Path,
    *,
    title: str,
    source: str,
    payload: dict,
    language_requested: str,
    translate: bool,
    fallback_used: bool,
) -> None:
    text = (payload.get("text") or "").strip()
    detected = resolved_detected_language(payload)
    duration = payload.get("duration")
    header = [
        f"# Transcript: {title}",
        "",
        f"- Source: `{source}`",
        f"- Requested language: `{language_requested}`",
        f"- Translate to English: `{str(translate).lower()}`",
        f"- Detected language: `{detected}`",
        f"- Duration: `{duration}` seconds",
        f"- Text fallback used: `{str(fallback_used).lower()}`",
        "",
        "## Full text",
        "",
        text,
        "",
    ]
    write_text(path, "\n".join(header))


def write_research_notes(path: Path, *, title: str, payload: dict) -> None:
    detected = payload.get("detected_language") or payload.get("language")
    lines = [
        f"# Research notes: {title}",
        "",
        f"- Detected language: `{detected}`",
        f"- Duration: `{payload.get('duration')}` seconds",
        "",
        "## Timestamped segment ledger",
        "",
    ]
    for seg in payload.get("segments") or []:
        if seg.get("start") is None or seg.get("end") is None:
            continue
        lines.append(f"- [{sec_to_vtt(float(seg['start']))} - {sec_to_vtt(float(seg['end']))}] {seg.get('text', '').strip()}")
    lines.append("")
    write_text(path, "\n".join(lines))


def build_final_markdown(*, title: str, transcript_text: str) -> str:
    return "\n".join(
        [
            f"# {title} — Final Transcript",
            "",
            "## Published Transcript",
            "",
            transcript_text.strip(),
            "",
        ]
    )


def final_publish_paths(artifact_dir: Path) -> tuple[Path, Path]:
    return artifact_dir / "transcript.final.md", artifact_dir / "transcript.final.pdf"


def publish_final_outputs(artifact_dir: Path, *, title: str, transcript_text: str) -> tuple[Path, Path]:
    final_md_path, final_pdf_path = final_publish_paths(artifact_dir)
    write_text(final_md_path, build_final_markdown(title=title, transcript_text=transcript_text))
    result = run([PDF_RENDERER, str(final_md_path), str(final_pdf_path)])
    if result.returncode != 0 or not final_pdf_path.exists() or final_pdf_path.stat().st_size == 0:
        raise RuntimeError("PDF generation failed")
    return final_md_path, final_pdf_path


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="pi-local-video-stt")
    parser.add_argument("input", help="YouTube/VOD URL or local media file")
    parser.add_argument("--out-dir", default=DEFAULT_OUT_DIR, help="artifact root directory")
    parser.add_argument("--language", default="auto", help="whisper language value, default: auto")
    parser.add_argument("--translate", action="store_true", help="translate speech to English locally via whisper.cpp")
    parser.add_argument("--publish-final", action="store_true", help="emit final Markdown and PDF deliverables above the research sidecars")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    out_dir = Path(args.out_dir).expanduser().resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    input_value = args.input
    artifact_dir = unique_artifact_dir(out_dir, artifact_label_for_input(input_value))
    artifacts: dict[str, str | None] = {}
    transcript_payload: dict | None = None
    fallback_info: dict[str, object] | None = None

    try:
        for command in required_commands_for_input(input_value):
            ensure_command(command)
        if args.publish_final and not Path(PDF_RENDERER).exists():
            raise ArtifactFailure("pdf_renderer_missing", failure_stage="preflight")

        source_meta: dict | None = None
        if is_url(input_value):
            source_meta = fetch_yt_metadata(input_value)
            write_json(artifact_dir / "source.json", source_meta)
            artifacts["source_json"] = str(artifact_dir / "source.json")
            source_path = download_source(input_value, artifact_dir)
            artifacts["source_media"] = str(source_path)
            source_label = input_value
            title = source_meta.get("title") or source_meta.get("id") or "video"
        else:
            source_path = Path(input_value).expanduser().resolve()
            if not source_path.exists() or not source_path.is_file():
                raise ArtifactFailure("local_input_missing", failure_stage="resolve_input")
            source_label = str(source_path)
            title = source_path.name
            artifacts["source_json"] = None
            artifacts["source_media"] = None

        normalized_audio = normalize_audio(source_path, artifact_dir)
        artifacts["audio_normalized_wav"] = str(normalized_audio)

        if not acquire_backend_lock():
            raise ArtifactFailure("backend_lock_held", failure_stage="admission")
        try:
            check_whisper_server()
            transcript_payload, fallback_info = transcribe_with_fallback(
                normalized_audio,
                artifact_dir=artifact_dir,
                language=args.language,
                translate=args.translate,
            )
        finally:
            release_backend_lock()

        verbose_json_path = artifact_dir / "transcript.verbose.json"
        segments_json_path = artifact_dir / "transcript.segments.json"
        transcript_md_path = artifact_dir / "transcript.original.md"
        srt_path = artifact_dir / "transcript.srt"
        vtt_path = artifact_dir / "transcript.vtt"
        research_notes_path = artifact_dir / "research.notes.md"

        write_json(verbose_json_path, transcript_payload)
        segment_payload = build_segment_payload(transcript_payload)
        write_json(segments_json_path, segment_payload)
        write_transcript_md(
            transcript_md_path,
            title=title,
            source=source_label,
            payload=transcript_payload,
            language_requested=args.language,
            translate=args.translate,
            fallback_used=bool(fallback_info["fallback_used"]),
        )
        write_srt(srt_path, segment_payload["segments"])
        write_vtt(vtt_path, segment_payload["segments"])
        write_research_notes(research_notes_path, title=title, payload=transcript_payload)

        artifacts.update(
            {
                "transcript_verbose_json": str(verbose_json_path),
                "transcript_segments_json": str(segments_json_path),
                "transcript_original_md": str(transcript_md_path),
                "transcript_srt": str(srt_path),
                "transcript_vtt": str(vtt_path),
                "research_notes_md": str(research_notes_path),
                "transcript_text_raw_response": str(artifact_dir / "transcript.text.raw-response.txt")
                if (artifact_dir / "transcript.text.raw-response.txt").exists()
                else None,
                "transcript_text_normalized": str(artifact_dir / "transcript.text.normalized.txt")
                if (artifact_dir / "transcript.text.normalized.txt").exists()
                else None,
                "transcript_final_md": None,
                "transcript_final_pdf": None,
            }
        )

        if args.publish_final:
            expected_final_md_path, expected_final_pdf_path = final_publish_paths(artifact_dir)
            artifacts["transcript_final_md"] = str(expected_final_md_path)
            artifacts["transcript_final_pdf"] = str(expected_final_pdf_path) if expected_final_pdf_path.exists() else None
            final_md_path, final_pdf_path = publish_final_outputs(
                artifact_dir,
                title=title,
                transcript_text=segment_payload["full_text"],
            )
            artifacts["transcript_final_md"] = str(final_md_path)
            artifacts["transcript_final_pdf"] = str(final_pdf_path)

        write_status(
            artifact_dir,
            pipeline_status=str(fallback_info["pipeline_status"]),
            input_value=input_value,
            language_requested=args.language,
            translate=args.translate,
            detected_language=resolved_detected_language(transcript_payload),
            duration=transcript_payload.get("duration"),
            artifacts=artifacts,
            fallback_used=bool(fallback_info["fallback_used"]),
        )
        print(str(artifact_dir))
        return 0
    except ArtifactFailure as exc:
        write_status(
            artifact_dir,
            pipeline_status=exc.pipeline_status,
            input_value=input_value,
            language_requested=args.language,
            translate=args.translate,
            detected_language=None,
            duration=None,
            artifacts=artifacts,
            error=exc.error,
            failure_stage=exc.failure_stage,
            fallback_used=False,
        )
        return 1
    except RuntimeError as exc:
        write_status(
            artifact_dir,
            pipeline_status="failed",
            input_value=input_value,
            language_requested=args.language,
            translate=args.translate,
            detected_language=resolved_detected_language(transcript_payload or {}),
            duration=(transcript_payload or {}).get("duration"),
            artifacts=artifacts,
            error=str(exc),
            failure_stage="publishing",
            fallback_used=bool((fallback_info or {}).get("fallback_used", False)),
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
