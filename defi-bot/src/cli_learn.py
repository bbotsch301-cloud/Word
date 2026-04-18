"""CLI commands for the `bot learn` subcommand group."""

from __future__ import annotations

from pathlib import Path

import click

from .learning.playlist_parser import (
    PlaylistParseError,
    is_playlist_url,
    parse_video_ids,
)
from .learning.screenshot_store import ScreenshotError, list_screenshots, store_screenshot
from .learning.strategy_spec import list_specs
from .learning.transcript_fetcher import (
    TranscriptFetchError,
    fetch_transcript,
    list_transcripts,
    load_transcript,
    save_transcript,
)
from .paths import SCREENSHOTS_DIR, SPECS_DIR, TRANSCRIPTS_DIR, ensure_dirs


@click.group()
def learn() -> None:
    """Strategy learning from YouTube transcripts."""
    ensure_dirs()


@learn.command("fetch")
@click.argument("url_or_id")
@click.option(
    "--language",
    "-l",
    multiple=True,
    default=("en", "en-US", "en-GB"),
    help="Preferred caption languages (in order).",
)
@click.option(
    "--force/--no-force",
    default=False,
    help="Re-fetch even if transcript already exists.",
)
def fetch(url_or_id: str, language: tuple[str, ...], force: bool) -> None:
    """Fetch transcripts from a playlist URL, video URL, or video ID."""
    try:
        video_ids = parse_video_ids(url_or_id)
    except PlaylistParseError as e:
        raise click.ClickException(str(e))

    if is_playlist_url(url_or_id):
        click.echo(f"Playlist: found {len(video_ids)} videos")
    else:
        click.echo(f"Single video: {video_ids[0]}")

    ok = 0
    skipped = 0
    failed = 0

    for vid in video_ids:
        existing = (TRANSCRIPTS_DIR / f"{vid}.json").exists()
        if existing and not force:
            click.echo(f"  [skip] {vid} (already fetched; use --force to re-fetch)")
            skipped += 1
            continue

        try:
            doc = fetch_transcript(vid, languages=list(language))
        except TranscriptFetchError as e:
            click.echo(f"  [fail] {vid}: {e}", err=True)
            failed += 1
            continue

        save_transcript(doc, TRANSCRIPTS_DIR)
        src_label = {"manual": "MANUAL", "auto": "AUTO", "translated": "TRANSLATED"}[doc.caption_source]
        click.echo(f"  [ok]   {vid} [{src_label}] {doc.title}")
        ok += 1

    click.echo("")
    click.echo(f"Done. ok={ok} skipped={skipped} failed={failed}")


@learn.command("list")
def list_cmd() -> None:
    """List ingested videos."""
    docs = list_transcripts(TRANSCRIPTS_DIR)
    if not docs:
        click.echo("No transcripts yet. Run: bot learn fetch <url>")
        return

    click.echo(f"{len(docs)} transcript(s) in {TRANSCRIPTS_DIR}")
    click.echo("")
    for doc in docs:
        src = {"manual": "MANUAL", "auto": "AUTO  ", "translated": "TRANS "}[doc.caption_source]
        duration_min = 0
        if doc.segments:
            last = doc.segments[-1]
            duration_min = int((last.start + last.duration) // 60)
        click.echo(f"  {doc.video_id}  [{src}]  {duration_min:3d}min  {doc.title}")


@learn.command("show")
@click.argument("video_id")
@click.option("--format", "fmt", type=click.Choice(["md", "json", "path"]), default="md")
def show(video_id: str, fmt: str) -> None:
    """Print a transcript for review."""
    from .learning.transcript_fetcher import extract_video_id

    try:
        vid = extract_video_id(video_id)
    except TranscriptFetchError as e:
        raise click.ClickException(str(e))

    if fmt == "path":
        click.echo(str(TRANSCRIPTS_DIR / f"{vid}.md"))
        return

    path = TRANSCRIPTS_DIR / f"{vid}.{fmt}"
    if not path.exists():
        raise click.ClickException(f"Transcript not found: {path}. Fetch it first.")
    click.echo(path.read_text())


@learn.command("screenshot")
@click.argument("video_id")
@click.argument("timestamp")
@click.argument("path", type=click.Path(exists=True, path_type=Path))
def screenshot_cmd(video_id: str, timestamp: str, path: Path) -> None:
    """Register a screenshot at VIDEO_ID / TIMESTAMP (e.g. 5:23 or 1:02:45)."""
    from .learning.transcript_fetcher import extract_video_id

    try:
        vid = extract_video_id(video_id)
    except TranscriptFetchError as e:
        raise click.ClickException(str(e))

    try:
        shot = store_screenshot(vid, timestamp, path, SCREENSHOTS_DIR)
    except ScreenshotError as e:
        raise click.ClickException(str(e))

    click.echo(f"Stored: {shot.path}")


@learn.command("screenshots")
@click.argument("video_id")
def screenshots_cmd(video_id: str) -> None:
    """List screenshots registered for a video."""
    from .learning.transcript_fetcher import extract_video_id

    try:
        vid = extract_video_id(video_id)
    except TranscriptFetchError as e:
        raise click.ClickException(str(e))

    shots = list_screenshots(vid, SCREENSHOTS_DIR)
    if not shots:
        click.echo(f"No screenshots for {vid}")
        return
    for s in shots:
        click.echo(f"  {s.timestamp}  {s.path}")


@learn.command("extract")
@click.argument("video_id")
def extract(video_id: str) -> None:
    """Print instructions for Claude to extract a strategy spec from a transcript."""
    from .learning.transcript_fetcher import extract_video_id

    try:
        vid = extract_video_id(video_id)
    except TranscriptFetchError as e:
        raise click.ClickException(str(e))

    doc = load_transcript(vid, TRANSCRIPTS_DIR)
    if doc is None:
        raise click.ClickException(f"Transcript for {vid} not found. Fetch it first.")

    shots = list_screenshots(vid, SCREENSHOTS_DIR)
    transcript_path = TRANSCRIPTS_DIR / f"{vid}.md"

    click.echo("# Strategy Extraction Task\n")
    click.echo(f"**Video:** {doc.title}")
    click.echo(f"**Channel:** {doc.channel}")
    click.echo(f"**URL:** {doc.url}")
    click.echo(f"**Caption source:** {doc.caption_source}")
    click.echo("")
    click.echo("## Inputs")
    click.echo(f"- Transcript: `{transcript_path}`")
    if shots:
        click.echo(f"- Screenshots ({len(shots)}):")
        for s in shots:
            click.echo(f"  - {s.timestamp}: `{s.path}`")
    else:
        click.echo("- Screenshots: none registered")
    click.echo("")
    click.echo("## Instructions for Claude")
    click.echo("Read the transcript (and any screenshots) and produce a StrategySpec.")
    click.echo(f"Write it to: `{SPECS_DIR}/<slug>.json` using strategy_spec.save_spec().")
    click.echo("Include source refs (video_id + timestamp + quote) for every rule.")
    click.echo("List anything ambiguous in `unresolved_questions` for the user to clarify.")


@learn.command("specs")
def specs_cmd() -> None:
    """List extracted strategy specs."""
    specs = list_specs(SPECS_DIR)
    if not specs:
        click.echo("No specs yet. Run: bot learn extract <video-id>")
        return
    for s in specs:
        flag = "REVIEWED" if s.reviewed else "DRAFT   "
        click.echo(f"  [{flag}] {s.slug}  — {s.name}")
