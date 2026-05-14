# The 4 Pillars Setup (Trade With Will)

- **Slug:** `four-pillars`
- **Reviewed:** NO — review before implementing
- **Performance claim:** 60R/month average, 70% break-even rate
- **Instrument shown:** NQ (NASDAQ 100 E-mini Futures, 1-minute chart)
- **Source:** "The 4 Pillars Setup Guide" PDF by Trade With Will

## Summary
A 4-step intraday trading framework that sequences: (1) pre-market liquidity sweep identification on 15min chart, (2) high timeframe level marking with HTF priority, (3) bias determination via PDR (Projected Defined Ranges) and ATT (Advanced Time Technique) instead of traditional daily bias, (4) internal confirmation entries using price action reading — multiple entries allowed per setup until PDR completes or fails. Trade management uses trailing stops exclusively, never static profit targets.

## The 4 Pillars (Sequential)

### Pillar 1: Liquidity Sweep
**Before market open:**
- On the 15-minute chart, identify the easiest relative equal highs AND relative equal lows on both sides of the market

**After market open:**
- Switch to 1-minute chart
- Wait for price to sweep ONE side (either the equal highs or equal lows)
- This sweep is the first confirmation that a setup is forming

> "Every morning before market open, identify the easiest 15-minute relative equal highs and relative equal lows on both sides of the market. The first step of the 4 Pillars setup is waiting for one of these sides to be swept on a 1-minute chart after the market opens."

Will's view of liquidity sweeps is different from most — see referenced video: **"Liquidity Explained"**

### Pillar 2: HTF Level (MOST IMPORTANT)
- High timeframe levels MUST be marked and defined correctly
- **Without this, nothing else works**
- **Key rule — HTF priority:** if a higher timeframe level overlaps a lower timeframe level, ALWAYS use the higher timeframe level
- After the liquidity sweep, price must trade into a marked HTF level

> "This is the most important pillar in the entire setup. The high timeframe levels MUST be marked and defined correctly — without this, nothing else works."

Level picking is critical — see referenced video: **"HTF Level Picking — The Key to My Strategy"**

### Pillar 3: Bias (via PDR and ATT)
- Will does NOT use traditional daily bias or session bias
- Generally has **NO bias** — plays market level to level
- Uses **PDR (Projected Defined Ranges)** — his unique concept for setting directional bias
  - When HTF level is tested → PDR onset → bias to projected target (e.g. "bias to top of blue box")
- When PDR is not present, uses **ATT (Advanced Time Technique)**
- ATT can also be used alongside PDRs

> "I view bias differently than most — instead of having a daily bias or session bias, I generally have NO bias. Instead, I play the market level to level, utilizing my unique concept called PDR (Projected Defined Ranges)."

Referenced videos:
- **"Daily Bias is Stupid... Here's Why"**
- **"Introducing the PDR Concept: My Best-Kept Trading Secret"**
- **"Introducing the Intraday ATT Method: The Market's Best-Kept Secret"**

### Pillar 4: Internal Confirmation / Entry
- Once Pillars 1-3 are satisfied, the stage is set
- Every single internal confirmation until the PDR completes = potential entry
- Can take MANY entries within one 4 Pillars setup (up to 10 trades per setup, all valid)
- Combines entry techniques + price action reading to find the best way to get involved
- Setup ends when PDR completes or fails

> "Now that the stage is set, every single internal confirmation until the PDR completes is a potential entry into a 4 Pillars trade. Until the PDR completes or fails, we can take many entries within one 4 Pillars setup — you can have 10 trades in a single setup, and all of them can be valid."

Referenced videos:
- **"THE ART OF READING PRICE ACTION"**
- **"the art of reading price action (REALTIME)"**
- **"My Exact Entry Techniques That Made Me Millions"**
- **"The 8 Types of Entries That Made Me Profitable In Trading"**

## Trade Management
- **NO static profit targets** — ever
- **Always trail stops**

> "I do NOT believe in static profit targets — I always trail my stops."

Referenced videos:
- **"How Trailing Stops Made Me 10x More Profitable (Masterclass)"**
- **"Stop-Loss Trailing: Maximize Profits, Minimize Risk"**
- **"They Say You Can't Have High Win Rate & High R:R... Well, They Lied"**

## What We Still Need (Unresolved)

To fully implement this strategy as a bot, we need details from the referenced videos:

1. **HTF Level Picking** — How exactly are HTF levels defined? What timeframes count as "high"? What makes a level valid?
2. **PDR Rules** — What are the exact rules for Projected Defined Ranges? How is onset identified? How does completion/failure work?
3. **ATT Rules** — What is the Advanced Time Technique? When exactly is it used?
4. **Liquidity definitions** — What exactly counts as "relative equal highs/lows"? How does Will's view differ from standard ICT liquidity concepts?
5. **Internal confirmation specifics** — What are the 8 types of entries? What counts as valid internal confirmation?
6. **Trailing stop mechanics** — How are trailing stops set? What's the trailing method (swing structure, fixed distance, ATR-based)?
7. **Instrument scope** — PDF shows NQ futures. Does this apply to crypto, forex, equities?
8. **Position sizing** — How to size positions relative to R-value targets?

## Referenced Video List (for ingestion)
These videos contain the implementation details needed:

1. Liquidity Explained
2. HTF Level Picking — The Key to My Strategy
3. Daily Bias is Stupid... Here's Why
4. Introducing the Intraday ATT Method: The Market's Best-Kept Secret
5. Introducing the PDR Concept: My Best-Kept Trading Secret
6. THE ART OF READING PRICE ACTION
7. the art of reading price action (REALTIME)
8. My Exact Entry Techniques That Made Me Millions
9. The 8 Types of Entries That Made Me Profitable In Trading
10. How Trailing Stops Made Me 10x More Profitable (Masterclass)
11. Stop-Loss Trailing: Maximize Profits, Minimize Risk
12. They Say You Can't Have High Win Rate & High R:R... Well, They Lied
