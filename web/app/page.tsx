import Link from "next/link";
import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="pt-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Stortingsvalget 2025–2029</p>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[1.06] tracking-tight text-balance sm:text-7xl">
          En valgomat<br />som siterer kildene.
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg text-ink/65">
          {quiz.questions.length} påstander. {quiz.questions.length * 9} sitater fra de ni partienes vedtatte program. Ingen redaksjonelle tolkninger imellom.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/quiz"
            className="pill inline-flex items-center gap-2 bg-ink px-6 py-3 text-sm font-medium text-white shadow-button transition-transform hover:-translate-y-0.5"
          >
            Start
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/om"
            className="pill inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-ink/75 hover:text-ink"
          >
            Metode
          </Link>
        </div>
      </section>

      <div className="rule" />

      <section>
        <div className="flex flex-wrap items-center gap-3">
          {Object.values(quiz.parties).map((p) => (
            <PartyLogo key={p.abbr} party={p} size={40} ring={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
