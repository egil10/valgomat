import Image from "next/image";
import { Quote, Scale, Building2, BookOpen } from "lucide-react";

import { CitationsTicker } from "@/components/CitationsTicker";
import { LengthPicker } from "@/components/LengthPicker";
import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";

const FORMAT = new Intl.NumberFormat("nb-NO");

const STATS = [
  { label: "påstander", value: quiz.questions.length },
  { label: "partier",   value: Object.keys(quiz.parties).length },
  { label: "sitater",   value: quiz.questions.length * Object.keys(quiz.parties).length },
];

const PILLARS = [
  { icon: Quote,      title: "Sitatbelagt",      body: "Hver partiposisjon lenker til programmet — ingen redaksjonell oversettelse imellom." },
  { icon: Scale,      title: "Kvantitativ",     body: "7-trinns Likert per påstand, vektet etter hvor viktig hver sak er for deg." },
  { icon: Building2,  title: "Norske kilder",   body: "Partiprogrammene 2025–2029, supplert av Stortinget og Regjeringen." },
  { icon: BookOpen,   title: "Åpen metode",     body: "Algoritmen er offentlig, dataene er åpne, koden ligger på GitHub." },
];

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero */}
      <section className="pt-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Stortingsvalget 2025–2029
        </p>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[1.04] tracking-tight text-balance sm:text-7xl">
          En valgomat<br />
          <span className="text-ink/55">som siterer kildene.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-balance text-lg text-ink/65">
          {FORMAT.format(quiz.questions.length)} påstander.{" "}
          {FORMAT.format(quiz.questions.length * 9)} sitater fra de ni partienes vedtatte program.
          Ingen redaksjonelle tolkninger imellom.
        </p>

        <ul className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-sm text-ink/55">
          {STATS.map((s) => (
            <li key={s.label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-medium tabular-nums text-ink">
                {FORMAT.format(s.value)}
              </span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Length picker → primary call to action */}
      <section>
        <LengthPicker />
      </section>

      {/* Rolling banner of citations */}
      <section className="-mx-5 sm:-mx-10">
        <p className="px-5 pb-3 text-[11px] uppercase tracking-[0.18em] text-ink/55 sm:px-10">
          Direkte fra programmene
        </p>
        <CitationsTicker count={32} />
      </section>

      {/* Why */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Hvorfor en til
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-balance sm:text-4xl">
          Fordi vi viser deg hvor partiene <em className="not-italic underline decoration-ink/20 underline-offset-4">faktisk</em> står.
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="glass rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">
                  <Icon size={15} aria-hidden />
                </span>
                <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
              </div>
              <p className="mt-2 text-sm leading-snug text-ink/65">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parties row */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">De ni partiene</p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          {Object.values(quiz.parties).map((p) => (
            <li key={p.abbr} className="flex items-center gap-2">
              <PartyLogo party={p} size={40} ring={false} />
              <span className="text-sm text-ink/75">{p.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Institutional sources */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Institusjonelle kilder
        </p>
        <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <li>
            <a
              href="https://www.stortinget.no/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/55 px-4 py-2.5 transition-colors hover:bg-white/85"
            >
              <Image
                src="/logos/stortinget.svg"
                alt="Stortingets logo"
                width={120}
                height={32}
                className="h-8 w-auto"
                unoptimized
              />
              <span className="text-sm text-ink/75 group-hover:text-ink">
                Stortinget
              </span>
            </a>
          </li>
          <li>
            <a
              href="https://www.regjeringen.no/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/55 px-4 py-2.5 transition-colors hover:bg-white/85"
            >
              <Image
                src="/logos/regjeringen.png"
                alt="Regjeringens riksvåpen"
                width={32}
                height={32}
                className="h-8 w-8 rounded"
                unoptimized
              />
              <span className="text-sm text-ink/75 group-hover:text-ink">
                Regjeringen
              </span>
            </a>
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-xs text-ink/55">
          Sitater hentes primært fra partienes vedtatte program 2025–2029, supplert med
          referater fra Stortinget og taler/dokumenter fra Regjeringen.no.
        </p>
      </section>
    </div>
  );
}
