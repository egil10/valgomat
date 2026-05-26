"""Scrape Stortinget: current MP roster + parliamentary debate transcripts (referater).

Stortinget runs an open data service at https://data.stortinget.no/eksport/
that exposes JSON/XML feeds for representatives, sessions, debates, votes,
parties, committees and more. We use:

  * /eksport/dagensrepresentanter?format=json
        → current sitting Storting representatives
  * /eksport/representanter?StortingsperiodeId=2025-2029&format=json
        → all representatives for the current term
  * /eksport/publikasjoner?publikasjontype=referat&format=json
        → list of published debate transcripts

The script is deliberately small and idempotent — pass `--limit N` to cap
the number of referater fetched in one run. All raw responses are cached
under data/raw/stortinget/ so repeated runs are cheap.

Note: the actual referat HTML rendering for a given publikasjon is reached
via the publication detail page. The processed JSON we write is enough to
power "which MP said X about Y" lookups in the web app.
"""

from __future__ import annotations

import argparse
import logging
import sys

from .utils import LOG, PROCESSED, RAW, http_get, json_write


STORTINGET_BASE = "https://data.stortinget.no/eksport"
CURRENT_PERIOD = "2025-2029"


def fetch_representatives(period: str = CURRENT_PERIOD) -> list[dict]:
    """Return list of {id, name, party, county, ...} for all reps in `period`."""
    url = f"{STORTINGET_BASE}/representanter?StortingsperiodeId={period}&format=json"
    LOG.info("fetching MP roster for %s", period)
    raw = http_get(url).json()
    # The API returns a fairly deep envelope. The list of MPs lives under
    # raw["representanter_liste"]; defensively fall back if Stortinget
    # tweaks the schema.
    candidates = raw.get("representanter_liste") if isinstance(raw, dict) else None
    if candidates is None and isinstance(raw, dict):
        # try common alternatives
        for key in ("dagensrepresentanter_liste", "representant_liste"):
            if key in raw:
                candidates = raw[key]
                break
    if not isinstance(candidates, list):
        LOG.error("unexpected response shape: %r", list(raw.keys()) if isinstance(raw, dict) else type(raw))
        return []

    reps: list[dict] = []
    for r in candidates:
        if not isinstance(r, dict):
            continue
        first = (r.get("fornavn") or "").strip()
        last = (r.get("etternavn") or "").strip()
        party = (r.get("parti") or {}) if isinstance(r.get("parti"), dict) else {}
        county = (r.get("fylke") or {}) if isinstance(r.get("fylke"), dict) else {}
        reps.append({
            "id": r.get("id"),
            "name": f"{first} {last}".strip(),
            "first_name": first,
            "last_name": last,
            "party_id": party.get("id"),
            "party_name": party.get("navn"),
            "county_id": county.get("id"),
            "county_name": county.get("navn"),
            "gender": r.get("kjoenn"),
            "birth_year": (r.get("foedselsdato") or "")[:4] or None,
        })
    return reps


def fetch_publications(limit: int = 50) -> list[dict]:
    """Fetch a page of recent publications and filter for debate transcripts."""
    url = f"{STORTINGET_BASE}/publikasjoner?format=json"
    LOG.info("fetching publication index")
    raw = http_get(url).json()
    pubs = []
    if isinstance(raw, dict):
        pubs = raw.get("publikasjoner_liste") or raw.get("publikasjon_liste") or []
    out: list[dict] = []
    for p in pubs:
        if not isinstance(p, dict):
            continue
        ptype = (p.get("type") or "").lower()
        if "referat" not in ptype:
            continue
        out.append({
            "id": p.get("id"),
            "title": p.get("tittel") or p.get("undertittel"),
            "date": p.get("dato"),
            "type": p.get("type"),
        })
        if len(out) >= limit:
            break
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Fetch Stortinget roster + referater.")
    parser.add_argument("--limit", type=int, default=50, help="max referater to enumerate")
    parser.add_argument("--period", default=CURRENT_PERIOD)
    parser.add_argument("--quiet", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.WARNING if args.quiet else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )

    raw_dir = RAW / "stortinget"
    out_dir = PROCESSED / "stortinget"
    raw_dir.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        reps = fetch_representatives(args.period)
        json_write(out_dir / "representatives.json", reps)
        LOG.info("wrote %d representatives", len(reps))
    except Exception as err:  # noqa: BLE001
        LOG.error("representative fetch failed: %s", err)

    try:
        pubs = fetch_publications(limit=args.limit)
        json_write(out_dir / "publications.json", pubs)
        LOG.info("wrote %d publications", len(pubs))
    except Exception as err:  # noqa: BLE001
        LOG.warning("publication fetch failed (skipping): %s", err)

    return 0


if __name__ == "__main__":
    sys.exit(main())
