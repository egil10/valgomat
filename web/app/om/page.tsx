import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { quiz } from "@/lib/data";

export default function OmPage() {
  return (
    <article className="prose prose-neutral max-w-none space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-ink/55">Metode</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Slik virker valgomaten
        </h1>
      </header>

      <GlassCard className="space-y-3">
        <h2 className="font-display text-xl font-semibold">1. Påstandene</h2>
        <p className="text-ink/75">
          Du svarer på {quiz.questions.length} politiske påstander på en 1–7-skala
          (Helt uenig → Helt enig), og angir hvor viktig hver enkelt sak er for deg
          (lite viktig, viktig, svært viktig). Påstandene dekker skatt, klima, EU,
          forsvar, velferd, innvandring, samferdsel, helse, distrikt og mer.
        </p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-display text-xl font-semibold">2. Partienes posisjoner</h2>
        <p className="text-ink/75">
          For hver påstand har vi forhåndskodet partienes posisjon på samme 1–7-skala —
          og hver posisjon er forankret i et faktisk sitat fra partiets vedtatte
          stortingsvalgprogram for 2025–2029.
        </p>
        <p className="text-ink/75">
          Vi har lastet ned alle programmene som PDF, ekstrahert teksten side for side,
          og lagret rådata under <code className="rounded bg-black/5 px-1.5 py-0.5 text-[0.85em]">data/raw/partiprogrammer/</code>{" "}
          sammen med kuratert tekst under <code className="rounded bg-black/5 px-1.5 py-0.5 text-[0.85em]">data/processed/partiprogrammer/</code>.
        </p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-display text-xl font-semibold">3. Matchingen</h2>
        <p className="text-ink/75">
          For hvert spørsmål du har svart på regner vi ut den vektede L1-avstanden
          mellom ditt svar og partiets posisjon:
        </p>
        <pre className="overflow-x-auto rounded-2xl bg-white/70 p-4 text-sm text-ink/85 ring-1 ring-black/5">
{`weighted_distance = Σ importance(q) × |userScore(q) − partyScore(q)|
match%            = 100 × (1 − weighted_distance / maxPossible)`}
        </pre>
        <p className="text-ink/75">
          Vi bruker L1 (absolutt avstand), ikke dot-produkt, fordi 1–7-skalaen er
          ordinal: én «Helt uenig vs. Helt enig»-uenighet skal koste seks ganger så
          mye som én «Enig vs. Helt enig»-uenighet — men ikke 36 ganger.
        </p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-display text-xl font-semibold">4. Datakilder</h2>
        <ul className="list-disc space-y-1 pl-5 text-ink/75 marker:text-ink/40">
          <li>
            Alle ni partienes <strong>partiprogram for 2025–2029</strong>{" "}
            (lastet ned som PDF, tekst ekstrahert).
          </li>
          <li>
            Roster på <strong>169 stortingsrepresentanter</strong> via Stortingets
            offentlige API på <code className="text-[0.85em]">data.stortinget.no/eksport</code>.
          </li>
          <li>
            Et utvalg <strong>taler og innlegg</strong> fra Regjeringen.no for
            kommende politikermatch.
          </li>
          <li>
            <strong>Referater fra Stortinget</strong> brukes til å bygge
            politikerprofiler (kommende).
          </li>
        </ul>
      </GlassCard>

      <GlassCard className="space-y-3">
        <h2 className="font-display text-xl font-semibold">5. Begrensninger</h2>
        <p className="text-ink/75">
          Posisjonsutdragene er menneskelig kuratert ut fra programtekstene — det
          finnes alltid nyanser et énsetnings-sitat ikke fanger opp. Politikermatchen
          er foreløpig under utvikling. Påstandsutvalget vil vokse, og hver versjon
          får et tydelig versjonsmerke ({" "}
          <code className="rounded bg-black/5 px-1.5 py-0.5 text-[0.85em]">{quiz.version}</code>
          ).
        </p>
        <p className="text-ink/75">
          Koden, dataene og hele pipelinen ligger åpent på{" "}
          <a
            href="https://github.com/egil10/valgomat"
            className="underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/egil10/valgomat
          </a>
          .
        </p>
      </GlassCard>

      <div>
        <Link
          href="/quiz"
          className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-button"
        >
          Start quizen →
        </Link>
      </div>
    </article>
  );
}
