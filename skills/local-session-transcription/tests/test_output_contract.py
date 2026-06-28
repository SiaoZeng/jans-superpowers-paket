from __future__ import annotations

from pathlib import Path

TESTS_ROOT = Path(__file__).resolve().parent
SKILL_ROOT = TESTS_ROOT.parent
SKILL = SKILL_ROOT / 'SKILL.md'
OUTPUT_CONTRACT = SKILL_ROOT / 'references' / 'output-contract.md'
RUNTIME_NOTES = SKILL_ROOT / 'references' / 'runtime-notes.md'
TEMPLATE = SKILL_ROOT / 'templates' / 'session-transcript-template.md'


def test_required_files_exist():
    for path in (SKILL, OUTPUT_CONTRACT, RUNTIME_NOTES, TEMPLATE):
        assert path.exists(), f'missing file: {path}'


def test_output_contract_requires_summary_then_cleaned_transcript():
    text = OUTPUT_CONTRACT.read_text(encoding='utf-8')
    assert '## Teil 1 — 詳細摘要' in text
    assert '## Teil 2 — 整理後逐字稿' in text
    assert text.index('## Teil 1 — 詳細摘要') < text.index('## Teil 2 — 整理後逐字稿')


def test_output_contract_forbids_visible_metadata_block():
    text = OUTPUT_CONTRACT.read_text(encoding='utf-8')
    assert 'Source' in text
    assert 'Language' in text
    assert 'Artifact directory' in text
    assert 'Do not include a visible internal metadata block' in text


def test_runtime_notes_document_text_fallback():
    text = RUNTIME_NOTES.read_text(encoding='utf-8')
    assert 'response_format=text' in text
    assert 'opencc -c s2twp.json' in text


def test_template_matches_required_heading_order():
    text = TEMPLATE.read_text(encoding='utf-8')
    assert text.startswith('# <TITLE> — 摘要與整理後逐字稿')
    assert text.index('## Teil 1 — 詳細摘要') < text.index('## Teil 2 — 整理後逐字稿')
