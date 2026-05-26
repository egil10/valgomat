import Image from "next/image";
import Link from "next/link";

import { quiz } from "@/lib/data";

const FORMAT = new Intl.NumberFormat("nb-NO");

export default function OmPage() {
  const partyCount = Object.keys(quiz.parties).length;
  const citationCells = quiz.questions.length * partyCount;

  return (
    <article className="space-y-12">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Metode</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Slik virker valgomaten
        </h1>
        <p className="mt-4 max-w-2xl text-balance text-ink/70 sm:text-lg">
          En kvantitativ valgomat for stortingsvalget 2025–2029. Ingen redaksjonell
          oversettelse mellom programmet og deg — bare påstander, posisjoner og
          lenker rett til kilden.
        </p>
      </header>

      {/* Numbers row */}
      <section>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: FORMAT.format(quiz.questions.length), label: "påstander" },
            { value: String(partyCount),                  label: "partier" },
            { value: "7",                                 label: "trinn på skalaen" },
            { value: FORMAT.format(citationCells),        label: "sitater i datasettet" },
          ].map((s) => (
            <li key={s.label} className="rounded-2xl border border-black/[0.06] bg-white/55 p-4">
              <p className="font-display text-3xl font-medium tabular-nums text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink/55">
                {s.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="rule" />

      <section className="space-y-2">
        <h2 className="font-display text-xl font-medium">Påstandene</h2>
        <p className="text-ink/70">
          Hver runde trekker et tilfeldig utvalg fra {FORMAT.format(quiz.questions.length)} påstander —
          du velger lengde (10, 25, 50, 100 eller alle) på forsiden. Rekkefølgen
          blandes ved spillstart, så samme valgomat er aldri identisk to ganger.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Skalaen</h2>
        <p className="text-ink/70">
          Syv-trinns Likert med rene gule fjes, fra «Helt uenig» til «Helt enig».
          Tastatur 1–7 mapper rett til hvert trinn. Hver påstand kan også vektes
          fra «lite viktig» til «svært viktig» — vekten ganges inn i avstands­
          beregningen.
        </p>
        <p className="flex flex-wrap items-center gap-2 text-2xl">
          <span title="Helt uenig">😖</span>
          <span title="Uenig">😞</span>
          <span title="Noe uenig">😕</span>
          <span title="Tja">😐</span>
          <span title="Noe enig">🙂</span>
          <span title="Enig">😄</span>
          <span title="Helt enig">🤩</span>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-medium">Partienes posisjoner</h2>
        <p className="text-ink/70">
          Hver av {FORMAT.format(citationCells)} celler i matrisen er forankret
          i et utdrag fra det vedtatte stortingsvalg­programmet 2025–2029.
          Hovedmengden er paraphraserte oppsummeringer som lenker rett til programmets
          landingsside; et håndkurert utvalg har dyplenker med sidetall.
        </p>
        <p className="text-ink/70">
          Råteksten ligger under{" "}
          <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.85em]">data/processed/partiprogrammer/</code>,
          tekstuttrekket er gjort med{" "}
          <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.85em]">scrapers/partiprogram_scraper.py</code>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Matchen</h2>
        <pre className="overflow-x-auto rounded-xl border border-black/[0.06] bg-white/55 p-4 text-sm text-ink/85">
{`distance = Σ importance(q) × |userScore(q) − partyScore(q)|
match%   = 100 × (1 − distance / maxPossible)`}
        </pre>
        <p className="text-ink/70">
          L1-avstand, ikke dot-produkt: én «Helt uenig» vs. «Helt enig»-uenighet
          skal koste seks ganger så mye som én «Enig» vs. «Helt enig», men ikke
          36 ganger. Verdien skaleres til 0–100 så match-prosenten er sammenliknbar
          mellom korte og lange runder.
        </p>
        <p className="text-ink/70">
          Implementasjonen ligger i{" "}
          <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.85em]">web/lib/match.ts</code>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Live tilbakemelding</h2>
        <ul className="space-y-1.5 text-ink/70">
          <li>· <strong className="font-medium">Stable partistabel</strong> rett under svaralternativene — partiene plasseres i den emoji-kolonnen som tilsvarer deres score.</li>
          <li>· <strong className="font-medium">Nærmest deg på denne</strong> — fast plassert utklipp med sitat og lenke til programmet.</li>
          <li>· <strong className="font-medium">Topp-match i header-pillen</strong> — løpende oppdatering så du ser hvilket parti du ligger nærmest, uten å bla til resultatsiden.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-medium">Datakilder</h2>
        <ul className="space-y-2 text-ink/70">
          <li className="flex items-center gap-3">
            <Image src="/logos/stortinget.svg" alt="Stortinget" width={88} height={24} className="h-6 w-auto opacity-80" unoptimized />
            <span>Stortingsrepresentanter via <code className="text-[0.92em]">data.stortinget.no/eksport</code>.</span>
          </li>
          <li className="flex items-center gap-3">
            <Image src="/logos/regjeringen.png" alt="Regjeringen" width={28} height={28} className="h-7 w-7 rounded opacity-80" unoptimized />
            <span>Taler og innlegg hentet fra <code className="text-[0.92em]">regjeringen.no</code> via{" "}
              <code className="text-[0.92em]">scripts/fetch_institutional_quotes.py</code>.</span>
          </li>
          <li>· Alle ni partienes program 2025–2029 (PDF, tekst ekstrahert).</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl font-medium">Begrensninger og ærlighet</h2>
        <p className="text-ink/70">
          Hovedmengden av posisjons-utdragene er paraphraserte sammendrag basert
          på partiets dokumenterte standpunkt — du kommer alltid videre til
          selve programmet via «Alle kilder» eller utklippet under hver påstand.
          Politikermatch på enkeltrepresentant­nivå er under utvikling og er
          ikke aktiv enda.
        </p>
        <p className="text-ink/70">
          Datasett-versjon{" "}
          <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.85em]">{quiz.version}</code>.
          Hele pipelinen er åpen kildekode på{" "}
          <a href="https://github.com/egil10/valgomat" className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            github.com/egil10/valgomat
          </a>.
        </p>
      </section>

      <div>
        <Link href="/" className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-button">
          Til forsiden →
        </Link>
      </div>
    </article>
  );
}
