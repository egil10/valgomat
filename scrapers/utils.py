"""Shared helpers for the scrapers: HTTP, paths, PDF text extraction."""

from __future__ import annotations

import hashlib
import json
import logging
import re
import time
from pathlib import Path
from typing import Iterable

import requests

LOG = logging.getLogger("valgomat")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
RAW = DATA / "raw"
PROCESSED = DATA / "processed"

# Some party sites (notably roedt.no on Cloudflare) 429 anything that
# doesn't look like a regular browser, so we send a stock UA. The polite
# project UA goes in From: instead.
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
PROJECT_FROM = "valgomat-research +https://github.com/egil10/valgomat"


def http_get(url: str, *, timeout: int = 60, retries: int = 3, sleep: float = 1.5) -> requests.Response:
    """GET with a browser-like UA and a few retries. Raises on final failure."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml,application/pdf,*/*;q=0.9",
        "Accept-Language": "nb-NO,nb;q=0.9,no;q=0.8,en;q=0.5",
        "From": PROJECT_FROM,
    }
    last_err: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
            resp.raise_for_status()
            return resp
        except requests.RequestException as err:
            last_err = err
            LOG.warning("GET %s failed (attempt %d/%d): %s", url, attempt, retries, err)
            time.sleep(sleep * attempt)
    assert last_err is not None
    raise last_err


def download(url: str, dest: Path, *, force: bool = False) -> Path:
    """Download `url` to `dest` unless it already exists. Returns dest."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and not force:
        LOG.info("cached: %s", dest)
        return dest
    LOG.info("downloading %s -> %s", url, dest)
    resp = http_get(url)
    dest.write_bytes(resp.content)
    return dest


def slugify(text: str, max_len: int = 80) -> str:
    text = text.lower()
    text = re.sub(r"[æå]", "a", text)
    text = re.sub(r"[ø]", "o", text)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text[:max_len] or "unnamed"


def sha1(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()


def jsonl_write(path: Path, rows: Iterable[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def json_write(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def extract_pdf_text(pdf_path: Path) -> list[dict]:
    """Extract text per page using pdfplumber, falling back to pypdf.

    Returns: list of {page: int, text: str}.
    """
    try:
        import pdfplumber
        pages: list[dict] = []
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                pages.append({"page": i, "text": text})
        if any(p["text"].strip() for p in pages):
            return pages
    except Exception as err:  # noqa: BLE001
        LOG.warning("pdfplumber failed on %s: %s — falling back to pypdf", pdf_path, err)

    from pypdf import PdfReader
    reader = PdfReader(str(pdf_path))
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:  # noqa: BLE001
            text = ""
        pages.append({"page": i, "text": text})
    return pages


# Rough split of a body of program text into chapter-like sections.
# Norwegian party programs are usually structured by numbered headings
# (1, 1.1, ...) and/or ALL-CAPS thematic headers. We split on either.
SECTION_HEADING = re.compile(
    r"""(?xm)
    ^\s*
    (?:
        (?:\d+(?:\.\d+){0,3})\s+[A-ZÆØÅ][^\n]{2,120}     # 1.1 Heading
        |
        [A-ZÆØÅ][A-ZÆØÅ\s\-]{4,80}                        # ALL CAPS HEADING
    )
    \s*$
    """,
)


def split_into_sections(full_text: str) -> list[dict]:
    """Best-effort split of program text into sections.

    Returns list of {heading, text, start_char}. Falls back to a single
    'document' section when no headings are detected.
    """
    matches = list(SECTION_HEADING.finditer(full_text))
    if not matches:
        return [{"heading": "Hele dokumentet", "text": full_text.strip(), "start_char": 0}]

    sections: list[dict] = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        heading = m.group(0).strip()
        body = full_text[m.end():end].strip()
        if not body:
            continue
        sections.append({"heading": heading, "text": body, "start_char": start})
    return sections
