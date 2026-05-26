"""Scrape Regjeringen.no taler & innlegg (ministerial speeches & op-eds).

The official listing page is
  https://www.regjeringen.no/no/aktuelt/taler_artikler/id1334/
and exposes the content via a paginated HTML view. There is no public
JSON API for speeches, so we scrape the index list and resolve each
speech's detail page to grab title, date, ministry, author, and body.

Pass `--limit N` to cap the number of speeches fetched per run.
"""

from __future__ import annotations

import argparse
import logging
import re
import sys
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from .utils import LOG, PROCESSED, RAW, http_get, json_write


INDEX_URL = "https://www.regjeringen.no/no/aktuelt/taler_artikler/id1334/"


def parse_speech_links(html: str, base: str) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    hrefs: list[str] = []
    seen: set[str] = set()
    # Speech detail URLs on regjeringen.no end with /id<number>/ — much
    # narrower than "a[href]" so we don't pick up nav/footer links.
    pattern = re.compile(r"/id\d+/?$")
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if not pattern.search(href):
            continue
        if "taler_artikler" not in href and "/aktuelt/" not in href:
            continue
        full = urljoin(base, href)
        if full in seen:
            continue
        seen.add(full)
        hrefs.append(full)
    return hrefs


def parse_speech_page(url: str) -> dict:
    resp = http_get(url)
    soup = BeautifulSoup(resp.text, "lxml")

    title = soup.find("h1")
    title_text = title.get_text(strip=True) if title else ""

    # The article body lives in <div class="article-body"> on most pages,
    # falling back to the <main> region.
    body_el = soup.select_one("div.article-body") or soup.find("main") or soup.body
    body_text = ""
    if body_el is not None:
        # Drop scripts, asides, share widgets
        for tag in body_el.find_all(["script", "style", "aside", "nav"]):
            tag.decompose()
        paragraphs = [p.get_text(" ", strip=True) for p in body_el.find_all(["p", "li", "h2", "h3", "h4"])]
        body_text = "\n\n".join(p for p in paragraphs if p)

    # Date and ministry metadata are usually rendered in a <dl> or <ul>
    # above the body. We grep them out leniently.
    meta_text = (soup.select_one(".article-meta") or soup).get_text(" ", strip=True)
    date_match = re.search(r"\b(\d{2})\.(\d{2})\.(\d{4})\b", meta_text)
    date = f"{date_match.group(3)}-{date_match.group(2)}-{date_match.group(1)}" if date_match else None

    return {
        "url": url,
        "title": title_text,
        "date": date,
        "text": body_text,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Scrape Regjeringen.no speeches.")
    parser.add_argument("--limit", type=int, default=30, help="max speeches to fetch")
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.WARNING if args.quiet else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    raw_dir = RAW / "regjeringen"
    out_dir = PROCESSED / "regjeringen"
    raw_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    LOG.info("fetching speech index: %s", INDEX_URL)
    index_html = http_get(INDEX_URL).text
    links = parse_speech_links(index_html, INDEX_URL)
    LOG.info("found %d candidate speech links", len(links))

    speeches: list[dict] = []
    for url in links[: args.limit]:
        try:
            speeches.append(parse_speech_page(url))
        except Exception as err:  # noqa: BLE001
            LOG.warning("failed %s: %s", url, err)

    json_write(out_dir / "speeches.json", speeches)
    LOG.info("wrote %d speeches", len(speeches))
    return 0


if __name__ == "__main__":
    sys.exit(main())
