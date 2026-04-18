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

Pull transcripts from a YouTube playlist or video, extract trading strategies, and review them before coding.

```bash
# Fetch transcripts from a playlist or single video
bot learn fetch "https://www.youtube.com/playlist?list=PLxxxxx"
bot learn fetch "https://www.youtube.com/watch?v=VIDEO_ID"

# List ingested videos
bot learn list

# Print a transcript for review
bot learn show VIDEO_ID

# Register a screenshot for a specific moment
bot learn screenshot VIDEO_ID 05:23 ~/Downloads/chart.png

# Mark a transcript as ready for strategy extraction (Claude reads it next)
bot learn extract VIDEO_ID

# List extracted strategy specs
bot learn specs
```

Transcripts prefer manual captions, falling back to auto-generated. The caption source is flagged in the metadata so low-confidence segments can be reviewed.

## Phase 1+ (not yet built)

- Chain adapters (Solana, EVM)
- Protocol integrations (Jito, Marinade, Kamino, Aave, Lido, etc.)
- Strategies (auto-compound, yield hopping, delta-neutral, LP rebalancing)
- Risk management and backtesting

See `/root/.claude/plans/lexical-baking-pascal.md` for full plan.
