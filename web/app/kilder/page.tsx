"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";
import type { PartySlug } from "@/lib/types";

export default function KilderPage() {
  const partyEntries = Object.entries(quiz.parties) as Array<[PartySlug, typeof quiz.parties[PartySlug]]>;
  const [filter, setFilter] = useState<string>("");

  const filteredQuestions = useMemo(() => {
    if (!filter.trim()) return quiz.questions;
    const f = filter.toLowerCase();
    return quiz.questions.filter(
      (q) => q.statement.toLowerCase().includes(f) || q.topic.toLowerCase().includes(f)
    );
  }, [filter]);

  return (
    <div className="space-y-14">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Kilder</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Hvor kommer alt fra
        </h1>
        <p className="mt-3 max-w-2xl text-ink/65">
          Hver påstand har én forhåndskodet posisjon per parti, forankret i et faktisk sitat fra
          partiets stortingsvalgprogram for 2025–2029. Klikk et sitat for å hoppe til den
          eksakte siden i programmet.
        </p>
      </header>

      <div className="rule" />

      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Primærkilder</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {partyEntries.map(([slug, party]) => (
            <li key={slug}>
              <a
                href={party.program_url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/55 p-3 hover:bg-white/85"
              >
                <PartyLogo party={party} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{party.name}</p>
                  <p className="truncate text-[11px] text-ink/45">Partiprogram 2025–2029</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-ink/30 transition group-hover:text-ink/70" />
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://data.stortinget.no/eksport/"
              target="_blank"
              rel="noreferrer"
              className="group flex h-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/55 p-3 hover:bg-white/85"
            >
              <Image
                src="/logos/stortinget.png"
                alt="Stortinget"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full"
                unoptimized
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">Stortinget</p>
                <p className="truncate text-[11px] text-ink/45">data.stortinget.no/eksport — roster, referater</p>
              </div>
              <ExternalLink size={14} className="ml-auto text-ink/30 transition group-hover:text-ink/70" />
            </a>
          </li>
          <li>
            <a
              href="https://www.regjeringen.no/no/aktuelt/taler_artikler/id1334/"
              target="_blank"
              rel="noreferrer"
              className="group flex h-full items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/55 p-3 hover:bg-white/85"
            >
              <Image
                src="/logos/regjeringen.png"
                alt="Regjeringen"
                width={40}
                height={40}
                className="h-10 w-10 shrink-0 rounded-full"
                unoptimized
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">Regjeringen</p>
                <p className="truncate text-[11px] text-ink/45">Taler og innlegg fra statsråder</p>
              </div>
              <ExternalLink size={14} className="ml-auto text-ink/30 transition group-hover:text-ink/70" />
            </a>
          </li>
        </ul>
      </section>

      <div className="rule" />

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
            {filteredQuestions.length} av {quiz.questions.length} påstander
          </p>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Søk i påstander…"
            className="rounded-full border border-black/[0.08] bg-white/55 px-4 py-1.5 text-sm text-ink placeholder:text-ink/40 focus:border-ink/30 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          {filteredQuestions.map((q) => (
            <details key={q.id} className="group rounded-3xl border border-black/[0.06] bg-white/55 p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink/45">{q.topic}</p>
                  <p className="mt-1 text-sm font-medium text-ink sm:text-base">{q.statement}</p>
                </div>
                <span className="shrink-0 text-ink/40 transition group-open:rotate-180">▾</span>
              </summary>
              <ul className="mt-4 space-y-3">
                {partyEntries.map(([slug, party]) => {
                  const pos = q.positions[slug];
                  const href = pos.source_url ?? party.program_url;
                  return (
                    <li key={slug} className="flex items-start gap-3 border-t border-black/[0.05] pt-3 first:border-t-0 first:pt-0">
                      <PartyLogo party={party} size={32} ring={false} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-medium text-ink">
                            {party.name}
                            <span className="ml-1 text-ink/40">· {party.abbr}</span>
                          </p>
                          <span className="ml-auto text-[11px] tabular-nums text-ink/45">{pos.score}/7</span>
                        </div>
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="group/quote mt-0.5 inline text-sm leading-snug text-ink/70 underline-offset-2 hover:underline"
                          title={pos.source_page ? `Åpne side ${pos.source_page} i partiprogrammet` : "Åpne partiprogrammet"}
                        >
                          «{pos.quote}»
                          <span className="ml-1 inline-flex items-center gap-0.5 align-baseline text-[10px] text-ink/40 opacity-0 transition-opacity group-hover/quote:opacity-100">
                            {pos.source_page && <>s. {pos.source_page}</>}
                            <ExternalLink size={11} aria-hidden />
                          </span>
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
