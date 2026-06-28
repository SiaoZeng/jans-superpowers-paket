from __future__ import annotations

import importlib.util
from pathlib import Path

TESTS_ROOT = Path(__file__).resolve().parent
SKILL_ROOT = TESTS_ROOT.parent
MODULE_PATH = SKILL_ROOT / "scripts" / "pi_local_video_stt.py"
PDF_HELPER = SKILL_ROOT.parent / "local-session-transcription" / "scripts" / "session-md-to-pdf"


def load_module():
    spec = importlib.util.spec_from_file_location("pi_local_video_stt", MODULE_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test_publish_final_outputs_calls_pdf_renderer(tmp_path, monkeypatch):
    module = load_module()
    artifact_dir = tmp_path / "artifact"
    artifact_dir.mkdir()

    calls = []

    def fake_run(command, *, input_text=None):
        calls.append(command)
        pdf_path = Path(command[-1])
        pdf_path.write_text("pdf")
        return module.CommandResult(returncode=0, stdout=str(pdf_path), stderr="")

    monkeypatch.setattr(module, "run", fake_run)

    md_path, pdf_path = module.publish_final_outputs(
        artifact_dir,
        title="Example",
        transcript_text="Hello",
    )

    assert md_path.exists()
    assert pdf_path.exists()
    assert calls
    assert Path(calls[0][0]) == PDF_HELPER
    assert md_path.read_text(encoding="utf-8").startswith("# Example — Final Transcript")


def test_publish_final_outputs_requires_nonempty_pdf(tmp_path, monkeypatch):
    module = load_module()
    artifact_dir = tmp_path / "artifact"
    artifact_dir.mkdir()

    def fake_run(command, *, input_text=None):
        pdf_path = Path(command[-1])
        pdf_path.write_text("")
        return module.CommandResult(returncode=0, stdout=str(pdf_path), stderr="")

    monkeypatch.setattr(module, "run", fake_run)

    try:
        module.publish_final_outputs(artifact_dir, title="Example", transcript_text="Hello")
    except RuntimeError as exc:
        assert "PDF generation failed" in str(exc)
    else:
        raise AssertionError("expected RuntimeError")


def test_write_status_records_published_artifacts(tmp_path):
    module = load_module()
    artifact_dir = tmp_path / "artifact"
    artifact_dir.mkdir()
    status_path = module.write_status(
        artifact_dir,
        pipeline_status="completed",
        input_value="/tmp/input.wav",
        language_requested="auto",
        translate=False,
        detected_language="en",
        duration=1.0,
        artifacts={
            "transcript_final_md": str(artifact_dir / "transcript.final.md"),
            "transcript_final_pdf": str(artifact_dir / "transcript.final.pdf"),
        },
        fallback_used=False,
    )
    payload = module.read_json(status_path)
    assert payload["artifacts"]["transcript_final_md"].endswith("transcript.final.md")
    assert payload["artifacts"]["transcript_final_pdf"].endswith("transcript.final.pdf")


def test_publishing_failure_preserves_transcription_metadata(tmp_path, monkeypatch):
    module = load_module()
    input_file = tmp_path / 'input.wav'
    input_file.write_text('x')

    monkeypatch.setattr(module, 'ensure_command', lambda name: None)
    monkeypatch.setattr(module, 'check_whisper_server', lambda: None)
    monkeypatch.setattr(module, 'acquire_backend_lock', lambda: True)
    monkeypatch.setattr(module, 'release_backend_lock', lambda: None)
    monkeypatch.setattr(module, 'normalize_audio', lambda source_path, artifact_dir: artifact_dir / 'audio.normalized.wav')
    monkeypatch.setattr(module, 'transcribe_with_fallback', lambda *args, **kwargs: (
        {
            'task': 'transcribe',
            'language': 'auto',
            'detected_language': None,
            'duration': 1.25,
            'text': 'hello',
            'segments': [],
        },
        {'fallback_used': True, 'pipeline_status': 'completed_with_text_fallback', 'fallback_reason': 'forced_text_fallback'}
    ))
    monkeypatch.setattr(module, 'publish_final_outputs', lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError('PDF generation failed')))
    monkeypatch.setattr(module, 'write_srt', lambda path, segments: path.write_text('', encoding='utf-8'))
    monkeypatch.setattr(module, 'write_vtt', lambda path, segments: path.write_text('', encoding='utf-8'))

    exit_code = module.main([str(input_file), '--out-dir', str(tmp_path / 'out'), '--publish-final'])
    assert exit_code == 1
    status_files = list((tmp_path / 'out').rglob('status.json'))
    payload = module.read_json(status_files[0])
    assert payload['failure_stage'] == 'publishing'
    assert payload['fallback_used'] is True
    assert payload['duration'] == 1.25
    assert payload['detected_language'] is None
    assert payload['artifacts']['transcript_final_md'].endswith('transcript.final.md')
    assert payload['artifacts']['transcript_final_pdf'] is None
