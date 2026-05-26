"""Download all 9 party programs and extract clean text + sections.

Strategy per party:
  1. If `program_url` is set in parties.py → download that PDF directly.
  2. Otherwise scrape the `hub_url` and pick the most plausible PDF link
     (one whose href mentions "program" / "partiprogram" / "arbeidsprogram"
     and ends in .pdf).
  3. Extract text page-by-page using pdfplumber (pypdf fallback).
  4. Run a best-effort section split.
  5. Write three artifacts under data/processed/partiprogrammer/<slug>/:
       - program.txt           (full plain text)
       - pages.jsonl           (one row per page)
       - sections.json         (chapter-like sections)
       - meta.json             (source URL, sha1, page count, ...)
"""

from __future__ import annotations

import argparse
import hashlib
import logging
import sys
from typing import Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .parties import PARTIES, Party
from .utils import (
    LOG,
    PROCESSED,
    RAW,
    download,
    extract_pdf_text,
    http_get,
    json_write,
    jsonl_write,
    split_into_sections,
)


PROGRAM_KEYWORDS = ("partiprogram", "arbeidsprogram", "stortingsvalgprogram", "program-2025", "program_2025", "2025-2029")


def find_program_pdf(hub_url: str) -> Optional[str]:
    """Heuristically pick the program PDF link from a party's hub page."""
    LOG.info("discovering program PDF from hub: %s", hub_url)
    try:
        resp = http_get(hub_url)
    except Exception as err:  # noqa: BLE001
        LOG.error("could not fetch hub %s: %s", hub_url, err)
        return None

    soup = BeautifulSoup(resp.text, "lxml")
    candidates: list[tuple[int, str]] = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        href_l = href.lower()
        if not href_l.endswith(".pdf") and ".pdf?" not in href_l:
            continue
        text = (a.get_text() or "").lower()
        score = 0
        for kw in PROGRAM_KEYWORDS:
            if kw in href_l:
                score += 3
            if kw in text:
                score += 2
        if "2025" in href_l or "2025" in text:
            score += 1
        if score == 0:
            continue
        candidates.append((score, urljoin(hub_url, href)))

    if not candidates:
        LOG.warning("no PDF candidates found on %s", hub_url)
        return None

    candidates.sort(reverse=True)
    LOG.info("top candidate (score=%d): %s", candidates[0][0], candidates[0][1])
    return candidates[0][1]


def process_party(party: Party, *, force: bool = False) -> dict:
    raw_dir = RAW / "partiprogrammer"
    out_dir = PROCESSED / "partiprogrammer" / party.slug
    pdf_path = raw_dir / f"{party.slug}.pdf"

    url = party.program_url or find_program_pdf(party.hub_url)
    if not url:
        LOG.error("[%s] no program URL — skipping", party.slug)
        return {"slug": party.slug, "status": "no-url"}

    try:
        download(url, pdf_path, force=force)
    except Exception as err:  # noqa: BLE001
        LOG.error("[%s] download failed: %s", party.slug, err)
        return {"slug": party.slug, "status": "download-failed", "error": str(err), "url": url}

    pages = extract_pdf_text(pdf_path)
    full_text = "\n\n".join(p["text"] for p in pages).strip()
    sections = split_into_sections(full_text)
    sha = hashlib.sha1(pdf_path.read_bytes()).hexdigest()

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "program.txt").write_text(full_text, encoding="utf-8")
    jsonl_write(out_dir / "pages.jsonl", pages)
    json_write(out_dir / "sections.json", sections)
    meta = {
        "slug": party.slug,
        "name": party.name,
        "abbr": party.abbr,
        "color": party.color,
        "source_url": url,
        "hub_url": party.hub_url,
        "pdf_sha1": sha,
        "n_pages": len(pages),
        "n_sections": len(sections),
        "n_chars": len(full_text),
    }
    json_write(out_dir / "meta.json", meta)
    LOG.info("[%s] OK — %d pages, %d sections, %d chars", party.slug, len(pages), len(sections), len(full_text))
    return {**meta, "status": "ok"}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Scrape Norwegian party programs (2025-2029).")
    parser.add_argument("--only", nargs="*", help="restrict to these party slugs")
    parser.add_argument("--force", action="store_true", help="re-download cached PDFs")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.WARNING if args.quiet else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    parties = PARTIES if not args.only else [p for p in PARTIES if p.slug in args.only]
    results = [process_party(p, force=args.force) for p in parties]

    summary_path = PROCESSED / "partiprogrammer" / "index.json"
    json_write(summary_path, results)
    LOG.info("wrote index: %s", summary_path)
    failed = [r for r in results if r.get("status") != "ok"]
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
