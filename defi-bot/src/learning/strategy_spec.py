"""Structured strategy spec extracted from transcripts, reviewed by the user before coding."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field


Confidence = Literal["high", "medium", "low"]


class SourceRef(BaseModel):
    """Pointer back to where in a transcript (or screenshot) a rule came from."""

    video_id: str
    timestamp: str = Field(description="Human-readable timestamp like '05:23' or '01:02:45'")
    quote: str | None = Field(default=None, description="Direct quote supporting the rule")
    screenshot: str | None = Field(default=None, description="Path to screenshot if applicable")


class Indicator(BaseModel):
    name: str = Field(description="e.g. 'RSI', 'APR', 'TVL', 'funding rate'")
    params: dict = Field(default_factory=dict, description="e.g. {'period': 14}")
    notes: str | None = None


class Rule(BaseModel):
    description: str
    condition: str = Field(description="Machine-oriented condition, e.g. 'apr_spread > 2.0%'")
    confidence: Confidence = "medium"
    sources: list[SourceRef] = Field(default_factory=list)


class RiskParams(BaseModel):
    max_position_pct: float | None = None
    stop_loss_pct: float | None = None
    take_profit_pct: float | None = None
    max_drawdown_pct: float | None = None
    notes: str | None = None


class StrategySpec(BaseModel):
    name: str
    slug: str = Field(description="lowercase-hyphenated identifier")
    summary: str
    protocols: list[str] = Field(
        default_factory=list,
        description="Protocols this strategy targets, e.g. ['kamino', 'marinade']",
    )
    chains: list[str] = Field(default_factory=list)
    indicators: list[Indicator] = Field(default_factory=list)
    entry_rules: list[Rule] = Field(default_factory=list)
    exit_rules: list[Rule] = Field(default_factory=list)
    risk: RiskParams = Field(default_factory=RiskParams)
    unresolved_questions: list[str] = Field(
        default_factory=list,
        description="Things Claude couldn't determine from the transcript; needs user input",
    )
    source_videos: list[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reviewed: bool = False


def save_spec(spec: StrategySpec, specs_dir: Path) -> Path:
    """Save spec as JSON (source of truth) and render a Markdown view for review."""
    specs_dir.mkdir(parents=True, exist_ok=True)

    json_path = specs_dir / f"{spec.slug}.json"
    json_path.write_text(spec.model_dump_json(indent=2))

    md_path = specs_dir / f"{spec.slug}.md"
    md_path.write_text(_render_spec_markdown(spec))
    return json_path


def load_spec(slug: str, specs_dir: Path) -> StrategySpec | None:
    path = specs_dir / f"{slug}.json"
    if not path.exists():
        return None
    return StrategySpec.model_validate(json.loads(path.read_text()))


def list_specs(specs_dir: Path) -> list[StrategySpec]:
    if not specs_dir.exists():
        return []
    return [
        StrategySpec.model_validate(json.loads(p.read_text()))
        for p in sorted(specs_dir.glob("*.json"))
    ]


def _render_spec_markdown(spec: StrategySpec) -> str:
    lines = [f"# {spec.name}", ""]
    lines.append(f"- **Slug:** `{spec.slug}`")
    lines.append(f"- **Reviewed:** {'yes' if spec.reviewed else 'NO — review before implementing'}")
    lines.append(f"- **Chains:** {', '.join(spec.chains) or '(none)'}")
    lines.append(f"- **Protocols:** {', '.join(spec.protocols) or '(none)'}")
    lines.append(f"- **Source videos:** {', '.join(spec.source_videos) or '(none)'}")
    lines.append("")
    lines.append("## Summary")
    lines.append(spec.summary)
    lines.append("")

    if spec.indicators:
        lines.append("## Indicators")
        for ind in spec.indicators:
            params = f" (params: {ind.params})" if ind.params else ""
            lines.append(f"- **{ind.name}**{params}")
            if ind.notes:
                lines.append(f"  - {ind.notes}")
        lines.append("")

    def _render_rules(title: str, rules: list[Rule]) -> None:
        if not rules:
            return
        lines.append(f"## {title}")
        for i, r in enumerate(rules, 1):
            lines.append(f"{i}. **{r.description}** _(confidence: {r.confidence})_")
            lines.append(f"   - Condition: `{r.condition}`")
            for src in r.sources:
                ref = f"   - Source: {src.video_id} @ {src.timestamp}"
                if src.quote:
                    ref += f' — "{src.quote}"'
                lines.append(ref)
        lines.append("")

    _render_rules("Entry rules", spec.entry_rules)
    _render_rules("Exit rules", spec.exit_rules)

    risk = spec.risk
    if any(
        [
            risk.max_position_pct,
            risk.stop_loss_pct,
            risk.take_profit_pct,
            risk.max_drawdown_pct,
            risk.notes,
        ]
    ):
        lines.append("## Risk parameters")
        if risk.max_position_pct is not None:
            lines.append(f"- Max position: {risk.max_position_pct}%")
        if risk.stop_loss_pct is not None:
            lines.append(f"- Stop loss: {risk.stop_loss_pct}%")
        if risk.take_profit_pct is not None:
            lines.append(f"- Take profit: {risk.take_profit_pct}%")
        if risk.max_drawdown_pct is not None:
            lines.append(f"- Max drawdown: {risk.max_drawdown_pct}%")
        if risk.notes:
            lines.append(f"- Notes: {risk.notes}")
        lines.append("")

    if spec.unresolved_questions:
        lines.append("## Unresolved — needs user input")
        for q in spec.unresolved_questions:
            lines.append(f"- [ ] {q}")
        lines.append("")

    return "\n".join(lines)
