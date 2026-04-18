"""Local video ingestion: download subtitles, thumbnails, and scene keyframes via yt-dlp + ffmpeg.

This runs on the USER'S machine (not the sandbox), since YouTube blocks
the sandbox's IP. It produces small artifacts (subtitles + keyframe images)
that the user commits to the repo, then Claude reads them in the next session.

What it produces under data/transcripts/<video-id>/:
    transcript.vtt        — subtitles from YouTube (manual preferred, auto fallback)
    transcript.md         — same content rendered as readable Markdown with timestamps
    metadata.json         — title, channel, duration, chapters, caption source
    thumbnail.jpg         — video thumbnail
    keyframes/NNNN.jpg    — keyframes extracted at scene changes (configurable)
    keyframes/index.json  — { "0001.jpg": { "timestamp": "01:23", "seconds": 83.4 }, ... }
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


class IngestError(Exception):
    pass


@dataclass
class IngestResult:
    video_id: str
    output_dir: Path
    transcript_vtt: Optional[Path]
    transcript_md: Optional[Path]
    metadata_json: Path
    thumbnail: Optional[Path]
    keyframes: list[Path]
    caption_source: str  # "manual", "auto", or "none"


def _check_tool(name: str) -> None:
    if shutil.which(name) is None:
        raise IngestError(
            f"`{name}` is not installed. Install it first:\n"
            f"  yt-dlp:  pip install yt-dlp\n"
            f"  ffmpeg:  https://ffmpeg.org/download.html (or `brew install ffmpeg`, `apt install ffmpeg`)"
        )


def ingest(
    url: str,
    output_root: Path,
    *,
    scene_threshold: float = 0.4,
    max_keyframes: int = 60,
    keyframe_interval: Optional[float] = None,
) -> IngestResult:
    """Download subtitles, thumbnail, and keyframes for a single video.

    Args:
        url: YouTube URL or video ID
        output_root: Parent directory; this function creates output_root/<video-id>/
        scene_threshold: ffmpeg scene detection sensitivity (0.0-1.0, lower = more keyframes)
        max_keyframes: Hard cap on number of keyframes saved
        keyframe_interval: If set, extract a frame every N seconds INSTEAD of using
            scene detection (useful for screen-recordings where scenes don't change)
    """
    _check_tool("yt-dlp")
    _check_tool("ffmpeg")
    _check_tool("ffprobe")

    output_root.mkdir(parents=True, exist_ok=True)

    # 1. Probe video metadata + caption availability without downloading the video
    info = _probe(url)
    video_id = info["id"]
    out_dir = output_root / video_id
    out_dir.mkdir(parents=True, exist_ok=True)

    # 2. Save metadata
    metadata_path = out_dir / "metadata.json"
    metadata_path.write_text(json.dumps({
        "id": info["id"],
        "title": info.get("title"),
        "channel": info.get("channel") or info.get("uploader"),
        "duration": info.get("duration"),
        "url": info.get("webpage_url"),
        "upload_date": info.get("upload_date"),
        "chapters": info.get("chapters") or [],
        "description": info.get("description"),
    }, indent=2, ensure_ascii=False))

    # 3. Download subtitles (manual preferred, auto fallback)
    transcript_vtt, caption_source = _download_subtitles(url, out_dir, info)

    # 4. Convert VTT to Markdown if we have one
    transcript_md = None
    if transcript_vtt:
        from .vtt_parser import vtt_to_markdown
        transcript_md = out_dir / "transcript.md"
        transcript_md.write_text(
            vtt_to_markdown(
                transcript_vtt.read_text(),
                title=info.get("title", "(unknown)"),
                channel=info.get("channel") or info.get("uploader") or "",
                url=info.get("webpage_url", ""),
                caption_source=caption_source,
            )
        )

    # 5. Download thumbnail
    thumbnail = _download_thumbnail(url, out_dir)

    # 6. Download the video locally to extract keyframes
    video_file = _download_video(url, out_dir)
    try:
        keyframes = _extract_keyframes(
            video_file,
            out_dir / "keyframes",
            scene_threshold=scene_threshold,
            max_keyframes=max_keyframes,
            interval=keyframe_interval,
        )
    finally:
        # Don't keep the big video file around — we have the keyframes
        if video_file.exists():
            video_file.unlink()

    return IngestResult(
        video_id=video_id,
        output_dir=out_dir,
        transcript_vtt=transcript_vtt,
        transcript_md=transcript_md,
        metadata_json=metadata_path,
        thumbnail=thumbnail,
        keyframes=keyframes,
        caption_source=caption_source,
    )


def ingest_playlist(
    url: str,
    output_root: Path,
    **ingest_kwargs,
) -> list[IngestResult]:
    """Iterate every video in a playlist and ingest each one."""
    _check_tool("yt-dlp")

    proc = subprocess.run(
        ["yt-dlp", "--flat-playlist", "--print", "%(id)s\t%(title)s", url],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise IngestError(f"yt-dlp playlist enumeration failed:\n{proc.stderr}")

    entries = [line.split("\t", 1) for line in proc.stdout.splitlines() if line.strip()]
    print(f"Playlist: {len(entries)} videos")

    results = []
    for i, parts in enumerate(entries, 1):
        vid = parts[0]
        title = parts[1] if len(parts) > 1 else ""
        print(f"\n[{i}/{len(entries)}] {vid}  {title[:80]}")
        try:
            result = ingest(f"https://www.youtube.com/watch?v={vid}", output_root, **ingest_kwargs)
            results.append(result)
            print(
                f"  ok: caption={result.caption_source}, "
                f"keyframes={len(result.keyframes)}"
            )
        except IngestError as e:
            print(f"  fail: {e}")
    return results


# --------- internals --------- #


def _probe(url: str) -> dict:
    """Run yt-dlp -j to get video metadata as JSON."""
    proc = subprocess.run(
        ["yt-dlp", "-j", "--no-warnings", url],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        raise IngestError(f"yt-dlp probe failed:\n{proc.stderr.strip()[:500]}")
    return json.loads(proc.stdout.splitlines()[0])


def _download_subtitles(url: str, out_dir: Path, info: dict) -> tuple[Optional[Path], str]:
    """Download subtitles in VTT format. Returns (path, source) where source is manual/auto/none."""
    target_stem = out_dir / "transcript"

    # Determine caption source preference
    has_manual = bool(info.get("subtitles", {}).get("en"))
    has_auto = bool(info.get("automatic_captions", {}).get("en"))

    if not has_manual and not has_auto:
        # Try other English variants
        for sub_dict in (info.get("subtitles", {}), info.get("automatic_captions", {})):
            for lang in sub_dict:
                if lang.startswith("en"):
                    has_manual = sub_dict is info.get("subtitles", {})
                    has_auto = not has_manual
                    break

    if not has_manual and not has_auto:
        return None, "none"

    args = [
        "yt-dlp",
        "--skip-download",
        "--sub-format", "vtt",
        "--sub-langs", "en.*,en",
        "--convert-subs", "vtt",
        "-o", str(target_stem) + ".%(ext)s",
        url,
    ]
    if has_manual:
        args.insert(1, "--write-subs")
    if has_auto and not has_manual:
        args.insert(1, "--write-auto-subs")

    proc = subprocess.run(args, capture_output=True, text=True)
    if proc.returncode != 0:
        return None, "none"

    # yt-dlp names the file <stem>.<lang>.vtt
    candidates = sorted(out_dir.glob("transcript.*.vtt"))
    if not candidates:
        return None, "none"

    # Pick the first English one and rename to a stable name
    final = out_dir / "transcript.vtt"
    candidates[0].rename(final)
    # Clean up any remaining lang-tagged copies
    for c in out_dir.glob("transcript.*.vtt"):
        c.unlink()

    return final, "manual" if has_manual else "auto"


def _download_thumbnail(url: str, out_dir: Path) -> Optional[Path]:
    args = [
        "yt-dlp",
        "--skip-download",
        "--write-thumbnail",
        "--convert-thumbnails", "jpg",
        "-o", str(out_dir / "thumbnail.%(ext)s"),
        url,
    ]
    proc = subprocess.run(args, capture_output=True, text=True)
    if proc.returncode != 0:
        return None
    for ext in ("jpg", "jpeg", "png", "webp"):
        path = out_dir / f"thumbnail.{ext}"
        if path.exists():
            return path
    return None


def _download_video(url: str, out_dir: Path) -> Path:
    """Download the video at a modest resolution for keyframe extraction."""
    target = out_dir / "video.%(ext)s"
    args = [
        "yt-dlp",
        "-f", "best[height<=480]/best",  # 480p is plenty for keyframe extraction
        "--no-playlist",
        "-o", str(target),
        url,
    ]
    proc = subprocess.run(args, capture_output=True, text=True)
    if proc.returncode != 0:
        raise IngestError(f"yt-dlp video download failed:\n{proc.stderr.strip()[:500]}")
    matches = list(out_dir.glob("video.*"))
    if not matches:
        raise IngestError("Video download succeeded but file not found")
    return matches[0]


def _extract_keyframes(
    video: Path,
    out_dir: Path,
    *,
    scene_threshold: float,
    max_keyframes: int,
    interval: Optional[float],
) -> list[Path]:
    """Extract keyframes via ffmpeg scene detection, then cap at max_keyframes."""
    out_dir.mkdir(parents=True, exist_ok=True)

    if interval is not None:
        vf = f"fps=1/{interval}"
    else:
        vf = f"select='gt(scene,{scene_threshold})',showinfo"

    pattern = str(out_dir / "frame_%05d.jpg")
    proc = subprocess.run(
        ["ffmpeg", "-loglevel", "info", "-i", str(video),
         "-vf", vf, "-vsync", "vfr", "-q:v", "3", pattern],
        capture_output=True,
        text=True,
    )
    # ffmpeg writes scene timestamps to stderr via showinfo; parse them
    timestamps = _parse_showinfo_timestamps(proc.stderr) if interval is None else None

    frames = sorted(out_dir.glob("frame_*.jpg"))
    # Cap: keep evenly-spaced frames if we have too many
    if len(frames) > max_keyframes:
        step = len(frames) / max_keyframes
        keep_indices = {int(i * step) for i in range(max_keyframes)}
        for i, f in enumerate(frames):
            if i not in keep_indices:
                f.unlink()
        if timestamps is not None:
            timestamps = [t for i, t in enumerate(timestamps) if i in keep_indices]
        frames = sorted(out_dir.glob("frame_*.jpg"))

    # Renumber the surviving frames sequentially and write index.json
    final_frames = []
    index = {}
    for i, f in enumerate(frames, 1):
        new_name = f"{i:04d}.jpg"
        new_path = out_dir / new_name
        f.rename(new_path)
        final_frames.append(new_path)
        if timestamps and i - 1 < len(timestamps):
            secs = timestamps[i - 1]
            index[new_name] = {"seconds": secs, "timestamp": _fmt_ts(secs)}
        elif interval is not None:
            secs = i * interval
            index[new_name] = {"seconds": secs, "timestamp": _fmt_ts(secs)}

    if index:
        (out_dir / "index.json").write_text(json.dumps(index, indent=2))

    return final_frames


def _parse_showinfo_timestamps(stderr: str) -> list[float]:
    """ffmpeg's showinfo filter prints lines like:
        [Parsed_showinfo_1 @ 0x...] n: 0 pts: ... pts_time:12.345
    Extract the pts_time values in order.
    """
    return [float(m.group(1)) for m in re.finditer(r"pts_time:(\d+(?:\.\d+)?)", stderr)]


def _fmt_ts(seconds: float) -> str:
    s = int(seconds)
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{h:02d}:{m:02d}:{sec:02d}" if h else f"{m:02d}:{sec:02d}"
