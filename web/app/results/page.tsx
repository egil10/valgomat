"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/GlassCard";
import { PartyBar } from "@/components/PartyBar";
import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";
import { matchParties, questionAlignment } from "@/lib/match";
import { loadAnswers } from "@/lib/store";
import type { UserAnswer } from "@/lib/types";

export default function ResultsPage() {
  const [answers, setAnswers] = useState<UserAnswer[] | null>(null);

  useEffect(() => {
    setAnswers(loadAnswers());
  }, []);

  const matches = useMemo(
    () => (answers ? matchParties(quiz, answers) : []),
    [answers]
  );

  if (answers === null) {
    return <p className="text-ink/40">Laster …</p>;
  }

  if (answers.length === 0) {
    return (
      <GlassCard strong className="space-y-3 text-center">
        <h1 className="font-display text-3xl font-medium">Ingen svar enda</h1>
        <p className="text-ink/65">Svar på minst én påstand for å se resultatet.</p>
        <Link href="/quiz" className="pill mx-auto inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-button">
          Start valgomaten →
        </Link>
      </GlassCard>
    );
  }

  const top = matches[0];

  return (
    <div className="space-y-14">
      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Din nærmeste match</p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-4 flex items-end justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <PartyLogo party={top.party} size={84} ring={false} />
            <div>
              <h1 className="font-display text-5xl font-medium leading-none tracking-tight sm:text-6xl">
                {top.party.name}
              </h1>
              <p className="mt-2 text-sm text-ink/55">{top.party.abbr}</p>
            </div>
          </div>
          <p className="font-display text-6xl font-medium leading-none tabular-nums sm:text-7xl">
            {Math.round(top.percent)}<span className="text-3xl text-ink/40 sm:text-4xl">%</span>
          </p>
        </motion.div>
      </section>

      <div className="rule" />

      <section>
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Rangering</p>
        <ol className="mt-4 space-y-5">
          {matches.map((m, i) => (
            <PartyBar key={m.slug} match={m} rank={i + 1} />
          ))}
        </ol>
      </section>

      <div className="rule" />

      <section className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">Per påstand</p>
        <div className="space-y-2">
          {answers.map((a) => {
            const q = quiz.questions.find((x) => x.id === a.questionId);
            if (!q) return null;
            const ranking = questionAlignment(quiz, a).sort((x, y) => x.diff - y.diff);
            return (
              <details key={a.questionId} className="group border-b border-black/[0.06] py-3">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <p className="text-sm font-medium text-ink/85 sm:text-base">{q.statement}</p>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <span className="text-ink/45 tabular-nums">Du: {a.score}/7</span>
                    <span className="text-ink/40 transition group-open:rotate-180">▾</span>
                  </div>
                </summary>
                <ul className="mt-3 space-y-2 pl-1">
                  {ranking.map((r) => {
                    const party = quiz.parties[r.slug];
                    return (
                      <li key={r.slug} className="flex gap-3">
                        <PartyLogo party={party} size={32} ring={false} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {party.name}
                            <span className="ml-1.5 text-ink/40 tabular-nums">· {r.partyScore}/7 · {r.diff === 0 ? "samme" : `${r.diff} unna`}</span>
                          </p>
                          <a
                            href={q.positions[r.slug].source_url ?? party.program_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-block text-sm leading-snug text-ink/65 underline-offset-2 hover:text-ink hover:underline"
                            title={q.positions[r.slug].source_page ? `Åpne side ${q.positions[r.slug].source_page} i partiprogrammet` : "Åpne partiprogrammet"}
                          >
                            «{r.quote}» <span aria-hidden className="text-ink/35">↗</span>
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </div>
      </section>

      <div className="flex gap-5 text-sm">
        <Link href="/quiz" className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-medium text-white shadow-button">
          Tilbake til valgomaten →
        </Link>
        <Link href="/om" className="self-center text-ink/55 underline-offset-2 hover:text-ink hover:underline">
          Metode
        </Link>
      </div>
    </div>
  );
}
