"""Pre-generate a small landing-samples.json + parties.json so the home page
doesn't need to bundle the full ~600 KB questions.json. Run after the
questions pool changes:

    python scripts/build_landing_samples.py
"""
from __future__ import annotations

import json
from pathlib import Path

PARTIES = ["ap", "frp", "hoyre", "sv", "sp", "rodt", "mdg", "krf", "venstre"]
FEATURED_IDS = [
    "formuesskatt",
    "kjernekraft",
    "eu",
    "anerkjenne-palestina",
    "mobilforbud",
    "pensjonsalder",
    "rusreform",
]
N_CITATIONS = 32


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    src = root / "web" / "public" / "data" / "questions.json"
    out_parties = root / "web" / "public" / "data" / "parties.json"
    out_samples = root / "web" / "public" / "data" / "landing-samples.json"

    data = json.loads(src.read_text(encoding="utf-8"))
    parties = data["parties"]
    questions = data["questions"]

    # parties.json is just the parties dict.
    out_parties.write_text(json.dumps(parties, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Featured statements pre-baked to: id, topic, statement, scores per party.
    by_id = {q["id"]: q for q in questions}
    featured = []
    for qid in FEATURED_IDS:
        q = by_id.get(qid)
        if not q:
            continue
        featured.append(
            {
                "id": q["id"],
                "topic": q["topic"],
                "statement": q["statement"],
                "scores": {slug: q["positions"][slug]["score"] for slug in PARTIES},
            }
        )

    # Citation samples: spread evenly across the pool, rotate party assignment.
    citations = []
    total = len(questions)
    step = max(1, total // N_CITATIONS)
    for i in range(N_CITATIONS):
        q = questions[(i * step) % total]
        slug = PARTIES[i % len(PARTIES)]
        pos = q["positions"][slug]
        party = parties[slug]
        citations.append(
            {
                "slug": slug,
                "partyAbbr": party["abbr"],
                "color": party["color"],
                "logo": party["logo"],
                "topic": q["topic"],
                "axis": q["axis"],
                "quote": pos["quote"],
                "href": pos.get("source_url") or party["program_url"],
            }
        )

    out_samples.write_text(
        json.dumps(
            {
                "totalQuestions": len(questions),
                "version": data.get("version", ""),
                "featured": featured,
                "citations": citations,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {out_parties.name} ({len(parties)} parties)")
    print(f"wrote {out_samples.name} (featured={len(featured)}, citations={len(citations)})")


if __name__ == "__main__":
    main()
