import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { quiz } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="animate-rise-in">
        <span className="pill inline-flex items-center gap-2 bg-white/60 px-3 py-1 text-xs uppercase tracking-wider text-ink/60 ring-1 ring-black/5 backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Stortingsvalget 2025 · sitatbelagt
        </span>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-7xl">
          Den valgomaten<br />som faktisk{" "}
          <span className="bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 bg-clip-text text-transparent">
            siterer kildene
          </span>
          .
        </h1>
        <p className="mt-6 max-w-2xl text-balance text-lg text-ink/70 sm:text-xl">
          {quiz.questions.length} påstander på en 1–7-skala, ekte sitater fra alle de ni partienes
          program for 2025–2029, og en transparent matching som viser nøyaktig hvorfor du
          havner der du gjør.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/quiz"
            className="pill inline-flex items-center gap-2 bg-ink px-6 py-3 text-base font-semibold text-white shadow-button transition-transform hover:-translate-y-0.5"
          >
            Start quizen
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/om"
            className="pill inline-flex items-center gap-2 bg-white/60 px-5 py-3 text-base font-medium text-ink/80 ring-1 ring-black/5 backdrop-blur hover:bg-white/80"
          >
            Slik virker matchingen
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <GlassCard className="space-y-2">
          <span className="font-display text-4xl font-semibold tabular-nums text-ink">{quiz.questions.length}</span>
          <p className="text-sm text-ink/65">
            kuraterte påstander, hver med ekte sitater fra alle ni partiene
          </p>
        </GlassCard>
        <GlassCard className="space-y-2">
          <span className="font-display text-4xl font-semibold tabular-nums text-ink">9</span>
          <p className="text-sm text-ink/65">
            partier på Stortinget — Ap, FrP, H, SV, Sp, Rødt, MDG, KrF, Venstre
          </p>
        </GlassCard>
        <GlassCard className="space-y-2">
          <span className="font-display text-4xl font-semibold tabular-nums text-ink">169</span>
          <p className="text-sm text-ink/65">
            stortingsrepresentanter i datagrunnlaget for politiker­matching (kommer)
          </p>
        </GlassCard>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Hva du blir spurt om
        </h2>
        <p className="mt-2 text-ink/65">
          Et lite knippe av påstandene — alle med sitatbelagt posisjon for hvert parti.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {quiz.questions.slice(0, 8).map((q) => (
            <li key={q.id}>
              <GlassCard className="h-full p-5">
                <p className="text-xs uppercase tracking-wider text-ink/50">{q.topic}</p>
                <p className="mt-2 text-base font-medium text-ink/90">{q.statement}</p>
              </GlassCard>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
