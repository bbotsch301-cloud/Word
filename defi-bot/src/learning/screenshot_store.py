"""Organize user-supplied screenshots by video ID and timestamp."""

from __future__ import annotations

import re
import shutil
from dataclasses import dataclass
from pathlib import Path


class ScreenshotError(Exception):
    pass


@dataclass
class Screenshot:
    video_id: str
    timestamp: str  # normalized "HHhMMmSSs" or "MMmSSs"
    path: Path


TIMESTAMP_PATTERNS = [
    (re.compile(r"^(\d+):(\d{1,2}):(\d{1,2})$"), lambda m: f"{int(m[1]):02d}h{int(m[2]):02d}m{int(m[3]):02d}s"),
    (re.compile(r"^(\d+):(\d{1,2})$"), lambda m: f"{int(m[1]):02d}m{int(m[2]):02d}s"),
    (re.compile(r"^(\d+)s$"), lambda m: f"{int(m[1]):02d}s"),
]


def normalize_timestamp(ts: str) -> str:
    """Normalize a timestamp like '5:23' or '1:02:45' to a filesystem-safe form."""
    ts = ts.strip()
    for pattern, formatter in TIMESTAMP_PATTERNS:
        m = pattern.match(ts)
        if m:
            return formatter(m)
    raise ScreenshotError(f"Unrecognized timestamp format: {ts!r} (expected 'M:SS', 'H:MM:SS', or 'Ns')")


def store_screenshot(
    video_id: str,
    timestamp: str,
    source_path: Path,
    screenshots_dir: Path,
) -> Screenshot:
    """Copy a screenshot into the store under <screenshots_dir>/<video_id>/<timestamp>.<ext>."""
    if not source_path.exists():
        raise ScreenshotError(f"Source file does not exist: {source_path}")

    normalized = normalize_timestamp(timestamp)
    video_dir = screenshots_dir / video_id
    video_dir.mkdir(parents=True, exist_ok=True)

    ext = source_path.suffix.lower() or ".png"
    dest = video_dir / f"{normalized}{ext}"
    shutil.copy2(source_path, dest)

    return Screenshot(video_id=video_id, timestamp=normalized, path=dest)


def list_screenshots(video_id: str, screenshots_dir: Path) -> list[Screenshot]:
    video_dir = screenshots_dir / video_id
    if not video_dir.exists():
        return []
    shots = []
    for path in sorted(video_dir.iterdir()):
        if path.is_file():
            shots.append(Screenshot(video_id=video_id, timestamp=path.stem, path=path))
    return shots
