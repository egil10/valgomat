"""Registry of Norwegian parliamentary parties + their 2025-2029 program sources.

Order follows seat count after the 2025 Storting election.

For each party we record:
  * `slug`        — stable kebab-case identifier used in filenames
  * `name`        — official Norwegian name
  * `abbr`        — short form (Ap, FrP, ...)
  * `color`       — primary brand color, used for the UI
  * `program_url` — best available link to the 2025-2029 program PDF
                    (None means we rely on `hub_url` + auto-discovery)
  * `hub_url`     — landing page for the program (where the PDF is linked
                    from). Some parties rename their PDF files periodically
                    so the hub link is the durable fallback.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Party:
    slug: str
    name: str
    abbr: str
    color: str
    hub_url: str
    program_url: str | None = None


PARTIES: list[Party] = [
    Party(
        slug="ap",
        name="Arbeiderpartiet",
        abbr="Ap",
        color="#E8112D",
        hub_url="https://www.arbeiderpartiet.no/om/program/",
        program_url=(
            "https://res.cloudinary.com/arbeiderpartiet/image/upload/"
            "fl_attachment:partiprogram-2025-2029/v1/ievv_filestore/"
            "130322a45ccf45889bfc6fa4116c5b480cadc1e93e51491f8199451dd231c7c5"
        ),
    ),
    Party(
        slug="frp",
        name="Fremskrittspartiet",
        abbr="FrP",
        color="#005AA9",
        hub_url="https://www.frp.no/partiprogram",
        program_url="https://www.frp.no/files/Program/2025/FrP-Partiprogram-2025-2029.pdf",
    ),
    Party(
        slug="hoyre",
        name="Høyre",
        abbr="H",
        color="#0065F1",
        hub_url="https://hoyre.no/politikk/partiprogram/",
        program_url=None,
    ),
    Party(
        slug="sv",
        name="Sosialistisk Venstreparti",
        abbr="SV",
        color="#C8102E",
        hub_url="https://www.sv.no/ressursbanken/tillitsvalgt/arbeidsprogram/",
        program_url="https://www.sv.no/wp-content/uploads/2025/04/svs-arbeidsprogram-2025-29-bm.pdf",
    ),
    Party(
        slug="sp",
        name="Senterpartiet",
        abbr="Sp",
        color="#14773D",
        hub_url="https://www.senterpartiet.no/politikk/nytt-program",
        program_url=(
            "https://www.senterpartiet.no/politikk/_/attachment/inline/"
            "ea7e4063-1374-47bf-8b10-839bf68904c0:"
            "3c54bc9ec99b5e017f069f2312b3962bd934c78a/"
            "Senterpartiets%20stortingsvalgprogram%202025-2029%20bokm%C3%A5l%20i%20PDF.pdf"
        ),
    ),
    Party(
        slug="rodt",
        name="Rødt",
        abbr="R",
        color="#B5121B",
        hub_url="https://roedt.no/arbeidsprogram",
        program_url="https://roedt.no/fil/29796b043eb866e5315c03ee379bb3de40a32208.pdf",
    ),
    Party(
        slug="mdg",
        name="Miljøpartiet De Grønne",
        abbr="MDG",
        color="#3D8C40",
        hub_url="https://mdg.no/politikk",
        program_url=None,
    ),
    Party(
        slug="krf",
        name="Kristelig Folkeparti",
        abbr="KrF",
        color="#F0B323",
        hub_url="https://krf.no/politikk/politisk-program/",
        program_url="https://krf.no/content/uploads/2020/09/Partiprogram-2025-2029.pdf",
    ),
    Party(
        slug="venstre",
        name="Venstre",
        abbr="V",
        color="#006666",
        hub_url="https://www.venstre.no/politikk/partiprogram/program-2025-2029/",
        program_url="https://www.venstre.no/assets/venstre-stortingsprogram-2025-2029.pdf",
    ),
]


def get_party(slug: str) -> Party:
    for p in PARTIES:
        if p.slug == slug:
            return p
    raise KeyError(slug)
