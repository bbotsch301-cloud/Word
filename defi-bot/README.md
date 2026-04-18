# defi-bot

Multi-chain DeFi staking bot with auto-compounding, yield optimization, and backtesting.

## Status

**Phase 0 — Strategy Learning Pipeline.** The bot is being built in phases; the learning pipeline is built first so strategies can be extracted from YouTube content before core bot infrastructure is implemented.

## Install

```bash
cd defi-bot
python -m venv .venv && source .venv/bin/activate
pip install -e .
```

## Phase 0: Learning pipeline

Two ingestion modes:

### `ingest` (recommended) — full local capture
Runs on YOUR machine. Downloads subtitles, the thumbnail, and scene-change keyframes
via `yt-dlp` + `ffmpeg`. Produces small artifacts you commit so Claude can read both
the spoken content and the visual chart moments.

```bash
# Single video
bot learn ingest "https://www.youtube.com/watch?v=zJaBU8uUoS8"

# Whole playlist
bot learn ingest "https://www.youtube.com/playlist?list=PLxxxxx"

# Tune visual capture
bot learn ingest URL --scene-threshold 0.3 --max-keyframes 80
bot learn ingest URL --interval 10        # one frame every 10 seconds (good for screen recordings)
```

Output (per video, under `data/transcripts/<video-id>/`):
```
metadata.json        # title, channel, duration, chapters
transcript.vtt       # YouTube's own subtitles (manual preferred)
transcript.md        # human/Claude-readable, deduped + timestamped
thumbnail.jpg
keyframes/
    0001.jpg ... NNNN.jpg
    index.json       # frame -> timestamp mapping
```

The raw video file is auto-deleted after keyframes are extracted (and is in `.gitignore`
either way).

### `fetch` — captions only (no video, no keyframes)
Lightweight API-only fallback. Uses `youtube-transcript-api`. Works only from networks
that aren't IP-blocked by YouTube.

```bash
bot learn fetch "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Common commands

```bash
bot learn list                              # list everything ingested
bot learn show VIDEO_ID                     # print transcript for review
bot learn screenshot VIDEO_ID 05:23 path    # add a manual screenshot
bot learn extract VIDEO_ID                  # print extraction prompt for Claude
bot learn specs                             # list extracted strategy specs
```

### Workflow
1. **You:** `bot learn ingest <playlist-url>`
2. **You:** `git add data/transcripts && git commit && git push`
3. **Claude:** reads transcripts + keyframes, produces a strategy spec under `data/specs/`
4. **You:** review the spec, push corrections
5. **Claude:** implements the strategy in `src/strategies/<name>.py` and backtests it

## Phase 1+ (not yet built)

- Chain adapters (Solana, EVM)
- Protocol integrations (Jito, Marinade, Kamino, Aave, Lido, etc.)
- Strategies (auto-compound, yield hopping, delta-neutral, LP rebalancing)
- Risk management and backtesting

See `/root/.claude/plans/lexical-baking-pascal.md` for full plan.
