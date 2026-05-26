import Link from "next/link";
import { quiz } from "@/lib/data";

export default function OmPage() {
  return (
    <article className="space-y-14">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Metode</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Slik virker valgomaten
        </h1>
      </header>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-medium">Påstandene</h2>
        <p className="text-ink/70">
          {quiz.questions.length} politiske påstander, fem svaralternativer per påstand (
          <span aria-hidden>🙅 👎 🤷 👍 🤩</span>) og en vekt fra «lite viktig» til «svært viktig».
        </p>
      </section>

      <div className="rule" />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-medium">Partienes posisjoner</h2>
        <p className="text-ink/70">
          Hver av {quiz.questions.length * 9} celler er forankret i et faktisk sitat fra partiets vedtatte
          stortingsvalgprogram for 2025–2029. Tekstene er ekstrahert fra de offisielle PDF-ene og
          lagret under <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.85em]">data/processed/partiprogrammer/</code>.
        </p>
      </section>

      <div className="rule" />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-medium">Matchingen</h2>
        <pre className="overflow-x-auto rounded-xl border border-black/[0.06] bg-white/55 p-4 text-sm text-ink/85">
{`distance = Σ importance(q) × |userScore(q) − partyScore(q)|
match%   = 100 × (1 − distance / maxPossible)`}
        </pre>
        <p className="text-ink/70">
          L1-avstand, ikke dot-produkt — én «Helt uenig vs. Helt enig»-uenighet skal koste seks
          ganger så mye som én «Enig vs. Helt enig»-uenighet, men ikke 36 ganger.
        </p>
      </section>

      <div className="rule" />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-medium">Datakilder</h2>
        <ul className="space-y-1 text-ink/70">
          <li>· Alle ni partienes program 2025–2029 (PDF, tekst ekstrahert)</li>
          <li>· 169 stortingsrepresentanter via <code className="text-[0.92em]">data.stortinget.no/eksport</code></li>
          <li>· Et utvalg taler og innlegg fra Regjeringen.no</li>
          <li>· Stortingets referater (kommer i politikermatchen)</li>
        </ul>
      </section>

      <div className="rule" />

      <section className="space-y-2">
        <h2 className="font-display text-lg font-medium">Begrensninger</h2>
        <p className="text-ink/70">
          Sitatutdragene er menneskelig kuratert — det finnes alltid nyanser et énsetnings-sitat
          ikke fanger opp. Politikermatchen er under utvikling. Versjon{" "}
          <code className="rounded bg-black/[0.04] px-1.5 py-0.5 text-[0.85em]">{quiz.version}</code>.
        </p>
        <p className="text-ink/70">
          Hele pipelinen er åpen kildekode på{" "}
          <a href="https://github.com/egil10/valgomat" className="underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
            github.com/egil10/valgomat
          </a>.
        </p>
      </section>

      <div>
        <Link href="/quiz" className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-button">
          Start →
        </Link>
      </div>
    </article>
  );
}
