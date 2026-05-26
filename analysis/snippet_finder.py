"""Find topic-relevant sentences in each party's program text.

Used while authoring the seed quiz to surface real candidate citations for
each statement. Run it like:

    python -m analysis.snippet_finder "formuesskatt|formueskatt"
    python -m analysis.snippet_finder "oljeleting|nye oljelisenser"

It greps program.txt for matches, then prints up to N sentences around
each match per party. Output is plain text so you can copy excerpts
directly into the questions JSON.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROCESSED = ROOT / "data" / "processed" / "partiprogrammer"

# Sentence splitter: trailing .!? followed by whitespace + uppercase, with
# some Norwegian-aware tweaks (skip common abbreviations).
SENT = re.compile(r"(?<=[\.\!\?])\s+(?=[A-ZÆØÅ0-9])")


def find_snippets(party_slug: str, pattern: re.Pattern, max_hits: int = 4) -> list[str]:
    path = PROCESSED / party_slug / "program.txt"
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8")
    sentences = SENT.split(text)
    out: list[str] = []
    for s in sentences:
        if pattern.search(s):
            cleaned = re.sub(r"\s+", " ", s).strip()
            if 30 <= len(cleaned) <= 350:
                out.append(cleaned)
        if len(out) >= max_hits:
            break
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Find party-program snippets matching a regex.")
    parser.add_argument("pattern", help="regex pattern (case-insensitive)")
    parser.add_argument("--hits", type=int, default=3)
    parser.add_argument("--parties", nargs="*", help="restrict to these party slugs")
    args = parser.parse_args(argv)

    pat = re.compile(args.pattern, re.IGNORECASE)
    parties = args.parties or sorted([p.name for p in PROCESSED.iterdir() if p.is_dir()])

    for slug in parties:
        hits = find_snippets(slug, pat, max_hits=args.hits)
        print(f"\n=== {slug} ({len(hits)} hits) ===")
        for s in hits:
            print(f"- {s}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
