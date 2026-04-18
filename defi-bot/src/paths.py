"""Filesystem paths for runtime data."""

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
TRANSCRIPTS_DIR = DATA_DIR / "transcripts"
SPECS_DIR = DATA_DIR / "specs"
SCREENSHOTS_DIR = DATA_DIR / "screenshots"


def ensure_dirs() -> None:
    for d in (TRANSCRIPTS_DIR, SPECS_DIR, SCREENSHOTS_DIR):
        d.mkdir(parents=True, exist_ok=True)
