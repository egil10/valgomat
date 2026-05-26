"use client";

import { PartyLogo } from "@/components/PartyLogo";
import type { PartySlug, Question, Quiz } from "@/lib/types";

/**
 * Full-width political spectrum. Stretches across the dual-pane row in the
 * quiz so we have room to space party logos out without crashing them on
 * top of each other.
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

  // Stack parties that share a score in a vertical column.
  const byScore = new Map<number, typeof entries>();
  for (const e of entries) {
    const list = byScore.get(e.score) ?? [];
    list.push(e);
    byScore.set(e.score, list);
  }
  // Sort each column by abbr so ordering is deterministic across renders.
  for (const arr of byScore.values()) arr.sort((a, b) => a.party.abbr.localeCompare(b.party.abbr));

  const TICKS = [1, 2, 3, 4, 5, 6, 7];

  function toPct(score: number) {
    return 6 + ((score - 1) / 6) * 88;
  }

  return (
    <section
      className="glass rounded-3xl p-5 sm:p-7"
      aria-label="Partienes posisjon på spekteret"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Politisk spekter
        </p>
        <p className="text-[11px] tabular-nums text-ink/40">
          1 = Helt uenig · 7 = Helt enig
        </p>
      </div>

      <div className="relative mt-4 h-32 sm:h-36">
        {/* Vertical user line through the whole spectrum */}
        {userScore !== null && (
          <div
            className="absolute inset-y-0 w-px bg-ink/20 transition-[left] duration-300"
            style={{ left: `${toPct(userScore)}%` }}
            aria-hidden
          />
        )}

        {/* Axis */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
        {TICKS.map((t) => (
          <div
            key={t}
            className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-black/15"
            style={{ left: `${toPct(t)}%` }}
            aria-hidden
          />
        ))}

        {/* Party logos clustered by score */}
        {Array.from(byScore.entries()).map(([score, list]) => {
          const left = toPct(score);
          return (
            <div
              key={score}
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${left}%` }}
            >
              {list.map((e) => (
                <div key={e.slug} title={`${e.party.name} — ${score}/7`}>
                  <PartyLogo party={e.party} size={32} ring={false} />
                </div>
              ))}
            </div>
          );
        })}

        {/* User pill */}
        {userScore !== null && (
          <div
            className="absolute top-0 -translate-x-1/2 transition-[left] duration-300"
            style={{ left: `${toPct(userScore)}%` }}
          >
            <span className="pill block bg-ink px-2 py-0.5 text-[10px] font-medium text-white">
              Deg · {userScore}
            </span>
          </div>
        )}
      </div>

      {/* Tick labels */}
      <div className="relative h-4 text-[10px] tabular-nums text-ink/40">
        {TICKS.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2"
            style={{ left: `${toPct(t)}%` }}
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}
