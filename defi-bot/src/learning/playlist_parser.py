"""Extract video IDs from YouTube playlist or single-video URLs (no API key required)."""

from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse

import requests


class PlaylistParseError(Exception):
    pass


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0 Safari/537.36"
)


def extract_playlist_id(url: str) -> str | None:
    parsed = urlparse(url)
    qs = parse_qs(parsed.query)
    if "list" in qs:
        return qs["list"][0]
    return None


def is_playlist_url(url: str) -> bool:
    return extract_playlist_id(url) is not None


def parse_video_ids(url_or_id: str) -> list[str]:
    """Given a URL (video or playlist) or a raw video ID, return a list of video IDs.

    For playlists, scrapes the playlist page to extract all video IDs.
    """
    from .transcript_fetcher import extract_video_id, TranscriptFetchError

    if is_playlist_url(url_or_id):
        return fetch_playlist_video_ids(url_or_id)

    try:
        return [extract_video_id(url_or_id)]
    except TranscriptFetchError as e:
        raise PlaylistParseError(str(e))


def fetch_playlist_video_ids(playlist_url: str) -> list[str]:
    """Scrape a YouTube playlist page for video IDs.

    Uses the public playlist page HTML. Works without an API key.
    """
    playlist_id = extract_playlist_id(playlist_url)
    if not playlist_id:
        raise PlaylistParseError(f"No playlist ID found in URL: {playlist_url}")

    page_url = f"https://www.youtube.com/playlist?list={playlist_id}"
    try:
        resp = requests.get(page_url, headers={"User-Agent": USER_AGENT}, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise PlaylistParseError(f"Failed to fetch playlist page: {e}")

    html = resp.text

    # YouTube embeds video IDs in playlistVideoRenderer blocks.
    # Primary pattern: "videoId":"XXXXXXXXXXX"
    ids = re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"', html)

    # Preserve order, dedupe
    seen = set()
    unique: list[str] = []
    for vid in ids:
        if vid not in seen:
            seen.add(vid)
            unique.append(vid)

    if not unique:
        raise PlaylistParseError(
            f"No videos found in playlist {playlist_id}. "
            "It may be private or region-restricted."
        )

    return unique
