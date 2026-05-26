"use client";

import { useEffect, useState } from "react";

import { featuredSamples, parties } from "@/lib/landing-data";
import type { PartySlug } from "@/lib/types";

const SLUGS = Object.keys(parties) as PartySlug[];

/**
 * Rotating "smakebit"-card — uses a small pre-baked sample file so the
 * landing chunk doesn't need to bundle the full questions.json.
 */
export function FeaturedStatement() {
  const [i, setI] = useState(0);
  const pool = featuredSamples;

  useEffect(() => {
    if (pool.length === 0) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % pool.length), 5500);
    return () => window.clearInterval(t);
  }, [pool.length]);

  if (pool.length === 0) return null;
  const q = pool[i];

  return (
    <div
      className="glass-strong flex h-full min-h-[280px] flex-col rounded-3xl p-5 sm:min-h-[300px] sm:p-6"
      aria-live="polite"
    >
      <p className="truncate text-[11px] uppercase tracking-[0.18em] text-ink/55">
        {q.topic}
      </p>
      <p className="mt-2 line-clamp-3 min-h-[4.6em] font-display text-xl font-medium leading-snug text-balance text-ink sm:min-h-[3.9em] sm:text-2xl">
        «{q.statement}»
      </p>
      <div className="mt-auto grid grid-cols-7 gap-1.5 pt-4" aria-hidden>
        {Array.from({ length: 7 }, (_, k) => k + 1).map((score) => {
          const here = SLUGS.filter((s) => q.scores[s] === score);
          return (
            <div
              key={score}
              className="flex h-[112px] flex-col items-center gap-1 overflow-hidden rounded-xl border border-black/[0.05] bg-white/40 px-1 pb-1.5 pt-1.5"
            >
              <span className="text-[9px] tabular-nums text-ink/40">{score}</span>
              <div className="flex w-full flex-wrap justify-center gap-0.5">
                {here.map((slug) => {
                  const party = parties[slug];
                  return (
                    <span
                      key={slug}
                      title={party.name}
                      className="inline-flex h-[16px] items-center justify-center rounded-[5px] px-1 text-[9px] font-semibold uppercase tracking-tight text-white"
                      style={{ backgroundColor: party.color }}
                    >
                      {party.abbr}
                    </span>
                  );
                })}
              </div>
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
