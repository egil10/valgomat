# Valgomat — Ultimate Norsk Valgomat

En kvantitativ, kildebelagt valgomat som matcher deg mot **både parti og enkeltpolitikere** basert på faktiske utdrag fra partiprogrammene 2025–2029, Stortingets referater, og talene på Regjeringen.no.

> Hver påstand i quizen er forankret i konkrete sitater. Du kan klikke på et resultat og se nøyaktig hvor i et partiprogram eller en stortingstale partiets/politikerens posisjon er hentet fra.

## Status

🚧 Prototype — quizen kjører, datapipelinen er på plass, og en seed av påstander med ekte sitater dekker de ni største partiene fra Stortingsvalget 2025.

## Repo-struktur

```
valgomat/
├── data/
│   ├── raw/                       # alt nedlastet materiale, urørt
│   │   ├── partiprogrammer/       # PDF-ene fra hvert parti
│   │   ├── stortinget/            # referater (HTML/JSON)
│   │   └── regjeringen/           # taler og innlegg
│   ├── processed/                 # renset tekst, JSONL, indeks
│   │   ├── partiprogrammer/       # parti -> seksjoner med tekst
│   │   ├── stortinget/            # referater splittet på taler
│   │   ├── regjeringen/           # taler med metadata
│   │   └── politikere/            # politiker-profiler
│   └── questions/                 # seed-quiz: påstander + posisjoner + sitater
├── scrapers/                      # Python-skripts
│   ├── parties.py                 # parti-metadata + program-URLer
│   ├── partiprogram_scraper.py    # last ned + tekstutdrag
│   ├── stortinget_scraper.py      # referater + politiker-roster
│   ├── regjeringen_scraper.py     # taler/innlegg
│   └── utils.py
├── analysis/                      # NLP / posisjonseksrahering
│   ├── extract_positions.py
│   └── generate_questions.py
├── web/                           # Next.js-app (quiz + resultater)
└── docs/                          # notater, metodedokumentasjon
```

## Datakilder

**Partiprogrammer 2025–2029** (rekkefølge etter stortingsplasser etter valget 2025):

| Parti | Forkortelse | Kilde |
|-------|-------------|-------|
| Arbeiderpartiet | Ap | https://www.arbeiderpartiet.no/om/program/ |
| Fremskrittspartiet | FrP | https://www.frp.no/files/Program/2025/FrP-Partiprogram-2025-2029.pdf |
| Høyre | H | https://hoyre.no/politikk/partiprogram/ |
| Sosialistisk Venstreparti | SV | https://www.sv.no/ressursbanken/tillitsvalgt/arbeidsprogram/ |
| Senterpartiet | Sp | https://www.senterpartiet.no/politikk/nytt-program |
| Rødt | R | https://roedt.no/ |
| Miljøpartiet De Grønne | MDG | https://mdg.no/politikk |
| Kristelig Folkeparti | KrF | https://krf.no/politikk/politisk-program/ |
| Venstre | V | https://www.venstre.no/politikk/ |

**Stortinget:** referater + nett-TV-arkiv tilbake til 1996 (https://www.stortinget.no).
**Regjeringen:** taler og innlegg fra statsråder (https://www.regjeringen.no/no/aktuelt/taler_artikler/id1334/).

Alle kilder er offentlig tilgjengelige og lenkes tilbake fra hvert quiz-resultat.

## Kom i gang

### Datapipeline (Python 3.11+)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Last ned alle partiprogrammene som PDF + ekstraher tekst
python -m scrapers.partiprogram_scraper

# Hent et utvalg referater fra Stortinget
python -m scrapers.stortinget_scraper --limit 50

# Hent taler fra Regjeringen
python -m scrapers.regjeringen_scraper --limit 50
```

### Web-app (Next.js)

```powershell
cd web
npm install
npm run dev
```

Appen kjører på http://localhost:3000.

## Hvordan quizen virker

1. Du svarer på påstander på en **1–7-skala** (Helt uenig → Helt enig) og angir hvor viktig hver sak er for deg (1–3).
2. Hver påstand har en **forhåndskodet posisjon** per parti (1–7), forankret i et sitat fra partiets program.
3. Matchen beregnes som vektet avstand mellom dine svar og partiets posisjoner.
4. Resultatsiden viser:
   - Topp 3 partier med prosentvis match.
   - Topp politikere — basert på politikerprofiler bygget av talene deres på Stortinget.
   - Per-spørsmål-breakdown med eksakte sitater og lenker til kilde.

## Lisens

Datadrevet kode under MIT. De skrapte partiprogrammene tilhører partiene; vi siterer kort, lenker til kilden, og bruker materialet for ikke-kommersiell, opplysningsmessig analyse.
