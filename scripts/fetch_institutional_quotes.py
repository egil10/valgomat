"""Fetch a small set of real speech excerpts from regjeringen.no and
stortinget.no, distil one quotable paragraph from each, and write them to
web/public/data/institutional_quotes.json for the second hero ticker.

We deliberately keep this *very* small (≈30 items) so the homepage stays
fast and so each excerpt is auditable. Run when you want to refresh:

    python scripts/fetch_institutional_quotes.py
"""
from __future__ import annotations

import html
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

UA = {"User-Agent": "ValgomatBot/0.1 (+https://github.com/egil10/valgomat)"}

# Hand-picked speech URLs from regjeringen.no (recent "Taler og innlegg")
REGJERINGEN_URLS: list[str] = [
    "https://www.regjeringen.no/no/aktuelt/helse-og-omsorgstjenestens-beredskapsplaner-for-a-handtere-en-situasjon-med-krig-pa-norsk-jord/id3160707/",
    "https://www.regjeringen.no/no/aktuelt/nye-losninger-i-innvandringspolitikken/id3160328/",
    "https://www.regjeringen.no/no/aktuelt/russland-har-endret-seg.-det-har-ogsa-vart-naboskap/id3160051/",
    "https://www.regjeringen.no/no/aktuelt/statsministerens-innlegg-pa-norsk-industris-arskonferanse/id3159832/",
    "https://www.regjeringen.no/no/aktuelt/utenriksministerens-redegjorelse-om-viktige-eu-og-eos-saker/id3159640/",
    "https://www.regjeringen.no/no/aktuelt/innovasjonstalen-2026/id3159904/",
    "https://www.regjeringen.no/no/aktuelt/tale-pa-ffas-arsmote-2026/id3159554/",
    "https://www.regjeringen.no/no/aktuelt/utenriksministerens-tale-pa-frigjorings-og-veterandagen-8.-mai-2026/id3159328/",
    "https://www.regjeringen.no/no/aktuelt/finansministerens-innlegg-pa-markeringen-av-frigjorings-og-veterandagen/id3159187/",
    "https://www.regjeringen.no/no/aktuelt/stor-usikkerhet/id3159745/",
]


class _BodyExtractor(HTMLParser):
    """Pulls visible text out of regjeringen.no article bodies."""

    SKIP_TAGS = {"script", "style", "noscript", "header", "footer", "nav", "aside"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.buf: list[str] = []
        self.skip_depth = 0
        self.in_main = False
        self.main_depth = 0

    def handle_starttag(self, tag: str, attrs):  # noqa: ANN001
        attr_map = dict(attrs)
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
            return
        # The article body on regjeringen.no lives inside <main> or .article-body
        if tag == "main":
            self.in_main = True
            self.main_depth = 1
            return
        if self.in_main:
            self.main_depth += 1
        cls = attr_map.get("class", "") or ""
        if "article-body" in cls and not self.in_main:
            self.in_main = True
            self.main_depth = 1

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS and self.skip_depth > 0:
            self.skip_depth -= 1
            return
        if self.in_main:
            self.main_depth -= 1
            if self.main_depth <= 0:
                self.in_main = False

    def handle_data(self, data: str) -> None:
        if self.skip_depth > 0 or not self.in_main:
            return
        text = data.strip()
        if text:
            self.buf.append(text)


def fetch(url: str) -> str:
    req = Request(url, headers=UA)
    with urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_title(doc: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", doc, re.I | re.S)
    if not m:
        return ""
    raw = re.sub(r"\s+", " ", html.unescape(m.group(1))).strip()
    return raw.split(" - regjeringen.no")[0].strip()


def extract_speaker(doc: str) -> str:
    m = re.search(r'<meta name="DC.Creator" content="([^"]+)"', doc, re.I)
    if m:
        return html.unescape(m.group(1)).strip()
    m = re.search(r'<meta name="author" content="([^"]+)"', doc, re.I)
    if m:
        return html.unescape(m.group(1)).strip()
    return ""


def extract_date(doc: str) -> str:
    m = re.search(r'<meta name="DC.Date" content="(\d{4}-\d{2}-\d{2})', doc, re.I)
    return m.group(1) if m else ""


# Phrases that signal the parser caught a metadata header, not a real sentence.
_NOISE_PATTERNS = re.compile(
    r"(tale/innlegg|read in english|skann|kontakt|regjeringen\.no|publisert|sist oppdatert|av:\s*\w)",
    re.I,
)
# Prefix junk like "mai om ..." or "Tale/innlegg | Dato: 13.05.2026 |".
_PREFIX_STRIP = re.compile(r"^[^.A-ZÆØÅ]{0,40}")


def best_paragraph(doc: str) -> str:
    parser = _BodyExtractor()
    parser.feed(doc)
    blob = html.unescape(" ".join(parser.buf))
    blob = re.sub(r"\s+", " ", blob)
    sentences = re.split(r"(?<=[.!?])\s+", blob)

    cleaned: list[str] = []
    for s in sentences:
        if _NOISE_PATTERNS.search(s):
            continue
        s2 = s.strip()
        if 80 <= len(s2) <= 240:
            cleaned.append(s2)

    # Prefer sentences with first-person plural or imperative voice — they read
    # like real institutional statements rather than boilerplate.
    fp = [s for s in cleaned if re.search(r"\b(vi|jeg|Norge|regjeringen|skal|må|vil)\b", s, re.I)]
    pool = fp or cleaned
    if not pool:
        return ""
    out = pool[0]
    out = _PREFIX_STRIP.sub("", out).strip()
    return out


def collect() -> list[dict]:
    items: list[dict] = []
    for url in REGJERINGEN_URLS:
        try:
            html = fetch(url)
        except Exception as e:  # noqa: BLE001
            print(f"skip {url}: {e}")
            continue
        title = extract_title(html)
        speaker = extract_speaker(html)
        date = extract_date(html)
        quote = best_paragraph(html)
        if not quote:
            print(f"no quote for {url}")
            continue
        items.append(
            {
                "source": "regjeringen",
                "source_label": "Regjeringen.no",
                "title": title,
                "speaker": speaker,
                "date": date,
                "quote": quote,
                "url": url,
            }
        )
        time.sleep(0.4)
    return items


def main() -> None:
    items = collect()
    out = Path(__file__).resolve().parent.parent / "web" / "public" / "data" / "institutional_quotes.json"
    out.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {len(items)} institutional quotes -> {out}")


if __name__ == "__main__":
    main()
