"""Parse YouTube VTT subtitle files into structured form and render as Markdown."""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class VttCue:
    start: float       # seconds
    end: float         # seconds
    text: str          # cleaned, single-line


_TIMESTAMP_LINE_RE = re.compile(
    r"^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})"
)
# YouTube's auto captions embed inline cue tags like <00:00:01.200><c> word</c>
_INLINE_TAG_RE = re.compile(r"<[^>]+>")


def parse_vtt(content: str) -> list[VttCue]:
    """Parse a WebVTT file. Deduplicates the rolling cues YouTube auto-captions emit."""
    cues: list[VttCue] = []
    lines = content.splitlines()
    i = 0
    while i < len(lines):
        m = _TIMESTAMP_LINE_RE.match(lines[i].strip())
        if not m:
            i += 1
            continue

        h1, mi1, s1, ms1, h2, mi2, s2, ms2 = (int(x) for x in m.groups())
        start = h1 * 3600 + mi1 * 60 + s1 + ms1 / 1000
        end = h2 * 3600 + mi2 * 60 + s2 + ms2 / 1000

        i += 1
        text_lines = []
        while i < len(lines) and lines[i].strip():
            text_lines.append(lines[i])
            i += 1

        text = " ".join(t.strip() for t in text_lines)
        text = _INLINE_TAG_RE.sub("", text)
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            cues.append(VttCue(start=start, end=end, text=text))

    return _dedupe_rolling(cues)


def _dedupe_rolling(cues: list[VttCue]) -> list[VttCue]:
    """YouTube auto-captions emit overlapping cues where each new cue restates
    the tail of the previous one. Keep only new content."""
    out: list[VttCue] = []
    seen_text = ""
    for cue in cues:
        if not cue.text:
            continue
        if cue.text == seen_text:
            continue
        # If this cue's text starts with the previous cue's text, only the suffix is new
        if seen_text and cue.text.startswith(seen_text):
            new_text = cue.text[len(seen_text):].strip()
            if new_text:
                out.append(VttCue(start=cue.start, end=cue.end, text=new_text))
                seen_text = cue.text
            continue
        out.append(cue)
        seen_text = cue.text
    return out


def _fmt_ts(seconds: float) -> str:
    s = int(seconds)
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{h:02d}:{m:02d}:{sec:02d}" if h else f"{m:02d}:{sec:02d}"


def vtt_to_markdown(
    vtt_content: str,
    *,
    title: str,
    channel: str,
    url: str,
    caption_source: str,
) -> str:
    cues = parse_vtt(vtt_content)
    quality_note = {
        "manual": "Manual captions (high quality)",
        "auto": "Auto-generated captions — review for transcription errors",
        "none": "No captions",
    }.get(caption_source, caption_source)

    lines = [
        f"# {title}",
        "",
        f"- **Channel:** {channel}",
        f"- **Video:** {url}",
        f"- **Caption source:** {caption_source} — {quality_note}",
        "",
        "---",
        "",
    ]
    for cue in cues:
        lines.append(f"**[{_fmt_ts(cue.start)}]** {cue.text}")
        lines.append("")
    return "\n".join(lines)
