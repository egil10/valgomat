import Image from "next/image";

import { CitationsTicker } from "@/components/CitationsTicker";
import { CursorGlow } from "@/components/CursorGlow";
import { FeaturedStatement } from "@/components/FeaturedStatement";
import { InstitutionalTicker } from "@/components/InstitutionalTicker";
import { LengthPicker } from "@/components/LengthPicker";
import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";

const FORMAT = new Intl.NumberFormat("nb-NO");

export default function HomePage() {
  return (
    <>
      <CursorGlow />
      <div className="space-y-8 sm:space-y-10">
        {/* Hero — tight, then CTA does the talking */}
        <section className="grid gap-6 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
              Stortingsvalget 2025–2029
            </p>
            <h1 className="mt-3 font-display text-4xl font-medium leading-[1.04] tracking-tight text-balance sm:text-6xl">
              Valgomaten<br />
              <span className="text-ink/55">som siterer kildene.</span>
            </h1>
            <p className="mt-3 max-w-xl text-balance text-base text-ink/65 sm:text-lg">
              {FORMAT.format(quiz.questions.length)} påstander, ni partier,
              alt med direkte lenke til programmet. Velg lengde og kjør.
            </p>
          </div>

          <div className="sm:col-span-2">
            <FeaturedStatement />
          </div>
        </section>

        {/* Length picker + giant Start CTA */}
        <section>
          <LengthPicker />
        </section>

        {/* Program quotes ticker */}
        <section className="-mx-5 space-y-3 sm:-mx-10">
          <p className="px-5 text-[11px] uppercase tracking-[0.18em] text-ink/55 sm:px-10">
            Direkte fra programmene
          </p>
          <CitationsTicker count={32} />
        </section>

        {/* Institutional quotes ticker */}
        <section className="-mx-5 space-y-3 sm:-mx-10">
          <p className="px-5 text-[11px] uppercase tracking-[0.18em] text-ink/55 sm:px-10">
            Fra talerstolen — Regjeringen og Stortinget
          </p>
          <InstitutionalTicker />
        </section>

        {/* Compact sources strip */}
        <section>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Kilder</p>
          <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {Object.values(quiz.parties).map((p) => (
              <li key={p.abbr} title={p.name}>
                <PartyLogo party={p} size={28} ring={false} />
              </li>
            ))}
            <li className="ml-2 h-6 w-px bg-black/10" aria-hidden />
            <li>
              <a
                href="https://www.stortinget.no/"
                target="_blank"
                rel="noreferrer"
                title="Stortinget"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                <Image
                  src="/logos/stortinget.svg"
                  alt="Stortinget"
                  width={88}
                  height={24}
                  className="h-6 w-auto"
                  unoptimized
                />
              </a>
            </li>
            <li>
              <a
                href="https://www.regjeringen.no/"
                target="_blank"
                rel="noreferrer"
                title="Regjeringen"
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                <Image
                  src="/logos/regjeringen.png"
                  alt="Regjeringen"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded"
                  unoptimized
                />
              </a>
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
