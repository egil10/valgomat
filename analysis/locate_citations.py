"""Resolve each curated quote in data/questions/questions.json to a
specific page + searchable phrase inside the party's program PDF.

Strategy
========
Quotes in the seed quiz are sometimes lightly paraphrased — we cannot
expect a verbatim substring match. So for every (party, quote) pair we:

  1. Normalize the quote to lowercase, strip punctuation, collapse
     whitespace, and tokenize into words.
  2. Slide windows of 6, 5, 4, then 3 consecutive words across the
     quote. For each window, check whether it appears (as a substring,
     in the normalized page text) on any page of the party program.
  3. Pick the longest window that hits, the earliest page it appears on,
     and use that phrase as the `search=` fragment.
  4. Build `source_url = program_url + "#page=N&search=<urlencoded>"`.

Any quote that has zero overlap with the program (truly paraphrased
inserts) gets no source_url — the UI just falls back to the bare
program URL.

Run:
    python -m analysis.locate_citations
"""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUESTIONS = ROOT / "data" / "questions" / "questions.json"
PROCESSED = ROOT / "data" / "processed" / "partiprogrammer"


def normalize(text: str) -> str:
    text = text.lower()
    text = text.replace("«", " ").replace("»", " ").replace(" ", " ")
    text = re.sub(r"[\.,;:!\?\(\)\[\]\"'/\\—–\-]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def load_pages(slug: str) -> list[tuple[int, str]]:
    """Return [(page_no, normalized_text), ...] for one party program."""
    path = PROCESSED / slug / "pages.jsonl"
    if not path.exists():
        return []
    out = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            row = json.loads(line)
            out.append((row["page"], normalize(row["text"])))
    return out


def best_match(quote: str, pages: list[tuple[int, str]]) -> tuple[int, str] | None:
    """Return (page_no, phrase) of the best match, or None."""
    words = normalize(quote).split()
    if not words:
        return None
    for window_len in (6, 5, 4, 3):
        if window_len > len(words):
            continue
        for i in range(0, len(words) - window_len + 1):
            phrase = " ".join(words[i : i + window_len])
            for page_no, page_text in pages:
                if phrase in page_text:
                    return page_no, phrase
    return None


def build_source_url(program_url: str, page: int, phrase: str) -> str:
    # PDF viewers (Chrome, Edge, Adobe) accept these query-style fragments.
    # `nameddest` would be more precise but most party PDFs don't ship
    # named destinations.
    return f"{program_url}#page={page}&search={urllib.parse.quote(phrase)}"


def main() -> int:
    raw = json.loads(QUESTIONS.read_text(encoding="utf-8"))
    parties = raw["parties"]
    questions = raw["questions"]

    pages_by_party: dict[str, list[tuple[int, str]]] = {}
    for slug in parties:
        pages_by_party[slug] = load_pages(slug)

    matched = 0
    missed = 0
    for q in questions:
        for slug, pos in q["positions"].items():
            quote = pos["quote"]
            pages = pages_by_party.get(slug, [])
            program_url = parties[slug]["program_url"]
            match = best_match(quote, pages)
            if match:
                page_no, phrase = match
                # Fragments are harmless on HTML hub pages too — browsers
                # just ignore unknown #fragments. For PDF URLs they jump to
                # the page and highlight the phrase.
                pos["source_url"] = build_source_url(program_url, page_no, phrase)
                pos["source_page"] = page_no
                matched += 1
            else:
                pos.pop("source_url", None)
                pos.pop("source_page", None)
                missed += 1

    QUESTIONS.write_text(json.dumps(raw, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"matched: {matched}  missed: {missed}  total: {matched + missed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
