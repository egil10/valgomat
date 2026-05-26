"use client";

import { useEffect, useState } from "react";

import { PartyLogo } from "@/components/PartyLogo";
import { quiz } from "@/lib/data";
import type { PartySlug, Question } from "@/lib/types";

/**
 * Visual proof card on the hero: rotates through a handful of real statements
 * showing each party's position. Gives a glance-preview of what the valgomat
 * looks like inside, without the user having to click anywhere.
 */
const FEATURED_IDS = [
  "formuesskatt",
  "kjernekraft",
  "eu",
  "anerkjenne-palestina",
  "mobilforbud",
  "pensjonsalder",
  "rusreform",
];

export function FeaturedStatement() {
  const candidates = FEATURED_IDS
    .map((id) => quiz.questions.find((q) => q.id === id))
    .filter((q): q is Question => !!q);

  const pool = candidates.length > 0 ? candidates : quiz.questions.slice(0, 5);
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % pool.length), 5500);
    return () => clearInterval(t);
  }, [pool.length]);

  const q = pool[i];
  const slugs = Object.keys(quiz.parties) as PartySlug[];

  return (
    <div
      className="glass-strong flex h-full min-h-[280px] flex-col rounded-3xl p-5 sm:min-h-[300px] sm:p-6"
      aria-live="polite"
    >
      <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ink/55">
        Smakebit · {q.topic}
      </p>
      <p className="mt-2 line-clamp-3 min-h-[4.6em] font-display text-xl font-medium leading-snug text-balance text-ink sm:min-h-[3.9em] sm:text-2xl">
        «{q.statement}»
      </p>
      <div className="mt-auto grid grid-cols-7 gap-1.5 pt-4" aria-hidden>
        {Array.from({ length: 7 }, (_, k) => k + 1).map((score) => {
          const here = slugs.filter((s) => q.positions[s].score === score);
          return (
            <div key={score} className="flex h-[104px] flex-col items-center gap-1 rounded-xl border border-black/[0.05] bg-white/40 px-1 pb-2 pt-1.5">
              <span className="text-[9px] tabular-nums text-ink/40">{score}</span>
              {here.map((slug) => (
                <PartyLogo key={slug} party={quiz.parties[slug]} size={18} ring={false} />
              ))}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between px-0.5 text-[9px] uppercase tracking-[0.18em] text-ink/40">
        <span>Uenig</span>
        <span>Enig</span>
      </div>
    </div>
  );
}
