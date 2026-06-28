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


def test_module_file_exists():
    assert MODULE_PATH.exists(), f"missing module: {MODULE_PATH}"


def test_local_file_mode_does_not_require_yt_dlp():
    module = load_module()
    required = module.required_commands_for_input("/tmp/input.wav")
    assert required == ["ffmpeg", "curl"]


def test_url_mode_requires_yt_dlp():
    module = load_module()
    required = module.required_commands_for_input("https://www.youtube.com/watch?v=abc")
    assert required == ["yt-dlp", "ffmpeg", "curl"]


def test_health_command_targets_local_health_endpoint():
    module = load_module()
    command = module.build_health_check_command()
    assert command[:3] == ["curl", "-fsS", "--max-time"]
    assert command[-1] == "http://127.0.0.1:8006/health"


def test_segment_payload_backfills_required_fields():
    module = load_module()
    payload = {
        "task": "transcribe",
        "language": "en",
        "duration": 1.23,
        "text": "hello",
        "segments": [
            {"start": 0.0, "end": 1.0, "text": "hello"},
        ],
    }
    segment_payload = module.build_segment_payload(payload)
    first = segment_payload["segments"][0]
    assert first["id"] == 0
    assert first["start"] == 0.0
    assert first["end"] == 1.0
    assert first["text"] == "hello"
    assert first["avg_logprob"] is None
    assert first["no_speech_prob"] is None
    assert first["words"] == []


def test_failure_status_contains_error_and_stage(tmp_path):
    module = load_module()
    artifact_dir = tmp_path / "artifact"
    artifact_dir.mkdir()
    status_path = module.write_status(
        artifact_dir,
        pipeline_status="failed",
        input_value="/tmp/input.wav",
        language_requested="auto",
        translate=False,
        detected_language=None,
        duration=None,
        artifacts={"status_json": str(artifact_dir / "status.json")},
        error="backend_lock_held",
        failure_stage="admission",
        fallback_used=False,
    )
    payload = module.read_json(status_path)
    assert payload["pipeline_status"] == "failed"
    assert payload["error"] == "backend_lock_held"
    assert payload["failure_stage"] == "admission"


def test_publish_paths_live_under_artifact_dir(tmp_path):
    module = load_module()
    artifact_dir = tmp_path / "artifact"
    md_path, pdf_path = module.final_publish_paths(artifact_dir)
    assert md_path == artifact_dir / "transcript.final.md"
    assert pdf_path == artifact_dir / "transcript.final.pdf"


def test_source_manifest_keeps_source_json_and_source_media_distinct(tmp_path):
    module = load_module()
    artifact_dir = tmp_path / 'url-success'
    artifact_dir.mkdir()
    status_path = artifact_dir / 'status.json'

    module.write_json(
        status_path,
        {
            'artifacts': {
                'source_json': str(artifact_dir / 'source.json'),
                'source_media': str(artifact_dir / 'source.webm'),
            }
        },
    )

    payload = module.read_json(status_path)
    assert payload['artifacts']['source_json'].endswith('source.json')
    assert payload['artifacts']['source_media'].endswith('source.webm')
    assert payload['artifacts']['source_json'] != payload['artifacts']['source_media']
