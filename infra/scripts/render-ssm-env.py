#!/usr/bin/env python3
"""Render AWS SSM Parameter Store JSON output as a dotenv file."""

from __future__ import annotations

import argparse
import json
import re
import shlex
import sys
from pathlib import Path


NAME_RE = re.compile(r"^[A-Z][A-Z0-9_]*$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to AWS SSM JSON output.")
    parser.add_argument("--output", required=True, help="Path to write dotenv output.")
    parser.add_argument(
        "--path-prefix",
        required=True,
        help="SSM path prefix to strip from parameter names.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    path_prefix = args.path_prefix.rstrip("/") + "/"
    payload = json.loads(Path(args.input).read_text())

    lines: list[str] = []
    seen: set[str] = set()
    for parameter in sorted(payload.get("Parameters", []), key=lambda item: item["Name"]):
        name = parameter["Name"]
        if not name.startswith(path_prefix):
            print(f"Skipping parameter outside prefix: {name}", file=sys.stderr)
            continue

        key = name.removeprefix(path_prefix)
        if not NAME_RE.match(key):
            raise ValueError(f"Invalid dotenv key derived from SSM parameter: {name}")
        if key in seen:
            raise ValueError(f"Duplicate dotenv key derived from SSM parameter: {key}")

        seen.add(key)
        lines.append(f"{key}={shlex.quote(parameter['Value'])}")

    if not lines:
        raise ValueError("No SSM parameters found for the requested prefix.")

    output = Path(args.output)
    output.write_text("\n".join(lines) + "\n")
    output.chmod(0o600)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
