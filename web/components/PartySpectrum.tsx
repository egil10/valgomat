"use client";

import { PartyLogo } from "@/components/PartyLogo";
import type { PartySlug, Question, Quiz } from "@/lib/types";

/**
 * Spectrum row — the visual reveal of where every party lands on the same
 * 1–7 axis. Renders inside the question card. Logos are deliberately
 * generous so the user can read this in one glance.
 */
export function PartySpectrum({
  quiz,
  question,
  userScore,
}: {
  quiz: Quiz;
  question: Question;
  userScore: number | null;
}) {
  const entries = (Object.keys(quiz.parties) as PartySlug[]).map((slug) => ({
    slug,
    score: question.positions[slug].score,
    party: quiz.parties[slug],
  }));

  const byScore = new Map<number, typeof entries>();
  for (const e of entries) {
    const list = byScore.get(e.score) ?? [];
    list.push(e);
    byScore.set(e.score, list);
  }
  for (const arr of byScore.values()) arr.sort((a, b) => a.party.abbr.localeCompare(b.party.abbr));

  function toPct(score: number) {
    return 7 + ((score - 1) / 6) * 86;
  }

  const revealed = userScore !== null;

  return (
    <section
      className="rounded-2xl border border-black/[0.05] bg-white/40 px-3 pb-2 pt-4 sm:px-4"
      aria-label="Partienes posisjon på spekteret"
    >
      <div className="relative h-[120px] sm:h-[136px]">
        <div className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-black/10" />

        {revealed && (
          <>
            <div
              className="absolute inset-y-0 w-px bg-ink/25 transition-[left] duration-300"
              style={{ left: `${toPct(userScore!)}%` }}
              aria-hidden
            />

            {Array.from(byScore.entries()).map(([score, list]) => {
              const left = toPct(score);
              return (
                <div
                  key={score}
                  className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                  style={{ left: `${left}%` }}
                >
                  {list.map((e) => (
                    <div key={e.slug} title={`${e.party.name} — ${score}/7`}>
                      <PartyLogo party={e.party} size={38} ring={false} />
                    </div>
                  ))}
                </div>
              );
            })}

            <div
              className="absolute top-0 -translate-x-1/2 transition-[left] duration-300"
              style={{ left: `${toPct(userScore!)}%` }}
            >
              <span className="pill block bg-ink px-2 py-0.5 text-[10px] font-medium text-white">
                Deg · {userScore}
              </span>
            </div>
          </>
        )}

        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-ink/45">
              Velg et svar — så ser du hvor partiene står.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between px-1 text-[10px] uppercase tracking-[0.18em] text-ink/40">
        <span>Helt uenig</span>
        <span>Tja</span>
        <span>Helt enig</span>
      </div>
    </section>
  );
}
