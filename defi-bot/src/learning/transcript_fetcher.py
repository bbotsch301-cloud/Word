"""Fetch YouTube transcripts, preferring manual captions with auto-generated fallback."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

import requests
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    CouldNotRetrieveTranscript,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
)


CaptionSource = Literal["manual", "auto", "translated"]


@dataclass
class TranscriptSegment:
    start: float
    duration: float
    text: str

    def timestamp(self) -> str:
        total = int(self.start)
        h, rem = divmod(total, 3600)
        m, s = divmod(rem, 60)
        return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


@dataclass
class TranscriptDoc:
    video_id: str
    title: str
    channel: str
    url: str
    language: str
    caption_source: CaptionSource
    fetched_at: str
    segments: list[TranscriptSegment]

    def to_dict(self) -> dict:
        return {
            "video_id": self.video_id,
            "title": self.title,
            "channel": self.channel,
            "url": self.url,
            "language": self.language,
            "caption_source": self.caption_source,
            "fetched_at": self.fetched_at,
            "segments": [asdict(s) for s in self.segments],
        }


class TranscriptFetchError(Exception):
    pass


def extract_video_id(url_or_id: str) -> str:
    """Accepts raw video IDs, watch URLs, short URLs, or embed URLs."""
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", url_or_id):
        return url_or_id

    patterns = [
        r"(?:youtube\.com/watch\?(?:.*&)?v=)([A-Za-z0-9_-]{11})",
        r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
        r"(?:youtube\.com/embed/)([A-Za-z0-9_-]{11})",
        r"(?:youtube\.com/shorts/)([A-Za-z0-9_-]{11})",
    ]
    for pat in patterns:
        m = re.search(pat, url_or_id)
        if m:
            return m.group(1)
    raise TranscriptFetchError(f"Could not extract video ID from: {url_or_id}")


def fetch_video_metadata(video_id: str) -> tuple[str, str]:
    """Fetch title and channel via YouTube oEmbed (no API key required)."""
    try:
        resp = requests.get(
            "https://www.youtube.com/oembed",
            params={"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("title", "(unknown title)"), data.get("author_name", "(unknown channel)")
    except Exception:
        return "(unknown title)", "(unknown channel)"


def fetch_transcript(video_id: str, languages: list[str] | None = None) -> TranscriptDoc:
    """Fetch a transcript, preferring manual over auto-generated.

    Order of preference:
    1. Manual caption in preferred language
    2. Any manual caption (will note language)
    3. Auto-generated caption in preferred language
    4. Any auto-generated caption
    """
    languages = languages or ["en", "en-US", "en-GB"]

    api = YouTubeTranscriptApi()
    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled:
        raise TranscriptFetchError(f"Transcripts disabled for {video_id}")
    except VideoUnavailable:
        raise TranscriptFetchError(f"Video {video_id} unavailable")
    except CouldNotRetrieveTranscript as e:
        raise TranscriptFetchError(
            f"Could not retrieve transcript for {video_id}: {e}. "
            "YouTube may be rate-limiting this IP — try again from a residential network."
        )
    except Exception as e:
        raise TranscriptFetchError(f"Could not list transcripts for {video_id}: {e}")

    chosen = None
    source: CaptionSource = "auto"

    # 1. Manual in preferred language
    try:
        chosen = transcript_list.find_manually_created_transcript(languages)
        source = "manual"
    except NoTranscriptFound:
        pass

    # 2. Any manual
    if chosen is None:
        for t in transcript_list:
            if not t.is_generated:
                chosen = t
                source = "manual"
                break

    # 3. Auto-generated in preferred language
    if chosen is None:
        try:
            chosen = transcript_list.find_generated_transcript(languages)
            source = "auto"
        except NoTranscriptFound:
            pass

    # 4. Any auto-generated
    if chosen is None:
        for t in transcript_list:
            chosen = t
            source = "auto"
            break

    if chosen is None:
        raise TranscriptFetchError(f"No transcripts available for {video_id}")

    try:
        fetched = chosen.fetch()
    except CouldNotRetrieveTranscript as e:
        raise TranscriptFetchError(f"Could not fetch transcript for {video_id}: {e}")

    segments = [
        TranscriptSegment(start=float(s.start), duration=float(s.duration), text=s.text)
        for s in fetched.snippets
    ]

    title, channel = fetch_video_metadata(video_id)

    return TranscriptDoc(
        video_id=video_id,
        title=title,
        channel=channel,
        url=f"https://www.youtube.com/watch?v={video_id}",
        language=chosen.language_code,
        caption_source=source,
        fetched_at=datetime.now(timezone.utc).isoformat(),
        segments=segments,
    )


def save_transcript(doc: TranscriptDoc, transcripts_dir: Path) -> tuple[Path, Path]:
    """Save transcript as both JSON (machine-readable) and Markdown (human-readable)."""
    transcripts_dir.mkdir(parents=True, exist_ok=True)

    json_path = transcripts_dir / f"{doc.video_id}.json"
    json_path.write_text(json.dumps(doc.to_dict(), indent=2, ensure_ascii=False))

    md_path = transcripts_dir / f"{doc.video_id}.md"
    md_path.write_text(_render_markdown(doc))

    return json_path, md_path


def _render_markdown(doc: TranscriptDoc) -> str:
    quality_note = {
        "manual": "Manual captions (high quality)",
        "auto": "Auto-generated captions — review for transcription errors",
        "translated": "Translated captions — review for translation errors",
    }[doc.caption_source]

    lines = [
        f"# {doc.title}",
        "",
        f"- **Channel:** {doc.channel}",
        f"- **Video:** {doc.url}",
        f"- **Language:** {doc.language}",
        f"- **Caption source:** {doc.caption_source} — {quality_note}",
        f"- **Fetched:** {doc.fetched_at}",
        "",
        "---",
        "",
    ]
    for seg in doc.segments:
        lines.append(f"**[{seg.timestamp()}]** {seg.text.replace(chr(10), ' ').strip()}")
        lines.append("")
    return "\n".join(lines)


def load_transcript(video_id: str, transcripts_dir: Path) -> TranscriptDoc | None:
    path = transcripts_dir / f"{video_id}.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text())
    segments = [TranscriptSegment(**s) for s in data["segments"]]
    return TranscriptDoc(
        video_id=data["video_id"],
        title=data["title"],
        channel=data["channel"],
        url=data["url"],
        language=data["language"],
        caption_source=data["caption_source"],
        fetched_at=data["fetched_at"],
        segments=segments,
    )


def list_transcripts(transcripts_dir: Path) -> list[TranscriptDoc]:
    if not transcripts_dir.exists():
        return []
    docs = []
    for path in sorted(transcripts_dir.glob("*.json")):
        doc = load_transcript(path.stem, transcripts_dir)
        if doc:
            docs.append(doc)
    return docs
