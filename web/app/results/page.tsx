"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { GlassCard } from "@/components/GlassCard";
import { PartyBar } from "@/components/PartyBar";
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
    return <p className="text-ink/60">Laster …</p>;
  }

  if (answers.length === 0) {
    return (
      <GlassCard strong className="space-y-3 text-center">
        <h1 className="font-display text-3xl font-semibold">Ingen svar enda</h1>
        <p className="text-ink/65">Du må svare på minst én påstand før du kan se resultatet.</p>
        <div className="pt-2">
          <Link
            href="/quiz"
            className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-button"
          >
            Start quizen →
          </Link>
        </div>
      </GlassCard>
    );
  }

  const top = matches[0];

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs uppercase tracking-wider text-ink/55">Din nærmeste match</p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.6, 0.2, 1] }}
          className="mt-3"
        >
          <GlassCard strong className="relative overflow-hidden">
            <div
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
              style={{ background: top.party.color }}
              aria-hidden
            />
            <div className="relative grid items-end gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-medium text-ink/60">{top.party.abbr}</p>
                <h1 className="mt-1 font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                  {top.party.name}
                </h1>
              </div>
              <div className="text-right">
                <p className="font-display text-7xl font-semibold leading-none tabular-nums sm:text-8xl">
                  {Math.round(top.percent)}
                  <span className="text-3xl text-ink/40 sm:text-4xl">%</span>
                </p>
                <p className="text-xs uppercase tracking-wider text-ink/55">match</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Hele rangeringen</h2>
        <GlassCard className="mt-3">
          <ol className="space-y-5">
            {matches.map((m, i) => (
              <PartyBar key={m.slug} match={m} rank={i + 1} />
            ))}
          </ol>
        </GlassCard>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Per-spørsmål: hvorfor du havnet der du gjorde
        </h2>
        <p className="mt-1 text-ink/60">
          For hver påstand vises ditt svar, partienes posisjon (sortert etter hvor nære
          de er deg), og det faktiske sitatet fra programmet deres.
        </p>
        <div className="mt-4 space-y-3">
          {answers.map((a) => {
            const q = quiz.questions.find((x) => x.id === a.questionId);
            if (!q) return null;
            const ranking = questionAlignment(quiz, a).sort((x, y) => x.diff - y.diff);
            return (
              <details
                key={a.questionId}
                className="group glass overflow-hidden rounded-4xl"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-6 sm:p-7">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-ink/50">{q.topic}</p>
                    <p className="mt-1 text-base font-medium text-ink/90 sm:text-lg">
                      {q.statement}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="pill bg-white/70 px-3 py-1 text-xs font-semibold text-ink/70 ring-1 ring-black/5">
                      Du: {a.score}/7
                    </span>
                    <span className="text-ink/40 transition group-open:rotate-180">▾</span>
                  </div>
                </summary>
                <div className="border-t border-black/[0.06] bg-white/40 px-6 py-5 sm:px-7">
                  <ul className="space-y-3">
                    {ranking.map((r) => {
                      const party = quiz.parties[r.slug];
                      return (
                        <li key={r.slug} className="flex gap-4">
                          <div
                            className="mt-1.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                            style={{ background: party.color }}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              {party.name}{" "}
                              <span className="ml-1 font-normal text-ink/45 tabular-nums">
                                · {party.abbr} · {r.partyScore}/7 ({r.diff === 0
                                  ? "samme"
                                  : `${r.diff} unna`})
                              </span>
                            </p>
                            <p className="mt-0.5 text-sm leading-relaxed text-ink/75">
                              «{r.quote}»
                            </p>
                            {party.program_url && (
                              <a
                                href={party.program_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-block text-xs text-ink/45 underline-offset-2 hover:text-ink/80 hover:underline"
                              >
                                Partiprogram (kilde) ↗
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/quiz"
          className="pill inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-button"
        >
          Endre svar →
        </Link>
        <Link
          href="/om"
          className="pill inline-flex items-center gap-2 bg-white/60 px-5 py-2.5 text-sm font-medium text-ink/80 ring-1 ring-black/5 backdrop-blur"
        >
          Slik virker matchingen
        </Link>
      </section>
    </div>
  );
}
