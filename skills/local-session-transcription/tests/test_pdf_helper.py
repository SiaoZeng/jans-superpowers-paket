from __future__ import annotations

import subprocess
from pathlib import Path

TESTS_ROOT = Path(__file__).resolve().parent
SKILL_ROOT = TESTS_ROOT.parent
HELPER = SKILL_ROOT / 'scripts' / 'session-md-to-pdf'


def test_pdf_helper_exists_and_is_executable():
    assert HELPER.exists(), f'missing helper: {HELPER}'
    assert HELPER.stat().st_mode & 0o111, 'helper is not executable'


def test_pdf_helper_generates_nonempty_pdf(tmp_path):
    input_md = tmp_path / 'sample.md'
    output_pdf = tmp_path / 'sample.pdf'
    input_md.write_text(
        '# Test — 摘要與整理後逐字稿\n\n## Teil 1 — 詳細摘要\n\n測試摘要。\n\n## Teil 2 — 整理後逐字稿\n\n測試逐字稿。\n',
        encoding='utf-8',
    )

    result = subprocess.run(
        [str(HELPER), str(input_md), str(output_pdf)],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stderr
    assert output_pdf.exists(), 'PDF was not created'
    assert output_pdf.stat().st_size > 0, 'PDF is empty'
