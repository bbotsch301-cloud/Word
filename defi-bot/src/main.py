"""Top-level CLI entry point for the defi-bot."""

from __future__ import annotations

import click

from .cli_learn import learn


@click.group()
@click.version_option(package_name="defi-bot")
def cli() -> None:
    """defi-bot — multi-chain DeFi staking bot with YouTube-driven strategy learning."""


cli.add_command(learn)


if __name__ == "__main__":
    cli()
