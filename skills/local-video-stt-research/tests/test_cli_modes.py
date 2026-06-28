from __future__ import annotations

import importlib.util
from pathlib import Path

TESTS_ROOT = Path(__file__).resolve().parent
SKILL_ROOT = TESTS_ROOT.parent
MODULE_PATH = SKILL_ROOT / "scripts" / "pi_local_video_stt.py"


def load_module():
    spec = importlib.util.spec_from_file_location("pi_local_video_stt", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_parse_args_supports_publish_final_flag():
    module = load_module()
    args = module.parse_args(["/tmp/input.wav", "--publish-final"])
    assert args.publish_final is True


def test_transcribe_with_fallback_returns_completed_with_text_fallback(tmp_path, monkeypatch):
    module = load_module()

    artifact_dir = tmp_path / "artifact"
    artifact_dir.mkdir()
    audio_path = artifact_dir / "audio.normalized.wav"
    audio_path.write_text("wav")

    calls = []

    def fake_verbose(_audio_path, *, language, translate):
        calls.append("verbose")
        raise module.TranscriptionFallbackRequired("forced fallback")

    def fake_text(_audio_path, *, language, translate):
        calls.append("text")
        return "hello fallback"

    monkeypatch.setattr(module, "request_verbose_json", fake_verbose)
    monkeypatch.setattr(module, "request_text_response", fake_text)
    monkeypatch.setattr(module, "normalize_text_fallback", lambda text, language: text)

    payload, info = module.transcribe_with_fallback(
        audio_path,
        artifact_dir=artifact_dir,
        language="auto",
        translate=False,
    )

    assert calls == ["verbose", "text"]
    assert info["fallback_used"] is True
    assert info["pipeline_status"] == "completed_with_text_fallback"
    assert payload["text"] == "hello fallback"
    assert payload["segments"] == []
    assert (artifact_dir / "transcript.text.raw-response.txt").exists()


def test_build_final_markdown_excludes_operational_metadata():
    module = load_module()
    text = module.build_final_markdown(title="Example", transcript_text="Hello world")
    assert "Source:" not in text
    assert "Language:" not in text
    assert "# Example — Final Transcript" in text
    assert "## Published Transcript" in text
    assert "Hello world" in text


def test_resolved_detected_language_does_not_report_auto_as_detected():
    module = load_module()
    payload = {"language": "auto", "detected_language": None}
    assert module.resolved_detected_language(payload) is None


def test_artifact_dir_is_created_for_backend_lock_failure(tmp_path, monkeypatch):
    module = load_module()
    input_file = tmp_path / "input.wav"
    input_file.write_text("x")

    monkeypatch.setattr(module, "ensure_command", lambda name: None)
    monkeypatch.setattr(module, "check_whisper_server", lambda: None)
    monkeypatch.setattr(module, "normalize_audio", lambda source_path, artifact_dir: artifact_dir / "audio.normalized.wav")
    monkeypatch.setattr(module, "acquire_backend_lock", lambda: False)

    exit_code = module.main([
        str(input_file),
        "--out-dir",
        str(tmp_path / "artifacts"),
    ])

    assert exit_code == 1
    status_files = list((tmp_path / "artifacts").rglob("status.json"))
    assert status_files, "expected failure status artifact"
    payload = module.read_json(status_files[0])
    assert payload["error"] == "backend_lock_held"
    assert payload["failure_stage"] == "admission"
